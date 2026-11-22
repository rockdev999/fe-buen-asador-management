# Cambios del frontend desde `fc8740b`

**Rango:** `fc8740b` (17/11/2026, *feat(e2e): add end-to-end testing setup with Playwright*) → `eba9ddb` (22/11/2026, rama `develop`).
**Volumen:** 89 archivos, +5 977 / −1 275 líneas (unas 1 700 son del `package-lock.json`).

Este resumen está ordenado según las secciones de `DOCUMENTACION_SISTEMA.md` para ubicar rápido qué hay que actualizar en el documento del proyecto. Al final está la lista de commits.

---

## Resumen ejecutivo

1. **Reportes rediseñados (§9.15):** pestañas por rol (Ventas, Gastos, Nómina, Insumos), selector de periodo con presets, comparación con el periodo anterior, filtros guardados en la URL y **exportación a PDF** (por reporte o un reporte general). El **Administrador ahora entra a Reportes** (solo Gastos y Nómina de su sucursal).
2. **Precio por sucursal (§9.5):** productos y modificadores pueden tener un precio propio en cada sucursal; si no lo tienen, usan el precio general. Los modificadores pueden ser gratis (precio 0).
3. **Permisos del catálogo alineados con el backend:** solo el Gerente crea, edita y da de baja; el Administrador solo consulta y cambia la disponibilidad en su sucursal.
4. **Catálogo en tiempo real (§7):** nuevo evento SSE `catalog-updated`; el POS y las pantallas del catálogo se actualizan solos. El stream ahora lo abren **todos los roles**, también el Cajero.
5. **Menú lateral adaptable a móvil (§8.1)** y tooltip de ayuda reutilizable.
6. **Pruebas (§12):** nuevas pruebas E2E de catálogo (CP-CAT-01..09) y de pedidos de WhatsApp (CP-WA-01..05), modo E2E aislado y repetible, y CI con cobertura y E2E manual.
7. **Despliegue (§2.5):** configuración para Vercel y metadatos de la PWA.

---

## §2.5 Despliegue y §1.2 Scripts

- **`vercel.json` (nuevo):** instala con `npm ci`, compila con `npm run build`, publica `dist/`. Toda ruta sin extensión se redirige a `index.html` (SPA). `sw.js` se sirve con `Cache-Control: no-cache, no-store, must-revalidate` y `Service-Worker-Allowed: /`, para que el service worker nuevo llegue en cuanto se publica.
- **`package-lock.json` regenerado** con las dependencias opcionales de Linux/macOS (rolldown, lightningcss, fsevents). El lockfile generado en Windows las omitía y `npm ci` fallaba en Vercel y GitHub Actions. También se ajustó `yarn.lock`.
- **`index.html`:** `lang="es"`, título "Buen Asador", `meta description`, `theme-color` `#FF4D00` y `apple-touch-icon`. Se actualizó `favicon.svg`.
- **Service worker:** `CACHE_VERSION` pasó de `v1` a `v2`, así los equipos descartan el shell anterior.
- **Nuevo script:** `npm run e2e:isolated` (ver §12).

## §3 Enrutamiento y navegación

- **§3.1 Árbol de rutas:** `/reports` pasó del grupo "solo Gerente" al grupo **Gerente + Administrador** (junto a `/dashboard`).
- **§3.3 Menú lateral:** el ítem "Reportes" ahora es visible para `MANAGER` y `ADMIN`.
- **§3.4 Topbar:** en móvil muestra el botón "Abrir menú" (hamburguesa). El menú de usuario se cierra al tocar fuera o con Escape. Usa `pointerdown` en captura, porque los Select/Popover de Radix cancelaban `mousedown` y quedaban dos menús abiertos a la vez.

## §4.1 Roles del sistema / §10 Matriz de acceso / §11 Casos de uso

Ya actualizado en `DOCUMENTACION_SISTEMA.md` (commit `57c8da9`) para el catálogo:

- **ADMIN:** consulta el catálogo y cambia la disponibilidad de productos y categorías en su sucursal; **no** crea, edita ni da de baja.
- Matriz: "Catálogo" se dividió en *crear, editar y dar de baja* (solo Gerente) y *consultar y cambiar disponibilidad* (Gerente y Administrador de su sucursal).
- CU-10, CU-12 y CU-13 quedan solo para el Gerente. En el diagrama de casos de uso se separaron "Gestionar catálogo" (CU-10, 12, 13) y "Disponibilidad de productos" (CU-11, 14).

