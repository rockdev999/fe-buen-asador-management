# Resultados de las pruebas de estrés (API)

Generador de carga y API en la misma máquina, contra una base PostgreSQL aislada (`buen_asador_e2e`). Los valores absolutos dependen del equipo; lo comparable entre corridas son las tendencias y los criterios.

| Dato | Valor |
|---|---|
| Fecha | 23/11/2026, 4:10:52 p. m. |
| Perfil | `standard` |
| Commit | `75a9b4c` |
| Node.js | v22.23.1 |
| Sistema | Windows_NT 10.0.26300 |
| CPU | Intel(R) Core(TM) i5-10300H CPU @ 2.50GHz (8 hilos) |
| RAM | 23.8 GB |
| Duración total | 437 s |

## Resumen

| ID | Escenario | Tipo | Resultado |
|---|---|---|---|
| E1 | Línea base | Carga ligera | ✅ Cumple |
| E2 | Catálogo del POS | Carga creciente (lectura) | ❌ No cumple |
| E3 | Inicio de sesión masivo | Carga creciente (CPU) | ✅ Cumple |
| E4 | Flujo de caja (pedido + cobro) | Carga creciente (escritura transaccional) | ✅ Cumple |
| E5 | Carga mixta escalonada (punto de quiebre) | Estrés hasta el quiebre | ✅ Cumple |
| E6 | Pico repentino y recuperación | Pico (spike) | ✅ Cumple |
| E7 | Integridad bajo concurrencia | Concurrencia (condiciones de carrera) | ✅ Cumple |
| E8 | Ráfaga desde una sola IP | Abuso / denegación de servicio | ✅ Cumple |

**7 de 8 escenarios cumplen los criterios.**

## E1 · Línea base

**Tipo:** Carga ligera  
**Objetivo:** Medir la latencia mínima de la API y la base (GET /health) con carga ligera, como referencia para el resto.

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| base | 10 | 15190 | 755.6 | 13.2 | 11.9 | 18.1 | 21.2 | 33.1 | 323.3 | 0.00 % |

Códigos HTTP (última etapa): 200: 15190

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Tasa de error · Total | ≤ 0.00 % | 0.00 % (0/15190) | ✅ |
| Latencia p95 · Total | ≤ 100 ms | 21.2 ms | ✅ |

## E2 · Catálogo del POS

**Tipo:** Carga creciente (lectura)  
**Objetivo:** Comprobar que la consulta más frecuente del POS (menú de la sucursal) mantiene la latencia al aumentar los usuarios.

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 VU | 10 | 6415 | 320.2 | 31.2 | 29.7 | 38.7 | 43 | 57.2 | 132.4 | 0.00 % |
| 50 VU | 50 | 5943 | 294.3 | 169.2 | 149.4 | 255.1 | 302.7 | 378.2 | 458.1 | 0.00 % |
| 100 VU | 100 | 3192 | 158.1 | 630.3 | 539.2 | 1215.9 | 1428 | 1672.5 | 1853 | 0.00 % |

Códigos HTTP (última etapa): 200: 3192

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Tasa de error · Total | ≤ 1.00 % | 0.00 % (0/3192) | ✅ |
| Latencia p95 · Total | ≤ 500 ms | 1428 ms | ❌ |
| Sin errores 5xx ni de red · Total | 0 | 0 | ✅ |

- Las verificaciones se aplican a la etapa de mayor carga (100 VU).

## E3 · Inicio de sesión masivo

**Tipo:** Carga creciente (CPU)  
**Objetivo:** Evaluar el login en dos pasos con muchos usuarios a la vez. bcrypt consume CPU del único hilo de Node: es el cuello de botella esperado.

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 VU | 5 | 1752 | 87.2 | 57.2 | 65.8 | 94 | 102.1 | 147.6 | 220.2 | 0.00 % |
| 20 VU | 20 | 2028 | 99.5 | 199.2 | 179.1 | 408.1 | 430.7 | 520.9 | 2462.6 | 0.00 % |
| 40 VU | 40 | 1958 | 93.8 | 417.3 | 189.1 | 872.6 | 901.5 | 942 | 5085 | 0.00 % |

<details><summary>Detalle por operación</summary>

