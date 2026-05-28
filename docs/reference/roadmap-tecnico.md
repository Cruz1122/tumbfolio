# Tumbfolio — Roadmap técnico sin fechas

## Criterio de este documento

Este roadmap técnico corre en paralelo al roadmap funcional. No reemplaza las historias de usuario; las desbloquea. Cada entregable técnico define infraestructura, backend, contratos, persistencia, workers, renderers, seguridad, pruebas y prerequisitos necesarios para que uno o varios entregables funcionales puedan construirse sin improvisación.

La regla de lectura es simple:

- `T-XX` = entregable técnico.
- `HU-XX` = entregable del roadmap funcional basado en historia de usuario.
- Un entregable técnico puede desbloquear varios entregables funcionales.
- Un entregable funcional no debería construirse antes de que sus prerequisitos técnicos mínimos estén cerrados.

Tumbfolio se mantendrá como una aplicación Full TypeScript. No ejecutará notebooks en el MVP. El backend leerá notebooks `.ipynb` ya ejecutados, validará estructura, normalizará celdas y outputs, generará un `Presentation Model`, persistirá proyectos y producirá exportes derivados: HTML, PDF, PPTX y NBXP.

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

---

## Entregable T-01: Base del proyecto y estructura técnica inicial

### Desbloquea
- Prerequisito transversal para HU-01 a HU-20.

### Objetivos técnicos
- Crear el proyecto con Next.js, React y TypeScript estricto.
- Configurar `pnpm`, scripts base, linting, formatting, typecheck y testing mínimo.
- Definir estructura de carpetas para `app`, `components`, `lib`, `db`, `workers`, `tests` y `scripts`.
- Crear módulos separados para `notebook`, `presentation`, `renderers`, `exports`, `nbxp`, `storage`, `ai`, `security` y `observability`.
- Configurar manejo de variables de entorno con validación en runtime.
- Crear un `README.md` técnico con comandos de instalación, desarrollo, pruebas y migraciones.

### Prerrequisitos
- Stack cerrado y aceptado.
- Versión de Node, pnpm y dependencias fijadas en `package.json`.
- Decisión explícita de no ejecutar notebooks en el MVP.

### Consideraciones técnicas
- El proyecto debe iniciar con TypeScript `strict`. Activarlo después suele revelar deuda demasiado tarde.
- La estructura debe separar dominio de UI. El parser de notebooks no debe depender de React.
- Las funciones puras de parsing, normalización, planificación y serialización deben vivir fuera de componentes.

### Riesgos
- Empezar por pantallas antes de definir contratos internos provocará reescritura.
- Mezclar lógica de dominio con componentes hará difícil probar parser, planner, exporters y NBXP.

### Recomendaciones
- Mantener una carpeta `lib/presentation` como núcleo de modelo y reglas.
- Definir aliases de importación desde el inicio.
- Crear tests mínimos que validen que el proyecto compila, testea y ejecuta typecheck.

---

## Entregable T-02: Contratos de dominio y schemas de validación

### Desbloquea
- HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16.

### Objetivos técnicos
- Definir tipos TypeScript para `SourceNotebook`, `NotebookCell`, `NormalizedOutput`, `Presentation`, `Slide`, `SlideBlock`, `Asset`, `Theme`, `ExportJob` y `AiSuggestion`.
- Crear schemas Zod para validar payloads externos e internos.
- Definir enums de dominio: `cell_type`, `output_type`, `render_strategy`, `slide_layout`, `slide_status`, `presentation_mode`, `export_type` y `asset_type`.
- Definir el contrato del `Presentation Model` como fuente de verdad para editor, presentación y exportes.
- Crear fixtures mínimos de ejemplo para Presentation Model y notebooks normalizados.

### Prerrequisitos
- T-01 completo.
- Decisiones de modelo conceptual aceptadas.

### Consideraciones técnicas
- El `Presentation Model` no debe ser una copia del `.ipynb`. Debe representar una presentación curada.
- Los schemas deben distinguir datos confiables generados por el backend de datos no confiables provenientes del upload o de NBXP importado.
- Los tipos deben permitir trazabilidad: todo bloque relevante debe poder referenciar celda, output o asset fuente.

### Riesgos
- Si el modelo interno cambia cada semana, editor y exportadores se romperán constantemente.
- Si el modelo es demasiado genérico, terminará siendo un JSON opaco sin garantías.

### Recomendaciones
- Versionar el modelo desde el inicio con `presentation_model_version`.
- Mantener el modelo pequeño al principio, pero con IDs estables.
- Evitar campos ambiguos como `data: any` salvo en fronteras claramente encapsuladas.

---

## Entregable T-03: Base de datos, migraciones y seed mínimo

