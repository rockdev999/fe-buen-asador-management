import { zodToFormik } from "@/lib/zodToFormik";
import { mapCreateLocationFormToDTO } from "../mappers/location.mapper";
import { LocationForm } from "./location.form";
import {
  locationCreateSchema,
  locationUpdateSchema,
} from "../validators/location.schema";

export const LocationFormConfig = {
  id: "location-form-config",
  initialValues: {
    name: "",
    address: "",
  } as LocationForm,
  validationSchemaCreate: zodToFormik(locationCreateSchema),
  validationSchemaUpdate: zodToFormik(locationUpdateSchema),
  mapFormToDTO: mapCreateLocationFormToDTO,
};