**Falta actualizar en el documento (por Reportes):**

- §4.1: la frase "Es el único con acceso a Reportes" del Gerente ya no es cierta. Ahora el Administrador ve los reportes de **Gastos** y **Nómina** de su sucursal.
- §10: fila "Reportes" → Gerente ✅, Administrador ✅ (solo Gastos y Nómina, su sucursal), Cajero —.
- §11: el caso de uso de reportes suma al Administrador como actor (con alcance limitado), además del nuevo caso "Exportar reporte a PDF".

## §6 Comunicación con el backend

- **Descargas binarias en el interceptor de errores** (`error.interceptor.tsx`): cuando una petición con `responseType: "blob"` falla, el backend responde un JSON que llega como `Blob`. El interceptor ahora lo decodifica, así el refresh de token y el toast con el mensaje del backend funcionan igual que en el resto de las peticiones.
- **Nuevos códigos de error:** `DUPLICATE_VALUE` e `INVALID_VALUE` (este último se usa, por ejemplo, cuando el descuento supera el subtotal).
- **Stock insuficiente al ajustar** (`utils/insufficient-stock.ts`, nuevo): si un ajuste de stock (de productos o insumos) resta más de lo que hay, el backend responde `400 INSUFFICIENT_STOCK`. El toast se reemplaza por uno que sugiere usar **"Fijar cantidad"** cuando el conteo físico no coincide. Se usa en `useAdjustStock` (inventario) y `useIngredientStock` (insumos).

## §7 Tiempo real (SSE)

- **§7.2 Streams:** `/notifications/stream` ahora lo abren **todos los roles con sesión** (antes solo Gerente y Administrador).
  - Evento `alert` (solo Gerente y Administrador): igual que antes, muestra un toast e invalida las queries de stock y alertas.
  - **Evento nuevo `catalog-updated`** (todos los roles), con payload `{"entity":"product"|"category"|"modifier","locationIds":[...]}`. Invalida el menú del POS y los listados de productos, categorías y modificadores, así los precios, las bajas y los modificadores se ven al instante. El backend ya filtra por sucursal.
  - Al **reconectar** se invalidan también las queries del catálogo, porque los cambios ocurridos sin conexión no se reenvían.
- **§9.17:** cambiar el encabezado "Gerente y Administrador", porque ahora el hook escucha para todos los roles (las alertas de stock siguen siendo solo para Gerente y Administrador).

## §8 Sistema de diseño y componentes compartidos

- **§8.1 Layout responsive:**
  - `Sidebar`: en pantallas chicas (< 768 px, `md` de Tailwind) es un **panel superpuesto** que entra desde la izquierda, con fondo oscuro. Se cierra al tocar el fondo, al navegar o con Escape. En móvil siempre va expandido. En escritorio sigue siendo la columna fija y colapsable de antes.
  - `ui.store`: nuevo estado `mobileNavOpen` (no se persiste).
- **§8.2 Componentes nuevos:**
  - `LocationPriceList` (`shared/Interactives`): lista de sucursales con un interruptor de "precio propio" y un campo de monto por sucursal. Muestra la etiqueta *general*, *gratis* o la diferencia con el precio general. Se reutiliza en productos y modificadores.
  - `ConfirmDeactivateModal` (`shared/Overlay`): confirmación de **baja lógica**. El registro deja de ofrecerse, pero las ventas anteriores lo siguen referenciando. Admite un aviso extra según la entidad (p. ej. los productos de una categoría).
  - `InfoTooltip` (`components/ui`): icono (i) con texto de ayuda. Se abre al pasar el cursor, con el foco del teclado o al tocarlo en pantallas táctiles, y solo hay uno abierto a la vez en toda la app. Usa el Popover de Radix (sin dependencias nuevas).
  - `AsyncDropdown`: soporta una opción para limpiar (`clearLabel`), que se usa en "Todas las sucursales".
