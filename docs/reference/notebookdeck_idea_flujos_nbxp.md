# Tumbfolio — Idea completa y flujos del producto

## 1. Resumen ejecutivo

**Tumbfolio** es una app web para convertir notebooks `.ipynb` ya ejecutados en presentaciones profesionales, rápidas de curar y exportables.

La promesa central del producto es:

> Subo un notebook feo y en 30 segundos tengo una presentación elegante, editable y lista para mostrar.

El producto no compite directamente con Jupyter, Colab, Quarto, nbconvert o PowerPoint. Compite contra el dolor real de tomar notebooks desordenados, llenos de código, warnings, outputs largos y celdas experimentales, y convertirlos en una presentación clara para clase, investigación, comité, demo o informe ejecutivo.

El foco no está en ejecutar código. El foco está en **leer notebooks ejecutados**, entender su estructura, renderizar outputs con apariencia profesional tipo Colab y permitir reducir ruido visual mediante controles simples.

---

## 2. Problema

Los notebooks son excelentes para trabajar, experimentar y documentar análisis, pero suelen ser malos como presentación final.

Problemas típicos:

- Hay demasiado código visible.
- Los outputs importantes se mezclan con logs, warnings y pruebas.
- Las tablas pueden ser enormes.
- Los gráficos no siempre quedan bien encuadrados.
- Las celdas de Markdown no siempre tienen estructura narrativa.
- Exportar a PDF o PPTX suele romper diseño, interactividad o jerarquía visual.
- Preparar una presentación manual desde un notebook consume demasiado tiempo.
- Las herramientas existentes convierten, pero no curan visualmente con suficiente criterio.

El dolor principal:

> El notebook contiene valor, pero no está listo para ser presentado.

---

## 3. Usuarios objetivo

### 3.1 Data scientist

Necesita convertir análisis exploratorios, reportes de modelos, visualizaciones y resultados en presentaciones para stakeholders.

Le importa:

- Ocultar código innecesario.
- Mostrar outputs limpios.
- Resumir resultados.
- Exportar a HTML, PDF o PPTX.
- Mantener apariencia profesional.
- Evitar rehacer slides manualmente.

### 3.2 Profesor

Necesita convertir notebooks de clase en presentaciones didácticas.

Le importa:

- Mostrar código cuando sea pedagógico.
- Ocultar código cuando distraiga.
- Presentar outputs de manera ordenada.
- Navegar por secciones.
- Exportar material para estudiantes.
- Reutilizar notebooks ejecutados como clase visual.

### 3.3 Investigador

Necesita presentar experimentos, tablas, gráficos, métodos y resultados.

Le importa:

- Mantener precisión.
- Mostrar evidencia visual.
- Exportar PDF o HTML.
- Usar un tema sobrio.
- Reducir ruido técnico sin perder trazabilidad.

---

## 4. Propuesta de valor

Tumbfolio convierte notebooks ejecutados en decks profesionales mediante cuatro capacidades:

1. **Auto-generación**
   - Detecta secciones.
   - Agrupa celdas.
   - Propone slides.
   - Selecciona layouts.
   - Oculta ruido por defecto.

2. **Curación manual**
   - Reordenar slides.
   - Dividir y fusionar slides.
   - Cambiar layouts.
   - Controlar visibilidad por celda.
   - Elegir tema.

3. **Render tipo Colab**
   - Código legible.
   - Outputs claros.
   - Tablas limpias.
   - Gráficos bien encuadrados.
   - Markdown y LaTeX bien presentados.

4. **Exportación y formato propio**
   - HTML interactivo.
   - PDF.
   - PPTX.
   - HTML standalone.
   - Archivo editable propio `.nbxp` para guardar y reabrir presentaciones curadas.

---

## 5. Posicionamiento

### 5.1 Frase corta

> Notebooks feos. Presentaciones limpias.

### 5.2 Frase de producto

> Convierte notebooks `.ipynb` ejecutados en presentaciones profesionales, editables y exportables en segundos.

### 5.3 Diferenciador

No basta con convertir notebooks a slides. Eso ya existe parcialmente. El diferencial es:

- Curación visual automática.
- Control de ruido por celda.
- Render profesional de outputs.
- Editor slide-by-slide.
- Exportes pensados desde un modelo intermedio, no desde el notebook crudo.

---

## 6. Principios de producto

### 6.1 HTML es el formato canónico

La presentación interactiva en la página debe ser el formato principal.

PDF y PPTX son exportes derivados. No deben prometer paridad perfecta con HTML.

### 6.2 No ejecutar notebooks en el MVP

El usuario debe subir notebooks ya ejecutados.

Esto evita:

- Kernels.
- Sandboxing de ejecución.
- Dependencias de Python.
- Ambientes Conda.
- Costo de cómputo.
- Riesgos de seguridad por ejecución arbitraria.

### 6.3 El notebook no debe ser el modelo interno

El `.ipynb` se debe transformar a un modelo propio de presentación.

El flujo correcto:

```txt
.ipynb ejecutado
   ↓
Notebook Parser
   ↓
Cell + Output Normalizer
   ↓
Presentation Planner
   ↓
Presentation Model
   ↓
Editor + Renderer + Exporters
```

### 6.4 La IA ayuda, pero no renderiza

La IA puede:

- Titular slides.
- Resumir celdas.
- Generar speaker notes.
- Sugerir qué ocultar.
- Proponer narrativa.
- Convertir una celda técnica en explicación ejecutiva.

La IA no debe:

- Inventar resultados.
- Reemplazar outputs reales.
- Recalcular métricas.
- Ser la única fuente de estructura.
- Interpretar gráficos como verdad si el dato ya está en el notebook.

### 6.5 Menos personalización, más criterio

En vez de un editor infinito, se deben ofrecer pocos controles bien diseñados.

Tres temas buenos valen más que cincuenta temas mediocres.

---

## 7. Alcance del MVP

### 7.1 Incluido

- Upload de `.ipynb`.
- Validación básica del notebook.
- Lectura de celdas Markdown y código.
- Lectura de outputs ya presentes.
- Render de:
  - Markdown.
  - LaTeX.
  - Código.
  - `text/plain`.
  - `text/html` básico.
  - `image/png`.
  - `image/jpeg`.
  - `image/svg+xml`.
  - Tablas HTML.
  - Outputs tipo pandas DataFrame cuando estén disponibles como HTML.
  - `stdout`.
  - `stderr`.
