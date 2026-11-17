# Guía para generar los gráficos y métricas del frontend

Esta guía explica, paso a paso, cómo obtener cada gráfico o métrica, de dónde salen los datos y dónde ponerlos en `DOCUMENTACION_SISTEMA.md` o en el documento de la tesis.

| # | Gráfico / métrica | Herramienta | Tiempo aprox. | Dónde va |
|---|---|---|---|---|
| 1 | Diagramas del sistema como imagen | Mermaid | 15 min | Capítulos de análisis y diseño |
| 2 | Cobertura de pruebas (caja blanca) | Vitest + Excel/Sheets | 15 min | Sección 12.5 |
| 3 | Resultados de los casos de prueba (caja negra) | Excel/Sheets | 1–2 h (incluye ejecutar los casos) | Secciones 12.4 y 12.6 |
| 4 | Rendimiento, accesibilidad y buenas prácticas | Lighthouse (Chrome) | 30 min | Nueva sección 12.7 |
| 5 | Tamaño del bundle | `npm run analyze` | 10 min | Sección 12.7 |
| 6 | Usabilidad (escala SUS) | Google Forms + Sheets | 1 día (depende de los usuarios) | Sección 12.7 / capítulo de resultados |
| 7 | Tiempos de respuesta (opcional) | DevTools → Network | 20 min | Sección 12.7 |

---

## 1. Diagramas del sistema como imagen

Los 11 diagramas ya están escritos en Mermaid dentro de `DOCUMENTACION_SISTEMA.md` y también como archivos sueltos en `docs/diagramas/*.mmd`:

| Archivo | Diagrama | Sección del documento |
|---|---|---|
| `01-componentes.mmd` | Componentes | 2.4 |
| `02-despliegue.mmd` | Despliegue | 2.5 |
| `03-secuencia-login.mmd` | Secuencia: inicio de sesión | 4.5 |
| `04-secuencia-refresh-token.mmd` | Secuencia: renovación del token | 4.5 |
| `05-secuencia-venta-pos.mmd` | Secuencia: venta en el POS | 9.8 |
| `06-estados-pedido.mmd` | Estados del pedido | 9.9 |
| `07-estados-turno.mmd` | Estados del turno | 9.12 |
| `08-actividad-cierre-caja.mmd` | Actividad: cierre y aprobación de caja | 9.12 |
| `09-estados-venta-offline.mmd` | Estados de una venta offline | 9.16 |
| `10-secuencia-venta-offline.mmd` | Secuencia: venta offline y sincronización | 9.16 |
| `11-casos-de-uso.mmd` | Casos de uso | 11.3 |

**Para verlos:** GitHub los muestra como imagen automáticamente al abrir el `.md`. En VS Code instala la extensión **Markdown Preview Mermaid Support** y abre la vista previa (`Ctrl+Shift+V`).

**Para exportarlos a PNG o SVG (para Word o PDF de la tesis), elige una opción:**

- **Opción A — web, sin instalar nada:**
  1. Entra a <https://mermaid.live>.
  2. Pega el contenido de un `.mmd` en el panel izquierdo.
  3. Si sale un error, el panel lo indica con la línea; corrígelo ahí y también en el archivo.
  4. En *Actions* elige **PNG** (o **SVG** si el documento lo admite; se ve nítido a cualquier tamaño).
- **Opción B — línea de comandos, todos de una vez** (descarga Chromium la primera vez):
  ```bash
  cd docs/diagramas
  for f in *.mmd; do npx -y @mermaid-js/mermaid-cli -i "$f" -o "${f%.mmd}.png" -s 2 -b white; done
  ```

**Consejos para la tesis:** exporta con fondo blanco, numera las figuras ("Figura 3.2 — Diagrama de secuencia del inicio de sesión") y pon debajo de cada una un párrafo corto explicando qué muestra. Si cambias un diagrama, cámbialo en el `.md` y en el `.mmd` para que no queden distintos.

---

## 2. Gráfico de cobertura de pruebas (caja blanca)

**Datos:**
```bash
npm run test:coverage
```
Genera:
- `coverage/index.html`: reporte navegable, con las líneas cubiertas en verde y las no cubiertas en rojo.
- `coverage/coverage-summary.json`: los porcentajes por archivo, para graficar.

Los valores actuales ya están en la tabla de la sección 12.5.

**Gráfico recomendado — barras horizontales agrupadas:**
1. En Excel o Google Sheets copia la tabla de la sección 12.5: una fila por módulo y columnas *Sentencias* y *Ramas*.
2. Insertar → Gráfico → **Barras agrupadas (horizontales)**.
3. Eje X de 0 a 100 %. Agrega una línea de referencia en 70 % (meta) con una serie extra de tipo línea, o dibújala.
4. Título: "Cobertura de pruebas unitarias por módulo".
5. Exporta como imagen y ponla en la sección 12.5, debajo de la tabla.

