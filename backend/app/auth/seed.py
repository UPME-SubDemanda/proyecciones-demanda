from sqlalchemy.orm import Session

from app.auth.models import Role

# AUT-04: roles base de todos los proyectos. Un proyecto puede agregar los suyos aquí y documentarlos.
BASE_ROLES = {
    "admin": "Usuarios, roles y configuración",
    "approver": "Aprobar y publicar",
    "modeler": "Ejecutar procesos y gestionar alertas",
    "viewer": "Ver vistas internas",
}


def seed_roles(db: Session) -> None:
    for name, desc in BASE_ROLES.items():
        if not db.get(Role, name):
            db.add(Role(name=name, description=desc))
    db.commit()
