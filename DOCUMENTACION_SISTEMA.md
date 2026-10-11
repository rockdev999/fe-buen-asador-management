# Documentación del Sistema — Fe Buen Asador Management

> Documento técnico de referencia sobre la estructura y funcionamiento del frontend del sistema de gestión para el restaurante "Buen Asador". Elaborado como insumo para la documentación del proyecto de grado.

---

## 1. Visión general

**Fe Buen Asador Management** es una aplicación web (SPA) de gestión integral para un restaurante con **múltiples sucursales**, operado en Bolivia (moneda `BOB`/"Bs.", zona horaria `America/La_Paz`). Cubre dos grandes frentes:

1. **Back-office administrativo**: gestión de usuarios, sucursales, catálogo de productos (categorías, modificadores, productos), inventario de productos terminados, insumos/ingredientes y recetas, consulta de ventas/pedidos, y **finanzas** (egresos y nómina, con reportes por período).
2. **Punto de venta (POS)**: pantalla operativa para cajeros que permite abrir turno de caja, armar pedidos desde un menú visual, revisar el pedido, cobrar y emitir/imprimir el ticket. Desde el turno abierto, el cajero también registra **egresos de caja** y **pagos de sueldos** del día.

El sistema está diseñado para **múltiples roles** (Gerente, Administrador, Cajero, Empleado) con acceso diferenciado por pantalla, y para **múltiples sucursales**, donde un mismo usuario puede tener distintos roles según la sucursal en la que trabaje.

### 1.1 Stack tecnológico

| Categoría | Tecnología |
|---|---|
| Framework UI | React 19 + TypeScript |
| Build tool | Vite |
| Enrutamiento | react-router-dom v7 (`createBrowserRouter`) |
| Datos remotos / cache | TanStack React Query v5 |
| Estado de cliente global | Zustand (con middleware `persist` para sesión/carrito de caja/UI) |
| Formularios | Formik |
| Validación de esquemas | Zod (con un adaptador propio `zodToFormik`, **no** se usa `@hookform/resolvers` ni react-hook-form pese a estar en las dependencias) |
| HTTP | Axios (cliente único con interceptores) |
| Estilos | Tailwind CSS + componentes propios inspirados en shadcn/ui (Radix UI como base de primitivas: dialog, dropdown, select, avatar, tabs, popover, etc.) |
| Iconografía | lucide-react |
| Notificaciones | sonner (toasts) |
| Drag & drop | @dnd-kit (reordenar ítems del carrito del POS) |
| Fechas | date-fns, react-datepicker |
| i18n | Diccionario propio en español (`src/locales/es`), usado principalmente para mensajes de validación |

### 1.2 Scripts disponibles

```json
"dev" / "start": "vite"        // servidor de desarrollo
"build": "tsc -b && vite build" // chequeo de tipos + build de producción
"lint": "eslint ."
"preview": "vite preview"
```

Configuración de entorno (`src/config/env.ts`, variables `VITE_*` en `.env`): `VITE_API_URL` (URL base del backend, por defecto `http://localhost:3000/api`), `VITE_APP_NAME`, `VITE_VERSION`. Configuración de negocio (`src/config/app.config.ts`): nombre "Buen Asador", moneda `BOB`/"Bs.", timeout HTTP 10s, reintentos máx. 2, paginación por defecto (10 ítems, opciones 10/20/50/100).

---

## 2. Arquitectura general del proyecto

### 2.1 Organización por *features* (feature-based / screaming architecture)

El código fuente (`src/`) no se organiza por tipo técnico (todos los componentes juntos, todos los hooks juntos), sino **por dominio de negocio**, bajo `src/features/`:

```
src/features/
  auth/          # login, selección/cambio de sucursal
  users/         # gestión de usuarios, roles por sucursal, cargos
  locations/     # gestión de sucursales
  catalog/       # categorías, modificadores, productos
    categories/
    modifiers/
    products/
  inventory/     # stock de productos terminados, kardex, alertas
  supplies/      # ingredientes, stock de ingredientes, recetas
  pos/           # punto de venta (carrito, pago, turno de caja, impresión)
  sales/         # consulta de ventas (histórico, filtros)
  finances/      # finanzas
    expenses/    #   egresos (gastos de caja) y su reporte por categoría
    payroll/     #   nómina: pagos de sueldo, pago masivo, sueldos diarios, reporte
  public/        # página 404
```

Cada módulo de negocio sigue **la misma subestructura interna** (patrón repetido de forma consistente en todo el proyecto):

