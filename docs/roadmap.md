# Tumbfolio — Roadmap sin fechas

## Criterio de redacción

Este roadmap usa historias de usuario solo cuando el actor representa a un usuario real del producto: data scientist, profesor, investigador, usuario autenticado o receptor de un deck compartido. Las tareas internas de backend, infraestructura, workers, base de datos, storage, exportadores y observabilidad aparecen como objetivos técnicos dentro de entregables orientados a valor de usuario; no se disfrazan como historias de usuario.

El roadmap mantiene la decisión central de Tumbfolio: el sistema no ejecutará notebooks en el MVP. Leerá notebooks `.ipynb` ya ejecutados, los transformará en un `Presentation Model` propio, permitirá curar el deck y exportará HTML, PDF, PPTX y NBXP como derivados del modelo.

---

## Entregable 1 (USER HISTORY): Como usuario, quiero crear un proyecto subiendo un notebook ejecutado para iniciar la conversión a presentación

### Objetivos
- Crear una vista de upload para archivos `.ipynb`.
- Permitir drag and drop y selección manual de archivo.
- Validar extensión, tamaño máximo y tipo de archivo antes de procesar.
- Mostrar al usuario requisitos claros: notebook ya ejecutado, formatos soportados y límites iniciales.
- Crear en backend un registro `project` y `source_notebook` por archivo aceptado.
- Guardar el archivo original en storage S3-compatible usando una clave estable.
- Calcular y persistir `sha256`, `file_size_bytes`, `original_filename` y `storage_key`.

### Consideraciones
- El usuario no debe ver errores técnicos crudos. Debe entender si el archivo es inválido, demasiado grande, corrupto o no soportado.
- El backend debe separar recepción de archivo, persistencia del archivo y validación del notebook. Mezclar todo en una sola función hará difícil depurar fallos.

### Riesgos
- Aceptar archivos sin validar tamaño y estructura abrirá problemas de performance y seguridad.
- Guardar archivos sin hash impedirá detectar duplicados, reprocesamientos y corrupción.

### Recomendaciones
- Implementar upload mediante URL firmada o endpoint streaming, no cargando archivos grandes en memoria innecesariamente.
- Definir desde el inicio estados de notebook: `uploaded`, `validating`, `valid`, `invalid`, `processing`, `processed`, `failed`.

---

## Entregable 2 (USER HISTORY): Como usuario, quiero saber si mi notebook puede convertirse correctamente para decidir si genero el deck

### Objetivos
- Validar JSON y estructura `nbformat`.
- Detectar si el notebook tiene celdas, outputs y metadata útil.
- Contar celdas por tipo: Markdown, code, raw y unknown.
- Contar outputs por tipo: `execute_result`, `display_data`, `stream`, `error`.
- Detectar MIME types presentes.
- Mostrar un resumen antes de generar el deck: celdas, outputs, MIME types, warnings y outputs no soportados.
- Persistir en backend `validation_status`, `validation_errors`, `validation_warnings`, `cell_count`, `output_count` y `detected_mime_types`.

### Consideraciones
- Un notebook sin outputs no debe romper la app. Debe generar una advertencia y permitir un deck parcial si tiene Markdown útil.
- Un notebook inválido debe rechazarse con un mensaje específico, no con un error genérico.

### Riesgos
- Si el usuario no entiende qué falló, asumirá que la app es frágil.
- Si no se guardan warnings, será imposible analizar patrones reales de notebooks problemáticos.

### Recomendaciones
- Crear reason codes internos como `INVALID_JSON`, `EMPTY_NOTEBOOK`, `NO_OUTPUTS`, `UNSUPPORTED_NBFORMAT`, `FILE_TOO_LARGE`.
- Exponer mensajes de usuario distintos de mensajes técnicos internos.

---

## Entregable 3 (USER HISTORY): Como usuario, quiero que Tumbfolio lea el contenido real de mi notebook para identificar qué puede mostrarse en una presentación

### Objetivos
- Parsear celdas Markdown, code y raw.
- Normalizar fuente de celdas en una estructura uniforme.
- Parsear outputs `execute_result`, `display_data`, `stream` y `error`.
- Detectar y priorizar MIME types por output.
- Persistir `notebook_cells` con orden, tipo, fuente normalizada, metadata y clasificación inicial.
- Persistir `notebook_outputs` con índice, tipo, MIME principal, metadata, prioridad y estrategia de render inicial.
- Crear contratos TypeScript y schemas Zod para `NotebookCell`, `NormalizedOutput` y `NotebookAnalysisSummary`.

