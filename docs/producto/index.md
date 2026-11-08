# Proyecciones de Demanda

Plataforma de la Subdirección de Demanda de la UPME para consultar, comparar y monitorear las proyecciones de demanda de **energía eléctrica (EE)** y **gas natural (GN)**: lo proyectado frente a lo real, la evolución entre revisiones publicadas y el comportamiento de las variables exógenas.

- Plan completo (documento editable): https://claude.ai/artifact/XumGS9rhE8cUY1RJUocBiX
- Mockups de referencia (tablero de diseño, 8 pantallas): https://claude.ai/artifact/DJrR79dHKDgYv77oe9b3sX

## Objetivos
1. **Trazabilidad**: cada revisión publicada, con sus escenarios, supuestos y fecha de corte, consultable en un solo lugar.
2. **Seguimiento**: comparar automáticamente la revisión vigente contra el dato real, con indicadores de error.
3. **Alerta temprana**: detectar desvíos del dato real y de las variables exógenas frente a los supuestos.
4. **Comunicación por niveles**: modeladores, Subdirectora, Director, entidad y público, desde la misma fuente.
5. **Base para modelos**: preparar el terreno para ejecutar y versionar modelos en la plataforma (fase 2).

## Públicos
Modeladores · Subdirectora de Demanda · Director · funcionarios UPME · otras entidades públicas · empresas del sector · academia · ciudadanía.

## Hoja de ruta

| Etapa | Alcance | Estado |
| --- | --- | --- |
| **1 · Arranque** | Cargar en PostgreSQL: series históricas reales (EE y GN), **revisiones ya publicadas** (escenarios por año/mes) y variables exógenas con los supuestos de cada revisión. Vistas: tablero ejecutivo, proyección vs. real, histórico de revisiones, comparar revisiones, monitor de exógenas. Autenticación con módulo compartido. | Por iniciar |
| **1.1 · Notificaciones** | Google Chat: fallas de carga, desvío fuera de umbral, exógenas fuera de supuesto, publicación de revisiones (P-05 del estándar). | Planeada |
| **1.2 · Público** | Portal público y modo pantalla para televisores con datos publicados. | Planeada |
| **2 · Modelos** | Migración de modelos de MATLAB a Python, nuevos modelos, ejecución de proyecciones desde la plataforma, **DVC** y **MLflow** obligatorios, registro de modelos. | Planeada |
| **3 · Apertura** | API pública, datos abiertos, simulador de escenarios. | Planeada |

**Fuera del alcance de la etapa 1:** ejecutar o entrenar modelos, versionar modelos o datasets con DVC, notificaciones.
