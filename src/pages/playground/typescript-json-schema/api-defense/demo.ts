import scheme from './__tests__/api/scheme.json'
import { ApiSchema } from "./__tests__/schema/test";
import { validateAndFixAPI } from ".";
import { Response } from './type';

const schema = scheme['definitions']['ApiSchema']
export const getTestData = () => { // use in code to see how it work, eg: getTestData()
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

