# Monorepo

```txt
apps/web
apps/api
apps/worker
packages/domain
packages/config
packages/db
packages/storage
packages/notebook
packages/nbxp
packages/export
packages/render-contracts
packages/testing
```

Los imports internos usan namespace `@tumbfolio/*`. No se aceptan imports relativos profundos entre paquetes.

Correcto:

```ts
import { PresentationSchema } from "@tumbfolio/domain";
```

Incorrecto:

```ts
import { PresentationSchema } from "../../../packages/domain/src";
```
