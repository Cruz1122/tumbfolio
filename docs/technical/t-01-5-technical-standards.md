# T-01.5 — Estándares técnicos

## Decisión

Establecer convenciones normativas vinculantes para naming, casing, estructura de paquetes, schemas, enums y límites entre capas en el monorepo Tumbfolio.

## Contexto

T-01 dejó la base ejecutable pero sin convenciones explícitas. El roadmap técnico requiere que `packages/domain` sea puro, que los schemas distingan fronteras de confianza, que los IDs sean estables y que el modelo esté versionado. Sin reglas de naming, cada desarrollador puede elegir convenciones distintas y generar inconsistencias que el roadmap técnico señala como riesgos explícitos.

## Decisiones

### 1. camelCase en TypeScript, snake_case en DB, camelCase en API

**Problema:** ¿Qué casing usar en cada capa?

**Alternativas consideradas:**
- snake_case en todo (consistente con DB, incómodo en TS)
- camelCase en todo (consistente en TS, choca con convención PostgreSQL)
- camelCase en TS/API, snake_case en DB, Drizzle como frontera

**Decisión:** opción 3.

**Razón:** TypeScript tiene convención camelCase establecida (linters, type definitions, ecosistema). PostgreSQL tiene convención snake_case. Pelear contra cualquiera de las dos es fricción innecesaria. Drizzle ya resuelve el mapeo automáticamente con su API: `projectId: uuid("project_id")`. La API JSON habla el mismo idioma que el frontend y el dominio, así que también camelCase.

**Consecuencia:** ningún campo del dominio usa snake_case. Si aparece `source_cell_id` en un schema TypeScript, está mal.

### 2. Enums como const objects, no TypeScript enum

**Problema:** ¿Cómo modelar enumeraciones?

**Alternativas:**
- `enum` nativo de TypeScript (emite runtime, no es tree-shakeable, tiene ambigüedades con const enum)
- `as const` object (cero runtime overhead, inferencia nativa, funciona con Zod natively)
- strings sueltos repetidos en schemas

**Decisión:** `as const` objects con `z.nativeEnum()`.

**Razón:** Los `as const` objects son la opción más compatible con Zod (que tiene `z.nativeEnum()` específicamente para este patrón), no emiten código extra, permiten `Object.values()` para iterar, y evitan la ambigüedad de `const enum` (que no existe en bundlers como esbuild). Las keys en PascalCase dan buena DX; los values en snake_case dan valores estables para DB y wire.

### 3. Schemas Zod como única fuente de verdad de tipos

**Problema:** ¿Escribir interfaces manuales además de los schemas Zod?

**Alternativas:**
- Schema + interfaz manual duplicada
- Schema + tipo inferido

**Decisión:** Schema + `z.infer<>`.

**Razón:** La interfaz inferida del schema es siempre correcta. Una interfaz manual puede desviarse y generar bugs silenciosos. La excepción es cuando el tipo inferido es ilegible o necesita transforms que el schema no puede expresar, pero eso no ha ocurrido.

### 4. Dos ejes de estado para notebooks

**Problema:** ¿Un solo campo `status` para notebooks o separar validación de procesamiento?

**Alternativas:**
- `status` único con valores como `uploaded | validating | valid | invalid | processing | processed | failed`
- `validationStatus` + `processingStatus`

**Decisión:** dos ejes separados.

**Razón:** la validación y el procesamiento del parser son ciclos independientes. Un notebook puede ser `valid` estructuralmente pero fallar en el parser (`processingStatus: failed`). Un notebook puede ser `invalid` y nunca procesarse. Mezclar ambos en un solo campo obliga a valores compuestos o a perder información.

### 5. Status unificado solo cuando el ciclo de vida es único

**Problema:** ¿Cuándo usar un solo campo `status`?

**Decisión:** cuando el ciclo de vida de la entidad tiene un solo eje. `ExportJob` tiene una sola secuencia: encolar → ejecutar → completar/fallar/expiar. `AiSuggestion` también. Para esas entidades, un solo `status` es suficiente y más simple.

### 6. Fechas como ISO string en contratos

**Problema:** `Date` de JavaScript o `string` ISO en los contratos compartidos?

**Decisión:** `string` ISO 8601 en domain/API; `timestamp with time zone` en DB.

**Razón:** los objetos `Date` no se serializan bien en JSON sin transforms. Una string ISO es portable, legible y funciona con cualquier cliente. Drizzle mapea `createdAt: timestamp("created_at")` que se serializa como ISO string en JSON.

