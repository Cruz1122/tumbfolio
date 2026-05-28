# Convenciones técnicas

Este documento define las convenciones normativas del monorepo Tumbfolio.
Todo código nuevo debe cumplirlas. Las excepciones deben documentarse y justificarse en el PR.

---

## 1. Naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Paquetes | `@tumbfolio/*`, kebab-case | `@tumbfolio/render-contracts` |
| Archivos | kebab-case | `source-notebook.schema.ts` |
| Carpetas | kebab-case | `presentation-model/` |
| Tipos/Interfaces | PascalCase | `SourceNotebook`, `BlockVisibility` |
| Schemas Zod | PascalCase + `Schema` sufijo | `SourceNotebookSchema` |
| Enums (const object) | PascalCase keys, snake_case values | `HtmlZip: "html_zip"` |
| Variables/funciones | camelCase | `normalizeOutput()`, `renderStrategy` |
| Constantes globales | UPPER_SNAKE_CASE | `PRESENTATION_MODEL_VERSION` |

Prohibido:

```ts
// Mal — mezcla de convenciones
export const sourceNotebookSchema = z.object({...});  // debe ser SourceNotebookSchema
export type source_notebook = z.infer<...>;            // debe ser SourceNotebook
```

---

## 2. Casing por capa

| Capa | Casing | Razón |
|---|---|---|
| TypeScript (dominio) | camelCase | Convención del lenguaje |
| Zod schemas | camelCase (fields) | Misma razón: es TypeScript |
| DB física (PostgreSQL) | snake_case | Convención SQL |
| Drizzle ORM | camelCase TS → snake_case columna | Drizzle mapea automáticamente |
| API JSON request/response | camelCase | Coherencia con frontend y dominio |
| NBXP XML attributes | kebab-case o camelCase | Se define en T-22 |

**Regla cardinal:** el dominio TypeScript no debe contener snake_case.
Nunca importes nombres de columna DB al dominio.

Correcto:

```ts
// domain — camelCase
const SourceNotebookSchema = z.object({
  projectId: uuidSchema,
  originalFilename: z.string(),
  storageKey: z.string(),
  validationStatus: ValidationStatusSchema,
});
```

```ts
// db — snake_case en SQL, camelCase en TS con mapping Drizzle
export const sourceNotebooks = pgTable("source_notebooks", {
  projectId: uuid("project_id").notNull(),
  originalFilename: text("original_filename").notNull(),
});
```

---

## 3. Estructura de paquetes

```
packages/<name>/
├── src/
│   ├── index.ts          # barrel raíz
│   ├── <submodulos>/     # agrupaciones funcionales
│   │   ├── index.ts      # barrel del submódulo
│   │   ├── *.schema.ts   # schemas Zod
│   │   └── *.ts          # otros archivos
│   └── <nombre>.ts       # archivos sueltos si el módulo es pequeño
├── test/
│   └── *.test.ts
├── package.json          # type: "module", exports mapeados
├── tsconfig.json         # extends base, composite
└── README.md             # propósito y reglas del paquete
```

Reglas:

- `src/index.ts` es el único punto de entrada público.
- Cada carpeta de submódulo tiene su propio `index.ts`.
- Los barrels no ocultan dependencias circulares. Si aparece una circular, el diseño está mal.
- Tests viven en `test/`, no en `src/`.

---

## 4. Reglas de exports y barrels

- Cada paquete exporta desde `src/index.ts`.
- Los barrels de submódulo re-exportan con nombre explícito, no `export * from` cuando haya riesgo de colisión.
- Preferir `export { Foo }` sobre `export *` en submódulos internos cuando el número de exports es pequeño.
- No exportar archivos internos (helpers, tipos privados) desde el barrel raíz.
- No usar `export default` en schemas o tipos compartidos.

---

## 5. Reglas de schemas Zod

- Todo schema de entidad usa sufijo `Schema`: `SourceNotebookSchema`.
- El tipo inferido se exporta con el mismo nombre sin sufijo: `export type SourceNotebook = z.infer<typeof SourceNotebookSchema>`.
- No escribir interfaces manuales duplicadas salvo que haya una razón real documentada.
- Usar `.strict()` para payloads externos (cliente, upload, NBXP).
- Usar `.strict()` para datos generados por backend.
- Usar `.strip()` o `.passthrough()` solo cuando un adapter DB o metadata variable lo requiera, y documentar por qué.
- En metadata de notebook/entidad, usar `JsonObjectSchema` (record controlado de `JsonValue`), no `z.record(z.string(), z.unknown())`.

---

## 6. Reglas de enums

Los enums runtime se implementan como `as const` objects con Zod `z.nativeEnum()`.