| Etapa | Operación | Peticiones | p50 | p95 | p99 | Error | Códigos |
|---|---|---:|---:|---:|---:|---:|---|
| 5 VU | `POST /auth/login` | 876 | 85.1 | 113.3 | 174 | 0.00 % | 200: 876 |
| 5 VU | `POST /auth/select-location` | 876 | 24.7 | 41.4 | 62.5 | 0.00 % | 200: 876 |
| 20 VU | `POST /auth/login` | 1014 | 353.5 | 459.3 | 1196.4 | 0.00 % | 200: 1014 |
| 20 VU | `POST /auth/select-location` | 1014 | 25.8 | 65 | 191.4 | 0.00 % | 200: 1014 |
| 40 VU | `POST /auth/login` | 979 | 806.1 | 919.9 | 962.2 | 0.00 % | 200: 979 |
| 40 VU | `POST /auth/select-location` | 979 | 26.1 | 66.4 | 187.3 | 0.00 % | 200: 979 |

</details>

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Tasa de error · Total | ≤ 1.00 % | 0.00 % (0/1958) | ✅ |
| Latencia p95 · POST /auth/login | ≤ 2000 ms | 919.9 ms | ✅ |
| Sin errores 5xx ni de red · Total | 0 | 0 | ✅ |

- Cada IP tiene un límite de 5 logins cada 15 min: la prueba usa una IP distinta por petición para simular usuarios distintos.

## E4 · Flujo de caja (pedido + cobro)

**Tipo:** Carga creciente (escritura transaccional)  
**Objetivo:** Someter la operación crítica del negocio, crear un pedido y cobrarlo, a cajeros concurrentes en las tres sucursales. El cobro bloquea el pedido y el turno (pessimistic_write).

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 VU | 10 | 932 | 45.8 | 218 | 207.2 | 329.1 | 382.7 | 487 | 616 | 0.00 % |
| 25 VU | 25 | 1216 | 58.6 | 421.3 | 406 | 535.6 | 595.5 | 682.2 | 767.5 | 0.00 % |
| 50 VU | 50 | 1354 | 64.2 | 765 | 754.5 | 982.2 | 1041.2 | 1173 | 1239.1 | 0.00 % |

<details><summary>Detalle por operación</summary>

| Etapa | Operación | Peticiones | p50 | p95 | p99 | Error | Códigos |
|---|---|---:|---:|---:|---:|---:|---|
| 10 VU | `POST /orders` | 466 | 146.7 | 275.4 | 359.4 | 0.00 % | 201: 466 |
| 10 VU | `POST /sales` | 466 | 255.4 | 426.2 | 570.2 | 0.00 % | 201: 466 |
| 25 VU | `POST /orders` | 608 | 403.4 | 581.1 | 659.6 | 0.00 % | 201: 608 |
| 25 VU | `POST /sales` | 608 | 409 | 612.5 | 682.7 | 0.00 % | 201: 608 |
| 50 VU | `POST /orders` | 677 | 828.4 | 1091.3 | 1210.3 | 0.00 % | 201: 677 |
| 50 VU | `POST /sales` | 677 | 707.6 | 1001.1 | 1036.3 | 0.00 % | 201: 677 |

</details>

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Tasa de error · Total | ≤ 1.00 % | 0.00 % (0/1354) | ✅ |
| Sin errores 5xx ni de red · Total | 0 | 0 | ✅ |
| Latencia p95 · POST /orders | ≤ 1500 ms | 1091.3 ms | ✅ |
| Latencia p95 · POST /sales | ≤ 1500 ms | 1001.1 ms | ✅ |

- Los cajeros de una misma sucursal comparten turno: los cobros de esa sucursal se serializan en el bloqueo del turno.

## E5 · Carga mixta escalonada (punto de quiebre)

**Tipo:** Estrés hasta el quiebre  
**Objetivo:** Aumentar por escalones una mezcla realista de operaciones hasta que la API deja de cumplir los límites, para hallar su capacidad máxima.

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 VU | 10 | 2086 | 103.3 | 96.5 | 64.1 | 201.6 | 225.3 | 298.8 | 449.6 | 0.00 % |
| 25 VU | 25 | 1923 | 94.2 | 262.9 | 276.6 | 413 | 452.2 | 532.4 | 597.5 | 0.00 % |
| 50 VU | 50 | 1901 | 91.6 | 534.9 | 505.9 | 848.7 | 954.5 | 1188.7 | 1572.8 | 0.00 % |
| 100 VU | 100 | 2246 | 105.1 | 918.3 | 832.1 | 1373.2 | 1678.7 | 2104.2 | 2983.3 | 0.00 % |
| 150 VU | 150 | 2131 | 95.8 | 1486.1 | 1367.4 | 2241.4 | 2475.7 | 3385 | 3708 | 0.00 % |
| 200 VU | 200 | 2225 | 95.4 | 1935.8 | 1795.3 | 3037.2 | 3272.9 | 4658.2 | 5016.6 | 0.00 % |

<details><summary>Detalle por operación</summary>

