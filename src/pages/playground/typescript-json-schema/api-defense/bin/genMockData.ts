import { FullSchemaType, ValidateAndFixAPIError } from "../type";
import { isCyclicJsonSchema, reportError, genMockDataBySchema } from "../utils";

export {
    generateMockDataByFullSchema
}

/**
 * 根据投放的初始 data 生成的 mock 数据
 */
function generateMockDataByFullSchema(data:Record<string, any> = {}, fullSchema: FullSchemaType) {
    Object.keys(fullSchema['definitions']).forEach(key => {
        let schema = fullSchema['definitions'][key]
        const [isCyclic, cycleReferenceName] = isCyclicJsonSchema(schema, fullSchema)
        if (isCyclic) {// 如果包含循环引用则不做 mock 数据生成
            reportError({ msg: `Schema contains cyclic reference; please check ${cycleReferenceName}`, type: ValidateAndFixAPIError.SchemaContainsRecursiveReference, schema, data }, (err) => { })
        } else {
            data[key] = genMockDataBySchema(data[key], schema, fullSchema)
        }
    })
    return data;
}