- **§8.3 Validación de formularios:** `zodToFormik` ahora maneja errores anidados (listas de objetos como `locationPrices.0.price`). Nuevo helper `getFieldError` para mostrar el error junto al campo exacto.
- `tailwind.config.js`: color de fondo para los popovers.

## §9.5 Catálogo

### Precio por sucursal (productos y modificadores)

- **Modelo de datos:**
  - Producto: `price` (precio en la sucursal consultada), `basePrice` (precio general, el que se edita) y, por sucursal, `price` (propio o `null`) y `effectivePrice` (lo que se cobra).
  - Modificador: igual, con `extraPrice`, `baseExtraPrice` y, por sucursal, `extraPrice` y `effectiveExtraPrice`.
  - Al crear o editar se envía `locationPrices: [{ locationId, price | extraPrice }]`. Si se envía, **reemplaza** todos los precios por sucursal (una sucursal no listada o con `null` vuelve al general). Si se omite, no cambian.
- **Validación:** el precio por sucursal de un producto debe ser > 0 y ≤ 999 999. El precio extra de un modificador, general o por sucursal, puede ser **0 (gratis)**, hasta 999 999. Hay nuevos mensajes en `locales/es/catalog.json`.
- **Interfaz:**
  - Formularios de producto y modificador con `LocationPriceList`.
  - Tabla de productos (`ProductColumns`): muestra el precio general y, para las sucursales con precio propio, "Sucursal: Bs X".
  - Tarjeta de modificador: el Administrador ve el precio de su sucursal; el Gerente ve el general y el detalle de las sucursales con precio propio.
- **Corrección:** el check "Disponible para venta" enviaba `available`, pero el backend espera `isAvailable`, así que no tenía efecto. Se corrigió en `mapProductFormToDTO` (lo detectó el caso CP-CAT-09).

### Permisos en la interfaz

- Los botones "Nuevo producto", "Nueva categoría" y "Nuevo modificador" y la edición por clic en la tarjeta o fila **solo aparecen para el Gerente**.
- Las bajas de categorías, productos y modificadores usan `ConfirmDeactivateModal`.
- Los hooks del catálogo invalidan de inmediato las queries relacionadas (incluido el menú del POS) al crear, editar o dar de baja.

## §9.8 POS

- **Descuento mayor al subtotal:** `PaymentModal` bloquea el botón de confirmar y muestra "El descuento no puede ser mayor al subtotal". El backend también lo valida con `INVALID_VALUE`.
- **Menú más fresco:** el menú del POS tiene `staleTime` de 2 minutos y se vuelve a pedir al regresar a la pestaña. Además se refresca con `catalog-updated`. Sin conexión se usa la copia offline.
- **Corrección en `ProductGrid`:** guardaba una copia de la categoría abierta y, al refrescarse el menú, esa pestaña seguía mostrando productos y precios viejos. Ahora guarda solo el **id** de la categoría y lee los productos del menú actual (lo detectó CP-CAT-07).
- `useOrder`: maneja el error 400 "El modificador X no se ofrece en esta sucursal".

## §9.15 Reportes — rediseño completo

**Cambiar el encabezado** a "Gerente y Administrador".

### Acceso por rol (`config/report-tabs.ts`)

| Reporte | Gerente | Administrador |
|---|---|---|
| Ventas | ✅ | — |
| Gastos | ✅ | ✅ (su sucursal) |
| Nómina | ✅ | ✅ (su sucursal) |
| Insumos | ✅ | — |
| Reporte general (PDF) | ✅ | — |

Solo se muestran las pestañas que el rol puede ver, y el backend responde 403 al resto. El Administrador siempre ve su sucursal (el backend ignora `locationId`). El Gerente puede filtrar por una sucursal o ver "Todas las sucursales".

### Periodo (`utils/report-period.ts`, `ReportPeriodPicker`)

- **Presets:** Hoy, Ayer, Esta semana, Este mes (por defecto), Mes anterior, Este trimestre y Este año. Hay accesos rápidos para Hoy, Semana, Mes y Mes anterior.
- **Rango de meses** (máximo 12) y **Personalizado** (máximo 366 días), con validación. Si el rango no es válido, no se consulta el backend y se muestra "Elige un periodo válido".
- **Comparación con el periodo anterior:** cada tarjeta de resumen muestra la variación (`Delta`) contra el periodo equivalente anterior. Esa consulta es silenciosa: si falla, solo no aparece la comparación.

