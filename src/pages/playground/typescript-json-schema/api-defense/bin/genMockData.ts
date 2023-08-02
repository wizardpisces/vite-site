import { ValidateAndFixAPIError } from "../type";
import { isCyclicJsonSchema, resolveSchemaByRef, reportError } from "../utils";

export {
    generateMockDataBySchema,
    generateDataBySchema
}

function randomNumber(start = 0, end = 100) {
    return Math.floor(Math.random() * end) + start
}
/**
 * 根据投放的初始 data 生成的 mock 数据
 */
function generateMockDataBySchema(data = {}, fullSchema) {
    Object.keys(fullSchema['definitions']).forEach(key => {
        let schema = fullSchema['definitions'][key]
        const [isCyclic, cycleReferenceName] = isCyclicJsonSchema(schema, fullSchema)
        if (isCyclic) {// 如果包含循环引用则不做 mock 数据生成
            reportError({ msg: `Schema contains cyclic reference; please check ${cycleReferenceName}`, type: ValidateAndFixAPIError.SchemaContainsRecursiveReference, schema, data }, (err)=>{})
        } else {
            data[key] = data[key] || {}
            data[key] = generateDataBySchema(data[key], schema, fullSchema)
        }
    })
    return data;
}

function generateDataBySchema(data = {}, schema: Record<string, any>, fullSchema: Record<string, any>) {

    if (!Array.isArray(schema.required)) { // 跳过属性全是 optional 的 schema
        return
    }

    function generateDataBySchemaInner(parentData: Record<string, any> = {}, dataKeyRelatedSchema: Record<string, any> = {}, dataKey = '') {
        function shouldMend(data) {
            return typeof data === 'undefined'
        }
        // if (typeof dataKeyRelatedSchema !== "object" || typeof parentData !== "object") {
        //     return
        // }
        if (dataKeyRelatedSchema.type === 'string') {
            parentData[dataKey] = 'string' + randomNumber()
        } else if (dataKeyRelatedSchema.type === 'number') {
            parentData[dataKey] = randomNumber()
        } else if (dataKeyRelatedSchema.type === 'object') {
            if (shouldMend(parentData[dataKey])) {
                parentData[dataKey] = {}
            }
            generateDataBySchema(parentData[dataKey], dataKeyRelatedSchema, fullSchema)
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
            generateDataBySchemaInner(parentData, refSchema, dataKey) // 递归调用自己，这里需要检测循环引用（在入口处就对 json Schema 做验证）
        } else if (dataKeyRelatedSchema.anyOf) {
            generateDataBySchemaInner(parentData, dataKeyRelatedSchema.anyOf[0], dataKey)  // 选择第一项做补全，递归调用自己
        }
    }
    for (let key of schema.required) { // 对 required 类型做 null 消除
        let requiredPropertySchema = schema.properties?.[key]
        if (requiredPropertySchema) {
            generateDataBySchemaInner(data, requiredPropertySchema, key)
        }
    }
    return data
}