### Desbloquea
- HU-01, HU-02, HU-03, HU-04, HU-05, HU-07, HU-09, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16, HU-17, HU-18, HU-19.

### Objetivos técnicos
- Crear schema Drizzle para PostgreSQL.
- Implementar tablas núcleo: `users`, `projects`, `source_notebooks`, `notebook_cells`, `notebook_outputs`, `presentations`, `slides`, `slide_blocks`, `assets`, `themes`, `export_jobs`, `ai_suggestions`.
- Definir índices para búsquedas por `project_id`, `presentation_id`, `source_notebook_id`, `slide_id` y `status`.
- Definir constraints de orden: `cell_index`, `output_index`, `slide_order`, `block_order`.
- Crear migraciones reproducibles.
- Crear seed de temas iniciales: `Colab Clean`, `Academic Paper`, `Executive Data`.

### Prerrequisitos
- T-01 completo.
- T-02 suficientemente estable.
- PostgreSQL disponible localmente o en entorno gestionado.

### Consideraciones técnicas
- PostgreSQL debe usar columnas relacionales para identidad, estados, relaciones y orden.
- `jsonb` debe reservarse para metadata flexible, warnings, configuración de render, payloads IA y configuración de export.
- Las tablas no deben intentar modelar todo Jupyter. Solo deben persistir lo necesario para reconstruir Tumbfolio.

### Riesgos
- Guardar todo el deck como JSON gigante impedirá consultas, auditoría y export jobs robustos.
- Sobrenormalizar outputs complejos antes de conocer notebooks reales ralentizará desarrollo sin mejorar producto.

### Recomendaciones
- Diseñar el schema para reconstruir el deck, no para analizar notebooks científicamente.
- Usar transacciones cuando se genere un deck completo.
- Crear pruebas de migración y rollback antes de meter datos reales.

---

## Entregable T-04: Storage de archivos, assets y claves estables

### Desbloquea
- HU-01, HU-06, HU-11, HU-12, HU-13, HU-14, HU-15, HU-17, HU-18.

### Objetivos técnicos
- Configurar cliente S3-compatible.
- Definir namespaces de storage: `notebooks/`, `assets/`, `exports/`, `nbxp/`, `thumbnails/`.
- Implementar cálculo de `sha256` para archivos fuente y assets generados.
- Persistir `storage_key`, `media_type`, `file_size_bytes`, `sha256` y `asset_type`.
- Crear utilidades para upload, download, URLs firmadas y eliminación controlada.
- Validar MIME real cuando aplique, no solo extensión.

### Prerrequisitos
- T-01 completo.
- T-03 con tabla `assets` y `source_notebooks`.
- Bucket S3-compatible disponible.

### Consideraciones técnicas
- El backend no debe depender de rutas locales para reconstruir decks.
- Los assets derivados deben ser referenciables desde slides, exports y NBXP.
- Las claves deben ser estables, pero no deben exponer nombres sensibles del usuario.

### Riesgos
- Guardar assets en disco local romperá despliegues distribuidos.
- No calcular hash dificultará deduplicación, integridad y debugging.

### Recomendaciones
- Usar claves basadas en `project_id`, `asset_id` y extensión derivada de MIME.
- Separar archivo original de assets derivados.
- Evitar que la UI consuma directamente claves internas sin URL controlada.

---

## Entregable T-05: Backend de upload y creación inicial de proyecto

### Desbloquea
- HU-01.

### Objetivos técnicos
- Crear endpoint o flujo de URL firmada para subir `.ipynb`.
- Crear registro `project` y `source_notebook` al aceptar archivo.
- Asociar archivo al usuario actual o a usuario local simulado si auth aún no existe.
- Guardar estado inicial `uploaded`.
- Calcular tamaño, hash y nombre original.
- Rechazar archivos por extensión, tamaño o MIME incompatible.

### Prerrequisitos
- T-03 completo.
- T-04 completo.
- Usuario local simulado o modelo `users` mínimo.

### Consideraciones técnicas
- La carga no debe meter archivos grandes completos en memoria si puede evitarse.
- El frontend debe recibir estados claros: `accepted`, `rejected`, `uploading`, `uploaded`, `failed`.
- El backend debe dejar listo el notebook para validación asincrónica o inmediata.

### Riesgos
- Un endpoint monolítico que sube, valida, parsea y genera deck será frágil.
- Aceptar cualquier JSON con extensión `.ipynb` dará falsos positivos.

### Recomendaciones
- Empezar con procesamiento síncrono si el MVP lo requiere, pero modelar estados como si pudiera ser async.
- Crear errores internos con `reason_code` y mensajes seguros para usuario.

---

## Entregable T-06: Validador de notebooks y resumen técnico