### Filtros en la URL (`useReportFilters`)

`?tab=&period=&dateFrom=&dateTo=&locationId=`: el enlace se puede compartir y los filtros no se pierden al recargar. Con un preset solo se guarda `period`, así "Este mes" se recalcula cada día. Con un rango de meses o uno personalizado se guardan las fechas exactas.

### Contenido de cada pestaña

- **Ventas:** total neto, número de ventas, ticket promedio y descuentos (con variación). Gráfico de **ventas en el tiempo**, que agrupa por mes si el rango supera 62 días (igual que el PDF), con mejor día o mes y promedio. Desglose por método de pago y productos más vendidos.
- **Gastos** (nuevo componente, antes estaba junto con Nómina): resumen y gastos por categoría.
- **Nómina** (nuevo componente, separado): resumen y pagos por empleado.
- **Insumos:** costo de compras, insumos con movimiento e insumos con merma. Tabla **ordenable y con buscador**: comprado, consumido (descontado por ventas), merma, stock actual (el de hoy, no el del cierre del periodo) y costo.
- Bloques comunes (`ReportBlocks`): `KpiCard`, `StatCard`, `Delta`, `ReportSection`, `ReportLoading` (skeleton), `ReportEmpty` y `ReportNote`. Mientras llega el periodo nuevo se sigue mostrando el anterior (`placeholderData`).

### Exportar a PDF (`ExportMenu`, `services/report-pdf.ts`)

- Un único botón **"Exportar PDF"** con menú:
  - **Reporte de la pestaña activa**, con una descripción de qué incluye.
  - **Reporte general** (solo el Gerente): balance del periodo (ventas − gastos) y los 4 reportes juntos, pensado para el cierre de mes.
  - Opción **"Incluir detalle"** para Gastos, Nómina y el general (lista cada gasto o pago).
- Endpoint: `GET /finances/reports/{sales|expenses|payroll|ingredients|summary}/pdf?dateFrom&dateTo&locationId&detail=false`.
- Timeout de 90 s (un PDF de un año con detalle puede tardar). El nombre del archivo se toma de `Content-Disposition`, con `reporte-<tipo>_<desde>_<hasta>.pdf` como respaldo. El botón muestra "Generando…" mientras descarga.

## §9.6 / §9.7 Inventario e insumos

- Sugerencia de **"Fijar cantidad"** ante `INSUFFICIENT_STOCK` (ver §6).
- El tipo de ajuste `SET` se renombró de "Establecer" a **"Fijar cantidad"** (`inventory.table.ts`, `ingredient.table.ts`).

## §9.16 Venta sin conexión

- Nueva advertencia de sincronización `MODIFIER_NOT_OFFERED`: "N con modificador que ya no se ofrece en la sucursal".

## §12 Pruebas y automatización

### Cantidad de pruebas del frontend

Se contaron ejecutando Vitest y `playwright test --list` el 22/11/2026, sobre `eba9ddb`.

**Unitarias (Vitest): 288 en 15 archivos, todas aprobadas.**

| Momento | Pruebas | Cambio |
|---|---|---|
| `fc8740b` (17/11) | 246 | — |
| `bed0874` (17/11) | 251 | +5 en `error-message.test.ts` |
| `b97702c` (22/11) | **288** | +2 en `product.mapper.test.ts` (nuevo) y +35 en `report-period.test.ts` (de 5 a 40) |

| Archivo | Pruebas |
|---|---|
| `services/interceptors/error-message.test.ts` | 49 |
| `features/finances/reports/utils/report-period.test.ts` | 40 |
| `lib/formatters.test.ts` | 34 |
| `utils/validation-errors.test.ts` | 33 |
| `features/offline/utils/offline-sale.builder.test.ts` | 23 |
| `features/whatsapp/stores/whatsapp-orders.store.test.ts` | 19 |
| `features/pos/mappers/order.mapper.test.ts` | 18 |
| `features/pos/stores/cart.store.test.ts` | 15 |
| `features/whatsapp/mappers/whatsapp-order.mapper.test.ts` | 15 |
| `lib/money.test.ts` | 11 |
| `components/shared/Interactives/money-input.utils.test.ts` | 10 |
| `services/interceptors/error-toast.retry.test.ts` | 7 |
| `features/whatsapp/utils/order-actions.test.ts` | 7 |
| `features/catalog/products/utils/product-availability.test.ts` | 5 |
| `features/catalog/products/mappers/product.mapper.test.ts` | 2 |
| **Total** | **288** |

