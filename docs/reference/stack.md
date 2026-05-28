# Tumbfolio — Stack técnico cerrado

## Decisión principal

Tumbfolio se construirá como una aplicación **Full TypeScript** con **Next.js**, **React**, **PostgreSQL**, almacenamiento S3-compatible, workers Node para procesamiento pesado y exportadores especializados para HTML, PDF, PPTX y NBXP.

La arquitectura no ejecutará notebooks en el MVP. El sistema leerá `.ipynb` ya ejecutados, normalizará celdas y outputs, generará un **Presentation Model** propio, renderizará HTML como formato canónico y producirá exportes derivados. Esta decisión evita kernels, sandboxing de ejecución, dependencias Python, ambientes Conda y costo de cómputo innecesario.

## Stack resumido

| Capa | Tecnología | Versión fijada | Uso |
|---|---|---|---|
| Runtime | Node.js | 24.14.0 LTS | Runtime principal para app, API y workers |
| Package manager | pnpm | 11.4.0 | Instalación reproducible y workspaces |
| Framework web | Next.js | 16.2.6 | App Router, API routes, SSR, frontend/backend TS |
| UI runtime | React | 19.2.6 | Editor, renderer y modo presentación |
| Lenguaje | TypeScript | 6.0.3 | Tipado estricto del Presentation Model |
| Base de datos | PostgreSQL | 17.x | Persistencia relacional + JSONB |
| ORM | Drizzle ORM | 0.45.2 | Schema, queries y migraciones tipadas |
| Storage | S3-compatible | API AWS SDK 3.1055.0 | Notebooks, assets, exports y paquetes NBXP |
| Queue/Workers | BullMQ + Redis | 5.77.6 / 5.11.0 | Export jobs y procesamiento pesado |
| PDF | Playwright | 1.60.0 | Render HTML print a PDF |
| PPTX | PptxGenJS | 4.0.1 | Export PPTX razonablemente editable |
| NBXP | JSZip + fast-xml-parser | 3.10.1 / 5.8.0 | Paquete ZIP + XML interno |
| IA | Vercel AI SDK + OpenAI SDK | 6.0.191 / 6.39.0 | Sugerencias de títulos, resúmenes y notas |

## Compatibilidad fijada

Este set evita conflictos conocidos de peer dependencies:

- `next@16.2.6` acepta `react@19.2.6` y `react-dom@19.2.6`.
- `next@16.2.6` exige Node `>=20.9.0`; se fija Node 24 LTS para quedar por encima del mínimo.
- `@clerk/nextjs@7.4.1` acepta Next 16 y React 19.2.x.
- `typescript-eslint@8.60.0` acepta `typescript >=4.8.4 <6.1.0`, por eso `typescript@6.0.3` entra dentro del rango.
- `eslint@9.39.4` se fija deliberadamente. No se fija ESLint 10 porque `eslint-plugin-import@2.32.0` todavía no declara compatibilidad con ESLint 10.
- `@playwright/test@1.60.0` y `playwright@1.60.0` se mantienen alineados para evitar inconsistencias de browser automation.
- `tailwindcss@4.3.0` se instala junto con `@tailwindcss/postcss@4.3.0` para seguir el modelo de integración de Tailwind 4.

## Runtime y tooling base

| Paquete / Runtime | Versión | Rol |
|---|---:|---|
| Node.js | 24.14.0 LTS | Runtime base |
| pnpm | 11.4.0 | Package manager |
| TypeScript | 6.0.3 | Tipado estático |
| ESLint | 9.39.4 | Linting |
| eslint-config-next | 16.2.6 | Reglas oficiales Next |
| typescript-eslint | 8.60.0 | Parser y reglas TS |
| eslint-plugin-import | 2.32.0 | Reglas de imports |
| eslint-plugin-jsx-a11y | 6.10.2 | Accesibilidad JSX |
| eslint-plugin-react-hooks | 7.1.1 | Reglas React Hooks |
| Prettier | 3.8.3 | Formateo |
| prettier-plugin-tailwindcss | 0.8.0 | Orden de clases Tailwind |

