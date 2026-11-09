# Pendientes del proyecto

Dos partes: el **plan de trabajo** (qué se construye y en qué orden) y los **pendientes de decisión** (preguntas abiertas que no son tareas de código).

Un paso o pendiente que necesita más explicación (contexto, alternativas, plan) tiene su página en `docs/pendientes/<id>-<tema>.md`, enlazada desde la tabla con «Detalle». Cada página corresponde a una tarea, como lo será en Notion (X-12).

## Plan de trabajo

Orden acordado el 2026-11-08. Cada paso de código nace de un issue y entra por un PR (FLU-01, FLU-05); al cerrarlo se anotan aquí el issue, el PR y el estado. Las vistas usan **cifras ilustrativas** hasta que se conecten los datos reales (ver *Datos ilustrativos* abajo).

Estados: **Hecho** · **En curso** · **Siguiente** · **Pendiente** · **Bloqueado** (con el pendiente que lo bloquea).

### Base y documentación

| ID | Paso | Etapa | Depende de | Issue | PR | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 | Entorno local de desarrollo | — | — | #1 | #3 | Hecho |
| T-02 | Mockups aprobados (8 pantallas) | — | — | #2 | #4 | Hecho |
| T-03 | Guía del flujo de trabajo del equipo | — | — | #5 | #6 | Hecho |
| T-04 | Plan de trabajo y cambio de etapas (público pasa a 1.1) | — | — | #7 | #10 | Hecho |
| T-20 | Página de referencias: qué significa cada ID (reglas, pasos del plan, pendientes y decisiones), generada por script y buscable en MkDocs | — | T-04 | #9 | #11 | Hecho |

### Construcción visual con cifras ilustrativas

| ID | Paso | Etapa | Depende de | Issue | PR | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| T-05 | Estructura base del frontend: componentes base (tarjeta, indicador, contenedor de gráfico con el tema de ECharts, aviso «Cifras ilustrativas», selector de producto) y módulo de datos ilustrativos | 1 y 1.1 | T-04 | #8 | #12 | Hecho |
| T-06 | Portal público: inicio (escritorio y móvil) | 1.1 | T-05 | #13 | #14 | Hecho |
| T-07 | Modo pantalla: tableros de energía eléctrica, gas natural, comparar proyecciones y el sistema hoy, con acceso desde el portal | 1.1 | T-05 | #15 | — | En curso |
| T-21 | Modo pantalla: tablero de variables exógenas | 1.1 | T-07 | — | — | Bloqueado (X-06, sin mockup) |
| T-08 | App interna: encabezado, selector de producto y menú lateral (LAY-06, LAY-07) | 1 | T-05 | — | — | Pendiente |
| T-09 | Tablero ejecutivo | 1 | T-08 | — | — | Pendiente |
| T-10 | Histórico de revisiones | 1 | T-08 | — | — | Pendiente |
| T-11 | Monitor de variables exógenas | 1 | T-08 | — | — | Pendiente |
| T-12 | Proyección vs. real | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |
| T-13 | Comparar revisiones | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |
| T-14 | Usuarios y roles | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |

### Datos reales (en paralelo)

| ID | Paso | Etapa | Depende de | Issue | PR | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| T-15 | Reunir archivos de revisiones, series reales y exógenas, y decidir desde qué revisión cargar | 1 | — | — | — | En curso (X-01, X-02) |
| T-16 | Tablas `raw`/`staging` y ajustes al modelo de datos según lo que pidan las vistas | 1 | T-15 | — | — | Pendiente |
| T-17 | Flujos de carga (Prefect) | 1 | T-16 | — | — | Pendiente |
| T-18 | Endpoints de la API y conexión de cada vista a datos reales; retirar las cifras ilustrativas | 1 y 1.1 | T-17 | — | — | Pendiente |
| T-19 | Vistas `publicacion.*` para el portal y el modo pantalla | 1.1 | T-18 | — | — | Bloqueado (X-04) |

### Datos ilustrativos

Decisión del 2026-11-08 para la construcción visual:

- Los datos de ejemplo van **en el código del frontend**, en un solo módulo (`frontend/src/demo/`), con los tipos que se esperan de la API. **No** se crean tablas de prueba: el modelo de datos se ajusta cuando se conozcan los datos reales (T-16), y unas tablas de prueba se tendrían que diseñar, migrar y luego borrar.
- Las vistas leen esos datos con las mismas funciones con las que leerán la API, de modo que al conectar los datos reales (T-18) solo cambia ese módulo.
- Toda vista con datos de ejemplo muestra el aviso «Cifras ilustrativas» (CON-07).
- Cada vista anota en su PR qué campos necesitó; esa lista alimenta T-16.

## Pendientes de decisión

Los pendientes generales (servidores, Keycloak, DVC, Prefect vs. Dagster, Google Chat, aprobación de PR, revisión automática, publicación de documentación…) están en `PENDIENTES.md` de `upme-estandares`.