### Consideraciones
- El parser no ejecuta código. Solo lee lo que ya existe en el `.ipynb`.
- El backend debe conservar trazabilidad entre celda fuente, output y futuro bloque de slide.

### Riesgos
- Tratar todos los outputs como texto destruye valor visual.
- Asumir que todo `text/html` es seguro crea una superficie de ataque real.

### Recomendaciones
- Construir fixtures con notebooks reales: Markdown, pandas, Matplotlib, SVG, stdout, stderr, errores y HTML básico.
- Mantener el parser determinista: el mismo notebook debe producir el mismo análisis.

---

## Entregable 4 (USER HISTORY): Como usuario, quiero obtener una presentación inicial automáticamente para ahorrar trabajo manual

### Objetivos
- Detectar secciones desde encabezados Markdown.
- Clasificar celdas como narrativa, setup, análisis, visualización, tabla, figura, log, error o ruido.
- Detectar ruido común: imports, instalación de paquetes, warnings repetitivos, prints de debugging y outputs excesivos.
- Crear el primer `Presentation Model`.
- Generar `presentation`, `slides` y `slide_blocks`.
- Asignar layouts iniciales: title, section, content, code-output, output-focus, figure-focus, table-focus, comparison y appendix.
- Aplicar tema inicial `Colab Clean`.
- Guardar referencias desde `slide_blocks` hacia `notebook_cells`, `notebook_outputs` y `assets`.

### Consideraciones
- La generación automática no debe usar la regla ingenua “una celda = una slide”. Eso produciría decks malos con notebooks reales.
- El sistema debe ocultar ruido por defecto, no eliminarlo.

### Riesgos
- Un auto-layout mediocre hará que el producto parezca inútil aunque el parser funcione.
- Perder trazabilidad entre slide y celda dañará exportación, NBXP, IA y debugging.

### Recomendaciones
- Empezar con heurísticas conservadoras y fáciles de inspeccionar.
- Marcar slides problemáticas con estados como `too_dense`, `has_unsupported_output`, `has_hidden_logs` y `needs_review`.

---

## Entregable 5 (USER HISTORY): Como usuario, quiero revisar el deck generado en un editor visual para decidir qué debo ajustar

### Objetivos
- Crear editor con sidebar de slides, preview central y panel de propiedades.
- Permitir navegación entre slides.
- Mostrar en el panel derecho: título, layout, bloques, celdas fuente, visibilidad y warnings.
- Mostrar badges para slides densas, outputs no soportados, logs ocultos y contenido largo.
- Implementar backend API para consultar `presentation`, `slides`, `slide_blocks`, `assets` y metadata relacionada.
- Implementar autosave o guardado explícito de cambios básicos.

### Consideraciones
- El editor trabaja sobre la presentación, no sobre el notebook original.
- El preview debe usar el mismo modelo que el modo presentación y los exportadores.

### Riesgos
- Construir edición libre tipo PowerPoint desde el inicio creará una superficie enorme y poco diferenciada.
- Si el editor tiene otro modelo distinto al renderer, aparecerán inconsistencias difíciles de corregir.

### Recomendaciones
- Mantener controles cerrados: layout, visibilidad, tema, orden, split, merge y export.
- Usar estado local para interacción rápida, pero persistir cambios relevantes en backend.

---

## Entregable 6 (USER HISTORY): Como usuario, quiero ver Markdown, código, tablas, imágenes y logs correctamente renderizados para confiar en el deck generado

### Objetivos
- Implementar `MarkdownRenderer`.
- Implementar `CodeRenderer` con syntax highlighting.
- Implementar `PlainTextRenderer`.
- Implementar `ImageRenderer` para PNG/JPEG.
- Implementar `SvgRenderer` con validación y manejo seguro.
- Implementar `LatexRenderer`.
- Implementar `DataFrameRenderer` para HTML de pandas.
- Implementar `StreamRenderer` para stdout/stderr.
- Implementar `ErrorRenderer`.
- Crear una capa `MimeRenderer` con `canRender`, `render`, `exportToImage` y `exportToPptx` cuando aplique.
- Guardar assets extraídos o derivados en storage y registrarlos en `assets`.

