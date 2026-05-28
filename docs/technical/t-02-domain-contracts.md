# T-02 — Contratos de dominio y schemas compartidos

## Decisión

`packages/domain` es la fuente compartida de tipos TypeScript, enums, schemas Zod, validación por fronteras de confianza y fixtures mínimos de contrato.

Queda establecido como paquete ESM puro sin dependencias de React, NestJS, Next, Drizzle, BullMQ, Node APIs ni S3.

## Convención de nomenclatura

- **TypeScript / Zod / dominio interno:** camelCase (`sourceCellId`, `presentationModelVersion`)
- **DB / wire formats:** snake_case vía mapeo de adapter (Drizzle lo hace automáticamente)

## Qué define

### Entidades

| Entidad | Schema | Descripción |
|---|---|---|
| `SourceNotebook` | `SourceNotebookSchema` | Notebook fuente normalizado con dos ejes de estado |
| `NotebookCell` | `NotebookCellSchema` | Celda normalizada con clasificación y trazabilidad |
| `NormalizedOutput` | `NormalizedOutputSchema` | Output normalizado con render strategy y referencias a assets |
| `NotebookAnalysisSummary` | `NotebookAnalysisSummarySchema` | Resumen de análisis con conteos y MIME types |
| `Presentation` | `PresentationSchema` | Presentación (sin slides/blocks embebidos) |
| `Slide` | `SlideSchema` | Slide con orden, layout, estado y notas |
| `SlideBlock` | `SlideBlockSchema` | Discriminated union por `blockType` con 11 variantes |
| `PresentationDocument` | `PresentationDocumentSchema` | Agregado raíz: presentation + slides + blocks + assets + theme |
| `Asset` | `AssetSchema` | Asset referenciable desde blocks y exports |
| `Theme` | `ThemeSchema` | Tema visual con tokens tipados |
| `ThemeTokens` | `ThemeTokensSchema` | Tokens de color, tipografía y layout |
| `ExportJob` | `ExportJobSchema` | Trabajo de exportación con config discriminada |
| `ExportConfig` | `ExportConfigSchema` | Discriminated union por `exportType` |
| `AiSuggestion` | `AiSuggestionSchema` | Sugerencia IA con acciones, estados y payloads |
| `AiAction` | `AiActionSchema` | Acciones permitidas de IA |
| `HealthResponse` | `HealthResponseSchema` | Respuesta de health check (compatibilidad apps) |

### Versiones

```ts
PRESENTATION_MODEL_VERSION = "1.0.0"
NBXP_PACKAGE_VERSION      = "1.0.0"
```

### Enums

| Enum | Valores clave |
|---|---|
| `CellType` | markdown, code, raw, unknown |
| `OutputType` | execute_result, display_data, stream, error, unknown |
| `RenderStrategy` | markdown, code, plain_text, html_sanitized, html_sandboxed, image, svg, latex, data_frame, stream, error, placeholder, unsupported |
| `SlideLayout` | title, section, content, code_output, output_focus, figure_focus, table_focus, comparison, appendix |
| `SlideStatus` | normal, too_dense, has_unsupported_output, has_hidden_logs, needs_review |
| `PresentationMode` | default, executive, teaching, research |
| `PresentationStatus` | draft, ready, archived |
| `ExportType` | html, html_zip, pdf, pptx, nbxp |
| `AssetType` | source_notebook, output_image, output_svg, output_html, data_frame, thumbnail, export_*, theme_asset, unknown |
| `SlideBlockType` | markdown, code, output, image, table, html, latex, log, error, ai_summary, placeholder |
| `JobStatus` | queued, running, completed, failed, expired |
| `AiSuggestionStatus` | pending, accepted, edited, rejected, failed |
| `AiActionType` | generate_title, improve_title, summarize_slide, generate_speaker_notes, explain_for_teaching, make_executive, suggest_visibility, propose_conclusion |
| `NotebookValidationStatus` | pending, validating, valid, invalid |
| `NotebookProcessingStatus` | idle, queued, processing, processed, failed |
| `CellClassification` | narrative_markdown, setup_code, analysis_code, visualization_code, modeling_code, table_output, figure_output, log_output, error_output, noise |

## Qué no define

- Schema de base de datos (Drizzle) — eso es T-03
- Controladores API — T-10
- Componentes React — T-12
- Parser real de notebooks — T-07
- Exportadores reales — T-17+
- Serializer/importer NBXP real — T-20/T-21
- Storage/S3 — T-04

## Límites de confianza

| Frontera | Schema | Strictness |
|---|---|---|
| Upload .ipynb | `UploadedNotebookMetadataSchema` | `.strict()` |
| Cliente (editor) | `ClientUpdateSlideSchema`, `ClientUpdateBlockVisibilitySchema`, `ClientReorderSlidesSchema`, `ClientChangeThemeSchema`, `ClientChangeModeSchema` | `.strict()` |
| NBXP importado | `NbxpImportedPresentationDocumentSchema` | `.strict()` |
| Backend generado | `BackendPresentationDocumentSchema` | `.strict()` |
| Persistido DB | (adapter-level) | `.strict()` o `.strip()` según adapter |
| Metadata notebook | campo `metadata` dentro de entidades | `.passthrough()` controlado vía `JsonObjectSchema` |

## Reglas de pureza

- `packages/domain` solo importa `zod`
- No importa ningún `@tumbfolio/*`
- No importa React, NestJS, Next, Drizzle, BullMQ, S3 o Node APIs
- Parser, planner, NBXP y exporters deben poder probarse sin UI

## Fixtures

- `packages/domain/src/fixtures/` — fixtures mínimos de contrato (validan que schemas parsean)
- `packages/testing/` — builders, factories, escenarios ricos y snapshots futuros

## Tests

11 test files, 162 tests que cubren:

- Aceptación/rechazo de todos los enums
- Parse de schemas válidos e inválidos
- Discriminated unions de SlideBlock
- Config export discriminada por tipo
- Payloads de cliente estrictos
- Fronteras NBXP/upload estrictas
- Parse de todos los fixtures
- Arquitectura: imports prohibidos de `@tumbfolio/*`, React, NestJS, Next, Drizzle, BullMQ

## Criterios de aceptación

- [x] `packages/domain` compila aislado
- [x] No depende de React, Next, Nest, Drizzle, S3, BullMQ ni Playwright
- [x] Existen enums obligatorios
- [x] Existen tipos TypeScript para todas las entidades pedidas
- [x] Existen schemas Zod para todas las entidades pedidas
- [x] `PresentationDocumentSchema` valida un deck completo
- [x] `SlideBlockSchema` usa discriminated union, no JSON opaco
- [x] Bloques relevantes referencian `sourceCellId`, `sourceOutputId` o `assetId`
- [x] Existe `presentationModelVersion`
- [x] Existen fixtures mínimos de notebook normalizado
- [x] Existen fixtures mínimos de Presentation Model
- [x] Existen tests para schemas válidos e inválidos
- [x] Payloads de cliente separados de modelos backend
- [x] NBXP importado modelado como entrada no confiable
- [x] No hay `any` salvo casos justificados y encapsulados
- [x] No hay enums duplicados en apps
- [x] `pnpm typecheck`, `pnpm test` y `pnpm build` pasan