### Desbloquea
- HU-02.

### Objetivos técnicos
- Leer archivo desde storage.
- Validar JSON parseable.
- Validar estructura mínima de `nbformat`.
- Detectar celdas, outputs, tipos de celda y tipos de output.
- Detectar MIME types presentes en outputs.
- Persistir `validation_status`, `validation_errors`, `validation_warnings`, `cell_count`, `output_count`, `detected_mime_types`.
- Exponer endpoint de resumen para la pantalla de análisis.

### Prerrequisitos
- T-05 completo.
- T-02 con schemas de validación iniciales.

### Consideraciones técnicas
- Un notebook sin outputs debe ser warning, no error fatal, siempre que tenga contenido útil.
- Un notebook corrupto o no parseable sí debe ser error fatal.
- Los errores técnicos deben conservarse para debugging, pero el usuario debe ver mensajes limpios.

### Riesgos
- Validar superficialmente hará que el parser falle más adelante con errores peores.
- Rechazar notebooks parcialmente válidos puede limitar innecesariamente casos reales.

### Recomendaciones
- Implementar reason codes: `INVALID_JSON`, `UNSUPPORTED_NBFORMAT`, `EMPTY_NOTEBOOK`, `NO_CELLS`, `NO_OUTPUTS`, `FILE_TOO_LARGE`.
- Guardar una muestra limitada de MIME types y warnings, no blobs completos dentro de metadata.

---

## Entregable T-07: Parser y normalizador de celdas/outputs

### Desbloquea
- HU-03, HU-06, HU-20.

### Objetivos técnicos
- Convertir celdas `.ipynb` a `notebook_cells` persistentes.
- Convertir outputs a `notebook_outputs` persistentes.
- Normalizar `source` cuando venga como string o arreglo de strings.
- Detectar output principal por prioridad MIME.
- Separar `stdout`, `stderr`, `error`, `text/plain`, `text/html`, imágenes y SVG.
- Extraer imágenes base64 a assets cuando corresponda.
- Definir `render_strategy` inicial por output.

### Prerrequisitos
- T-06 completo.
- T-04 completo para guardar assets extraídos.
- T-03 con tablas `notebook_cells`, `notebook_outputs` y `assets`.

### Consideraciones técnicas
- El parser no ejecuta código bajo ninguna circunstancia.
- La normalización debe ser determinista.
- La metadata original puede conservarse en `jsonb`, pero no debe volverse requisito para renderizar todo.

### Riesgos
- Mezclar parser con renderer acoplará backend y frontend innecesariamente.
- No extraer imágenes a assets puede inflar la base de datos con blobs.

### Recomendaciones
- Crear fixtures con notebooks reales y notebooks sucios.
- Mantener snapshots de outputs normalizados para detectar regresiones.

---

## Entregable T-08: Clasificador heurístico y detector de ruido

### Desbloquea
- HU-04, HU-07, HU-08, HU-09, HU-16, HU-20.

### Objetivos técnicos
- Clasificar celdas como `narrative_markdown`, `setup_code`, `analysis_code`, `visualization_code`, `modeling_code`, `table_output`, `figure_output`, `log_output`, `error_output` o `noise`.
- Detectar imports, instalación de paquetes, configuración, warnings repetitivos, errores, prints de debugging y outputs largos.
- Asignar `is_noise`, `priority` y `render_strategy` más precisa.
- Producir señales para planner: sección, posible slide, output protagonista, apéndice o contenido oculto.

### Prerrequisitos
- T-07 completo.
- Fixtures representativos.

### Consideraciones técnicas
- Las heurísticas deben ser explicables. Si una celda se oculta por defecto, el sistema debe poder justificarlo.
- El ruido se oculta, no se borra.
- La clasificación debe poder mejorarse sin migrar toda la base si se recalcula.

### Riesgos
- Heurísticas agresivas pueden ocultar contenido relevante.
- Heurísticas demasiado blandas producirán decks llenos de basura.

### Recomendaciones
- Guardar clasificación inicial y permitir overrides futuros.
- Usar thresholds simples al inicio: longitud, tipo MIME, cantidad de líneas, palabras clave y posición en notebook.

---

## Entregable T-09: Generador del Presentation Model y planner de slides

### Desbloquea
- HU-04, HU-05, HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14, HU-16, HU-20.

### Objetivos técnicos
- Crear `Presentation Model` desde celdas y outputs normalizados.
- Detectar secciones desde Markdown.
- Agrupar celdas relacionadas.
- Crear slides con layouts iniciales.
- Crear bloques con referencias a celdas, outputs y assets.
- Asignar `slide_status`: `normal`, `too_dense`, `has_unsupported_output`, `has_hidden_logs`, `needs_review`.
- Persistir `presentations`, `slides` y `slide_blocks` en una transacción.

