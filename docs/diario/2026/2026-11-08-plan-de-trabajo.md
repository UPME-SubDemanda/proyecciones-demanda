---
fecha: 2026-11-08
autor: David Bedoya
pr: 10
issue: 7
tipo: modifica
vistas: [portal-inicio, modo-pantalla]
features: [plan-de-trabajo]
version: sin publicar
---

## Qué cambió
- Los pendientes del proyecto ahora empiezan con un **plan de trabajo**: 20 pasos ordenados, cada uno con su etapa, de qué depende, su issue, su PR y su estado. Así se ve qué está hecho, qué sigue y qué está bloqueado.
- El **portal público** y el **modo pantalla** se adelantan a la etapa 1.1. Las notificaciones por Google Chat pasan a la 1.2.
- Se decidió construir primero la parte visual con **cifras ilustrativas** guardadas en el código del frontend, mientras se reúnen los datos reales. No se crean tablas de prueba.

## Por qué
El portal y el modo pantalla son clave para presentar el proyecto. Construir la parte visual mientras llegan los datos permite avanzar sin esperar, y el modelo de datos se ajusta cuando se conozcan los datos reales.

## Cómo se ve
Sección «Plan de trabajo» en `docs/pendientes.md`.

## Notas técnicas
- Etapas actualizadas en `docs/producto/index.md`, `docs/tecnica/diseno-app.md`, `docs/tecnica/flujos.md`, `docs/tecnica/versionado.md`, `docs/tecnica/modelo-de-datos.md`, `docs/tecnica/mockups/README.md`, la página del inventario de modo pantalla y los pendientes X-07 y X-11.
- Nuevo paso T-20 (página de referencias, #9) y nuevo pendiente X-12: llevar documentación y pendientes a Notion (espejo o fuente).
- El plan completo enlazado en `docs/producto/index.md` (documento externo) todavía muestra el orden de etapas anterior.
