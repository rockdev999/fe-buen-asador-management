// src/components/shared/Interactives/UserRoleAssigner.tsx
import { cn } from "@/lib/utils";
import { X, Plus, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface UserRoleAssignerOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
}

interface UserRoleAssignerProps {
  users: UserRoleAssignerOption[];
  roles: UserRoleAssignerOption[];
  value: UserRoleAssignment[];
  onChange: (assignments: UserRoleAssignment[]) => void;
  excludeUserIds?: string[];
  isLoadingUsers?: boolean;
  isLoadingRoles?: boolean;
  error?: string;
  touched?: boolean;
}

// ─── Mini dropdown interno ────────────────────────────────────────────────────
function MiniDropdown({
  options,
  value,
  onChange,
  placeholder,
  isLoading,
}: {
  options: UserRoleAssignerOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = search.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full h-8 px-2.5 flex items-center gap-1.5 text-[12px] rounded-lg border transition-all",
          value
            ? "border-brand/40 bg-brand/5 text-brand font-medium"
            : "border-surface bg-white text-muted-foreground/50 hover:border-inkblack/20",
        )}
      >
        <span className="flex-1 text-left truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={11}
          className={cn(
            "flex-shrink-0 opacity-40 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-surface rounded-xl shadow-lg overflow-hidden py-1">
          {/* Search */}
          <div className="px-1.5 pb-1">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-6 px-2 text-[11px] rounded-md border border-surface bg-surface/40 text-inkblack placeholder:text-muted-foreground/40 focus:outline-none focus:border-brand/40"
            />
          </div>

          <div className="max-h-40 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-3 text-[11px] text-muted-foreground/50">
                Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-3 text-[11px] text-muted-foreground/50">
                Sin resultados
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-[12px] transition-colors",
                    value === opt.id
                      ? "text-brand font-medium bg-brand/5"
                      : "text-inkblack/60 hover:bg-surface/60 hover:text-inkblack",
                  )}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-muted-foreground/50">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {value === opt.id && (
                    <Check size={10} className="flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function UserRoleAssigner({
  users,
  roles,
  value,
  onChange,
  excludeUserIds = [],
  isLoadingUsers,
  isLoadingRoles,
  error,
  touched,
}: UserRoleAssignerProps) {
  const usedUserIds = new Set(value.map((v) => v.userId));

  const availableUsers = users.filter(
    (u) => !usedUserIds.has(u.id) && !excludeUserIds.includes(u.id),
  );

  function addRow() {
    onChange([...value, { userId: "", roleId: "" }]);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateRow(
    index: number,
    field: keyof UserRoleAssignment,
    id: string,
  ) {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: id } : item,
    );
    onChange(updated);
  }

  // Usuarios disponibles para cada fila — excluye los ya seleccionados en otras filas
  function getAvailableUsersForRow(index: number) {
    const otherSelectedIds = new Set(
      value
        .filter((_, i) => i !== index && value[i].userId)
        .map((v) => v.userId),
    );
    return users.filter(
      (u) => !otherSelectedIds.has(u.id) && !excludeUserIds.includes(u.id),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Filas de asignación */}
      {value.length === 0 ? (
        <div className="flex items-center justify-center py-4 border border-dashed border-surface rounded-xl">
          <p className="text-[12px] text-muted-foreground/50">
            Agrega usuarios para asignar
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Usuario
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Rol
            </span>
            <span className="w-6" />
          </div>

          {value.map((assignment, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center p-2 bg-surface/40 rounded-xl border border-surface/80"
            >
              {/* Usuario dropdown */}
              <MiniDropdown
                options={getAvailableUsersForRow(index)}
                value={assignment.userId}
                onChange={(id) => updateRow(index, "userId", id)}
                placeholder="Seleccionar..."
                isLoading={isLoadingUsers}
              />

              {/* Rol dropdown */}
              <MiniDropdown
                options={roles}
                value={assignment.roleId}
                onChange={(id) => updateRow(index, "roleId", id)}
                placeholder="Rol..."
                isLoading={isLoadingRoles}
              />

              {/* Eliminar fila */}
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Agregar fila */}
      {availableUsers.length > 0 && (
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-brand/30 text-brand text-[12px] font-medium hover:bg-brand/5 transition-colors w-full justify-center"
        >
          <Plus size={12} />
          Agregar usuario
        </button>
      )}

      {touched && error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
