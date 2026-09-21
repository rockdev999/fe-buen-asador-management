import { useState } from "react";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { PayrollWagesView } from "./PayrollWagesView";

export function ManagerPayrollWagesTab() {
  const { data: locations, status: locationsStatus } = useGetLocationSimple();
  const [locationId, setLocationId] = useState("");

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0">
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
        />
      </div>

      <PayrollWagesView locationId={locationId} />
    </div>
  );
}
