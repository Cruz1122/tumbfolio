# Tumbfolio — Roadmap técnico sin fechas

## Criterio de este documento

Este roadmap técnico corre en paralelo al roadmap funcional. No reemplaza historias de usuario; las desbloquea. Cada entregable técnico define infraestructura, backend NestJS, contratos, persistencia, workers, renderers, seguridad, pruebas y prerequisitos necesarios para construir entregables funcionales sin improvisación.

Regla de lectura:

- `T-XX` = entregable técnico.
- `HU-XX` = entregable funcional basado en historia de usuario.
- Un entregable técnico puede desbloquear varios entregables funcionales.
- Un entregable funcional no debe construirse antes de que sus prerequisitos técnicos mínimos estén cerrados.

Tumbfolio será Full TypeScript con separación explícita:

```txt
apps/web      -> Next.js frontend
apps/api      -> NestJS backend HTTP
apps/worker   -> NestJS/BullMQ workers
packages/*    -> dominio, DB, storage, parser, NBXP, exporters y configuración
```

El backend oficial es NestJS. Next.js no alojará el backend core. El sistema no ejecutará notebooks en el MVP; leerá `.ipynb` ya ejecutados, validará estructura, normalizará celdas y outputs, generará un `Presentation Model`, persistirá proyectos y producirá exportes derivados: HTML, PDF, PPTX y NBXP.

---

## Mapa rápido de entregables funcionales

| ID | Entregable funcional referenciado |
|---|---|
| HU-01 | Crear proyecto subiendo un notebook ejecutado |
| HU-02 | Saber si el notebook puede convertirse correctamente |
| HU-03 | Leer contenido real del notebook |
| HU-04 | Obtener presentación inicial automáticamente |
| HU-05 | Revisar deck generado en editor visual |
| HU-06 | Ver Markdown, código, tablas, imágenes y logs correctamente renderizados |
| HU-07 | Ocultar código, logs y outputs innecesarios |
| HU-08 | Dividir y fusionar slides |
| HU-09 | Aplicar temas y modos |
| HU-10 | Presentar directamente desde la web |
| HU-11 | Exportar HTML portable |
| HU-12 | Exportar PDF |
| HU-13 | Exportar PPTX |
| HU-14 | Guardar proyecto como NBXP |
| HU-15 | Abrir archivo NBXP |
| HU-16 | Usar IA para mejorar una slide sin alterar resultados reales |
| HU-17 | Guardar proyectos en cuenta |
| HU-18 | Compartir deck |
| HU-19 | Observar calidad y fallos del producto |
| HU-20 | Primera versión vendible |
| HU-21 | Exportaciones pesadas sin bloquear editor |
| HU-22 | Rendimiento con notebooks medianos o grandes |

---

## Entregable T-01: Base del monorepo y estructura técnica inicial

### Desbloquea
- Prerrequisito transversal para HU-01 a HU-22.

### Objetivos técnicos
- Crear monorepo con `pnpm workspaces`.
- Crear `apps/web` con Next.js, React y TypeScript estricto.
- Crear `apps/api` con NestJS, TypeScript estricto, configuración por entorno y prefijo `/api`.
- Crear `apps/worker` con NestJS standalone/BullMQ para jobs pesados.
- Crear `packages/domain`, `packages/db`, `packages/config`, `packages/storage`, `packages/notebook`, `packages/nbxp`, `packages/export`, `packages/render-contracts` y `packages/testing`.
- Configurar scripts root: `dev`, `build`, `lint`, `typecheck`, `test`, `db:generate`, `db:migrate`.
- Configurar ESLint, Prettier, TypeScript references y aliases.
- Crear `README.md`, `.env.example`, `Makefile` y documentación mínima en `/docs`.

### Prerrequisitos
- Stack cerrado y aceptado.
- Decisión explícita: frontend Next.js, backend NestJS, worker NestJS/BullMQ.
- Decisión explícita de no ejecutar notebooks en el MVP.

