import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getApiDefenseFn } from '..';
import { BasicObj, Recursive, TestChainReference } from './schema/test';
import { ValidateAndFixAPIError } from '../type';
import fullSchema from './api/jsonschema/test.json'

global.console.error = () => { } // 避免 reportError 打印错误，影响到测试结果查看

const onError = jest.fn((obj) => { })
const validateAndFixAPI = getApiDefenseFn({ fullSchema, fullSchemaId: 'test', onError });

describe('validateAPI', () => {
    beforeEach(() => {
        onError.mockClear()
    })
    test('should support basic null completion, support nested object and array, will skip optional and simple type and type not defined in schema', () => {
        const data: BasicObj = {
            // @ts-ignore
            arr: null,
            // @ts-ignore
            obj: null,
            notInSchemaDefinition: null
        }
        const expected: BasicObj = {
            arr: [], // 数组补全
            obj: {
                obj2: {} // 嵌套补全
            },
            // @ts-ignore
            notInSchemaDefinition: null // schema 未定则不做处理
            // simpleType 普通类型未做补全
        }
        expect(validateAndFixAPI(data, fullSchema['definitions']['BasicObj'])).toEqual(expected)
        // expect(onError).toHaveBeenCalled()
        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError.mock.calls[0]).toMatchSnapshot()
        // @ts-ignore
        expect((onError.mock.calls[0][0]).type).toEqual(ValidateAndFixAPIError.Required) // simpleType is required
    })

    test('should support $ref chain', () => {
        // @ts-ignore
        const data: TestChainReference = {
        }
        const expected: TestChainReference = {
            // @ts-ignore
            reference: { // 类型定义中引用其他类型
                // testChain:1
            }
        }
        expect(validateAndFixAPI(data, fullSchema['definitions']['TestChainReference'])).toEqual(expected)

        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError.mock.calls[0]).toMatchSnapshot()
        // @ts-ignore
        expect((onError.mock.calls[0][0]).type).toEqual(ValidateAndFixAPIError.Required) // reference is required

    })

    test('should support cyclic $ref skip null completion, and report error', () => {
        // @ts-ignore
        const data: Recursive = {
        }
        // @ts-ignore
        const expected: Recursive = { // Recursive type contains circular reference, so it will not be completed
        }

        expect(validateAndFixAPI(data, fullSchema['definitions']['Recursive'])).toEqual(expected)

        expect(onError.mock.calls).toMatchSnapshot()
        expect(onError).toHaveBeenCalledTimes(2)
        // @ts-ignore
        expect((onError.mock.calls[0][0]).type).toEqual(ValidateAndFixAPIError.Required) // recur is required
        // @ts-ignore
        expect((onError.mock.calls[1][0]).type).toEqual(ValidateAndFixAPIError.SchemaContainsRecursiveReference) //  SchemaContainsRecursiveReference
    })
});