```
feature/
  dto/          # forma de los datos tal como los envía/recibe el backend (wire format)
  models/       # forma de los datos ya adaptada para la UI
  mappers/      # funciones puras que convierten DTO ⇄ modelo ⇄ formulario
  validators/   # esquemas Zod (reglas de validación + mensajes)
  forms/        # tipos de formulario + "form-config" (initialValues, validationSchema, mapFormToDTO)
  hooks/        # acceso a datos vía React Query (queries y mutaciones) sobre el cliente HTTP
  config/       # constantes de UI del módulo (opciones de filtros, config de tabla)
  pages/        # páginas y modales de esa feature
```

Este patrón **DTO → Mapper → Modelo** se aplica de forma estricta: nunca se pasa un DTO crudo del backend directamente a un componente de UI; siempre existe una función mapper explícita, campo por campo, lo que facilita rastrear cambios de contrato con el backend y desacopla la UI del formato exacto de la API.

### 2.2 Estructura transversal (fuera de `features/`)

```
src/
  components/
    layout/       # AppLayout, Sidebar, Topbar
    shared/        # sistema de diseño propio (ver sección 6)
    ui/            # primitivas estilo shadcn/ui (button, input, dialog, table, etc.)
  routes/          # definición de rutas, guards de autenticación/rol
  stores/          # stores globales de Zustand (auth, ui, error)
  hooks/           # hooks genéricos de acceso a datos (api.handlers.ts)
  services/        # cliente Axios + interceptores
  constants/       # enums, mensajes, códigos de error HTTP, query keys, config de tablas
  config/          # configuración de entorno, negocio y navegación
  locales/es/      # diccionario de strings en español
  types/           # tipos compartidos (envelope de API, auditoría, alias de tipos primitivos)
  utils/           # utilidades transversales (mapas enum → etiqueta/color)
  lib/             # utilidades de bajo nivel (p. ej. `zodToFormik`, `cn` para clases)
```

---

## 3. Enrutamiento y navegación

### 3.1 Definición de rutas (`src/routes/Router.tsx`)

El árbol de rutas se define con `createBrowserRouter` y tiene tres niveles de protección anidados:

```
/login                          → Login (pública)
<ProtectedRoute>                 → exige sesión activa
  <AppLayout>                    → sidebar + topbar + <Outlet/>
    /                            → RoleBasedRedirect (decide destino según rol)
    <RoleRoute roles=[MANAGER,ADMIN]>
      /dashboard                 → placeholder
    <RoleRoute roles=[MANAGER]>
      /users                     → Users
      /locations                 → Locations
    <RoleRoute roles=[MANAGER,ADMIN]>
      /catalog/products           → Products
      /catalog/categories         → Categories
      /catalog/modifiers          → Modifiers
      /inventory                  → Inventory
      /ingredients                → Supplies
      /reports                    → placeholder
    <RoleRoute roles=[MANAGER,ADMIN,CASHIER]>
      /orders                     → Orders
      /sales                      → Sales
      /shifts                     → placeholder ("Caja")
      /expenses                   → Expenses (vista según rol)
      /payroll                    → Payroll (vista según rol)
    <RoleRoute roles=[CASHIER]>
      /pos                        → Pos
    *                             → NotFound
* (fuera del layout)              → redirige a /login
```

Todas las rutas (incluidas las de negocio ya implementadas) están centralizadas como constantes en `src/routes/paths.ts` (`PATHS.LOGIN`, `PATHS.DASHBOARD`, `PATHS.USERS`, etc.), evitando strings de ruta "mágicos" repetidos por el código.

### 3.2 Guards de acceso

- **`ProtectedRoute.tsx`**: exige `isAuthenticated` (derivado de `!!token && !!user` en el store de sesión); si no, redirige a `/login`.
- **`RoleRoute.tsx`**: recibe una lista de roles permitidos y usa `hasRole(...roles)`; si el usuario no cumple, redirige a `/dashboard`.
- **`RoleBasedRedirect.tsx`**: al entrar a la raíz `/`, redirige según el rol de la sesión: Gerente/Administrador → `/dashboard`, Cajero → `/shifts`.

### 3.3 Menú de navegación (`src/config/navigation/navSections.ts`)

El sidebar se genera dinámicamente a partir de una configuración declarativa `NAV_SECTIONS`, agrupada en secciones (**General, Administración, Finanzas, Operaciones, POS**), donde cada ítem puede tener `roles` (visibilidad condicionada) e hijos anidados (p. ej. "Catálogo" agrupa Productos/Categorías/Modificadores). El componente `Sidebar.tsx` filtra recursivamente qué mostrar según el rol del usuario autenticado, resalta la ruta activa, soporta grupos colapsables y puede replegarse a solo íconos.

