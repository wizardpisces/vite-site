---
title: Source-Map原理及其应用
description: 原理及其应用
---
## 什么是 source-map?

### 广义解释：
溯源

### 前端开发
“A source map provides a way of mapping code within a compressed file back to it’s original position in a source file”

##### V3 spec example:
```json
{
    version : 3,
    file: "out.js",
    sourceRoot : "",
    sources: ["foo.js", "bar.js"],
    names: ["src", "maps", "are", "fun"],
    mappings: "AAgBC,SAAQ,CAAEA"
}
```

## 为什么使用 source-map?(debug)

前端模块打包发布基本流程：

Modules -> compilers -> assets

代码转换类型：
* 编译（TypeScript)
* 转译（Babel）
* 压缩混淆（UglifyJS）
* 合并多个文件，减少带宽请求。(Webpack, Rollup)

1. dev 环境如何定位调试？
2. 产线出错如何定位调试？

## source-map 如何映射

mappings: "输出文件列位置|输入文件名|输入文件行号|输入文件列号,....."


### 优化措施：

* 文件名提取
* 可符号化字符的提取
* 记录相对位置
* VLQ编码

[详细参考](https://juejin.im/post/6844903869928079373)

## souce-map 生成基本步骤

1) Transform code and note the new generated source location

2) Check for a difference in location between the original and generated code

3) Using these mapping build a source map

[具体参照这里](https://indepth.dev/source-maps-from-top-to-bottom/)

## source-map 映射可视化

[online source-map visualization](https://sokra.github.io/source-map-visualization/#sass)

## source-map test case 写法

[一种写法](https://github.com/wizardpisces/tiny-sass-compiler/blob/master/src/__tests__/compile.spec.ts)

## 参考资料

1. https://indepth.dev/source-maps-from-top-to-bottom/
2. https://juejin.im/post/6844903869928079373
3. https://www.npmjs.com/package/source-map
4. https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
