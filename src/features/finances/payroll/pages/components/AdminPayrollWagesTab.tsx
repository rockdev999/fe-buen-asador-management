import { useAuth } from "@/features/auth/hooks/useAuth";
import { PayrollWagesView } from "./PayrollWagesView";

export function AdminPayrollWagesTab() {
  const { user } = useAuth();
  const locationId = user?.locationId ?? "";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2.5 border-b border-surface bg-white flex-shrink-0">
        <p className="text-[12px] text-muted-foreground">
          Sueldo diario de los trabajadores de tu sucursal
        </p>
      </div>

      <PayrollWagesView locationId={locationId} />
    </div>
  );
}