### Consideraciones
- `text/html` debe sanitizarse o aislarse en iframe sandbox.
- Outputs largos deben colapsarse sin perder acceso al contenido.

### Riesgos
- Un mal renderer destruye el valor del producto más rápido que una mala pantalla de marketing.
- Sanitizar mal HTML puede permitir scripts o contenido peligroso.

### Recomendaciones
- Priorizar MVP nivel 1: Markdown, LaTeX, código, text/plain, stdout, stderr, PNG, JPEG, SVG, HTML básico y DataFrame HTML.
- Mostrar placeholders honestos para MIME types no soportados.

---

## Entregable 7 (USER HISTORY): Como usuario, quiero ocultar código, logs y outputs innecesarios para limpiar mi presentación sin perder trazabilidad

### Objetivos
- Permitir mostrar/ocultar código por slide y por bloque.
- Permitir mostrar/ocultar output por slide y por bloque.
- Permitir colapsar código y logs.
- Permitir excluir bloques de exportación.
- Crear presets globales: solo outputs, mostrar código relevante, modo docente, modo ejecutivo y modo investigador.
- Persistir configuración de visibilidad en backend como overrides sobre `slide_blocks` o tabla de visibilidad.

### Consideraciones
- La visibilidad no debe borrar celdas ni outputs fuente.
- Los presets globales deben poder ser ajustados manualmente por el usuario.

### Riesgos
- Si ocultar código rompe la relación con el contenido fuente, el producto pierde credibilidad técnica.
- Si la visibilidad solo vive en frontend, el export no reproducirá correctamente el deck curado.

### Recomendaciones
- Guardar overrides de visibilidad sin modificar `notebook_cells` ni `notebook_outputs`.
- Mantener `include_in_export` separado de `visible_in_editor` si la UX lo requiere.

---

## Entregable 8 (USER HISTORY): Como usuario, quiero dividir y fusionar slides para corregir la estructura automática sin rehacer el deck

### Objetivos
- Detectar slides densas por número de bloques, altura estimada o contenido largo.
- Permitir split por celdas, por bloques, por Markdown/output o por código/output.
- Permitir mover logs a apéndice.
- Permitir merge de slides consecutivas.
- Recalcular layout sugerido después de merge.
- Persistir cambios de orden y pertenencia de `slide_blocks` en backend.
- Mantener IDs estables y referencias fuente.

### Consideraciones
- Split y merge redistribuyen bloques. No crean verdad nueva.
- Mover bloques debe ser barato: mover referencias, no duplicar blobs.

### Riesgos
- Duplicar assets al dividir/fusionar slides generará paquetes pesados e inconsistentes.
- Recalcular layout sin límites puede producir resultados impredecibles.

### Recomendaciones
- Registrar operaciones relevantes en `activity_events` solo cuando aporte debugging o auditoría.
- Mantener una operación reversible al menos a nivel de frontend durante la sesión.

---

## Entregable 9 (USER HISTORY): Como usuario, quiero aplicar temas y modos para adaptar el mismo notebook a una audiencia ejecutiva, docente o investigadora

### Objetivos
- Implementar tema `Colab Clean`.
- Implementar tema `Academic Paper`.
- Implementar tema `Executive Data`.
- Implementar modo Ejecutivo: menos código, outputs y conclusiones más visibles.
- Implementar modo Docente: código relevante visible y explicación paso a paso.
- Implementar modo Investigador: detalle técnico accesible, tablas, métricas y metodología.
- Persistir `theme_id`, `mode` y overrides de visibilidad por presentación.
- Exponer backend API para cambiar tema y modo sin regenerar todo el notebook.

### Consideraciones
- Los temas son tokens visuales y decisiones de layout, no CSS libre.
- Los modos son presets reversibles, no transformaciones destructivas.

### Riesgos
- Demasiada personalización diluye el criterio visual.
- Si los modos reescriben contenido, se vuelven peligrosos para precisión técnica.

### Recomendaciones
- No permitir CSS libre en el MVP.
- Mantener un número limitado de layouts iniciales.

---

## Entregable 10 (USER HISTORY): Como usuario, quiero presentar directamente desde la web para no depender siempre de exportar archivos

### Objetivos
- Crear modo fullscreen.
- Permitir navegación por teclado.
- Mostrar indicador de progreso.
- Soportar código colapsable.
- Soportar tablas con scroll.
- Soportar speaker notes si existen.
- Cargar el deck desde backend usando `presentation`, `slides`, `slide_blocks`, `assets` y `themes`.
- Aplicar lazy rendering para slides fuera de viewport.

