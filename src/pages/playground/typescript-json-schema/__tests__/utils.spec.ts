import { describe, expect, test } from '@jest/globals';
import { validateAndFixAPI } from '../utils';
import { ApiSchema, BasicObj, TestChainReference } from '../schema/test';
import { Response } from '../type';
import scheme from '../api/scheme.json'
// function sum(a: number, b: number) {
//     return a + b;
// }
// describe('sum module', () => {
//     test('adds 1 + 2 to equal 3', () => {
//         expect(sum(1, 2)).toBe(3);
//     });
// });

describe('validateAPI', () => {
    test('基本对象 null 补全，支持嵌套补全，跳过 optional 跟 普通类型， 跳过未在类型中定义的', () => {
        const res: Response<BasicObj> = {
            code: 0,
            data: {
                arr:null,
                obj:null,
                notInSchemaDefinition:null
            }
        }
        const expected: Response<BasicObj> = {
            code:0,
            data:{
                arr:[], // 数组补全
                obj:{
                    obj2:{} // 嵌套补全
                },
                notInSchemaDefinition: null // schema 未定则不做处理
                // simpleType 普通类型未做补全
            }
        }
        expect(validateAndFixAPI(res, scheme['definitions']['BasicObj'])).toEqual(expected)
        
    })

    test('typescript $ref 对象引用补全', () => {
        const res: Response<TestChainReference> = {
            code: 0,
            data: {
                
            }
        }
        const expected: Response<TestChainReference> = {
            code:0,
            data:{
                reference:{ // 类型定义中引用其他类型
                    // testChain:1
                }
            }
        }
        expect(validateAndFixAPI(res, scheme['definitions']['TestChainReference'])).toEqual(expected)
        
    })
});