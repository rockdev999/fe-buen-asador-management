import { describe, expect, it } from "vitest";
import {
  buildSalesSeries,
  comparisonLabel,
  formatReportDate,
  isPeriodPreset,
  periodLabel,
  monthRange,
  monthsBetween,
  presetRange,
  previousRange,
  validateRange,
  ymd,
} from "./report-period";

const now = new Date(2026, 2, 15, 21, 30); // dom 15/03/2026 21:30 (local)

describe("ymd", () => {
  it("usa la fecha local aunque en UTC ya sea el día siguiente", () => {
    expect(ymd(new Date(2026, 2, 15, 23, 59))).toBe("2026-03-15");
  });
});

describe("presetRange", () => {
  it.each([
    ["today", "2026-03-15", "2026-03-15"],
    ["yesterday", "2026-03-14", "2026-03-14"],
    ["week", "2026-03-09", "2026-03-15"], // domingo → lunes 9
    ["month", "2026-03-01", "2026-03-15"],
    ["lastMonth", "2026-02-01", "2026-02-28"],
    ["quarter", "2026-01-01", "2026-03-15"],
    ["year", "2026-01-01", "2026-03-15"],
  ] as const)("%s", (preset, dateFrom, dateTo) => {
    expect(presetRange(preset, now)).toEqual({ dateFrom, dateTo });
  });

  it("mes anterior en enero cae en diciembre del año anterior", () => {
    expect(presetRange("lastMonth", new Date(2026, 0, 10))).toEqual({
      dateFrom: "2025-12-01",
      dateTo: "2025-12-31",
    });
  });

  it("ayer el 1 de marzo es el último día de febrero", () => {
    expect(presetRange("yesterday", new Date(2028, 2, 1))).toEqual({
      dateFrom: "2028-02-29",
      dateTo: "2028-02-29",
    });
  });
});

describe("monthRange", () => {
  it("va del día 1 del primer mes al último día del segundo", () => {
    expect(monthRange("2026-03", "2026-05")).toEqual({
      dateFrom: "2026-03-01",
      dateTo: "2026-05-31",
    });
  });

  it("cuenta meses incluyendo ambos extremos", () => {
    expect(monthsBetween("2025-12", "2026-11")).toBe(12);
  });
});

describe("validateRange", () => {
  it("acepta un año bisiesto completo (366 días)", () => {
    expect(validateRange("2028-01-01", "2028-12-31")).toBeNull();
  });

  it("rechaza más de 366 días", () => {
    expect(validateRange("2026-01-01", "2027-01-02")).toMatch(/366/);
  });

  it("rechaza fechas invertidas o vacías", () => {
    expect(validateRange("2026-03-02", "2026-03-01")).toMatch(/posterior/);
    expect(validateRange("", "2026-03-01")).not.toBeNull();
  });
});

describe("buildSalesSeries", () => {
  const days = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      date: ymd(new Date(2026, 0, 1 + i)),
      total: 10,
      salesCount: 1,
    }));

  it("hasta 62 días muestra un punto por día", () => {
    const s = buildSalesSeries(days(62));
    expect(s.grouped).toBe(false);
    expect(s.points).toHaveLength(62);
  });

  it("con más de 62 días agrupa por mes", () => {
    const s = buildSalesSeries(days(63)); // 1 ene → 4 mar
    expect(s.grouped).toBe(true);
    expect(s.points.map((p) => [p.key, p.total])).toEqual([
      ["2026-01", 310],
      ["2026-02", 280],
      ["2026-03", 40],
    ]);
  });
});

describe("previousRange", () => {
  it.each([
    ["month", "2026-11-01", "2026-11-22", "2026-10-01", "2026-10-22"],
    ["month", "2026-03-01", "2026-03-31", "2026-02-01", "2026-02-28"],
    ["lastMonth", "2026-02-01", "2026-02-28", "2026-01-01", "2026-01-31"],
    ["months", "2026-03-01", "2026-05-31", "2025-12-01", "2026-02-28"],
    ["quarter", "2026-10-01", "2026-11-22", "2026-07-01", "2026-08-22"],
    ["year", "2026-01-01", "2026-11-22", "2025-01-01", "2025-11-22"],
    ["today", "2026-11-22", "2026-11-22", "2026-11-21", "2026-11-21"],
    ["week", "2026-11-16", "2026-11-22", "2026-11-09", "2026-11-15"],
    ["custom", "2026-11-10", "2026-11-14", "2026-11-05", "2026-11-09"],
  ] as const)("%s %s–%s", (mode, f, t, pf, pt) => {
    expect(previousRange(mode, { dateFrom: f, dateTo: t })).toEqual({
      dateFrom: pf,
      dateTo: pt,
    });
  });

  it("el 31 sin equivalente usa el último día del mes", () => {
    expect(
      previousRange("month", { dateFrom: "2026-03-01", dateTo: "2026-03-30" }),
    ).toEqual({ dateFrom: "2026-02-01", dateTo: "2026-02-28" });
  });
});

describe("etiquetas de periodo", () => {
  it.each([
    ["today", "vs día anterior"],
    ["yesterday", "vs día anterior"],
    ["week", "vs semana anterior"],
    ["month", "vs mes anterior"],
    ["lastMonth", "vs mes anterior"],
    ["quarter", "vs trimestre anterior"],
    ["year", "vs año anterior"],
    ["months", "vs periodo anterior"],
    ["custom", "vs periodo anterior"],
  ] as const)("comparisonLabel(%s)", (mode, label) => {
    expect(comparisonLabel(mode)).toBe(label);
  });

  it("periodLabel devuelve el nombre visible", () => {
    expect(periodLabel("lastMonth")).toBe("Mes anterior");
    expect(periodLabel("custom")).toBe("Personalizado");
  });

  it("isPeriodPreset solo acepta presets (no months/custom ni basura)", () => {
    expect(isPeriodPreset("month")).toBe(true);
    expect(isPeriodPreset("custom")).toBe(false);
    expect(isPeriodPreset("months")).toBe(false);
    expect(isPeriodPreset("x")).toBe(false);
    expect(isPeriodPreset(null)).toBe(false);
  });

  it("validateRange rechaza formatos inválidos", () => {
    expect(validateRange("2026-3-1", "2026-03-05")).toBe("Fecha inválida");
  });
});

describe("formatReportDate", () => {
  it("convierte YYYY-MM-DD a DD/MM/YYYY sin desfase de zona", () => {
    expect(formatReportDate("2026-11-01")).toBe("01/11/2026");
  });
});