## Frontend y aplicación web

| Paquete | Versión | Rol |
|---|---:|---|
| next | 16.2.6 | Framework full-stack |
| react | 19.2.6 | UI runtime |
| react-dom | 19.2.6 | DOM renderer |
| tailwindcss | 4.3.0 | CSS utility framework |
| @tailwindcss/postcss | 4.3.0 | Integración PostCSS Tailwind 4 |
| postcss | 8.5.15 | Pipeline CSS |
| autoprefixer | 10.5.0 | Compatibilidad CSS |
| next-themes | 0.4.6 | Soporte de tema claro/oscuro si se necesita |
| lucide-react | 1.16.0 | Iconografía funcional |
| sonner | 2.0.7 | Toasts y feedback no intrusivo |

## Sistema de UI

| Paquete | Versión | Rol |
|---|---:|---|
| @radix-ui/react-dialog | 1.1.15 | Modales |
| @radix-ui/react-dropdown-menu | 2.1.16 | Menús |
| @radix-ui/react-select | 2.2.6 | Selectores |
| @radix-ui/react-tabs | 1.1.13 | Tabs |
| @radix-ui/react-tooltip | 1.2.8 | Tooltips |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| clsx | 2.1.1 | Composición condicional de clases |
| tailwind-merge | 3.6.0 | Resolución de conflictos Tailwind |
| cmdk | 1.1.1 | Command palette |
| vaul | 1.1.2 | Drawers |

La UI no debe convertirse en un editor tipo Figma. Los componentes deben servir a operaciones concretas: revisar slides, cambiar layouts, controlar visibilidad, reordenar bloques, dividir/fusionar slides, presentar y exportar.

## Estado, formularios y validación

| Paquete | Versión | Rol |
|---|---:|---|
| zod | 4.4.3 | Validación de payloads, Presentation Model y entradas |
| zustand | 5.0.13 | Estado local del editor |
| @tanstack/react-query | 5.100.14 | Server state, polling de jobs y cache API |
| @tanstack/react-table | 8.21.3 | Tablas renderizadas en editor |

Zod debe usarse para validar límites de confianza: upload, notebook normalizado, Presentation Model, configuración de export, payloads IA y contenido NBXP reconstruido.

## Editor de slides

| Paquete | Versión | Rol |
|---|---:|---|
| @dnd-kit/core | 6.3.1 | Drag and drop base |
| @dnd-kit/sortable | 10.0.0 | Reordenar slides y bloques |
| @dnd-kit/utilities | 3.2.2 | Utilidades DnD |
| nanoid | 5.1.11 | IDs estables para bloques internos |
| uuid | 14.0.0 | IDs persistentes de entidades |

El editor debe operar sobre `slides` y `slide_blocks`, no sobre el notebook original. Cualquier operación de split, merge o reorder debe conservar referencias a `notebook_cells`, `notebook_outputs` y `assets`.

## Render de Markdown, código, LaTeX y outputs

| Paquete | Versión | Rol |
|---|---:|---|
| react-markdown | 10.1.0 | Render Markdown |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown |
| remark-math | 6.0.0 | Parsing de expresiones matemáticas |
| rehype-katex | 7.0.1 | Render LaTeX con KaTeX |
| rehype-sanitize | 6.0.0 | Sanitización de árbol HTML en pipeline Markdown |
| katex | 0.17.0 | Render matemático |
| shiki | 4.1.0 | Syntax highlighting |
| dompurify | 3.4.7 | Sanitización HTML cliente |
| isomorphic-dompurify | 3.14.0 | Sanitización HTML server/client |

