import common from "./common.json";
import validation from "./validation.json";
import auth from "./auth.json";
import users from "./users.json";
import finances from "./finances.json";
import sidebar from "./sidebar.json";
import pos from "./pos.json";
import location from "./location.json";
import catalog from "./catalog.json";
import inventory from "./inventory.json";
import supplies from "./supplies.json";

export const t = {
  common,
  validation,
  auth,
  users,
  finances,
  sidebar,
  pos,
  location,
  catalog,
  inventory,
  supplies,
} as const;

export type Translations = typeof t;
