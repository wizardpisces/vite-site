## rust 与 c 的调用
Rust 能与 C 交互的原因在于它和 C 都可以遵循 C ABI（Application Binary Interface，应用二进制接口）。C ABI 是一种语言无关的标准，规定了函数调用、参数传递、内存对齐等机制，确保不同语言生成的二进制代码能够互操作。

---

### **C ABI 的作用**

C ABI 定义了一种“规则”，让不同的编程语言按照统一的方式调用函数或传递数据。  
就好比语言之间的“翻译协议”，只要两边都遵循同样的协议，就能互相理解。

---

### **一个超简单的例子：让 Rust 调用 C 函数**

我们先写一个 C 函数，然后用 Rust 调用它。

**第一步：写 C 的代码**
```c
// 文件名：example.c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}
```

然后我们用 `gcc` 把这个 C 文件编译成一个共享库（比如 `libexample.so` 或 `example.dll`）：
```bash
gcc -shared -o libexample.so example.c
```

**第二步：写 Rust 的代码调用这个 C 函数**
```rust
extern "C" {
    fn add(a: i32, b: i32) -> i32; // 告诉 Rust 这个函数来自 C
}

fn main() {
    unsafe {
        let result = add(3, 4); // 调用 C 的 add 函数
        println!("3 + 4 = {}", result); // 输出：3 + 4 = 7
    }
}
```

**运行步骤：**
1. 用 Rust 编译运行这个文件时，告诉它要链接 `libexample.so`（动态库）：
   ```bash
   rustc main.rs -L . -l example
   ./main
   ```
   输出结果为：`3 + 4 = 7`。

---

### **拆解这个过程**

1. **C 编译器的作用**：
   - C 编译器把 `add` 函数编译成机器码，并存到共享库里（`libexample.so`）。
   - 这个共享库对外暴露了函数 `add` 的地址和调用方式。

2. **Rust 的作用**：
   - Rust 通过 `extern "C"` 语法，告诉编译器：我想调用一个遵循 C ABI 的函数。
   - Rust 的编译器会在运行时找到这个共享库，并调用 `add` 函数。

3. **C ABI 的作用**：
   - 确保函数的参数和返回值按约定的方式传递。比如：
     - 参数 `a` 和 `b` 被放在固定的寄存器里（或者栈上）。
     - 返回值被放在另一个固定位置。

---

### **反过来：让 C 调用 Rust 函数**

这次我们写一个 Rust 函数给 C 调用。

**第一步：写 Rust 的代码**
```rust
#[no_mangle] // 禁止编译器修改函数名
pub extern "C" fn multiply(a: i32, b: i32) -> i32 {
    a * b
}
```

然后编译成共享库：
```bash
rustc --crate-type=cdylib -o libmylib.so mylib.rs
```

**第二步：写 C 的代码调用这个 Rust 函数**
```c
#include <stdio.h>

extern int multiply(int a, int b); // 声明 Rust 的函数

int main() {
    int result = multiply(3, 4); // 调用 Rust 的 multiply 函数
    printf("3 * 4 = %d\n", result); // 输出：3 * 4 = 12
    return 0;
}
```

**运行步骤：**
1. 编译 C 代码并链接 Rust 的共享库：
   ```bash
   gcc -o main main.c -L . -lmylib
   ./main
   ```
   输出结果为：`3 * 4 = 12`。

---

### **总结：为什么能交互？**

1. **Rust 并不是依赖 C，而是遵循 C 的规则（C ABI）。**
   - `extern "C"` 关键字就是告诉 Rust 编译器，函数调用要遵循 C 的规则。
   - C ABI 是一个约定，规定了参数和返回值怎么传递、内存怎么对齐等。

2. **Rust 和 C 是“直接用机器语言对话”的，不需要翻译成 C 代码。**
   - Rust 和 C 的交互只发生在编译后的机器代码层。
   - Rust 编译后的共享库（`libmylib.so`）和 C 编译的可执行程序用相同的协议调用函数。

3. **Rust 通过 FFI 提供了跟其他语言交互的能力：**
   - 只要其他语言也遵循 C ABI，比如 Python 的 `ctypes` 或 JavaScript 的 `N-API`，它们都能和 Rust 互操作。

这个例子可以看出，C 和 Rust 的交互是靠 ABI 约定，而不是中间语言或运行时的“翻译”。

---

## rust 与 js 的调用

**初步理解：napi-rs 将 rust 代码编译成了 N-API 协议能够识别的 .node 文件，所以  js 能够直接加载，如果是 rust 编译出的  .so 文件（遵循 C-ABI ） 则需要 C或者 C++ 编写胶水语言 做成符合 N-API 的 .node 文件，然后 才可以被 js 调用？基于 N-API：注重 跨平台性 和 稳定性，适合长期维护的项目。**

