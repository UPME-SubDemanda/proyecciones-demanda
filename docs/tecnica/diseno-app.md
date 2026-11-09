# Diseño propio de la app

Sigue `reglas/REGLAS-DISENO.md` y `reglas/MARCA-UPME.md`. Mockups aprobados: `docs/tecnica/mockups/` (capturas congeladas y registro de aprobación); tablero fuente: https://claude.ai/artifact/DJrR79dHKDgYv77oe9b3sX. Si un mockup contradice el estándar, manda el estándar.

## Zonas activas
- **App interna** `/app` (etapa 1)
- **Portal público** `/` (etapa 1.1)
- **Modo pantalla** `/pantalla` (etapa 1.1)

## Menú lateral (LAY-06)

Definido en código en `frontend/src/zones/app/navigation.ts`, en este mismo orden. Solo se muestran las vistas construidas (`built: true`) y permitidas al rol (UX-08); cada vista nueva activa su ítem en el PR que la construye.

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
Tableros iniciales: Energía eléctrica · Gas natural · Variables exógenas · Comparar proyecciones · El sistema hoy. Construidos (T-07): todos menos Variables exógenas, que espera mockup (T-21). Claves en la URL: `ee`, `gn`, `comparar`, `sistema`.

## Excepciones aprobadas
| Regla | Excepción | ADR |
| --- | --- | --- |
| — | Ninguna | — |
