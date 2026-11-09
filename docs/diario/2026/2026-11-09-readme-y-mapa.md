---
fecha: 2026-11-09
autor: David Bedoya
pr: ?
issue: 29
tipo: agrega
vistas: []
features: [readme, mapa-repositorio]
version: sin publicar
---

## Qué cambió
El README del repositorio pasó de dos comandos a una **puerta de entrada** completa:
- qué es el proyecto y en qué estado está;
- cómo arrancar en 5 minutos;
- cómo trabajamos, con issues, ramas, PR y la definición de hecho;
- qué se documenta y dónde, y las reglas en un minuto;
- cómo funcionan las piezas;
- un **mapa de cada carpeta**, con qué debe ir en ella;
- comandos frecuentes, qué no hacer, la lista antes del primer PR, asistentes de IA, un glosario y a quién preguntar.

Resume y enlaza a la documentación completa.

El mapa se genera solo. Si alguien crea una carpeta y no la describe, el commit se detiene y la CI falla.

Todo lo que este proyecto inventó para documentar y arrancar quedó en un pendiente nuevo, **X-21**, con el prompt para proponerlo en `upme-estandares`.

## Por qué
El README es lo primero que ve quien llega al repositorio. Con él se entiende el proyecto y cómo trabajar sin preguntarle a nadie.

## Cómo se ve
`README.md` en GitHub, con índice al inicio.

## Notas técnicas
- `repo-map.toml`: carpetas de primer y segundo nivel, y de tercer nivel en `frontend/src`, `backend/app`, `docs/tecnica` y `docs/usuario`; cada una con `breve` y `va_aqui`. Archivos de configuración principales.
- `scripts/mapa.py`: escribe el mapa entre las marcas `mapa:inicio`/`mapa:fin` del README. `--check` falla si falta o sobra una descripción, o si el mapa no está al día. Solo cuentan las carpetas con archivos versionados (`git ls-files`). Hook `pre-commit` y paso nuevo en la CI.
- Regla en `AGENTS.md` (9) y en `docs/tecnica/index.md`: quien crea una carpeta la describe en el mismo PR.
- Los enlaces del índice usan las anclas de GitHub, que conservan las tildes.
- `.pre-commit-config.yaml` (plantilla) no se usa: los hooks activos están en `.githooks/`. Queda para decidir en X-21.
- Pendiente X-21 con página de detalle (`docs/pendientes/x-21-estandarizar-practicas.md`): diez prácticas, insumos, decisiones y prompt. Relacionado con X-13, X-17 y X-20.
