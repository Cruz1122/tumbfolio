# Entorno local

## Runtime fijado

- Node.js `24.14.0`
- pnpm `11.4.0`

## Servicios locales

`docker-compose.yml` levanta:

- PostgreSQL 17
- Redis 7
- MinIO como storage S3-compatible

## Variables principales

Copiar `.env.example` a `.env` y completar valores reales cuando corresponda.

```bash
cp .env.example .env
make docker-up
make install
make dev
```

El proyecto puede renderizar frontend y API health sin base de datos activa. Migraciones, storage real y workers productivos sí dependen de servicios locales.
