import { ValidateAndFixAPIError, OnErrorOptions, SchemaType, FullSchemaType } from "./type"

export function customLog(...args: any[]) {
    console.log(`\x1B[43m [API-Defense] \x1B[49m`, ...args);
}
export function customErrorLog(...args: any[]) {
    console.log(`\x1B[41m [API-Defense] \x1B[49m`, ...args);
}

export function resolveSchemaByRef(ref: string, fullSchema: FullSchemaType): SchemaType { // 需要考虑循环引用 $ref，类型引用自身
    let path: string[] = ref.split('/') // "api#/definitions/Human" => ["api#", "definitions", "Human"]
    let schema = fullSchema['definitions']
    path.slice(2).forEach(key => {
        schema = schema[key] || {}
    })
    return schema
}

export function reportError(OnErrorOptions: OnErrorOptions = { msg: '', type: ValidateAndFixAPIError.Other }, onError: (error: OnErrorOptions) => any) {
    // console.error('[API-Defense]', OnErrorOptions)
    console.error(`\x1B[41m [API-Defense] \x1B[49m`, OnErrorOptions);
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
    function traverse(schemaObj: SchemaType) { // 深度优先遍历，缓存已经遍历过的对象，检测是否有循环引用
        if (isCyclic) { // 判断出循环引用后直接返回
            return true
        }
        if (schemaObj === null || typeof schemaObj !== 'object') {
            return schemaObj
        }

        if (traversedCache.has(schemaObj)) { // 对遍历的节点再次访问，说明遇到循环引用
            isCyclic = true
            cycleReferenceName = refs.pop() as string
            return true
        }

        traversedCache.add(schemaObj)
        for (const key in schemaObj) {
            if (key === "$ref") {
                refs.push(schemaObj[key])
                traverse(resolveSchemaByRef(schemaObj[key], fullSchema))
            } else {
                traverse(schemaObj[key]);
            }
        }

        traversedCache.delete(schemaObj);
    }

    traverse(jsonSchema)
    return [isCyclic, cycleReferenceName]
}

export function genMockDataBySchema(data: any, schema: SchemaType, fullSchema: Record<string, any>) {
    return completeDataBySchema(data, schema, fullSchema, true)
}

/**
 * 
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
 * @param data 
 * @param schema 
 * @param fullSchema 
 * @param mock 
 * @returns 
 */
export function completeDataBySchema(data: any, schema: SchemaType, fullSchema: FullSchemaType, mock = false) {
    function shouldMend(data: any) {
        return data === null || typeof data === 'undefined'
    }

    function randomNumber(start = 0, end = 100) { // TODO: 随机数，先写死，后面考虑如何随机出合适的结果
        // return Math.floor(Math.random() * end) + start
        return 111
    }

    function isArraySchema(schema: SchemaType) {
        if(typeof schema !== 'object'){
            return false
        }
        return schema && schema.type === 'array'
    }
    function isObjectSchema(schema: SchemaType) {
        if (typeof schema !== 'object') {
            return false
        }
        return schema && schema.type === 'object'
    }
    function completeDataBySchemaInner(data:any, schema:SchemaType) {
        if(typeof schema !== 'object'){
            return data
        }
        if (schema.type === 'string') {
            if (mock) {
                if(Array.isArray(schema.enum) && schema.enum.length > 0){
                    data = schema.enum[0]
                }else{
                    data = 'string' + randomNumber()
                }
            }
        } else if (schema.type === 'number') {
            if (mock) {
                data = randomNumber()
            }
        } else if (schema.type === 'boolean') {
            if (mock) {
                data = false
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
