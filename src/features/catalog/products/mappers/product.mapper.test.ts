import { describe, expect, it } from "vitest";
import { mapProductFormToDTO } from "./product.mapper";

const form = {
  name: "Churrasco",
  price: 40,
  available: false,
  isQuantifiable: false,
  haveModifiers: true,
  categoryId: "cat-1",
  sortOrder: 0,
  locationIds: ["loc-1", "loc-2"],
  locationPrices: [
    { locationId: "loc-1", price: 45 },
    { locationId: "loc-2", price: 40 },
  ],
} as unknown as Parameters<typeof mapProductFormToDTO>[0];

describe("mapProductFormToDTO", () => {
  it("envía el check 'Disponible para venta' como isAvailable (el nombre que espera el backend)", () => {
    const dto = mapProductFormToDTO(form);
    expect(dto.isAvailable).toBe(false);
    expect(dto).not.toHaveProperty("available");
  });

  it("envía un precio por sucursal elegida; el igual al general va como null", () => {
    expect(mapProductFormToDTO(form).locationPrices).toEqual([
      { locationId: "loc-1", price: 45 },
      { locationId: "loc-2", price: null },
    ]);
  });
});
