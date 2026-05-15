import { zodToFormik } from "@/lib/zodToFormik";
import { mapCreateUserFormToDTO } from "../mappers/user.mapper";
import { CreateUserForm, userCreateSchema } from "../validators/user.schema";

export const UserFormConfig = {
  id: "user-form-config",
  initialValues: {
    name: "",
    email: "",
    password: "",
    repitPassword: "",
  } as CreateUserForm,
  validationSchema: zodToFormik(userCreateSchema),
  mapFormToDTO: mapCreateUserFormToDTO,
};
