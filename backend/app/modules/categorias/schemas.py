from typing import Annotated
from pydantic import StringConstraints
from sqlmodel import SQLModel

Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: Nombre
    descripcion: str = ""


class CategoriaUpdate(SQLModel):
    nombre: Nombre | None = None
    descripcion: str | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
