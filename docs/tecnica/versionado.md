# Versionado en este proyecto

Aplica la regla general de `reglas/REGLAS-FLUJO.md`, sección Versionado (los cuatro relojes, FLU-08), a los casos de Proyecciones de Demanda. Decisión: [P-0003](../decisiones/0003-reglas-versionado.md).

## Principio: primero pregunta qué cambió

| Si cambió… | Se versiona… | Ejemplo |
| --- | --- | --- |
| El **código** de la app (vistas, API, flujos, base de datos) | La **app** (SemVer, etiqueta Git, CHANGELOG) | `v0.4.0` |
| La **lógica o el entrenamiento** de un modelo | El **modelo** (SemVer propio) | `EE-LP 3.2.0` |
| Los **datos** con que se trabaja (reales, exógenas) | El **corte de datos** (fecha) | corte `2026-09-30` |
| La **proyección oficial** que se entrega | La **revisión** (mes de publicación) | `Revisión nov-2026` |

Un mismo trabajo puede mover más de un reloj. Por ejemplo, programar un modelo nuevo dentro de la app sube la app **y** crea un modelo. Lo que **no** se hace nunca es subir la app solo porque se publicó una proyección o se cargaron datos: eso no es código.

## Reglas de la app

**Salto según el cambio**

| Salto | Cuándo | Commit típico |
| --- | --- | --- |
| **PARCHE** `x.y.Z` | Algo que existía funciona mejor o se ve mejor, sin capacidades nuevas | `fix:`, `perf:`, `style:` |
| **MENOR** `x.Y.0` | El usuario puede hacer algo que antes no podía | `feat:` |
| **MAYOR** `X.0.0` | Algo deja de funcionar como antes para usuarios u otros sistemas | `feat!:` o `BREAKING CHANGE:` |
| **Ninguno** | No cambia lo que se despliega | `docs:`, `test:`, `ci:`, `refactor:`, `chore:` |

**Reglas de la etapa 0.x**

- Mientras la app no esté en producción, va en `0.y.z`. En 0.x, un cambio incompatible sube el **MENOR**, no el MAYOR, y se anota como incompatible en el CHANGELOG.
- La app pasa a **`1.0.0`** cuando la etapa 1 queda en producción para la Subdirección. Lo decide el líder.

**Reglas para cualquier release**

- **Gana el salto mayor.** Un release que junta varios `fix` y un `feat` es MENOR.
- **La versión se define en el release, no en cada PR.** Los PR a `develop` solo agregan líneas al CHANGELOG en *Sin publicar*. Al hacer el PR `develop → main`, el líder revisa esas líneas y fija el número.
- **Nunca se reutiliza ni se mueve una etiqueta.** Si `v0.4.0` salió con un error, se corrige en `v0.4.1`.

## Casos frecuentes

### Vistas y funcionalidades

| Caso | App | Por qué |
| --- | --- | --- |
| Agregar una **vista nueva** (p. ej. Correlaciones) | MENOR | Capacidad nueva. Requiere mockup aprobado, inventario y capturas |
| Agregar una **gráfica** a una vista existente | MENOR | El usuario ve información que antes no veía |
| Agregar un **filtro**, selector o control | MENOR | Nueva forma de consultar |
| Agregar una **función** a una vista (exportar CSV, comparar revisiones, alerta nueva) | MENOR | Capacidad nueva |
| Agregar un **KPI** nuevo | MENOR | Capacidad nueva. Documenta su fórmula en la guía de usuario |
| Mejorar el diseño de una vista (espaciado, colores del estándar, textos, orden) sin nada nuevo | PARCHE | Lo existente se ve mejor |
| Cambiar el tipo de una gráfica existente (barras a líneas) con la misma información | PARCHE | Misma información, otra presentación |
| Corregir un **error** de una vista o gráfica | PARCHE | |
| Corregir el **cálculo** de un KPI o métrica | PARCHE | Además: sección *Corregido* del CHANGELOG con el impacto, y aviso a quienes usaron el valor |
| Mejorar el rendimiento (carga más rápida) | PARCHE | |
| **Quitar** una vista, filtro o gráfica | MAYOR (MENOR en 0.x) | Algo que existía deja de estar |
| Cambiar URL de vistas públicas, la API o el formato de descargas del portal | MAYOR (MENOR en 0.x) | Rompe enlaces, integraciones o archivos de terceros |
| Agregar un campo nuevo a la API o a una descarga sin quitar los existentes | MENOR | Compatible hacia atrás |
| Cambiar permisos de un rol (lo que ve o hace) | MENOR si amplía, MAYOR si quita (MENOR en 0.x) | |

