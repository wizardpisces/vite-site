# vite HRM原理

vite分析源码中*import.meta.hot*的存在从而进行 *__vite__createHotContext* 上线文插入，例如:
文件 '/src/store/index.ts' 中存在如下 import.meta.hot 的守卫
```
if (import.meta.hot) {
  import.meta.hot.accept("/src/store/modules/gaModule.ts", (newGaModule) => {
    console.log("newGaModule", newGaModule);
    store.hotUpdate({
      modules: {
        gaModule: newGaModule.default
      }
    });
  });
}
```
则会在文件'/src/store/index.ts'返回源码头部插入如下
```
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("/src/store/index.ts");
```

## 缺陷

目前(vite@2.2.4) import.meta.hot.accept() 只支持 literal 的 字符串 或者 数组，导致批量载入情况例如：

```
let pathList = []
function loadModules(): any {
    // @ts-ignore
    const contextGlob: GlobContext = import.meta.globEager('./modules/*.ts')
    pathList = Object.keys(contextGlob)
    ...
}

if (import.meta.hot) {
  // 无效
  import.meta.hot.accept(pathList, (newGaModule) => {
  });
}
```
会变的无效，如何解决？能否借鉴 context.require的方式，产生一个对应 context.id 的 import.meta.hot.contex.id 的依赖替代？
