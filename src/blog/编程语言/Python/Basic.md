## Python 类型

Python 类型与 Typescript 类型区别？

* python 类型检测是可选的，不会强制执行类型注解，也不会影响代码的运行。typescript 类型检测是强制的，会在编译阶段报错或警告。
* python 类型检测是基于 PEP 提案和 typing 模块实现的，而 typescript 类型检测是基于 ECMAScript 标准和 typescript 编译器实现的。
* python 类型检测支持鸭子类型（duck typing），即只关心对象的行为而不是对象的类型。typescript 类型检测支持结构类型（structural typing），即只关心对象的结构而不是对象的名称。
* python 类型检测支持泛型编程（generic programming），即可以定义泛型类型和函数。

Pylance 是一个 Python 语言服务器，它可以为 VS Code 提供快速且功能丰富的语言支持。Pylance 有一个 python.analysis.typeCheckingMode 的设置，可以让你选择 basic 或 strict 模式来进行类型检查。


## 基础用法

* 数组广播

```python
import numpy as np
# 创建一个二维数组
M = np.array([[0, 1, 2],
              [3, 4, 5],
              [6, 7, 8]])
# 创建一个一维数组
a = np.array([10, 20, 30])
# 使用广播进行加法运算
M + a # 相当于 M + a[np.newaxis, :]
# array([[10, 21, 32],
#        [13, 24, 35],
#        [16, 27, 38]])
# 使用广播进行乘法运算
M * a # 相当于 M * a[:, np.newaxis]
# array([[  0,  20,  60],
#        [ 30,  80, 150],
#        [ 60, 140, 240]])
```

* 列表推导式
语法格式：[表达式 for 迭代变量 in 可迭代对象 [if 条件表达式]]

```python
a_range = range(10) # 对a_range执行for表达式
a_list = [ x * x for x in a_range] # a_list集合包含10个元素
print( a_list) # 输出： [0 , 1 , 4 , 9 , 16 , 25 , 36 , 49 , 64, 81]

b_list = [ x * x for x in a_range if x % 2 == 0] # a_list集合包含5个元素
print( b_list) # 输出： [0 ,4 , 16, 36, 64]

d_list = [ ( x, y) for x in range(5) for y in range(4)] # d_list列表包含20个元素
print( d_list) # 输出： [ (0, 0), (0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (1, 2), (1, 3), (2, 0), (2, 1), (2, 2), (2, 3), (3, 0), (3, 1), (3, 2), (3, 3), (4, 0), (4, 1), (4, 2), (4, 3)]
```

* 元组拆包

```python
a, b, c = (1, 2, 3) # 将元组中的三个元素分别赋值给a, b, c
print(a, b, c) # 1 2 3
x, y = 1, 2 # 将两个数值分别赋值给x, y
print(x, y) # 1 2

a, *b = (1, 2, 3, 4) # 将第一个元素赋值给a，剩下的元素转换成列表赋值给b
print(a, b) # 1 [2, 3, 4]
*a, b = (1, 2, 3, 4) # 将最后一个元素赋值给b，剩下的元素转换成列表赋值给a
print(a, b) # [1, 2, 3] 4

nums = [1, 2, 3]
nums1 = [4, 5]
total = [*nums, *nums1] # 将两个列表中的元素拼接成一个新的列表
print(total) # [1, 2, 3, 4 ,5]
dict1 = {'a': 1, 'b': 2}
dict2 = {'c': 3}
total_dict = {**dict1, **dict2} # 将两个字典中的键值对拼接成一个新的字典
print(total_dict) # {'a': 1, 'b': 2 , 'c': 3}
```
* Python 的 ThreadPoolExecutor 和 threading 模块实现的并发区别

* ThreadPoolExecutor 是一个高级的接口，它可以让你轻松地创建和管理一个线程池，而不需要自己创建和管理 threading.Thread 对象。
* ThreadPoolExecutor 提供了两种方法来提交任务给线程池：map 和 submit。map 方法可以让你对一个可迭代对象中的每个元素应用一个函数，并返回一个结果的迭代器。submit 方法可以让你提交一个函数和它的参数，并返回一个 Future 对象，用于查询任务的状态和结果。
* ThreadPoolExecutor 可以自动处理线程的创建、启动、回收和异常处理，而 threading.Thread 需要你自己处理这些细节。
* ThreadPoolExecutor 可以使用上下文管理器（with 语句）来简化线程池的创建和关闭，而 threading.Thread 需要你手动调用 start 和 join 方法。

综上所述，ThreadPoolExecutor 比 threading.Thread 更方便、更简洁、更安全地实现并发。

***Mainly reference GPT***
