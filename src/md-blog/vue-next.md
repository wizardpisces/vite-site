# Vue-next analyze 

use [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to manage monorepository

packages：

|priority| step1 | step2 | step3 | step4 |
|--------|-------|-------|-------| -|
| 1 | shared |  Compiler-core |  reactivity| Vue |
| 2  |       |  Compiler-dom  |   Runtime-core/Runtime-dom|
| 2  |       |  Compiler-ssr  |  |
| 2  |       |  Server-renderer/compiler-sfc  |  |

## Compiler-core

