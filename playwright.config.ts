/**
 * Pruebas E2E (caja negra) con Playwright contra el backend real.
 *
 * Requisitos: backend levantado (VITE_API_URL del .env) y credenciales de
 * prueba en .env.e2e (ver .env.e2e.example).
 *
 *   npm run e2e          → corre todo (levanta Vite si no está corriendo)
 *   npm run e2e:ui       → modo interactivo
 *   npm run e2e:report   → abre el último reporte HTML
 */
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env.e2e"), quiet: true });
// VITE_API_URL: la misma API que usa la app (para preparar datos por API).
dotenv.config({ path: path.resolve(import.meta.dirname, ".env"), quiet: true });

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e-results/artifacts",
  // Comparten la base de datos real (turno abierto, pedidos): en serie.
  fullyParallel: false,
  workers: 1,
  // Un reintento: si pasa al segundo intento, el reporte lo marca como "flaky".
  retries: 1,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "./e2e-results/report", open: "never" }],
    ["json", { outputFile: "./e2e-results/results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    locale: "es-BO",
    timezoneId: "America/La_Paz",
    viewport: { width: 1440, height: 900 },
    // Evidencia para el documento: traza y video de cada prueba.
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
