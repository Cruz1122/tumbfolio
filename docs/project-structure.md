# Estructura de proyecto

```txt
tumbfolio/
├── apps/
│   ├── web/          Next.js frontend
│   ├── api/          NestJS API backend
│   └── worker/       NestJS/BullMQ workers
├── packages/
│   ├── domain/       Tipos, enums, schemas puros (Zod)
│   ├── config/       Validación de entorno
│   ├── db/           Drizzle ORM schema, migraciones, seed
│   ├── storage/      S3 ObjectStorage
│   ├── notebook/     Parser de notebooks .ipynb
│   ├── nbxp/         Serializador NBXP
│   ├── export/       Contratos de exportación
│   ├── render-contracts/  Interfaces MimeRenderer
│   └── testing/      Fixtures compartidos
├── docs/             Documentación técnica
├── Makefile
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

La regla dura es separar dominio de UI. El parser, normalizador, planner, serializer NBXP y exporters vivirán fuera de React. Si una función de dominio necesita importar un componente, la arquitectura está rota.