### Prerrequisitos
- T-08 completo.
- T-03 completo.
- T-02 con contratos de Presentation Model.

### Consideraciones técnicas
- El planner no debe generar una slide por celda como regla general.
- Todo bloque debe tener ID estable y trazabilidad.
- El planner debe poder ejecutarse de nuevo para regenerar un deck si el usuario lo solicita, sin destruir una versión curada salvo confirmación.

### Riesgos
- Si la generación automática es mala, el producto entero parecerá malo.
- Si no se conservan referencias fuente, NBXP, IA y exportadores perderán contexto.

### Recomendaciones
- Separar `generateInitialPresentation()` de operaciones editoriales posteriores.
- Mantener heurísticas conservadoras y tests con snapshots del Presentation Model.

---

## Entregable T-10: API backend del editor y persistencia de cambios

### Desbloquea
- HU-05, HU-07, HU-08, HU-09, HU-10, HU-16, HU-17.

### Objetivos técnicos
- Crear endpoints para leer proyecto, notebook, presentación, slides, bloques, assets y temas.
- Crear endpoints para actualizar título de slide, layout, orden, visibilidad, tema, modo y speaker notes.
- Implementar autosave o guardado explícito con control de concurrencia básico.
- Definir payloads validados con Zod.
- Garantizar que cambios de editor no modifiquen el notebook original.

### Prerrequisitos
- T-09 completo.
- T-03 completo.
- T-02 con schemas de payload.

### Consideraciones técnicas
- El frontend puede tener estado local optimista, pero backend es la fuente persistente.
- Los cambios de orden deben ser transaccionales.
- El API debe devolver suficiente información para reconstruir el editor sin llamadas excesivas.

### Riesgos
- Guardar cambios solo en frontend romperá exportes y reapertura.
- Endpoints demasiado granulares pueden generar cascadas de requests innecesarias.

### Recomendaciones
- Diseñar endpoints por intención: `updateSlide`, `reorderSlides`, `updateBlockVisibility`, `changeTheme`, `changeMode`.
- Incluir `updated_at` o versión simple para detectar ediciones desactualizadas.

---

## Entregable T-11: Render layer MVP y seguridad de HTML

### Desbloquea
- HU-06, HU-10, HU-11, HU-12, HU-13, HU-18, HU-20.

### Objetivos técnicos
- Implementar capa `MimeRenderer`.
- Implementar renderers MVP: Markdown, código, texto plano, HTML básico, imagen, SVG, LaTeX, DataFrame HTML, stream y error.
- Sanitizar Markdown/HTML cuando sea posible.
- Aislar HTML complejo en `iframe sandbox`.
- Bloquear scripts por defecto.
- Mostrar placeholders para MIME types no soportados.
- Crear contrato para `exportToImage` y `exportToPptx` cuando aplique.

### Prerrequisitos
- T-07 completo.
- T-09 completo.
- T-04 para assets.

### Consideraciones técnicas
- El renderer debe poder funcionar en editor, presentación y export HTML.
- `text/html` no debe renderizarse directamente sin sanitización o sandbox.
- SVG debe tratarse como contenido activo potencialmente riesgoso.

### Riesgos
- Un XSS en outputs HTML destruiría confianza y seguridad.
- Renderers distintos para editor/export crearán inconsistencias visuales.

### Recomendaciones
- Construir una galería interna de fixtures por MIME type.
- Mantener snapshots visuales o smoke tests con Playwright.
- Mostrar advertencias honestas cuando haya fallback.

---

## Entregable T-12: Editor visual base

### Desbloquea
- HU-05, HU-06, HU-07, HU-08, HU-09, HU-16, HU-20.

### Objetivos técnicos
- Implementar sidebar de slides.
- Implementar preview central conectado al render layer.
- Implementar panel de propiedades.
- Implementar navegación entre slides.
- Implementar badges visuales de estado.
- Integrar React Query para server state.
- Integrar Zustand para estado local del editor.
- Implementar guardado de cambios usando T-10.

### Prerrequisitos
- T-10 completo.
- T-11 completo.
- T-09 completo.

### Consideraciones técnicas
- El editor no debe renderizar un modelo paralelo. Debe usar el mismo `Presentation Model`.
- El usuario no edita el notebook; edita slides y bloques.
- El panel derecho debe manipular propiedades cerradas, no CSS arbitrario.

### Riesgos
- Un editor demasiado libre se convertirá en PowerPoint barato.
- Un editor sin feedback de estados dejará al usuario perdido ante outputs no soportados.

### Recomendaciones
- Priorizar interacción rápida sobre personalización infinita.
- Implementar skeleton/loading/error states con cuidado desde el inicio.

