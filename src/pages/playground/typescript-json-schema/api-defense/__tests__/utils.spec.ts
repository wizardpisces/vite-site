import { describe, expect, jest, test } from "@jest/globals";
import { resolveSchemaByRef, isCyclicJsonSchema, completeDataBySchema } from "../utils";
import fullSchema from "./api/schema.json"
import { BasicObj, Recursive, TestChainReference } from "./schema/test";

describe("api defense utils", () => {
    test("resolveSchemaByRef", () => {
        let humanSchema = resolveSchemaByRef("api#/definitions/Human", fullSchema)
        expect(humanSchema).toEqual(fullSchema["definitions"]["Human"])

        let recursiveSchema = resolveSchemaByRef("api#/definitions/Recursive", fullSchema)
        expect(recursiveSchema).toEqual(fullSchema["definitions"]["Recursive"])
    })

    test("isCyclicJsonSchema", () => {
        expect(isCyclicJsonSchema(fullSchema["definitions"]["Human"], fullSchema)).toEqual([false, ""])
        expect(isCyclicJsonSchema(fullSchema["definitions"]["Recursive"], fullSchema)).toEqual([true, 'api#/definitions/Recursive'])
        expect(isCyclicJsonSchema(fullSchema["definitions"]["ApiSchema"], fullSchema)).toEqual([true, 'api#/definitions/Recursive'])
    })
    test("completeDataBySchema with mock", () => {
        let data: BasicObj = completeDataBySchema({}, fullSchema["definitions"]["BasicObj"], fullSchema, true)
        expect(data['arr']).toMatchInlineSnapshot(`[]`)
        expect(data['obj']).toMatchInlineSnapshot(`
{
  "obj2": {},
}
`);
        expect(typeof data['simpleType']).toMatch('string')
    });
    test("completeDataBySchema basic", () => {
        let BasicObjData: BasicObj = {
            // @ts-ignore
            arr: null,
            // @ts-ignore
            obj: null,
            notInSchemaDefinition: null
        }
        completeDataBySchema(BasicObjData, fullSchema["definitions"]["BasicObj"], fullSchema)
        expect(BasicObjData).toEqual({
            arr: [], // 数组补全
            obj: {
                obj2: {} // 嵌套补全
            },
            notInSchemaDefinition: null // schema 未定则不做处理
            // simpleType 普通类型未做补全
        }
        )
    })
    test("completeDataBySchema chain", () => {
        // @ts-ignore
        let chainReferenceData: TestChainReference = {
        }
        completeDataBySchema(chainReferenceData, fullSchema["definitions"]["TestChainReference"], fullSchema)
        expect(chainReferenceData).toEqual({
            reference: { // 类型定义中引用其他类型
                // testChain:1
            }
        })
    })
    // test("completeDataBySchema recursive", () => {
    //     // @ts-ignore
    //     let recursiveData: Recursive = {

    //     }
    //     completeDataBySchema(recursiveData, fullSchema["definitions"]["Recursive"], fullSchema)
    //     expect(recursiveData).toEqual({}) // 循环引用不做补全
    // })
})