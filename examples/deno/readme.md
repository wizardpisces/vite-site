# deno
Deno is a JavaScript/TypeScript runtime with secure defaults and a great developer experience.

It's built on V8, Rust, and Tokio.
## deno vs node

* Deno does not use npm.

    * It uses modules referenced as URLs or file paths.
* Deno does not use package.json in its module resolution algorithm.

* Deno 的运行时是 typescript

* All async actions in Deno return a promise. Thus Deno provides different APIs than Node.

* Deno requires explicit permissions for file, network, and environment access.

* Deno always dies on uncaught errors.

* Deno uses "ES Modules" and does not support require(). Third party modules are imported via URLs:
```ts
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
```

## demo 顺序

* basic.ts （启动服务 and 远程包加载）
* curl.ts (网络)
* cat.ts （文件读写）
* debug.ts （google inspector 调试）
* lifecycle.ts (deno生命周期)
* webassembly （粗略了解下 webassembly的使用）
* 