- Generación automática de slides.
- Editor visual.
- Visibilidad por celda.
- Tres temas cerrados.
- Modo presentación HTML.
- Guardado y reapertura en formato `.nbxp`.
- Export HTML.
- Export PDF.
- Export PPTX inicial.

### 7.2 No incluido en el MVP

- Ejecutar notebooks.
- Editar código y reejecutar.
- Soporte completo de widgets interactivos.
- Soporte perfecto para Plotly/Bokeh/Altair.
- Colaboración en tiempo real.
- Versionado avanzado.
- Marketplace de plantillas.
- Edición libre estilo Figma.
- Importación directa desde Google Drive/Colab.
- Autenticación compleja si no es necesaria para el primer prototipo.

---

## 8. Outputs soportados por prioridad

### 8.1 Nivel 1 — MVP obligatorio

| Tipo de output | Soporte esperado |
|---|---|
| Markdown | Render completo con jerarquía visual |
| LaTeX | Render correcto en Markdown y outputs |
| Código | Syntax highlighting, colapsable |
| `text/plain` | Bloque de texto, colapsable si es largo |
| `stdout` | Bloque de salida, colapsable |
| `stderr` | Warning/error visual, oculto por defecto si es ruido |
| `image/png` | Imagen responsiva |
| `image/jpeg` | Imagen responsiva |
| `image/svg+xml` | Imagen vectorial segura |
| `text/html` básico | Sanitizado o aislado |
| pandas DataFrame HTML | Tabla profesional con scroll/control de tamaño |

### 8.2 Nivel 2 — Después del MVP

| Tipo de output | Soporte esperado |
|---|---|
| Plotly | Render interactivo si el bundle existe; fallback a imagen si no |
| Altair/Vega | Render interactivo o fallback |
| Bokeh | Render limitado |
| Geo/maps | Fallback estático o iframe controlado |
| Video/audio | Embed controlado |
| JSON | Viewer plegable |

### 8.3 Nivel 3 — Avanzado

| Tipo de output | Soporte esperado |
|---|---|
| ipywidgets | Probablemente no soportar al inicio |
| HTML arbitrario complejo | Iframe sandbox |
| Apps embebidas | Solo mediante iframe seguro |
| Outputs con dependencias externas | Advertencia + fallback |

---

## 9. Temas visuales

### 9.1 Colab Clean

Tema principal. Inspirado en notebooks modernos.

Características:

- Fondo claro.
- Tipografía limpia.
- Código con apariencia familiar.
- Outputs en cards suaves.
- Gráficos con buen espacio.
- Tablas con borde ligero.
- Ideal para clases, demos y análisis técnico.

### 9.2 Academic Paper

Tema sobrio para investigación y docencia formal.

Características:

- Jerarquía tipográfica más seria.
- Mejor tratamiento de ecuaciones.
- Buenas tablas.
- Figuras centradas.
- Menos decoración.
- Ideal para profesores, investigadores y papers.

### 9.3 Executive Data

Tema para stakeholders.

Características:

- Títulos grandes.
- Poco código visible por defecto.
- Gráficos protagonistas.
- Layouts tipo dashboard.
- Resúmenes automáticos destacados.
- Ideal para data science aplicado, negocio y comités.

---

## 10. Modelo conceptual

### 10.1 Presentation

```ts
type Presentation = {
  id: string;
  title: string;
  sourceNotebookName: string;
  theme: PresentationTheme;
  slides: Slide[];
  metadata: PresentationMetadata;
};
```

### 10.2 Slide

```ts
type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  layout: SlideLayout;
  blocks: SlideBlock[];
  speakerNotes?: string;
  sourceCellIds: string[];
  visibilityPreset: VisibilityPreset;
};
```

### 10.3 SlideBlock

```ts
type SlideBlock =
  | MarkdownBlock
  | CodeBlock
  | OutputBlock
  | ImageBlock
  | TableBlock
  | HtmlBlock
  | LatexBlock
  | LogBlock
  | AiSummaryBlock;
```

### 10.4 Visibility

```ts
type CellVisibility = {
  showCode: boolean;
  showOutput: boolean;
  showMarkdown: boolean;
  collapseCode: boolean;
  collapseLogs: boolean;
  renderOutputAsImage: boolean;
  includeInExport: boolean;
};
```

### 10.5 Output normalized

```ts
type NormalizedOutput = {
  id: string;
  sourceCellId: string;
  outputType: "execute_result" | "display_data" | "stream" | "error";
  mimeType?: string;
  data: unknown;
  metadata?: Record<string, unknown>;
  priority: number;
  isNoise: boolean;
  renderStrategy: RenderStrategy;
};
```

### 10.6 Formato propio: NBXP

Tumbfolio debe tener un formato propio de proyecto editable: `.nbxp`.

Nombre propuesto:

```txt
NBXP — Notebook XML Presentation
```

Función del formato:

```txt
.ipynb  = entrada fuente ejecutada
.nbxp   = proyecto editable de presentación
.html   = export interactivo
.pdf    = export fijo
.pptx   = export editable externo
```

Esto evita un error de diseño: usar `.ipynb` como formato de edición de slides. El notebook debe seguir siendo fuente. El `.nbxp` debe guardar la curaduría visual, los layouts, el tema, los assets derivados, las decisiones de visibilidad y las notas del presentador.

### 10.7 Decisión estructural: NBXP no debe ser un XML suelto

Aunque el nombre diga **Notebook XML Presentation**, el archivo `.nbxp` no debería ser un único XML plano.

La razón es simple: una presentación basada en notebooks necesita guardar imágenes, SVG, HTML aislado, thumbnails, posibles assets de outputs y metadatos de exportación. Meter todo eso como Base64 dentro de un XML gigante vuelve el archivo pesado, difícil de validar y desagradable de versionar.

La decisión correcta es:

```txt
.nbxp = paquete ZIP con XML central + assets
```

Inspiración conceptual:

```txt
PPTX/DOCX/XLSX no son XML sueltos.
Son paquetes ZIP con partes XML y recursos internos.
```

