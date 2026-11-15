import { useState } from "react";
import { useFormik } from "formik";
import { Lock } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { Button } from "@/components/shared/Basics/Button";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { KNOWN_ERROR_CODES } from "@/constants";
import { useCloseShift } from "@/features/pos/hooks/useShift";
import { ShiftCloseForm } from "@/features/pos/forms/shift.form";
import { mapShiftCloseFormToDTO } from "@/features/pos/mappers/shift.mapper";
import { Shift } from "@/features/pos/models/shift";

const NOTES_MAX = 500;
const DECLARED_MAX = 100_000_000;
const NOTES_REQUIRED_MESSAGE =
  "El monto no coincide con el esperado. Explica la diferencia.";

interface CloseShiftModalProps {
  onClose: () => void;
  onSuccess: (shift: Shift) => void;
}

/**
 * Cierre ciego: el cajero declara lo que contó sin ver el monto esperado.
 * Si no coincide, el backend responde SHIFT_NOTES_REQUIRED y la nota pasa a
 * ser obligatoria, sin revelar cuánto es la diferencia.
 */
export function CloseShiftModal({ onClose, onSuccess }: CloseShiftModalProps) {
  const { mutate: closeShift, status } = useCloseShift();
  const [notesRequired, setNotesRequired] = useState(false);

  const formik = useFormik<ShiftCloseForm>({
    initialValues: { declaredAmount: null, notes: "" },
    validate: (values) => {
      const errors: Partial<Record<keyof ShiftCloseForm, string>> = {};
      if (values.declaredAmount === null) {
        errors.declaredAmount = "Ingresa el monto que contaste en caja";
      } else if (values.declaredAmount < 0) {
        errors.declaredAmount = "El monto no puede ser negativo";
      }
      if (notesRequired && !values.notes.trim()) {
        errors.notes = NOTES_REQUIRED_MESSAGE;
      } else if (values.notes.length > NOTES_MAX) {
        errors.notes = `Máximo ${NOTES_MAX} caracteres`;
      }
      return errors;
    },
    onSubmit: (values) => {
      closeShift(mapShiftCloseFormToDTO(values), {
        onSuccess: (shift) => onSuccess(shift),
        onError: (error) => {
          // El interceptor rechaza con { message, fields, status, errorCode }.
          const { errorCode } = error as unknown as { errorCode?: string };
          if (errorCode === KNOWN_ERROR_CODES.SHIFT_NOTES_REQUIRED) {
            setNotesRequired(true);
            formik.setFieldTouched("notes", true, false);
            formik.setFieldError("notes", NOTES_REQUIRED_MESSAGE);
          }
        },
      });
    },
  });

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={Lock}
        title="Cerrar turno"
        description="Cuenta el efectivo de la caja e ingresa el total."
        onClose={onClose}
      />

      <form
        onSubmit={formik.handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          <FormField>
            <Label required>Efectivo contado</Label>
            <MoneyInput
              id="declaredAmount"
              name="declaredAmount"
              placeholder="0.00"
              max={DECLARED_MAX}
              autoFocus
              onChange={(value) =>
                formik.setFieldValue("declaredAmount", value)
              }
              onBlur={() => formik.setFieldTouched("declaredAmount", true)}
              className="h-9 rounded-xl bg-white text-[13px]"
            />
            <ErrorMessage
              touched={formik.touched.declaredAmount}
              error={formik.errors.declaredAmount}
            />
          </FormField>

          <FormTextarea
            id="notes"
            name="notes"
            label="Nota"
            required={notesRequired}
            placeholder={
              notesRequired
                ? "Explica por qué el monto no coincide"
                : "Opcional: cualquier observación del turno"
            }
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.notes}
            error={formik.errors.notes}
            maxLength={NOTES_MAX}
            showCounter
            rows={3}
          />

          <p className="text-[11px] text-muted-foreground">
            Al cerrar, el turno queda pendiente de aprobación del administrador
            y ya no podrás registrar ventas, egresos ni pagos en él.
          </p>
        </div>

        <PanelFooter align="right">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={status === "pending"}
            loadingText="Cerrando..."
          >
            Cerrar turno
          </Button>
        </PanelFooter>
      </form>
    </AppModal>
  );
}
