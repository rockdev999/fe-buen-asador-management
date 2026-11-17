/**
 * Simula a la WhatsApp Cloud API de Meta: envía al webhook del backend los
 * mensajes que mandaría un cliente, firmados con HMAC-SHA256 como lo hace Meta
 * (cabecera X-Hub-Signature-256).
 *
 * El secreto y el phone_number_id se leen del .env del backend
 * (E2E_BACKEND_ENV, por defecto ../be-buen-asador-management/.env) o de las
 * variables E2E_WHATSAPP_APP_SECRET / E2E_WHATSAPP_PHONE_NUMBER_ID (CI).
 */
import { createHmac, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { expect, type APIRequestContext } from "@playwright/test";
import { API_URL } from "./api";

function loadWhatsappConfig() {
  const envPath = path.resolve(
    import.meta.dirname,
    "../..",
    process.env.E2E_BACKEND_ENV ?? "../be-buen-asador-management/.env",
  );
  const backendEnv = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
  return {
    appSecret: process.env.E2E_WHATSAPP_APP_SECRET ?? backendEnv.WHATSAPP_APP_SECRET ?? "",
    phoneNumberId:
      process.env.E2E_WHATSAPP_PHONE_NUMBER_ID ?? backendEnv.WHATSAPP_PHONE_NUMBER_ID ?? "",
  };
}

const config = loadWhatsappConfig();

/** Número de WhatsApp único por prueba: cada uno tiene su propia sesión en el bot. */
export const randomWaPhone = () =>
  `5917${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;

type Reply = { reply: string } | { text: string };

export class WhatsappCustomer {
  constructor(
    private readonly request: APIRequestContext,
    readonly phone: string,
    readonly profileName: string,
  ) {}

  /** Cuerpo del webhook tal como lo envía Meta. */
  private payload(input: Reply) {
    const message: Record<string, unknown> = {
      from: this.phone,
      id: `wamid.e2e.${randomUUID()}`,
      timestamp: String(Math.floor(Date.now() / 1000)),
    };
    if ("reply" in input) {
      message.type = "interactive";
      message.interactive = {
        type: "button_reply",
        button_reply: { id: input.reply, title: input.reply },
      };
    } else {
      message.type = "text";
      message.text = { body: input.text };
    }

    return {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "e2e",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "", phone_number_id: config.phoneNumberId },
                contacts: [{ wa_id: this.phone, profile: { name: this.profileName } }],
                messages: [message],
              },
            },
          ],
        },
      ],
    };
  }

  /** Envía un mensaje firmado. `signature` permite probar firmas inválidas. */
  async send(input: Reply, signature?: string) {
    const body = JSON.stringify(this.payload(input));
    const sign = signature ?? `sha256=${createHmac("sha256", config.appSecret).update(body).digest("hex")}`;
    return this.request.post(`${API_URL}/whatsapp/webhook`, {
      headers: { "Content-Type": "application/json", "X-Hub-Signature-256": sign },
      data: body,
    });
  }

  async reply(id: string) {
    const res = await this.send({ reply: id });
    expect(res.status(), `webhook rechazó "${id}"`).toBe(200);
  }

  async say(text: string) {
    const res = await this.send({ text });
    expect(res.status(), `webhook rechazó el texto "${text}"`).toBe(200);
  }

  /**
   * Conversación completa con el bot hasta confirmar el pedido.
   * El bot procesa los mensajes de un mismo número en orden (cola por teléfono).
   */
  async placeOrder(order: {
    locationId: string;
    categoryId: string;
    productId: string;
    quantity?: number;
    customerName: string;
    delivery?: { address: string; reference?: string };
    payment?: "CASH" | "QR";
  }) {
    await this.reply("act:start");
    // Si hay una sola sucursal abierta el bot omite este paso y lo ignora.
    await this.reply(`loc:${order.locationId}`);
    await this.reply(`cat:${order.categoryId}`);
    await this.reply(`prod:${order.productId}`);
    await this.reply(`qty:${order.quantity ?? 1}`);
    await this.reply("act:checkout");
    await this.reply(order.delivery ? "type:DELIVERY" : "type:TAKEAWAY");
    await this.say(order.customerName);
    if (order.delivery) {
      await this.say(order.delivery.address);
      if (order.delivery.reference) await this.say(order.delivery.reference);
      else await this.reply("ref:skip");
    }
    await this.reply(`pay:${order.payment ?? "CASH"}`);
    await this.reply("confirm:yes");
  }
}

export const hasWhatsappConfig = () => !!config.appSecret && !!config.phoneNumberId;