NBXP debería seguir esa lógica: un contenedor transportable con documentos XML internos y recursos organizados.

### 10.8 Estructura propuesta de un archivo `.nbxp`

```txt
my-presentation.nbxp
├── META-INF/
│   └── manifest.xml
├── presentation.xml
├── theme.xml
├── source/
│   └── original.ipynb              # opcional
├── assets/
│   ├── images/
│   │   ├── output-cell-12-0.png
│   │   └── output-cell-18-0.svg
│   ├── html/
│   │   └── output-cell-22-0.html
│   ├── tables/
│   │   └── dataframe-cell-15-0.xml
│   └── thumbnails/
│       └── slide-001.png
└── ai/
    └── speaker-notes.xml           # opcional
```

Archivos clave:

| Archivo | Función |
|---|---|
| `META-INF/manifest.xml` | Declara versión, partes internas, tipos de contenido, checksums y compatibilidad. |
| `presentation.xml` | Define slides, bloques, layouts, visibilidad, orden y referencias a celdas. |
| `theme.xml` | Guarda tema visual, tokens de diseño y presets. |
| `source/original.ipynb` | Opcional. Permite conservar el notebook original dentro del paquete. |
| `assets/images/` | Imágenes extraídas o derivadas de outputs. |
| `assets/html/` | Outputs HTML aislables mediante iframe/sandbox. |
| `assets/tables/` | Representaciones estructuradas de tablas si se normalizan. |
| `ai/speaker-notes.xml` | Notas generadas o editadas por IA. |

### 10.9 `presentation.xml` como fuente de verdad editable

Ejemplo conceptual:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<nbxp:presentation
  xmlns:nbxp="https://tumbfolio.dev/schema/nbxp/1.0"
  version="1.0"
  id="deck-001"
  title="Customer Churn Analysis"
  themeRef="theme.xml">

  <nbxp:sourceNotebook
    name="churn-analysis.ipynb"
    embedded="true"
    href="source/original.ipynb"
    sha256="..." />

  <nbxp:slides>
    <nbxp:slide id="slide-001" layout="figure-focus" title="Model performance overview">
      <nbxp:sourceCell ref="cell-18" />

      <nbxp:block id="blk-001" type="markdown">
        <nbxp:content format="markdown">## Model performance overview</nbxp:content>
      </nbxp:block>

      <nbxp:block id="blk-002" type="image" sourceCell="cell-18" outputIndex="0">
        <nbxp:asset href="assets/images/output-cell-18-0.png" mediaType="image/png" />
      </nbxp:block>

      <nbxp:visibility showCode="false" showOutput="true" collapseLogs="true" />
    </nbxp:slide>
  </nbxp:slides>
</nbxp:presentation>
```

Regla importante: `presentation.xml` no debe duplicar blobs pesados. Debe referenciar assets por URI interna.

### 10.10 `manifest.xml`

Ejemplo conceptual:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<nbxp:manifest xmlns:nbxp="https://tumbfolio.dev/schema/nbxp/1.0" packageVersion="1.0">
  <nbxp:part href="presentation.xml" mediaType="application/vnd.tumbfolio.presentation+xml" required="true" />
  <nbxp:part href="theme.xml" mediaType="application/vnd.tumbfolio.theme+xml" required="true" />
  <nbxp:part href="source/original.ipynb" mediaType="application/x-ipynb+json" required="false" />
  <nbxp:part href="assets/images/output-cell-18-0.png" mediaType="image/png" sha256="..." />
</nbxp:manifest>
```

El manifest permite:

- Validar que el paquete está completo.
- Detectar assets faltantes.
- Verificar integridad.
- Saber qué versión del formato se está usando.
- Migrar archivos antiguos.

### 10.11 Validación y versionado del formato

NBXP debería tener schema formal desde el inicio.

Propuesta:

```txt
schemas/
├── nbxp-presentation-1.0.xsd
├── nbxp-theme-1.0.xsd
└── nbxp-manifest-1.0.xsd
```

Reglas:

- Todo `.nbxp` debe declarar versión.
- El parser debe rechazar paquetes corruptos.
- El parser debe aceptar versiones compatibles.
- Las migraciones deben ser explícitas: `1.0 -> 1.1`, `1.1 -> 2.0`.
- Los campos experimentales deben ir bajo namespace separado o bloque `<nbxp:extensions>`.

Ejemplo:

```xml
<nbxp:extensions>
  <ai:deckSummary xmlns:ai="https://tumbfolio.dev/schema/ai/1.0">
    Summary generated by model...
  </ai:deckSummary>
</nbxp:extensions>
```

### 10.12 Relación entre modelo interno y NBXP

El modelo interno de la app puede seguir siendo TypeScript/JSON en memoria.

NBXP no tiene que ser el modelo de runtime. NBXP debe ser el formato de persistencia e intercambio.

Flujo correcto:

```txt
.ipynb
  ↓ parse
Presentation Model en memoria
  ↓ serialize
.nbxp
  ↓ deserialize
Presentation Model en memoria
  ↓ export
HTML / PDF / PPTX
```

Esto mantiene limpia la arquitectura:

- El parser de `.ipynb` entiende notebooks.
- El serializer `.nbxp` entiende proyectos de presentación.
- El renderer HTML entiende el Presentation Model.
- Los exporters no dependen directamente del notebook original.

### 10.13 Ventajas estratégicas de NBXP

NBXP le da identidad técnica al producto.

Ventajas:

- Permite guardar proyectos editables.
- Permite reabrir presentaciones sin volver a procesar el notebook.
- Permite compartir un archivo autocontenido.
- Permite versionar el formato del producto.
- Permite migraciones controladas.
- Permite separar fuente, presentación y exportes.
- Permite construir features futuras: plantillas, comentarios, historial, firmas, validación, compatibilidad.

Pero hay que ser frío: NBXP no debe venderse como estándar universal al inicio. Primero debe ser un formato interno sólido. Si el producto crece, después se puede documentar como especificación pública.

### 10.14 Reglas de diseño de NBXP

