# Estructura de proyecto

```txt
tumbfolio/
├── app/
│   ├── (editor)/
│   ├── (presentation)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── editor/
│   ├── renderers/
│   ├── slides/
│   └── ui/
├── lib/
│   ├── notebook/
│   ├── presentation/
│   ├── renderers/
│   ├── exports/
│   ├── nbxp/
│   ├── storage/
│   ├── ai/
│   ├── security/
│   └── observability/
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── migrations/
├── workers/
├── tests/
├── scripts/
├── docs/
├── Makefile
└── package.json
```

La regla dura es separar dominio de UI. El parser, normalizador, planner, serializer NBXP y exporters vivirán fuera de React. Si una función de dominio necesita importar un componente, la arquitectura está rota.
