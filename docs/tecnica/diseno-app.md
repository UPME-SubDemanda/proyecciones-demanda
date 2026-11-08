# Diseño propio de la app

Sigue `reglas/REGLAS-DISENO.md` y `reglas/MARCA-UPME.md`. Mockups de referencia: https://claude.ai/artifact/DJrR79dHKDgYv77oe9b3sX. Si un mockup contradice el estándar, manda el estándar.

## Zonas activas
- **App interna** `/app` (etapa 1)
- **Portal público** `/` (etapa 1.2)
- **Modo pantalla** `/pantalla` (etapa 1.2)

## Menú lateral (LAY-06)
1. **Inicio** — tablero ejecutivo (`home`)
2. **Proyecciones** — Proyección vs. real (`OfertaDemanda`) · Histórico de revisiones (`time`) · Comparar revisiones
3. **Variables** — Monitor de exógenas (`clima`) · Explorador · Correlaciones
4. **Modelos** *(fase 2)* — Registro · Desempeño · Experimentos (`Control`)
5. **Operación** — Ejecutar proyección *(fase 2)* (`Process`) · Cargas de datos · Alertas (`Notification`)
6. **Datos y documentación** (`Planes`)
7. **Administración** — Usuarios y roles (solo `admin`)

## Productos (LAY-07)
Selector global en el encabezado: **Energía eléctrica** (`ee`, amarillo) y **Gas natural** (`gn`, verde). Persiste en la URL (`?producto=ee`).

## Modo pantalla
Tableros iniciales: Energía eléctrica · Gas natural · Variables exógenas · Comparar proyecciones · El sistema hoy.

## Excepciones aprobadas
| Regla | Excepción | ADR |
| --- | --- | --- |
| — | Ninguna | — |
