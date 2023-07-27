import Ajv, { ValidateFunction, Options } from 'ajv'
import { Response } from './type'

import { completeDataBySchema, isCyclicJsonSchema, reportError } from './utils'

let ajv, fullSchema

/**
 * 初始化 Ajv 并注册 fullSchema 及其 schemaId，方便 $ref 引用
 * @param schema 
 * @param fullSchemaId 
 * @returns validateAndFixAPI
 */
export function getApiDefenseFn(schema, fullSchemaId) {
    if (ajv) {
        return validateAndFixAPI
    }
    ajv = new Ajv()
    ajv.addSchema(schema, fullSchemaId) // 注册 /api 的路径，便于 $ref 引用准确，让 validate 准确；让补全也准确
    fullSchema = schema
    return validateAndFixAPI
}

function validateAndFixAPI<T>(res: Response<T>, schema: Record<string, any>): Response<T> {
    try { // 避免校验过程中出现未知错误导致业务代码无法运行
        if (!ajv || !fullSchema) {
            reportError({ msg: 'ajv is not init, please run initApiDefense(fullSchema,fullSchemaId) to init!' })
            return res
        }

        let data = res.data
        if (res) {
            if (res.code !== 0) { // 非正常返回
                return res
            }
        }

        if (!schema) {
            reportError({ msg: 'schema should not be empty' })
            return res
        }

        const validate = ajv.compile(schema)

        const valid = validate(data)

        if (!valid) {

            validate.errors?.forEach(error => { // 实际错误长度一般只有第一个遇到的错误，也就是数组长度是 1，所以会从头到尾扫描 schema 补全，也简化了操作
                if (error.keyword === 'type') {
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
                    reportError({ errorDetail: error, data: res, msg: 'type misMatch', schema })
                } else if (error.keyword === 'required') { // 只在 type 情况下触发补全，其余情况触发报错即可
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
                    reportError({ errorDetail: error, data: res, schema, msg: 'missing property' })
                } else {
                    reportError({ errorDetail: error, data: res, schema, msg: 'unknown error' })
                }

                const [isCyclic, cycleReferenceName] = isCyclicJsonSchema(schema, fullSchema)

                if (isCyclic) {// 如果是循环引用则不做补全（不确定该如何做补全）
                    reportError({ msg: `Schema contains cyclic reference, will not do complete work; please check ${cycleReferenceName} or use Nullable to fix potential error`, schema, data: res })
                    return res
                } else {
                    completeDataBySchema(data, schema, fullSchema) // 从头到尾扫描 schema 补全
                }
            });
        }
    }
    catch (e) {
        reportError({ msg: 'unhandled exception', schema, data: res, errorDetail: e })
    }

    return res
}