### Consideraciones técnicas
- `apps/web` no debe importar código de `apps/api`; debe consumir la API.
- `packages/domain` debe ser puro: tipos, enums, schemas y funciones puras.
- Parser, normalizador, planner, NBXP y exporters deben poder probarse sin React.

### Riesgos
- Empezar por pantallas antes de contratos internos provocará reescritura.
- Mezclar UI con dominio hará imposible testear parser, planner y exporters de forma limpia.
- Dejar backend dentro de Next.js recrearía el error de arquitectura que se está corrigiendo.

### Recomendaciones
- Usar `@tumbfolio/*` como namespace interno.
- Crear health checks separados: web, API y worker.
- Fallar el CI si `typecheck`, `lint` o tests mínimos fallan.

---

## Entregable T-02: Contratos de dominio y schemas compartidos

### Desbloquea
- HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16.

### Objetivos técnicos
- Definir tipos TypeScript para `SourceNotebook`, `NotebookCell`, `NormalizedOutput`, `Presentation`, `Slide`, `SlideBlock`, `Asset`, `Theme`, `ExportJob` y `AiSuggestion`.
- Crear schemas Zod para validar payloads externos e internos.
- Definir enums: `cell_type`, `output_type`, `render_strategy`, `slide_layout`, `slide_status`, `presentation_mode`, `export_type`, `asset_type`.
- Definir el contrato del `Presentation Model` como fuente de verdad para editor, presentación, exports y NBXP.
- Crear fixtures mínimos de notebooks normalizados y Presentation Model.

### Prerrequisitos
- T-01 completo.

### Consideraciones técnicas
- El `Presentation Model` no es una copia del `.ipynb`; representa una presentación curada.
- Los schemas deben distinguir datos confiables generados por backend de entradas no confiables: upload, NBXP importado y payloads de cliente.
- Todo bloque relevante debe poder referenciar celda, output o asset fuente.

### Riesgos
- Si el modelo cambia sin control, API, editor y exporters se romperán.
- Si el modelo es demasiado genérico, se convertirá en JSON opaco.

### Recomendaciones
- Versionar con `presentation_model_version`.
- Mantener IDs estables desde el principio.

---

## Entregable T-03: Base de datos, migraciones y seed mínimo

### Desbloquea
- HU-01, HU-02, HU-03, HU-04, HU-05, HU-07, HU-09, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16, HU-17, HU-18, HU-19.

### Objetivos técnicos
- Crear `packages/db` con Drizzle y PostgreSQL.
- Implementar tablas: `users`, `projects`, `source_notebooks`, `notebook_cells`, `notebook_outputs`, `presentations`, `slides`, `slide_blocks`, `assets`, `themes`, `export_jobs`, `ai_suggestions`, `share_links`, `activity_events`.
- Crear índices por `user_id`, `project_id`, `presentation_id`, `source_notebook_id`, `slide_id`, `status` y `created_at`.
- Definir constraints de orden: `cell_index`, `output_index`, `slide_order`, `block_order`.
- Crear migraciones reproducibles.
- Crear seed de temas: `Colab Clean`, `Academic Paper`, `Executive Data`.

### Prerrequisitos
- T-01 completo.
- T-02 suficientemente estable.
- PostgreSQL local o gestionado.

### Consideraciones técnicas
- Usar columnas relacionales para identidad, relaciones, estados, orden y auditoría.
- Usar `jsonb` para metadata flexible, warnings, configuración de render, payloads IA y configuración de export.
- El API NestJS nunca debe armar SQL manual disperso; debe usar helpers de `packages/db`.

### Riesgos
- Guardar todo el deck como JSON gigante impedirá consultas y auditoría.
- Sobrenormalizar outputs complejos antes de probar notebooks reales ralentizará el desarrollo.

### Recomendaciones
- Usar transacciones al generar un deck completo.
- Crear tests de migración antes de meter datos reales.

---

## Entregable T-04: Configuración, variables de entorno y seguridad base

### Desbloquea
- HU-01 a HU-22.

