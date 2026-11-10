# Librerías de soporte

Librerías pequeñas que no son una tecnología del stack. Por TEC-06 no necesitan ADR, pero cada una queda anotada aquí con su propósito. Una librería que cambie la arquitectura o el stack sigue el proceso TEC-05.

| Librería | Dónde | Para qué | Desde |
| --- | --- | --- | --- |
| `openpyxl` | `pipelines/` | Leer los anexos `.xlsx` de las revisiones de la UPME celda por celda, con sus encabezados (`pipelines/lib/upme_annex.py`). También es la que usa `pandas` para leer Excel | T-24 (issue #36) |
