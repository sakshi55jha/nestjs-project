# Competors Platform

A competition management platform built with **NestJS backend** and **Next.js frontend**.  
Supports creating competitions, participant registration, and notifications (simulated mailbox using Redis + Bull).

---

## **1. Git Repo (Monorepo)**

- **Structure:**
competors/

├─ apps/

│ ├─ backend/ ← NestJS API

| ├─  ├─ prisma/

│     ├─ schema.prisma

│     └─ seed.ts

|

│ └─ web(frontend)/ ← Next.js app (minimal pages: create competition, register, 

   view mailbox)

├─ docker-compose.yml

├─ package.json

└─ .env.example

## **docker-compose.yml & .env.example**
**docker-compose.yml** includes:
  - **PostgreSQL** database
  - **Redis** queue
  - **NestJS backend** (depends on DB + Redis)

  **.env**: 

DATABASE_URL="postgresql://neondb_owner:npg_jsO0xq7AiwRU@ep-bitter-haze-adjyvfpe-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

JWT_SECRET="supersecret"

REDIS_HOST=127.0.0.1

REDIS_PORT=6379

### Prisma Migrations + Seed Script: 

Migrations are included in prisma/migrations/

Seed script (prisma/seed.ts) populates the DB with:

2 organizers

5 participants

5 competitions

### Run commands:
npx prisma migrate dev 

npx prisma db seed 

### 1.Start services using Docker:
cd apps

docker-compose up -d redis db

docker ps

docker logs redis

### Install dependencies
cd apps/backend

npm install

cd apps/web

npm install

### Run backend
cd apps/backend

npm run start:dev

### Run frontend
cd apps/web

npm run dev

### Open frontend
http://localhost:3000


### Architecture Notes

Idempotency:
Registrations are idempotent using idempotencyKey.

Prevents duplicate registration even if requests are retried.

### Concurrency:
Multiple users registering at the same time handled safely with:

Database transactions:

Redis + Bull queues for asynchronous jobs (notifications/reminders)

### Trade-offs:
Feature	Trade-off

Idempotency	Ensures no duplicates, but extra storage for unique keys

Concurrency	Safe parallel operations, slight latency due to transactions

Background jobs	Async notifications → faster API response, eventual consistency

### Notes:

Backend: NestJS + Prisma + Bull + Redis

Frontend: Next.js + TailwindCSS + Framer Motion

Database: PostgreSQL

### API Testing (Postman/cURL):
* `POST http://localhost:3001/api/auth/signup`
* `POST http://localhost:3001/api/auth/login`
* `POST http://localhost:3001/api/competitions` (Requires Organizer Auth)
* `POST http://localhost:3001/api/competitions/:id/register`  (Requires **`Idempotency-Key`** header)