### Objetivos técnicos
- Crear `packages/config` con validación de env mediante Zod.
- Definir env para web, API y worker.
- Configurar CORS del API para `apps/web`.
- Configurar Helmet, compresión y límites de body en NestJS.
- Definir prefijos: API `/api`, health `/health`, docs `/api/docs`.
- Crear OpenAPI con Swagger para endpoints NestJS.

### Prerrequisitos
- T-01 completo.

### Consideraciones técnicas
- Web, API y worker tienen variables distintas; no mezclar secretos server-side en Next público.
- Todo secreto debe validarse al arrancar el proceso.

### Riesgos
- Variables mal validadas producen errores tardíos y difíciles de depurar.
- Exponer secretos al frontend es fallo crítico.

---

## Entregable T-05: Storage de archivos, assets y claves estables

### Desbloquea
- HU-01, HU-06, HU-11, HU-12, HU-13, HU-14, HU-15, HU-17, HU-18.

### Objetivos técnicos
- Crear `StorageModule` en NestJS y `packages/storage`.
- Configurar cliente S3-compatible.
- Definir namespaces: `notebooks/`, `assets/`, `exports/`, `nbxp/`, `thumbnails/`.
- Implementar upload, download, URLs firmadas, multipart upload y eliminación controlada.
- Calcular `sha256` para archivos fuente y assets generados.
- Validar MIME real cuando aplique.

### Prerrequisitos
- T-03 completo.
- Bucket S3-compatible disponible.

### Consideraciones técnicas
- El backend no debe depender de rutas locales para reconstruir decks.
- Las claves no deben exponer nombres sensibles.

### Riesgos
- Guardar assets en disco local rompe despliegues distribuidos.
- No calcular hashes dificulta integridad y debugging.

---

## Entregable T-06: NestJS API base y módulos de dominio

### Desbloquea
- HU-01, HU-02, HU-05, HU-07, HU-09, HU-10, HU-17, HU-18.

### Objetivos técnicos
- Crear `apps/api` con módulos base: `ProjectsModule`, `NotebooksModule`, `PresentationsModule`, `SlidesModule`, `AssetsModule`, `ThemesModule`, `ExportsModule`, `NbxpModule`, `AiModule`, `SharingModule`.
- Crear pipes globales de validación.
- Crear filtros de excepción con `error_code` y mensajes seguros.
- Crear interceptors de logging y request id.
- Crear DTOs validados para payloads públicos.
- Crear OpenAPI inicial.

### Prerrequisitos
- T-01, T-02, T-03, T-04 completos.

### Consideraciones técnicas
- El API debe hablar en términos de producto: proyectos, notebooks, presentaciones, slides, bloques, exports.
- No exponer estructura interna de storage o DB al frontend.

### Riesgos
- Controladores con lógica pesada se volverán imposibles de testear.

### Recomendaciones
- Controladores delgados, servicios con intención clara y lógica pura en packages compartidos.

---

## Entregable T-07: Backend de upload y creación inicial de proyecto

### Desbloquea
- HU-01.

### Objetivos técnicos
- Crear endpoint NestJS para iniciar upload y/o generar URL firmada.
- Crear `project` y `source_notebook` al aceptar archivo.
- Asociar archivo a usuario real o usuario local simulado.
- Guardar estado inicial `uploaded`.
- Persistir tamaño, hash, nombre original y `storage_key`.
- Rechazar archivos por extensión, tamaño o MIME incompatible.

### Prerrequisitos
- T-05 y T-06 completos.

### Consideraciones técnicas
- No meter archivos grandes completos en memoria si se puede evitar.
- Separar upload, validación y procesamiento.

### Riesgos
- Endpoint monolítico upload→parse→deck será frágil.

---

## Entregable T-08: Validador de notebooks y resumen técnico

### Desbloquea
- HU-02.

### Objetivos técnicos
- Leer archivo desde storage.
- Validar JSON parseable y estructura mínima `nbformat`.
- Detectar celdas, outputs, tipos de celda y MIME types.
- Persistir `validation_status`, `validation_errors`, `validation_warnings`, `cell_count`, `output_count`, `detected_mime_types`.
- Exponer endpoint de resumen para la pantalla de análisis.

