import { describe, expect, jest, test } from "@jest/globals";
import { generateMockDataByFullSchema } from "../bin/genMockData";
import fullSchema from "./api/schema.json"
import { BasicObj, Recursive, TestChainReference } from "./schema/test";

describe("api defense bin", () => {
    test("generateMockDataByFullSchema", () => {
        let data = generateMockDataByFullSchema({}, fullSchema)
        let keys = ['Human', 'ChainReferenceNumber', 'TestChainReference', 'BasicObj', 'ApiSchema2', 'ApiSchema3']
        expect(data).toMatchInlineSnapshot(`
{
  "ApiSchema2": {
    "age": 111,
    "name": "string111",
    "test1": 111,
  },
  "ApiSchema3": {
    "apiSchema2": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
    "apiSchema4": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
  },
  "ApiSchema4": {
    "age": 111,
    "name": "string111",
    "test1": 111,
  },
  "ApiSchema5": 111,
  "ApiSchema6": {
    "age": 111,
    "name": "string111",
    "test1": 111,
  },
  "ApiSchema7": {
    "apiSchema2": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
    "apiSchema4": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
  },
  "ApiSchemaWhole": {
    "apiSchema2": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
    "apiSchema4": {
      "age": 111,
      "name": "string111",
      "test1": 111,
    },
  },
  "Arr": [],
  "BasicObj": {
    "arr": [],
    "obj": {
      "obj2": {},
    },
    "simpleType": "string111",
  },
  "ChainReference": {
    "testChain": 111,
  },
  "ChainReferenceNumber": {
    "testChain": 111,
  },
  "Human": {
    "basicInfo": {
      "age": 111,
      "name": "string111",
    },
    "otherInfo": {
      "test": "string111",
    },
  },
  "Simple": "string111",
  "TestChainReference": {
    "reference": {
      "testChain": 111,
    },
  },
}
`)
        // expect(Object.keys(data)).toMatchObject(keys)
    })
})