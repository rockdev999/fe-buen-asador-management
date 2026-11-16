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
import { useCloseShift } from "@/features/pos/hooks/useShift";
import { ShiftCloseForm } from "@/features/pos/forms/shift.form";
import { mapShiftCloseFormToDTO } from "@/features/pos/mappers/shift.mapper";
import { Shift, ShiftReceipt } from "@/features/pos/models/shift";

const NOTES_MAX = 500;
const AMOUNT_MAX = 100_000_000;

type AmountField = "declaredCash" | "declaredQr" | "declaredBankTransfer";

const AMOUNT_FIELDS: {
  name: AmountField;
  label: string;
  hint: string;
  missing: string;
}[] = [
  {
    name: "declaredCash",
    label: "Efectivo contado en caja",
    hint: "Lo que contaste en el cajón",
    missing: "Ingresa el efectivo que contaste",
  },
  {
    name: "declaredQr",
    label: "Total QR (app)",
    hint: "El total que muestra la app del QR",
    missing: "Ingresa el total del QR (0 si no hubo)",
  },
  {
    name: "declaredBankTransfer",
    label: "Total tarjeta (tarjetero)",
    hint: "El total del cierre del tarjetero",
    missing: "Ingresa el total de tarjeta (0 si no hubo)",
  },
];

interface CloseShiftModalProps {
  onClose: () => void;
  onSuccess: (result: { shift: Shift; receipt: ShiftReceipt }) => void;
}

/**
 * Cierre ciego por método de pago: el cajero declara efectivo, QR y tarjeta
 * sin ver lo esperado. El primer envío es definitivo: el cierre siempre pasa
 * (queda PENDING), así que no se pueden probar montos hasta acertar. Recién
 * después de cerrar se muestra el cuadre y su comprobante. La justificación
 * la exige el admin al aprobar; aquí la nota es opcional.
 */
export function CloseShiftModal({ onClose, onSuccess }: CloseShiftModalProps) {
  const { mutate: closeShift, status } = useCloseShift();

  const formik = useFormik<ShiftCloseForm>({
    initialValues: {
      declaredCash: null,
      declaredQr: null,
      declaredBankTransfer: null,
      notes: "",
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ShiftCloseForm, string>> = {};
      AMOUNT_FIELDS.forEach(({ name, missing }) => {
        const value = values[name];
        if (value === null) errors[name] = missing;
        else if (value < 0) errors[name] = "El monto no puede ser negativo";
      });
      if (values.notes.length > NOTES_MAX) {
        errors.notes = `Máximo ${NOTES_MAX} caracteres`;
      }
      return errors;
    },
    onSubmit: (values) => {
      closeShift(mapShiftCloseFormToDTO(values), {
        onSuccess: (result) => onSuccess(result),
      });
    },
  });

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[88vh]">
      <PanelHeader
        icon={Lock}
        title="Cerrar turno"
        description="Declara lo cobrado por cada método de pago."
        onClose={onClose}
      />

      <form
        onSubmit={formik.handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {AMOUNT_FIELDS.map(({ name, label, hint }, index) => (
            <FormField key={name}>
              <Label required>{label}</Label>
              <MoneyInput
                id={name}
                name={name}
                placeholder="0.00"
                max={AMOUNT_MAX}
                autoFocus={index === 0}
                onChange={(value) => formik.setFieldValue(name, value)}
                onBlur={() => formik.setFieldTouched(name, true)}
                className="h-9 rounded-xl bg-white text-[13px]"
              />
              <p className="text-[10px] text-muted-foreground">{hint}</p>
              <ErrorMessage
                touched={formik.touched[name]}
                error={formik.errors[name]}
              />
            </FormField>
          ))}

          <FormTextarea
            id="notes"
            name="notes"
            label="Notas"
            placeholder="Opcional: si sabes de alguna diferencia, explícala para el administrador"
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
            Si no hubo ventas por un método, ingresa 0. Revisa los montos antes
            de confirmar: el cierre es definitivo, queda pendiente de aprobación
            del administrador y ya no podrás registrar ventas, egresos ni pagos
            en este turno.
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
