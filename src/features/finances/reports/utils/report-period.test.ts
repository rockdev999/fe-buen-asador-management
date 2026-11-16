import { describe, expect, it } from "vitest";
import { formatReportDate, getReportPeriodRange } from "./report-period";

const today = new Date(2026, 2, 15); // 15/03/2026

describe("getReportPeriodRange", () => {
  it("últimos 7 días incluye hoy", () => {
    expect(getReportPeriodRange("last7Days", today)).toEqual({
      dateFrom: "2026-03-09",
      dateTo: "2026-03-15",
    });
  });

  it("este mes va del día 1 a hoy", () => {
    expect(getReportPeriodRange("thisMonth", today)).toEqual({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-15",
    });
  });

  it("mes pasado va del primer al último día del mes anterior", () => {
    expect(getReportPeriodRange("lastMonth", today)).toEqual({
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
    });
  });

  it("mes pasado en enero cae en diciembre del año anterior", () => {
    expect(getReportPeriodRange("lastMonth", new Date(2026, 0, 10))).toEqual({
      dateFrom: "2025-12-01",
      dateTo: "2025-12-31",
    });
  });
});

describe("formatReportDate", () => {
  it("convierte YYYY-MM-DD a DD/MM/YYYY sin desfase de zona", () => {
    expect(formatReportDate("2026-11-01")).toBe("01/11/2026");
  });
});
