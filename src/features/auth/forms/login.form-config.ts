import { zodToFormik } from "@/lib/zodToFormik";
import { mapLoginFormToDTO } from "../mappers/login.mapper";
import { loginSchema } from "../validators/login.schema";
import { LoginForm } from "./login.form";

export const loginFormConfig = {
  id: "login-form-config",
  initialValues: {
    email: "",
    password: "",
  } as LoginForm,
  validationSchema: zodToFormik(loginSchema),
  mapFormToDTO: mapLoginFormToDTO,
};
