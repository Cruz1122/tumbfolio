# ADR 0001 — Aplicación Full TypeScript

## Decisión

Tumbfolio se construirá como aplicación Full TypeScript con Next.js, React, PostgreSQL, storage S3-compatible y workers Node.

## Consecuencia

El frontend, las API routes, los workers y los contratos de dominio comparten lenguaje y tipos. El parser de notebooks se implementará inicialmente leyendo JSON `.ipynb` sin ejecutar código.

## Decisión negativa

No se incorporará Python al MVP salvo evidencia concreta de que el parser TypeScript no soporta notebooks reales suficientes.