Los renderers iniciales serán: `MarkdownRenderer`, `CodeRenderer`, `PlainTextRenderer`, `HtmlRenderer`, `ImageRenderer`, `SvgRenderer`, `LatexRenderer`, `DataFrameRenderer`, `StreamRenderer` y `ErrorRenderer`.

`text/html` se manejará con dos estrategias: sanitización para HTML simple e iframe sandbox para HTML complejo. Scripts y recursos externos quedarán bloqueados por defecto salvo decisión explícita posterior.

## Procesamiento de notebooks, assets y NBXP

| Paquete | Versión | Rol |
|---|---:|---|
| jszip | 3.10.1 | Crear y leer paquetes `.nbxp` |
| fast-xml-parser | 5.8.0 | Leer/escribir `manifest.xml`, `presentation.xml`, `theme.xml` |
| file-type | 22.0.1 | Validar MIME real de archivos/assets |
| sharp | 0.34.5 | Optimización de imágenes y thumbnails |
| @aws-sdk/client-s3 | 3.1055.0 | Storage S3-compatible |
| @aws-sdk/s3-request-presigner | 3.1055.0 | URLs firmadas de upload/download |
| @aws-sdk/lib-storage | 3.1055.0 | Upload multipart para assets grandes |

NBXP no será XML plano. Será un ZIP con XML central y assets internos. En base de datos se gestionará como `asset` asociado a `presentation` y, cuando aplique, a `export_job`.

## Base de datos

| Tecnología / Paquete | Versión | Rol |
|---|---:|---|
| PostgreSQL | 17.x | Persistencia principal |
| drizzle-orm | 0.45.2 | ORM tipado |
| drizzle-kit | 0.31.10 | Migraciones y generación SQL |
| postgres | 3.4.9 | Driver PostgreSQL |

El modelo usará columnas relacionales para identidad, estados, relaciones, orden y auditoría. Usará `jsonb` para metadata flexible: outputs normalizados, render config, warnings, tokens visuales, payloads IA y configuración de export.

Entidades núcleo:

- `users`
- `projects`
- `source_notebooks`
- `notebook_cells`
- `notebook_outputs`
- `presentations`
- `slides`
- `slide_blocks`
- `assets`
- `themes`
- `export_jobs`
- `ai_suggestions`

## Workers, colas y exports

| Paquete | Versión | Rol |
|---|---:|---|
| bullmq | 5.77.6 | Queue de procesamiento |
| ioredis | 5.11.0 | Cliente Redis para BullMQ |
| playwright | 1.60.0 | PDF, screenshots y fallbacks visuales |
| @playwright/test | 1.60.0 | E2E y pruebas de export |
| pptxgenjs | 4.0.1 | Export PPTX |
| sharp | 0.34.5 | Optimización de imágenes de export |

Los exportes se modelarán como `export_jobs` desde el inicio, aunque el MVP pueda ejecutarlos síncronamente. PDF y PPTX son candidatos naturales para worker separado porque pueden ser lentos, pesados y propensos a errores de render.

## IA

| Paquete | Versión | Rol |
|---|---:|---|
| ai | 6.0.191 | SDK de streaming/generación |
| @ai-sdk/openai | 3.0.66 | Provider OpenAI para AI SDK |
| openai | 6.39.0 | SDK oficial directo cuando se requiera control fino |

La IA será asistente de curación, no fuente de verdad. Podrá titular slides, resumir, generar speaker notes y sugerir visibilidad. No modificará métricas, tablas, gráficos ni outputs originales sin confirmación explícita.

## Autenticación y permisos

| Paquete | Versión | Rol |
|---|---:|---|
| @clerk/nextjs | 7.4.1 | Auth gestionada para proyectos, sharing y permisos |
| jose | 6.2.3 | JWT/JWK si se requieren tokens propios |

Para el primer prototipo local, la autenticación puede estar desactivada o simulada con un usuario único. En cuanto existan proyectos guardados, share links o ownership real, debe activarse auth.

