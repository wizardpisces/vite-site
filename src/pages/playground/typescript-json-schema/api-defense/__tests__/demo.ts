import { ApiSchema } from "./schema/test";
import { getApiDefenseFn } from "..";
import { Response } from '../type';
import metadata from './api/metadata.json'
import { ApiSchema3 } from "./schema/test2";


const modules = import.meta.glob('./api/jsonschema/*.json', { eager: true });

// 遍历对象，获取每个模块对象
for (const path in modules) {
    const mod = modules[path];
    // mod 是导入的模块对象
    console.log(path, mod);
}

// const fullSchemaId = 'api'
const validateAndFixAPI = <T>(res: Response<T>, schemaName: string): Response<T> => {
    try {
        if (!res || res.code !== 0) { // 只对正常的 res 做 data  校验
            return res
        }
        
        // const schema = (fullSchema as Record<string, any>)['definitions'][schemaName]
        // const schema = import(`./api/jsonschema/${(metadata as Record<string, any>)[schemaName]}.json`)
        const schemaNameRelatedFileName = (metadata as Record<string, any>)[schemaName]
        const fullSchema = modules[`./api/jsonschema/${schemaNameRelatedFileName}.json`].default
        const fullSchemaId = schemaNameRelatedFileName // 参照生成的 jsonschema 的 $id
        // const fullSchemaId = 'api' // 参照生成的 jsonschema 的 $id

        res.data = getApiDefenseFn({
            fullSchema, fullSchemaId, onError: (error) => {
                let e = new Error(error.msg)
                console.log(e.stack)
            }
        })(res.data as Record<string, any>, fullSchema['definitions'][schemaName]) as T

    } catch (error) {
        console.error(error)
    }
    return res
};

export const apiSchemaAPI = () => { // use in code to see how it work, eg: require('api-defense/demo').apiSchemaAPI()
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

    return validateAndFixAPI(res, 'ApiSchema')
}

export const apiDefenseAPI2 = () => { // use in code to see how it work, eg: require('api-defense/demo').apiDefenseAPI()
    const res: Response<ApiSchema3> = {
        code: 0,
        data: {
            apiSchema2: {
                name: 'test',
                age: 18,
                test1: 1
            }
        }
    }
    return validateAndFixAPI(res, 'ApiSchema3')
}