```txt
1. No guardar blobs grandes dentro de XML si pueden ir como assets.
2. No depender de rutas absolutas.
3. Todo asset debe tener mediaType.
4. Todo asset importante debe tener hash.
5. Todo bloque debe tener id estable.
6. Toda slide debe conservar referencias a celdas fuente.
7. El notebook original debe ser opcional por privacidad y peso.
8. Los outputs HTML deben ir sanitizados o aislados.
9. El formato debe poder abrirse aunque falten assets no críticos.
10. La versión del formato debe ser obligatoria.
```

### 10.15 MIME type propuesto para NBXP

```txt
application/vnd.tumbfolio.nbxp+zip
```

Para el XML principal:

```txt
application/vnd.tumbfolio.presentation+xml
```

Para el tema:

```txt
application/vnd.tumbfolio.theme+xml
```

El nombre comercial puede ser `.nbxp`, pero internamente debe tratarse como un paquete comprimido con partes bien tipadas.

---

## 11. Layouts de slides

### 11.1 Title

Para portada o separadores grandes.

Uso:

- Título del notebook.
- Autor.
- Fecha.
- Dataset/proyecto.
- Contexto.

### 11.2 Section

Para dividir bloques del notebook.

Uso:

- Introducción.
- Metodología.
- Exploración.
- Modelo.
- Resultados.
- Conclusiones.

### 11.3 Content

Markdown limpio, explicación narrativa o bullets.

Uso:

- Texto explicativo.
- Conceptos.
- Objetivos.
- Conclusiones.

### 11.4 Code + Output

Muestra código y resultado.

Uso:

- Docencia.
- Explicación técnica.
- Demostración reproducible.

### 11.5 Output Focus

Muestra principalmente el resultado.

Uso:

- Gráficos.
- Tablas.
- Métricas.
- Resultados finales.

### 11.6 Figure Focus

Gráfico grande con título y descripción.

Uso:

- Matplotlib.
- SVG.
- Imágenes.
- Visualizaciones centrales.

### 11.7 Table Focus

Tabla con scroll, resaltado y explicación.

Uso:

- DataFrames.
- Métricas.
- Comparaciones.
- Resultados tabulares.

### 11.8 Comparison

Dos bloques lado a lado.

Uso:

- Antes/después.
- Modelo A vs Modelo B.
- Dataset train vs test.
- Comparación de métricas.

### 11.9 Appendix

Slides secundarias para código, logs o detalles técnicos.

Uso:

- Código completo.
- Warnings.
- Outputs largos.
- Detalles reproducibles.

---

## 12. Heurísticas de generación automática

### 12.1 Detección de secciones

Reglas:

- `#` en Markdown crea posible portada o sección principal.
- `##` crea sección.
- `###` puede crear slide de contenido.
- Markdown antes de una celda con output se usa como contexto.
- Varias celdas cortas consecutivas se pueden fusionar.

### 12.2 Clasificación de celdas

Tipos:

- `narrative_markdown`
- `setup_code`
- `analysis_code`
- `visualization_code`
- `modeling_code`
- `result_output`
- `table_output`
- `figure_output`
- `log_output`
- `error_output`
- `noise`

### 12.3 Detección de ruido

Se marca como ruido:

- Imports.
- Instalaciones tipo `pip install`.
- Configuración de warnings.
- Setup de paths.
- Celdas con mucho stdout irrelevante.
- Warnings repetitivos.
- Errores no resueltos.
- Prints de debugging.
- Outputs extremadamente largos.
- Celdas vacías.

### 12.4 Selección de layout

Reglas:

- Celda Markdown grande → `content`.
- Markdown H1/H2 → `section`.
- Imagen única grande → `figure-focus`.
- Tabla grande → `table-focus`.
- Código + output corto → `code-output`.
- Output sin código relevante → `output-focus`.
- Dos outputs relacionados → `comparison`.
- Logs largos → `appendix` o colapsado.

### 12.5 Visibilidad por defecto

| Tipo de celda | Código | Output | Logs |
|---|---:|---:|---:|
| Setup/imports | Oculto | Oculto | Oculto |
| Análisis corto | Colapsado | Visible | Oculto |
| Gráfico | Oculto | Visible | Oculto |
| Tabla | Oculto | Visible | Oculto |
| Docencia | Visible | Visible | Colapsado |
| Error | Oculto | Oculto con warning | Colapsado |
| Conclusión Markdown | No aplica | No aplica | No aplica |

---

## 13. Flujos principales

## 13.1 Flujo 1 — Subir notebook y generar presentación automática

### Objetivo

Permitir que el usuario suba un `.ipynb` ya ejecutado y reciba una presentación inicial usable en segundos.

### Actor

Data scientist, profesor o investigador.

### Flujo

1. Usuario entra a la app.
2. Hace clic en **Upload Notebook**.
3. Selecciona un archivo `.ipynb`.
4. El sistema valida:
   - Extensión.
   - Estructura JSON.
   - Versión nbformat.
   - Existencia de celdas.
   - Existencia de outputs.
5. El sistema muestra un resumen:
   - Número de celdas.
   - Número de outputs.
   - Tipos MIME detectados.
   - Outputs no soportados.
   - Posibles warnings.
6. Usuario hace clic en **Generate Deck**.
7. El sistema:
   - Normaliza celdas.
   - Clasifica outputs.
   - Detecta secciones.
   - Detecta ruido.
   - Propone slides.
   - Aplica tema por defecto.
8. Usuario llega al editor con slides generadas.

### Resultado esperado

Una presentación HTML editable con estructura inicial.

### Estados alternos

- Notebook sin outputs: mostrar advertencia y permitir crear deck parcial.
- Notebook inválido: rechazar con error claro.
- Outputs no soportados: crear fallback visual.
- Archivo demasiado grande: sugerir optimización o límite.

---

## 13.2 Flujo 2 — Revisión inicial del deck generado

### Objetivo

Permitir una inspección rápida de la presentación antes de editar.

### Flujo

1. Sistema muestra vista de editor:
   - Sidebar izquierdo con slides.
   - Preview central.
   - Panel derecho de propiedades.
2. Usuario navega por slides.
3. Sistema marca visualmente:
   - Slides con outputs no soportados.
   - Slides con contenido muy largo.
   - Slides con código visible.
   - Slides con logs ocultos.
