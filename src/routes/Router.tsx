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
import { NotFound } from "@/features/public/NotFound";
import { RoleBasedRedirect } from "./RoleBasedRedirect";
import { Orders } from "@/features/pos/page/order/Orders";
import { Sales } from "@/features/sales/page/Sales";
import { Users } from "@/features/users/pages/users/Users";
import { Locations } from "@/features/locations/pages/Locations";

export const router = createBrowserRouter([
  { path: PATHS.LOGIN, element: <Login /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <RoleBasedRedirect />,
          },

          // Dashboard — solo Manager y Admin
          {
            element: <RoleRoute roles={[RoleEnum.MANAGER, RoleEnum.ADMIN]} />,
            children: [
              { path: PATHS.DASHBOARD, element: <div>Dashboard</div> },
            ],
          },

          // Manager únicamente
          {
            element: <RoleRoute roles={[RoleEnum.MANAGER]} />,
            children: [
              { path: PATHS.USERS, element: <Users /> },
              { path: PATHS.LOCATIONS, element: <Locations /> },
            ],
          },

          // Manager + Admin
          {
            element: <RoleRoute roles={[RoleEnum.MANAGER, RoleEnum.ADMIN]} />,
            children: [
              { path: PATHS.PRODUCTS, element: <div>Productos</div> },
              { path: PATHS.INVENTORY, element: <div>Inventario</div> },
              { path: PATHS.INGREDIENTS, element: <div>Insumos</div> },
              { path: PATHS.REPORTS, element: <div>Reportes</div> },
            ],
          },

          // Manager + Admin + Cashier
          {
            element: (
              <RoleRoute
                roles={[RoleEnum.MANAGER, RoleEnum.ADMIN, RoleEnum.CASHIER]}
              />
            ),
            children: [
              { path: PATHS.ORDERS, element: <Orders /> },
              { path: PATHS.SALES, element: <Sales /> },
              { path: PATHS.SHIFTS, element: <div>Caja</div> },
              { path: PATHS.EXPENSES, element: <div>Egresos</div> },
              { path: PATHS.PAYROLL, element: <div>Nómina</div> },
            ],
          },

          // Cashier únicamente
          {
            element: <RoleRoute roles={[RoleEnum.CASHIER]} />,
            children: [{ path: PATHS.POS, element: <Pos /> }],
          },

          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to={PATHS.LOGIN} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
