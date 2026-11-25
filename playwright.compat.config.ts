/**
 * Pruebas de compatibilidad: la misma suite E2E en varios motores de navegador
 * y en dispositivos móviles emulados.
 *
 *   npm run e2e:isolated -- --config playwright.compat.config.ts
 *
 * Escritorio (Chrome, Edge, Firefox, WebKit/Safari): suite completa.
 * Móvil emulado (Android/Chrome y iPhone/WebKit): flujo de login y venta en el POS.
 * El reporte queda en e2e-results/compat-report (no pisa el reporte principal).
 */
import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

const desktop = { viewport: { width: 1440, height: 900 } };
const mobileSpecs = /(auth|pos-sale)\.spec\.ts/;

export default defineConfig({
  ...base,
  outputDir: "./e2e-results/compat-artifacts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "./e2e-results/compat-report", open: "never" }],
    ["json", { outputFile: "./e2e-results/compat-results.json" }],
  ],
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "Chrome (Chromium)", use: { ...devices["Desktop Chrome"], ...desktop }, dependencies: ["setup"] },
    { name: "Edge", use: { ...devices["Desktop Edge"], channel: "msedge", ...desktop }, dependencies: ["setup"] },
    { name: "Firefox", use: { ...devices["Desktop Firefox"], ...desktop }, dependencies: ["setup"] },
    { name: "Safari (WebKit)", use: { ...devices["Desktop Safari"], ...desktop }, dependencies: ["setup"] },
    { name: "Android (Pixel 7)", use: { ...devices["Pixel 7"] }, testMatch: mobileSpecs, dependencies: ["setup"] },
    { name: "iOS (iPhone 14)", use: { ...devices["iPhone 14"] }, testMatch: mobileSpecs, dependencies: ["setup"] },
  ],
});
