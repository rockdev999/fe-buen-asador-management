import { appConfig } from "@/config/app.config";

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMoneyDisplay(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseMoney(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function formatMoneyInput(value: string): string {
  const clean = value.replace(/[^0-9.]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  if (parts[1]?.length > 2) return parts[0] + "." + parts[1].slice(0, 2);
  return clean;
}

export function calculateTotal(
  items: { price: number; quantity: number; modifiersTotal?: number }[],
): number {
  return (
    Math.round(
      items.reduce((sum, item) => {
        const modifiers = item.modifiersTotal ?? 0;
        return sum + (item.price + modifiers) * item.quantity;
      }, 0) * 100,
    ) / 100
  );
}
