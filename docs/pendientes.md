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
| T-07 | Modo pantalla: tableros de energía eléctrica, gas natural, comparar proyecciones y el sistema hoy, con acceso desde el portal | 1.1 | T-05 | #15 | #16 | Hecho |
| T-21 | Modo pantalla: tablero de variables exógenas | 1.1 | T-07 | — | — | Bloqueado (X-06, sin mockup) |
| T-08 | App interna: encabezado, selector de producto y menú lateral (LAY-06, LAY-07), con acceso desde el portal | 1 | T-05 | #17 | #18 | Hecho |
| T-09 | Tablero ejecutivo | 1 | T-08 | #19 | #20 | Hecho |
| T-10 | Histórico de revisiones | 1 | T-08 | #21 | #22 | Hecho |
| T-11 | Monitor de variables exógenas | 1 | T-08 | #25 | #26 | Hecho |
| T-12 | Proyección vs. real | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |
| T-13 | Comparar revisiones | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |
| T-14 | Usuarios y roles | 1 | T-08 | — | — | Bloqueado (X-06, sin mockup) |

### Datos reales

Plan de datos acordado el 2026-11-10 en la revisión del modelo de datos (issue #32). Se hace primero todo el recorrido con energía eléctrica y después se repite con gas natural y las exógenas; el modelo ya está diseñado para los dos productos ([P-0004](decisiones/0004-modelo-datos-v2.md)). Se organiza en siete **fases de datos**, cada una con su criterio de cierre:

| Fase | Qué incluye | Pasos | Termina cuando… |
| --- | --- | --- | --- |
| 1 · Modelo de datos y reglas | Modelo v2, reglas del proyecto, sección «Base de datos», fuentes, migración y CI con PostgreSQL | T-22, T-23 | El modelo está documentado, migrado y verificado en la CI |
| 2 · Prueba del modelo con datos reales | Carga de prueba de las revisiones de EE y de `DemaSIN`, consultas que piden las vistas, validación de la variable real | T-24 a T-26 | Las vistas se pueden responder con el modelo, sin huecos |
| 3 · Pipeline de datos | Lectores, `raw`/`staging`, versionamiento, anomalías, bitácora, cargas diaria y semanal, tareas programadas | T-27 a T-31 | Las cargas corren solas y dejan bitácora |
| 4 · Decisiones visuales e indicadores | Cómo se muestran el escenario medio y los intervalos (5 valores por serie), qué serie, métricas de error, umbrales, vistas nuevas | T-32 | Mockups aprobados (FLU-03) |
| 5 · API | Contrato público e interno, esquema `publicacion`, documentación de la API | T-33 | Contrato publicado (OpenAPI) y probado |
| 6 · Vistas conectadas | Ajustar las vistas según la fase 4, conectarlas a la API, retirar las cifras ilustrativas | T-34 | Las vistas de EE muestran datos reales |
| 7 · Operación y verificación | Tareas programadas en un servidor, contraste con las cifras publicadas por la UPME, inventario, capturas | T-35 | Release |

| ID | Paso | Etapa | Depende de | Issue | PR | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| T-15 | Reunir archivos de revisiones, series reales y exógenas, y decidir desde qué revisión cargar | 1 | — | #32 | — | Hecho (insumos de EE y GN revisados; sigue X-02) |
| T-16 | Tablas `raw`/`staging` y ajustes al modelo de datos | 1 | T-15 | — | — | Reemplazado por T-22 y T-23 |
| T-17 | Flujos de carga (Prefect) | 1 | T-16 | — | — | Reemplazado por T-27 a T-31 |
| T-18 | Endpoints de la API y conexión de cada vista a datos reales; retirar las cifras ilustrativas | 1 y 1.1 | T-17 | — | — | Reemplazado por T-33 y T-34 |
| T-19 | Vistas `publicacion.*` para el portal y el modo pantalla | 1.1 | T-18 | — | — | Reemplazado por T-33 |
| T-22 | Documentar el modelo de datos v2, las reglas del proyecto (PBD, PDA, PFU, PFL, PER), la sección «Base de datos», las fuentes de XM y este plan | 1 | T-15 | #32 | #33 | Hecho |
| T-23 | Migración `0003` con el modelo v2 y todos los comentarios; script del diccionario con su verificación; base PostgreSQL de prueba en la CI (PBD-01 a PBD-04) | 1 | T-22 | #34 | #35 | Hecho |
| T-24 | Carga de prueba de las 5 revisiones de EE y de `DemaSIN`; las consultas que piden las vistas (abanico, comparar revisiones, error) y las vistas anchas de `core` | 1 | T-23 | #36 | #37 | Hecho |
| T-25 | Revisiones anteriores a dic-2023 y versiones corregidas (la «v2» de jul-2024) | 1 | T-24 | — | — | Bloqueado (X-02, X-23) |
| T-26 | Validar la variable real para el cálculo del error (hipótesis: `DemaSIN` frente a `SIN+GCE+ME+GD_UPME`, PER-01) | 1 | T-24 | — | — | Pendiente |
| T-27 | Lector de anexos de la UPME (por encabezados, con verificación de sumas y normalización entre versiones) y flujo `load-published-revisions` | 1 | T-24 | — | — | Pendiente |
| T-28 | Flujo de Prefect para la carga histórica de XM: las medidas que XM publica por día (`DemaSIN` y `DemaMaxPot`) desde 2010 (X-26) | 1 | T-23 | #38 | #39 | Hecho |
| T-29 | Carga diaria y conciliación semanal de XM, con cambios, anomalías y avisos (PDA-02 a PDA-04) | 1 | T-28 | — | — | Pendiente (X-24) |
| T-36 | Medidas horarias de XM: `DemaReal`, `DemaCome` y `ExpoEner`, que SINERGOX solo publica por hora (`/hourly`), en el flujo `ingest-observed-demand`, cargadas a demanda desde 2010 (su total diario y mensual sale de sumar las horas); migración que hace que `core.v_observed_wide` y `core.v_ee_revision_vs_real` usen lo diario cuando una medida tiene diario y horario en el mismo mes | 1 | T-28 | — | — | Pendiente |
| T-37 | **Datos reales de EE en las vistas, provisional:** tablero ejecutivo, histórico de revisiones, portal y modo pantalla leen energía eléctrica de una API mínima (`/api/v1/ee`); lo demás sigue ilustrativo y marcado. Decidido por el líder el 2026-11-10 para ver datos reales de una vez: «escenario bajo/alto» = límites del IC 68 %, solo la serie SIN+GCE+ME+GD_UPME, los indicadores que ya usaban las vistas. Lo definitivo sigue en T-32 a T-34 | 1 | T-28 | #40 | — | En curso |
| T-30 | Bitácora y mensajes de carga, y cómo se consultan (PDA-05). Incluye cerrar como `failed` una carga que quedó `running` porque su ejecución se canceló o se cayó (pasó al cancelar una en T-28) | 1 | T-23 | — | — | Pendiente |
| T-31 | Tareas programadas de las cargas | 1 | T-29 | — | — | Pendiente (servidores, en el estándar) |
| T-32 | Decisiones visuales: escenario medio e intervalos, serie y métricas de error que se muestran, umbrales, mockups de vistas nuevas (anomalías, bitácora, avisos) | 1 | T-24 | — | — | Pendiente (X-03, X-14, X-25) |
| T-33 | Contrato de la API (pública e interna) y vistas `publicacion` | 1 y 1.1 | T-32 | — | — | Pendiente (X-04, X-28) |
| T-34 | Conectar las vistas de EE a la API y retirar las cifras ilustrativas de EE | 1 y 1.1 | T-33 | — | — | Pendiente |
| T-35 | Operación: cargas en un servidor, contraste con las cifras publicadas, inventario, capturas, CHANGELOG y diario | 1 | T-34 | — | — | Pendiente |

**Después:** gas natural (X-27), variables exógenas (DANE, IDEAM), y el paso a una base de datos común de la UPME cuando exista (X-29). En la fase 2 del producto: catálogo de modelos e integración con MLflow y DVC (X-08, PBD-06).

### Datos ilustrativos

Decisión del 2026-11-08 para la construcción visual:

- Los datos de ejemplo van **en el código del frontend**, en un solo módulo (`frontend/src/demo/`), con los tipos que se esperan de la API. **No** se crean tablas de prueba: el modelo de datos se ajusta cuando se conozcan los datos reales (hecho: modelo v2, T-22 y T-23), y unas tablas de prueba se tendrían que diseñar, migrar y luego borrar.
- Las vistas leen esos datos con las mismas funciones con las que leerán la API, de modo que al conectar los datos reales (T-34) solo cambia ese módulo.
- Toda vista con datos de ejemplo muestra el aviso «Cifras ilustrativas» (CON-07).
- Cada vista anota en su PR qué campos necesitó; esa lista alimentó el modelo v2 (T-22).

## Pendientes de decisión

Los pendientes generales (servidores, Keycloak, DVC, Prefect vs. Dagster, Google Chat, aprobación de PR, revisión automática, publicación de documentación…) están en `PENDIENTES.md` de `upme-estandares`.

| ID | Tema | Qué falta | Responsable | Estado |
| --- | --- | --- | --- | --- |
| X-01 | Fuentes y formatos | Reunir archivos de revisiones pasadas, series reales y exógenas; definir tablas `raw`/`staging`. Hecho para EE (API de XM y 5 anexos de revisiones) y revisada la estructura de GN; las tablas están en el modelo v2 ([P-0004](decisiones/0004-modelo-datos-v2.md)). Faltan las exógenas (DANE, IDEAM) | Equipo | Parcial |
| X-02 | Histórico | Desde qué revisión cargar (EE y GN). Hay 5 revisiones de EE (dic-2023 a ago-2026); falta saber si hay anteriores con anexo (X-23, T-25) | Líder | Abierto |
| X-03 | Umbrales de error | Umbrales aceptables por producto y horizonte para alertas | Subdirectora | Abierto |
| X-04 | Publicación | Qué desagregaciones son públicas (regional, sectorial, horaria) | Líder + jurídica | Abierto |
| X-05 | Aprobación de revisiones | Quién aprueba formalmente y con qué acto administrativo. El mockup aprobado de ejecutar proyección asume doble aprobación (líder técnico y Subdirectora): confirmarlo o ajustar el mockup | Subdirectora | Abierto |
| X-06 | Aprobación de mockups | 8 pantallas aprobadas el 2026-11-08 (`docs/tecnica/mockups/`). Faltan mockups de proyección vs. real, comparar revisiones, usuarios y roles, inicio de la app, ingresar, alertas y datos y documentación (FLU-03) | Líder | Parcial |
| X-07 | Catálogo de notificaciones | Confirmar eventos y espacios de Google Chat para la etapa 1.2 | Líder | Planeado (1.2) |
| X-08 | Migración de modelos | Plan de migración de MATLAB a Python y modelos sin ruta definida | Equipo de modelos | Planeado (fase 2) |
| X-09 | Corrección de revisiones | Agregar estado `superseded` y columna `supersedes_id` en `core.revisions` para enlazar una revisión corregida con la original (P-0003). Resuelto en el diseño del modelo v2 (P-0004); se crea en la migración `0003` (T-23). El mockup aprobado del histórico ya muestra «Crear corrección»: alinear el flujo con esta decisión | Equipo | Hecho (migración `0003`, T-23) |
| X-10 | Vistas del menú sin inventario | Los mockups aprobados muestran en el menú **Alertas** y **Datos y documentación**, sin página en `docs/usuario/inventario/`; «Datos y documentación» tampoco está en el menú de `docs/tecnica/diseno-app.md`. Decidir si son vistas, crear su ficha (FLU-01) y su página (DOC-01) | Líder | Abierto |
| X-11 | Contenidos del portal | El mockup aprobado del portal tiene marcadores por completar: logo oficial desde el CDN de GOV.CO, dirección, teléfono y horario de atención, correo de notificaciones judiciales y redes sociales de la UPME. En el modo pantalla (tablero «El sistema hoy»): dirección pública del portal y su código QR | Líder | Planeado (1.1) |
| X-12 | Documentación en Notion | Llevar la documentación y los pendientes a Notion. Las reglas (DOC, FLU-09) dicen que la documentación vive en el repositorio junto al código: decidir si Notion es un espejo de solo lectura o la fuente de algunos contenidos (pendientes, plan de trabajo); en el segundo caso, ADR en `upme-estandares` | Líder | Abierto |
| X-13 | Componentes compartidos entre proyectos | Los componentes de React y su galería (`/dev/componentes`) viven solo en este proyecto; `upme-estandares` no entrega componentes. Evaluar cómo compartirlos (copia en `dist/`, paquete versionado o catálogo publicado) y proponer CMP-04. [Detalle](pendientes/x-13-componentes-compartidos.md) | Líder | Abierto (revisar al cerrar T-08) |
| X-14 | Datos del portal y del modo pantalla | Antes de conectar datos reales al portal y al modo pantalla (T-33, T-34): definir cómo se calcula el **acierto de las proyecciones** (hoy, ilustrativo: 100 % menos el error medio a 12 meses; ver X-03), qué año y escenario muestran las cifras principales, el **error medio de la revisión** (MAPE a 12 meses), el **crecimiento promedio** del horizonte, la **desviación mensual** real vs. proyectado (la proyección es anual: cómo se reparte por mes), la **demanda diaria** del tablero «El sistema hoy» (fuente y frecuencia de XM y del Gestor del Mercado de Gas, demanda máxima de potencia), el umbral que se muestra (X-03) y el texto de la licencia de los datos descargados (X-04) | Líder | Abierto |
| X-15 | Modo pantalla sin conexión | Hoy, si se pierde la conexión mientras corre, sigue mostrando los últimos datos (TV-07). Abrir `/pantalla` sin conexión desde cero requiere un service worker que guarde la aplicación: evaluar si se necesita en las pantallas de la UPME y cómo hacerlo sin tecnología nueva (TEC-05) | Líder | Abierto |
| X-16 | Acciones de los gráficos en el modo pantalla | GRA-08 pide en todo gráfico acciones (datos, imagen, tabla, pantalla completa). En el modo pantalla, como en el mockup aprobado, no se muestran: en un televisor nadie descarga datos. Sí hay tabla equivalente para lectores de pantalla (A11-04) y pantalla completa general. Decidir si se registra como excepción con un ADR del proyecto (y en `docs/tecnica/diseno-app.md`) o se propone en `upme-estandares` que GRA-08 no aplique al modo pantalla | Líder | Abierto |
| X-17 | Íconos locales al estándar | El proyecto usa íconos que aún no están en `upme-estandares` (`frontend/src/iconos-locales/`): `fullScreen`, `chevron-lef` y `chevron-right`, tomados de la Librería de Iconos UPME, y `pause` y `play`, **creados en el proyecto** porque la librería no los tiene (excepción a UPME-ICO-01 aprobada por el líder, #15). Llevarlos al estándar con un PR a `upme-estandares` (MARCA-UPME, proceso para agregar un ícono) y pedir a Comunicaciones que revise `pause` y `play` o los reemplace por oficiales. [Detalle, insumos y prompt](pendientes/x-17-iconos-al-estandar.md) | Líder | Abierto |
| X-18 | Revisión extraordinaria | El mockup del tablero ejecutivo tiene «Abrir revisión extraordinaria» y el plan completo dice que «una alerta grave puede abrir una revisión extraordinaria, que vuelve al paso 4» (experimentación). Falta definir: qué alertas la disparan (X-03), quién la abre, cómo se aprueba (X-05), cómo se nombra frente a las semestrales y en qué se diferencia de una corrección (X-09). Ejecutarla es fase 2; el botón queda fuera del tablero (T-09, #19) | Líder | Abierto |
| X-19 | Informe del tablero ejecutivo | «Descargar informe» está en el tablero ejecutivo, deshabilitado («En construcción»). Definir qué contiene (cifras, gráficos, alertas, periodo), formato (PDF, Excel), para quién es y si se genera en el navegador o en el servidor (posible tecnología nueva, TEC-05) | Líder | Abierto |
| X-20 | Ciclo de trabajo con asistentes en el estándar | El proyecto adoptó un ciclo para trabajar con asistentes de IA: el asistente redacta el issue con sus supuestos, la persona lo crea, el asistente desarrolla en la rama y entrega el texto del PR, y la persona revisa contra el mockup **antes** de abrir el PR (en `AGENTS.md` y en la guía del flujo de trabajo, #23). Proponerlo en `upme-estandares` como regla IA (las reglas no se editan aquí, FLU-09). [Detalle y prompt](pendientes/x-20-ciclo-con-asistentes.md) | Líder | Abierto |
| X-21 | Llevar al estándar las prácticas del proyecto | README como puerta de entrada, mapa del repositorio verificado (`repo-map.toml`, `scripts/mapa.py`), páginas generadas con hook y CI, entorno de un comando (`dev-setup.sh`), usuario administrador local, guía del flujo, página por pendiente, verificación de MkDocs sin `-q` y capturas con sesión simulada: proponerlos en `upme-estandares`. Relacionado con X-13, X-17 y X-20. [Detalle, insumos y prompt](pendientes/x-21-estandarizar-practicas.md) | Líder | Abierto |
| X-22 | Reglas del proyecto al estándar | Llevar a `upme-estandares` las reglas del proyecto que sirven a cualquier proyecto (comentarios y documentación de la base, CI con PostgreSQL, versionamiento y calidad de datos, bitácora, esquema `operacion`, fichas y guías de fuentes, protocolo regla local + pendiente, metadatos corregibles de lo publicado, citar la página del informe, documentar la CI) y corregir BD-03 (columnas de `raw` en inglés). [Detalle, insumos y prompt](pendientes/x-22-reglas-al-estandar.md) | Líder | Abierto |
| X-23 | Observaciones a los anexos de EE | Remitir al equipo de modelación las observaciones a los 5 anexos y al informe Rev. Julio 2026 (8 errores, 7 inconsistencias, 10 dudas y 7 sugerencias) y anotar sus respuestas. Entre ellas: las 5 áreas no suman la serie SIN; qué fue la «v2» de jul-2024; si hay revisiones anteriores a dic-2023; el salto de GD_PNUMA en 2039; el día exacto de publicación de cada revisión; equivalencias de nombres de GCE entre revisiones; si los primeros meses de cada hoja mensual son proyección. La carga de prueba (T-24) agregó E-8: la serie anual SIN+GCE+ME+GD_PNUMA no es la suma de sus partes en el primer año (el año mixto) de dic-2024, jul-2025 y 2026-07 (diferencias de 871, 877 y 2249 GWh; las mensuales sí cuadran). El enlace y el modelo de cada revisión pasaron a X-31 y X-32 | Líder | Abierto |
| X-24 | Calidad de los datos reales | Para las cargas de XM: reglas y umbrales para marcar un dato como anómalo (día incompleto, fuera de rango, salto frente a la versión anterior, incoherencia entre medidas); qué rol acepta o rechaza una anomalía y dónde (una vista nueva necesita diseño, FLU-03); cuántos días recarga la diaria y a qué hora; si la conciliación del domingo baja todo el histórico o un tramo; desde qué tamaño un cambio genera aviso y cómo llega mientras no haya Google Chat (PDA-02 a PDA-04). Además: `operacion.source_status` guarda un estado por fuente y no por variable, así que con `DemaMaxPot` (más de un mes de rezago) XM parece desactualizada aunque `DemaSIN` esté al día (visto en T-28); decidir si pasa a ser por variable. Evidencia de día incompleto: el 2026-11-10 XM entregó 0,6 GWh de `DemaSIN` para el 2026-11-08 (un día normal tiene ~240) y entró como aceptado; mientras tanto, la API de T-37 omite esos días al final de «El sistema hoy» | Líder | Abierto |
| X-25 | Métricas de error que se muestran | La UPME publica APE, AAE y MSE (método de la IEA) por mes, valor e intervalo; el análisis previo usa MAPE y sesgo; los mockups muestran «MAPE a 12 meses». Decidir qué se calcula y se muestra, y si se cargan los errores que publica la UPME para contrastarlos. Relacionado con X-03 y X-14 | Líder | Abierto |
| X-26 | Alcance de la carga de XM | Qué medidas se cargan desde el inicio además de `DemaSIN` (propuesta: `DemaReal`, `DemaCome`, `ExpoEner`, `DemaMaxPot`), desde qué año, si el cliente es el REST con `httpx` (propuesto) o `pydataxm` (dependencia nueva, TEC-06), y si se usan las proyecciones UPME que publica XM (`EscDemUPME*`) para cruzar con las revisiones. **Decidido el 2026-11-10:** cliente REST con `httpx`; `DemaSIN` y `DemaMaxPot` diarias desde el 2010-01-01 (T-24 y T-28); `DemaReal`, `DemaCome` y `ExpoEner` solo existen por hora en SINERGOX y se cargan a demanda en T-36. Sigue abierto: si se usan las proyecciones `EscDemUPME*` de XM | Líder | Abierto (en parte) |
| X-27 | Gas natural | Al trabajar GN: confirmar la unidad (el anexo no la dice; se asume GBTUD), qué hacer con el histórico que trae el anexo de la revisión y cuál es la fuente externa del dato real (Gestor del Mercado de Gas) | Líder | Planeado |
| X-28 | API pública desde el inicio | La hoja de ruta (`docs/producto/index.md`) deja la API pública para la etapa 3. Diseñarla pública desde la fase 5 de datos pide definir separación pública e interna, solo datos publicables (`publicacion`, TV-06), licencia (X-04), contrato estable y si hace falta límite de consultas o caché (posible tecnología nueva, TEC-05). Si se decide, ADR del proyecto | Líder | Abierto |
| X-29 | Base de datos común de la UPME | Habrá una base de datos común con los datos de otras entidades que usa toda la UPME (BD-02). Se tiene en cuenta en la arquitectura (PDA-01) pero no se documenta aún. Cuando exista: qué se sabe de ella, cómo se pasa cada fuente y qué hacer con el histórico cargado aquí si sus cifras difieren | Líder | Planeado |
| X-30 | Responsables y archivos de origen | Quién mantiene cada carga y la da por buena; qué archivos de origen son confidenciales (define qué puede llegar al portal). Los archivos se guardan en la base (`raw.files`) hasta que TI defina un almacenamiento | Líder | Abierto |
| X-31 | Enlace del informe de cada revisión | Las 5 revisiones de EE cargadas en T-24 apuntan a `https://www.upme.gov.co` porque falta el enlace exacto de cada informe (`document_url` en `pipelines/revisiones_ee.toml`). Los enlaces de los 5 **anexos** ya están (2026-11-10): `annex_url` y `annex_sha256` en `pipelines/revisiones_ee.toml`, comprobados contra los archivos cargados; T-27 los usa para cargar en el despliegue. Faltan los 5 enlaces de los **informes**, para corregirlos en la misma fila, sin crear revisiones nuevas, con registro del cambio (PBD-08). La primera corrección define cómo queda ese registro en `operacion` (hoy `load_runs.load_type` no tiene un tipo para correcciones: necesita migración) | Líder | Abierto |
| X-32 | Modelo de cada revisión | Solo 2026-07 tiene el modelo, tomado de su informe; las otras 4 revisiones de EE dicen «por confirmar». El líder entrega los informes de 2023-12, 2024-07, 2024-12 y 2025-07; de cada uno se toma el modelo (y, si lo dice, el día de publicación y el corte del dato real), se documenta en `docs/tecnica/modelos/ee.md` citando la página (PFU-03) y se corrige en la misma fila con registro (PBD-08). Igual que X-31 | Líder | Abierto |
| X-33 | Conocer Prefect a fondo | El líder quiere conocer bien la herramienta antes de que las cargas corran solas (T-29, T-31). Revisar: conceptos (flujo, tarea, despliegue, ejecución, worker), la interfaz, horarios, reintentos, avisos, qué pasa si el worker o el servidor se caen, cómo se despliega en un servidor y alternativas, porque está en el stack como provisional. Punto de partida: la [ficha local de Prefect](tecnica/herramientas/prefect.md) | Líder | Abierto |
