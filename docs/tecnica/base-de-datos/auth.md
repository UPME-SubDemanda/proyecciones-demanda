# Esquema `auth`

**Para qué existe:** guardar los usuarios, los roles y qué roles tiene cada usuario, para el módulo de autenticación (cuenta institucional de Google o usuario local). Lo crea la migración `0001` y el modelo v2 no lo cambia, salvo para agregar los comentarios que faltan (PBD-01).

## Tablas

| Tabla | Qué guarda | Columnas |
| --- | --- | --- |
| `roles` | Los roles de la app | `name` (`admin`, `approver`, `modeler`, `viewer`), `description` |
| `users` | Las cuentas | `id`, `email`, `name`, `provider` (`google` o `local`), `password_hash` (solo cuentas locales), `active`, `created_at` |
| `user_roles` | Qué roles tiene cada usuario | `user_id`, `role_name` |

## Uso

- La API consulta el rol para decidir qué vistas y acciones permite (ver `docs/usuario/roles.md`).
- En desarrollo, la API crea al arrancar el usuario `admin@local` con el rol `admin`. Su contraseña está en `DEV_ADMIN_PASSWORD` de `.env` y nunca se comparte ([Inicio de la documentación técnica](../index.md)).
- Las decisiones de las personas sobre los datos, como aceptar una anomalía o publicar una revisión, guardan el usuario que las tomó (`core.data_anomalies.decided_by`, `operacion.audit_log`).