### 7. IDs como `string`, no branded types

**Problema:** ¿Usar branded types (`type ProjectId = string & { readonly __brand: "ProjectId" }`) ya?

**Decisión:** no todavía.

**Razón:** los branded types añaden fricción en firmas de funciones, arrays y genéricos sin un beneficio claro en esta etapa. El roadmap los menciona como posible mejora futura, pero ahora la prioridad es consistencia, no type-level programming. Los alias de tipo (`type ProjectId = string`) ya dan legibilidad.

### 8. Zod modeling: strict por defecto en fronteras

**Problema:** ¿Usar `.strict()`, `.strip()` o `.passthrough()` en schemas?

**Decisión:**

| Frontera | Política |
|---|---|
| Cliente (payloads editor) | `.strict()` |
| Upload `.ipynb` | `.strict()` |
| NBXP importado | `.strict()` |
| Backend generated | `.strict()` |
| Persistido DB (adapter) | `.strict()` o `.strip()` según adapter |
| Metadata (libre) | `.passthrough()` controlado en el campo, no en la entidad |

**Razón:** las fronteras de confianza requieren rechazar datos inesperados. El notebook metadata es la única excepción porque Jupyter puede incluir claves arbitrarias.

### 9. Centralización de versiones

**Problema:** `NBXP_PACKAGE_VERSION` estaba duplicado en `packages/nbxp/src/index.ts` y `lib/nbxp/index.ts` con valor `"1.0"`.

**Decisión:** todas las constantes de versión viven en `packages/domain/src/version.ts`. Ningún paquete consumer define su propia versión.

**Razón:** T-02 centralizó `PRESENTATION_MODEL_VERSION` y `NBXP_PACKAGE_VERSION` con valor `"1.0.0"`. Mantenerlos en domain evita drift y hace que cualquier cambio de versión sea visible en un solo lugar.

### 10. kebab-case para archivos y carpetas

**Problema:** ¿Cómo nombrar archivos? `.ts`, `.test.ts`, `.schema.ts`?

**Decisión:** nombres en kebab-case con sufijos descriptivos.

| Archivo | Nombre |
|---|---|
| Schema principal | `source-notebook.schema.ts` |
| Enum | `render-strategy.ts` |
| Fixture | `presentation-document.fixture.ts` |
| Test | `source-notebook.schema.test.ts` |
| Board | `index.ts` |
| Types | `types.ts` |

**Razón:** kebab-case es el estándar en Node.js/TypeScript para archivos, evita problemas de case-sensitivity en distintos sistemas de archivos, y es compatible con import paths sin necesidad de escaping.

### 11. Barrel controlados

**Problema:** ¿Cómo y cuándo usar barrel exports?

**Decisión:** cada módulo exporta desde su `index.ts`, pero no se usan barrels para ocultar dependencias circulares. Si aparece una circular, el diseño se reestructura.

**Razón:** los barrels son útiles para acotar la superficie de import, pero un barrel que oculta una dependencia circular es peor que la circular misma porque retrasa el error.

### 12. Prohibición de imports laterales

**Problema:** `packages/domain` puede importar `@tumbfolio/db`, `react`, `@nestjs/*`?

**Decisión:** no. `packages/domain` solo importa `zod`. Ningún `@tumbfolio/*` package puede importar otro `@tumbfolio/*` sin pasar por domain, salvo excepciones justificadas y documentadas.

**Razón:** el roadmap técnico exige que parser, planner, NBXP y exporters sean probables sin UI. Si domain importa React, esa regla se rompe. El test arquitectónico `architecture-boundaries.test.ts` verifica esto automáticamente.

## Normas

1. `docs/conventions.md` es normativo. Todo PR debe cumplirlo.
2. Las excepciones se documentan en el PR y se discuten.
3. El enforcement se logra via:
   - `pnpm lint` (ESLint con reglas de naming)
   - `pnpm typecheck` (TypeScript strict)
   - `pnpm test` (tests de arquitectura incluidos)
   - Code review humano
4. Cualquier cambio a estas normas debe pasar por una ADR en `docs/adr/`.

## Referencias

- `docs/conventions.md` — reglas detalladas
- `docs/architecture.md` — decisiones de alto nivel heredadas de T-01
- `docs/reference/roadmap-tecnico.md` — objetivos técnicos que estas normas habilitan
- `packages/domain/test/architecture-boundaries.test.ts` — test de pureza
