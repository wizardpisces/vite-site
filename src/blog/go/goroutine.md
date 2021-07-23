---
title: Go 简介
description: 
---
# Goroutine
Goroutine 可以看作对 thread 加的一层抽象，它更轻量级，可以单独执行。因为有了这层抽象，Gopher 不会直接面对 thread。

## Goroutine vs threads 

### 内存占用

1. 创建一个 goroutine 的栈内存消耗为 2 KB，实际运行过程中，如果栈空间不够用，会自动进行扩容。创建一个 thread 则需要消耗 1 MB 栈内存，而且还需要一个被称为 “a guard page” 的区域用于和其他 thread 的栈空间进行隔离。
2. 对于一个用 Go 构建的 HTTP Server 而言，对到来的每个请求，创建一个 goroutine 用来处理是非常轻松的一件事。而如果用一个使用线程作为并发原语的语言构建的服务，例如 Java 来说，每个请求对应一个线程则太浪费资源了，很快就会出 OOM 错误（OutOfMermoryError）。

### 创建和销毀

1. Thread 创建和销毀都会有巨大的消耗，因为要和操作系统打交道，是内核级的，通常解决的办法就是线程池。
2. 而 goroutine 因为是由 Go runtime 负责管理的，创建和销毁的消耗非常小，是用户级。

### 切换

1. 当 threads 切换时，需要保存各种寄存器，以便将来恢复：
一般而言，线程切换会消耗 1000-1500 纳秒，一个纳秒平均可以执行 12-18 条指令。所以由于线程切换，执行指令的条数会减少 12000-18000。
2. Goroutine 的切换约为 200 ns，相当于 2400-3600 条指令。
因此，goroutines 切换成本比 threads 要小得多。

## scheduler (M:N模型)

Go runtime 会负责 goroutine 的生老病死，从创建到销毁，都一手包办。
Runtime 会在程序启动的时候，创建 M 个线程（CPU 执行调度的单位），之后创建的 N 个 goroutine 都会依附在这 M 个线程上执行。这就是 M:N 模型

### 什么是scheduler？
![scheduler-concepts](https://rakyll.org/img/scheduler-concepts.png)

### scheduler时机

1. 使用关键字 go
    * go创建一个新的 goroutine
2. GC
    * GC 需要在M 上进行所以会调度
3. 系统调用
4. 内存同步访问
    * atomic, mutex, channel 等操作

## 例子

[go的例子](https://github.com/wizardpisces/vite-site/tree/master/examples/go)

## Reference

* https://golangbot.com/goroutines/
* https://rakyll.org/scheduler/
* https://blog.nindalf.com/posts/how-goroutines-work/
* https://speakerdeck.com/retervision/go-runtime-scheduler?slide=27
* https://povilasv.me/go-scheduler/#
* https://morsmachine.dk/netpoller
* https://morsmachine.dk/go-scheduler
* https://golangbot.com/structs-instead-of-classes/
* https://zhuanlan.zhihu.com/p/80853548