### Consideraciones
- HTML será el formato canónico.
- PDF y PPTX serán derivados del Presentation Model y del render web, no modelos independientes.

### Riesgos
- Si el modo presentación se ve mal, los exportes también nacerán mal.
- Renderizar todo el deck de golpe puede degradar performance con notebooks grandes.

### Recomendaciones
- Medir notebooks medianos y grandes desde este entregable.
- Usar el mismo renderer del editor para evitar divergencias visuales.

---

## Entregable 11 (USER HISTORY): Como usuario, quiero exportar mi presentación a HTML para compartir una versión portable e interactiva

### Objetivos
- Crear export HTML standalone.
- Empaquetar CSS, JS y assets necesarios.
- Soportar `.html` simple cuando no haya assets complejos.
- Soportar `.zip` cuando existan assets múltiples o dependencias locales.
- Crear `export_job` tipo `html` o `html_zip`.
- Ejecutar el export desde backend y guardar el resultado como `asset`.
- Registrar estado, errores y configuración del export.

### Consideraciones
- HTML conserva mejor la experiencia interactiva que PDF o PPTX.
- Outputs interactivos complejos pueden requerir degradación o paquete ZIP.

### Riesgos
- Referenciar assets externos sin control romperá portabilidad.
- Incluir HTML inseguro en un export compartible aumenta el riesgo de seguridad.

### Recomendaciones
- Copiar assets al paquete exportado.
- Aplicar sanitización, sandbox y CSP también al export.

---

## Entregable 12 (USER HISTORY): Como usuario, quiero exportar mi presentación a PDF para entregar o archivar una versión fija

### Objetivos
- Crear vista print del deck.
- Generar PDF con Playwright/Chromium.
- Convertir cada slide en página.
- Crear `export_job` tipo `pdf`.
- Ejecutar PDF en worker o proceso backend aislable.
- Guardar PDF resultante como `asset`.
- Registrar errores de render, timeout y fallback.

### Consideraciones
- PDF será snapshot. No conservará interactividad.
- La configuración de export debe incluir tema, apéndice, notas e inclusión de código si aplica.

### Riesgos
- Diferencias entre CSS screen y print pueden producir PDFs rotos.
- HTML complejo puede requerir screenshot o fallback a imagen.

### Recomendaciones
- Crear CSS print desde temprano, no como parche final.
- Añadir smoke tests con notebooks reales.

---

## Entregable 13 (USER HISTORY): Como usuario, quiero exportar mi presentación a PPTX para poder editarla fuera de Tumbfolio

### Objetivos
- Convertir texto a cajas editables.
- Convertir imágenes a imágenes PPTX.
- Convertir tablas simples a tablas PPTX.
- Convertir código a bloques monoespaciados.
- Convertir HTML complejo a imagen cuando no sea reconstruible.
- Crear `export_job` tipo `pptx`.
- Ejecutar PPTX desde backend/worker.
- Guardar `.pptx` resultante como `asset`.

### Consideraciones
- PPTX será útil, no perfecto.
- La paridad total con HTML no será una promesa del producto.

### Riesgos
- Intentar equivalencia perfecta con HTML consumirá semanas sin retorno proporcional.
- Generar PPTX desde el notebook crudo rompería la arquitectura; debe salir del Presentation Model.

### Recomendaciones
- Declarar limitaciones visuales explícitamente en la UI.
- Priorizar gráficos, tablas y texto sobre interactividad.

---

## Entregable 14 (USER HISTORY): Como usuario, quiero guardar mi proyecto como NBXP para reabrir una presentación curada sin reprocesar el notebook

### Objetivos
- Serializar el `Presentation Model` a `presentation.xml`.
- Generar `manifest.xml`.
- Generar `theme.xml`.
- Empaquetar assets derivados.
- Incluir notebook original solo si el usuario activa esa opción.
- Generar archivo `.nbxp` como ZIP con XML y assets.
- Crear `export_job` tipo `nbxp` o entidad equivalente.
- Guardar el paquete NBXP como `asset`.

### Consideraciones
- NBXP será formato de trabajo editable, no export final.
- NBXP será ZIP con XML y assets, no XML plano.

### Riesgos
- Meter blobs grandes dentro de XML hará archivos pesados y difíciles de validar.
- No versionar el formato desde el inicio complicará migraciones.

