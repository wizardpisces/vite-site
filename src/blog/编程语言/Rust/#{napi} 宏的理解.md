下面是之前手写的简化实现版本，并为其添加了详细注释，帮助理解各部分的功能和逻辑：

```rust
use napi::sys::*; // 引入 N-API 的低级别 FFI 接口
use napi::{Env, Result}; // 引入高层抽象的环境和结果类型

// 必须导出这个函数，让 Node.js 在加载模块时找到入口点
#[no_mangle] // 防止编译器修改函数名
pub unsafe extern "C" fn napi_register_module_v1(
    env: napi_env,    // N-API 提供的环境上下文，代表当前模块的状态
    exports: napi_value, // exports 是 Node.js 模块导出对象
) -> napi_value {
    // 使用 N-API 提供的工具函数注册模块和导出函数
    napi::register_module(env, exports, |env, exports| {
        // 创建一个 N-API 函数对象并绑定到 `sum`
        let sum_fn = napi::bindgen_prelude::create_function(
            env,    // N-API 环境
            "sum",  // 函数的名称
            Some(sum), // 函数的实现
        )?;
        
        // 将创建的函数绑定到模块导出对象上，供 JavaScript 调用
        napi::bindgen_prelude::set_named_property(env, exports, "sum", sum_fn)?;

        Ok(exports) // 返回导出对象，Node.js 会加载此模块
    })
}

// 具体实现的函数逻辑
unsafe extern "C" fn sum(env: napi_env, info: napi_callback_info) -> napi_value {
    // 获取调用时传递的参数（期望两个参数 a 和 b）
    let args = napi::bindgen_prelude::get_args(env, info, 2)?;

    // 从参数中提取整数值
    let a: i32 = args[0].get()?; // 获取第一个参数并转换为 i32
    let b: i32 = args[1].get()?; // 获取第二个参数并转换为 i32

    // 计算结果并返回一个新的 JavaScript 数值对象
    napi::bindgen_prelude::create_int32(env, a + b)
}
```

---

### **逐步拆解注释说明**

#### **1. 模块入口点 (`napi_register_module_v1`)**

- 这是 Rust 编写的 N-API 模块的入口点。  
- Node.js 在加载 `.node` 文件时，会查找并调用这个函数。

关键参数：
- `env`：当前 N-API 的上下文，保存模块运行时的状态。
- `exports`：代表模块的导出对象，相当于 Node.js 中的 `module.exports`。

函数作用：
- 注册模块的所有导出方法，并将它们绑定到 `exports`。

---

#### **2. 注册函数 (`create_function`)**

- 这个部分通过 `napi::bindgen_prelude::create_function` 创建一个符合 N-API 标准的函数。
- `create_function` 的关键参数：
  - `env`：N-API 环境上下文。
  - `"sum"`：JavaScript 中函数的名字。
  - `Some(sum)`：指向 Rust 中实际的函数实现。

---

#### **3. 函数实现 (`sum`)**

这是具体的 Rust 函数逻辑，通过 FFI 暴露给 Node.js 调用。

- 参数解析：
  - 使用 `napi::bindgen_prelude::get_args` 获取传递给函数的参数，期望两个参数。
  - 每个参数需要用 `.get()` 解析并转换为 Rust 类型。

- 结果处理：
  - 计算两个整数的和。
  - 使用 `napi::bindgen_prelude::create_int32` 创建一个 JavaScript 的数值对象，将结果返回给调用者。

---

### **调用链的工作流程**

1. Node.js 加载 `.node` 文件时，调用 `napi_register_module_v1`。
2. `napi_register_module_v1` 使用 `create_function` 创建函数并将其绑定到模块的导出对象。
3. 在 JavaScript 中调用 `sum`，会触发 `sum` 函数的执行：
   - 获取参数。
   - 调用 Rust 函数。
   - 将结果转换为 JavaScript 类型并返回。

---

### **优缺点对比**

- **优点：**
  - 直接操作 N-API，可以完全控制模块行为。
  - 适用于需要手动优化性能或有特殊需求的场景。

- **缺点：**
  - 编写 N-API 代码繁琐且容易出错。
  - 需要处理参数解析、类型转换、错误管理等大量细节。
  - 难以维护，代码量大。

---

### **总结**

手写实现展示了 Rust 和 Node.js 交互的基础，但在实际项目中，推荐使用类似 `#[napi]` 宏来简化开发。属性宏会自动生成上述复杂逻辑，让开发者专注于核心功能。

## 参考资料

- gpt