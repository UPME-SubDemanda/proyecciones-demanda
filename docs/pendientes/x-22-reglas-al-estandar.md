---
id: X-22
tema: Reglas del proyecto al estándar
responsable: Líder
estado: Abierto
revisar: cuando haya espacio para trabajar en upme-estandares
creado: 2026-11-10
relacionado: [BD-02, BD-03, BD-05, BD-06, DOC-08, FLU-08, FLU-09, IA-02, TEC-05, X-21, P-0004]
---

# X-22 · Reglas del proyecto al estándar

**Qué hay que hacer:** proponer en `upme-estandares` las reglas que este proyecto creó al revisar su modelo de datos y que sirven a cualquier proyecto de la UPME, con el material para copiarlas (estructuras de tablas, plantilla de ficha, pasos de CI), y corregir una incoherencia del estándar. Cuando el estándar las publique, este proyecto las recibe con la copia de `reglas/` (FLU-09) y reemplaza sus reglas locales por las del estándar (PFL-02).

## Contexto

En noviembre de 2026 (issue #32) se revisó el modelo de datos de la etapa 1 con los datos reales: la API de XM, cinco anexos de revisiones de energía eléctrica, el informe Rev. Julio 2026 y un anexo de gas natural. La revisión encontró que el estándar no cubría varias necesidades:

- **Comentarios.** La base tenía los 5 esquemas sin comentario y 22 de 44 columnas de `core` sin comentario. BD-05 pide comentarios en tablas y columnas, pero no en esquemas, y nada lo verifica.
- **Documentación de la base.** BD-03 dice qué va en cada esquema, pero ninguna regla pide documentar el porqué, el uso y ejemplos de cada esquema y tabla. La página del modelo de datos era una tabla corta.
- **Migraciones sin probar.** Las pruebas del backend usaban SQLite y creaban las tablas desde el código, así que ninguna migración se probaba contra PostgreSQL antes de llegar a un servidor.
- **Datos que cambian en la fuente.** Las fuentes externas cambian sus datos (XM corrige los días recientes; el DANE revisa el PIB), y nada decía cómo guardar las versiones, qué hacer con un dato anómalo ni cómo dejar trazabilidad de cada carga.
- **Cambiar el origen de los datos.** BD-02 anticipa una base de datos común de la UPME, pero no dice cómo diseñar hoy para poder cambiar de origen sin rehacer el producto.
- **Archivos publicados.** Los archivos de la UPME cambian de formato entre publicaciones (7 cambios en 5 revisiones), y nada pedía verificarlos antes de cargarlos.
- **Incoherencia del estándar.** BD-03 nombra las columnas de `raw` en español (`fuente`, `fecha_carga`, `archivo_origen`) y BD-05 pide nombres en inglés.

El proyecto adoptó como protocolo convertir cada necesidad en regla local y en un pendiente para el estándar (PFL-01). Este es ese pendiente.

## Qué llevar al estándar

| # | Propuesta | Regla local | Material de referencia |
| --- | --- | --- | --- |
| 1 | Ampliar BD-05: comentario en español en **esquemas**, tablas, vistas y columnas, escrito en la migración | PBD-01 | `docs/tecnica/base-de-datos/convenciones.md` |
| 2 | Regla de documentación: sección «Base de datos» en la guía técnica, con página general (recorrido de un dato), una página por esquema y diccionario generado | PBD-02 | `docs/tecnica/base-de-datos/` |
| 3 | Diccionario generado desde los comentarios, con verificación en la CI y mensaje que nombra el objeto | PBD-03 | Script del diccionario (T-23) |
| 4 | Migraciones probadas en la CI contra PostgreSQL real, de ida y vuelta, con verificación de comentarios | PBD-04 | Paso de CI de T-23 |
| 5 | Versionamiento de datos externos: versión por periodo, fecha de carga, solo lo nuevo o cambiado, lecturas «vigente» y «a la fecha». Precisa el reloj de datos de FLU-08 mientras DVC está aplazado | PBD-05 | `core.md`, sección de datos observados |
| 6 | Separar lo oficial de lo experimental en la base | PBD-06 | — |
| 7 | Ampliar BD-03 con un esquema **`operacion`** (bitácora, mensajes de carga, extracciones, estado de fuentes, notificaciones, auditoría) | PBD-07 | `operacion.md`, P-0004 |
| 8 | Arquitectura desacoplada del origen: `staging` como contrato común, para pasar a la base de datos común de la UPME sin rehacer el producto. Complementa BD-02 | PDA-01 | `staging.md` |
| 9 | Calidad de datos: anomalías con validación humana registrada, conciliación periódica y avisos cuando cambia un dato ya usado | PDA-02, PDA-03, PDA-04 | `core.md`, sección de calidad |
| 10 | Bitácora de cargas con resumen legible y mensajes detallados por carga | PDA-05 | `operacion.md` |
| 11 | Carga de archivos publicados: lectura por encabezados y verificación de identidades internas, con error explícito | PDA-06 | Los 7 cambios de formato entre revisiones (observaciones de X-23) |
| 12 | Convención única entre versiones de una fuente | PDA-07 | Signo de la GD en los anexos de la UPME |
| 13 | Ficha por fuente, con plantilla de 12 secciones | PFU-01 | `fuentes/plantilla-ficha.md`, `fuentes/xm/ficha-sinergox.md` |
| 14 | Guía por entidad al nivel de la de XM, y en `AGENTS.md` la tabla «antes de trabajar con la fuente X, lee Y» (amplía IA-02) | PFU-02 | `fuentes/xm/guia-api-xm.md`, `AGENTS.md` |
| 15 | Protocolo: toda necesidad se vuelve regla local y pendiente para el estándar, con contexto y prompt | PFL-01 | Este archivo |
| 16 | Ampliar FLU-09: reglas propias de cada proyecto en un documento con IDs propios; al copiar una versión nueva del estándar, se revisan las que ya pasaron y que no haya contradicciones | PFL-02 | `docs/tecnica/reglas-proyecto.md`, `scripts/referencias.py` |
| 17 | Corregir BD-03: columnas de `raw` en inglés (`source`, `loaded_at`, `source_file`) con comentarios en español | PBD-01 | — |
| 18 | Una línea en las fichas generales `postgresql` y `sqlalchemy-alembic` sobre cómo se prueban las migraciones en la CI | PBD-04 | — |

No va al estándar: PER-01 (cálculo del error), que es propia del dominio de la Subdirección.

## Insumos

Todo está en `proyecciones-demanda`, rama `develop`, después de unir los PR de T-22 (#32) y T-23:

- `docs/tecnica/reglas-proyecto.md`
- `docs/tecnica/base-de-datos/` (incluye `fuentes/`)
- `docs/decisiones/0004-modelo-datos-v2.md`
- `backend/alembic/versions/0003_*.py`, el script del diccionario y el paso de la CI (T-23)
- `AGENTS.md` (tabla de fuentes y revisión al actualizar `reglas/`)
- `scripts/referencias.py` (lee las reglas del proyecto)

No agregan tecnologías: PostgreSQL, Alembic y GitHub Actions ya están en el registro (TEC-05).

## Pasos

- [ ] Unir los PR de T-22 y T-23 para que todos los insumos estén en `develop`.
- [ ] Ejecutar el prompt de abajo en Claude Code abierto en `upme-estandares` y revisar el PR.
- [ ] Publicar la versión nueva del estándar.
- [ ] En este proyecto: copiar la versión nueva (FLU-09) y aplicar PFL-02: reemplazar en `reglas-proyecto.md` las reglas que pasaron al estándar por la referencia a la regla del estándar, revisar contradicciones y cerrar este pendiente.

## Prompt para `upme-estandares`

Para ejecutar en Claude Code abierto en `upme-estandares`. Antes, ten a mano `proyecciones-demanda` (en el disco o en GitHub, rama `develop`).

```
Propuesta desde proyecciones-demanda (pendiente X-22): llevar al estándar las reglas de base de
datos, datos, fuentes y flujo que ese proyecto creó al revisar su modelo de datos, y corregir BD-03.

Contexto: al revisar el modelo de datos con datos reales (XM, anexos de revisiones de la UPME) el
proyecto encontró que el estándar no pide comentar esquemas ni verifica comentarios, no pide
documentar cada esquema y tabla, no prueba las migraciones contra PostgreSQL, no dice cómo
versionar datos externos que cambian en la fuente, ni cómo registrar las cargas, ni cómo diseñar
hoy para pasar mañana a la base de datos común de la UPME (BD-02). Además BD-03 nombra columnas de
raw en español y BD-05 pide inglés. Lee primero en ese repositorio:
docs/pendientes/x-22-reglas-al-estandar.md (tabla «Qué llevar al estándar»),
docs/tecnica/reglas-proyecto.md (reglas PBD, PDA, PFU y PFL), docs/tecnica/base-de-datos/
(index, raw, staging, core, publicacion, auth, operacion, convenciones, vistas, fuentes/),
docs/decisiones/0004-modelo-datos-v2.md, AGENTS.md, scripts/referencias.py, la migración 0003,
el script del diccionario y el paso de PostgreSQL de .github/workflows/ci.yml.

No repitas lo que ya tiene pendiente propio en ese proyecto: prácticas de documentación y
arranque (X-21), ciclo con asistentes (X-20), componentes (X-13), íconos (X-17). No lleves PER-01
(cálculo del error): es del dominio de la Subdirección de Demanda.

Haz lo siguiente y abre un PR:
1. REGLAS-TECNICAS.md, sección Bases de datos:
   a) amplía BD-05: comentario en español en esquemas, tablas, vistas y columnas, escrito en la
      migración (PBD-01);
   b) corrige BD-03: columnas de raw en inglés (source, loaded_at, source_file) y agrega el
      esquema operacion con su propósito (PBD-07);
   c) reglas nuevas, con IDs BD que no se usen: diccionario generado y verificado (PBD-03),
      migraciones probadas en la CI contra PostgreSQL de ida y vuelta (PBD-04), versionamiento de
      datos externos (PBD-05), separación de lo oficial y lo experimental (PBD-06), arquitectura
      desacoplada del origen con staging como contrato (PDA-01, complementa BD-02), anomalías,
      conciliación y avisos (PDA-02 a PDA-04), bitácora de cargas (PDA-05), lectura de archivos
      publicados por encabezados con verificación (PDA-06) y convención única entre versiones de
      una fuente (PDA-07). Nivel DEBE salvo que veas razón para otro.
2. REGLAS-FLUJO.md:
   a) documentación: sección «Base de datos» de la guía técnica (PBD-02), ficha por fuente con la
      plantilla de 12 secciones (PFU-01) y guía por entidad (PFU-02), en la estructura de
      documentación del proyecto;
   b) amplía FLU-09: reglas propias de cada proyecto en docs/tecnica/reglas-proyecto.md con IDs
      propios, y la revisión al copiar una versión nueva (PFL-02);
   c) el protocolo regla local + pendiente para el estándar (PFL-01);
   d) IA-02: que AGENTS.md incluya la tabla «antes de trabajar con la fuente X, lee Y».
3. Plantilla de proyecto: agrega la plantilla de ficha de fuente, un esqueleto de la sección
   «Base de datos», el script del diccionario, el paso de CI con PostgreSQL y la lectura de
   reglas-proyecto.md en referencias.py. Adapta lo que sea propio de proyecciones-demanda (nombres
   de tablas, IDs T-xx y X-xx) para que sirva a cualquier proyecto.
4. Fichas generales postgresql y sqlalchemy-alembic: una línea sobre cómo se prueban las
   migraciones en la CI.
5. Confirma que nada introduce tecnologías nuevas (TEC-05): PostgreSQL, Alembic y GitHub Actions
   ya están en el registro. Anótalo.
6. CHANGELOG del estándar con versión MENOR (o MAYOR si consideras incompatible el cambio de
   nombres de columnas de BD-03) y un resumen del PR que cite los IDs y, para cada regla nueva, la
   regla local de la que viene.

Si una regla existente choca con algo de esto, no la cambies por tu cuenta: anótalo en el resumen
y propone un ADR.
```

## Historial

- 2026-11-10: se crea con la revisión del modelo de datos (#32).
