from typing import Annotated
from pydantic import StringConstraints
from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead

Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]


class ProductoCreate(SQLModel):
    nombre: Nombre
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    nombre: Nombre | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool | None = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
