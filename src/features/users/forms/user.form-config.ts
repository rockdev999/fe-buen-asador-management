import { zodToFormik } from "@/lib/zodToFormik";
import { mapCreateUserFormToDTO } from "../mappers/user.mapper";
import {
  CreateUserForm,
  userCreateSchema,
  userUpdateSchema,
} from "../validators/user.schema";

export const UserFormConfig = {
  id: "user-form-config",
  initialValues: {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    repitPassword: "",
    description: "",
    position: [],
  } as CreateUserForm,
  validationSchemaCreate: zodToFormik(userCreateSchema),
  validationSchemaUpdate: zodToFormik(userUpdateSchema),
  mapFormToDTO: mapCreateUserFormToDTO,
};
