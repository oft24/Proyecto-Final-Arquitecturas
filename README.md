# MediSync - Fullstack SaaS Medico

Reestructuracion completa del sistema con arquitectura moderna:

- `client/` -> React + Vite + Tailwind + Router + Framer Motion
- `server/` -> Node.js + Express + JWT + Prisma (PostgreSQL)
- `python_service/` -> FastAPI para analitica y automatizacion medica

La app inicia en ` /login ` y maneja rutas protegidas por rol:

- Doctor: `/doctor/dashboard`, `/doctor/agenda`, `/doctor/pacientes`
- Paciente: `/patient/dashboard`, `/patient/citas`, `/patient/expediente`, `/patient/agendar`

## Frontend

```bash
cd client
npm install
npm run dev
```

## Backend Node

```bash
cd server
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

## Python Service

```bash
cd python_service
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Un solo comando (instala y ejecuta todo)

Desde la raiz del proyecto:

```bash
npm install
npm run start:all
```

Este comando hace:

- instala dependencias de `client` y `server`
- crea `server/.env` automaticamente si no existe
- ejecuta `prisma generate`
- instala dependencias de `python_service`
- levanta frontend, backend y FastAPI en paralelo
