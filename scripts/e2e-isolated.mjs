/**
 * Pruebas E2E de la interfaz contra un backend AISLADO y repetible.
 *
 *   npm run e2e:isolated            (acepta los mismos argumentos que playwright test)
 *
 * 1. Levanta el entorno de pruebas del backend (npm run e2e:serve en
 *    ../be-buen-asador-management, o E2E_BACKEND_DIR): base nueva, API en el
 *    puerto 3998, SMTP de prueba y usuarios por rol.
 * 2. Prepara por la API los datos que exigen estas pruebas: producto con
 *    stock, producto sin stock y el turno abierto del cajero.
 * 3. Ejecuta Playwright con Vite en el puerto 5174 apuntando a esa API.
 * 4. Detiene el backend y borra su base, aunque las pruebas fallen.
 *
 * No necesita .env.e2e ni credenciales reales: todo se crea en cada corrida.
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const FE_DIR = path.resolve(import.meta.dirname, "..");
const BE_DIR = path.resolve(FE_DIR, process.env.E2E_BACKEND_DIR ?? "../be-buen-asador-management");
const FE_PORT = Number(process.env.E2E_FE_PORT ?? 5174);
const IS_WIN = process.platform === "win32";

const PRODUCT = { name: "E2E Para Tres", price: 275 };
const NO_STOCK_PRODUCT = { name: "E2E Sin Stock", price: 10 };

const log = (msg) => console.log(`\n[e2e-isolated] ${msg}`);

function startBackend() {
  log(`Compilando el backend (${BE_DIR})…`);
  const build = spawnSync(IS_WIN ? "npm.cmd" : "npm", ["run", "build"], {
    cwd: BE_DIR,
    stdio: "inherit",
    shell: IS_WIN,
  });
  if (build.status !== 0) throw new Error("No se pudo compilar el backend");

  log("Levantando el entorno aislado del backend…");
  const child = spawn(
    process.execPath,
    [
      path.join(BE_DIR, "node_modules", "ts-node", "dist", "bin.js"),
      "-r",
      "tsconfig-paths/register",
      "test/e2e/serve.ts",
    ],
    {
      cwd: BE_DIR,
      stdio: ["pipe", "pipe", "inherit"],
      env: {
        ...process.env,
        // La interfaz hace todas las peticiones desde 127.0.0.1
        THROTTLE_SHORT_LIMIT: "1000",
        THROTTLE_MEDIUM_LIMIT: "100000",
        CORS_ORIGINS: `http://localhost:${FE_PORT}`,
      },
    },
  );

  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("El backend no estuvo listo en 4 minutos")), 240_000);
    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      console.log(`  [backend] ${line}`);
      const match = /^E2E_READY (.+)$/.exec(line.trim());
      if (match) {
        clearTimeout(timer);
        resolve(JSON.parse(readFileSync(match[1], "utf8")));
      }
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`El backend terminó antes de estar listo (código ${code})`));
    });
  });

  const stop = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      const timer = setTimeout(() => {
        child.kill();
        resolve();
      }, 30_000);
      child.on("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      child.stdin.end(); // serve.ts limpia (detiene la API y borra la base) al cerrarse su entrada
    });

  return { ready, stop };
}

async function api(apiUrl, method, urlPath, body, token, form) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let payload;
  if (form) {
    payload = new FormData();
    payload.append("dto", JSON.stringify(body));
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(apiUrl + urlPath, { method, headers, body: payload });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${method} ${urlPath} → ${res.status} ${JSON.stringify(json)}`);
  return json && "data" in json ? json.data : json;
}

async function loginByApi(apiUrl, user) {
  const step1 = await api(apiUrl, "POST", "/auth/login", {
    identifier: user.username,
    password: user.password,
  });
  const step2 = await api(apiUrl, "POST", "/auth/select-location", { locationId: user.locationId }, step1.temporaryToken);
  return step2.accessToken;
}

/** Datos que exigen las pruebas de la interfaz (ver e2e/README.md). */
async function prepareUiData(fx) {
  log("Preparando los datos de la interfaz (producto, producto sin stock, turno)…");
  const { apiUrl } = fx;
  const mgr = await loginByApi(apiUrl, fx.users.manager);
  const category = await api(apiUrl, "POST", "/categories", { name: "E2E Parrilla", locationIds: [fx.locations.centro] }, mgr);
  for (const [product, isQuantifiable] of [
    [PRODUCT, false],
    [NO_STOCK_PRODUCT, true], // cuantificable con stock 0
  ]) {
    await api(
      apiUrl,
      "POST",
      "/products",
      {
        name: product.name,
        price: product.price,
        categoryId: category.id,
        locationIds: [fx.locations.centro],
        isQuantifiable,
        haveModifiers: false,
      },
      mgr,
      true,
    );
  }
  const cashier = await loginByApi(apiUrl, fx.users.cashierCentro);
  await api(apiUrl, "POST", "/shifts/open", { initialAmount: 100 }, cashier);
}

function runPlaywright(fx) {
  const centro = fx.locationNames.centro;
  const env = {
    ...process.env,
    E2E_ISOLATED: "true",
    E2E_BASE_URL: `http://localhost:${FE_PORT}`,
    VITE_API_URL: fx.apiUrl,
    // El gerente y el cajero entran con correo; el administrador con usuario
    E2E_MANAGER_USER: fx.users.manager.email,
    E2E_MANAGER_PASS: fx.users.manager.password,
    E2E_ADMIN_USER: fx.users.adminCentro.username,
    E2E_ADMIN_PASS: fx.users.adminCentro.password,
    E2E_ADMIN_LOCATION: centro,
    E2E_CASHIER_USER: fx.users.cashierCentro.email,
    E2E_CASHIER_PASS: fx.users.cashierCentro.password,
    E2E_CASHIER_LOCATION: centro,
    E2E_OTHER_LOCATION: fx.locationNames.norte,
    E2E_PRODUCT: PRODUCT.name,
    E2E_PRODUCT_PRICE: String(PRODUCT.price),
    E2E_PRODUCT_NO_STOCK: NO_STOCK_PRODUCT.name,
    E2E_PRODUCT_CATEGORY: "E2E Parrilla",
    E2E_WHATSAPP_APP_SECRET: fx.whatsapp.appSecret,
    E2E_WHATSAPP_PHONE_NUMBER_ID: fx.whatsapp.phoneNumberId,
  };
  log(`Ejecutando Playwright contra ${fx.apiUrl} (interfaz en el puerto ${FE_PORT})…`);
  const result = spawnSync(IS_WIN ? "npx.cmd" : "npx", ["playwright", "test", ...process.argv.slice(2)], {
    cwd: FE_DIR,
    stdio: "inherit",
    env,
    shell: IS_WIN,
  });
  return result.status ?? 1;
}

const backend = startBackend();
let exitCode = 1;
try {
  const fixtures = await backend.ready;
  await prepareUiData(fixtures);
  exitCode = runPlaywright(fixtures);
} catch (error) {
  console.error(`\n[e2e-isolated] ${error.message}`);
} finally {
  log("Deteniendo el backend aislado…");
  await backend.stop();
}
process.exit(exitCode);
