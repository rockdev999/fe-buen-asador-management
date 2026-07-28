import { zodToFormik } from "@/lib/zodToFormik";
import {
  CreateModifierForm,
  modifierCreateSchema,
} from "../validators/modifier.schema";
import { mapModifierFormToDTO } from "../mappers/modifier.mapper";

export const ModifierFormConfig = {
  id: "modifier-form-config",
  initialValues: {
    name: "",
    extraPrice: 0,
    active: true,
    locationIds: [] as string[],
  } as CreateModifierForm,
  validationSchemaCreate: zodToFormik(modifierCreateSchema),
  mapFormToDTO: mapModifierFormToDTO,
};
