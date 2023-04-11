## GPT 是什么？

* gpt是一种基于深度学习的自然语言生成模型

GPT的全称是Generative Pre-trained Transformer，意思是生成式预训练转换器。
* 它是一种基于互联网可用数据训练的文本生成深度学习模型，由OpenAI开发和发布。
* 它使用了Transformer这种基于注意力机制的神经网络架构，可以有效地捕捉文本的长距离依赖和双向语境信息。
* 它也使用了预训练的方法，即先在大量的无标注文本上训练一个通用的语言模型，然后再根据不同的任务进行微调或适配。这种方法可以提高模型的泛化能力和生成质量，同时减少数据和计算资源的需求。

GPT这么叫是因为它是一个生成式的模型，即可以根据给定的一些信息，比如一个标题、一个话题、一个开头等，来自动写出一篇文章。它也是一个预训练的模型，即在训练之前已经学习了很多别人写过的文章，从而获得了丰富的语言知识和表达能力。它还是一个转换器，即使用了Transformer这种神经网络架构，可以有效地处理文本序列。

一个自然语言生成模型的例子是ChatGPT，它是一个基于GPT-3模型的对话系统，可以与用户进行自然和有趣的聊天。ChatGPT使用了Reddit的对话数据进行预训练，然后使用了一些技巧来提高生成的多样性和一致性。

## GPT 与编码 - TDD（Test-Driven Development）

### 改变需求开发流程

GPT 辅助前：需求 -> 代码编写 -> test-case

GPT 辅助后：
1. （以下讨论点） 需求 -> test-case -> 代码生成 -> test-case补充生成
2. 需求 -> GPT方式描述 -> 代码生成 -> test-case 生成

### 例子

#### 需求描述

实现一个fn 函数，接受一个数字作为参数，并返回一个数字作为结果。
fn 函数需要满足以下条件
当参数为 0 时，返回 0
当参数为 1 时，返回 1


**对应测试用例**

```javascript
function test0(fn) {
    if (fn(0) === 0 && fn(1) === 1) {
        return true
    }
    return false
}
```

问：生成 fn 函数满足以下测试用例： 
```javascript
function test0(fn) { 
  if (fn(0) === 0 && fn(1) === 1) {
     return true 
  } 
  return false
}
```

答：我可以尝试生成一个 fn 函数满足你的测试用例。请看我的代码：
```javascript
function fn(x) {
    // 如果 x 是 0 或 1，就返回 x
    if (x === 0 || x === 1) {
        return x
    }
    // 否则，就返回一个错误
    else {
        throw new Error("Invalid input")
    }
}
```

#### 需求变化
当参数为 2 时，也返回 1

* 目标：改变测试用例，输出抽象度更高的代码
* 结果：推导出 fibonaci

问：生成 fn 函数满足以下测试用例： 
```javascript
function test0(fn) { 
  if (fn(0) === 0 && fn(1) === 1 && fn(2) === 1) { 
    return true 
  } 
  return false 
}
```

答：fn 是一个函数的参数，它表示一个回调函数，也就是在 fn 函数内部执行的函数1。在 JavaScript 中，函数可以作为参数传递给另一个函数，也可以作为另一个函数的返回值2。这种函数称为高阶函数1。在您的测试用例中，fn 函数接受一个数字作为参数，并返回一个数字作为结果。要满足测试用例，fn 函数需要满足以下条件：

* 当参数为 0 时，返回 0
* 当参数为 1 或 2 时，返回 1
* 当参数大于 2 时，返回前两项的和

这样的函数其实就是斐波那契数列的定义。所以，一个可能的 fn 函数如下：
```javascript
function fn(n) {
  if (n < 0) {
    return null; // invalid input
  }
  if (n === 0) {
    return 0; // base case
  }
  if (n === 1 || n === 2) {
    return 1; // base case
  }
  return fn(n - 1) + fn(n - 2); // recursive case
}
```

* 概念：拟合 -> 泛化

>拟合（手段） -> 泛化（目标）；能拟合泛化目标的未必能适应新情况：
>>欠拟合（拟合结果无法满足旧的案例，例如：fn(2)!=1）
>>过拟合（拟合结果无法满足新案例，如果需求增加到 n=3，结果也要为 1）

#### 代码优化

问：你能不能给我一个更高效的 fn 函数？

答：有一些方法可以提高 fn 函数的效率，比如：

