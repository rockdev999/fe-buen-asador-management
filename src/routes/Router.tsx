import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PATHS } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { RoleEnum } from "@/constants";
import { AppLayout } from "@/components/layout/AppLayout";
import { Login } from "@/features/auth/pages/Login";
import { Pos } from "@/features/pos/page/Pos";

export const router = createBrowserRouter([
  // Públicas
  { path: PATHS.LOGIN, element: <Login /> },

  // Privadas
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={PATHS.DASHBOARD} replace /> },
          { path: PATHS.DASHBOARD, element: <div>Dashboard</div> },

          // Manager únicamente
          {
            element: <RoleRoute roles={[RoleEnum.MANAGER]} />,
            children: [
              { path: PATHS.USERS, element: <div>Usuarios</div> },
              { path: PATHS.LOCATIONS, element: <div>Sucursales</div> },
              { path: PATHS.FINANCES, element: <div>Finanzas</div> },
            ],
          },

          // Manager + Admin
          {
            element: <RoleRoute roles={[RoleEnum.MANAGER, RoleEnum.ADMIN]} />,
            children: [
              { path: PATHS.PRODUCTS, element: <div>Productos</div> },
              { path: PATHS.INVENTORY, element: <div>Inventario</div> },
              { path: PATHS.CASHIER, element: <div>Caja</div> },
            ],
          },

          // Cashier
          {
            element: <RoleRoute roles={[RoleEnum.CASHIER]} />,
            children: [
              { path: PATHS.POS, element: <Pos /> },
              { path: PATHS.INVOICES, element: <div>Facturas</div> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to={PATHS.LOGIN} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
