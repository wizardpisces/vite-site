# napi 宏的理解

## 宏与 DSL

Rust 宏的核心之一是通过生成代码来简化重复任务，而 DSL（领域专用语言）则是在宏的帮助下，为特定领域问题设计的一种更易读、易用的语法。通过宏，可以把 Rust 的代码变得像定制的小语言一样，让开发者专注于问题本身，而不是细节的实现。

以下是几个示例，展示如何用 Rust 宏构建 DSL：

---

### 示例 1：构建简单的 HTML DSL
以下宏实现了一个简单的 HTML 构建器，用于生成 HTML 文本：

```rust
macro_rules! html {
    // 匹配空标签
    ($tag:ident) => {
        format!("<{}></{}>", stringify!($tag), stringify!($tag))
    };
    // 匹配带有文本内容的标签
    ($tag:ident, $content:expr) => {
        format!("<{}>{}</{}>", stringify!($tag), $content, stringify!($tag))
    };
    // 匹配带有嵌套标签的情况
    ($tag:ident, { $($inner:tt)* }) => {
        format!(
            "<{}>{}</{}>",
            stringify!($tag),
            html!($($inner)*),
            stringify!($tag)
        )
    };
    // 处理多个嵌套标签
    ($($inner:tt)*) => {
        vec![$(html!($inner)),*].join("")
    };
}

fn main() {
    let page = html!(
        html, {
            head, { title, "Example Page" }
            body, {
                h1, "Hello, World!"
                p, "This is an example of a DSL in Rust."
            }
        }
    );

    println!("{}", page);
}
```

**输出：**
```html
<html>
<head><title>Example Page</title></head>
<body><h1>Hello, World!</h1><p>This is an example of a DSL in Rust.</p></body>
</html>
```

**分析：**
- 这段代码通过宏 `html!` 提供了一个类似 HTML 的 DSL。
- 用户无需关心如何拼接字符串，只需描述 HTML 结构。
- 嵌套语法与 HTML 自然对应。

---

### 示例 2：构建命令行解析器 DSL
以下宏提供了一种简化命令行参数解析的 DSL：

```rust
macro_rules! cli {
    (
        $(
            $name:ident: $type:ty => $description:expr
        ),*
        $(,)?
    ) => {
        {
            let mut args = std::env::args().skip(1);
            let mut parsed = std::collections::HashMap::new();
            $(
                if let Some(value) = args.next() {
                    let parsed_value = value.parse::<$type>().expect(&format!(
                        "Failed to parse argument `{}`: {}",
                        stringify!($name), $description
                    ));
                    parsed.insert(stringify!($name).to_string(), parsed_value);
                }
            )*
            parsed
        }
    };
}

fn main() {
    // 定义命令行参数的格式和描述
    let args = cli!(
        name: String => "The user's name",
        age: u32 => "The user's age",
    );

    // 使用解析后的参数
    println!("Name: {}", args["name"]);
    println!("Age: {}", args["age"]);
}
```

**运行示例：**
```bash
$ cargo run Alice 30
Name: Alice
Age: 30
```

**分析：**
- 通过 `cli!` 宏定义命令行参数的格式和类型。
- 用户只需描述参数，而无需手动解析或处理错误。

---

### 示例 3：实现状态机 DSL
以下宏用来定义一个简单的有限状态机：

```rust
macro_rules! state_machine {
    (
        $name:ident {
            $($state:ident => $next:ident),* $(,)?
        }
    ) => {
        pub struct $name {
            state: &'static str,
        }

        impl $name {
            pub fn new() -> Self {
                Self { state: stringify!($state).split(',').next().unwrap().trim() }
            }

            pub fn transition(&mut self, event: &str) {
                match (self.state, event) {
                    $(
                        (stringify!($state), stringify!($next)) => self.state = stringify!($next),
                    )*
                    _ => panic!("Invalid transition"),
                }
            }

            pub fn state(&self) -> &str {
                self.state
            }
        }
    };
}

state_machine! {
    TrafficLight {
        Red => Green,
        Green => Yellow,
        Yellow => Red,
    }
}

fn main() {
    let mut light = TrafficLight::new();

    println!("Current state: {}", light.state()); // Red
    light.transition("Green");
    println!("Current state: {}", light.state()); // Green
    light.transition("Yellow");
    println!("Current state: {}", light.state()); // Yellow
    light.transition("Red");
    println!("Current state: {}", light.state()); // Red
}
```

**输出：**
```
Current state: Red
Current state: Green
Current state: Yellow
Current state: Red
```

**分析：**
- 通过 `state_machine!` 宏，用户可以简单地定义状态和转移规则。
- 宏将 DSL 编译成 Rust 代码，完成状态机的实现。
- 代码清晰且具有实际用途。

---

### 总结
Rust 宏在构建 DSL 时具有以下优点：
1. **可读性**：用自然的语法描述特定领域的规则，用户无需了解底层实现。
2. **简化代码**：减少样板代码，专注于核心逻辑。
3. **强类型保障**：结合 Rust 的类型系统，确保生成代码的安全性。

这些 DSL 示例涵盖了 HTML 构建、命令行解析和状态机定义，是 Rust 宏在领域专用语言设计中的常见用法。

## 手写实现

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