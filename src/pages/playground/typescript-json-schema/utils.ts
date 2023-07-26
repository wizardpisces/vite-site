import Ajv, { ValidateFunction } from 'ajv'
import { Response } from './type'
const ajv = new Ajv()
import schema from './api/scheme.json'
ajv.addSchema(schema,'/api')
function reportError(error, res) {
    // TODO: 上报
    console.error('scheme validation error: ', error, res)
}

/**
 * 根据 JSON draft-07 定义 schema 对 data 做分析补全
 * 1. 只对 required 类型做补充
 * 2. 对象需要递归补充为{}
 * 3. 数组补充为[]
 * 4. 普通类型跳过
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

    /**
     * ajv validate 只提示第一个遇到的 required
     * 但是我们需要补全的是所有类型，所以会遍历所有的 required 属性，并补全
     */
    for (let key of schema.required) {
        if (!data[key]) { // 不存在，或者 data[key] 为 Null ，则补全

            let missingPropertySchema = schema.properties?.[key]
            if (missingPropertySchema) {
                if (missingPropertySchema.type === 'object') {

                    data[key] = {}
                    completeDataBySchema(data[key], missingPropertySchema)
                }

                if (missingPropertySchema.type === 'array') {
                    data[key] = []
                }


                if(missingPropertySchema.anyOf){ // 这里先不做特别处理补全，理论上接口定义不会有 Union 形式的对象选择
                    missingPropertySchema.anyOf.forEach(schema => { // 对 Union 类型进行补全，理论上这里不会有太多的嵌套
                        completeDataBySchema(data[key], schema)
                    })
                }
            }
        }
    }

}

export function validateAPI<T>(res: Response<T>, schema: Record<string, any>): Response<T> {
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
            validate.errors?.forEach(error => {
                if (error.keyword === 'required') { // 触发补全

                    if (error.params.missingProperty) {

                        let missingPropertyName = error.params.missingProperty

                        if (Array.isArray(schema.required) && schema.required.includes(missingPropertyName)) { // 只补全必须的，不补全可选项
                            completeDataBySchema(data, schema)
                        }

                    }
                }
            });
            reportError(validate.errors, res)
        }
    }
    catch (e) {
        reportError(e, res)
    }

    return res
}