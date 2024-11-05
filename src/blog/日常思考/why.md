

# 为什么 mac 不再使用 CUDA？
核心原因：符合 Apple 的封闭生态技术路线，转向 Metal 让 Apple 能更好地优化自己的硬件与软件系统，而不依赖外部技术。

# 为什么 jest 需要 watchman？
* 原因：因为 jest 需要监听文件变化，而 watchman 是文件系统监听工具，更适合大型项目（所以 watchman 得崩溃可能会导致 jest 无法正常工作）
* watchman 的启动 ：在第一次 run jest 时，会启动 watchman 持续监听文件变化
* watch 范围：历史启动过 jest 的目录都会纳入到 watchman 的监听范围，在 MAC 的活动监视器找到 watchman 打开的文件或者窗口看到

# 为什么 git 有了分支还需要 tag？
* 分支：一个指向提交的可变指针，随着你在分支上提交新的更改，分支会自动向前移动。这意味着分支是动态的、可变的，它们通常代表开发进度，例如 master、develop、feature/xyz 等分支名。
* 标签：一个指向特定提交的不可变的指针。标签通常用于标记代码的特定状态，比如一个版本发布（v1.0.0），而这个标签一旦打上，它就永久指向那个特定的提交，不会随时间变化。

# Trace ID 三段 代表啥？
* e9e976fde12bc6745f1c51fa80652d01:000000788c34c719:0000000000000000
* 第一段全局唯一 Trace ID
* 第二段：spanId
* 第三段：parentSpanId