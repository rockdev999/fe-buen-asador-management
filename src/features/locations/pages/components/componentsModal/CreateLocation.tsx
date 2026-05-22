import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { LocationFormConfig } from "@/features/locations/forms/location.form-config";
import {
  useCreateLocation,
  useUpdateLocation,
} from "@/features/locations/hooks/useLocation";
import { LocationDetail } from "@/features/locations/models/location.model";
import { CreateLocationForm } from "@/features/locations/validators/location.schema";
import { useFormik } from "formik";
import { Building2, MapPin } from "lucide-react";
import { useMemo } from "react";

interface CreateLocationProps {
  isEdit: boolean;
  location?: LocationDetail | null;
  onSuccess: () => void;
}

export const CreateLocation = ({
  isEdit,
  location,
  onSuccess,
}: CreateLocationProps) => {
  const { mutate: createLocation, status: createStatus } = useCreateLocation();
  const { mutate: updateLocation, status: updateStatus } = useUpdateLocation(
    location?.id ?? "",
  );

  const initValues: CreateLocationForm = useMemo(() => {
    if (isEdit && location) {
      return {
        name: location.name,
        address: location.address ?? "",
      };
    }
    return LocationFormConfig.initialValues;
  }, [isEdit, location]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateLocationForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: isEdit
      ? LocationFormConfig.validationSchemaUpdate
      : LocationFormConfig.validationSchemaCreate,
    onSubmit: (data: CreateLocationForm) => {
      const dto = LocationFormConfig.mapFormToDTO(data);
      if (isEdit) {
        updateLocation(dto, { onSuccess: onSuccess });
      } else {
        createLocation(dto, { onSuccess: onSuccess });
      }
    },
  });

  const isSaving = createStatus === "pending" || updateStatus === "pending";

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-surface bg-surface/20 p-4">
        <div className="mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            Información de la sucursal
          </p>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Estos datos identificarán la sucursal dentro del sistema.
          </p>
        </div>

        <div className="space-y-3">
          <FormField>
            <Label required>Nombre de la sucursal</Label>

            <div className="relative">
              <Building2
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
              />

              <input
                value={formValues.name}
                //   onChange={(event) =>
                //     setFormValues((prev) => ({
                //       ...prev,
                //       name: event.target.value,
                //     }))
                //   }
                placeholder="Ej: Sucursal Zona Sur"
                className="h-9 w-full rounded-xl border border-surface bg-white py-2 pl-9 pr-3 text-[13px] text-inkblack placeholder:text-muted-foreground/30 transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </FormField>

          <FormField>
            <Label required>Dirección</Label>

            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
              />

              <input
                value={formValues.address}
                //   onChange={(event) =>
                //     setLocationForm((prev) => ({
                //       ...prev,
                //       address: event.target.value,
                //     }))
                //   }
                placeholder="Ej: Zona Sur, La Paz"
                className="h-9 w-full rounded-xl border border-surface bg-white py-2 pl-9 pr-3 text-[13px] text-inkblack placeholder:text-muted-foreground/30 transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </FormField>
        </div>
      </div>
    </section>
  );
};
