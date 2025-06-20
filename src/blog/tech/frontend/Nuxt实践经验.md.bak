---
title: Nuxt实践经验
description: 执行过程，缓存，压测，内存分析
---
## nuxt JS
### 一个请求到服务端后发生的
执行顺序 1-1-2-3

koa里面
1. server koa middleware

nuxt.render里面
1. connect middleware
2. load and execute vue plugins
3. load and execute vue router middleware

[官方链接](https://nuxtjs.org/guide#schema)

## Node 缓存方案对比
Redis vs Simple Memory

### [Redis]:

pros:
1. 外部缓存，保证数据一致性
2. 支持的数据类型足够多

cons:

1. 复杂
2. 异步
3. 重启的时候不会清空缓存（会导致预期的改动效果没法立即展现在用户面前），需要做手动处理
4. 整体的运行配置会比较多
5. 不过存储不了 Promise

### [Simple Memory]:

props:

1. 简单
2. 同步
3. 重启后数据重置
能存储 Promise 等 Node自带对象结构，增加了灵活性（现阶段已经使用在axios的接口adapter promise缓存上）

cons:

1. 分布式数据不一致

### Redis 本地可视化测试
```bash
npm install -g redis-commander
redis-commander
```
### 结论：
目前先使用memory（node-cache）做缓存，后面遇到对一致性要求比较强的需求(比如：抢购会启动几十到几百个实例，缺少一致性会影响到缓存效果)时，再改为redis（note : Redis cache is an external cache and is not reset when redeploy application）