**Captura complementaria:** abre `coverage/index.html` en el navegador y haz una captura de la tabla principal (muestra las barras de colores por archivo). Sirve como evidencia.

---

## 3. Resultados de los casos de prueba (caja negra)

1. **Ejecuta los casos** CP-01 a CP-40 (secciones 12.4 y 12.6) sobre la app con el backend levantado. Usa usuarios de cada rol.
2. En la columna **Estado** cambia ⏳ por ✅ o ❌. Si alguno falla, anota qué pasó y, cuando lo corrijas, vuelve a ejecutarlo.
3. Guarda capturas de pantalla de los casos más representativos (por ejemplo CP-14, CP-18, CP-20, CP-22 y CP-31) para un anexo de evidencias.
4. **Gráficos** (en Excel o Sheets, copiando las tablas):
   - **Barras apiladas por técnica** (PE, VL, TD, TE, ES): cuántos casos aprobados y cuántos fallidos en cada una.
   - **Barras por módulo** (Autenticación, Catálogo, POS, Offline, WhatsApp, Turnos, Finanzas): cantidad de casos por módulo. Muestra que se cubrieron todos.
   - **Indicador global:** "40 de 40 casos aprobados (100 %)" o el número que salga.
5. Pon los gráficos en la sección 12.6, después de las tablas.

---

## 4. Lighthouse: rendimiento, accesibilidad y buenas prácticas

Lighthouse viene incluido en Google Chrome. **Siempre mide el build de producción**, nunca `npm run dev`, porque el modo desarrollo es mucho más lento y no es representativo.

**Preparación:**
1. Levanta el backend.
2. En el frontend:
   ```bash
   npm run build
   npm run preview
   ```
   Abre <http://localhost:4173> en Chrome, en una **ventana de incógnito** (así las extensiones no alteran la medición).
3. Inicia sesión con un cajero para medir el POS, y con un gerente para el Dashboard.

**Medición:**
1. Abre DevTools (`F12`) → pestaña **Lighthouse**.
2. Configura:
   - *Mode*: **Navigation**.
   - *Device*: **Desktop** (el sistema se usa en computadoras de mostrador y oficina).
   - *Categories*: Performance, Accessibility, Best practices. SEO no aplica: es un sistema interno con login.
3. En el engranaje de configuración de Lighthouse **desmarca "Clear storage"**. Si no, borra la sesión y mide la pantalla de login en lugar de la página que quieres.
4. Mide estas páginas, **3 veces cada una**, y anota la **mediana**:
   - `/login`
   - `/pos` (Cajero)
   - `/dashboard` (Gerente)
   - `/sales` (cualquier rol)
5. En cada reporte, menú de los tres puntos → **Save as HTML** (o JSON) y guárdalo en `docs/metricas/lighthouse/` como evidencia.

**Tabla para la documentación** (nueva sección **12.7 Métricas de calidad**):