### Base de datos, plataforma y mantenimiento

| Caso | App | Por qué |
| --- | --- | --- |
| Migración que **agrega** tablas o columnas | Va con su funcionalidad (normalmente MENOR) | La migración es parte del cambio |
| Migración que **borra o renombra** algo que leen otros sistemas o reportes | MAYOR (MENOR en 0.x) | Incompatible |
| Actualizar dependencias sin cambio visible | PARCHE | Se despliega código distinto |
| Copiar una versión nueva de las reglas (FLU-09) | Ninguno si solo cambian `reglas/`; PARCHE si se ajusta código para cumplirlas; MENOR si trae funciones nuevas | `reglas/VERSION` queda con la versión nueva |
| Nuevo flujo de Prefect (p. ej. carga automática de exógenas) | MENOR | Capacidad nueva |
| Cambiar la programación de un flujo (de semanal a diaria) | PARCHE | Configuración de algo existente |
| Notificaciones nuevas por Google Chat (etapa 1.2) | MENOR | |
| Solo documentación, tests, CI o refactor | Ninguno | Entra en el próximo release |
| **Hotfix** en producción | PARCHE | Rama `hotfix/`, PR a `main` y luego a `develop` |

### Modelos

Cada modelo tiene su identificador (`EE-LP`, `EE-CP`, `GN-LP`…) y su propia versión. La app no cambia de versión por reentrenar o recalibrar, solo cuando cambia **código** de la app.

| Caso | Modelo | App |
| --- | --- | --- |
| **Modelo de prueba** o candidato nuevo | Identificador nuevo, empieza en `0.1.0`, estado *experimental* | Sin cambio si solo es un notebook o script de investigación; MENOR si se integra a la app (ejecución, vista) |
| Un modelo experimental pasa a **oficial** (aprobado para publicar) | `1.0.0` | Sin cambio |
| **Reentrenar** con datos nuevos, mismo método y variables | MENOR | Sin cambio |
| Recalibrar hiperparámetros | MENOR | Sin cambio |
| Cambiar **variables**, especificación o método | MAYOR | Sin cambio, salvo que la app necesite cambios |
| Corregir un **error** en el código del modelo | PARCHE. Si afecta proyecciones publicadas, ver *Corregir una revisión publicada* | Sin cambio |
| **Migrar** un modelo de MATLAB a Python | MAYOR, con informe de equivalencia (diferencias con la versión MATLAB) | MENOR si se integra a la app |
| Retirar un modelo | Estado *retirado*; se conservan sus versiones y resultados | Sin cambio |

Solo un modelo en versión `1.0.0` o superior puede producir una revisión oficial.

### Datos y proyecciones

| Caso | Qué se versiona | App |
| --- | --- | --- |
| Cargar datos reales nuevos (mes cerrado) | Nuevo `cutoff_date` en `series_observed` | Sin cambio |
| Actualizar exógenas (nuevo dato de PIB, ONI) | Nuevo `cutoff_date` en `exogenous_observed` | Sin cambio |
| Correr una proyección **de trabajo** | Ejecución con modelo + corte, estado *draft* | Sin cambio |
| **Publicar** una proyección oficial | Nueva revisión (`code` = mes, p. ej. `2026-11`) enlazada a modelo, corte y versión de la app (FLU-08) | Sin cambio |
| Cargar revisiones históricas (etapa 1) | Una revisión por publicación pasada, con el modelo que se conozca | Sin cambio |
| **Corregir una revisión publicada** | Nunca se sobrescribe. Se crea `2026-11.1` con nota de fe de erratas; la anterior queda visible y marcada como reemplazada | Sin cambio |

La corrección de revisiones necesita el estado *superseded* y el enlace a la revisión que reemplaza. Pendiente X-09.

## Paso a paso del release

1. Revisa *Sin publicar* en el CHANGELOG y aplica la tabla: ¿hay incompatibles? ¿hay `feat`? ¿solo `fix`?
2. Renombra *Sin publicar* a `## [0.4.0] - AAAA-MM-DD` y deja una sección *Sin publicar* vacía.
3. Actualiza la versión en `backend/pyproject.toml` y `frontend/package.json`.
4. PR `develop → main`. Al fusionar: `git tag v0.4.0 && git push --tags`.
5. Entrada en el diario: qué salió y qué sigue.

Prompt para Claude Code:

> Prepara el release: lee el CHANGELOG en Sin publicar, aplica docs/tecnica/versionado.md, propón el número de versión con su justificación y espera mi aprobación antes de cambiar archivos.