La visibilidad del menú no coincide exactamente con los permisos de ruta: por ejemplo, "Caja" aparece para Cajero y Administrador pero la ruta también admite al Gerente, y Egresos/Nómina aparecen en la sección "Finanzas" para Gerente/Administrador y en la sección "POS" para el Cajero (misma ruta, distinta ubicación en el menú). La autorización real la define siempre `Router.tsx` (y, en última instancia, el backend).

### 3.4 Páginas que se adaptan al rol

Varias rutas no tienen una página por rol, sino un **componente "despachador"** que elige la vista según la sesión: `Orders`, `Sales`, `Expenses` y `Payroll` renderizan una vista de Gerente (`Manager*`, alcance global con filtro de sucursal) o una vista de Cajero/Administrador (alcance fijo a la sucursal activa). Dentro de esta última, las acciones disponibles se habilitan por rol (`canCreate` para Cajero, `canManage` para Administrador) y las pestañas de reporte solo se muestran al Administrador.

---

## 4. Autenticación y autorización

### 4.1 Roles del sistema (`RoleEnum`)

```ts
enum RoleEnum { MANAGER, ADMIN, CASHIER, EMPLOYEE }
```

- **MANAGER (Gerente)**: control total — usuarios, sucursales, catálogo, inventario, insumos, y visión consolidada de pedidos/ventas/egresos/nómina de **todas** las sucursales. No opera en una sucursal fija.
- **ADMIN (Administrador)**: gestiona catálogo/inventario/insumos/pedidos/ventas y consulta/edita egresos y nómina (incluido el sueldo diario de sus trabajadores), pero **acotado a su propia sucursal** (el backend fuerza el `locationId` del token; el frontend oculta selectores de sucursal para este rol). No registra pagos ni egresos: eso lo hace el cajero desde su turno.
- **CASHIER (Cajero)**: acceso al POS, pedidos y ventas de su sucursal, y **registro** de egresos y pagos de nómina; requiere turno de caja abierto para operar (los egresos y pagos quedan vinculados al turno).
- **EMPLOYEE (Empleado)**: definido en el enum pero sin rutas específicas asignadas actualmente (rol reservado para uso futuro).

Nota: existe además un concepto independiente de **cargo de trabajo** (`JobPositionEnum`: parrillero, cocinero, ayudante de cocina, cajero, mesero, repartidor, administrador, otro) que es puramente descriptivo/operativo y no otorga permisos — no debe confundirse con el rol.

### 4.2 Flujo de login en dos pasos

El sistema **no autentica en un solo paso**. El flujo es:

**Paso 1 — Credenciales.** El usuario ingresa `identifier` (usuario o email indistintamente — el commit `447d7bf` renombró este campo desde `email` para permitir ambos) + `password`. El backend responde con un **token temporal** y la lista de sucursales donde ese usuario tiene acceso, cada una con el rol que le corresponde en esa sucursal (`LocationWithRole[]`). En este punto la sesión queda en estado "autenticación temporal" (hay `tempToken` pero no `token` ni sesión completa).

**Paso 2 — Selección de sucursal.**
- Si **todas** las sucursales del usuario son con rol Gerente (`isManagerOnly`), se omite la pantalla y se selecciona automáticamente sin sucursal fija (`locationId: null`) — el Gerente opera de forma consolidada.
- En caso contrario, se muestra una pantalla para elegir la sucursal. Al confirmar, el backend emite el **token de acceso completo** y los datos completos del usuario (`UserDetails`, con el rol y la sucursal ya fijados para esa sesión). Se limpia el turno de caja previo (pertenecía a otra sucursal) y se invalida **todo** el caché de React Query, porque prácticamente todos los datos operativos (inventario, ventas, turnos) son específicos de la sucursal activa.
- Navegación resultante: Cajero → `/pos`; Gerente/Administrador → `/dashboard`.

**Cambio de sucursal en caliente** (`SwitchLocationModal`, disponible desde el menú de usuario en el Topbar, solo para Administrador y Cajero): reutiliza el mismo mecanismo de selección de sucursal; si el usuario es Cajero con un turno de caja abierto, se bloquea el cambio hasta que cierre el turno.

### 4.3 Gestión de sesión (sin cookies, sin refresh token)

La sesión se guarda en un store de Zustand persistido en `localStorage` (`useAuthStore`, clave `"auth-storage"`): `tempToken`, `locations`, `user`, `token`. El interceptor HTTP agrega automáticamente el header `Authorization: Bearer <token ?? tempToken>` en cada petición, lo que permite que las dos únicas rutas permitidas durante la autenticación temporal (`/auth/my-locations`, `/auth/select-location`) funcionen con el token temporal.