### Prerrequisitos
- T-07 completo.
- T-02 con schemas iniciales.

### Consideraciones técnicas
- Notebook sin outputs = warning, no error fatal si tiene Markdown útil.
- Notebook corrupto = error fatal con reason code.

### Recomendaciones
- Reason codes: `INVALID_JSON`, `UNSUPPORTED_NBFORMAT`, `EMPTY_NOTEBOOK`, `NO_CELLS`, `NO_OUTPUTS`, `FILE_TOO_LARGE`.

---

## Entregable T-09: Parser y normalizador de celdas/outputs

### Desbloquea
- HU-03, HU-06, HU-20.

### Objetivos técnicos
- Crear `packages/notebook` con parser puro.
- Convertir celdas `.ipynb` a `notebook_cells`.
- Convertir outputs a `notebook_outputs`.
- Normalizar `source` string/array.
- Detectar output principal por prioridad MIME.
- Separar `stdout`, `stderr`, `error`, `text/plain`, `text/html`, imágenes y SVG.
- Extraer imágenes base64 a assets.
- Definir `render_strategy` inicial.

### Prerrequisitos
- T-08 completo.
- T-05 completo para assets.

### Consideraciones técnicas
- El parser nunca ejecuta código.
- La normalización debe ser determinista.

### Riesgos
- Mezclar parser con renderer acopla backend y frontend.
- Guardar blobs en DB infla la persistencia.

---

## Entregable T-10: Clasificador heurístico y detector de ruido

### Desbloquea
- HU-04, HU-07, HU-08, HU-09, HU-16, HU-20.

### Objetivos técnicos
- Clasificar celdas como narrativa, setup, análisis, visualización, tabla, figura, log, error o ruido.
- Detectar imports, instalaciones, warnings repetitivos, errores, prints de debugging y outputs largos.
- Asignar `is_noise`, `priority` y `render_strategy`.
- Producir señales para planner: sección, slide, output protagonista, apéndice u oculto.

### Prerrequisitos
- T-09 completo.

### Consideraciones técnicas
- El ruido se oculta, no se borra.
- Las heurísticas deben ser explicables.

---

## Entregable T-11: Generador del Presentation Model y planner de slides

### Desbloquea
- HU-04, HU-05, HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14, HU-16, HU-20.

### Objetivos técnicos
- Crear `Presentation Model` desde celdas y outputs normalizados.
- Detectar secciones desde Markdown.
- Agrupar celdas relacionadas.
- Crear slides con layouts iniciales.
- Crear bloques con referencias a celdas, outputs y assets.
- Asignar estados: `normal`, `too_dense`, `has_unsupported_output`, `has_hidden_logs`, `needs_review`.
- Persistir `presentations`, `slides` y `slide_blocks` en una transacción.

### Prerrequisitos
- T-10 completo.
- T-02 y T-03 completos.

### Riesgos
- Regla “una celda = una slide” producirá decks malos.
- Perder referencias fuente romperá NBXP, IA y exports.

---

## Entregable T-12: API NestJS del editor y persistencia de cambios

### Desbloquea
- HU-05, HU-07, HU-08, HU-09, HU-10, HU-16, HU-17.

### Objetivos técnicos
- Endpoints para leer proyecto, notebook, presentación, slides, bloques, assets y temas.
- Endpoints para actualizar título, layout, orden, visibilidad, tema, modo y speaker notes.
- Autosave o guardado explícito.
- Validación con DTOs/Zod.
- Control de concurrencia básico.
- Garantizar que cambios de editor no modifiquen el notebook original.

### Prerrequisitos
- T-11 completo.
- T-06 completo.

### Recomendaciones
- Endpoints por intención: `updateSlide`, `reorderSlides`, `updateBlockVisibility`, `changeTheme`, `changeMode`.

---

## Entregable T-13: Render layer MVP y seguridad de HTML

### Desbloquea
- HU-06, HU-10, HU-11, HU-12, HU-13, HU-18, HU-20.

