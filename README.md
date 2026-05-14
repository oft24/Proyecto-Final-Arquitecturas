# MediSync — Sistema de Gestión Médica

> Plataforma web para la administración de citas, expedientes y personal médico en clínicas y hospitales.

---

## Equipo de Desarrollo — Equipo 2

| Rol               | Nombre |
|-------------------|--------|
| Product Owner     |        |
| Scrum Master      |        |
| Arquitecto        |        |
| Developer Web     |        |
| Developer Web     |        |

---

## Descripción del Proyecto

MediSync es una aplicación full-stack que permite gestionar el flujo completo de una clínica:

- **Director**: visualiza estadísticas del hospital, registra médicos y recepcionistas, consulta métricas por especialidad y rendimiento individual de cada médico.
- **Médico**: gestiona su agenda, atiende citas y genera expedientes clínicos.
- **Recepcionista**: agenda citas, administra pacientes y consulta el estado de las citas.
- **Paciente**: agenda citas, consulta su historial de citas y accede a su expediente médico.

---

## Arquitectura

```
medisync/
├── frontend/          # React 19 + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express 5 + Prisma ORM + PostgreSQL
├── services/python/   # FastAPI (servicio de automatización / análisis)
└── package.json       # Workspace raíz con scripts concurrentes
```

---

## Requisitos Previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior  |
| Python      | 3.10 o superior |
| pip / uvicorn | cualquier versión reciente |
| PostgreSQL  | 14.x (o acceso a instancia RDS) |

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd medisync
```

### 2. Instalar dependencias

```bash
# Desde la raíz — instala todo el workspace
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Configurar variables de entorno

Crea o edita el archivo `backend/.env`:

Las variables no se muestran

### 4. Ejecutar migraciones de base de datos

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

### 5. Instalar dependencias de Python

```bash
cd services/python
pip install -r requirements.txt
cd ../..
```

---

## Levantar el Proyecto

### Opción A — Todo junto (recomendado para desarrollo)

```bash
npm run dev
```

Esto levanta en paralelo:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:4000
- **Python Service** → http://localhost:8001

### Opción B — Servicios por separado

```bash
# Frontend
npm run dev --prefix frontend

# Backend
npm run dev --prefix backend

# Python
python -m uvicorn app.main:app --reload --port 8001 --app-dir services/python
```

---

## Endpoints Principales de la API

Base URL: `http://localhost:4000/api`

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| POST | `/auth/login` | Iniciar sesión | Público |
| POST | `/auth/register` | Registrar usuario (staff) | Público |
| POST | `/auth/register/patient` | Registrar paciente | Público |
| GET | `/director/stats` | Estadísticas del hospital | Director |
| GET | `/director/medicos` | Médicos con estadísticas | Director |
| GET | `/users/personal` | Lista de personal | Director |
| DELETE | `/users/personal/:tipo/:id` | Eliminar personal | Director |
| GET | `/doctor/dashboard` | Dashboard del médico | Médico |
| GET | `/doctor/citas` | Citas del médico | Médico |
| POST | `/doctor/citas/:id/atender` | Atender cita y crear expediente | Médico |
| GET | `/appointments/doctors` | Lista de médicos disponibles | Público |
| POST | `/appointments/book` | Agendar cita | Autenticado |
| DELETE | `/appointments/:id` | Cancelar cita | Autenticado |
| GET | `/patient/:id/records` | Expedientes del paciente | Autenticado |
| GET | `/patient/:id/stats` | Estadísticas del paciente | Autenticado |

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| `director` | Dashboard con métricas, gestión de personal, estadísticas por médico |
| `medico` | Agenda, atención de citas, expedientes de sus pacientes |
| `recepcionista` | Agendar citas, gestión de pacientes |
| `paciente` | Ver y cancelar sus citas, consultar su expediente |

---

## Stack Tecnológico

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Axios
- React Hook Form + Zod
- Lucide React (iconos)
- React Hot Toast

### Backend
- Node.js + Express 5
- Prisma ORM 6 + PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator

### Servicio Python
- FastAPI
- Uvicorn
- Pydantic

### Infraestructura
- Base de datos: PostgreSQL en AWS RDS
- Autenticación: JWT (access token en localStorage)

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Levanta frontend + backend + python en paralelo |
| `npm run start:frontend` | Sirve el build del frontend |
| `npm run start:backend` | Inicia el backend en producción |
| `npm install --prefix backend` | Instala dependencias del backend |
| `npm install --prefix frontend` | Instala dependencias del frontend |
| `npx prisma migrate dev` | Crea y aplica una nueva migración |
| `npx prisma studio` | Abre el explorador visual de la base de datos |

---

## Estructura de Carpetas

```
backend/src/
├── config/          # Configuración de Prisma y variables de entorno
├── controllers/     # Lógica de cada endpoint
├── middleware/      # Auth y manejo de errores
├── routes/          # Definición de rutas por módulo
├── services/        # Lógica de negocio y consultas a BD
└── utils/           # Utilidades (tokens JWT)

frontend/src/
├── components/      # Componentes reutilizables (cards, layout, ui)
├── context/         # AuthContext (estado global de sesión)
├── lib/             # Cliente Axios y utilidades
├── pages/           # Páginas por rol (director, doctor, patient, recepcionista)
└── routes/          # Guards de rutas (ProtectedRoute, RoleGuard)
```
