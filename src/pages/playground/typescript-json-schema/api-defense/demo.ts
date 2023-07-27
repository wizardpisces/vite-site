import { ApiSchema } from "./__tests__/schema/test";
import { getApiDefenseFn } from ".";
import { Response } from './type';
import fullSchema from './__tests__/api/scheme.json'
const schema = fullSchema['definitions']['ApiSchema']
const fullSchemaId = '/api'

const validateAndFixAPI = getApiDefenseFn(fullSchema, fullSchemaId)
export const demo = () => { // use in code to see how it work, eg: require('api-defense/demo').getTestData()
    const res: Response<ApiSchema> = {
        code: 0,
        data: {
            testArray: [],
            cycleReference: null,
            testChainReference: null,
            testReference: {
                basicInfo: {
                    name: 'test',
                    age: 18
                },
                otherInfo: {

                }
            },
            testObject: {
                arr: [],
                // obj: {
                //     name: 'test',
                //     age: 18,
                //     recursive:1
                // },
                optionalObj: {
                    key1: 'test',
                    key2: 18
                },
                simpleType: 'test'
            }
        }
    }
    return validateAndFixAPI(res, schema)
}

