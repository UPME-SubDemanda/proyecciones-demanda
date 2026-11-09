# Proyecciones de Demanda

Plataforma de la Subdirección de Demanda de la UPME para consultar, comparar y monitorear las proyecciones de demanda de energía eléctrica y gas natural.

- Guía de usuario: `docs/usuario/` (sitio público, `mkdocs.usuario.yml`)
- Documentación técnica: `docs/tecnica/` (privada, `mkdocs.tecnica.yml`)
- Cambios: `CHANGELOG.md` y `docs/diario/`
- Reglas de diseño, técnicas y de flujo: `reglas/` (copia de upme-estandares, no editar)
- Contexto para asistentes de IA: `AGENTS.md`

## Empezar

Necesita Docker Desktop abierto y git:

```bash
git clone git@github.com:UPME-SubDemanda/proyecciones-demanda.git
cd proyecciones-demanda
./scripts/dev-setup.sh
```

Listo: app en http://localhost:5173, API en http://localhost:8000/docs, guía de usuario en http://localhost:8002 y documentación técnica en http://localhost:8001. Para ingresar a la app interna: usuario `admin@local`, contraseña en `DEV_ADMIN_PASSWORD` de `.env`.

Detalle, día a día y solución de problemas: `docs/tecnica/index.md`. Cómo trabajamos (issues, ramas, PR): `docs/tecnica/flujo-de-trabajo-equipo.md`.