| Página | Rendimiento | Accesibilidad | Buenas prácticas | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/login` | | | | | | | |
| `/pos` | | | | | | | |
| `/dashboard` | | | | | | | |
| `/sales` | | | | | | | |

Qué significa cada métrica (para explicarlo en el texto):
- **FCP** (*First Contentful Paint*): cuándo aparece el primer contenido. Bueno: < 1,8 s.
- **LCP** (*Largest Contentful Paint*): cuándo se ve el elemento principal. Bueno: < 2,5 s.
- **TBT** (*Total Blocking Time*): cuánto tiempo la página no responde a clics mientras carga. Bueno: < 200 ms.
- **CLS** (*Cumulative Layout Shift*): cuánto "salta" el contenido mientras carga. Bueno: < 0,1.
- Los puntajes van de 0 a 100: verde ≥ 90, naranja 50–89, rojo < 50.

**Gráfico recomendado:** barras agrupadas con una página por grupo y una barra por categoría (Rendimiento, Accesibilidad, Buenas prácticas), eje de 0 a 100 y una línea en 90.

**Si sale algo en rojo o naranja:** el reporte lista las "Oportunidades" y los problemas de accesibilidad concretos (contraste, botones sin nombre, etc.). Corregir 2 o 3 y volver a medir da un antes/después que luce muy bien en la tesis.

---

## 5. Tamaño del bundle

**Generar el treemap:**
```bash
npm run analyze
```
Hace el build de producción y abre `stats.html` (excluido del repositorio): un **treemap** donde cada rectángulo es una librería o carpeta, con un tamaño proporcional a lo que pesa.

1. Arriba a la derecha elige mostrar el tamaño **gzip** (el que realmente se descarga).
2. Haz una captura del treemap completo para la tesis.
3. Pasa el cursor sobre los rectángulos más grandes y anota las 8–10 librerías que más pesan.

**Datos del build actual** (`npm run build`):

| Archivo | Tamaño | Comprimido (gzip) |
|---|---:|---:|
| JavaScript (`index-*.js`) | 1.635,65 kB | 443,41 kB |
| Estilos (`index-*.css`) | 95,10 kB | 16,02 kB |
| `index.html` | 0,47 kB | 0,30 kB |
| **Carpeta `dist/` completa** | ~1,7 MB | — |

**Gráficos recomendados:**
- La captura del treemap.
- Barras horizontales con las 10 dependencias más pesadas (en kB gzip), ordenadas de mayor a menor.

**Hallazgo para la sección de observaciones:** todo el JavaScript sale en **un único archivo** de 1,6 MB (443 kB comprimido), y Vite avisa que supera los 500 kB recomendados. La mejora estándar es la **carga diferida por ruta** (`React.lazy` + `import()` en `Router.tsx`), para que cada pantalla descargue solo su código. Puedes ponerlo como trabajo futuro o implementarlo y mostrar el antes/después del treemap y de Lighthouse.

---

## 6. Usabilidad: escala SUS (*System Usability Scale*)

Es un cuestionario estándar de 10 preguntas que da un puntaje de 0 a 100. Los tribunales lo valoran porque mide al usuario real, no al código.

**Participantes:** mínimo 5, idealmente usuarios reales del restaurante (2–3 cajeros, 1–2 administradores, el gerente).

**Procedimiento:**
1. Pide a cada participante que haga 3–4 tareas reales **sin ayuda**. Por ejemplo:
   - Abrir turno y registrar una venta para llevar con un modificador.
   - Aprobar un pedido de WhatsApp y cobrarlo.
   - Registrar un egreso.
   - Cerrar el turno.

   Anota si la completó y cuánto tardó: es otra métrica útil (tasa de éxito y tiempo por tarea).
2. Al terminar, que responda el cuestionario en **Google Forms**, con una escala del 1 (totalmente en desacuerdo) al 5 (totalmente de acuerdo):
   1. Creo que me gustaría usar este sistema con frecuencia.
   2. Encontré el sistema innecesariamente complejo.
   3. Pensé que el sistema era fácil de usar.
   4. Creo que necesitaría ayuda de una persona técnica para poder usar este sistema.
   5. Encontré que las distintas funciones del sistema estaban bien integradas.
   6. Pensé que había demasiada inconsistencia en el sistema.
   7. Imagino que la mayoría de las personas aprendería a usar este sistema muy rápido.
   8. Encontré el sistema muy difícil de usar.
   9. Me sentí muy seguro usando el sistema.
   10. Necesité aprender muchas cosas antes de poder usar el sistema.

**Cálculo** (en Sheets, por participante):
- Preguntas impares (1, 3, 5, 7, 9): respuesta − 1.
- Preguntas pares (2, 4, 6, 8, 10): 5 − respuesta.
- Suma los 10 valores y multiplica por **2,5**. Resultado: de 0 a 100.
- Fórmula en Sheets, con las respuestas en B2:K2:
  ```
  =((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))*2,5
  ```
  En la configuración regional en inglés, usa `*2.5`.

**Interpretación:** 68 es el promedio de la industria. > 68 es bueno; ≥ 80,3 es excelente; < 51 indica problemas serios.

**Gráfico recomendado:** barras con el puntaje de cada participante, una línea horizontal en 68 (promedio de referencia) y otra con el promedio obtenido. Agrega una tabla con la tasa de éxito y el tiempo promedio por tarea.

---

## 7. Tiempos de respuesta (opcional)

1. Con la app de producción abierta (`npm run preview`), abre DevTools → **Network** → filtro **Fetch/XHR**.
2. Realiza las acciones principales: cargar el menú del POS (`GET /products/menu`), registrar una venta (`POST /orders` + `POST /sales`), cargar el dashboard y sincronizar ventas offline (`POST /sales/offline-sync`).
3. Anota la columna **Time** de cada petición. Repite 5 veces y saca el promedio.
4. **Gráfico:** barras con el tiempo promedio por endpoint, en milisegundos.
5. **Tiempo de sincronización offline:** registra 10 ventas sin conexión, vuelve a conectar y mide con un cronómetro (o con la pestaña Network) cuánto tardan en desaparecer de la cola.

---

## Estructura sugerida para la nueva sección 12.7 del documento

```markdown
### 12.7 Métricas de calidad

#### Rendimiento y accesibilidad (Lighthouse)
(tabla + gráfico de barras + 2 líneas de interpretación)

#### Tamaño del bundle
(tabla de tamaños + captura del treemap + hallazgo del archivo único)

#### Usabilidad (SUS)
(puntaje promedio + gráfico por participante + tasa de éxito por tarea)

#### Tiempos de respuesta
(tabla o gráfico por endpoint)
```

Cada gráfico debe ir con **una o dos frases de interpretación**: qué se midió, qué resultado salió y qué significa. Ejemplo: "El POS obtuvo 92 en rendimiento y 95 en accesibilidad; el LCP de 1,4 s está por debajo del umbral de 2,5 s recomendado por Google."
