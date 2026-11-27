# Food Store - TPI Programación IV

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos indicando dirección de entrega y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/paschedev/FoodStore-ProgIV-TPI
- **Video de demostración:** _(completar con el link público del video)_

## Tecnologías

| Proyecto | Stack |
| --- | --- |
| `backend/` | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose + passlib/bcrypt) |
| `frontend/` | React 19, TypeScript (strict), Vite, Tailwind CSS, TanStack Query / Form / Table, React Router, Zustand, Axios |

## Requisitos

- Python 3.11 a 3.13
- Node.js 20.19 o superior y pnpm 10 (`npm install -g pnpm`)
- PostgreSQL 15 o superior

## Estructura

```
FoodStore-ProgIV-TPI/
├── backend/
│   ├── app/
│   │   ├── core/        configuración, base de datos, seguridad, dependencias, BaseRepository y UnitOfWork
│   │   ├── modules/     auth, usuarios, categorias, productos y pedidos (router, service, unit of work, repository, models, schemas)
│   │   ├── db/seed.py   datos iniciales
│   │   └── main.py
│   ├── api.http         pruebas de todos los endpoints con REST Client
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── features/    auth, categorias, productos, pedidos y usuarios (api, components, hooks, pages, types)
│   │   ├── shared/      cliente Axios, componentes y UI compartidos, layouts
│   │   ├── store/       authStore y cartStore (Zustand + persist)
│   │   └── routes/      AppRouter y ProtectedRoute
│   └── .env.example
└── README.md
```

## Backend

### 1. Base de datos

Crear una base vacía en PostgreSQL (las tablas se crean solas):

```
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

Si se prefiere Docker:

```
docker run --name foodstore-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=foodstore_db -p 5432:5432 -d postgres:16
```

### 2. Instalación

```
cd backend
python -m venv .venv            (si hay varias versiones en Windows: py -3.11 -m venv .venv)
.venv\Scripts\activate          (Linux / macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          (Linux / macOS: cp .env.example .env)
```

Editar `.env` con el usuario y la contraseña de PostgreSQL y una `SECRET_KEY` propia.

### 3. Datos iniciales

```
python -m app.db.seed
```

Crea las tablas y carga los usuarios, 4 categorías y 10 productos con stock. Se puede correr más de una vez sin duplicar datos.

### 4. Ejecución

```
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs y http://localhost:8000/redoc

## Frontend

Con el backend levantado, en otra terminal:

```
cd frontend
pnpm install
copy .env.example .env          (Linux / macOS: cp .env.example .env)
pnpm dev
```

La aplicación queda en http://localhost:5173.

Otros comandos: `pnpm build` (compila TypeScript y genera `dist/`) y `pnpm lint`.

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (driver psycopg2) | `postgresql+psycopg2://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT, mínimo 32 caracteres | `una-clave-larga-y-secreta-de-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |

### `frontend/.env`

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuarios del seed

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `Admin1234!` |
| Cliente | `juan` | `Juan1234!` |

También se pueden registrar clientes nuevos desde `/register`.

## Funcionalidades

**Cliente**

- Registro, login y logout (la sesión viaja en una cookie HttpOnly; el token no queda accesible desde JavaScript ni en localStorage).
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría, skeleton y estado vacío.
- Carrito persistido en el navegador y checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- Mis pedidos: listado con filtro por estado, detalle y cancelación mientras el pedido está `PENDIENTE`.

**Administrador** (`/admin`)

- Resumen con tarjetas: pedidos del día, ingresos de pedidos entregados y cantidad por estado.
- Pedidos: listado de todos los pedidos, detalle y cambio de estado según la máquina de estados (`PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los dos primeros).
- ABM de productos (con cambio de stock y disponibilidad) y de categorías con TanStack Table y TanStack Form.
- Usuarios: activar y desactivar cuentas (el admin no puede desactivarse a sí mismo).

**Reglas de negocio**

- Al crear un pedido se valida que cada producto esté activo, disponible y con stock suficiente, se guarda el precio del momento y se descuenta el stock, todo en la misma transacción.
- Al cancelar un pedido se devuelve el stock de sus productos.
- Las bajas de categorías y productos son lógicas (`activo = false`).

## Pruebas de la API

`backend/api.http` tiene requests para todos los endpoints (públicos, sesión de cliente y panel de admin) para correr con la extensión REST Client de VS Code. Como la sesión usa cookie, primero se ejecuta el login de la sección correspondiente.
