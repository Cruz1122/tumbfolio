# @tumbfolio/domain

Pure TypeScript package containing shared domain contracts for Tumbfolio.

## What it provides

- **Version constants** — `PRESENTATION_MODEL_VERSION`, `NBXP_PACKAGE_VERSION`
- **ID type aliases** — `UserId`, `ProjectId`, `SlideId`, etc.
- **Enums** — `CellType`, `OutputType`, `RenderStrategy`, `SlideLayout`, etc.
- **Zod schemas** — Validated contracts for all domain entities
- **Inferred TypeScript types** — From Zod schemas
- **Trust boundary validation** — Separate schemas for client payloads, backend data, and NBXP import
- **Minimal fixtures** — Contract-first validation examples

## Consumers

- `packages/notebook` — Notebook parser
- `packages/export` — Exporters
- `packages/nbxp` — NBXP serializer/importer
- `packages/render-contracts` — MIME renderer interfaces
- `packages/testing` — Testing utilities and rich fixtures
- Apps (`web`, `api`, `worker`) — via named imports

## Rules

- No React, Next.js, NestJS, Drizzle, BullMQ, or S3 dependencies.
- No Node.js API usage (pure logic only).
- No `any` types.
- No imports from other `@tumbfolio/*` packages.
- Strict Zod validation for external input boundaries.