**No existe lógica de refresh token**: cuando el backend responde 401 (token expirado o inválido) en una ruta protegida, el interceptor de errores fuerza automáticamente el *logout* y redirige a `/login`.

---

## 5. Gestión de estado

El sistema separa claramente dos tipos de estado:

- **Estado de servidor** (listados, detalle de entidades, mutaciones): gestionado con **TanStack React Query**, con `staleTime` configurado por endpoint (desde 0 para datos que deben estar siempre frescos, hasta 10 min para catálogos poco cambiantes) y `retry: 1` por defecto.
- **Estado de cliente** (sesión, UI, carrito de venta): gestionado con **Zustand**, en 5 stores:

| Store | Persistido | Contenido |
|---|---|---|
| `useAuthStore` | Sí (`auth-storage`) | Sesión: `user`, `token`, `tempToken`, `locations` |
| `useUiStore` | Sí (`ui-storage`) | `sidebarOpen` (colapso del sidebar) |
| `useErrorStore` | No | Error puntual mostrado como toast global |
| `useCashierStore` (feature POS) | Sí (`cashier-storage`) | `activeShift` (turno de caja abierto) |
| `useCartStore` (feature POS) | No | Carrito de venta activo: ítems, tipo/canal de pedido, datos de cliente, descuento |

No se usa Redux ni Context API para estado global — Zustand cubre todos los casos de estado compartido entre componentes sin pasar por props.

---

## 6. Capa de comunicación con el backend (HTTP)

### 6.1 Cliente Axios único (`src/services/http.client.ts`)

Un solo cliente Axios (`httpClient`) con `baseURL` desde variables de entorno, timeout de 10s, y **tres interceptores** encadenados:

1. **Interceptor de autenticación**: agrega el header `Authorization` leyendo el token directamente del store de Zustand (fuera del ciclo de render de React).
2. **Interceptor de errores**: normaliza cualquier error de red o HTTP a un mensaje humano en español, priorizando en este orden: (a) código de error de dominio conocido (p. ej. `INSUFFICIENT_STOCK`, `LOCATION_ID_REQUIRED` → mensaje curado), (b) mensaje que venga del backend, (c) mensaje genérico por código HTTP (403/404/409/422/500). Muestra automáticamente un *toast* de error (o uno por campo, si el backend devuelve errores de validación por campo). Si detecta 401 fuera de las rutas públicas, cierra sesión automáticamente y redirige al login.
3. **Interceptor de reintento**: reintenta automáticamente (con backoff progresivo, máx. 2 veces) solo ante *timeout* o error de red — nunca ante errores HTTP con respuesta (4xx/5xx), que ya gestiona el interceptor de errores.

### 6.2 Hooks genéricos de acceso a datos (`src/hooks/api.handlers.ts`)

Toda la aplicación construye sus hooks de negocio sobre tres envoltorios estandarizados de React Query:

- **`useGetHandler`**: para queries simples; incluye un *guard* por rol integrado (si se especifica `roles`, la petición ni siquiera se dispara si el usuario no cumple el rol, evitando 403 innecesarios).
- **`usePaginatedGetHandler`**: para listados paginados; separa los datos (`data`) de los metadatos de paginación (`meta`: total, página, límite, total de páginas).
- **`useSubmitHandler`** (y sus alias `usePostHandler`/`usePutHandler`/`usePatchHandler`/`useDeleteHandler`): para mutaciones; soporta toast de éxito, invalidación de *query keys* relacionadas y callbacks de éxito/error.

Este patrón se repite en las decenas de hooks de negocio del proyecto (`useUsersPage`, `useCreateProduct`, `useAdjustStock`, etc.), lo que da consistencia total en el manejo de carga/error/éxito en toda la app.

Las *query keys* están centralizadas en `src/constants/queryKeys/query-keys.ts` (`QUERY_KEYS`) para evitar duplicación y coordinar invalidaciones de caché entre features relacionadas (p. ej. crear una receta invalida también el stock de insumos).

---

## 7. Sistema de diseño y componentes compartidos

### 7.1 Layout de la aplicación (`src/components/layout/`)

- **`AppLayout`**: shell general — sidebar + topbar + área de contenido (`<Outlet/>`), con el toast global montado.
- **`Sidebar`**: menú lateral dinámico descrito en la sección 3.3, colapsable.
- **`Topbar`**: muestra la sucursal activa, indicador de turno abierto (cajero), y menú de usuario (perfil, cambiar de sucursal, cerrar sesión).

