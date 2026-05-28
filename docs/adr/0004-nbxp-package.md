# ADR 0004 — NBXP como paquete ZIP con XML y assets

## Decisión

NBXP será un paquete ZIP con `manifest.xml`, `presentation.xml`, `theme.xml` y assets internos. No será un XML plano.

## Consecuencia

El formato puede conservar imágenes, HTML aislado, tablas, thumbnails y metadata sin inflar XML con Base64. También permite hashes, media types y migraciones versionadas.
