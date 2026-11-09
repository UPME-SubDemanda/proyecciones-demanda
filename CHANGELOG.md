# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/), versiones SemVer (DOC-04, FLU-08). Cada línea menciona la vista o feature y el PR.

## [Sin publicar]
### Agregado
- Estructura inicial del proyecto (upme-estandares 1.0.0).
- Reglas de upme-estandares 2.1.0 copiadas en `reglas/` (incluye TEC-10); `CLAUDE.md` carga `AGENTS.md` y las reglas de flujo (FLU-09, IA-02).
- Autenticación: cuenta institucional de Google o usuario local, roles asignados por administradores.
- Modelo de datos de la etapa 1: productos, series reales, revisiones publicadas, escenarios, variables exógenas y supuestos (migración 0002).
- Inventario de vistas planeadas con enlace a los mockups de referencia.
- Reglas de versionado del proyecto: casos de vistas, modelos, datos y revisiones (P-0003).
- Mockups aprobados de 8 pantallas (tablero ejecutivo, histórico de revisiones, monitor de exógenas, portal escritorio y móvil, modo pantalla, ejecutar proyección y registro de modelos) en `docs/tecnica/mockups/`, con registro de aprobación (FLU-03, X-06) (issue #2, PR #4).
- Guía del flujo de trabajo del equipo (issues, ramas, PR, CI y publicación, con ejemplos) en `docs/tecnica/flujo-de-trabajo-equipo.md` (FLU-01 a FLU-10) (issue #5, PR #6).
- Plan de trabajo ordenado (T-01 a T-20) en `docs/pendientes.md`, con la decisión de construir las vistas con cifras ilustrativas en el frontend antes de conectar datos reales; incluye la página de referencias (T-20) como paso siguiente (issue #7, PR #10).
- Página de referencias (`docs/tecnica/referencias.md`): qué significa cada ID de reglas, pasos del plan, pendientes y decisiones, generada por `scripts/referencias.py` y verificada en la CI y regenerada por el hook `.githooks/pre-commit` (junto con el índice del inventario); el buscador del sitio técnico encuentra IDs como `DOC-04` (T-20) (issue #9, PR #11).
- Estructura base del frontend (T-05): componentes Button, Badge, ProductIcon, KpiCard, ChartCard, SegmentedControl, EmptyState, ErrorState y Skeleton; gráfico real vs. proyección con la codificación de GRA-01; cifras ilustrativas detrás de un único punto de acceso a datos; producto activo en la URL; formatos es-CO; descargas CSV y PNG; fuentes de la marca autoalojadas; galería de componentes solo en desarrollo (issue #8, PR #12).
- Convención del proyecto: todo componente nuevo se agrega a la galería `/dev/componentes` en el mismo PR. Pendiente X-13 (con página de detalle en `docs/pendientes/`) para evaluar componentes compartidos entre proyectos y proponer CMP-04 al estándar (issue #8, PR #12).
- Portal público, inicio (`portal-inicio`, T-06): barra GOV.CO, encabezado y pie del portal, cifras de energía eléctrica, gas natural y acierto de las proyecciones, gráfico de la revisión vigente con escenarios y secciones «Próximamente»; con cifras ilustrativas, en escritorio y móvil. Nuevo pendiente X-14 sobre los datos del portal (issue #13, PR #14).
- Índice del diario (`docs/diario/index.md`) con todas las entradas, generado por `scripts/diario.py`, regenerado por el hook y verificado en la CI (DOC-05) (issue #13, PR #14).
- Modo pantalla (`modo-pantalla`, T-07): tableros rotativos de energía eléctrica y gas natural para televisores, con filtros de revisión, rango y escenarios, 4 cifras, gráfico principal, desviación mensual y demanda por escenario; rotación, pausa por interacción, arrastre, configuración por URL y datos de respaldo sin conexión. Componentes `KioskShell`, `VersionSelect`, `RangeSlider` y `Chip`. Tableros «Comparar proyecciones» (abanico de revisiones y exactitud de cada una) y «El sistema hoy» (demanda diaria de energía y gas). Controles de solo ícono (pausa y reproducir, creados en el proyecto porque la librería UPME no los tiene; pantalla completa y volver al inicio); pie con la fecha de corte de los datos; la barra de progreso se congela en las pausas en lugar de desaparecer. Acceso discreto desde el inicio del portal. Mockups de los dos tableros nuevos documentados. Pendientes X-15, X-16 y X-17 (con página de detalle, insumos y prompt para `upme-estandares`); paso T-21 para el tablero de variables exógenas (issue #15, PR #16).
- App interna (`app-inicio`, T-08): estructura común con menú lateral (solo vistas construidas y permitidas al rol), encabezado con selector de producto guardado en la URL, menú del usuario (ir al portal, cerrar sesión) y menú plegable en tablet; esqueleto de vista interna. Enlace «Ingresar» en el portal; al ingresar se vuelve a la página pedida. Componentes `SideNav`, `AppShell` y `UserMenu` (issue #17, PR #18).
- Tablero ejecutivo (`tablero-ejecutivo`, T-09), inicio de la app interna: aviso de alerta alta, cifras de energía eléctrica y gas natural con error del año corrido frente al umbral, gráfico real vs. proyección vigente con revisiones anteriores, punto del año corrido y rango de años en la URL, y alertas abiertas de ejemplo. «Descargar informe» deshabilitado («En construcción»). Componentes `Banner` y `AlertItem`. Pendientes X-18 (revisión extraordinaria) y X-19 (informe) (issue #19, PR #20).
- Histórico de revisiones (`historico-revisiones`, T-10): gráfico abanico con la vigente y la revisión elegida resaltada, escenario en la URL, tabla de revisiones con búsqueda, orden y paginación, error a 12 meses y MAPE, y descarga de cada revisión o de todas. «Comparar seleccionadas» y «Documento» deshabilitados hasta que existan. Componente `DataTable`. Encabezado de la app con «Grupo / Vista» (issue #21, PR #22).
- Ciclo de trabajo con asistentes de IA: el asistente redacta el issue con sus supuestos y el texto del PR (`Closes #<n>`); la persona crea el issue, revisa la rama contra el mockup antes de abrir el PR y lo une. En `AGENTS.md` («Ciclo con un asistente») y en la guía del flujo de trabajo («Trabajar con un asistente de IA»). Pendiente X-20, con contexto y prompt, para proponerlo en `upme-estandares`. La tabla «Quién hace qué» precisa que quien desarrolla también puede crear issues (idealmente con el texto aprobado por el líder) y une su propio PR, y que la CI son verificaciones automáticas (issue #23, PR #24).

### Cambiado
- Inventario: la ruta del histórico de revisiones pasa a `/app/proyecciones/historico`, como el menú (issue #21, PR #22).
- Ingreso: estados de verificación y sin permiso con los componentes de estado; enlace para volver al portal (issue #17, PR #18).
- Guía técnica: sección «Usuario administrador local» (usuario `admin@local`, contraseña en `DEV_ADMIN_PASSWORD` de `.env`, cómo crearlo sin escribir la contraseña en la terminal y cómo crear un usuario propio); `DEV_ADMIN_PASSWORD` en `.env.example` (issue #17, PR #18).
- Gráfico real vs. proyección: elige escenarios visibles y rango de años, y tiene modo pantalla (issue #15, PR #16).
- Pantalla completa: el botón de `ChartCard` y del modo pantalla cambia a «Salir de pantalla completa» mientras está activa (issue #15, PR #16).
- Gráficos: ECharts se importa por módulos (`echarts/core`) para que el portal cargue menos; `ChartCard` ordena las acciones en una barra propia y acepta acciones táctiles de 44 px; `Button` tiene tamaño `touch` (A11-07) (issue #13, PR #14).
- Capturas: `pnpm screenshots` acepta `BASE_URL` y captura el portal también en móvil (DOC-03) (issue #13, PR #14).
- Hoja de ruta: el portal público y el modo pantalla pasan a la etapa 1.1 y las notificaciones a la 1.2 (issue #7, PR #10).
- Inventario: el campo `diseno` de cada vista apunta a su mockup aprobado; proyección vs. real, comparar revisiones y usuarios y roles quedan sin diseño (issue #2, PR #4).

### Eliminado
- Inicio provisional de la app interna (`app-inicio`): lo reemplaza el tablero ejecutivo; su página del inventario queda como retirada (issue #19, PR #20).
- `backend/test.db` del repositorio; las bases SQLite locales quedan ignoradas (issue #1, PR #3).

### Corregido
- Gráficos: los años del eje X no se veían en el portal ni en la app desde el modo pantalla (PR #16), porque las opciones de tamaño de pantalla borraban las etiquetas del tema fuera de ese modo (issue #19, PR #20).
- Entorno local: `prefect-worker` no compilaba (paquetes de `pipelines/` sin declarar) y arrancaba antes de que `prefect-server` estuviera listo; ahora espera su healthcheck (issue #1, PR #3).
- Entorno local: `web` no compilaba con pnpm reciente; se fija `pnpm@9.15.9` (la versión mayor de la CI), se permite el build de `esbuild` y se versiona `pnpm-lock.yaml` (issue #1, PR #3).
- Migraciones: Alembic no encontraba el paquete `app` (`prepend_sys_path` en `alembic.ini`) (issue #1, PR #3).
- Frontend y CI: `pnpm test` corre Vitest una sola vez (`test:watch` para modo observación); `pnpm test --run` fallaba con pnpm 9 (issue #1, PR #3).
- Guía técnica: migraciones y creación de usuarios se ejecutan dentro del contenedor `api`; desde el equipo usaban SQLite sin avisar (issue #1, PR #3).