### Objetivos técnicos
- Implementar `MimeRenderer` en paquetes compartidos y componentes web.
- Renderers: Markdown, código, texto plano, HTML básico, imagen, SVG, LaTeX, DataFrame HTML, stream y error.
- Sanitizar Markdown/HTML cuando sea posible.
- Aislar HTML complejo en `iframe sandbox`.
- Bloquear scripts por defecto.
- Mostrar placeholders para MIME no soportados.

### Prerrequisitos
- T-09 y T-11 completos.

### Riesgos
- XSS en outputs HTML es fallo crítico.
- Renderers distintos para editor/export crean inconsistencias.

---

## Entregable T-14: Editor visual base en Next.js

### Desbloquea
- HU-05, HU-06, HU-07, HU-08, HU-09, HU-16, HU-20.

### Objetivos técnicos
- Sidebar de slides.
- Preview central conectado al render layer.
- Panel de propiedades.
- Navegación entre slides.
- Badges de estado.
- React Query para server state.
- Zustand para estado local del editor.
- Guardado usando API NestJS.

### Prerrequisitos
- T-12 y T-13 completos.

### Consideraciones técnicas
- El editor usa el `Presentation Model`; no inventa otro modelo.
- No debe editar el notebook original.

---

## Entregable T-15: Visibilidad, presets, temas y modos

### Desbloquea
- HU-07, HU-09, HU-10, HU-11, HU-12, HU-13, HU-20.

### Objetivos técnicos
- Modelo de visibilidad por bloque: `showCode`, `showOutput`, `collapseCode`, `collapseLogs`, `includeInExport`.
- Overrides por slide o bloque.
- Presets: outputs only, docente, ejecutivo, investigador.
- Temas: `Colab Clean`, `Academic Paper`, `Executive Data`.
- Cambios sin regenerar notebook ni perder ediciones manuales.

### Prerrequisitos
- T-12 y T-14 completos.

### Recomendación
- Centralizar resolución de visibilidad en `resolveBlockVisibility()`.

---

## Entregable T-16: Operaciones estructurales de slides y bloques

### Desbloquea
- HU-08, HU-05, HU-20.

### Objetivos técnicos
- Reorder de slides.
- Reorder de bloques.
- Split por bloques, celdas, Markdown/output o código/output.
- Merge de slides consecutivas.
- Mover bloque a apéndice.
- Recalcular layout sugerido.
- Persistir cambios en transacciones.

### Prerrequisitos
- T-12, T-14 y IDs estables de T-11.

### Riesgos
- Reordenar sin transacción deja inconsistencias.
- Duplicar assets durante split/merge infla storage y NBXP.

---

## Entregable T-17: Modo presentación web

### Desbloquea
- HU-10, HU-20.

### Objetivos técnicos
- Ruta fullscreen en `apps/web`.
- Carga read-only desde API NestJS.
- Navegación por teclado.
- Progreso y salida al editor.
- Speaker notes.
- Lazy rendering de slides fuera de viewport.
- Reutilizar render layer y visibilidad.

### Prerrequisitos
- T-13 y T-15 completos.

### Consideraciones técnicas
- HTML es el formato canónico.
- No debe existir otro modelo para presentación.

---

## Entregable T-18: Infraestructura de workers y export jobs

### Desbloquea
- HU-11, HU-12, HU-13, HU-14, HU-19, HU-20, HU-21.

### Objetivos técnicos
- Crear tabla/API de `export_jobs`.
- Configurar Redis y BullMQ en NestJS.
- Crear `apps/worker` con processors separados.
- Estados: `queued`, `running`, `completed`, `failed`, `expired`.
- Persistir configuración, errores y `result_asset_id`.
- Polling desde frontend.

### Prerrequisitos
- T-03, T-05 y T-12 completos.

### Consideraciones técnicas
- PDF/PPTX no deben correr dentro del request web.
- El MVP puede ejecutar algunos jobs síncronos, pero el modelo persistente debe ser job-based.

---

## Entregable T-19: Export HTML standalone

### Desbloquea
- HU-11, HU-20.

