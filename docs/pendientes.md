# Pendientes del proyecto

Los pendientes generales (servidores, Keycloak, DVC, Prefect vs. Dagster, Google Chat, aprobación de PR, revisión automática, publicación de documentación…) están en `PENDIENTES.md` de `upme-estandares`.

| ID | Tema | Qué falta | Responsable | Estado |
| --- | --- | --- | --- | --- |
| X-01 | Fuentes y formatos | Reunir archivos de revisiones pasadas, series reales y exógenas; definir tablas `raw`/`staging` | Equipo | Abierto |
| X-02 | Histórico | Desde qué revisión cargar (EE y GN) | Líder | Abierto |
| X-03 | Umbrales de error | Umbrales aceptables por producto y horizonte para alertas | Subdirectora | Abierto |
| X-04 | Publicación | Qué desagregaciones son públicas (regional, sectorial, horaria) | Líder + jurídica | Abierto |
| X-05 | Aprobación de revisiones | Quién aprueba formalmente y con qué acto administrativo. El mockup aprobado de ejecutar proyección asume doble aprobación (líder técnico y Subdirectora): confirmarlo o ajustar el mockup | Subdirectora | Abierto |
| X-06 | Aprobación de mockups | 8 pantallas aprobadas el 2026-11-08 (`docs/tecnica/mockups/`). Faltan mockups de proyección vs. real, comparar revisiones, usuarios y roles, inicio de la app, ingresar, alertas y datos y documentación (FLU-03) | Líder | Parcial |
| X-07 | Catálogo de notificaciones | Confirmar eventos y espacios de Google Chat para la etapa 1.1 | Líder | Planeado (1.1) |
| X-08 | Migración de modelos | Plan de migración de MATLAB a Python y modelos sin ruta definida | Equipo de modelos | Planeado (fase 2) |
| X-09 | Corrección de revisiones | Agregar estado `superseded` y columna `supersedes_id` en `core.revisions` para enlazar una revisión corregida con la original (P-0003). El mockup aprobado del histórico ya muestra «Crear corrección»: alinear el flujo con esta decisión | Equipo | Abierto |
| X-10 | Vistas del menú sin inventario | Los mockups aprobados muestran en el menú **Alertas** y **Datos y documentación**, sin página en `docs/usuario/inventario/`; «Datos y documentación» tampoco está en el menú de `docs/tecnica/diseno-app.md`. Decidir si son vistas, crear su ficha (FLU-01) y su página (DOC-01) | Líder | Abierto |
| X-11 | Contenidos del portal | El mockup aprobado del portal tiene marcadores por completar: logo oficial desde el CDN de GOV.CO, dirección, teléfono y horario de atención, correo de notificaciones judiciales y redes sociales de la UPME | Líder | Planeado (1.2) |
