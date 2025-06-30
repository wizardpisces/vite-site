# JsBridge引发的思考

RN跟微信小程序算是JsBridge最经典的实践

## 疑问
1. 为什么js能够调用android或者IOS系统的方法？
2. 不同语言之间如何做到相互调用？

## JsBridge原理
Web端和Native可以类比于Client/Server模式，Web端调用原生接口时就如同Client向Server端发送一个请求类似，JSB在此充当类似于HTTP协议的角色，实现JSBridge主要是两点：

* 将Native端原生接口封装成JavaScript接口
* 将Web端JavaScript接口封装成原生接口

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
#### 注入式（主流）
* 原理：通过 WebView 提供的接口向 JS 全局上下文对象（window）中注入对象或者方法，当 JS 调用时，可直接执行相应的 Native 代码逻辑，从而达到 Web 调用 Native 的目的。
>Native端
```java
// Android（4.2+）提供了addJavascriptInterface注入
// 注入全局JS对象
webView.addJavascriptInterface(new NativeBridge(this), "NativeBridge");

class NativeBridge {
  private Context ctx;
  NativeBridge(Context ctx) {
    this.ctx = ctx;
  }

  // 增加JS调用接口
  @JavascriptInterface
  public void showNativeDialog(String text) {
    new AlertDialog.Builder(ctx).setMessage(text).create().show();
  }
}
```
>web端
```js
window.NativeBridge.showNativeDialog('hello');
```
* 场景：各种系统API的直接调动（存储等）

* 兼容性：安卓4.2+ 和 iOS 7+以上可用
* 性能：较好

### 串联双端通信

[WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)
An iOS/OSX bridge for sending messages between Obj-C and JavaScript in UIWebViews/WebViews

### 如何处理安全问题

在 APP 内 JsBridge 可以实现 Web 和 Native 的通信，但是如果 APP 打开一个恶意的页面，页面可以任意调用 JsBridge 方法，获取各种隐私的数据，就会引起安全问题。

* 限定域名白名单，只允许指定域名调用

## JSI
RN 在0.59 版本使用JSI 取代了先前的JSBridge 。

React Native JSI (JavaScript Interface) 可以使 JavaScript 和 原生模块 更快、更简单的通信。它也是React Native 新的架构体系中Fabric UI层 和 Turbo 模块的核心部分。

### JSI有什么不同
JSI 移除了原生代码和JavaScript代码之间的桥接（bridge），同时也省去了两端相互调用时大量的JSON序列化和反序列化操作。JSI为原生和JS交互打开了新的大门。下面是一些JSI的特点：

* JavaScript Interface 允许我们向JavaScript 运行时注册方法。这些方法在js环境中可以通过 global对象获取并调用。
* 我们完全可以使用C++或者在iOS里使用OC ，在Android里使用Java实现这些注册方法。
* 原先使用bridge 的方式实现的原生模块可以通过增加一层C++，快速转化为通过JSI实现。
* 在iOS端实现非常简单，因为C++和OC 可以方便的实现混编。
* 在Android中，我们需要通过JNI 做一些转化。
* 这些方法可以是完全同步的，这意味着不必强制使用async。await。

## 其他角度分析

* Javascript的编译器V8是C++实现，C++编译器是C，所以Javascript的编译器是C语言实现
* Java编译器被编写为Java程序，然后使用C编写的Java编译器（第一个Java编译器）进行编译，所以Java的编译器是C语言实现
* Objective-C是一种通用、高级、面向对象的编程语言。它扩展了标准的ANSI C编程语言

其他：LLVM是构架编译器(compiler)的框架系统，以C++编写而成，所以编译的IR为LLVM的编程语言（例如Rust）是C语言实现

总结：这些高级语言底层都是C的衍生；API："C" 部分定义了外部函数所使用的 应用二进制接口（application binary interface，ABI） —— ABI 定义了如何在汇编语言层面调用此函数。"C" ABI 是最常见的，并遵循 C 编程语言的 ABI。

推导：
1. 这些语言能在编译层面互通，不同语言如果都实现C语言提供的bridge interface，那就能直接在代码编译后通信（API层面？）？Foreign_function_interface？

其他跨语言通信，例如协议（独立于语言层面的标准）：RPC等

## 应用
实现过一个[简单的SASS编译器](https://github.com/wizardpisces/tiny-sass-compiler)，使用js实现；所以可以在编译过程中协商注入js函数，实现后就是[plugin系统](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)，应用的[Demo代码](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/test/plugin/plugin.scss)

# Reference
* [tiny-sass-compiler Plugin](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)
* [React Native原理与实践](https://juejin.cn/post/6916452544956858382)
* [NativeScript的工作原理：用JavaScript调用原生API实现跨平台 ](https://blog.51cto.com/u_15047484/4605055)
* [React Native JSI：实现RN与原生通信](https://juejin.cn/post/6999432558366703630#heading-1)
* https://tsejx.github.io/cross-platform-guidebook/hybird/jsbridge/
* https://juejin.cn/post/6844903585268891662
* [Rust程序语言设计之不安全的Rust](https://kaisery.github.io/trpl-zh-cn/ch19-01-unsafe-rust.html?highlight=extern#%E8%B0%83%E7%94%A8%E4%B8%8D%E5%AE%89%E5%85%A8%E5%87%BD%E6%95%B0%E6%88%96%E6%96%B9%E6%B3%95)
* https://en.wikipedia.org/wiki/Foreign_function_interface
* https://blog.risingstack.com/how-to-use-rust-with-node-when-performance-matters/
* https://www.teqng.com/2021/08/01/jsbridge-%E5%8E%9F%E7%90%86%E4%B8%8E%E5%AE%9E%E8%B7%B5/#JSB_yuan_li

***本文属于个人的见解，酌情观看***