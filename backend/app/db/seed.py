from sqlmodel import Session, select
import app.main  # registra todos los modelos antes de crear las tablas
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", "admin"),
    ("juan", "Juan Pérez", "juan@foodstore.com", "Juan1234!", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas artesanales a la piedra"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Postres y helados"),
]

PRODUCTOS = [
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, rodajas de tomate y ajo", 9500, 15, "Pizzas"),
    ("Pizza Fugazzeta", "Muzzarella y cebolla", 9200, 10, "Pizzas"),
    ("Hamburguesa Clásica", "Medallón de carne, lechuga, tomate y queso", 7800, 25, "Hamburguesas"),
    ("Hamburguesa Doble Bacon", "Doble medallón, cheddar y panceta", 10500, 12, "Hamburguesas"),
    ("Gaseosa Cola 1.5 L", "Línea cola", 2800, 40, "Bebidas"),
    ("Agua Mineral 500 ml", "Sin gas", 1300, 50, "Bebidas"),
    ("Limonada", "Limonada con menta y jengibre", 2500, 30, "Bebidas"),
    ("Flan Casero", "Con dulce de leche", 3200, 18, "Postres"),
    ("Helado 1/4 kg", "Dos gustos a elección", 4500, 22, "Postres"),
]


def imagen(nombre: str) -> str:
    texto = nombre.replace(" ", "+")
    return f"https://placehold.co/400x300/f97316/ffffff?text={texto}"


def cargar_datos() -> None:
    create_all_tables()
    with Session(engine) as session:
        for username, full_name, email, password, role in USUARIOS:
            if not session.exec(select(Usuario).where(Usuario.username == username)).first():
                session.add(Usuario(
                    username=username,
                    full_name=full_name,
                    email=email,
                    hashed_password=hash_password(password),
                    role=role,
                ))

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, categoria in PRODUCTOS:
            if not session.exec(select(Producto).where(Producto.nombre == nombre)).first():
                session.add(Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    imagen_url=imagen(nombre),
                    categoria_id=categorias[categoria].id,
                ))

        session.commit()
    print("Seed cargado: usuarios admin y juan, 4 categorías y 10 productos")


if __name__ == "__main__":
    cargar_datos()
