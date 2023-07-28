import { describe, expect, jest, test } from '@jest/globals';
import { getApiDefenseFn } from '..';
import { BasicObj, Recursive, TestChainReference } from './schema/test';
import { Response } from '../type';
import fullSchema from './api/scheme.json'
import { reportError } from '../utils';

global.console.error = () => { } // 避免 reportError 打印错误，影响到测试结果查看

const validateAndFixAPI = getApiDefenseFn(fullSchema, '/api')

jest.mock('../utils', () => {
    const originalModule = jest.requireActual('../utils') as Object;
    console.log('originalModule',originalModule)
    return {
        ...originalModule,
        reportError: jest.fn((obj)=>{}),
    };
});

describe('validateAPI', () => {
    test('should support basic null completion, support nested object and array, will skip optional and simple type and type not defined in schema', () => {
        const res: Response<BasicObj> = {
            code: 0,
            data: {
                // @ts-ignore
                arr: null,
                // @ts-ignore
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
                // @ts-ignore
                notInSchemaDefinition: null // schema 未定则不做处理
                // simpleType 普通类型未做补全
            }
        }
        expect(validateAndFixAPI(res, fullSchema['definitions']['BasicObj'])).toEqual(expected)
        // let result = reportError()
        // expect(reportError).toHaveBeenCalled()
    })

    test('should support $ref chain', () => {
        const res: Response<TestChainReference> = {
            code: 0,
            // @ts-ignore
            data: {

            }
        }
        const expected: Response<TestChainReference> = {
            code: 0,
            data: {
                // @ts-ignore
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
            // @ts-ignore
            data: {

            }
        }
        const expected: Response<Recursive> = { // Recursive type contains circular reference, so it will not be completed
            code: 0,
            // @ts-ignore
            data: {
            }
        }
        expect(validateAndFixAPI(res, fullSchema['definitions']['Recursive'])).toEqual(expected)
    })
});