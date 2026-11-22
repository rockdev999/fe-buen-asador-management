# Pruebas E2E (caja negra)

Pruebas de extremo a extremo con [Playwright](https://playwright.dev) que
manejan la aplicación desde el navegador, contra el **backend real**.

## Cómo ejecutarlas

### Modo aislado (recomendado, repetible)

```bash
npm run e2e:isolated
```

No necesita credenciales ni datos previos. El script (`scripts/e2e-isolated.mjs`):

1. Levanta el entorno de pruebas del backend (`npm run e2e:serve` en `../be-buen-asador-management`, o `E2E_BACKEND_DIR`). Crea una base nueva, la API en el puerto 3998, un SMTP de prueba y un administrador y un cajero por sucursal.
2. Crea por la API los datos que estas pruebas necesitan: «E2E Para Tres» (275 Bs), «E2E Sin Stock» (cuantificable, stock 0) y el turno abierto del cajero.
3. Ejecuta Playwright con Vite en el puerto 5174 apuntando a esa API (nunca reutiliza un Vite ya abierto que pueda apuntar a staging).
4. Detiene el backend y borra su base al terminar, aunque las pruebas fallen.

Acepta los argumentos de `playwright test`, por ejemplo `npm run e2e:isolated -- catalog`.

### Contra un backend ya levantado

1. Levantar el backend (`VITE_API_URL` del `.env`).
2. Copiar `.env.e2e.example` como `.env.e2e` y completar las credenciales.
3. Ejecutar:

| Comando | Qué hace |
|---|---|
| `npm run e2e` | Corre todas las pruebas (levanta Vite si no está corriendo) |
| `npm run e2e:ui` | Modo interactivo, paso a paso |
| `npm run e2e:report` | Abre el reporte HTML con capturas, video y traza de los fallos |

**Precondiciones de datos:** el cajero de prueba tiene un turno abierto en su
sucursal, `E2E_PRODUCT` tiene stock y `E2E_PRODUCT_NO_STOCK` no tiene stock.
Las pruebas CP-POS-08 a CP-POS-10 registran ventas reales en la base de datos.

## Estructura

```
e2e/
├── auth.setup.ts         Inicia sesión una vez por rol y guarda la sesión
├── auth.spec.ts          RF-01 Autenticación
├── permissions.spec.ts   RF-02 Control de acceso por rol
├── pos-sale.spec.ts      RF-03 Venta en el POS
├── catalog.spec.ts       RF-08, RF-09, RF-33, RF-34 Catálogo, precios por sucursal y tiempo real
├── pages/                Page Objects (LoginPage, PosPage)
└── support/users.ts      Usuarios de prueba desde .env.e2e
```

## Casos de prueba

### RF-01 · Autenticación — partición de equivalencia

| ID | Clase | Entrada | Resultado esperado |
|---|---|---|---|
| CP-AUT-01 | Inválida | Usuario y contraseña vacíos | Mensajes "requerido"; no se envía la petición |
| CP-AUT-02 | Inválida | Usuario válido, contraseña incorrecta | "Credenciales inválidas"; sigue en /login |
| CP-AUT-03 | Inválida | Usuario inexistente | "Credenciales inválidas"; sigue en /login |
| CP-AUT-04 | Válida | Gerente (correo) | Entra a /dashboard sin elegir sucursal |
| CP-AUT-05 | Válida | Administrador (nombre de usuario) | Elige sucursal → /dashboard |
| CP-AUT-06 | Válida | Cajero (correo) | Elige sucursal → /pos con la sucursal en la cabecera |
| CP-AUT-07 | — | Paso 2 sin elegir sucursal | "Continuar" deshabilitado hasta elegir |
| CP-AUT-08 | — | "Volver al inicio de sesión" | Regresa al paso 1 |
| CP-AUT-09 | Inválida | Ruta protegida sin sesión | Redirige a /login |

### RF-02 · Control de acceso — tabla de decisión rol × ruta

✔ = permitido · ✘ = redirige a la pantalla de inicio del rol (cajero → /pos, resto → /dashboard).

| Ruta | Gerente | Administrador | Cajero |
|---|---|---|---|
| /users | ✔ | ✘ | ✘ |
| /locations | ✔ | ✘ | ✘ |
| /reports | ✔ | ✘ | ✘ |
| /catalog/products | ✔ | ✔ (solo disponibilidad) | ✘ |
| /catalog/categories | ✔ | ✔ (solo lectura) | ✘ |
| /catalog/modifiers | ✔ | ✔ (solo lectura) | ✘ |
| /inventory | ✔ | ✔ | ✘ |
| /dashboard | ✔ | ✔ | ✘ |
| /sales | ✔ | ✔ | ✔ |
| /pos | ✘ | ✘ | ✔ |

Cada celda es un caso: CP-PER-01 a CP-PER-30.

### RF-03 · Venta en el POS

**Partición de equivalencia por tipo de pedido** (datos del cliente exigidos):

| ID | Tipo | Datos ingresados | Resultado esperado |
|---|---|---|---|
| CP-POS-03 | Presencial | Ninguno | Se puede confirmar |
| CP-POS-04 | Para llevar | Ninguno | No se puede confirmar; "Completa todos los campos" |
| CP-POS-05 | Para llevar | Nombre | Se puede confirmar |
| CP-POS-06 | Delivery | Nombre y teléfono (sin dirección) | No se puede confirmar |
| CP-POS-07 | Delivery | Nombre, teléfono y dirección | Se puede confirmar |

**Valores límite del efectivo recibido** (CP-POS-08, total P = precio del producto):

| Recibido | Resultado esperado |
|---|---|
| vacío | "Confirmar cobro" deshabilitado |
| P − 0.01 | "Falta"; deshabilitado |
| P | "Cambio"; habilitado |
| P + 25 | "Vuelto" 25.00; habilitado |

**Otros casos:**

| ID | Caso | Resultado esperado |
|---|---|---|
| CP-POS-01 | Carrito vacío | "Cobrar pedido" deshabilitado |
| CP-POS-02 | Mismo producto dos veces | Subtotal = 2 × precio |
| CP-POS-09 | Venta presencial en efectivo con vuelto | "¡Pago registrado!"; "Nuevo pedido" vacía el carrito |
| CP-POS-10 | Venta para llevar con tarjeta | Sin campo de monto; "¡Pago registrado!" con el nombre del cliente |
| CP-POS-11 | Producto sin stock | El backend responde 409; aviso de stock; no se abre el cobro |

### RF-08, RF-09, RF-33, RF-34 · Catálogo

| ID | Técnica | Caso | Resultado esperado |
|---|---|---|---|
| CP-CAT-01 | Tabla de decisión | Gerente en productos y categorías | Ve «Nuevo producto» y «Nueva categoría» |
| CP-CAT-02 | Tabla de decisión | Administrador en productos y categorías | No ve esos botones (solo cambia la disponibilidad) |
| CP-CAT-03 | Tabla de decisión | Administrador hace clic en un producto | No se abre el formulario de edición |
| CP-CAT-04 | Partición (precio propio) | Gerente en «todas las sucursales» | Precio general y «<sucursal>: Bs X» de la que tiene precio propio |
| CP-CAT-05 | Partición (sin precio propio) | POS del cajero | Muestra el precio general |
| CP-CAT-06 | Partición (con precio propio) | POS del cajero | Muestra el precio de su sucursal |
| CP-CAT-07 | Tiempo real (SSE) | El gerente pone un producto como no disponible | Desaparece del POS sin recargar |
| CP-CAT-08 | Tiempo real (SSE) | El gerente crea un producto | Aparece en el POS sin recargar |
| CP-CAT-09 | Caso de uso | El gerente desmarca «Disponible para venta» | El producto deja de ofrecerse en el POS |

Defectos detectados por estos casos (corregidos):

- **CP-CAT-09:** el formulario enviaba `available` y el backend espera `isAvailable`, así que el check «Disponible para venta» no tenía efecto. Se corrigió en `mapProductFormToDTO`.
- **CP-CAT-07:** el POS guardaba una copia de la categoría abierta. Al refrescarse el menú, esa pestaña seguía mostrando los productos y precios anteriores hasta cambiar de pestaña. Ahora guarda solo el id y lee los productos del menú actual (`ProductGrid`).

### RF-04 · Pedidos por WhatsApp — transición de estados

El cliente se simula enviando al webhook (`POST /api/whatsapp/webhook`) los
mensajes que mandaría Meta, firmados con HMAC-SHA256. El secreto y el
`phone_number_id` se leen del `.env` del backend (`E2E_BACKEND_ENV`, por
defecto `../be-buen-asador-management/.env`). Sin `WHATSAPP_TOKEN`, el backend
no envía nada a WhatsApp: solo registra en el log lo que habría enviado.

```
PENDING ──Aprobar──▶ CONFIRMED ──Preparar──▶ PREPARING ──Listo──▶ READY ──Cobrar──▶ PAID
   │                                                                │
   └──Rechazar (motivo)──▶ CANCELLED        (delivery) READY ──Entregado──▶ DELIVERED ──Cobrar──▶ PAID
```

| ID | Transición / caso | Resultado esperado |
|---|---|---|
| CP-WA-01 | Cliente confirma en el bot → PENDING | Aparece en "Pendientes" en tiempo real (SSE), con código corto, "Aprobar" y "Rechazar" |
| CP-WA-02 | PENDING → CONFIRMED → PREPARING → READY → PAID (para llevar) | Cambia de pestaña en cada paso; sin paso "Entregado"; al cobrar sale de la bandeja |
| CP-WA-03 | READY → DELIVERED (delivery) | Ofrece "Entregado"; DELIVERED sigue en "Listos" y se puede cobrar |
| CP-WA-04 | PENDING → CANCELLED | Exige motivo (vacío o solo espacios no); sale de todas las pestañas |
| CP-WA-05 | Webhook con firma inválida o sin firma | El backend responde 401 (seguridad) |

## Integración continua

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- **En cada push o PR** a `develop`, `qa` y `main`: lint, pruebas unitarias con
  cobertura (resumen en la pestaña del run y reporte como artefacto) y build
  de producción.
- **E2E, manual** (*Actions → CI → Run workflow → e2e*): necesita un backend
  accesible desde GitHub y estos *secrets*: `E2E_API_URL`, las credenciales
  `E2E_*` de `.env.e2e.example` y, para RF-04, `E2E_WHATSAPP_APP_SECRET` y
  `E2E_WHATSAPP_PHONE_NUMBER_ID`. El reporte (capturas, videos y trazas) queda
  como artefacto `e2e-report`.