### Recomendaciones
- Guardar hashes y media types por asset.
- Declarar `packageVersion` en el manifest.

---

## Entregable 15 (USER HISTORY): Como usuario, quiero abrir un archivo NBXP para continuar trabajando donde lo dejé

### Objetivos
- Detectar archivos `.nbxp` en upload.
- Validar estructura ZIP.
- Leer `manifest.xml`.
- Leer `presentation.xml`.
- Leer `theme.xml` y assets internos.
- Validar versión del paquete.
- Reconstruir el `Presentation Model`.
- Crear o actualizar registros backend: `project`, `presentation`, `slides`, `slide_blocks` y `assets`.
- Mostrar placeholders si faltan assets no críticos.

### Consideraciones
- Abrir NBXP debe ser más rápido que reprocesar `.ipynb` porque el contenido ya viene curado.

### Riesgos
- Versiones incompatibles del formato pueden romper proyectos antiguos.
- Aceptar paquetes corruptos puede dejar proyectos incompletos.

### Recomendaciones
- Incluir migraciones explícitas por versión.
- Rechazar paquetes corruptos con mensajes claros.

---

## Entregable 16 (USER HISTORY): Como usuario, quiero usar IA para mejorar una slide sin que el sistema altere mis resultados reales

### Objetivos
- Crear acciones IA por slide: título, resumen, speaker notes, explicación docente, tono ejecutivo y sugerencia de visibilidad.
- Enviar a IA solo contexto limitado de la slide.
- Evitar envío innecesario del notebook completo.
- Guardar sugerencias en `ai_suggestions`.
- Permitir aceptar, editar o descartar sugerencias.
- Aplicar cambios aceptados al `Presentation Model`, no al notebook fuente.
- Registrar qué sugerencia fue aceptada o rechazada.

### Consideraciones
- La IA es asistente de curación, no fuente de verdad.
- La IA no debe modificar métricas, tablas, gráficos ni outputs originales sin confirmación explícita.

### Riesgos
- Si la IA inventa conclusiones, destruye la confianza del producto.
- Si los prompts incluyen más contexto del necesario, aumentan costo y riesgo de privacidad.

### Recomendaciones
- Separar visualmente sugerencia IA de contenido real del notebook.
- Guardar payloads auditables para poder explicar qué cambió.

---

## Entregable 17 (USER HISTORY): Como usuario, quiero guardar mis proyectos en una cuenta para no depender de archivos locales

### Objetivos
- Activar autenticación real.
- Asociar proyectos a usuarios.
- Crear dashboard de proyectos.
- Permitir abrir proyectos guardados.
- Permitir borrar o archivar proyectos.
- Proteger acceso backend a `projects`, `source_notebooks`, `presentations`, `assets` y `export_jobs`.
- Definir ownership y permisos mínimos.

### Consideraciones
- Este entregable no debe adelantarse si el editor, render y exportes siguen inmaduros.
- Para el prototipo puede existir usuario único o auth simulada, pero no para proyectos reales.

### Riesgos
- Meter auth demasiado temprano puede ralentizar validación del core.
- Meter auth demasiado tarde puede obligar a reescribir ownership y queries.

### Recomendaciones
- Diseñar la BD con `user_id` desde el inicio aunque la auth se active después.
- No construir roles avanzados todavía.

---

## Entregable 18 (USER HISTORY): Como receptor de una presentación, quiero abrir un deck compartido sin instalar nada ni recibir archivos pesados

### Objetivos
- Crear share links.
- Definir permisos `view_only`, `duplicate` y `download_enabled`.
- Servir deck en modo lectura.
- Permitir revocar links.
- Proteger assets compartidos mediante URLs firmadas, rutas públicas controladas o proxy backend.
- Aplicar CSP, sanitización y sandbox a decks compartidos.

### Consideraciones
- Sharing es post-MVP si el producto todavía no genera decks buenos.
- El receptor no debe necesitar cuenta para links públicos, salvo que el usuario dueño lo configure como privado.

### Riesgos
- Compartir decks con HTML inseguro puede exponer contenido peligroso.
- Links sin expiración o revocación crean riesgo de fuga de información.

### Recomendaciones
- No permitir edición colaborativa en esta etapa.
- Empezar con `view_only` y revocación antes de duplicación o permisos granulares.

---