```ts
export const ExportType = {
  Html: "html",
  HtmlZip: "html_zip",
  Pdf: "pdf",
  Pptx: "pptx",
  Nbxp: "nbxp"
} as const;

export type ExportType = (typeof ExportType)[keyof typeof ExportType];

export const ExportTypeSchema = z.nativeEnum(ExportType);
```

Reglas:

- **Keys en PascalCase** — para buena DX en autocompletado y refactors.
- **Values en snake_case** — para serialización estable y compatibilidad DB.
- **`as const`** — para inferencia de union type.
- **Tipo derivado** — usar `(typeof X)[keyof typeof X]`.
- **Schema derivado** — usar `z.nativeEnum(X)`, no reescribir el array de strings.
- No usar `enum` de TypeScript (enum runtime) a menos que haya una razón muy específica. Preferir `as const`.

---

## 7. Reglas de IDs

- Todos los IDs de entidad son `string` en TypeScript/Zod.
- Los alias de tipo existen para legibilidad, no para type-level safety:

```ts
export type SourceNotebookId = string;
export type SlideId = string;
```

- No usar branded types todavía. Pueden incorporarse después si se necesita type safety en firmas críticas.
- En schemas Zod, los IDs se validan como UUID v4:

```ts
export const uuidSchema = z.string().uuid();
```

---

## 8. Reglas de timestamps

- En contratos de dominio y API JSON: **ISO 8601 string** (`z.string().datetime()`).
- En DB física: columna `timestamp with time zone`.
- Drizzle mapea: `createdAt: timestamp("created_at")`.
- Todo schema de entidad persistible debe incluir `createdAt` y `updatedAt`.

```ts
export const MyEntitySchema = z.object({
  // ...
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
```

No usar objetos `Date` de JavaScript en contratos compartidos que viajen por JSON.

---

## 9. Reglas de status

- **Un solo eje de estado por ciclo de vida.** Si una entidad tiene dos ciclos independientes (validación ≠ procesamiento), usar dos campos separados.

- `SourceNotebook` usa dos ejes:

```ts
validationStatus: "pending" | "validating" | "valid" | "invalid"
processingStatus: "idle" | "queued" | "processing" | "processed" | "failed"
```

- `ExportJob` usa un solo eje porque su ciclo de vida es único:

```ts
status: "queued" | "running" | "completed" | "failed" | "expired"
```

- `AiSuggestion` usa un solo eje:

```ts
status: "pending" | "accepted" | "edited" | "rejected" | "failed"
```

---

## 10. Reglas de errores

- Los errores de validación se representan como `validationErrors: string[]`.
- Los warnings como `validationWarnings: string[]`.
- En outputs, el error se modela con campos separados:

```ts
errorName: z.string().optional(),
errorValue: z.string().optional(),
traceback: z.array(z.string()).optional(),
```

- No mezclar errores con el estado de la entidad. El estado describe en qué fase está; los errores describen qué salió mal dentro de esa fase.

---

## 11. Reglas de fixtures

- **`packages/domain/src/fixtures/`**: fixtures mínimos de contrato. Solo validan que los schemas parsean.
- **`packages/testing/`**: builders, factories, escenarios ricos y snapshots para pruebas de integración.
- Todo fixture de contrato debe ser un objeto válido para su schema, no un partial.
- Los fixtures usan UUIDs estables y predecibles (ej: `00000000-...-000000000001`).

---

## 12. Reglas de imports entre packages

**`packages/domain`** es la raíz de todas las dependencias. Importa solo `zod`.

```txt
❌ packages/domain → @tumbfolio/db
❌ packages/domain → @nestjs/common
❌ packages/domain → react
❌ packages/domain → bullmq
❌ packages/domain → drizzle-orm
❌ packages/domain → @tumbfolio/notebook
✅ packages/domain → zod
✅ packages/domain → ./schemas (relativo interno)
```

Todos los demás paquetes pueden depender de `@tumbfolio/domain`.

El grafo de dependencias debe ser acíclico.

Si un paquete necesita un tipo que está en otro paquete no-domain, ese tipo debe ascender a domain, no crear una dependencia lateral.

---

## 13. Reglas de documentación técnica

- Toda decisión de arquitectura se documenta en `docs/` con markdown.
- Las ADRs (Architecture Decision Records) viven en `docs/adr/`.
- Las referencias técnicas (roadmap, stack, flujos) viven en `docs/reference/`.
- Las convenciones vinculantes viven en `docs/conventions.md`.
- Las guías de setup/uso viven en `docs/` raíz o `README.md`.
- No crear documentación decorativa. Cada documento debe responder una pregunta que alguien del equipo pueda tener.