| Etapa | Operación | Peticiones | p50 | p95 | p99 | Error | Códigos |
|---|---|---:|---:|---:|---:|---:|---|
| 10 VU | `GET /orders?status=READY` | 242 | 29.7 | 46.5 | 53.7 | 0.00 % | 200: 242 |
| 10 VU | `GET /products/menu` | 779 | 32.6 | 50.9 | 71.7 | 0.00 % | 200: 779 |
| 10 VU | `POST /orders` | 489 | 116.7 | 172.1 | 226.9 | 0.00 % | 201: 489 |
| 10 VU | `POST /sales` | 489 | 193.8 | 287.6 | 388 | 0.00 % | 201: 489 |
| 10 VU | `GET /finances/reports/dashboard` | 87 | 65.7 | 98 | 108.8 | 0.00 % | 200: 87 |
| 25 VU | `GET /orders?status=READY` | 216 | 112.2 | 169.2 | 226.6 | 0.00 % | 200: 216 |
| 25 VU | `GET /products/menu` | 703 | 154.9 | 232.8 | 281.5 | 0.00 % | 200: 703 |
| 25 VU | `POST /orders` | 464 | 354.2 | 472.6 | 538.2 | 0.00 % | 201: 464 |
| 25 VU | `GET /finances/reports/dashboard` | 76 | 405.3 | 564.1 | 591.2 | 0.00 % | 200: 76 |
| 25 VU | `POST /sales` | 464 | 365.1 | 475.6 | 550.6 | 0.00 % | 201: 464 |
| 50 VU | `GET /orders?status=READY` | 234 | 248.8 | 438.5 | 485 | 0.00 % | 200: 234 |
| 50 VU | `GET /products/menu` | 701 | 382.4 | 620.9 | 711.2 | 0.00 % | 200: 701 |
| 50 VU | `POST /orders` | 450 | 713.4 | 1058.8 | 1194.2 | 0.00 % | 201: 450 |
| 50 VU | `GET /finances/reports/dashboard` | 66 | 914.6 | 1430.5 | 1572.8 | 0.00 % | 200: 66 |
| 50 VU | `POST /sales` | 450 | 579.7 | 863.2 | 931.4 | 0.00 % | 201: 450 |
| 100 VU | `GET /orders?status=READY` | 266 | 483.2 | 660 | 955.5 | 0.00 % | 200: 266 |
| 100 VU | `GET /products/menu` | 869 | 713.6 | 932.1 | 1256.4 | 0.00 % | 200: 869 |
| 100 VU | `POST /orders` | 515 | 1273.5 | 1754.8 | 2184.1 | 0.00 % | 201: 515 |
| 100 VU | `GET /finances/reports/dashboard` | 81 | 1899.1 | 2521.3 | 2983.3 | 0.00 % | 200: 81 |
| 100 VU | `POST /sales` | 515 | 905.2 | 1351.6 | 1413.2 | 0.00 % | 201: 515 |
| 150 VU | `GET /orders?status=READY` | 244 | 819.7 | 1026.3 | 1236.4 | 0.00 % | 200: 244 |
| 150 VU | `GET /products/menu` | 789 | 1239.3 | 1519.6 | 1563.1 | 0.00 % | 200: 789 |
| 150 VU | `POST /orders` | 511 | 2149.1 | 2500 | 2561 | 0.00 % | 201: 511 |
| 150 VU | `GET /finances/reports/dashboard` | 76 | 3279.7 | 3692.7 | 3708 | 0.00 % | 200: 76 |
| 150 VU | `POST /sales` | 511 | 1450.5 | 1689.2 | 1767.9 | 0.00 % | 201: 511 |
| 200 VU | `GET /orders?status=READY` | 250 | 1102.9 | 1502.1 | 1809.3 | 0.00 % | 200: 250 |
| 200 VU | `GET /products/menu` | 872 | 1674.1 | 2058.1 | 2172 | 0.00 % | 200: 872 |
| 200 VU | `POST /orders` | 515 | 2848.5 | 3288.3 | 3378.1 | 0.00 % | 201: 515 |
| 200 VU | `GET /finances/reports/dashboard` | 73 | 4525.3 | 4985.8 | 5016.6 | 0.00 % | 200: 73 |
| 200 VU | `POST /sales` | 515 | 1916.2 | 2289.1 | 2417.3 | 0.00 % | 201: 515 |

</details>

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Capacidad sostenida (error ≤ 1 % y p95 ≤ límite) | ≥ 50 VU (p95 ≤ 1000 ms) | 50 VU | ✅ |
| La API sigue respondiendo en la etapa más alta | sin errores de red | 0 errores de red | ✅ |