## Entregable 19 (USER HISTORY): Como usuario, quiero recibir mensajes claros cuando algo falla para saber cómo corregir mi notebook o mi exportación

### Objetivos
- Mostrar errores específicos de upload, validación, análisis, render y export.
- Mostrar warnings de MIME no soportado, notebook sin outputs, HTML bloqueado o assets faltantes.
- Registrar errores backend con `error_code`, `error_message`, contexto mínimo y entidad afectada.
- Permitir reintentar export jobs fallidos.
- Permitir excluir bloques problemáticos del export.

### Consideraciones
- El deck nunca debe romperse silenciosamente.
- Un placeholder honesto es mejor que una slide vacía o una app rota.

### Riesgos
- Ocultar fallos de render hará que el usuario descubra problemas tarde, justo al presentar o exportar.
- Logs técnicos expuestos al usuario final generan ruido y desconfianza.

### Recomendaciones
- Separar mensajes internos de mensajes de usuario.
- Usar badges visibles en slides problemáticas.

---

## Entregable 20 (USER HISTORY): Como usuario final, quiero una primera versión vendible que convierta notebooks reales en presentaciones limpias y exportables

### Objetivos
- Soportar notebooks ejecutados con Markdown, pandas, Matplotlib, stdout/stderr, imágenes y tablas HTML.
- Generar un deck inicial usable.
- Permitir ocultar código.
- Permitir ajustar slides básicas.
- Permitir presentar desde web.
- Permitir exportar HTML.
- Permitir exportar PDF.
- Guardar backend mínimo: proyecto, notebook, celdas, outputs, presentation, slides, blocks, assets y export jobs.

### Consideraciones
- Esta versión no necesita resolver todo Jupyter.
- Esta versión debe resolver impecablemente el caso básico de data science.
- PPTX, IA avanzada, sharing y colaboración no deben distraer si el flujo central aún es mediocre.

### Riesgos
- Si el flujo básico queda mediocre, IA, PPTX o sharing no lo van a salvar.
- Si solo se prueba con notebooks de juguete, el producto fallará con notebooks reales.

### Recomendaciones
- Validar con notebooks reales y desordenados.
- No agregar features nuevas hasta que upload → deck → curación → presentación → export funcione con calidad consistente.

---

## Entregable 21 (USER HISTORY): Como usuario, quiero que mis exportaciones pesadas no bloqueen el editor para poder seguir trabajando mientras se generan archivos

### Objetivos
- Ejecutar exports PDF, PPTX, HTML ZIP y NBXP como `export_jobs`.
- Crear cola de jobs con Redis/BullMQ o mecanismo equivalente.
- Mostrar estado del job: `queued`, `running`, `completed`, `failed`, `expired`.
- Permitir polling desde frontend.
- Guardar resultado como `asset` cuando el job termina.
- Permitir descargar export completado desde storage.

### Consideraciones
- Aunque el MVP pueda ejecutar jobs de forma síncrona, la BD debe modelarlos como jobs desde el inicio.
- PDF y PPTX son candidatos naturales a worker separado.

### Riesgos
- Generar PDF/PPTX dentro del request principal causará timeouts y mala UX.
- No guardar configuración del export impedirá reproducir errores.

### Recomendaciones
- Separar proceso web y worker cuando el producto pase de prototipo a uso real.
- Persistir `config_json`, `started_at`, `completed_at`, `error_code` y `result_asset_id`.

---

## Entregable 22 (USER HISTORY): Como usuario, quiero que la app mantenga buen rendimiento con notebooks medianos o grandes para no abandonar el flujo durante la conversión

### Objetivos
- Procesar notebooks grandes sin bloquear la UI.
- Virtualizar sidebar de slides si hay muchas slides.
- Renderizar lazy contenido fuera de viewport.
- Comprimir imágenes derivadas cuando sea seguro.
- Limitar tamaño de outputs largos.
- Registrar tiempos de upload, análisis, generación, render y export.

### Consideraciones
- El rendimiento es parte de la propuesta de valor. Si convertir el notebook toma demasiado o congela la UI, el producto falla.

### Riesgos
- Renderizar todas las slides y outputs al mismo tiempo puede romper navegadores.
- Optimizar imágenes sin conservar calidad suficiente puede dañar gráficos importantes.

### Recomendaciones
- Definir límites claros de tamaño desde el MVP.
- Medir con notebooks reales, no solo con fixtures pequeños.
