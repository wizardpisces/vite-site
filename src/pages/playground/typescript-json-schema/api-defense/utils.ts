import { ValidateAndFixAPIError, OnErrorOptions } from "./type"

export function resolveSchemaByRef(ref: string, fullSchema: Record<string, any>): Record<string, any> { // 需要考虑循环引用 $ref，类型引用自身
    let path: string[] = ref.split('/') // "api#/definitions/Human" => ["api#", "definitions", "Human"]
    let schema = fullSchema['definitions']
    path.slice(2).forEach(key => {
        schema = schema[key] || {}
    })
    return schema
}

export function reportError(OnErrorOptions: OnErrorOptions = { msg: '', type: ValidateAndFixAPIError.Other }, onError:(error: OnErrorOptions)=>any ) {
    console.error('[API-Defense]', OnErrorOptions)
    onError(OnErrorOptions)
}

/**
 * 检测 json schema 是否有循环引用，如果有，则不去做补全操作，并提示循环点
 * @param jsonSchema 
 * @param fullSchema 
 * @returns [boolean, string]
 */
export function isCyclicJsonSchema(jsonSchema: Record<string, any>, fullSchema: Record<string, any>): [boolean, string] {
    let traversedCache = new Set(), refs: string[] = []
    let isCyclic = false, cycleReferenceName = ''
    function traverse(obj: Record<string, any>) { // 深度优先遍历，缓存已经遍历过的对象，检测是否有循环引用
        if (isCyclic) { // 判断出循环引用后直接返回
            return true
        }
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        if (traversedCache.has(obj)) { // 对遍历的节点再次访问，说明遇到循环引用
            isCyclic = true
            cycleReferenceName = refs.pop() as string
            return true
        }

        traversedCache.add(obj)
        for (const key in obj) {
            if (key === "$ref") {
                refs.push(obj[key])
                traverse(resolveSchemaByRef(obj[key], fullSchema))
            } else {
                traverse(obj[key]);
            }
        }

        traversedCache.delete(obj);
    }

    traverse(jsonSchema)
    return [isCyclic, cycleReferenceName]
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
 * @param fullSchema 
 * @returns 
 */

export function completeDataBySchema(data, schema: Record<string, any>, fullSchema: Record<string, any>) {
    if (typeof schema !== "object" || typeof data !== "object") {
        return
    }

    if (!Array.isArray(schema.required)) { // 跳过属性全是 optional 的 schema
        return
    }

    function completeDataBySchemaInner(parentData = {}, dataKeyRelatedSchema: Record<string, any> = {}, dataKey = '') {
        function shouldMend(data) {
            return data === null || typeof data === 'undefined'
        }
        if (typeof dataKeyRelatedSchema !== "object" || typeof parentData !== "object") {
            return
        }
        if (dataKeyRelatedSchema.type === 'object') {
            if (shouldMend(parentData[dataKey])) {
                parentData[dataKey] = {}
            }
            completeDataBySchema(parentData[dataKey], dataKeyRelatedSchema, fullSchema)
        } else if (dataKeyRelatedSchema.type === 'array') {
            if (shouldMend(parentData[dataKey])) {
                parentData[dataKey] = []
            }
        } else if (dataKeyRelatedSchema.$ref) {
            /**
            * 引用类型：需要考虑循环引用，
            * "human": {
                "$ref": "api#/definitions/Human"
                },
            */
            let refSchema = resolveSchemaByRef(dataKeyRelatedSchema.$ref, fullSchema)
            completeDataBySchemaInner(parentData, refSchema, dataKey) // 递归调用自己，这里需要检测循环引用（在入口处就对 json Schema 做验证）
        } else if (dataKeyRelatedSchema.anyOf) {
            completeDataBySchemaInner(parentData, dataKeyRelatedSchema.anyOf[0], dataKey)  // 选择第一项做补全，递归调用自己
        }
    }

    for (let key of schema.required) { // 对 required 类型做 null 消除
        let requiredPropertySchema = schema.properties?.[key]
        if (requiredPropertySchema) {
            completeDataBySchemaInner(data, requiredPropertySchema, key)
        }
    }

}