---

## Entregable T-13: Visibilidad, presets, temas y modos

### Desbloquea
- HU-07, HU-09, HU-10, HU-11, HU-12, HU-13, HU-20.

### Objetivos técnicos
- Crear modelo de visibilidad por bloque: `showCode`, `showOutput`, `showMarkdown`, `collapseCode`, `collapseLogs`, `includeInExport`.
- Persistir overrides por slide o bloque.
- Implementar presets globales: outputs only, docente, ejecutivo e investigador.
- Implementar temas como tokens: `Colab Clean`, `Academic Paper`, `Executive Data`.
- Aplicar cambios sin regenerar notebook ni perder ediciones manuales.

### Prerrequisitos
- T-10 completo.
- T-12 completo.
- Seed de temas en T-03.

### Consideraciones técnicas
- Los modos son presets reversibles, no transformaciones destructivas.
- La visibilidad afecta editor, presentación y exportes.
- `includeInExport` puede diferir de visibilidad en editor si el producto lo requiere.

### Riesgos
- Si el modo ejecutivo borra detalle técnico, se vuelve peligroso para investigación.
- Si visibilidad y export no comparten lógica, el PDF/PPTX no reflejará el deck curado.

### Recomendaciones
- Centralizar resolución de visibilidad en una función pura: `resolveBlockVisibility()`.
- Testear presets contra fixtures de slides.

---

## Entregable T-14: Operaciones estructurales de slides y bloques

### Desbloquea
- HU-08, HU-05, HU-20.

### Objetivos técnicos
- Implementar reorder de slides.
- Implementar reorder de bloques.
- Implementar split de slide por bloques, celdas, Markdown/output o código/output.
- Implementar merge de slides consecutivas.
- Implementar movimiento de bloque a apéndice.
- Recalcular layout sugerido después de operaciones estructurales.
- Persistir cambios en transacciones.

### Prerrequisitos
- T-10 completo.
- T-12 completo.
- T-09 con IDs estables.

### Consideraciones técnicas
- Split y merge redistribuyen referencias; no duplican blobs.
- Las operaciones deben conservar trazabilidad hacia celdas y outputs fuente.
- El usuario debe poder deshacer al menos en memoria durante la sesión.

### Riesgos
- Reordenar sin transacción puede dejar slides y bloques inconsistentes.
- Duplicar assets durante split/merge inflará storage y NBXP.

### Recomendaciones
- Crear funciones puras para calcular nuevo orden antes de persistir.
- Validar que no queden slides sin orden o bloques huérfanos.

---

## Entregable T-15: Modo presentación web

### Desbloquea
- HU-10, HU-20.

### Objetivos técnicos
- Crear ruta de presentación fullscreen.
- Cargar deck desde backend como modelo read-only.
- Implementar navegación por teclado.
- Implementar progreso y salida al editor.
- Soportar speaker notes si existen.
- Implementar lazy rendering de slides fuera de viewport.
- Reutilizar render layer y resolución de visibilidad.

### Prerrequisitos
- T-11 completo.
- T-13 completo.
- T-10 para lectura de deck.

### Consideraciones técnicas
- HTML es el formato canónico; este modo define la calidad visual base.
- No debe existir otro modelo especial para presentación.
- La presentación debe tolerar outputs no soportados con placeholders claros.

### Riesgos
- Renderizar todo el deck de una vez puede romper performance.
- Inconsistencias entre editor y presentación destruirán confianza.

### Recomendaciones
- Crear pruebas E2E para navegación básica.
- Medir decks medianos y grandes antes de optimizar de más.

---

## Entregable T-16: Infraestructura de workers y export jobs

### Desbloquea
- HU-11, HU-12, HU-13, HU-14, HU-19, HU-20.

### Objetivos técnicos
- Crear tabla y API de `export_jobs`.
- Configurar BullMQ y Redis.
- Crear worker separado para jobs pesados.
- Definir estados: `queued`, `running`, `completed`, `failed`, `expired`.
- Persistir configuración, errores y `result_asset_id`.
- Crear polling desde frontend para estado de export.

### Prerrequisitos
- T-03 completo.
- T-04 completo.
- T-10 API base.

### Consideraciones técnicas
- El MVP puede ejecutar algunos exports de forma síncrona, pero el modelo debe ser de job.
- PDF y PPTX deben moverse a worker en cuanto haya notebooks reales medianos.
- Los errores deben ser visibles para usuario y útiles para debugging.

### Riesgos
- Exportar PDF/PPTX dentro del request web puede causar timeouts.
- No guardar errores de export hará imposible mejorar compatibilidad.

### Recomendaciones
- Diseñar jobs idempotentes cuando sea posible.
- Guardar logs estructurados por `export_job_id`.