### Objetivos técnicos
- Generar HTML desde `Presentation Model`.
- Empaquetar CSS, JS mínimo y assets.
- Soportar `.html` autocontenible y `.zip` con assets.
- Registrar resultado en `export_jobs` y `assets`.

### Prerrequisitos
- T-13, T-17 y T-18 completos.

---

## Entregable T-20: Export PDF

### Desbloquea
- HU-12, HU-20.

### Objetivos técnicos
- CSS print.
- Playwright/Chromium en worker.
- Cada slide como página PDF.
- Fallback visual a HTML complejo.
- Registrar PDF como asset.
- Guardar errores de render.

### Prerrequisitos
- T-17 y T-18 completos.

### Recomendación
- Ejecutar en worker/container separado.

---

## Entregable T-21: Export PPTX inicial

### Desbloquea
- HU-13.

### Objetivos técnicos
- Convertir slides a objetos PPTX con PptxGenJS.
- Texto como cajas editables.
- Imágenes como imágenes.
- Tablas simples como tablas PPTX.
- Código como cajas monoespaciadas.
- HTML complejo como imagen.
- Registrar PPTX como asset.

### Prerrequisitos
- T-13 y T-18 completos.

### Consideración
- PPTX será útil, no perfecto. No debe prometer paridad total con HTML.

---

## Entregable T-22: NBXP serializer

### Desbloquea
- HU-14, HU-20.

### Objetivos técnicos
- Serializar `Presentation Model` a `presentation.xml`.
- Generar `manifest.xml` con partes, media types, hashes y versión.
- Generar `theme.xml`.
- Empaquetar assets referenciados.
- Incluir `source/original.ipynb` solo si el usuario lo activa.
- Crear `.nbxp` como ZIP.
- Registrar NBXP como asset y export job.

### Prerrequisitos
- T-11, T-05 y T-18 completos.

### Riesgos
- XML con blobs Base64 será pesado y difícil de validar.
- No versionar NBXP desde el inicio rompe migraciones.

---

## Entregable T-23: NBXP importer, validator y migraciones

### Desbloquea
- HU-15.

### Objetivos técnicos
- Detectar `.nbxp` en upload.
- Validar ZIP y estructura interna.
- Leer `manifest.xml`, `presentation.xml` y `theme.xml`.
- Validar versión.
- Reconstruir `Presentation Model`.
- Rehidratar assets internos.
- Mostrar placeholders si faltan assets no críticos.
- Preparar migraciones de formato.

### Prerrequisitos
- T-22 completo.

### Consideraciones técnicas
- NBXP importado no es confiable. Debe validarse como entrada externa.

---

## Entregable T-24: IA asistida con guardrails

### Desbloquea
- HU-16.

### Objetivos técnicos
- Servicio NestJS `AiModule`.
- Acciones: generar título, mejorar título, resumir slide, speaker notes, sugerir visibilidad, conclusión.
- Contexto limitado por slide.
- Guardar en `ai_suggestions`.
- Estados: `pending`, `accepted`, `edited`, `rejected`.
- Aplicar cambios solo tras confirmación del usuario.

### Prerrequisitos
- T-11, T-12, T-15 y tabla `ai_suggestions`.

### Riesgos
- Conclusiones inventadas destruyen confianza.
- Enviar notebooks completos aumenta costo y exposición.

---

## Entregable T-25: Autenticación, ownership y dashboard

### Desbloquea
- HU-17, HU-18.

### Objetivos técnicos
- Activar autenticación real.
- Asociar proyectos, notebooks, presentaciones, assets y jobs a usuarios.
- Middleware/guards de autorización en NestJS.
- Dashboard de proyectos en Next.js.
- Permisos mínimos de lectura/escritura.

### Prerrequisitos
- T-03 y core editor/export suficientemente maduro.

### Consideraciones técnicas
- La DB debe tener `user_id` desde el inicio, aunque el prototipo use usuario simulado.

---

## Entregable T-26: Sharing read-only y permisos de deck

### Desbloquea
- HU-18.

