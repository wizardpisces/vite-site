# jsbridge引发的思考

RN跟微信小程序算是jsbridge最经典的实践

## 疑问
1. 为什么js能够调用android或者IOS系统的方法？
2. 不同语言之间如何做到相互调用？

## 尝试分析

* Javascript的编译器V8是C++实现，C++编译器是C，所以Javascript的编译器是C语言实现
* Java编译器被编写为Java程序，然后使用C编写的Java编译器（第一个Java编译器）进行编译，所以Java的编译器是C语言实现
* Objective-C是一种通用、高级、面向对象的编程语言。它扩展了标准的ANSI C编程语言

其他：LLVM是构架编译器(compiler)的框架系统，以C++编写而成，所以编译的IR为LLVM的编程语言（例如Rust）是C语言实现

总结：这些高级语言底层都是C的衍生

推导：
1. 这些语言能在编译层面互通？不同语言如果都实现C语言提供的bridge interface，那就能直接在代码编译后通信（API层面？）？Foreign_function_interface？
2. 所有语言都能在

其他跨语言通信，例如协议（独立于语言层面的标准）：RPC等

## 尝试解答

### Native调用JS
* 原理：直接用JS引擎执行（IOS的 WebView 容器采用 WKWebView 内核+JavascriptCore引擎 etc）
* 场景：Native input绑定 Native 事件，在事件代码里通过调用js将结果反应到 Webview

### JS调用Native方式
#### 拦截式

标准的URL格式：```<scheme>://<host>:<port><path>```，APP有专属的Scheme，eg：微信的 URL Scheme 就是 weixin://

* 原理：Native拦截 Webview Sheme 请求，分析是否为JSB请求格式
* 场景：Webview按钮打开Native相册，构造Scheme并发送，传递特定参数给Native去唤起相册；或者执行某些函数获取值后，再次通过执行js把结果返回给webview实现闭环通信
* 兼容性：无兼容性问题
* 性能：URL request 创建请求有一定的耗时（一般通过webview创建iframe方式发送），Android比较差
* 局限：URL 字符串长度有限制
#### 注入式
* 原理：通过 WebView 提供的接口向 JS 全局上下文对象（window）中注入对象或者方法，当 JS 调用时，可直接执行相应的 Native 代码逻辑，从而达到 Web 调用 Native 的目的。
```js
JSContext *context = [webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];

context[@"getAppInfo"] = ^(msg) {
    return @"ggl_2693";
};
window.getAppInfo(); // 'ggl_2693'

```
* 场景：各种系统API的直接调动（存储等）

* 兼容性：安卓4.2+ 和 iOS 7+以上可用
* 性能：较好

### 串联双端通信

[WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)
An iOS/OSX bridge for sending messages between Obj-C and JavaScript in UIWebViews/WebViews

## 应用
实现过一个[简单的SASS编译器](https://github.com/wizardpisces/tiny-sass-compiler)，使用js实现；所以可以在编译过程中协商注入js函数，实现后就是[plugin系统](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)，应用的[Demo代码](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/test/plugin/plugin.scss)

# Reference
* [tiny-sass-compiler Plugin](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)
* [React Native原理与实践](https://juejin.cn/post/6916452544956858382)
* [NativeScript的工作原理：用JavaScript调用原生API实现跨平台 ](https://blog.51cto.com/u_15047484/4605055)
* https://en.wikipedia.org/wiki/Foreign_function_interface
* https://blog.risingstack.com/how-to-use-rust-with-node-when-performance-matters/
* https://www.teqng.com/2021/08/01/jsbridge-%E5%8E%9F%E7%90%86%E4%B8%8E%E5%AE%9E%E8%B7%B5/#JSB_yuan_li

***本文属于个人的见解，酌情观看***