import Ajv, { ValidateFunction, Options } from 'ajv'
import { Response } from './type'
const ajv = new Ajv()
import fullSchema from './api/scheme.json'
ajv.addSchema(fullSchema, '/api') // 注册 /api 的路径，便于 $ref 引用准确，让 validate 准确；让补全也准确

function resolveSchemaByRef(ref): Record<string, any> { // 需要考虑循环引用 $ref，类型引用自身
    let path:string[] = ref.split('/') // "api#/definitions/Human" => ["api#", "definitions", "Human"]
    let schema = fullSchema['definitions']
    path.slice(2).forEach(key => {
        schema = schema[key] || {}
    })
    return schema
}

function reportError(error, res) {
    // TODO: 上报
    console.error('scheme validation error: ', error, res)
}

function needComplete(data) {
    return data === null || typeof data === 'undefined'
}

function completeDataBySchemaInner(parentData = {}, dataKeyRelatedSchema: Record<string, any> = {}, dataKey = '') {
    if (typeof dataKeyRelatedSchema !== "object" || typeof parentData !== "object") {
        return
    }
    if (dataKeyRelatedSchema.type === 'object') {
        if (needComplete(parentData[dataKey])) {
            parentData[dataKey] = {}
        }
        completeDataBySchema(parentData[dataKey], dataKeyRelatedSchema)
    } else if (dataKeyRelatedSchema.type === 'array') {
        if (needComplete(parentData[dataKey])) {
            parentData[dataKey] = []
        }
    } else if (dataKeyRelatedSchema.$ref) {
        /**
        * 引用类型：需要考虑循环引用，
        * "human": {
            "$ref": "api#/definitions/Human"
            },
        */
        let refSchema = resolveSchemaByRef(dataKeyRelatedSchema.$ref)
        console.log(parentData,refSchema,dataKey)
        completeDataBySchemaInner(parentData, refSchema, dataKey) // 递归调用自己
    } else if (dataKeyRelatedSchema.anyOf) {
        // 选择第一项做补全
        completeDataBySchemaInner(parentData, dataKeyRelatedSchema.anyOf[0], dataKey)  // 递归调用自己
    }
}
/**
 * 场景：兜底 API 没按照预期返回空的数据结构（ BUG 场景是对像跟数组为空时返回 Null，导致前端出现数据处理的错误而白屏）
 * 
 * 根据 JSON draft-07 定义 schema 对 data 做分析补全
 * 1. 只对 required 类型做 null 消除
 * 2. 对象需要递归补充为{}
 * 3. 数组补充为[]
 * 4. 其他类型暂时跳过，后面看接口定义实际情况看是否补充
 * 
 * 会递归消除，防止补全的 {} 在多级链式调用时候失败，
 * eg：{a:{b:{c:{}}}}，如果只补 a，那 a.b.c 在 b.c 时候会报错
 * 
 * @param inputData 
 * @param schema 
 * @param missingPropertyName 
 * @returns 
 */

function completeDataBySchema(data, schema: Record<string, any> = {}) { // TODO: 如何补全递归类型
    if (typeof schema !== "object" || typeof data !== "object") {
        return
    }

    if (!Array.isArray(schema.required)) { // 跳过属性全是 optional 的 schema
        return
    }

    for (let key of schema.required) {
        let missingPropertySchema = schema.properties?.[key]
        if (missingPropertySchema) {
            completeDataBySchemaInner(data, missingPropertySchema, key)
        }
    }

}

export function validateAndFixAPI<T>(res: Response<T>, schema: Record<string, any>): Response<T> {
    let data = res.data
    try { // 避免校验过程中出现错误，而导致业务代码无法运行
        if (res) {
            if (res.code !== 0) { // 非正常返回
                return res
            }
        }

        if (!schema) {
            console.error('schema is null', schema)
            return res
        }

        const validate = ajv.compile(schema)

        const valid = validate(data)
        if (!valid) {
            validate.errors?.forEach(error => { // 实际错误长度一般只有第一个遇到的错误，也就是数组长度是 1，所以会从头到尾扫描 schema 补全，也简化了操作
                /**
                 *  
                 * eg: { testArray: null } 跟 { testArray: [] } 是不同的 type
                 * 
                 * error:
                 * {
                        "instancePath": "/testArray",
                        "schemaPath": "#/properties/testArray/type",
                        "keyword": "type",
                        "params": {
                            "type": "array"
                        },
                        "message": "must be array"
                    }
                 */
                if (error.keyword === 'type') {
                    completeDataBySchema(data, schema) // 从头到尾扫描 schema 补全
                    reportError(error, res)
                }
                /**
                 * error:
                 * {
                        "instancePath": "",
                        "schemaPath": "#/required",
                        "keyword": "required",
                        "params": {
                            "missingProperty": "testObject"
                        },
                        "message": "must have required property 'testObject'"
                    }
                */
                if (error.keyword === 'required') { // 只在 type 情况下触发补全，其余情况触发报错即可
                    completeDataBySchema(data, schema) // 从头到尾扫描 schema 补全
                    reportError(error, res)
                }
            });
        }
    }
    catch (e) {
        reportError(e, res)
    }

    return res
}