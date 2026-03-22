import common from "./common.json";
import validation from "./validation.json";
import auth from "./auth.json";
import users from "./users.json";
import finances from "./finances.json";
import sidebar from "./sidebar.json";

export const t = {
  common,
  validation,
  auth,
  users,
  finances,
  sidebar,
} as const;

export type Translations = typeof t;