### 7.2 Design system propio (`src/components/shared/`, sobre primitivas `src/components/ui/` estilo shadcn/ui)

- **`DataTable/`**: sistema de tablas paginadas reutilizado en casi todos los listados (Usuarios, Sucursales, Productos, Ingredientes, Pedidos, Ventas, Inventario, Egresos, Nómina). Incluye ordenamiento por columna, paginación numerada, estados de carga (skeleton) y vacío, y un hook `useTableState` que centraliza página/orden/filtros para cualquier página de listado.
- **`Form/`**: inputs conectados a Formik (`FormInput`, `FormPassword`, `FormTextarea` con contador de caracteres, `FormSection` para agrupar campos).
- **`Basics/`**: átomos base — `Button` (múltiples variantes/tamaños/formas, con estado de carga), `Label`, `ErrorMessage`, `FormSwitch` (toggle), `Image`.
- **`Overlay/`**: sistema propio de modales (`AppModal`, tamaños xs–full) y paneles laterales (`AppOffcanvas`), con cabeceras/pies estandarizados (`PanelHeader`/`PanelFooter`).
- **`Interactives/`**: controles complejos construidos a medida — `AsyncDropdown` (select con datos remotos y búsqueda), `MultiSelectDropdown` (multi-selección con chips), `MoneyInput` (formato de moneda boliviana), `ImageUploader` (drag&drop con preview y validación), `UserRoleAssigner` (asignación de pares usuario+rol), `DatePicker` (selector simple y de rango, localizado en español).

### 7.3 Patrón de validación de formularios

Cada formulario define su regla de validación con **Zod** (`validators/*.schema.ts`), y un adaptador propio (`src/lib/zodToFormik.ts`) lo traduce a una función `validate` compatible con **Formik**. Así, todo el proyecto usa Formik + Zod de forma consistente (no react-hook-form, pese a estar entre las dependencias del `package.json`).

---

## 8. Módulos funcionales

### 8.1 Sucursales (`features/locations`) — ruta `/locations`, solo Gerente

Gestión de las sucursales físicas del restaurante: alta, edición (nombre/dirección), activación/desactivación (soft-delete, con doble confirmación), y **asignación de usuarios con su rol** a cada sucursal (modal en dos pasos: datos de la sucursal → usuarios y roles). Una sucursal desactivada conserva su historial. Es la pieza central del modelo multi-sucursal: el login devuelve las sucursales de cada usuario con su rol específico en cada una, y prácticamente todos los módulos operativos (inventario, insumos, pedidos, ventas) filtran sus datos por sucursal activa.

### 8.2 Usuarios (`features/users`) — ruta `/users`, solo Gerente

CRUD de usuarios del sistema con desactivación (soft-delete). Cada usuario tiene datos personales (nombre, apellido, usuario, email — estos tres inmutables tras la creación), teléfono opcional, descripción, y uno o varios **cargos de trabajo** (parrillero, cocinero, cajero, mesero, etc., puramente descriptivos). La relación usuario↔sucursal↔rol es de muchos-a-muchos: un mismo usuario puede trabajar en varias sucursales con roles distintos en cada una; esta asignación se gestiona desde el módulo de Sucursales, mientras que el modal de Usuario solo la muestra en modo lectura.

### 8.3 Catálogo (`features/catalog`) — rutas `/catalog/*`, Gerente + Administrador

Tres sub-módulos con el mismo patrón de UI (grilla de tarjetas + modal de creación/edición, salvo Productos que usa tabla paginada):

- **Categorías** (`/catalog/categories`): agrupan productos para el menú (p. ej. "Parrillas", "Bebidas") y definen su orden de aparición. Cada categoría se asigna a una o varias sucursales.
- **Modificadores** (`/catalog/modifiers`): extras/adicionales pagos que se pueden agregar a un producto en el POS (p. ej. "Carne extra +Bs 15"), con precio adicional, estado activo/inactivo, y asignación a una o varias sucursales.
- **Productos** (`/catalog/products`): los ítems vendibles del menú. Cada producto tiene nombre, marca, descripción, imagen (subida de archivo), precio, categoría, disponibilidad, orden de aparición, y dos banderas de configuración clave: `isQuantifiable` (si controla stock/inventario) y `haveModifiers` (si acepta modificadores en el POS). Al igual que categorías y modificadores, un producto puede habilitarse en una o varias sucursales.

