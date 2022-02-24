# 关于node的addon
Node.js 对 native addon 开发侧暴露的是 ABI（In computer software, an application binary interface (ABI) is an interface between two binary program modules）
## Addon方案演化
***以下是摘抄，还有待琢磨原理***
### NAN（Native Abstractions for Node.js）
NAN 将 v8/libuv 相关的 API 进行了封装，对外是稳定的抽象层 API (但却无法保证是 ABI 稳定)。用 NAN 进行封装的 native addon 几乎无法通过预编译的方式进行分发，因为跨 Node 版本底层 v8/libuv API 变化之后需要对源码进行重新编译才能使用。所以这就是为什么很多 native addon 在 npm install 后还要调用一堆工具链在本地进行编译才能使用，以及为什么有时候 node 版本升级之后之前安装好的 node_modules 就无法直接使用了。

一句话理解：V8底层的封装，估计需要理解V8才能开发

### N-API
自从 Node.js v8.0.0 发布之后，Node.js 推出了全新的用于开发 C++ 原生模块的接口，N-API。本质其实是将 NAN 这层抽象挪到了 node 源码中，在 node 编译的时候就编译好这层对外抽象，这样 N-API 对外就是稳定的 ABI 了。

一句话理解：v8之上node层的封装，跟随Node编译，独立于操作系统

## 应用
### C++扩展
基本步骤：

./demo.cc
```C++
#include <node_api.h> // 1. 引入 napi 头
#include <stdio.h>

// 2. 逻辑开发与声明
napi_value SayHello(napi_env env, napi_callback_info info)
{
    printf("Hello World\n");
    return NULL;
}

napi_value Init(napi_env env, napi_value exports)
{
    napi_status status;
    napi_value fn;

    status = napi_create_function(env, NULL, 0, SayHello, NULL, &fn);
    if (status != napi_ok)
        return NULL;

    status = napi_set_named_property(env, exports, "sayHello", fn);
    if (status != napi_ok)
        return NULL;

    return exports;
}

// 3. 模块注册
NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

模块配置跟编译

./binding.gyp
```json
{
    "targets": [{
        "target_name": "demo",
        "sources": ["./demo.cc"]
    }]
}
```
生成.node文件（动态链接库）
```bash
node-gyp rebuild # ./build/Release/demo.node
```
调用.node文件
```js
const demo = require('./build/Release/demo.node')
demo.sayHello() // Hello World
```

# 思考

node扩展方式

* 插件开发
* WebAssembly

哪种更快些？或者分别适用于哪些场景？

Wasm被保证与可以运行您的Electron应用程序的任何操作系统兼容。
C，C++和Rust将没有此保证。除了从JavaScript调用的开销之外，它们将更加高效。
正在积极地处理从JavaScript调用Wasm的开销，并且正在减少或完全消除这种开销。
# Reference
* [N-API入门](https://nodejs.fasionchan.com/zh_CN/latest/napi/quick-start.html)
* Rust bindings for writing safe and fast native Node.js modules.[neon](https://github.com/neon-bindings/neon)
* [用 Rust 和 N-API 开发高性能 Node.js 扩展](https://lyn.one/2020/09/11/rust-napi)