---

## Entregable T-17: Export HTML standalone

### Desbloquea
- HU-11, HU-20.

### Objetivos técnicos
- Generar HTML exportable desde el `Presentation Model`.
- Empaquetar CSS, JS mínimo y assets necesarios.
- Soportar archivo `.html` cuando el deck sea autocontenible.
- Soportar `.zip` cuando haya assets múltiples o HTML complejo.
- Registrar resultado en `export_jobs` y `assets`.

### Prerrequisitos
- T-11 completo.
- T-15 suficientemente estable.
- T-16 completo.

### Consideraciones técnicas
- HTML debe conservar interactividad básica: navegación, código colapsable, tablas con scroll y speaker notes si aplica.
- Outputs con dependencias externas deben advertirse o incluir fallback.

### Riesgos
- Assets externos no empaquetados romperán portabilidad.
- HTML demasiado pesado puede ser incómodo de compartir.

### Recomendaciones
- Generar manifest de assets incluidos.
- Mantener una opción clara entre HTML simple y ZIP.

---

## Entregable T-18: Export PDF

### Desbloquea
- HU-12, HU-20.

### Objetivos técnicos
- Crear CSS print específico.
- Renderizar deck con Playwright/Chromium.
- Convertir cada slide en página PDF.
- Aplicar fallback visual a HTML complejo cuando corresponda.
- Registrar PDF como asset resultante.
- Guardar errores de render por job.

### Prerrequisitos
- T-15 completo.
- T-16 completo.
- T-11 con fallbacks.

### Consideraciones técnicas
- PDF es snapshot. No conserva interactividad.
- El render print debe probarse con tablas, imágenes, código, logs colapsados y slides densas.

### Riesgos
- CSS screen y CSS print pueden divergir demasiado.
- Playwright en serverless puede ser frágil si no se controla el runtime.

### Recomendaciones
- Ejecutar PDF en worker/container separado.
- Crear smoke tests con notebooks reales.
- Mantener degradación honesta para outputs complejos.

---

## Entregable T-19: Export PPTX inicial

### Desbloquea
- HU-13.

### Objetivos técnicos
- Convertir slides a objetos PPTX con PptxGenJS.
- Convertir texto a cajas editables.
- Convertir imágenes a imágenes.
- Convertir tablas simples a tablas PPTX.
- Convertir código a cajas monoespaciadas.
- Convertir HTML complejo a imagen.
- Registrar PPTX como asset resultante.

### Prerrequisitos
- T-11 completo.
- T-16 completo.
- T-18 o capacidad de screenshot/fallback visual disponible.

### Consideraciones técnicas
- PPTX será útil, no perfecto.
- No debe prometer paridad total con HTML.
- La estrategia debe ser por tipo de bloque, no por screenshot completo de todo el deck salvo fallback.

### Riesgos
- Intentar reconstruir toda la fidelidad HTML en PPTX puede consumir demasiado tiempo.
- Exportar todo como imagen produce un PPTX poco editable.

### Recomendaciones
- Priorizar texto, imágenes, tablas y código.
- Usar imagen solo para outputs complejos.
- Mostrar limitaciones antes de exportar.

---

## Entregable T-20: NBXP serializer

### Desbloquea
- HU-14, HU-20.

### Objetivos técnicos
- Serializar `Presentation Model` a `presentation.xml`.
- Generar `manifest.xml` con partes, media types, hashes y versión.
- Generar `theme.xml`.
- Empaquetar assets referenciados.
- Incluir `source/original.ipynb` solo si el usuario lo activa.
- Crear paquete `.nbxp` como ZIP.
- Registrar NBXP como asset y export job.

### Prerrequisitos
- T-09 completo.
- T-04 completo.
- T-16 completo.

### Consideraciones técnicas
- NBXP no es un XML plano. Es un paquete ZIP con XML y assets.
- XML no debe contener blobs pesados si pueden ser assets internos.
- Todo paquete debe declarar versión.

### Riesgos
- Guardar imágenes en Base64 dentro de XML generará archivos pesados y difíciles de validar.
- No versionar NBXP desde el inicio hará dolorosas las migraciones.

### Recomendaciones
- Crear schemas internos para `presentation.xml`, `theme.xml` y `manifest.xml`.
- Verificar checksums al generar paquete.

---

## Entregable T-21: NBXP importer, validator y migraciones

### Desbloquea
- HU-15.

### Objetivos técnicos
- Detectar `.nbxp` en upload.
- Validar ZIP y estructura interna.
- Leer `manifest.xml`.
- Validar versión de paquete.
- Leer `presentation.xml` y `theme.xml`.
- Reconstruir `Presentation Model`.
- Rehidratar assets internos.
- Mostrar placeholders si faltan assets no críticos.
- Preparar mecanismo de migración `1.0 -> 1.1` cuando sea necesario.

