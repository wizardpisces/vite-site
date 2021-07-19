---
title: Vue SSR 经验
description:
---

# Vue SSR

## vue ssr hydrate 原理

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
### vue-lazy-hydrate原理
* 服务端：

1. hydrate=true -> 渲染出来的正常待hydrate的 html 占位
* 客户端：

1. 最初hydrate=false 渲染最外层标签，刚好满足hydrate成功 -> 直接渲染原来服务端输出的html
2. 在 visible | idle 等条件触发时修改 hydrate=true -> 触发 render -> 根据 hydrate=true 输出正常组件替换原来位置
### vue-no-ssr原理

* 服务端：

1. h(false) 占位
* 客户端：

1. 根据parent._isMounted 返回正常组件替换

## SSR runInNewContext
 
### in NuxtJs
* in dev : true(代表plugin middleware等文件会在每个请求进入的时候重新载入)
* in production: false （代表不会重新载入plugin，只会反复执行返回的函数）

### vue SSR code structure (删除了很多代码，只保留了基本骨架)

1. bundle code

./vue-ssr.js

### reference

* [node vm](https://nodejs.org/api/vm.html)
* [node module](https://nodejs.org/api/modules.html#modules_the_module_wrapper)
* [node require解析](https://segmentfault.com/a/1190000008587112)
* [vue ssr in depth](https://harttle.land/2020/02/10/deep-into-vue-ssr.html)
* [vue ssr in depth2](https://zhuanlan.zhihu.com/p/61348429)
