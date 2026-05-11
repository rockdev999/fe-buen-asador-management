import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import { SaleDTO } from "../dto/sale.dto";
import { Sale, SaleProductGroup } from "../models/sale";
import { mapOrderSaleItemDTOToModel } from "./order.mapper";
import { OrderSaleItem } from "../models/order";

function groupDetails(details: OrderSaleItem[]): SaleProductGroup[] {
  const map = new Map<string, SaleProductGroup>();

  for (const detail of details) {
    const pid = detail.product.id;

    if (!map.has(pid)) {
      map.set(pid, {
        productId: pid,
        name: detail.product.name,
        unitCount: 0,
        total: 0,
        units: [],
      });
    }

    const group = map.get(pid)!;
    group.unitCount += detail.quantity;
    group.total += detail.itemSubtotal;
    group.units.push({
      modifierLabel:
        detail.modifiers.length > 0
          ? detail.modifiers.map((m) => m.modifier.name).join(", ")
          : "Sin modificadores",
      subtotal: detail.itemSubtotal,
      notes: detail.notes,
    });
  }

  return Array.from(map.values());
}

export const mapSaleDTOtoModel = (dto: SaleDTO): Sale => {
  const details = dto.details.map((detail) =>
    mapOrderSaleItemDTOToModel(detail, detail.itemSubtotal),
  );
  return {
    id: dto.id,
    ticketCode: dto.ticketCode,
    customerName: dto.customerName ?? null,
    orderType: dto.orderType,
    status: dto.status,
    location: mapLocationDTOToModel(dto.location),
    cashier: {
      id: dto.cashier.id,
      name: dto.cashier.name,
    },
    subtotal: dto.subtotal,
    totalDiscount: dto.totalDiscount,
    total: dto.total,
    receivedAmount: dto.receivedAmount,
    change: dto.change,
    paymentMethod: dto.paymentMethod,
    details: dto.details.map((detail) =>
      mapOrderSaleItemDTOToModel(detail, detail.itemSubtotal),
    ),
    groups: groupDetails(details),
    annulmentReason: dto.annulmentReason,
    audit: dto.audit,
  };
};
