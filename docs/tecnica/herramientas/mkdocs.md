# MkDocs (Material) en este proyecto

Ficha local (DOC-07). La ficha general está en `upme-estandares/herramientas/`.

## Cómo encaja aquí

Genera los dos sitios de documentación a partir del Markdown de `docs/`:

| Sitio | Configuración | Contenido | Público |
| --- | --- | --- | --- |
| Guía de usuario | `mkdocs.usuario.yml` | `docs/usuario/` | Sí (publicación pendiente, P-08) |
| Documentación técnica | `mkdocs.tecnica.yml` | `docs/` completo, menos las capturas | No (publicación pendiente, P-09) |

## Dónde está

- En Docker: servicios `docs-usuario` (http://localhost:8002) y `docs-tecnica` (http://localhost:8001) de `docker-compose.yml`, con el repositorio montado y recarga al guardar.
- Imagen: `squidfunk/mkdocs-material` con versión fija, la misma que usa la CI (hoy 9.8.1). Es la imagen oficial de la misma herramienta del stack: no es una tecnología nueva (TEC-06).
- En la CI: `uvx --with mkdocs-material mkdocs build --strict` para los dos sitios (`.github/workflows/ci.yml`).

## Comandos

```bash
docker compose up -d docs-usuario docs-tecnica           # servir los dos sitios
docker compose logs -f docs-tecnica                       # ver advertencias al guardar
uvx --with mkdocs-material mkdocs build --strict -f mkdocs.tecnica.yml -d /tmp/sitio   # verificar como la CI
```

## Reglas propias

- **Verificar sin `-q`.** Con `-q` (silencio) MkDocs no cuenta las advertencias y el modo estricto no falla, pero la CI sí.
- **Enlaces:** en modo estricto, un enlace a un archivo que no existe hace fallar la CI. Antes de borrar una captura, buscar quién la enlaza (también el diario).
- Las capturas de la guía (`docs/usuario/capturas/`) se excluyen del sitio técnico: los enlaces a ellas desde la técnica aparecen como «INFO», no como error.
- Las páginas generadas (`referencias.md`, el índice del inventario y el del diario) no se editan a mano (`docs/tecnica/index.md`, «Páginas generadas»).
- Al actualizar la versión de Material, cambiarla en `docker-compose.yml` para que coincida con la CI.