4. Usuario puede aplicar acciones globales:
   - Ocultar todo el código.
   - Mostrar código relevante.
   - Solo outputs.
   - Modo docente.
   - Modo ejecutivo.
   - Modo investigador.

### Resultado esperado

Usuario entiende qué generó el sistema y puede empezar a curar.

---

## 13.3 Flujo 3 — Curar una slide

### Objetivo

Editar una slide concreta sin tocar el notebook original.

### Flujo

1. Usuario selecciona una slide.
2. Panel derecho muestra:
   - Layout actual.
   - Título.
   - Bloques incluidos.
   - Celdas fuente.
   - Visibilidad de código.
   - Visibilidad de output.
   - Estado de logs.
3. Usuario puede:
   - Cambiar título.
   - Cambiar layout.
   - Mostrar/ocultar código.
   - Mostrar/ocultar output.
   - Colapsar código.
   - Colapsar logs.
   - Eliminar bloque.
   - Reordenar bloques.
   - Convertir output a imagen.
   - Mover bloque a apéndice.
4. Preview se actualiza en tiempo real.

### Resultado esperado

La slide queda limpia sin perder trazabilidad al notebook original.

---

## 13.4 Flujo 4 — Dividir una slide demasiado cargada

### Objetivo

Resolver slides generadas con demasiada información.

### Flujo

1. Sistema detecta una slide con exceso de bloques o altura.
2. Muestra badge: **Too dense**.
3. Usuario hace clic en **Split slide**.
4. Sistema propone:
   - Dividir por celdas.
   - Dividir Markdown y output.
   - Dividir código y output.
   - Enviar logs a apéndice.
5. Usuario acepta una propuesta.
6. Sistema crea dos o más slides conectadas.

### Resultado esperado

La presentación gana legibilidad sin edición manual pesada.

---

## 13.5 Flujo 5 — Fusionar slides

### Objetivo

Permitir unir slides generadas con contenido demasiado fragmentado.

### Flujo

1. Usuario selecciona dos slides consecutivas.
2. Hace clic en **Merge**.
3. Sistema valida si el contenido cabe.
4. Propone layout:
   - Content.
   - Code + Output.
   - Figure Focus.
   - Comparison.
5. Usuario confirma.
6. Sistema fusiona bloques y conserva referencias a celdas originales.

### Resultado esperado

Menos slides innecesarias y mejor ritmo narrativo.

---

## 13.6 Flujo 6 — Cambiar modo de presentación

### Objetivo

Adaptar el deck a diferentes contextos sin rehacerlo.

### Modos

#### Modo ejecutivo

- Oculta código por defecto.
- Muestra outputs y conclusiones.
- Prioriza gráficos.
- Genera títulos orientados a resultado.
- Colapsa logs y detalles técnicos.

#### Modo docente

- Muestra código relevante.
- Mantiene outputs.
- Permite explicaciones paso a paso.
- Mantiene trazabilidad entre código y resultado.

#### Modo investigador

- Mantiene más detalle técnico.
- Prioriza tablas, métricas y metodología.
- Código colapsado, pero accesible.
- Speaker notes más formales.

### Flujo

1. Usuario abre selector de modo.
2. Elige Ejecutivo, Docente o Investigador.
3. Sistema aplica presets globales.
4. Usuario puede revertir o ajustar manualmente.

### Resultado esperado

Un mismo notebook puede generar versiones distintas del deck.

---

## 13.7 Flujo 7 — Usar IA para mejorar una slide

### Objetivo

Usar IA como asistente de curación, no como motor de verdad.

### Flujo

1. Usuario selecciona una slide.
2. Escribe o elige una acción:
   - “Hazla más ejecutiva”.
   - “Resume esta explicación”.
   - “Genera speaker notes”.
   - “Propón un mejor título”.
   - “Oculta lo que no sea necesario”.
   - “Convierte esto en explicación para clase”.
3. Sistema envía a la IA:
   - Texto de Markdown.
   - Código si está permitido.
   - Representación textual de outputs.
   - Metadatos de slide.
   - No envía archivos completos si no es necesario.
4. IA devuelve sugerencias.
5. Usuario acepta, edita o descarta.

### Resultado esperado

La IA reduce trabajo de redacción y curaduría sin alterar resultados reales.

### Regla crítica

La IA nunca debe modificar datos, métricas o outputs originales sin confirmación explícita.

---

## 13.8 Flujo 8 — Presentar desde la web

### Objetivo

Usar el deck directamente como presentación HTML interactiva.

### Flujo

1. Usuario hace clic en **Present**.
2. App abre modo fullscreen.
3. Usuario navega con teclado.
4. Slides mantienen:
   - Outputs visibles.
   - Código colapsable si aplica.
   - Tablas con scroll si aplica.
   - Speaker notes si aplica.
5. Usuario puede salir al editor.

### Resultado esperado

Presentación usable sin exportar.

---

## 13.9 Flujo 9 — Exportar a HTML standalone

### Objetivo

Permitir compartir la presentación como archivo HTML.

### Flujo

1. Usuario hace clic en **Export**.
2. Selecciona **HTML**.
3. Sistema empaqueta:
   - Slides.
   - Tema.
   - Assets.
   - Imágenes.
   - CSS.
   - JS necesario.
4. Sistema descarga `.html` o `.zip`.

### Resultado esperado

Presentación portable.

### Consideración

Si hay outputs interactivos complejos, puede requerirse export `.zip` en vez de un solo `.html`.

---

## 13.10 Flujo 10 — Exportar a PDF

### Objetivo

Generar una versión fija para entrega, impresión o archivo.

### Flujo

1. Usuario selecciona **Export PDF**.
2. Sistema genera vista de impresión.
3. Motor headless produce PDF.
4. Usuario descarga archivo.

### Resultado esperado

PDF visualmente consistente.

### Limitación honesta

El PDF es un snapshot. No conserva interactividad.

---

## 13.11 Flujo 11 — Exportar a PPTX

### Objetivo

Generar una presentación editable en PowerPoint.

### Flujo