## Observabilidad y configuración

| Paquete | Versión | Rol |
|---|---:|---|
| pino | 10.3.1 | Logging estructurado |
| dotenv | 17.4.2 | Variables de entorno local |

Métricas mínimas: tiempo upload→deck, notebooks fallidos, outputs no soportados, slides `too_dense`, tiempo de render, errores de export, uso de IA, exports por formato y reapertura NBXP.

## Testing

| Paquete | Versión | Rol |
|---|---:|---|
| vitest | 4.1.7 | Unit tests |
| vite | 8.0.14 | Runtime de Vitest cuando aplique |
| @vitejs/plugin-react | 6.0.2 | React en pruebas Vite |
| jsdom | 29.1.1 | DOM simulado |
| @testing-library/react | 16.3.2 | Tests de componentes |
| @testing-library/dom | 10.4.1 | Peer requerido por Testing Library |
| @testing-library/jest-dom | 6.9.1 | Matchers DOM |
| @playwright/test | 1.60.0 | E2E, PDF smoke tests, presentación web |

Pruebas obligatorias para el núcleo:

- Validar notebooks corruptos, vacíos y sin outputs.
- Parsear notebooks con Markdown, código, stdout, stderr, imágenes y DataFrame HTML.
- Generar Presentation Model determinista.
- Renderizar slides sin romper ante MIME no soportado.
- Exportar HTML básico.
- Generar PDF smoke test.
- Serializar y reabrir NBXP sin perder slides ni assets.

## Tipos TypeScript

| Paquete | Versión | Rol |
|---|---:|---|
| @types/node | 24.12.4 | Tipos Node 24 |
| @types/react | 19.2.15 | Tipos React |
| @types/react-dom | 19.2.3 | Tipos React DOM |
| @types/katex | 0.16.8 | Tipos KaTeX |

No se agregan `@types/dompurify` ni `@types/jszip` porque las versiones actuales ya exponen tipos o no requieren un paquete adicional para este stack.

## `package.json` base

```json
{
  "name": "tumbfolio",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.4.0",
  "engines": {
    "node": ">=24.14.0 <25",
    "pnpm": "11.4.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@ai-sdk/openai": "3.0.66",
    "@aws-sdk/client-s3": "3.1055.0",
    "@aws-sdk/lib-storage": "3.1055.0",
    "@aws-sdk/s3-request-presigner": "3.1055.0",
    "@clerk/nextjs": "7.4.1",
    "@dnd-kit/core": "6.3.1",
    "@dnd-kit/sortable": "10.0.0",
    "@dnd-kit/utilities": "3.2.2",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-dropdown-menu": "2.1.16",
    "@radix-ui/react-select": "2.2.6",
    "@radix-ui/react-tabs": "1.1.13",
    "@radix-ui/react-tooltip": "1.2.8",
    "@tailwindcss/postcss": "4.3.0",
    "@tanstack/react-query": "5.100.14",
    "@tanstack/react-table": "8.21.3",
    "ai": "6.0.191",
    "bullmq": "5.77.6",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "dompurify": "3.4.7",
    "drizzle-orm": "0.45.2",
    "fast-xml-parser": "5.8.0",
    "file-type": "22.0.1",
    "ioredis": "5.11.0",
    "isomorphic-dompurify": "3.14.0",
    "jszip": "3.10.1",
    "katex": "0.17.0",
    "lucide-react": "1.16.0",
    "nanoid": "5.1.11",
    "next": "16.2.6",
    "next-themes": "0.4.6",
    "openai": "6.39.0",
    "playwright": "1.60.0",
    "postgres": "3.4.9",
    "pptxgenjs": "4.0.1",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "react-markdown": "10.1.0",
    "rehype-katex": "7.0.1",
    "rehype-sanitize": "6.0.0",
    "remark-gfm": "4.0.1",
    "remark-math": "6.0.0",
    "sharp": "0.34.5",
    "shiki": "4.1.0",
    "sonner": "2.0.7",
    "tailwind-merge": "3.6.0",
    "tailwindcss": "4.3.0",
    "uuid": "14.0.0",
    "vaul": "1.1.2",
    "zod": "4.4.3",
    "zustand": "5.0.13"
  },
  "devDependencies": {
    "@playwright/test": "1.60.0",
    "@testing-library/dom": "10.4.1",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@types/katex": "0.16.8",
    "@types/node": "24.12.4",
    "@types/react": "19.2.15",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "drizzle-kit": "0.31.10",
    "eslint": "9.39.4",
    "eslint-config-next": "16.2.6",
    "eslint-plugin-import": "2.32.0",
    "eslint-plugin-jsx-a11y": "6.10.2",
    "eslint-plugin-react-hooks": "7.1.1",
    "jsdom": "29.1.1",
    "prettier": "3.8.3",
    "prettier-plugin-tailwindcss": "0.8.0",
    "typescript": "6.0.3",
    "typescript-eslint": "8.60.0",
    "vite": "8.0.14",
    "vitest": "4.1.7"
  }
}
```