**E2E (Playwright): 64 casos en 5 archivos.** Son 67 si se cuentan las 3 preparaciones de sesión de `auth.setup.ts`, una por rol. No se ejecutaron en esta revisión porque necesitan el backend (`npm run e2e:isolated`), así que el resultado queda pendiente.

| Archivo | Antes | Ahora | Cambio |
|---|---|---|---|
| `auth.spec.ts` | 9 | 9 | — |
| `permissions.spec.ts` | 24 | 30 | +2 rutas (`/catalog/categories` y `/catalog/modifiers`) × 3 roles; en `/reports` ahora se espera que el Administrador entre |
| `pos-sale.spec.ts` | 11 | 11 | — |
| `whatsapp-orders.spec.ts` | 5 | 5 | Agregado en `c9a3bc5` |
| `catalog.spec.ts` | — | 9 | Nuevo (CP-CAT-01..09) |
| **Total** | **49** | **64** | |

La columna "Antes" es el estado posterior a `c9a3bc5`, cuando ya existían las pruebas de WhatsApp. En `fc8740b` había 44 casos.

### §12.2 Pruebas unitarias nuevas o ampliadas

- `product.mapper.test.ts`: el check "Disponible para venta" se envía como `isAvailable`. Un precio por sucursal igual al general se envía como `null`.
- `error-message.test.ts`: con un descuento mayor al subtotal se muestra el mensaje del backend.
- `report-period.test.ts` (ampliado): rangos de los presets, rango de meses, validación de límites, periodo anterior y agrupación por mes.

### §12.3 Automatización — CI (`.github/workflows/ci.yml`)

- Se ejecuta en cada push o PR a `main`, `qa` y `develop`, con `concurrency` (cancela las ejecuciones anteriores de la misma rama).
- Job **verify** (15 min): ESLint, pruebas unitarias con **cobertura** (tabla de sentencias, ramas, funciones y líneas en el resumen del run, y reporte como artefacto `coverage` por 14 días), verificación de tipos y build de producción.
- Job **e2e** (Playwright, 30 min): **solo manual** (*Run workflow → e2e*). Necesita un backend accesible y los *secrets* `E2E_API_URL`, las credenciales `E2E_*` y, para WhatsApp, `E2E_WHATSAPP_APP_SECRET` y `E2E_WHATSAPP_PHONE_NUMBER_ID`. Publica el artefacto `e2e-report` (capturas, videos y trazas).

### §12.3 Modo E2E aislado (`npm run e2e:isolated`, `scripts/e2e-isolated.mjs`)

No necesita credenciales ni datos previos:

1. Levanta el entorno de pruebas del backend (`npm run e2e:serve` en `../be-buen-asador-management`): base nueva, API en el puerto 3998, SMTP de prueba y usuarios por rol.
2. Crea por la API los datos de prueba: «E2E Para Tres» (275 Bs), «E2E Sin Stock» y el turno abierto del cajero.
3. Ejecuta Playwright con Vite en el puerto 5174 apuntando a esa API. Nunca reutiliza un Vite ya abierto, que podría apuntar a staging.
4. Detiene el backend y borra la base al terminar, aunque las pruebas fallen.

### §12.4 / §12.6 Casos de prueba de caja negra nuevos

**Catálogo — RF-08, RF-09, RF-33, RF-34 (`e2e/catalog.spec.ts`)**

