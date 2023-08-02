import { describe, expect, jest, test } from "@jest/globals";
import { generateDataBySchema, generateMockDataBySchema } from "../bin/genMockData";
import fullSchema from "./api/schema.json"
import { BasicObj, Recursive, TestChainReference } from "./schema/test";

describe("api defense bin", () => {
    test("generateDataBySchema", () => {
        let data: BasicObj = generateDataBySchema({}, fullSchema["definitions"]["BasicObj"], fullSchema)
        expect(data['arr']).toMatchInlineSnapshot(`[]`)
        expect(data['obj']).toMatchInlineSnapshot(`
{
  "obj2": {},
}
`);
        expect(typeof data['simpleType']).toMatch('string')
    });

    test("generateMockDataBySchema", () => {
        let data = generateMockDataBySchema({}, fullSchema)
        let keys = ['Human', 'ChainReferenceNumber', 'TestChainReference', 'BasicObj', 'ApiSchema2', 'ApiSchema3']
        expect(data).toMatchInlineSnapshot()
        // expect(Object.keys(data)).toMatchObject(keys)
    })
})