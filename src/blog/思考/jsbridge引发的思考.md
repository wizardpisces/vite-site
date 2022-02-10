# jsbridge引发的思考

RN跟微信小程序算是jsbridge最经典的实践

## 疑问
1. 为什么js能够调用android或者IOS系统的方法？
2. 不同语言之间如何做到相互调用？

## 解答

* Javascript的编译器V8是C++实现，C++编译器是C，所以Javascript的编译器是C语言实现
* Java编译器被编写为Java程序，然后使用C编写的Java编译器（第一个Java编译器）进行编译，所以Java的编译器是C语言实现
* Objective-C是一种通用、高级、面向对象的编程语言。它扩展了标准的ANSI C编程语言

其他：LLVM是构架编译器(compiler)的框架系统，以C++编写而成，所以编译的IR为LLVM的编程语言（例如Rust）是C语言实现

总结：这些高级语言底层都是C的衍生

推论：
1. 这些语言能在编译层面互通？不同语言如果都实现C语言提供的bridge interface，那就能直接在代码编译后通信（API层面？）？
2. 所有语言都能在

其他跨语言通信，例如协议（独立于语言层面的标准）：rpc等

## 应用
实现过一个[简单的SASS编译器](https://github.com/wizardpisces/tiny-sass-compiler)，使用js实现；所以可以在编译过程中协商注入js函数，实现后就是[plugin系统](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)，应用的[Demo代码](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/test/plugin/plugin.scss)

# Reference
* [tiny-sass-compiler Plugin](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/transform.md)
* [React Native原理与实践](https://juejin.cn/post/6916452544956858382)
* [NativeScript的工作原理：用JavaScript调用原生API实现跨平台 ](https://blog.51cto.com/u_15047484/4605055)

***本文属于个人的见解，酌情观看***