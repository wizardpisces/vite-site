---
title: Profile
---

## 性能分析

最近通过 alinode 的CPU火焰图找出了项目中吞吐率阻塞点，简单分享

* profile的原理？
* 如何对profile结果做可视化？
* 火焰图如何分析？
* 如何development/production进行profile

## 浏览器Profiler简介
Chrome profiler 为了找到那些耗时最多的代码，Chrome 分析器每 100μs 捕获一个堆栈跟踪。

这意味着，如果一个函数只需要 50μs 的执行时间，就可能不会在分析器中显示出来！

当你分析几毫秒以上的时间时，可以准确了解应用程序在何时花费最多的时间。 但是，当你放大 profiler 面板想看更精准的时间时，信息会变得不太准确。

分析器也会不一致。 每次运行时，会产生一个稍微不同的结果。 有时可能会记录非常短的函数调用，而在其他时间再次运行这些函数调用信息可能会丢失。

### performance

* Scripting
* Rendering
* Painting
* Other
* Idle
```
Rendering events are about computing styles associated with each DOM node (i.e. "Style Recalculate") and elements position on the page ("Layout"). Paint category is about actually painting pixels and includes events like "Paint" itself and "Decode Image" / "Resize Image".
```
### javascript-profiler

* CPU Profiles

## cpu profile种类

### 采样 Sampling
基于对StackTrace的“采样”进行实现，在一时间段内（至少得5min保证样本数足够多）对堆栈做快照采样

* 优点: 
>简单，源代码侵入性不大

* 劣势: 
>采样数据主要体现在调用次数上，对CPU的占有时间不够精准

* 要求：
>1. 样本必须足够多。
>2. 程序中所有正在运行的代码点都必须以相同的概率被Profiler采样。
>>JVM 只能在[safepoint](https://www.jianshu.com/p/c79c5e02ebe6)采样,是否就违背了第二条原则？最终导致profile不太准

* 适合场景
>Sampling由于低开销的特性，更适合用在CPU密集型的应用中，以及不可接受大量性能开销的线上服务中。
>也是一般Profiler的实现机制，典型的就是alinode

### Instrumentation 

Instrumentation方式对几乎所有方法添加了额外的AOP（Aspect Oriented Programming 中文翻译为面向切面编程）逻辑，这会导致对线上服务造成巨额的性能影响
这个有点像函数埋点

* 优点
>绝对精准的方法调用次数、调用时间统计。

* 缺点
>性能消耗比较大，侵入性也比较高

* 适合场景
>Instrumentation则更适合用在I/O密集的应用中、对性能开销不敏感以及确实需要精确统计的场景中。

## 火焰图

火焰图统计的是次数，所以属于CPU采样类型

[火焰图svg](https://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)

### 火焰图含义

* sampling
>y 轴表示调用栈，每一层都是一个函数。调用栈越深，火焰就越高，顶部就是正在执行的函数，下方都是它的父函数。
>x 轴表示抽样数，如果一个函数在 x 轴占据的宽度越宽，就表示它被抽到的次数多，即执行的时间长。注意，x 轴不代表时间，而是所有的调用栈合并后，按字母顺序排列的。

**火焰图就是看顶层的哪个函数占据的宽度最大。只要有"平顶"（plateaus），就表示该函数可能存在性能问题。**

### 火焰图示例
```
func_c 
func_b 
func_a 
start_thread 

func_d 
func_a 
start_thread 

func_d
func_a 
start_thread
```
上面代码中，start_thread是启动线程，调用了func_a。后者又调用了func_b和func_d，而func_b又调用了func_c。
合并后
```js
start_thread;func_a;func_b;func_c 1 
start_thread;func_a;func_d 2
```
有了这个调用栈，[统计工具](https://github.com/brendangregg/FlameGraph)就能生成对应的图，灵魂火焰图
```
              |-func_c-|
|-func_d------|-func_b-|
|-func_a---------------|
|-start_thread---------|
```
<!-- 
| func_c | a |
| --- | --- |
| func_d | func_b |
| func_a | a |
| start_thread | a | -->

## Profile实践

### 开发测试阶段
目前v8-profiler在 node12的时候安装构建失败，node12版本自带的[node-gyp](http://nodejs.cn/api/addons/building.html)build不成功；
替代方案是选用 v8-profiler-next，步骤：
1. npm i -D v8-profiler-next
2. 参照v8-profiler-next文档，在dev启动5分钟左右
3. 压测（例如：autocannon -c 10 -d 300 -p 1 http://localhost:8080）
4. 导出结果到chrome就可以看到具体的 cpu占用情况

在chrome 调试工具里找到 Javascript Profiler即可导入 xx.cpuprofile 文件进行分析，有百分比跟倒立火焰图

### 产线

目前alinode用起来还比较流畅，如果使用的是Docker部署，可以走以下流畅
1. 直接使用alinode镜像构建自己的dockerfile **（为了降低Docker镜像的大小，node12 对应的alinode版本看起来基于alpine linux，所以有些需要注意，例如apt需要替换apk）**
2. 按照官方文档创建 app-config.json 文件
```json
{
    "appid": "xxxx",
    "secret": "xxx",
    "packages": [
        "docker里面的packge.json路径" // eg: /app/package.json
    ]
}
```
3. 部署上线，然后进行 cpu在线Profile，转储后在线分析（支持火焰图跟dev tool模式）

感兴趣的可以参考[这里](https://zhuanlan.zhihu.com/p/72729044)

### Demo
1. 跳转到 Test 路由
2. 点击 cpu-profiling
3. 打开console，点击Javascript Profiler，点击record，6秒后点击stop
4. 点击 cpu-profiling

## Reference

* https://github.com/brendangregg/FlameGraph
* https://nodesource.com/blog/diagnostics-in-NodeJS-2
* https://www.ruanyifeng.com/blog/2017/09/flame-graph.html
* https://tech.meituan.com/2019/10/10/jvm-cpu-profiler.html
* https://www.jianshu.com/p/c79c5e02ebe6

<u>2021-7-28</u>