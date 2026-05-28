<p align="center">
  <img src="./apps/web/public/tumbfolio.svg" alt="Tumbfolio" width="160" />
</p>

<p align="center" style="font-size:2rem;"><strong>Tumbfolio</strong></p>
<p align="center" style="font-size:1.25rem; margin-top:-1em;"><em>Notebook Presentation Framework</em></p>

<p align="center">
  <strong>Frontend</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-555555?labelColor=000000&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.6-555555?labelColor=61DAFB&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0.3-555555?labelColor=3178C6&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.3.0-555555?labelColor=06B6D4&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <strong>Backend & Infrastructure</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-555555?labelColor=E0234E&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-17.x-555555?labelColor=4169E1&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-5.11.0-555555?labelColor=DC382D&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-5.77.6-555555?labelColor=D82C20&logo=npm&logoColor=white" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Drizzle-0.45.2-555555?labelColor=C5F74F&logo=npm&logoColor=white" alt="Drizzle" />
</p>

<p align="center">
  <strong>Exportadores & Utilitarios</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PptxGenJS-4.0.1-555555?labelColor=EA580C&logo=npm&logoColor=white" alt="PptxGenJS" />
  <img src="https://img.shields.io/badge/Playwright-1.60.0-555555?labelColor=2EAD33&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Zod-4.4.3-555555?labelColor=3E67B1&logo=npm&logoColor=white" alt="Zod" />
</p>

<p align="center">
  <strong>Herramientas</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24.14.0-555555?labelColor=339933&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/pnpm-11.4.0-555555?labelColor=F69220&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Vitest-4.1.7-555555?labelColor=6E9F18&logo=vitest&logoColor=white" alt="Vitest" />
</p>

## Decisión de arquitectura

Tumbfolio no ejecuta notebooks en el MVP. El sistema leerá `.ipynb` ya ejecutados, validará estructura, normalizará celdas y outputs, generará un `Presentation Model`, renderizará HTML como formato canónico y producirá exportes derivados.

El monorepo separa frontend (Next.js), backend HTTP (NestJS) y worker (NestJS/BullMQ):

```txt
apps/web      -> Next.js + React (frontend puro)
apps/api      -> NestJS backend HTTP
apps/worker   -> NestJS/BullMQ workers
packages/*    -> dominio, DB, storage, parser, NBXP, exporters y configuración
```

Next.js no aloja backend core. Upload pesado, validación, parser, generación del Presentation Model, storage, export jobs, NBXP e IA pertenecen a `apps/api` o `apps/worker`.

## Estructura del monorepo

```
apps/
  web/          Next.js frontend (localhost:3000)
  api/          NestJS API (localhost:4000)
  worker/       NestJS/BullMQ worker

packages/
  domain/       Tipos, enums, schemas puros
  config/       Validación de entorno con Zod
  db/           Drizzle schema + migrations
  storage/      S3 ObjectStorage interface
  notebook/     Parser de notebooks .ipynb
  nbxp/         Serializador NBXP
  export/       Contratos de exportación
  render-contracts/  Interfaces MimeRenderer
  testing/      Fixtures compartidos
```

## Requisitos

- Node.js `24.14.0`
- pnpm `11.4.0`
- Docker, solo si vas a levantar Postgres, Redis y MinIO locales

## Instalación

```bash
cp .env.example .env
make install
```

## Ejecutar

```bash
make dev
```

Esto levanta tres procesos concurrentes:

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| API (NestJS) | 4000 | http://localhost:4000/api |
| Worker (NestJS) | - | Consola / logs |

Comandos individuales:

```bash
make dev-web      # Solo frontend
make dev-api      # Solo API
make dev-worker   # Solo worker
```

## API Health

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "...",
  "version": "0.0.0"
}
```

Swagger disponible en `http://localhost:4000/api/docs`.

## Infraestructura local

```bash
make docker-up
```

Esto levanta PostgreSQL 17, Redis y MinIO.

## Calidad y pruebas

```bash
make typecheck
make lint
make test
make build
```

## Migraciones

```bash
make db-generate
make db-migrate
```

## Documentación

Toda la documentación técnica base vive en `/docs`:

- `docs/architecture.md`
- `docs/monorepo.md`
- `docs/environments.md`
- `docs/makefile.md`
- `docs/t-01-acceptance.md`