### Objetivos técnicos
- Crear `share_links`.
- Tokens seguros con hash persistido.
- Permisos: `view_only`, `duplicate`, `download_enabled`.
- Vista pública read-only.
- Revocación y expiración.
- CSP, sanitización y sandbox en decks compartidos.

### Prerrequisitos
- T-17, T-25 y T-13 completos.

---

## Entregable T-27: Observabilidad, métricas y errores trazables

### Desbloquea
- HU-19, HU-20, HU-22.

### Objetivos técnicos
- Logging estructurado con `project_id`, `source_notebook_id`, `presentation_id`, `export_job_id`.
- Medir upload→deck.
- Medir notebooks válidos, inválidos y fallidos.
- Medir MIME types no soportados.
- Medir slides `too_dense`.
- Medir errores de export por formato.
- Medir uso de IA y aceptación/rechazo.

### Consideraciones técnicas
- No registrar notebooks completos ni outputs sensibles en logs.

---

## Entregable T-28: Hardening de MVP y primera versión vendible

### Desbloquea
- HU-20, HU-22.

### Objetivos técnicos
- Probar notebooks reales con Markdown, pandas, Matplotlib, stdout, stderr, imágenes y HTML básico.
- Corregir fallos críticos de parser, render, editor y export.
- Definir límites: tamaño de archivo, número de celdas, outputs y assets.
- Smoke tests E2E: upload, generar deck, curar, presentar, exportar HTML/PDF.
- Revisar mensajes de error.
- Revisar seguridad de HTML, SVG y assets.
- Documentar limitaciones del MVP.

### Prerrequisitos
- T-01 a T-20 completos para MVP HTML/PDF.
- T-22/T-23 si NBXP entra en primera versión vendible.
- T-21 si PPTX entra en alcance vendible inicial.

### Regla
- No agregar IA, sharing o PPTX antes de cerrar importación → deck → curación → presentación → HTML/PDF con calidad consistente.

---

## Dependencias principales

```txt
T-01 Base monorepo
  -> T-02 Contratos dominio
  -> T-03 DB
  -> T-04 Config/security
  -> T-05 Storage
  -> T-06 NestJS API base
  -> T-07 Upload
  -> T-08 Validación
  -> T-09 Parser/normalizador
  -> T-10 Clasificador ruido
  -> T-11 Presentation Model/planner
  -> T-12 API editor
  -> T-13 Render layer
  -> T-14 Editor web
  -> T-15 Visibilidad/temas/modos
  -> T-16 Split/Merge
  -> T-17 Presentación web
  -> T-18 Export jobs/workers
  -> T-19 HTML export
  -> T-20 PDF export
  -> T-22 NBXP serializer
  -> T-23 NBXP importer
  -> T-28 MVP vendible
```

```txt
Ramas paralelas después del core:

T-21 PPTX inicial
  depende de T-13, T-18 y fallbacks visuales

T-24 IA asistida
  depende de T-11, T-12 y T-15

T-25 Auth/ownership
  puede prepararse desde T-03, pero activarse cuando el core sea estable

T-26 Sharing
  depende de T-17, T-25 y T-13

T-27 Observabilidad
  empieza temprano, pero madura cuando existan upload, generación y exports
```

---

## Secuencia mínima para construir sin perder foco

1. Cerrar base técnica: T-01, T-02, T-03, T-04, T-05, T-06.
2. Cerrar importación real: T-07, T-08, T-09.
3. Cerrar inteligencia determinista: T-10, T-11.
4. Cerrar editor usable: T-12, T-13, T-14, T-15, T-16.
5. Cerrar presentación y exportes vendibles: T-17, T-18, T-19, T-20.
6. Decidir si NBXP entra en MVP vendible: T-22, T-23.
7. Agregar PPTX, IA, auth y sharing solo cuando el core ya genere decks buenos.

---

## Regla final de ejecución

No se debe construir funcionalidad visible si su base técnica no existe. Un botón de export sin `export_jobs`, un editor sin persistencia en NestJS, un render HTML sin sanitización, una IA sin auditoría o un NBXP sin manifest son atajos falsos. Tumbfolio gana por confiabilidad del pipeline, no por acumular pantallas.
