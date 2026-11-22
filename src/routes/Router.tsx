import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PATHS } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { PasswordChangeGuard } from "./PasswordChangeGuard";
import { ChangePassword } from "@/features/auth/pages/ChangePassword";
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
import { Products } from "@/features/catalog/products/pages/Products";
import { Categories } from "@/features/catalog/categories/pages/Categories";
import { Modifiers } from "@/features/catalog/modifiers/pages/Modifiers";
import { Inventory } from "@/features/inventory/pages/inventory/Inventory";
import { Supplies } from "@/features/supplies/pages/supplies/Supplies";
import { Expenses } from "@/features/finances/expenses/pages/Expenses";
import { Payroll } from "@/features/finances/payroll/pages/Payroll";
import { Reports } from "@/features/finances/reports/pages/Reports";
import { Dashboard } from "@/features/dashboard/pages/Dashboard";
import { Shifts } from "@/features/shifts/pages/Shifts";
import { WhatsappOrders } from "@/features/whatsapp/pages/WhatsappOrders";

// eslint-disable-next-line react-refresh/only-export-components -- usado por session.service
export const router = createBrowserRouter([
  { path: PATHS.LOGIN, element: <Login /> },

  {
    element: <ProtectedRoute />,
    children: [
      // Cambio obligatorio de contraseña: fuera de AppLayout, porque mientras
      // esté pendiente el backend responde 403 a todo lo demás.
      { path: PATHS.CHANGE_PASSWORD, element: <ChangePassword /> },

      {
        element: <PasswordChangeGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <RoleBasedRedirect />,
              },

              // Dashboard y Reportes — solo Manager y Admin. En Reportes el
              // admin ve solo Gastos y Nómina de su sucursal.
              {
                element: <RoleRoute roles={[RoleEnum.MANAGER, RoleEnum.ADMIN]} />,
                children: [
                  { path: PATHS.DASHBOARD, element: <Dashboard /> },
                  { path: PATHS.REPORTS, element: <Reports /> },
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
                  { path: PATHS.PRODUCTS, element: <Products /> },
                  { path: PATHS.CATEGORIES, element: <Categories /> },
                  { path: PATHS.MODIFIERS, element: <Modifiers /> },
                  { path: PATHS.INVENTORY, element: <Inventory /> },
                  { path: PATHS.INGREDIENTS, element: <Supplies /> },
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
                  { path: PATHS.WHATSAPP_ORDERS, element: <WhatsappOrders /> },
                  { path: PATHS.SALES, element: <Sales /> },
                  { path: PATHS.EXPENSES, element: <Expenses /> },
                  { path: PATHS.PAYROLL, element: <Payroll /> },
                  // Caja (cajero) / historial y aprobación de cierres (admin, gerente)
                  { path: PATHS.SHIFTS, element: <Shifts /> },
                ],
              },

              // Cashier únicamente
              {
                element: <RoleRoute roles={[RoleEnum.CASHIER]} />,
                children: [
                  { path: PATHS.POS, element: <Pos /> },
                ],
              },

              { path: "*", element: <NotFound /> },
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
