import Ajv, { ValidateFunction, Options, ErrorObject } from 'ajv'
import { Response, ValidateAndFixAPIError, OnErrorOptions, FullSchemaType } from './type'

import { completeDataBySchema, isCyclicJsonSchema, reportError } from './utils'

let ajv:Ajv, fullSchema:FullSchemaType
let onError: (error: OnErrorOptions) => any = (error)=>void(0)
/**
 * 初始化 Ajv 并注册 fullSchema 及其 schemaId，方便 $ref 引用
 * @param schema 
 * @param fullSchemaId 
 * @returns validateAndFixAPI
 */
export function getApiDefenseFn(options: { fullSchema: Record<string, any>, fullSchemaId: string, onError?: (error: OnErrorOptions) => any }) {
    ajv = new Ajv()
    ajv.addSchema(options.fullSchema, options.fullSchemaId) // 注册 /api 的路径，便于 $ref 引用准确，让 validate 准确；让补全也准确
    fullSchema = options.fullSchema
    onError = options.onError || (error=>error);
    return validateAndFixAPI
}

function validateAndFixAPI<T extends (Record<string, any>)>(data: T, schema: Record<string, any>): T {
    try { // 避免校验过程中出现未知错误导致业务代码无法运行
        if (!ajv || !fullSchema) {
            reportError({ msg: 'ajv is not init, please run getApiDefenseFn({fullSchema,fullSchemaId}) to init!' }, onError)
            return data
        }

        if (!schema) {
            reportError({ msg: 'schema should not be empty' }, onError)
            return data
        }

        const validate = ajv.compile(schema)

        const valid = validate(data)

        if (!valid) {
            // console.log(validate.errors?.length,validate.errors)
            /**
             * 实际错误长度一般只有第一层遇到的错误，也就是数组长度是 1，所以会从头到尾扫描 schema 补全，也简化了操作
             * 例外：data = {} 如果类型是 schema['definition']['recursive'], 则会在第一层报出数组长度为 3 的错误
             * [
                    {
                        "instancePath": "",
                        "schemaPath": "#/anyOf/0/required",
                        "keyword": "required",
                        "params": {
                            "missingProperty": "recur"
                        },
                        "message": "must have required property 'recur'"
                    },
                    {
                        "instancePath": "",
                        "schemaPath": "#/anyOf/1/type",
                        "keyword": "type",
                        "params": {
                            "type": "number"
                        },
                        "message": "must be number"
                    },
                    {
                        "instancePath": "",
                        "schemaPath": "#/anyOf",
                        "keyword": "anyOf",
                        "params": {},
                        "message": "must match a schema in anyOf"
                    }
                ]
             */
            if(validate.errors && validate.errors.length >= 1) { // 通过错误激活 handleError，并补全
                handleError(validate.errors[0]) // 只对遇到的第一个错误做校验，其他的错误会在 handleError 的过程中补全
            }

            function handleError(error: ErrorObject) {
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
                    reportError({ errorDetail: error, data: data, msg: 'type misMatch', schema, type: ValidateAndFixAPIError.TypeMismatch }, onError)
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
                    reportError({ errorDetail: error, data: data, schema, msg: 'missing property', type: ValidateAndFixAPIError.Required }, onError)
                } else {
                    reportError({ errorDetail: error, data: data, schema, msg: 'unknown validate error detail' }, onError)
                }

                const [isCyclic, cycleReferenceName] = isCyclicJsonSchema(schema, fullSchema)

                if (isCyclic) {// 如果是循环引用则不做补全（不确定该如何做补全）
                    reportError({ msg: `Schema contains cyclic reference, will not do complete work; please check ${cycleReferenceName} or use Nullable to fix potential error`, type: ValidateAndFixAPIError.SchemaContainsRecursiveReference, schema, data: data }, onError)
                    return data
                } else {
                    completeDataBySchema(data, schema, fullSchema) // 从头到尾扫描 schema 补全
                }
            }
            // validate.errors?.forEach(error => {
                
            // });
        }
    }
    catch (e) {
        reportError({ msg: 'unhandled exception', schema, data: data, errorDetail: e }, onError)
    }

    return data
}