1. Usuario selecciona **Export PPTX**.
2. Sistema convierte cada slide del Presentation Model a objetos PPTX.
3. Convierte:
   - Texto a cajas de texto.
   - Imágenes a imágenes.
   - Tablas a tablas.
   - Código a bloques monoespaciados.
   - Outputs HTML complejos a imagen si no se pueden reconstruir.
4. Usuario descarga `.pptx`.

### Resultado esperado

PPTX editable en un nivel razonable.

### Limitación honesta

PPTX no debe prometer equivalencia total con HTML interactivo.

---

## 13.12 Flujo 12 — Manejo de outputs no soportados

### Objetivo

No romper la presentación cuando un output no pueda renderizarse.

### Flujo

1. Sistema detecta MIME type no soportado.
2. Crea fallback:
   - `text/plain` si existe.
   - Screenshot si está disponible.
   - Placeholder si no existe fallback.
3. Slide recibe badge: **Unsupported output**.
4. Usuario puede:
   - Ocultarlo.
   - Convertirlo a placeholder.
   - Reemplazarlo manualmente.
   - Mantener fallback.
   - Excluirlo del export.

### Resultado esperado

El deck nunca se rompe silenciosamente.

---

## 13.13 Flujo 13 — Guardar proyecto como NBXP

### Objetivo

Permitir que el usuario conserve una presentación editable sin depender del notebook crudo ni de un export final.

### Flujo

1. Usuario edita deck.
2. Hace clic en **Save as NBXP**.
3. Sistema serializa el Presentation Model a `presentation.xml`.
4. Sistema genera o actualiza:
   - `META-INF/manifest.xml`.
   - `theme.xml`.
   - Assets derivados.
   - Speaker notes si existen.
   - Notebook original si el usuario activa **Embed source notebook**.
5. Sistema empaqueta todo como `.nbxp`.
6. Usuario descarga o guarda el archivo.

### Resultado esperado

El usuario obtiene un proyecto editable y transportable de Tumbfolio.

### Decisión de producto

El `.nbxp` no reemplaza al `.html`, `.pdf` o `.pptx`. Es el formato de trabajo editable.

---

## 13.14 Flujo 14 — Abrir archivo NBXP

### Objetivo

Permitir reabrir una presentación curada sin regenerarla desde el notebook original.

### Flujo

1. Usuario arrastra un archivo `.nbxp` al upload.
2. Sistema detecta que no es `.ipynb`, sino un paquete NBXP.
3. Sistema valida:
   - Estructura del ZIP.
   - `manifest.xml`.
   - `presentation.xml`.
   - Versión del formato.
   - Assets requeridos.
4. Sistema deserializa el archivo al Presentation Model interno.
5. Editor abre el deck con slides, tema, visibilidad y notas previamente guardadas.
6. Si faltan assets no críticos, muestra advertencias y placeholders.

### Resultado esperado

El usuario continúa trabajando desde donde dejó la presentación.

### Regla crítica

Abrir `.nbxp` debe ser más rápido que reprocesar `.ipynb`, porque ya viene curado y normalizado.

---

## 13.15 Flujo 15 — Importar NBXP y exportar a otros formatos

### Objetivo

Usar NBXP como fuente de exportación para HTML, PDF y PPTX.

### Flujo

1. Usuario abre `.nbxp`.
2. Realiza ajustes menores si quiere.
3. Selecciona export:
   - HTML.
   - PDF.
   - PPTX.
4. Exporter consume el Presentation Model reconstruido desde NBXP.
5. Sistema genera el formato final.

### Resultado esperado

El usuario puede mantener un único archivo editable y producir varios formatos derivados.

---

## 13.16 Flujo 16 — Compartir deck

### Objetivo

Permitir que otros vean la presentación.

### Flujo

1. Usuario hace clic en **Share**.
2. Sistema genera link público o privado.
3. Usuario define permisos:
   - View only.
   - Duplicate.
   - Download enabled.
4. Receptor abre la presentación.

### Resultado esperado

Compartir sin enviar archivos pesados.

### No necesario para MVP inicial

Puede quedar para versión posterior.

---

## 14. Estructura de interfaz

### 14.1 Vista Upload

Elementos:

- Dropzone grande.
- Texto: “Upload an executed `.ipynb` notebook”.
- Requisitos:
  - Notebook ya ejecutado.
  - Tamaño máximo.
  - Outputs soportados.
- Botón: **Generate Deck**.
- Ejemplo visual antes/después.

### 14.2 Vista Analysis Summary

Elementos:

- Nombre del archivo.
- Número de celdas.
- Número de outputs.
- Tipos MIME detectados.
- Outputs soportados.
- Outputs con fallback.
- Recomendación de modo:
  - Ejecutivo.
  - Docente.
  - Investigador.

### 14.3 Editor

Layout:

```txt
┌─────────────────────────────────────────────────────────────┐
│ Topbar: Project name | Theme | Mode | Present | Export       │
├───────────────┬───────────────────────────────┬─────────────┤
│ Slide sidebar │ Slide preview                  │ Properties  │
│               │                               │ panel       │
│ - Slide 1     │                               │             │
│ - Slide 2     │                               │ Layout      │
│ - Slide 3     │                               │ Visibility  │
│               │                               │ AI actions  │
└───────────────┴───────────────────────────────┴─────────────┘
```

### 14.4 Modo presentación

Elementos:

- Fullscreen.
- Navegación teclado.
- Barra mínima.
- Speaker notes opcionales.
- Código colapsable.
- Tablas con scroll.
- Indicador de progreso.

### 14.5 Vista Export

Opciones:

- HTML.
- PDF.
- PPTX.
- Configuración:
  - Incluir código.
  - Incluir speaker notes.
  - Incluir apéndice.
  - Exportar outputs como imágenes.
  - Tema.

---

## 15. Arquitectura propuesta

### 15.1 Frontend

Tecnologías sugeridas:

- Next.js.
- React.
- TypeScript.
- Tailwind o CSS Modules.
- Monaco o Shiki para código.
- KaTeX o MathJax para ecuaciones.
- DOMPurify para HTML sanitizado.
- Motor propio de slides o Reveal.js integrado.

### 15.2 Backend

Para MVP puede ser mínimo.

Responsabilidades:

- Validar archivo.
- Procesar notebook.
- Generar Presentation Model.
- Generar PDF.
- Generar PPTX.
- Guardar proyectos si aplica.