其他调用方式：
* rust -> .wasm（跨平台，可以 node 跟浏览器环境，比 .node 性能稍低） -> js
* neon （针对 v8 引擎，跳过 NAPI 抽象层，性能比 napi-rs 转换的代码更高效，但是可维护性也更差），基于 V8 深度绑定：追求 性能极致 和 灵活定制，适合对底层优化要求极高的项目。




---

### **1. 使用 N-API（如 `napi-rs`）编译出的 `.node` 文件**
- **关键点**：Rust 代码直接编译成符合 **N-API 标准** 的 `.node` 文件。
- **工作流程**：
  1. Rust 使用 `napi` 或 `napi-derive` 库，通过 N-API 暴露函数。
  2. `napi-rs` 在编译过程中自动生成符合 N-API 标准的动态库（`.node` 文件）。
  3. Node.js 加载这个 `.node` 文件，直接调用 Rust 的函数。

> **特点**：这一过程完全自动化，不需要手写 C/C++ 胶水代码。Rust 代码编译后直接可以被 Node.js 使用，开发体验优良。

---

### **2. 如果只有 Rust 编译出的 `.so` 文件**
- **关键点**：`.so` 文件是标准的 C ABI 动态库格式，JavaScript 环境（如 Node.js）本身不支持直接加载 C ABI 的库。
- **问题**：
  - JavaScript 和 `.so` 文件之间缺少直接的桥梁。
  - 需要手写胶水代码，用 C 或 C++ 把 `.so` 封装成 N-API 模块（`.node` 文件）。

#### **手写胶水代码的流程：**
1. **Rust 编译出 `.so` 文件**：
   - 使用 `cdylib` 类型的 `crate-type` 编译出 C ABI 动态库：
     ```bash
     rustc --crate-type=cdylib -o librust_code.so rust_code.rs
     ```

2. **用 C/C++ 编写 N-API 模块**：
   - 使用 C/C++ 代码封装 `.so` 文件的函数为 N-API 模块：
     ```cpp
     #include <napi.h>
     #include "librust_code.h" // Rust .so 的头文件

     Napi::Value Add(const Napi::CallbackInfo& info) {
         int a = info[0].As<Napi::Number>().Int32Value();
         int b = info[1].As<Napi::Number>().Int32Value();
         int result = add(a, b); // 调用 Rust 编译的 .so 函数
         return Napi::Number::New(info.Env(), result);
     }

     Napi::Object Init(Napi::Env env, Napi::Object exports) {
         exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
         return exports;
     }

     NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
     ```

3. **编译 C++ 胶水代码成 `.node` 文件**：
   - 使用 `node-gyp` 或其他工具链编译生成 `.node` 文件：
     ```bash
     node-gyp configure build
     ```

> **特点**：这一过程繁琐，需要编写和维护额外的 C/C++ 代码。

---

### **3. 两种方式对比**

| **特点**                  | **使用 `napi-rs`**                                      | **使用 `.so` + C/C++ 胶水代码**                      |
|--------------------------|--------------------------------------------------------|----------------------------------------------------|
| **开发效率**             | 高：无需手写胶水代码，Rust 直接编译成 `.node` 文件       | 低：需要手动编写 C/C++ 胶水代码封装 `.so` 文件      |
| **依赖性**               | 只需 `napi`，完全用 Rust 开发                            | Rust + C/C++，需要额外工具链                       |
| **可维护性**             | 高：Rust 和 Node.js 开发者可以直接维护                   | 低：Rust 和 C/C++ 开发需要协作                     |
| **适用场景**             | 适合绝大多数 Node.js 插件开发场景                       | 适合已有 `.so` 文件需要快速封装到 N-API 的场景      |
| **性能**                 | 性能优良，直接生成 N-API 模块                           | 性能同样优良，但手工编写代码可能增加维护成本        |

---

### **总结**

- 如果你的目标是为 Node.js 开发插件，使用 Rust 的 **N-API 工具链**（如 `napi-rs`）是最佳选择，它能让你直接生成 `.node` 文件，省去了手动编写 C/C++ 胶水代码的麻烦。
- 如果你手头已有 `.so` 文件（比如是用其他语言编写的库），需要编写 C/C++ 胶水代码将其封装成 `.node` 文件，才能被 Node.js 加载和使用。

最终，**N-API 是核心桥梁**，Rust 和 C/C++ 都是为了生成能符合 N-API 的模块。

## 参考资料
- gpt
