---
title: Vue SSR 经验
description:
---

# Vue SSR

## ssr hydrate 原理

基本猜想： 

1. 按照层级匹配，只在不匹配的时候报错，层次正确即可
2. 只在data-server-rendered="true"的时候hydrate，随后移除data-server-rendered
server.html
```html
<div><button><a></a></button></div>
```
will match client
```html
<div></div>
```
but not match client
```html
<div><a></a></div>
```
## 协同的库
### [vue-lazy-hydrate](https://github.com/maoberlehner/vue-lazy-hydration)原理
* 服务端：

1. hydrate=true -> 根据component 渲染出来的正常 html

* 客户端：

将组件封装成 async component，在条件成熟的时候resolve（浏览器空闲/dom可见/事件触发）
```js
export function makeNonce({ component, hydrationPromise }) {
  if (isServer) return component;

  return () => hydrationPromise.then(() => resolveComponent(component));
}
```
#### 结论
原理上不是真实意义上的hydrate，而是异步组件的渲染；
所以如果一个组件在转换成 async的时候会出问题（例如：会有跟激活的组件的交互），那就不适用这个package
### vue-client-only原理
原理：vue-client-only 组件的 render 函数简单封装
* 服务端返回h(false) 占位
* 客户端：根据parent._isMounted 返回正常组件 （在浏览器mounted的时候）

## 坑
 
### in NuxtJs框架
* in dev : true(代表plugin middleware等文件会在每个请求进入的时候重新载入)
* in production: false （代表不会重新载入plugin，只会反复执行返回的函数）

### SSR runInNewContext demo

1. bundle code

./vue-ssr.js

### reference

* [node vm](https://nodejs.org/api/vm.html)
* [node module](https://nodejs.org/api/modules.html#modules_the_module_wrapper)
* [node require解析](https://segmentfault.com/a/1190000008587112)
* [vue ssr in depth](https://harttle.land/2020/02/10/deep-into-vue-ssr.html)
* [vue ssr in depth2](https://zhuanlan.zhihu.com/p/61348429)
