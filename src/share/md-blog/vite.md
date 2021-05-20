# vite

vite简要解析

## vite 基础流程

1. 启用服务 node + connect中间件
2. 浏览器module载入 -> 访问拦截（路径改写，代码插入等，例如对 .vue 的改写成 query形式的 css 以及 render）->
3. 插件调用并处理

## vite HRM原理

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

### 缺陷

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

## vite 预处理

### 问题
例如访问第三方 A module，A module有引用10个其他 module，这10个 module 又分别依赖 5个module，那么就会出现 10 * 5 = 50个http请求的发起，拖慢访问速度

### 解决方案
对项目依赖的node_modules做了预处理，例如：对以上诉的 A module为入口做rollup打包，把那50个依赖都汇总到 A module，同时打包结果缓存到 .vite/A，后续对 A module的引用都直接返回 .vite/A 文件内容

## vite 插件机制

在 rollup 插件基础上 扩展出 vite 的 plugin API，好处：一套插件可能在 rollup 跟 vite 同时兼容使用（如果并未使用vite独有的插件hook），方便扩大 vite的生态圈