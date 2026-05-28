# Variables de entorno

La configuración se centraliza en `packages/config` y se valida con Zod.

- `apps/web` solo puede leer variables públicas `NEXT_PUBLIC_*`.
- `apps/api` lee configuración de API, DB, Redis, S3 e IA.
- `apps/worker` lee configuración de worker, Redis, DB y S3.

Los procesos deben fallar al arrancar si una variable obligatoria no existe o tiene formato inválido.