## Estructura del monorepo

Ver también [`docs/monorepo.md`](../monorepo.md) y [`docs/project-structure.md`](../project-structure.md).

```txt
tumbfolio/
├── apps/
│   ├── web/          Next.js frontend (localhost:3000)
│   ├── api/          NestJS API (localhost:4000)
│   └── worker/       NestJS/BullMQ workers
├── packages/
│   ├── domain/       Tipos, enums, schemas puros, fixtures
│   ├── config/       Validación de entorno con Zod
│   ├── db/           Drizzle schema + migraciones + seed
│   ├── storage/      S3 ObjectStorage interface
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

## Servicios de infraestructura

| Servicio | Elección | Motivo |
|---|---|---|
| Hosting web | Vercel o container Node | Next.js nativo |
| Worker runtime | Container separado | PDF/PPTX pueden exceder límites serverless |
| DB | PostgreSQL gestionado | Relacional + JSONB |
| Storage | S3-compatible | Assets, notebooks, HTML/PDF/PPTX/NBXP |
| Redis | Redis gestionado | BullMQ y export jobs |
| CDN | Storage CDN o Vercel edge | Servir exports/assets |

Para el MVP local, los workers pueden correr dentro del mismo proceso. Para producción, separar workers evita que una exportación pesada degrade el editor.

## Decisiones negativas

- No se usará Python en el MVP salvo que el parser TypeScript se quede corto ante notebooks reales.
- No se ejecutará código del notebook.
- No se soportará ipywidgets al inicio.
- No se prometerá paridad perfecta entre HTML, PDF y PPTX.
- No se diseñará primero para PPTX.
- No se guardará NBXP como XML plano; será ZIP con XML y assets.
- No se permitirá HTML arbitrario sin sanitización o sandbox.
- No se construirá colaboración en tiempo real hasta cerrar el núcleo de importación, editor y export.

## Orden técnico de implementación

1. Bootstrapping Next + DB + storage.
2. Upload y validación `.ipynb`.
3. Parser y normalizador.
4. Presentation Model.
5. Renderers MVP.
6. Editor base.
7. Export HTML.
8. Export PDF.
9. NBXP.
10. PPTX inicial.
11. IA asistida.
12. Sharing y auth real.

## Comandos base

```bash
corepack enable
corepack prepare pnpm@11.4.0 --activate
pnpm install --save-exact
pnpm dev
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Nota final

Este stack es deliberadamente aburrido. Eso es bueno. El riesgo técnico real de Tumbfolio no está en escoger una librería exótica; está en renderizar bien outputs reales, mantener trazabilidad entre notebook y deck, exportar con degradación honesta y no convertir el producto en un clon mediocre de Jupyter, PowerPoint o Canva.