* 使用循环而不是递归，避免重复计算相同的值
* 使用数组或对象缓存已经计算过的值，避免重复计算相同的值
* 使用数学公式直接计算第 n 项的值，避免计算所有前面的值
例如，使用数组缓存的方法可以这样写：

```javascript
var fib = []; // 创建一个空数组
fib[0] = 0; // 初始化第 0 项为 0
fib[1] = 1; // 初始化第 1 项为 1
function fn(n) {
  if (n < 0) {
    return null; // 非法输入
  }
  if (fib[n] != null) {
    return fib [n]; // 如果已经缓存过，直接返回
  }
  fib[n] = fn(n - 1) + fn(n - 2); // 如果没有缓存过，递归计算并缓存
  return fib[n]; // 返回结果
}
```
#### 代码重构

问：请仿照 function fn(t:boolean){ return true} 重构 fn 函数

答：根据您的要求，我尝试重构 fn 函数如下：
```javascript
function fn(n: number): number {
  // 定义一个数组缓存
  const cache: number[] = [];
  cache[0] = 0; // 初始化第 0 项为 0
  cache[1] = 1; // 初始化第 1 项为 1

  // 定义一个辅助函数，用来递归计算斐波那契数
  function fib(n: number): number {
    if (n < 0) {
      return null; // 非法输入，返回 null
    }
    if (cache[n] != null) {
      return cache[n]; // 如果已经缓存过，直接返回
    }
    cache[n] = fib(n - 1) + fib(n - 2); // 如果没有缓存过，递归计算并缓存
    return cache[n]; // 返回结果
  }

  // 调用辅助函数，返回斐波那契数
  return fib(n);
}
```

#### 用例增强

问：麻烦给这个函数提供一个完整的测试用例
答：根据网上的信息，要给一个函数提供一个完整的测试用例，需要考虑以下几个方面：

- 测试函数的输入和输出是否符合预期
- 测试函数的边界条件和异常情况是否正确处理
- 测试函数的内部逻辑是否正确执行
- 测试函数的性能和效率是否达标

例如，使用 Jest 框架，可以给 fn 函数写以下测试用例：

```javascript
// 导入 fn 函数
import { fn } from './fn.js';

// 定义测试套件
describe('testing fn function', () => {

  // 测试正常输入和输出
  test('should return correct fibonacci number', () => {
    expect(fn(0)).toBe(0); // 第 0 项为 0
    expect(fn(1)).toBe(1); // 第 1 项为 1
    expect(fn(2)).toBe(1); // 第 2 项为 1
    expect(fn(3)).toBe(2); // 第 3 项为 2
    expect(fn(10)).toBe(55); // 第 10 项为 55
    expect(fn(20)).toBe(6765); // 第 20 项为 6765
  });

  // 测试边界条件和异常情况
  test('should handle invalid input', () => {
    expect(fn(-1)).toBe(null); // 负数输入无效，返回 null
    expect(fn('a')).toBeNaN(); // 非数字输入无效，返回 NaN
    expect(fn(Infinity)).toBe(Infinity); // 超大数输入无效，返回 Infinity
  });

  // 测试内部逻辑
  test('should use array cache', () => {
    // 模拟数组缓存
    const mockCache = [];
    mockCache[0] = 0;
    mockCache[1] = 1;
    mockCache[2] = 1;
    mockCache[3] = 2;
    mockCache[4] = 3;
    mockCache[5] = 5;

    // 断言 fn 函数使用了数组缓存
    expect(fn(5)).toEqual(mockCache[5]);
    expect(fn(4)).toEqual(mockCache[4]);
    expect(fn(3)).toEqual(mockCache[3]);
    expect(fn(2)).toEqual(mockCache[2]);
    expect(fn(1)).toEqual(mockCache[1]);
    expect(fn(0)).toEqual(mockCache[0]);
    
    // 断言 fn 函数没有重复计算相同的值
    const spyFn = jest.spyOn(global, 'fn');
    fn(6);
    expect(spyFn).toHaveBeenCalledTimes(2); // 只调用了两次 fn 函数，分别是 fn(6) 和 fn(5)
    
    // 恢复原始函数
    spyFn.mockRestore();
    
  });

});
```

## gpt有哪些应用场景和案例？

## gpt有哪些局限性和挑战？

## 总结和展望

***Mostly reference gpt***