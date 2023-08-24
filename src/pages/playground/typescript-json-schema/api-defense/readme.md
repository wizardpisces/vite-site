# Api Defense

解决API未按照为空约定返回，而是 null，主要对本应该是 null 的对象做补全兜底

ts -> ts-json-schema-generator 生成 json schema -> ajv validate and 补全

eg: 
```ts
type Item = {
  prop1:string
  prop2:number
}
type Target = {
  o : {
    o2:{
      prop1: number
      o3:{
        prop2:number
      }
    }
  },
  list:Item[]
} 
```
对 {} 补全 Target 结果：
```json
{
  o:{
    o2:{
      o3:{

      }
    }
  },
  list:[]
}
```

**注意**：非正常的返回则避免使用本校验工具，例如： 返回的 success 是false 或者 code 不为 0 等正确的结果情况，则跳过校验
## How to run

可以参照 Demo 或者 test case
```
import { demo } from "./api-defense/demo";
demo()
```
or
```
npm run test
```

## TODO 

* [x] ts-json-schema-generator 生成 JSON，并用 ajv validate
* [x] 错误数据对象跟数组等必须对象补全
* [x] 补全 $ref （test cases）
    * [x] 普通的 $ref ：需要找到引用类型，并进一步分析补全
    * [x] 多级引用 a->b->c->d
    * [x] 循环引用 JSON Schema：判定出循环引用的 JSON Schema 后就不做补全，Dev 抛错提示，用 Nullable 等其他方案做兜底
    * [x] Union type 补全：A | {string}，随机选定一个补全
* [x] 监听文件 API Schema 类型变化并实时生成 JSON schema 
* [x] 解决编译类型同名覆盖（理论上同名的类型应该是同一类型，目前可以临时通过强制同名类型为同类型解决，但是需要做出编译时候的提示）
* [] 错误上报
  * API path
  * error type
  * error data
* [] 拆分 API 生成的 JSON Schema 到多个文件
* [] 基础 mock 数据生成，并集成到工程 （尝试 json-schema-faker，大概率不会使用，原因：BUG 还有一些，比较复杂，跟本工程调用方式不太契合 ）
  * [] mock 结果修正，加强 type 判断，在 type='string' 并且包含 enum 属性的时候进行 enum 挑选，而不是单纯的 string 生成
* [] 调研：定义注释来更精准的校验 跟 生成 mock 数据，eg：注释 // string: 0-100 ,则生成对应的 schema 跟 mock data
* [] 发布成 package

## 注意事项

### 可能触发 BUG
* 同名覆盖（通过 ts2json 前的拦截解决）： 如果 ts-json-schema-generator 编译 test.ts 跟 test2.ts 中有同名类型，则会覆盖彼此，只保留一个，相关 Issue: https://github.com/vega/ts-json-schema-generator/issues/1738
* ts-json-schema-generator 不支持交叉类型，例如 ColoredShape 生成的类型会有问题

```ts
type Color = "red" | "green" | "blue";
type Shape = "circle" | "square" | "triangle";
export type ColoredShape = Color & Shape;
```
* ts-json-schema-generator（通过 ts2json 后的 patch 解决） 没有在 $ref 拼上 $id 前缀，目前是手动对结果做的拼接，相关 Issue：https://github.com/vega/ts-json-schema-generator/issues/1732

* ts-json-schema-generator 只对 export 类型做生成到 definitions（typescript-json-schema 则会生成所有到 definitions）

### 性能相关

* 非 Export 的引用直接合并导致编译的 JSON Schema 膨胀：目前生成的 JSON Schema 只有 export 出去类型，所以会导致如下场景中的 Common 被合并到 A 跟 B 类型两次，而不是通过索引 $ref 链接（只会编译出一个 Common），这样会比较浪费空间
```
type Common = {
  prop1:number
}
type A = {
  c:Common
}
type B = {
  c:Common
}

```

## 补丁

1. 在 ts-json-schema-generator 对于 只有 一个 export type ApiSchema 的文件会生成带 **$ref 属性**的JSON；用 ajv.compile(schema) 验证会一切正常
```json
{
  "$id": "api",
  "$ref": "#/definitions/ApiSchema",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "ApiSchema": {
        ...
```

2. 如果文件内部有两个及以上 export ，则不会生成 $ref 属性；这个时候需要手动选择定义 ajv.compile(schema['definition']['ApiSchema'])，但是如果**有引用 $ref 则会验证失败**，如下对 ApiSchema2 的引用找不到，原因是我们手动做了 schema 选择，已经丢失了最外层定义
```json
{
  "$id": "api",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "ApiSchema": {
      "additionalProperties": false,
      "properties": {
        "age": {
          "type": "number"
        },
        "name": {
          "type": "string"
        },
        "otherApi": {
          "$ref": "#/definitions/ApiSchema2" // 实际这里缺少了 api 前缀, "$ref": "api#/definitions/ApiSchema2"，看起来是 ts-json-schema-generator 的 BUG ？
        }
      },
      "required": [
        "name",
        "age",
        "otherApi"
      ],
      "type": "object"
    },
    "ApiSchema2": {
      xxx
    }
  }
}
```
解决方案：

```ts
import schema from './api/schema.json'
ajv.addSchema(schema,'/api') // 通过 addSchema 将整个 schema 注册到 $id 上
```

