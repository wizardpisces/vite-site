import { ValidateAndFixAPIError, OnErrorOptions, SchemaType, FullSchemaType } from "./type"

export function resolveSchemaByRef(ref: string, fullSchema: FullSchemaType): SchemaType { // 需要考虑循环引用 $ref，类型引用自身
    let path: string[] = ref.split('/') // "api#/definitions/Human" => ["api#", "definitions", "Human"]
    let schema = fullSchema['definitions']
    path.slice(2).forEach(key => {
        schema = schema[key] || {}
    })
    return schema
}

export function reportError(OnErrorOptions: OnErrorOptions = { msg: '', type: ValidateAndFixAPIError.Other }, onError: (error: OnErrorOptions) => any) {
    console.error('[API-Defense]', OnErrorOptions)
    onError(OnErrorOptions)
}

/**
 * 检测 json schema 是否有循环引用，如果有，则不去做补全操作，并提示循环点
 * @param jsonSchema 
 * @param fullSchema 
 * @returns [boolean, string]
 */
export function isCyclicJsonSchema(jsonSchema: Record<string, any>, fullSchema: FullSchemaType): [boolean, string] {
    let traversedCache = new Set(), refs: string[] = []
    let isCyclic = false, cycleReferenceName = ''
    function traverse(obj: SchemaType) { // 深度优先遍历，缓存已经遍历过的对象，检测是否有循环引用
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

export function genMockDataBySchema(data: any, schema: SchemaType, fullSchema: Record<string, any>) {
    return completeDataBySchema(data, schema, fullSchema, true)
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
// export function completeDataBySchema(data = {}, schema: Record<string, any>, fullSchema: Record<string, any>, mock = false) {
//     function shouldMend(data) {
//         return data === null || typeof data === 'undefined'
//     }

//     function randomNumber(start = 0, end = 100) { // TODO: 随机数，先写死，后面考虑如何随机出合适的结果
//         // return Math.floor(Math.random() * end) + start
//         return 111
//     }

//     function completeDataBySchemaInner(parentData: Record<string, any> = {}, dataKeyRelatedSchema: Record<string, any> = {}, dataKey = '') {
//         // if (dataKey === '' && dataKeyRelatedSchema.type ==='object'){
//         //     return console.log(parentData, JSON.stringify(dataKeyRelatedSchema))
//         // }

//         if (mock && dataKeyRelatedSchema.type === 'string') {
//             parentData[dataKey] = 'string' + randomNumber()
//         } else if (mock && dataKeyRelatedSchema.type === 'number') {
//             parentData[dataKey] = randomNumber()
//         } else if (dataKeyRelatedSchema.type === 'object') {
//             if (shouldMend(parentData[dataKey])) {
//                 parentData[dataKey] = {}
//             }
//             complete(parentData[dataKey], dataKeyRelatedSchema)

//         } else if (dataKeyRelatedSchema.type === 'array') {
//             if (shouldMend(parentData[dataKey])) {
//                 parentData[dataKey] = []
//             }
//         } else if (dataKeyRelatedSchema.$ref) {
//             /**
//             * 引用类型：需要考虑循环引用（已经在入口处做了检查），递归调用
//             * 透传 parentData
//             * "human": {
//                 "$ref": "api#/definitions/Human"
//                 },
//             */
//             let refSchema = resolveSchemaByRef(dataKeyRelatedSchema.$ref, fullSchema)
//             completeDataBySchemaInner(parentData, refSchema, dataKey)
//         } else if (dataKeyRelatedSchema.anyOf) {
//             /**
//              * 场景 2，选择第一项做补全，构造一个类型 type 出来
//              * 透传 parentData
//              */
//             completeDataBySchemaInner(parentData, dataKeyRelatedSchema.anyOf[0], dataKey)
//         } else if (Array.isArray(dataKeyRelatedSchema.type)) {
//             /**
//              * 场景 3 ，普通类型的 anyOf，选择第一项做补全，递归调用自己
//              * 透传 parentData
//              *  "ApiSchema5": {
//                     "type": [
//                         "number",
//                         "string"
//                     ]
//                 }
//              */
//             completeDataBySchemaInner(parentData, { type: dataKeyRelatedSchema.type[0] }, dataKey)
//         }else{
//             throw new Error(`schema type ${dataKeyRelatedSchema.type} is not supported`)
//         }
//     }

//     function complete(data,schema){
//         if (schema.type === "object") {
//             if (Array.isArray(schema.required)) { // 跳过属性全是 optional 的 schema
//                 for (let key of schema.required) { // 对 required 类型做 null 消除
//                     let requiredPropertySchema = schema.properties?.[key]
//                     if (requiredPropertySchema) {
//                         completeDataBySchemaInner(data, requiredPropertySchema, key)
//                     }
//                 }
//             }
//         } else {
//             /**
//              * 场景
//              * 1. 直接引用 type Type1 = ApiSchema3
//              * 2. anyOf type Type2 = A | B
//              * 3. 普通类型选择 type Type3 = number | string
//              * 4. 普通类型 type Simple = number
//              * ...
//              */
//             completeDataBySchemaInner(data, schema, '')  // 传 '' 构建一个 '' => 普通类型的传递
//         }
//     }

//     complete(data, schema)

//     if (data['']) {// 第一级是非直接对象类型（可能是引用的传递，直接返回引用的数据，对应上面的场景 1-4）
//         return data['']
//     }

//     return data
// }

export function completeDataBySchema(data: any, schema: SchemaType, fullSchema: FullSchemaType, mock = false) {
    function shouldMend(data) {
        return data === null || typeof data === 'undefined'
    }

    function randomNumber(start = 0, end = 100) { // TODO: 随机数，先写死，后面考虑如何随机出合适的结果
        // return Math.floor(Math.random() * end) + start
        return 111
    }

    function isArraySchema(schema) {
        return schema && schema.type === 'array'
    }
    function isObjectSchema(schema) {
        return schema && schema.type === 'object'
    }
    function completeDataBySchemaInner(data, schema) {
        if (schema.type === 'string') {
            if (mock) {
                data = 'string' + randomNumber()
            }
        } else if (schema.type === 'number') {
            if (mock) {
                data = randomNumber()
            }
        } else if (isObjectSchema(schema)) {
            if (shouldMend(data)) {
                data = {}
            }
            if (Array.isArray(schema.required)) { // 跳过属性全是 optional 的 schema
                for (let key of schema.required) { // 对 required 类型做 null 消除
                    let requiredPropertySchema = schema.properties?.[key]
                    if (requiredPropertySchema) {
                        let result = completeDataBySchemaInner(data[key], requiredPropertySchema)
                        if (mock) {
                            data[key] = result
                        } else {
                            /**
                             * [] 或者  {} 的场景才进行补全
                             */
                            if (typeof result === 'object'){
                                data[key] = result
                            }

                        }
                    }
                }
            }
        } else if (isArraySchema(schema)) {
            if (shouldMend(data)) {
                data = []
            }
        } else if (schema.$ref) {
            /**
            * 引用类型：需要考虑循环引用（已经在入口处做了检查），递归调用
            * 透传 data
            * "human": {
                "$ref": "api#/definitions/Human"
                },
            */
            let refSchema = resolveSchemaByRef(schema.$ref, fullSchema)
            data = completeDataBySchemaInner(data, refSchema)
        } else if (schema.anyOf) {
            /**
             * 场景 2，选择第一项做补全，构造一个类型 type 出来
             * 透传 data
             */
            data = completeDataBySchemaInner(data, schema.anyOf[0])
        } else if (Array.isArray(schema.type)) {
            /**
             * 场景 3 ，普通类型的 anyOf，选择第一项做补全，递归调用自己
             * 透传 data
             *  "ApiSchema5": {
                    "type": [
                        "number",
                        "string"
                    ]
                }
             */
            data = completeDataBySchemaInner(data, { type: schema.type[0] })
        } else {
            throw new Error(`schema type ${schema.type} is not supported`)
        }
        return data
    }

    data = completeDataBySchemaInner(data, schema)

    return data
}