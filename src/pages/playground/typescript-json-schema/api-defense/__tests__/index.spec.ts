import { describe, expect, test } from '@jest/globals';
import { getApiDefenseFn } from '..';
import { ApiSchema, BasicObj, Recursive, TestChainReference } from './schema/test';
import { Response } from '../type';
import fullSchema from './api/scheme.json'

const validateAndFixAPI = getApiDefenseFn(fullSchema, '/api')
describe('validateAPI', () => {
    test('should support basic null completion, support nested object and array, will skip optional and simple type and type not defined in schema', () => {
        const res: Response<BasicObj> = {
            code: 0,
            data: {
                arr: null,
                obj: null,
                notInSchemaDefinition: null
            }
        }
        const expected: Response<BasicObj> = {
            code: 0,
            data: {
                arr: [], // 数组补全
                obj: {
                    obj2: {} // 嵌套补全
                },
                notInSchemaDefinition: null // schema 未定则不做处理
                // simpleType 普通类型未做补全
            }
        }
        expect(validateAndFixAPI(res, fullSchema['definitions']['BasicObj'])).toEqual(expected)

    })

    test('should support $ref chain', () => {
        const res: Response<TestChainReference> = {
            code: 0,
            data: {

            }
        }
        const expected: Response<TestChainReference> = {
            code: 0,
            data: {
                reference: { // 类型定义中引用其他类型
                    // testChain:1
                }
            }
        }
        expect(validateAndFixAPI(res, fullSchema['definitions']['TestChainReference'])).toEqual(expected)

    })

    test('should support cyclic $ref skip null completion, and report error', () => {
        const res: Response<Recursive> = {
            code: 0,
            data: {

            }
        }
        const expected: Response<Recursive> = { // Recursive type contains circular reference, so it will not be completed
            code: 0,
            data: {
            }
        }
        expect(validateAndFixAPI(res, fullSchema['definitions']['Recursive'])).toEqual(expected)
    })
});