En los tres casos, el rol Gerente puede asignar libremente las sucursales; el rol Administrador queda restringido a su propia sucursal tanto en la interfaz como de forma defensiva antes de enviar el formulario (el backend también lo valida).

### 8.4 Inventario (`features/inventory`) — ruta `/inventory`, Gerente + Administrador

Control de stock de **productos terminados** marcados como cuantificables, por sucursal. Funcionalidades: registrar el stock inicial de un producto en una sucursal, ajustar cantidades (sumar/restar/fijar valor), consultar el **kardex** (historial de movimientos de entrada/salida, con motivo: venta o entrada manual), y gestionar **alertas de stock bajo** (comparando cantidad actual contra un mínimo configurado, con opción de marcarlas como resueltas). El Gerente puede ver/filtrar cualquier sucursal; el Administrador queda limitado a la suya.

### 8.5 Insumos (`features/supplies`) — ruta `/ingredients`, Gerente + Administrador

Contraparte del Inventario a nivel de **materia prima**, con una capa adicional: las **recetas**. Tres pestañas:

- **Insumos**: catálogo de ingredientes (nombre, unidad de medida: kg, lb, arroba, unidad).
- **Stock de insumos**: mismo patrón que Inventario (ajustar/crear stock, kardex, alertas), pero además registra el **costo unitario** de cada entrada de stock, habilitando el costeo de recetas.
- **Recetas**: vinculan un producto del catálogo con los ingredientes (y cantidades) que consume por unidad vendida. Al crear una receta, el sistema registra automáticamente el stock de ese ingrediente (en 0) en todas las sucursales donde el producto ya está habilitado — esta es la base para que, al concretarse una venta, se descuente automáticamente el stock de insumos (motivo de kardex "consumo por venta").

### 8.6 Punto de Venta / POS (`features/pos`) — ruta `/pos`, solo Cajero

Pantalla operativa de venta, con un flujo de estados: `idle → review → payment → success (→ invoice)`.

1. **Apertura de turno**: obligatoria antes de vender; se registra un monto inicial de caja. Sin turno abierto, la pantalla queda bloqueada por un modal.
2. **Selección de productos**: menú visual organizado por pestañas de categoría (tarjetas con imagen, nombre, marca y precio); solo se pueden agregar productos disponibles.
3. **Carrito**: cada línea del carrito puede tener varias unidades físicas, y **cada unidad puede llevar sus propios modificadores y notas** (p. ej. 3 hamburguesas, cada una con extras distintos). Soporta reordenar ítems por arrastre, editar cantidad, y elegir el tipo de pedido (en local / para llevar / delivery) y su canal.
4. **Revisión del pedido**: resumen agrupado por producto con sus modificadores, captura de datos del cliente (obligatorios según el tipo de pedido: delivery exige nombre+teléfono+dirección; para llevar exige nombre), posibilidad de cancelar un pedido existente.
5. **Pago**: selección de método (efectivo, transferencia, QR), aplicación de descuento, y para pagos en efectivo, cálculo en vivo del cambio a entregar.
6. **Confirmación e impresión**: pantalla de éxito con el código de ticket y detalle, impresión automática de un ticket con formato de recibo (80mm) mediante una vista oculta imprimible.
7. **Facturación**: existe un panel de emisión de factura (NIT + nombre) construido pero **no conectado aún** a un endpoint real (funcionalidad pendiente).

El módulo también expone la gestión de **pedidos históricos** (`/orders`): para Cajero/Administrador, acotada a su sucursal; para Gerente, vista global con filtro de sucursal y fecha.

### 8.7 Ventas (`features/sales`) — ruta `/sales`, Gerente + Administrador + Cajero

Consulta del histórico de ventas (una venta se genera al cobrarse un pedido). Vista para Cajero/Administrador acotada a su propia sucursal; vista de Gerente con alcance global (todas las sucursales, con filtro de sucursal, método de pago y cajero). Cada venta registra subtotal, descuento, total, monto recibido, cambio, método de pago y estado (abierta/cobrada/anulada), con detalle de ítems agrupados por producto para reimpresión o auditoría.

### 8.8 Egresos (`features/finances/expenses`) — ruta `/expenses`, Gerente + Administrador + Cajero

Registro de los **gastos pagados desde la caja** de una sucursal. Cada egreso tiene categoría, descripción (máx. 500 caracteres), monto, URL de comprobante opcional, quién lo registró, y queda **vinculado al turno de caja** en el que se registró. Las categorías son fijas en el backend (`ExpenseCategoryEnum`: servicios, personal, insumos, mantenimiento, otros), pero se consultan por API porque cada una tiene un `id` (UUID) propio en base de datos.