| ID | Técnica | Caso | Resultado esperado |
|---|---|---|---|
| CP-CAT-01 | Tabla de decisión | Gerente en productos y categorías | Ve «Nuevo producto» y «Nueva categoría» |
| CP-CAT-02 | Tabla de decisión | Administrador en productos y categorías | No ve esos botones (solo cambia la disponibilidad) |
| CP-CAT-03 | Tabla de decisión | Administrador hace clic en un producto | No se abre el formulario de edición |
| CP-CAT-04 | Partición (precio propio) | Gerente en «todas las sucursales» | Ve el precio general y «Sucursal: Bs X» |
| CP-CAT-05 | Partición (sin precio propio) | POS del cajero | Muestra el precio general |
| CP-CAT-06 | Partición (con precio propio) | POS del cajero | Muestra el precio de su sucursal |
| CP-CAT-07 | Tiempo real (SSE) | El gerente pone un producto como no disponible | Desaparece del POS sin recargar |
| CP-CAT-08 | Tiempo real (SSE) | El gerente crea un producto | Aparece en el POS sin recargar |
| CP-CAT-09 | Caso de uso | El gerente desmarca «Disponible para venta» | El producto deja de ofrecerse en el POS |

Defectos detectados y corregidos: **CP-CAT-09** (`available` → `isAvailable`) y **CP-CAT-07** (copia vieja de la categoría en `ProductGrid`).

**Pedidos por WhatsApp — RF-04 (`e2e/whatsapp-orders.spec.ts`)**

El cliente se simula enviando al webhook (`POST /api/whatsapp/webhook`) los mensajes que mandaría Meta, firmados con HMAC-SHA256.

```
PENDING ──Aprobar──▶ CONFIRMED ──Preparar──▶ PREPARING ──Listo──▶ READY ──Cobrar──▶ PAID
   │                                                                │
   └──Rechazar (motivo)──▶ CANCELLED        (delivery) READY ──Entregado──▶ DELIVERED ──Cobrar──▶ PAID
```

| ID | Transición / caso | Resultado esperado |
|---|---|---|
| CP-WA-01 | El cliente confirma en el bot → PENDING | Aparece en "Pendientes" en tiempo real, con "Aprobar" y "Rechazar" |
| CP-WA-02 | PENDING → CONFIRMED → PREPARING → READY → PAID (para llevar) | Cambia de pestaña en cada paso y sale de la bandeja al cobrar |
| CP-WA-03 | READY → DELIVERED (delivery) | Ofrece "Entregado"; DELIVERED se puede cobrar |
| CP-WA-04 | PENDING → CANCELLED | Exige un motivo y el pedido sale de todas las pestañas |
| CP-WA-05 | Webhook con firma inválida o sin firma | El backend responde 401 |

**Permisos (`e2e/permissions.spec.ts`):** se actualizó para el catálogo. El Administrador tiene productos con "solo disponibilidad" y categorías y modificadores en "solo lectura".

Soporte agregado: page objects `WhatsappOrdersPage` y `PosPage` (selección de categoría), helpers `e2e/support/api.ts`, `catalog-api.ts` y `whatsapp-bot.ts`, y la variable `E2E_PRODUCT_CATEGORY` en `.env.e2e.example`.

## §14 Estado actual — sugerencias para actualizar

- Reportes: pasa de "consulta en pantalla" a **consulta + exportación PDF + comparación de periodos**.
- Catálogo: precios por sucursal y actualización en tiempo real completados.
- Layout: responsive en móvil.
- Despliegue en Vercel configurado.

---

## Commits incluidos (sin merges)

| Commit | Fecha | Descripción |
|---|---|---|
| `c9a3bc5` | 17/11 | CI mejorado y pruebas E2E de pedidos de WhatsApp |
| `55112d6` | 17/11 | Precio por sucursal en productos y modificadores; baja lógica con confirmación; `catalog-updated`; sugerencia ante stock insuficiente |
| `c862ee1` | 17/11 | Componente `LocationPriceList` integrado en productos y modificadores |
| `bed0874` | 17/11 | Código `INVALID_VALUE` y validación del descuento contra el subtotal |
| `57c8da9` | 18/11 | Documentación: permisos del catálogo alineados con el backend |
| `aebd9bf` | 18/11 | Configuración de Vercel |
| `5ef7e79` | 18/11 | `package-lock.json` multiplataforma |
| `ae5ee9e`, `4abb9c0` | 18/11 | `yarn.lock`, favicon, metadatos de `index.html` y versión del service worker |
| `b97702c` | 22/11 | Reportes rediseñados con exportación PDF, Administrador en Reportes, menú móvil, `InfoTooltip`, pruebas E2E de catálogo y modo E2E aislado |
