import { describe, expect, it } from "vitest";
import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import type { WhatsappOrder } from "../models/whatsapp-order.model";
import { getOrderActions, splitAddress } from "./order-actions";

const order = (status: OrderStatusEnum, type = OrderTypeEnum.TAKEAWAY) =>
  ({ status, type }) as WhatsappOrder;

const CASHIER = { canChangeStatus: true, canCharge: true };
const ADMIN = { canChangeStatus: true, canCharge: false };
const MANAGER = { canChangeStatus: false, canCharge: false };

describe("getOrderActions", () => {
  it("un pedido pendiente se aprueba y su cancelación es un rechazo", () => {
    const actions = getOrderActions(order(OrderStatusEnum.PENDING), CASHIER);

    expect(actions.next).toEqual({ status: OrderStatusEnum.CONFIRMED, label: "Aprobar" });
    expect(actions.canCancel).toBe(true);
    expect(actions.isReject).toBe(true);
    expect(actions.canCharge).toBe(false);
  });

  it("el cajero puede cobrar un pedido listo", () => {
    const actions = getOrderActions(order(OrderStatusEnum.READY), CASHIER);
    expect(actions.canCharge).toBe(true);
  });

  it("un delivery listo pasa a entregado", () => {
    const actions = getOrderActions(
      order(OrderStatusEnum.READY, OrderTypeEnum.DELIVERY),
      CASHIER,
    );
    expect(actions.next?.status).toBe(OrderStatusEnum.DELIVERED);
  });

  it("el administrador no cobra: se indica que solo cobra el cajero", () => {
    const actions = getOrderActions(order(OrderStatusEnum.READY), ADMIN);
    expect(actions.canCharge).toBe(false);
    expect(actions.chargeByCashierOnly).toBe(true);
  });

  it("el gerente solo consulta", () => {
    const actions = getOrderActions(order(OrderStatusEnum.PENDING), MANAGER);
    expect(actions.next).toBeUndefined();
    expect(actions.canCancel).toBe(false);
    expect(actions.canCharge).toBe(false);
  });

  it("un pedido pagado no admite acciones", () => {
    const actions = getOrderActions(order(OrderStatusEnum.PAID), CASHIER);
    expect(actions.next).toBeUndefined();
    expect(actions.canCancel).toBe(false);
    expect(actions.canCharge).toBe(false);
  });
});

describe("splitAddress", () => {
  it("separa el texto de los links", () => {
    expect(
      splitAddress("Av. Banzer 123  https://maps.app.goo.gl/abc casa azul"),
    ).toEqual({
      text: "Av. Banzer 123 casa azul",
      links: ["https://maps.app.goo.gl/abc"],
    });
  });
});