- Mezcla: 50 % menú, 30 % pedido + cobro, 15 % pedidos listos, 5 % dashboard.
- Rendimiento máximo observado: 105.1 peticiones/s.
- Punto de quiebre: a partir de 100 VU (p95 1678.7 ms, error 0.00 %).

## E6 · Pico repentino y recuperación

**Tipo:** Pico (spike)  
**Objetivo:** Pasar de golpe de carga baja a muy alta (hora punta) y comprobar que, al bajar la carga, la API vuelve a la latencia normal sin quedar degradada.

| Etapa | VU | Peticiones | Pet/s | Prom. ms | p50 | p90 | p95 | p99 | Máx. | Error |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| antes | 10 | 941 | 92.5 | 107.1 | 85.3 | 226.4 | 260.6 | 331.3 | 442.5 | 0.00 % |
| pico | 200 | 1724 | 100.2 | 1834.5 | 1745 | 2805.1 | 3245.6 | 3382.8 | 3479.2 | 0.00 % |
| recuperación | 10 | 965 | 94.3 | 105 | 56.9 | 233.6 | 261.5 | 339 | 403.9 | 0.00 % |

<details><summary>Detalle por operación</summary>

| Etapa | Operación | Peticiones | p50 | p95 | p99 | Error | Códigos |
|---|---|---:|---:|---:|---:|---:|---|
| antes | `GET /products/menu` | 469 | 33.9 | 55.1 | 66.5 | 0.00 % | 200: 469 |
| antes | `POST /orders` | 236 | 128.7 | 200.5 | 259.7 | 0.00 % | 201: 236 |
| antes | `POST /sales` | 236 | 214.2 | 327.4 | 381.1 | 0.00 % | 201: 236 |
| pico | `GET /products/menu` | 928 | 1632.5 | 2090.9 | 2155.6 | 0.00 % | 200: 928 |
| pico | `POST /orders` | 398 | 2778.5 | 3382.5 | 3448.8 | 0.00 % | 201: 398 |
| pico | `POST /sales` | 398 | 1845 | 2295.8 | 2632.9 | 0.00 % | 201: 398 |
| recuperación | `GET /products/menu` | 507 | 33.1 | 56.7 | 81 | 0.00 % | 200: 507 |
| recuperación | `POST /orders` | 229 | 126.8 | 201.5 | 233.9 | 0.00 % | 201: 229 |
| recuperación | `POST /sales` | 229 | 219.3 | 327.9 | 385.2 | 0.00 % | 201: 229 |

</details>

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Sin errores 5xx ni de red · Total | 0 | 0 | ✅ |
| Recuperación: p95 después del pico | ≤ 2 × p95 previo (≤ 521.2 ms) | 261.5 ms | ✅ |
| Tasa de error · recuperación | ≤ 1.00 % | 0.00 % (0/965) | ✅ |

- Durante el pico: p95 3245.6 ms, 100.2 pet/s, error 0.00 %.

## E7 · Integridad bajo concurrencia

**Tipo:** Concurrencia (condiciones de carrera)  
**Objetivo:** Verificar que los bloqueos de la base evitan resultados incorrectos cuando muchas peticiones modifican el mismo dato al mismo tiempo.

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| Cobro doble: 20 cobros simultáneos del mismo pedido (× 10 pedidos) | exactamente 1 venta por pedido, sin 5xx | 10/10 pedidos con 1 venta · 0 respuestas 5xx | ✅ |
| Ajustes simultáneos: 100 × ADD 1 al mismo stock | stock = 0 + ajustes aceptados | aceptados 100 · stock 0 → 100 | ✅ |
| Ventas simultáneas: 50 cobros del mismo producto cuantificable | stock = 100 − ventas registradas | ventas 50 · stock 100 → 50 | ✅ |

- Las peticiones de cada ráfaga se disparan a la vez, sin esperar respuesta, para forzar la competencia por la misma fila.

## E8 · Ráfaga desde una sola IP

**Tipo:** Abuso / denegación de servicio  
**Objetivo:** Comprobar que el limitador por IP corta una ráfaga abusiva con 429 y que la API sigue atendiendo a los demás clientes.

| Criterio | Esperado | Obtenido | Resultado |
|---|---|---|---|
| 300 peticiones simultáneas desde la misma IP | la mayoría recibe 429 | 290 × 429 · 10 × 200 | ✅ |
| Sin errores 5xx durante la ráfaga | 0 | 0 | ✅ |
| Otros clientes (IP distinta) durante la ráfaga | 20/20 con 200 | 20/20 | ✅ |

- Límite global: 10 peticiones/s y 200/min por IP (THROTTLE_SHORT_LIMIT, THROTTLE_MEDIUM_LIMIT).