### Prerrequisitos
- T-20 completo.
- T-02 schemas de NBXP.
- T-04 storage.

### Consideraciones técnicas
- NBXP importado no debe tratarse como confiable. Debe validarse como entrada externa.
- Abrir NBXP debe ser más rápido que reprocesar `.ipynb`.
- Los paquetes corruptos deben rechazarse con errores específicos.

### Riesgos
- Importar XML sin validar puede abrir errores o riesgos de seguridad.
- No soportar migraciones romperá proyectos antiguos.

### Recomendaciones
- Mantener importador tolerante con assets no críticos y estricto con XML central.
- Guardar `nbxp_package_version` al importar.

---

## Entregable T-22: IA asistida con guardrails

### Desbloquea
- HU-16.

### Objetivos técnicos
- Crear servicio AI para acciones por slide.
- Definir acciones: generar título, mejorar título, resumir slide, generar speaker notes, sugerir visibilidad y proponer conclusión.
- Preparar contexto limitado: texto, metadata, representación textual de outputs y restricciones.
- Guardar sugerencias en `ai_suggestions`.
- Permitir estados `pending`, `accepted`, `edited`, `rejected`.
- Aplicar cambios solo tras confirmación del usuario.

### Prerrequisitos
- T-09 completo.
- T-10 completo.
- T-13 completo.
- T-03 con tabla `ai_suggestions`.

### Consideraciones técnicas
- La IA no modifica métricas, tablas, gráficos ni outputs originales.
- El prompt debe enfatizar que no puede inventar resultados.
- El backend debe separar sugerencia de aplicación del cambio.

### Riesgos
- Una conclusión inventada puede destruir la confianza del producto.
- Enviar notebooks completos al modelo puede aumentar costo y exposición de datos.

### Recomendaciones
- Enviar contexto mínimo por slide.
- Guardar input resumido y output para auditoría, cuidando privacidad.
- Crear UI de diff o preview antes de aplicar sugerencias.

---

## Entregable T-23: Autenticación, ownership y dashboard de proyectos

### Desbloquea
- HU-17, HU-18.

### Objetivos técnicos
- Activar autenticación real.
- Asociar `projects`, `source_notebooks`, `presentations`, `assets` y `export_jobs` a usuarios.
- Crear middleware de autorización.
- Crear dashboard de proyectos.
- Implementar permisos mínimos para lectura/escritura.
- Migrar usuario local simulado a usuario real cuando aplique.

### Prerrequisitos
- T-03 con `users` y relaciones.
- T-05 funcionando con usuario simulado o real.
- Core de editor/export suficientemente maduro.

### Consideraciones técnicas
- Auth no debe bloquear el prototipo inicial si el core aún no está validado.
- En cuanto haya proyectos persistidos reales, ownership deja de ser opcional.
- Todas las consultas deben filtrar por usuario o permiso.

### Riesgos
- Meter auth demasiado pronto puede ralentizar validación del core.
- Meter auth demasiado tarde puede requerir reescritura de queries.

### Recomendaciones
- Diseñar desde T-03 con `user_id`, aunque el primer usuario sea simulado.
- Centralizar autorización en helpers y no dispersarla en componentes.

---

## Entregable T-24: Sharing read-only y permisos de deck

### Desbloquea
- HU-18.

### Objetivos técnicos
- Crear entidad `share_links`.
- Implementar tokens seguros con hash persistido.
- Definir permisos: `view_only`, `duplicate`, `download_enabled`.
- Crear vista pública read-only del deck.
- Permitir revocar links.
- Aplicar sanitización y CSP en decks compartidos.

### Prerrequisitos
- T-15 modo presentación.
- T-23 auth y ownership.
- T-11 seguridad de render HTML.

### Consideraciones técnicas
- Compartir no significa colaboración en tiempo real.
- El receptor no debe poder acceder a proyectos privados sin permiso.
- Los exports descargables deben respetar `download_enabled`.

### Riesgos
- HTML inseguro compartido puede exponer contenido peligroso.
- Tokens predecibles comprometen privacidad.

### Recomendaciones
- Guardar solo hash del token.
- Permitir expiración opcional.
- No activar edición compartida en esta etapa.

---

## Entregable T-25: Observabilidad, métricas de calidad y errores trazables

### Desbloquea
- HU-19, HU-20.

