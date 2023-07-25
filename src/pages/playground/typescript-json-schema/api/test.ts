import scheme from './scheme.json'
import { ApiSchema } from "../schema/test";
import { validateAPI } from "../utils";
import { Response } from '../type';

const schema = scheme['definitions']['ApiSchema']

export const getTestData = ()=> {
        const res: Response<ApiSchema> = {
            code:0,
            data:{
                // testArray: [],
                // testObject: {
                //     arr: [],
                //     obj: {
                //         name: 'test',
                //         age: 18
                //     },
                //     optionalObj: {
                //         key1: 'test',
                //         key2: 18
                //     },
                //     simpleType: 'test'
                // }
            }
        }
    return validateAPI(res, schema)
}