Reparto de responsabilidades por rol:

| Acción | Cajero | Administrador | Gerente |
|---|---|---|---|
| Registrar egreso | Sí (solo con turno abierto) | No | No |
| Ver listado | Su sucursal | Su sucursal | Elige sucursal |
| Ver detalle / editar / eliminar | No (el backend responde 403) | Sí | Sí |
| Reporte por período | No | Su sucursal | Elige sucursal |

- **Registro**: el cajero no envía sucursal ni turno; el backend los resuelve a partir del token y del turno abierto. Sin turno abierto, el botón "Registrar" queda deshabilitado (y el backend respondería `shifts.NOT_OPEN`).
- **Edición**: se hace con `PUT` completo — el backend no acepta actualización parcial, así que siempre se envían los cuatro campos. La eliminación es definitiva (*hard delete*).
- **Listado**: tabla paginada con filtros de categoría, rango de fechas y búsqueda; el orden lo fija el backend (más reciente primero). Solo existe un endpoint por sucursal, por lo que el Gerente debe elegir una sucursal antes de ver datos.
- **Reporte** (`ExpenseReportView`): total de egresos, cantidad y desglose por categoría para un rango de fechas. Requiere sucursal + fechas; el backend responde `LOCATION_ID_REQUIRED` si falta la sucursal.

### 8.9 Nómina (`features/finances/payroll`) — ruta `/payroll`, Gerente + Administrador + Cajero

Registro de los **pagos de sueldo** a trabajadores, que en este negocio se pagan **por día** desde la caja. Cada pago guarda nombre del empleado (y su `id` si es un usuario del sistema), descripción del cargo, monto, notas, sucursal, turno y quién lo registró. Además, cada pago **genera automáticamente un egreso** de categoría "Personal" (el DTO devuelve el `expense` asociado), de modo que la nómina se refleja también en el reporte de egresos.

Componentes principales:

- **Hoja de pago** (`pay-sheet`): lista de trabajadores activos de la sucursal con su **sueldo diario** configurado, sus cargos y si ya se les pagó hoy (informativo, no bloquea un segundo pago).
- **Pago masivo** (`BatchPayrollModal`, Cajero): parte de la hoja de pago, con todos los trabajadores marcados y el monto sugerido igual al sueldo diario; el cajero desmarca a quien no trabajó y ajusta montos. Se envía en una sola transacción (hasta 200 pagos): si un pago falla, se revierte todo el lote.
- **Pago individual** (`CreatePayrollModal`, Cajero): para pagos sueltos, incluso a personas que no son usuarios del sistema (solo nombre).
- **Sueldos** (`PayrollWagesView`, Administrador/Gerente): edición del sueldo diario de cada trabajador en una sucursal (`PATCH /users/:id/locations/:locationId/wage`). El sueldo es por sucursal: un mismo usuario puede tener sueldos distintos en distintas sucursales.
- **Listado**: el Cajero ve los pagos del **turno activo**; Administrador y Gerente ven una tabla paginada con búsqueda y rango de fechas (el Gerente puede filtrar por sucursal o ver todas, con la sucursal en cada fila).
- **Reporte** (Administrador/Gerente): total pagado y desglose por empleado en un período. A diferencia de egresos, el Gerente puede omitir la sucursal y obtener el consolidado de todas.

### 8.10 Módulos definidos pero aún no implementados

Las rutas y el menú ya contemplan los siguientes módulos, actualmente como *placeholders* (`<div>...</div>`): **Dashboard** (indicadores generales), **Reportes** y **Caja** (cierre/arqueo de turno — la apertura de turno sí está implementada dentro del POS, y hoy no existe un hook para cerrar el turno). Existen enums ya definidos (`ShiftStatusEnum`, `InvoiceStatusEnum`), lo que indica que su modelo de datos ya fue anticipado aunque la interfaz todavía no se construyó. La facturación del POS (sección 8.6) también está pendiente.

---

## 9. Convenciones transversales relevantes para la documentación

