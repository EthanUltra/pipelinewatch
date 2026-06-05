# PipelineWatch

![CI](https://github.com/EthanUltra/pipelinewatch/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/EthanUltra/pipelinewatch/actions/workflows/deploy.yml/badge.svg)

A Kanban task board with a full **CI/CD pipeline** — automated testing, Docker builds, and zero-downtime deploys on every push to `main`.

**Live demo:** https://pipelinewatch.ethanshrestha.ch

## Pipeline overview

```
git push → GitHub Actions
              ├── CI (every PR)
              │     ├── npm test   (Jest + Supertest, mocked DB)
              │     └── npm lint   (ESLint)
              └── Deploy (merge to main)
                    ├── Pre-deploy test gate
                    ├── Docker build (multi-stage)
                    ├── Push to Docker Hub
                    ├── Trigger Render redeploy
                    └── Health check /api/health
```

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, Prisma |
| Database | PostgreSQL (Neon) |
| Frontend | React, Vite, Tailwind CSS |
| Auth | JWT |
| Tests | Jest, Supertest |
| CI/CD | GitHub Actions |
| Container | Docker (multi-stage build) |
| Hosting | Render (API), Hostpoint (frontend) |

## Local setup

```bash
# Clone
git clone https://github.com/EthanUltra/pipelinewatch
cd pipelinewatch

# Start everything
docker-compose up --build

# Run migrations (first time only)
docker exec pipelinewatch_api npx prisma db push
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Health: http://localhost:4000/api/health

## Running tests

```bash
cd backend
npm install
npm test
```

Tests use mocked Prisma and Argon2 — no database needed to run CI.

## GitHub Actions secrets required

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_API_KEY` | Render API key |
| `RENDER_SERVICE_ID` | Render service ID for the backend |
| `BACKEND_URL` | Live backend URL for health check |

## API endpoints

```
POST /api/auth/register   — create account
POST /api/auth/login      — login
GET  /api/auth/me         — get current user

GET    /api/tasks         — list tasks
POST   /api/tasks         — create task
PATCH  /api/tasks/:id     — update task (title/status/priority)
DELETE /api/tasks/:id     — delete task

GET    /api/health        — health check (used by deploy pipeline)
```
