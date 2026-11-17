/**
 * Pruebas de caja blanca del store de la bandeja de WhatsApp.
 *
 * upsert       — D1: estado final  · D2: ya existía (valor de retorno)
 * applyStatus  — D3: no existe     · D4: estado final · D5: mismo estado
 *                D6: nuevo estado PENDING (conserva expiresAt)
 * applyOrderDTO— D7: no existe     · D8: estado final
 * remove       — D9: no existe (devuelve el mismo estado)
 */
import { beforeEach, describe, expect, it } from "vitest";
import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import type { OrderDTO } from "@/features/pos/dto/order.dto";
import { WhatsappPaymentPreferenceEnum } from "../dto/whatsapp-order.dto";
import type { WhatsappOrder } from "../models/whatsapp-order.model";
import {
  isFinalStatus,
  sortByOldest,
  useWhatsappOrdersStore,
} from "./whatsapp-orders.store";

const store = () => useWhatsappOrdersStore.getState();

const wa = (id: string, overrides: Partial<WhatsappOrder> = {}): WhatsappOrder => ({
  id,
  shortId: id.toUpperCase(),
  status: OrderStatusEnum.PENDING,
  type: OrderTypeEnum.DELIVERY,
  locationId: "loc1",
  locationName: "Centro",
  customerName: "Ana",
  customerPhone: null,
  waPhone: "59171234567",
  deliveryAddress: null,
  deliveryReference: null,
  paymentPreference: WhatsappPaymentPreferenceEnum.CASH,
  expiresAt: "2026-11-17T10:15:00.000Z",
  lines: [],
  subtotal: 25,
  total: 25,
  createdAt: "2026-11-17T10:00:00.000Z",
  ...overrides,
});

const orderDTO = (id: string, status: OrderStatusEnum): OrderDTO => ({
  id,
  type: OrderTypeEnum.DELIVERY,
  channel: OrderEnum.ONLINE,
  status,
  location: { id: "loc1", name: "Centro" },
  customerName: "Ana actualizada",
  items: [],
  subtotal: 30,
  total: 30,
  audit: { createdAt: "2026-11-17T10:00:00.000Z", createdBy: null, updatedBy: null },
});

describe("isFinalStatus", () => {
  it.each([
    [OrderStatusEnum.PAID, true],
    [OrderStatusEnum.CANCELLED, true],
    [OrderStatusEnum.PENDING, false],
    [OrderStatusEnum.READY, false],
  ])("%s → %s", (status, expected) => {
    expect(isFinalStatus(status)).toBe(expected);
  });
});

describe("useWhatsappOrdersStore", () => {
  beforeEach(() => store().reset());

  describe("replaceAll", () => {
    it("indexa por id, descarta pagados/cancelados y marca la carga como lista", () => {
      store().replaceAll([
        wa("a"),
        wa("b", { status: OrderStatusEnum.PAID }),
        wa("c", { status: OrderStatusEnum.CANCELLED }),
        wa("d", { status: OrderStatusEnum.CONFIRMED }),
      ]);

      expect(Object.keys(store().orders).sort()).toEqual(["a", "d"]);
      expect(store().loadStatus).toBe("ready");
    });
  });

  describe("upsert", () => {
    it("pedido nuevo → lo agrega y devuelve true (D1 F, D2 nuevo)", () => {
      expect(store().upsert(wa("a"))).toBe(true);
      expect(store().orders.a).toBeDefined();
    });

    it("pedido existente → lo reemplaza y devuelve false (D2 existente)", () => {
      store().upsert(wa("a"));
      expect(store().upsert(wa("a", { customerName: "Luis" }))).toBe(false);
      expect(store().orders.a.customerName).toBe("Luis");
    });

    it("pedido en estado final → lo quita y devuelve false (D1 V)", () => {
      store().upsert(wa("a"));
      expect(store().upsert(wa("a", { status: OrderStatusEnum.PAID }))).toBe(false);
      expect(store().orders.a).toBeUndefined();
    });
  });

  describe("applyStatus", () => {
    beforeEach(() => store().replaceAll([wa("a")]));

    it("pedido desconocido → devuelve false sin tocar la bandeja (D3)", () => {
      const before = store().orders;
      expect(store().applyStatus("zzz", OrderStatusEnum.CONFIRMED)).toBe(false);
      expect(store().orders).toBe(before);
    });

    it("estado final → lo quita de la bandeja (D4)", () => {
      expect(store().applyStatus("a", OrderStatusEnum.CANCELLED)).toBe(true);
      expect(store().orders.a).toBeUndefined();
    });

    it("mismo estado → no genera un estado nuevo (D5)", () => {
      const before = store().orders;
      expect(store().applyStatus("a", OrderStatusEnum.PENDING)).toBe(true);
      expect(store().orders).toBe(before);
    });

    it("pasa de PENDING a CONFIRMED → borra el vencimiento (D6 F)", () => {
      store().applyStatus("a", OrderStatusEnum.CONFIRMED);
      expect(store().orders.a.status).toBe(OrderStatusEnum.CONFIRMED);
      expect(store().orders.a.expiresAt).toBeNull();
    });

    it("vuelve a PENDING → conserva el vencimiento que tenía (D6 V)", () => {
      store().replaceAll([wa("b", { status: OrderStatusEnum.CONFIRMED })]);
      store().applyStatus("b", OrderStatusEnum.PENDING);
      expect(store().orders.b.status).toBe(OrderStatusEnum.PENDING);
      expect(store().orders.b.expiresAt).toBe("2026-11-17T10:15:00.000Z");
    });
  });

  describe("applyOrderDTO", () => {
    beforeEach(() => store().replaceAll([wa("a")]));

    it("pedido desconocido → no hace nada (D7)", () => {
      store().applyOrderDTO(orderDTO("zzz", OrderStatusEnum.CONFIRMED));
      expect(Object.keys(store().orders)).toEqual(["a"]);
    });

    it("estado final → lo quita (D8 V)", () => {
      store().applyOrderDTO(orderDTO("a", OrderStatusEnum.PAID));
      expect(store().orders.a).toBeUndefined();
    });

    it("estado activo → fusiona los datos nuevos y conserva los de WhatsApp (D8 F)", () => {
      store().applyOrderDTO(orderDTO("a", OrderStatusEnum.PREPARING));

      expect(store().orders.a).toMatchObject({
        status: OrderStatusEnum.PREPARING,
        customerName: "Ana actualizada",
        total: 30,
        waPhone: "59171234567",
        paymentPreference: WhatsappPaymentPreferenceEnum.CASH,
      });
    });
  });

  describe("remove / reset / setLoadStatus", () => {
    it("remove de un id inexistente no cambia el estado (D9)", () => {
      store().replaceAll([wa("a")]);
      const before = store().orders;
      store().remove("zzz");
      expect(store().orders).toBe(before);
    });

    it("reset vacía la bandeja y vuelve a idle", () => {
      store().replaceAll([wa("a")]);
      store().setLoadStatus("error");
      expect(store().loadStatus).toBe("error");

      store().reset();
      expect(store().orders).toEqual({});
      expect(store().loadStatus).toBe("idle");
    });
  });
});

describe("sortByOldest", () => {
  it("ordena del más antiguo al más nuevo y deja primero los que no tienen fecha", () => {
    const sorted = sortByOldest({
      b: wa("b", { createdAt: "2026-11-17T12:00:00.000Z" }),
      a: wa("a", { createdAt: "2026-11-17T09:00:00.000Z" }),
      c: wa("c", { createdAt: null }),
    });

    expect(sorted.map((o) => o.id)).toEqual(["c", "a", "b"]);
  });
});
