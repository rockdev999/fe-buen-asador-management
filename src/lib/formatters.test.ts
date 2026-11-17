/**
 * Pruebas de caja blanca de lib/formatters.
 *
 * La zona horaria se fija en America/La_Paz (UTC−4, sin horario de verano)
 * desde vite.config.ts → test.env.TZ, y el idioma en es-BO.
 *
 * toLocalDate — D1: es Date · D2: formato "YYYY-MM-DD" · resto: new Date(string)
 * toUtcDateRangeParams — D3: hay dateFrom · D4: hay dateTo
 * formatLocalRelative / formatRelative — 6 caminos:
 *   < 1 min · < 60 min · < 24 h · 1 día · < 7 días · ≥ 7 días
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatDateTimeShort,
  formatLocalDate,
  formatLocalDateInput,
  formatLocalDateTime,
  formatLocalDateTimeShort,
  formatLocalRelative,
  formatLocalTime,
  formatRelative,
  formatTime,
  getLocalDayUtcRange,
  getLocalTimezone,
  getTodayLocalDateInput,
  toUtcDateRangeParams,
} from "./formatters";

// 17/11/2026 12:00 hora de Bolivia
const NOW = new Date("2026-11-17T16:00:00.000Z");

beforeEach(() => {
  vi.stubGlobal("navigator", { language: "es-BO" });
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("la zona horaria de las pruebas es America/La_Paz", () => {
  expect(getLocalTimezone()).toBe("America/La_Paz");
});

describe("toLocalDate (a través de formatLocalDateInput)", () => {
  it("D1 · recibe un Date y lo usa tal cual", () => {
    expect(formatLocalDateInput(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("D2 · 'YYYY-MM-DD' se interpreta como día local, no como UTC", () => {
    // new Date("2026-05-10") sería 09/05 20:00 en Bolivia; aquí debe seguir siendo el 10.
    expect(formatLocalDateTime("2026-05-10")).toBe("10/05/2026 00:00");
  });

  it("resto · un ISO con hora se convierte a la hora local", () => {
    expect(formatLocalDateTime("2026-04-18T13:58:00.000Z")).toBe("18/04/2026 09:58");
  });
});

describe("formateadores con Intl", () => {
  const iso = "2026-04-18T13:58:00.000Z"; // 18/04/2026 09:58 local

  it("formatLocalDate / formatDate → dd/mm/aaaa", () => {
    expect(formatLocalDate(iso)).toBe("18/04/2026");
    expect(formatDate(iso)).toBe("18/04/2026");
  });

  it("formatLocalTime / formatTime → HH:mm en 24 h", () => {
    expect(formatLocalTime(iso)).toBe("09:58");
    expect(formatTime("2026-04-18T22:05:00.000Z")).toBe("18:05");
  });

  it("formatLocalDateTimeShort / formatDateTimeShort contienen día, mes y hora", () => {
    // Hallazgo: con es-BO, Intl devuelve "18/4, 09:58" (mes sin cero a la
    // izquierda y con coma), no "18/04 09:58" como dice el JSDoc.
    for (const fn of [formatLocalDateTimeShort, formatDateTimeShort]) {
      const out = fn(iso);
      expect(out).toMatch(/18\/0?4/);
      expect(out).toMatch(/09:58/);
      expect(out).not.toMatch(/2026/);
    }
  });

  it("formatDateTime incluye fecha completa y hora", () => {
    const out = formatDateTime(iso);
    expect(out).toMatch(/18\/04\/2026/);
    expect(out).toMatch(/09:58/);
  });
});

describe("getTodayLocalDateInput", () => {
  it("usa la fecha local actual", () => {
    expect(getTodayLocalDateInput()).toBe("2026-11-17");
  });

  it("a las 22:00 en Bolivia sigue siendo el mismo día aunque en UTC ya sea el siguiente", () => {
    vi.setSystemTime(new Date("2026-11-18T02:00:00.000Z"));
    expect(getTodayLocalDateInput()).toBe("2026-11-17");
  });
});

describe("getLocalDayUtcRange", () => {
  it("convierte un día local en su rango UTC equivalente", () => {
    expect(getLocalDayUtcRange("2026-05-10")).toEqual({
      startUtc: "2026-05-10T04:00:00.000Z",
      endUtc: "2026-05-11T03:59:59.999Z",
    });
  });

  it("con un Date a media tarde devuelve el día completo", () => {
    expect(getLocalDayUtcRange(new Date(2026, 4, 10, 15, 30))).toEqual({
      startUtc: "2026-05-10T04:00:00.000Z",
      endUtc: "2026-05-11T03:59:59.999Z",
    });
  });
});

describe("toUtcDateRangeParams", () => {
  it("D3 V, D4 V · ambos extremos", () => {
    expect(toUtcDateRangeParams("2026-10-11", "2026-10-12")).toEqual({
      dateFrom: "2026-10-11T04:00:00.000Z",
      dateTo: "2026-10-13T03:59:59.999Z",
    });
  });

  it("D3 V, D4 F · solo desde", () => {
    expect(toUtcDateRangeParams("2026-10-11")).toEqual({
      dateFrom: "2026-10-11T04:00:00.000Z",
    });
  });

  it("D3 F, D4 V · solo hasta", () => {
    expect(toUtcDateRangeParams(undefined, "2026-10-11")).toEqual({
      dateTo: "2026-10-12T03:59:59.999Z",
    });
  });

  it("D3 F, D4 F · sin fechas devuelve un objeto vacío", () => {
    expect(toUtcDateRangeParams("", "")).toEqual({});
  });
});

describe.each([
  ["formatLocalRelative", formatLocalRelative],
  ["formatRelative", formatRelative],
])("%s", (_, fn) => {
  const ago = (ms: number) => new Date(NOW.getTime() - ms);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  it.each([
    ["30 s → Ahora", 30_000, "Ahora"],
    ["5 min → Hace 5m", 5 * MIN, "Hace 5m"],
    ["59 min → Hace 59m (límite)", 59 * MIN, "Hace 59m"],
    ["60 min → Hace 1h (límite)", 60 * MIN, "Hace 1h"],
    ["23 h → Hace 23h", 23 * HOUR, "Hace 23h"],
    ["1 día → Ayer", DAY, "Ayer"],
    ["3 días → Hace 3 días", 3 * DAY, "Hace 3 días"],
    ["6 días → Hace 6 días (límite)", 6 * DAY, "Hace 6 días"],
    ["7 días → fecha corta (límite)", 7 * DAY, "10/11/2026"],
  ])("%s", (_label, ms, expected) => {
    expect(fn(ago(ms))).toBe(expected);
  });
});
