import { Button } from "@/components/shared/Basics/Button";
import { FolderTree, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Modifier } from "../models/modifier.model";
import { useModifiersHandler } from "../hooks/useModifiers";
import { ModifierModal } from "./components/ModifierModal";
import { ModifierCard } from "./components/ModifierCard";

export function Modifiers() {
  const [search, setSearch] = useState("");
  const [selectedModifier, setSelectedModifier] = useState<Modifier | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: modifiers, refetch } = useModifiersHandler();

  const modifierList = modifiers ?? [];

  const filteredModifiers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return modifierList
      .filter((modifier) =>
        modifier.name.toLowerCase().includes(normalizedSearch),
      )
      .sort((a, b) => Number(a.extraPrice) - Number(b.extraPrice));
  }, [modifierList, search]);

  const hasSearch = search.trim().length > 0;

  const handleCreate = () => {
    setSelectedModifier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (modifier: Modifier) => {
    setSelectedModifier(modifier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedModifier(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-0">
          <h1 className="text-base font-semibold text-inkblack">
            Modificadores
          </h1>
          <span className="text-[11px] text-muted-foreground">
            {filteredModifiers.length} modificador
            {filteredModifiers.length === 1 ? "" : "es"}
          </span>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="h-9 rounded-xl px-4 text-[12px] font-medium"
        >
          <Plus size={14} />
          Nuevo modificador
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar modificador..."
            className="h-9 w-full rounded-xl border border-surface bg-surface/30 py-2 pl-9 pr-9 text-[13px] text-inkblack outline-none transition-all placeholder:text-muted-foreground/40 focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/20"
          />

          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground/40 transition-colors hover:text-muted-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredModifiers.length === 0 ? (
        <EmptyModifiersState hasSearch={hasSearch} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredModifiers.map((modifier) => (
            <ModifierCard
              key={modifier.id}
              modifier={modifier}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ModifierModal
          modifier={selectedModifier}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

interface EmptyModifiersStateProps {
  hasSearch: boolean;
}

function EmptyModifiersState({ hasSearch }: EmptyModifiersStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-surface bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
        <FolderTree size={20} />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-inkblack">
        {hasSearch ? "No se encontraron modificador" : "No hay modificador"}
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted-foreground">
        {hasSearch
          ? "Intenta buscar con otro nombre o limpia el filtro."
          : "Crea tu primera categoría para empezar a organizar los productos del catálogo."}
      </p>
    </div>
  );
}
