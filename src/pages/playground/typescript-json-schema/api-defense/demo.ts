import { ApiSchema } from "./__tests__/schema/test";
import { getApiDefenseFn } from ".";
import { Response } from './type';
import fullSchema from './__tests__/api/schema.json'
import { error } from "console";

const schema = fullSchema['definitions']['ApiSchema']
const fullSchemaId = '/api'

const validateAndFixAPI = getApiDefenseFn({ fullSchema, fullSchemaId, onError :(error)=>{
    let e = new Error(error.msg)
    console.log(e.stack)
} });
export const demo = () => { // use in code to see how it work, eg: require('api-defense/demo').demo()
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

    if(res.code !==0) return res // code 不为 0，表明是非预期的符合 schema 定义的数据，跳过校验
    return validateAndFixAPI(res.data, schema)
}

