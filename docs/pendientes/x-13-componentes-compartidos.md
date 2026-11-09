---
id: X-13
tema: Componentes compartidos entre proyectos
responsable: Líder
estado: Abierto
revisar: al cerrar T-08, o antes si otro proyecto necesita los componentes
creado: 2026-11-08
relacionado: [T-05, T-06, T-07, T-08, CMP-01, CMP-02, TEC-05, IA-05, FLU-09]
---

# X-13 · Componentes compartidos entre proyectos

**Pregunta a resolver:** ¿cómo comparten los proyectos de la UPME sus componentes de interfaz y su galería, en lugar de que cada uno escriba los suyos?

## Contexto

En T-05 (#8) se construyeron los componentes base del frontend (botones, etiquetas, tarjetas de indicadores, contenedor de gráficos, estados de vista…) y una **galería solo de desarrollo** en `/dev/componentes`, que muestra cada componente con sus variantes en tema claro y oscuro. Ver [Frontend](../tecnica/frontend.md).

Se acordó como **convención de este proyecto** que todo componente nuevo se agregue a la galería en el mismo PR. No es una regla del estándar: las reglas con ID solo se crean en `upme-estandares` (FLU-09).

## El problema

Hoy `upme-estandares` entrega a cada proyecto, en `dist/upme/`, los tokens, el preset de Tailwind, el tema de ECharts, los logos y los íconos. **No entrega componentes de React.** CMP-01 pide que un componente nuevo se agregue «al inventario del estándar y al del proyecto», pero el inventario del estándar es una tabla de texto: el código lo escribe cada proyecto.

Con varias aplicaciones de la UPME, esto lleva a:

- componentes duplicados en cada proyecto, que con el tiempo se diferencian;
- correcciones (accesibilidad, formatos, marca) que hay que repetir en cada uno;
- ningún catálogo común para saber qué existe antes de crear algo.

A favor: los componentes de este proyecto ya **leen solo tokens** (CMP-02), sin colores fijos, así que sirven para cualquier marca que cumpla el contrato. Extraerlos no exigiría reescribirlos.

## Alternativas

| Opción | Cómo funciona | A favor | En contra |
| --- | --- | --- | --- |
| **A. Copia en `dist/`** | `upme-estandares` incluye los componentes en `dist/upme/componentes/` y cada proyecto los copia como hoy los tokens (FLU-09) | Sigue el modelo actual; sin infraestructura nueva | Copiar y actualizar a mano; fácil modificarlos localmente por error |
| **B. Paquete versionado** | Paquete `@upme/ui` publicado en GitHub Packages; cada proyecto lo instala con una versión | Actualizar es cambiar un número; nadie lo modifica localmente | Registro de paquetes, tokens de acceso y publicación por CI |
| **C. B + catálogo publicado** | Lo anterior más la galería (propia o Storybook) publicada como sitio | Un único catálogo para todo el equipo | Lo más costoso de montar y mantener; Storybook es tecnología nueva |

Cualquiera de las tres cambia la arquitectura del estándar: se decide con un **ADR en `upme-estandares`** (TEC-05). Un asistente de IA no la introduce desde este proyecto (IA-05).

## Recomendación

1. **Ahora:** mantener la galería como convención de este proyecto (hecho) y seguir construyendo T-06 a T-08 sin extraer nada: los componentes todavía van a cambiar, y extraerlos ya obligaría a publicar una versión por cada ajuste.
2. **Proponer al estándar una regla CMP-04** («toda app tiene una galería de componentes solo de desarrollo; cada componente nuevo se agrega en el mismo PR»). No depende de la opción que se elija después.
3. **Al cerrar T-08**, con los componentes estabilizados, escribir el ADR para elegir entre A, B o C.
4. **Adelantarlo** si otro proyecto con marca UPME (por ejemplo, Incentivos) necesita los componentes antes.

## Criterios para decidir

- ¿Cuántos proyectos usarían los componentes en el próximo año?
- ¿Quién mantiene el paquete y revisa sus cambios?
- ¿Se puede usar GitHub Packages con la organización y el plan actuales (GitHub Free)?
- ¿Cuánto esfuerzo cuesta actualizar un proyecto a una versión nueva?

## Pasos

- [x] Convención del proyecto en `docs/tecnica/frontend.md` y `AGENTS.md` (#8).
- [ ] Proponer CMP-04 en `upme-estandares` (prompt abajo).
- [ ] Al cerrar T-08: ADR del paquete compartido en `upme-estandares`.
- [ ] Según el ADR: extraer los componentes, actualizar FLU-09 y este proyecto.

## Prompt para `upme-estandares`

Para ejecutar en Claude Code abierto en `upme-estandares` (IA-05):

```
Propuesta desde proyecciones-demanda (pendiente X-13).

1. Agrega a REGLAS-DISENO.md, sección Componentes, la regla CMP-04 (DEBE): "Toda aplicación con
   frontend tiene una galería de componentes solo de desarrollo (no entra al build de producción
   ni al inventario de vistas). Cada componente nuevo o variante nueva se agrega a la galería en
   el mismo PR, en tema claro y oscuro. Antes de crear un componente se revisa la galería (CMP-01)."
   Agrega el punto a la lista de verificación de la Revisión de diseño (REV) y una entrada al
   CHANGELOG (versión MENOR).

2. Abre un ADR en estado "Propuesta" sobre cómo compartir los componentes de React entre proyectos.
   Alternativas: A) copiarlos en dist/<marca>/componentes/ como los tokens (FLU-09); B) paquete
   versionado @upme/ui en GitHub Packages; C) B más un catálogo publicado (galería propia o
   Storybook). Evalúa licencias, costo con GitHub Free, mantenimiento y esfuerzo de actualización
   (TEC-05). Toma como base los componentes de proyecciones-demanda (frontend/src/components/),
   que leen solo tokens (CMP-02). No elijas todavía: deja la decisión para el líder.
```

## Historial

- 2026-11-08: se crea al construir la estructura base del frontend (T-05, #8).