- **Envelope de API uniforme**: toda respuesta del backend sigue la forma `{ code, message, data?, meta? }` (`ApiResponse<T>`), y los errores `{ code, errorCode, message, errors[], timestamp, path }` (`ApiErrorResponse`), lo que permite que el interceptor de errores y los hooks genéricos traten cualquier endpoint de la misma manera.
- **Auditoría uniforme**: las entidades relevantes incluyen un bloque `audit` (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`), reutilizado en toda la UI para mostrar "última actualización".
- **Manejo de errores de dominio**: el backend puede enviar códigos de error específicos de negocio (p. ej. `INSUFFICIENT_STOCK`, `ALERT_WRONG_LOCATION`, `LOCATION_ID_REQUIRED`), que el frontend traduce a mensajes curados en español en vez de mostrar el mensaje técnico crudo.
- **Internacionalización parcial**: existe un diccionario en español (`src/locales/es`) usado sobre todo para mensajes de validación de formularios, organizado por dominio (auth, users, catalog, inventory, supplies, etc.).
- **Confirmaciones de doble clic**: las acciones destructivas o sensibles (desactivar sucursal, desactivar usuario, cancelar pedido) usan un patrón de confirmación por doble clic con expiración corta, en vez de un modal de confirmación aparte.

---

## 10. Estado actual y observaciones técnicas

### 10.1 Resumen de avance por módulo

| Módulo | Ruta | Estado |
|---|---|---|
| Login + selección/cambio de sucursal | `/login` | Implementado |
| Usuarios | `/users` | Implementado |
| Sucursales | `/locations` | Implementado |
| Catálogo (productos, categorías, modificadores) | `/catalog/*` | Implementado |
| Inventario | `/inventory` | Implementado |
| Insumos y recetas | `/ingredients` | Implementado |
| POS (turno, carrito, pago, ticket) | `/pos` | Implementado (factura pendiente) |
| Pedidos | `/orders` | Implementado |
| Ventas | `/sales` | Implementado |
| Egresos | `/expenses` | Implementado |
| Nómina | `/payroll` | Implementado |
| Dashboard | `/dashboard` | Placeholder |
| Reportes | `/reports` | Placeholder |
| Caja (cierre/arqueo) | `/shifts` | Placeholder |

### 10.2 Observaciones detectadas en el código

- **Bucle de redirección posible para el Cajero**: `RoleRoute` redirige a `/dashboard` cuando el rol no está permitido, pero `/dashboard` tampoco admite al Cajero, así que un Cajero que entre a una ruta no autorizada (p. ej. `/users`) queda redirigiendo a `/dashboard` indefinidamente. Convendría redirigir a una ruta segura según el rol (como hace `RoleBasedRedirect`).
- **Destino inicial inconsistente para el Cajero**: tras el login se le envía a `/pos`, pero al entrar a la raíz `/` `RoleBasedRedirect` lo envía a `/shifts`, que hoy es un placeholder.
- **Sin cierre de turno**: el turno de caja se abre desde el POS pero no hay hook ni pantalla para cerrarlo; como cambiar de sucursal exige cerrar el turno, hoy el Cajero no puede cambiar de sucursal desde la interfaz una vez abierto un turno.
- **Restos de la plantilla de Vite**: `src/App.tsx`, `src/App.css` y el `README.md` son los de la plantilla inicial y no se usan (la entrada real es `main.tsx` → `AppRouter`).
- **Dependencias sin uso**: `react-hook-form` y `@hookform/resolvers` siguen en `package.json` aunque el proyecto usa Formik + Zod. Conviven además dos librerías de fechas (`react-datepicker` y `react-day-picker`).
- **Archivo con errata**: `features/catalog/categories/dto/cateogory.dto.ts` y `forms/category.fom.ts` tienen el nombre mal escrito.
- **Sin tests**: el proyecto no tiene pruebas automatizadas ni script `test`.

---

## 11. Resumen de valor para la memoria del proyecto

Este frontend ejemplifica varios principios de arquitectura de software aplicables a la documentación de un proyecto de grado:

- **Arquitectura por dominio (feature-based)** en lugar de por capa técnica, facilitando la escalabilidad y el mantenimiento independiente de cada módulo de negocio.
- **Separación estricta de responsabilidades** entre transporte de datos (DTO), modelo de dominio de UI (model) y transformación explícita (mapper), lo que aísla el resto de la aplicación de cambios en el contrato del backend.
- **Control de acceso en dos niveles** (autenticación + autorización por rol) implementado como *guards* de enrutamiento declarativos, reutilizables y combinables.
- **Modelo multi-sucursal como eje transversal**: casi todas las entidades de negocio (stock, ventas, pedidos, turnos) están particionadas por sucursal, y el propio modelo de sesión refleja que el rol de un usuario puede variar según la sucursal en la que trabaje.
- **Consistencia de patrones** (hooks de datos, validación, componentes de formulario, manejo de errores) que reduce la duplicación de código y facilita la incorporación de nuevas funcionalidades siguiendo las convenciones ya establecidas.

---

*Documento generado a partir del análisis del código fuente del repositorio (rama `develop`, commit `056eadd`), actualizado en octubre de 2026.*
