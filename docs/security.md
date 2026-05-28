# Seguridad inicial

## Decisiones negativas

- No se ejecutará código del notebook.
- No se renderizará HTML arbitrario sin sanitización o sandbox.
- No se tratará un `.nbxp` importado como fuente confiable.
- No se guardarán blobs pesados dentro de XML.
- No se expondrán claves internas de storage directamente a la UI.

## Fronteras de confianza

- Upload `.ipynb`: entrada externa no confiable.
- `.nbxp`: entrada externa no confiable aunque sea formato propio.
- `text/html` y SVG: contenido activo potencialmente peligroso.
- Respuestas IA: sugerencias, nunca fuente de verdad.

Estas reglas existen desde T-01 para evitar rediseños caros cuando lleguen parser, NBXP e IA.
