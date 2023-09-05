import { describe, expect, jest, test } from "@jest/globals";
import { generateMockDataByFullSchema } from "../bin/genMockData";
import fullSchema from './api/jsonschema/test.json'
import fullSchema2 from './api/jsonschema/test2.json'

describe("api defense bin", () => {
  test("generateMockDataByFullSchema test", () => {
    let data = generateMockDataByFullSchema({}, fullSchema)
    expect(data).toMatchInlineSnapshot(`
{
  "ApiSchema2": {
    "age": 111,
    "name": "string111",
    "test1": 111,
  },
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
  "TestChainReference": {
    "reference": {
      "testChain": 111,
    },
  },
}
`)
  })
  test("generateMockDataByFullSchema test", () => {
    let data = generateMockDataByFullSchema({}, fullSchema2)
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
  "Simple": "string111",
  "Simple2": false,
  "YesOrNo": 111,
}
`)
  })
})