Tecnologías sugeridas:

- Node.js con workers.
- O FastAPI si se quiere aprovechar ecosistema Python para notebook parsing.
- Playwright para PDF.
- PptxGenJS para PPTX.

### 15.3 Pipeline

```txt
Upload
  ↓
Validate notebook
  ↓
Parse cells
  ↓
Normalize outputs
  ↓
Detect sections
  ↓
Detect noise
  ↓
Plan slides
  ↓
Build Presentation Model
  ↓
Render HTML editor
  ↓
Export if needed
```

---

## 16. Render layer

### 16.1 MIME Renderer Layer

El sistema debe renderizar por MIME type.

Ejemplo:

```ts
type MimeRenderer = {
  mimeType: string;
  canRender: (output: NormalizedOutput) => boolean;
  render: (output: NormalizedOutput, context: RenderContext) => React.ReactNode;
  exportToImage?: (output: NormalizedOutput) => Promise<Blob>;
  exportToPptx?: (output: NormalizedOutput) => PptxElement;
};
```

### 16.2 Renderers iniciales

- MarkdownRenderer.
- CodeRenderer.
- PlainTextRenderer.
- HtmlRenderer.
- ImageRenderer.
- SvgRenderer.
- LatexRenderer.
- DataFrameRenderer.
- StreamRenderer.
- ErrorRenderer.

### 16.3 Seguridad de HTML

Para `text/html` hay dos estrategias:

1. Sanitizar con DOMPurify.
2. Renderizar en iframe sandbox.

Regla recomendada:

- HTML simple: sanitizar.
- HTML complejo: iframe sandbox.
- Scripts: deshabilitados por defecto.
- Recursos externos: advertencia.

---

## 17. Exportación

### 17.1 NBXP

NBXP es el formato editable propio.

Debe conservar:

- Reapertura del deck.
- Slides y layouts.
- Visibilidad por celda.
- Tema.
- Speaker notes.
- Assets derivados.
- Referencias al notebook original.
- Notebook original embebido de forma opcional.

NBXP no es un export final. Es el archivo de proyecto.

### 17.2 HTML

Formato principal de presentación.

Debe conservar:

- Interactividad básica.
- CSS del tema.
- Navegación.
- Código colapsable.
- Tablas con scroll.
- Speaker notes si aplica.

### 17.3 PDF

Debe generar snapshot estable.

Recomendación:

- Usar Playwright/Chromium.
- Usar print CSS.
- Exportar cada slide como página.
- Convertir elementos problemáticos a imagen cuando sea necesario.

### 17.4 PPTX

Debe ser útil, no perfecto.

Estrategia:

- Texto como texto editable.
- Imágenes como imágenes.
- Tablas simples como tablas.
- Código como caja monoespaciada.
- HTML complejo como imagen.
- Gráficos interactivos como imagen o fallback.

---

## 18. IA dentro del producto

### 18.1 Acciones IA por slide

- Generar título.
- Mejorar título.
- Resumir contenido.
- Crear speaker notes.
- Explicar gráfico.
- Convertir a tono ejecutivo.
- Convertir a tono docente.
- Sugerir qué ocultar.
- Detectar ruido.
- Proponer conclusión.

### 18.2 Acciones IA globales

- Crear narrativa completa.
- Reordenar slides.
- Generar resumen ejecutivo.
- Crear índice.
- Crear conclusión.
- Crear versión corta.
- Crear versión clase.
- Crear versión comité.

### 18.3 Guardrails

La IA debe recibir contexto limitado.

No debe alterar:

- Métricas.
- Tablas.
- Gráficos.
- Outputs originales.
- Código fuente.

Debe devolver sugerencias separadas de los datos reales.

---

## 19. Roadmap

### 19.1 Fase 1 — Prototipo funcional

Objetivo:

Validar que un notebook real pueda convertirse en presentación HTML usable.

Incluye:

- Upload `.ipynb`.
- Parser.
- Normalizador básico.
- Render Markdown/código/outputs simples.
- Generador automático simple.
- Tema Colab Clean.
- Modo presentación.

### 19.2 Fase 2 — MVP usable

Objetivo:

Permitir curación real.

Incluye:

- Sidebar de slides.
- Panel de propiedades.
- Visibilidad por celda.
- Split/merge.
- 3 temas.
- Export HTML.
- Export PDF inicial.
- Detección de ruido.

### 19.3 Fase 3 — Export serio

Objetivo:

Soportar entregables.

Incluye:

- Export PPTX.
- Mejor PDF.
- Apéndices.
- Speaker notes.
- Fallbacks robustos.
- Guardado de proyecto.

### 19.4 Fase 4 — IA

Objetivo:

Reducir trabajo manual.

Incluye:

- Títulos automáticos.
- Resúmenes.
- Speaker notes.
- Recomendaciones de visibilidad.
- Modo ejecutivo/docente/investigador.

### 19.5 Fase 5 — Compartir

Objetivo:

Convertirlo en producto colaborativo.

Incluye:

- Autenticación.
- Proyectos guardados.
- Links públicos/privados.
- Duplicar deck.
- Historial de versiones.

---

## 20. Riesgos técnicos

### 20.1 Render de outputs complejos

Riesgo:

Los notebooks pueden contener outputs difíciles de reproducir.

Mitigación:

- MIME renderers por prioridad.
- Fallbacks.
- Warnings claros.
- Convertir a imagen cuando sea necesario.

### 20.2 Seguridad de HTML

Riesgo:

`text/html` puede incluir scripts o contenido peligroso.

Mitigación:

- DOMPurify.
- iframe sandbox.
- Bloqueo de scripts por defecto.
- CSP estricta.

### 20.3 PPTX imperfecto

Riesgo:

PPTX no preserva interactividad ni layouts complejos.

Mitigación:

- Declarar HTML como formato canónico.
- Exportar PPTX como versión editable aproximada.
- Convertir outputs complejos a imágenes.

### 20.4 Notebooks enormes

Riesgo:

Archivos grandes pueden romper performance.

Mitigación:

- Límite de tamaño.
- Lazy rendering.
- Virtualización de sidebar.
- Compresión de imágenes.
- Procesamiento en worker.