| ID | Tema | Qué falta | Responsable | Estado |
| --- | --- | --- | --- | --- |
| X-01 | Fuentes y formatos | Reunir archivos de revisiones pasadas, series reales y exógenas; definir tablas `raw`/`staging` | Equipo | Abierto |
| X-02 | Histórico | Desde qué revisión cargar (EE y GN) | Líder | Abierto |
| X-03 | Umbrales de error | Umbrales aceptables por producto y horizonte para alertas | Subdirectora | Abierto |
| X-04 | Publicación | Qué desagregaciones son públicas (regional, sectorial, horaria) | Líder + jurídica | Abierto |
| X-05 | Aprobación de revisiones | Quién aprueba formalmente y con qué acto administrativo. El mockup aprobado de ejecutar proyección asume doble aprobación (líder técnico y Subdirectora): confirmarlo o ajustar el mockup | Subdirectora | Abierto |
| X-06 | Aprobación de mockups | 8 pantallas aprobadas el 2026-11-08 (`docs/tecnica/mockups/`). Faltan mockups de proyección vs. real, comparar revisiones, usuarios y roles, inicio de la app, ingresar, alertas y datos y documentación (FLU-03) | Líder | Parcial |
| X-07 | Catálogo de notificaciones | Confirmar eventos y espacios de Google Chat para la etapa 1.2 | Líder | Planeado (1.2) |
| X-08 | Migración de modelos | Plan de migración de MATLAB a Python y modelos sin ruta definida | Equipo de modelos | Planeado (fase 2) |
| X-09 | Corrección de revisiones | Agregar estado `superseded` y columna `supersedes_id` en `core.revisions` para enlazar una revisión corregida con la original (P-0003). El mockup aprobado del histórico ya muestra «Crear corrección»: alinear el flujo con esta decisión | Equipo | Abierto |
| X-10 | Vistas del menú sin inventario | Los mockups aprobados muestran en el menú **Alertas** y **Datos y documentación**, sin página en `docs/usuario/inventario/`; «Datos y documentación» tampoco está en el menú de `docs/tecnica/diseno-app.md`. Decidir si son vistas, crear su ficha (FLU-01) y su página (DOC-01) | Líder | Abierto |
| X-11 | Contenidos del portal | El mockup aprobado del portal tiene marcadores por completar: logo oficial desde el CDN de GOV.CO, dirección, teléfono y horario de atención, correo de notificaciones judiciales y redes sociales de la UPME. En el modo pantalla (tablero «El sistema hoy»): dirección pública del portal y su código QR | Líder | Planeado (1.1) |
| X-12 | Documentación en Notion | Llevar la documentación y los pendientes a Notion. Las reglas (DOC, FLU-09) dicen que la documentación vive en el repositorio junto al código: decidir si Notion es un espejo de solo lectura o la fuente de algunos contenidos (pendientes, plan de trabajo); en el segundo caso, ADR en `upme-estandares` | Líder | Abierto |
| X-13 | Componentes compartidos entre proyectos | Los componentes de React y su galería (`/dev/componentes`) viven solo en este proyecto; `upme-estandares` no entrega componentes. Evaluar cómo compartirlos (copia en `dist/`, paquete versionado o catálogo publicado) y proponer CMP-04. [Detalle](pendientes/x-13-componentes-compartidos.md) | Líder | Abierto (revisar al cerrar T-08) |
| X-14 | Datos del portal y del modo pantalla | Antes de conectar datos reales al portal y al modo pantalla (T-18, T-19): definir cómo se calcula el **acierto de las proyecciones** (hoy, ilustrativo: 100 % menos el error medio a 12 meses; ver X-03), qué año y escenario muestran las cifras principales, el **error medio de la revisión** (MAPE a 12 meses), el **crecimiento promedio** del horizonte, la **desviación mensual** real vs. proyectado (la proyección es anual: cómo se reparte por mes), la **demanda diaria** del tablero «El sistema hoy» (fuente y frecuencia de XM y del Gestor del Mercado de Gas, demanda máxima de potencia), el umbral que se muestra (X-03) y el texto de la licencia de los datos descargados (X-04) | Líder | Abierto |
| X-15 | Modo pantalla sin conexión | Hoy, si se pierde la conexión mientras corre, sigue mostrando los últimos datos (TV-07). Abrir `/pantalla` sin conexión desde cero requiere un service worker que guarde la aplicación: evaluar si se necesita en las pantallas de la UPME y cómo hacerlo sin tecnología nueva (TEC-05) | Líder | Abierto |
| X-16 | Acciones de los gráficos en el modo pantalla | GRA-08 pide en todo gráfico acciones (datos, imagen, tabla, pantalla completa). En el modo pantalla, como en el mockup aprobado, no se muestran: en un televisor nadie descarga datos. Sí hay tabla equivalente para lectores de pantalla (A11-04) y pantalla completa general. Decidir si se registra como excepción con un ADR del proyecto (y en `docs/tecnica/diseno-app.md`) o se propone en `upme-estandares` que GRA-08 no aplique al modo pantalla | Líder | Abierto |
| X-17 | Íconos de pausa y reproducir | La Librería de Iconos UPME no tiene íconos de **pausa** ni de **reproducir**. El modo pantalla usa provisionalmente `Stop` (mano) y `send` (triángulo). Pedir a Comunicaciones los íconos y llevar al estándar los íconos locales de `frontend/src/iconos-locales/` (`Stop`, `send`, `fullScreen`, `chevron-lef`, `chevron-right`) con un PR a `upme-estandares` (MARCA-UPME, proceso para agregar un ícono) | Líder | Abierto |
