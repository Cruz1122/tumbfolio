# Arquitectura técnica

Tumbfolio queda separado en tres aplicaciones ejecutables y paquetes compartidos.

```txt
apps/web      -> Next.js + React
apps/api      -> NestJS backend HTTP
apps/worker   -> NestJS/BullMQ workers
packages/*    -> dominio, DB, storage, parser, NBXP, exporters y configuración
```

## Decisión

Next.js no aloja el backend core. `apps/web` consume la API NestJS. Upload pesado, validación, parser, normalización, generación del Presentation Model, storage, export jobs, NBXP, IA, auth y permisos pertenecen a `apps/api` o `apps/worker`.

## Fronteras

- `apps/web` no importa código desde `apps/api`.
- `apps/api` no importa React ni Next.
- `apps/worker` no importa React ni Next.
- `packages/domain` es puro: tipos, enums, schemas y funciones deterministas.
- Parser, planner, exporters y NBXP deben poder probarse sin UI.

## Convenciones

Las convenciones técnicas vinculantes están definidas en:

- [`docs/conventions.md`](./conventions.md) — reglas normativas de naming, casing, estructura de paquetes, schemas, enums y límites entre capas
- [`docs/technical/t-01-5-technical-standards.md`](./technical/t-01-5-technical-standards.md) — decisiones técnicas detrás de las convenciones

Resumen:

| Capa | Casing |
|---|---|
| TypeScript / Zod / dominio | camelCase |
| DB física (PostgreSQL) | snake_case |
| API JSON | camelCase |
| Drizzle ORM | camelCase TS → snake_case columna |
| Enum keys | PascalCase |
| Enum values | snake_case |
| Archivos y carpetas | kebab-case |

## Alcance real de T-01

T-01 deja la base ejecutable y verificable. No implementa upload real, parser completo, exportes reales ni NBXP completo. Esos entregables pertenecen a fases técnicas posteriores.