### 20.5 Auto-layout mediocre

Riesgo:

La generación automática puede producir slides feas.

Mitigación:

- Heurísticas conservadoras.
- Tres temas bien diseñados.
- Editor rápido.
- Badges de densidad.
- Split/merge.

---

## 21. Métricas de éxito

### 21.1 Producto

- Tiempo desde upload hasta deck inicial.
- Porcentaje de notebooks que generan deck sin error.
- Número promedio de ediciones manuales por deck.
- Porcentaje de slides aceptadas sin cambios.
- Exportaciones por formato.
- Retención de usuarios.

### 21.2 Calidad visual

- Slides marcadas como “too dense”.
- Outputs no soportados por notebook.
- Fallbacks usados.
- Errores de exportación.
- Tiempo promedio de render.

### 21.3 Valor percibido

- ¿El usuario exportó?
- ¿El usuario presentó desde la web?
- ¿El usuario guardó proyecto?
- ¿El usuario usó IA?
- ¿El usuario volvió a subir otro notebook?

---

## 22. Backlog inicial

### Must have

- Upload `.ipynb`.
- Parser.
- Normalización de celdas.
- Render Markdown.
- Render código.
- Render imágenes.
- Render HTML básico.
- Render tablas.
- Generación automática.
- Tema Colab Clean.
- Editor con preview.
- Toggle mostrar/ocultar código.
- Modo presentación HTML.

### Should have

- Detección de ruido.
- Tres temas.
- Split/merge.
- Export HTML.
- Export PDF.
- Speaker notes.
- IA para títulos.
- IA para resúmenes.

### Could have

- Export PPTX.
- Guardar proyecto.
- Compartir link.
- Modo ejecutivo/docente/investigador.
- Render Plotly.
- Render Altair.
- Apéndice automático.

### Won't have inicialmente

- Ejecutar notebooks.
- Kernels.
- Colaboración en tiempo real.
- Edición libre tipo PowerPoint.
- Soporte perfecto de widgets.
- Integración directa con Colab.

---

## 23. Primera versión vendible

La primera versión vendible no necesita resolver todo Jupyter.

Necesita resolver este caso:

> Un data scientist sube un notebook ejecutado con Markdown, pandas, Matplotlib y outputs de texto. La app genera una presentación limpia, permite ocultar código, ajustar slides y exportar HTML/PDF.

Si eso queda bien, el producto tiene base.

Si eso queda mediocre, agregar IA, PPTX o temas no lo va a salvar.

---

## 24. Reglas de diseño del MVP

- No más de 3 temas.
- No más de 8 layouts iniciales.
- No ejecutar código.
- No prometer compatibilidad total.
- No permitir CSS libre al inicio.
- No esconder errores de render.
- No meter IA donde una heurística basta.
- No diseñar primero el export PPTX.
- No copiar Colab literalmente.
- No construir PowerPoint dentro del navegador.

---

## 25. Stack recomendado

### Opción A — Full TypeScript

```txt
Next.js
React
TypeScript
Shiki o Monaco para código
KaTeX o MathJax
DOMPurify
Reveal.js opcional
Playwright para PDF
PptxGenJS para PPTX
Workers para parsing pesado
```

Ventaja:

- Un solo lenguaje.
- Buena integración web.
- Export PPTX natural con PptxGenJS.

Desventaja:

- Parsing avanzado de notebooks menos cómodo que en Python.

### Opción B — Web + Python backend

```txt
Next.js
React
TypeScript
FastAPI
Python nbformat
Playwright
PptxGenJS desde servicio Node o librería equivalente
```

Ventaja:

- Python maneja mejor ecosistema Jupyter.
- Validación de nbformat más directa.

Desventaja:

- Dos runtimes.
- Más complejidad de despliegue.

### Recomendación

Para prototipo rápido:

```txt
Next.js + TypeScript + parser directo de JSON .ipynb
```

Para producto más robusto:

```txt
Next.js frontend + backend de procesamiento
```

---

## 26. Referencias técnicas base

- Jupyter Notebook Format / nbformat: https://nbformat.readthedocs.io/en/latest/format_description.html
- JupyterLab MIME rendering: https://jupyterlab.readthedocs.io/en/4.3.x/api/modules/rendermime.html
- JupyterLab MIME renderer interfaces: https://jupyterlab.readthedocs.io/en/4.3.x/api/modules/rendermime_interfaces.html
- JupyterLab export / slides: https://jupyterlab.readthedocs.io/en/3.6.x/user/export.html
- Google Colab advanced outputs: https://colab.research.google.com/notebooks/snippets/advanced_outputs.ipynb
- Google Colab FAQ on secure rich outputs: https://research.google.com/colaboratory/faq.html
- Reveal.js PDF export: https://revealjs.com/pdf-export/
- Quarto presentations: https://quarto.org/docs/presentations/
- Quarto Reveal.js: https://quarto.org/docs/presentations/revealjs/
- PptxGenJS: https://gitbrent.github.io/PptxGenJS/
- DOMPurify: https://github.com/cure53/DOMPurify
- Open Packaging Conventions overview: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/opc/open-packaging-conventions-overview
- Library of Congress, OPC format description: https://www.loc.gov/preservation/digital/formats/fdd/fdd000363.shtml
- W3C XML Schema 1.1: https://www.w3.org/TR/xmlschema11-1/
- Jupyter custom MIME types: https://docs.jupyter.org/en/latest/reference/mimetype.html

---

## 27. Conclusión

Tumbfolio debe enfocarse en una idea simple y difícil de ejecutar bien:

> Convertir notebooks ejecutados en presentaciones profesionales, limpias, editables y exportables, sin obligar al usuario a rehacer manualmente su narrativa visual.

El producto gana si logra tres cosas:

1. Renderizar outputs con fidelidad suficiente.
2. Reducir ruido visual en segundos.
3. Permitir curación manual sin fricción.

El error mortal sería intentar ser Jupyter, Colab, PowerPoint, Quarto y Canva al mismo tiempo.

La ruta correcta es más fría:

```txt
Notebook ejecutado
→ deck automático
→ control de ruido
→ guardado editable en NBXP
→ presentación HTML excelente
→ exportes razonables
→ IA como acelerador
```
