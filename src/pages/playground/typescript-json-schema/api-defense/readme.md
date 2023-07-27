# demo of ts json schema

解决API未按照为空约定返回，而是 null，主要对本应该是 null 的对象做补全兜底

ts -> ts-json-schema-generator 生成 json schema -> ajv validate and 补全


## How to run

```
npm run dev
```

visit http://localhost:3000/playground/typescript-json-schema, open console and check error msg

## 特殊场景

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
import schema from './api/scheme.json'
ajv.addSchema(schema,'/api') // 通过 addSchema 将整个 schema 注册到 $id 上
```

## TODO 

* [x] ts-json-schema-generator 生成 JSON，并用 ajv validate
* [x] 错误数据对象跟数组等必须对象补全
* [] 补全 $ref 
    * [x] 普通的 $ref ：需要找到引用类型，并进一步分析补全
    * [x] 多级引用 a->b->c->d
    * [] 循环引用 JSON Schema：判定出循环引用的 JSON Schema 后就不做补全，Dev 抛错提示，用 Nullable 等其他方案做兜底
    * [] Union type 补全：A | {string}，随机选定一个补全
* [] 监听文件 API Schema 类型变化并实时生成 JSON schema 
* [] 拆分 API 生成的 JSON Schema 到多个文件
* [] 解决编译类型同名覆盖

## 注意事项

* 同名覆盖： 如果 ts-json-schema-generator 编译 test.ts 跟 test2.ts 中有同名类型，则会覆盖彼此，只保留一个
* ts-json-schema-generator 不支持交叉类型，例如 ColoredShape 生成的类型会有问题

```ts
type Color = "red" | "green" | "blue";
type Shape = "circle" | "square" | "triangle";
export type ColoredShape = Color & Shape;
```
* ts-json-schema-generator 没有在 $ref 拼上 $id 前缀，目前是手动对结果做的拼接，相关 Issue：https://github.com/vega/ts-json-schema-generator/issues/1732

* ts-json-schema-generator 只对 export 类型做生成到 definitions（typescript-json-schema 则会生成所有到 definitions）