### Objetivos técnicos
- Implementar logging estructurado con `project_id`, `source_notebook_id`, `presentation_id`, `export_job_id` cuando aplique.
- Medir tiempo upload→deck.
- Medir notebooks válidos, inválidos y fallidos.
- Medir MIME types no soportados.
- Medir slides `too_dense`.
- Medir errores de export por formato.
- Medir uso de IA y aceptación/rechazo de sugerencias.
- Crear eventos internos mínimos sin invadir privacidad.

### Prerrequisitos
- T-05 a T-16 parcialmente completos.
- Definición de eventos mínimos.

### Consideraciones técnicas
- Las métricas deben responder si el producto reduce trabajo real.
- No se deben registrar notebooks completos ni outputs sensibles en logs.
- Observabilidad no es analítica de vanidad.

### Riesgos
- Sin métricas, se decidirá por intuición.
- Con métricas mal elegidas, se optimizará lo irrelevante.

### Recomendaciones
- Priorizar métricas del flujo principal: upload, validación, generación, curación y export.
- Usar logs técnicos para debugging y métricas agregadas para producto.

---

## Entregable T-26: Hardening de MVP y primera versión vendible

### Desbloquea
- HU-20.

### Objetivos técnicos
- Ejecutar pruebas con notebooks reales de Markdown, pandas, Matplotlib, stdout, stderr, imágenes y HTML básico.
- Corregir fallos críticos de parser, render, editor y export.
- Definir límites iniciales de tamaño de archivo, número de celdas, número de outputs y tamaño de assets.
- Crear suite de smoke tests end-to-end: upload, generar deck, curar, presentar, exportar HTML/PDF.
- Revisar mensajes de error visibles al usuario.
- Revisar seguridad de HTML, SVG y assets.
- Documentar limitaciones explícitas del MVP.

### Prerrequisitos
- T-01 a T-18 completos para MVP HTML/PDF.
- T-20/T-21 si NBXP entra en la primera versión vendible.
- T-19 si PPTX entra en el alcance vendible inicial.

### Consideraciones técnicas
- La primera versión vendible no necesita resolver todo Jupyter.
- Sí debe resolver de forma sólida notebooks ejecutados con Markdown, pandas, Matplotlib, stdout/stderr e imágenes.
- No se deben agregar features nuevas mientras el flujo básico siga inestable.

### Riesgos
- Agregar IA, sharing o PPTX antes de cerrar import→deck→curación→presentación→HTML/PDF puede esconder problemas de core.
- Tests con notebooks artificiales no revelarán problemas reales de compatibilidad.

### Recomendaciones
- Validar con una colección pequeña pero real de notebooks.
- Mantener una lista pública de limitaciones honestas.
- Congelar alcance antes de pulir la versión vendible.

---

## Dependencias principales

```txt
T-01 Base del proyecto
  -> T-02 Contratos de dominio
  -> T-03 Base de datos
  -> T-04 Storage
  -> T-05 Upload
  -> T-06 Validación
  -> T-07 Parser/normalizador
  -> T-08 Clasificador de ruido
  -> T-09 Presentation Model/planner
  -> T-10 API editor
  -> T-11 Render layer
  -> T-12 Editor visual
  -> T-13 Visibilidad/temas/modos
  -> T-14 Split/Merge
  -> T-15 Presentación web
  -> T-16 Export jobs/workers
  -> T-17 HTML export
  -> T-18 PDF export
  -> T-20 NBXP serializer
  -> T-21 NBXP importer
  -> T-26 MVP vendible
```

```txt
Ramas paralelas después del core:

T-19 PPTX inicial
  depende de T-11, T-16 y fallbacks visuales

T-22 IA asistida
  depende de T-09, T-10 y T-13

T-23 Auth/ownership
  puede prepararse desde T-03, pero activarse cuando el core sea estable

T-24 Sharing
  depende de T-15, T-23 y T-11

T-25 Observabilidad
  empieza temprano, pero se vuelve completa cuando existan upload, generación y exports
```

---

## Secuencia mínima para construir sin perder foco

1. Cerrar base técnica: T-01, T-02, T-03, T-04.
2. Cerrar importación real: T-05, T-06, T-07.
3. Cerrar inteligencia determinista: T-08, T-09.
4. Cerrar editor usable: T-10, T-11, T-12, T-13, T-14.
5. Cerrar presentación y exportes vendibles: T-15, T-16, T-17, T-18.
6. Decidir si NBXP entra en MVP vendible: T-20, T-21.
7. Agregar PPTX, IA, auth y sharing solo cuando el core ya genere decks buenos.

---

## Regla final de ejecución

No se debe construir una funcionalidad visible si su base técnica no existe. Un botón de export sin `export_jobs`, un editor sin persistencia, un render HTML sin sanitización, una IA sin auditoría o un NBXP sin manifest son atajos falsos. Tumbfolio gana por confiabilidad del pipeline, no por acumular pantallas.
