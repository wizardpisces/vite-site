
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

```js

function compileModule (files, basedir, runInNewContext) {
  function getCompiledScript (filename) {
    var code = files[filename];

    // wrap code so each time run code will load dependencies which means run in new context
    var wrapper = NativeModule.wrap(code);

    var script = new vm.Script(wrapper, {
      filename: filename,
      displayErrors: true
    });
    return script
  }

  function evaluateModule (filename, sandbox, evaluatedFiles) {
    var script = getCompiledScript(filename);
    var compiledWrapper = runInNewContext === false
      ? script.runInThisContext()
      : script.runInNewContext(sandbox);
    var m = { exports: {}};

    // rewrite require to load file in new context
    var r = function (file) {
      if (files[file]) {
        return evaluateModule(file, sandbox, evaluatedFiles)
      }else {
        return require(file)
      }
    };
    compiledWrapper.call(m.exports, m.exports, r, m);

    var res = Object.prototype.hasOwnProperty.call(m.exports, 'default')
      ? m.exports.default
      : m.exports;
    return res
  }
  return evaluateModule
}

function createBundleRunner (entry, files, basedir, runInNewContext) {
    var evaluate = compileModule(files, basedir, runInNewContext)


    if (runInNewContext !== false && runInNewContext !== 'once') {
        return function (userContext) {
            return new Promise(function (resolve) {
                var res = evaluate(entry, createSandbox(userContext));
                resolve(typeof res === 'function' ? res(userContext) : res);
            });
        }
    }else{
        var runner; 
        //cache runner so do not nead to load file when runInNewContext is false or once in production which has better performance than runInNewContext=true
        return function (userContext) {
            return new Promise(function (resolve) {
                if (!runner) {
                  runner = evaluate(entry, sandbox);
                }
                resolve(runner(userContext));
            })
        }
    }
}

function createBundleRenderer (
    bundle, //(used webpack generated server manifest object)
    rendererOptions
  ){
    /**
     * type entry = string(filename)
     * interface files = {[string(key):string]: string(source-code)}
     * 
     * 如果是远程CDN拉取打包好的组件源码，想要在本地进行 SSR，是否可以直接构造一个 bundle manifest出来？
     * 
    */

    let run = createBundleRunner(entry,files,basedir,rendererOptions.runInNewContext) 
    return {
        renderToString(context){
            run(context).then()
        },
        renderToStream(context){
            run(context).then()
        }
    }

  }
```

### reference

* [node vm](https://nodejs.org/api/vm.html)
* [node module](https://nodejs.org/api/modules.html#modules_the_module_wrapper)
* [node require解析](https://segmentfault.com/a/1190000008587112)
* [vue ssr in depth](https://harttle.land/2020/02/10/deep-into-vue-ssr.html)
* [vue ssr in depth2](https://zhuanlan.zhihu.com/p/61348429)
