# demo of ts json schema

ts -> ts-json-schema-generator 生成 json schema -> ajv validate

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
ts-json-schema-generator 没有在 $ref 拼上 $id 前缀，导致 ajv 寻址不到，PS：typescript-json-schema 会自动拼上 id
相关 Issue：https://github.com/vega/ts-json-schema-generator/issues/1732
## TODO 

[x] ts-json-schema-generator 生成 JSON，并用 ajv validate
[x] 错误数据对象跟数组等必须对象补全
[] 循环类型补全，补全 $ref
[] Union type 补全：A | {string}
[] 监听文件 API Schema 类型变化并实时生成 JSON schema 
[] 