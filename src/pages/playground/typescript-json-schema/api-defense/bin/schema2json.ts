import { generateMockDataByFullSchema } from "./genMockData";
import fs from 'fs';
import path from "path";
import {
    createGenerator
} from "ts-json-schema-generator";
import { customErrorLog, customLog } from "../utils";
const ts = require('typescript');

// function traverseFile(inputFilePath: string, cb: (filename: string) => void) { // 先不支持目录下再嵌套目录，增加复杂性，没有收益，后续看情况是否支持
//     function innerTraverse(filePath: string) {
//         let stat = fs.statSync(filePath);
//         if (stat.isDirectory()) {
//             let fileList = fs.readdirSync(filePath);
//             fileList.forEach(file => {
//                 innerTraverse(path.join(filePath, file))
//             })
//         } else {
//             cb(filePath)
//         }
//     }
//     innerTraverse(inputFilePath)
// }
function getExportedTypeNames(filePath: string) {
    const program = ts.createProgram([filePath], {});
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const exps = checker.getExportsOfModule(sourceFile.symbol);
    return exps.map((e: any) => e.getName());
}
/**
 * 背景：如果 ts-json-schema-generator 编译 test.ts 跟 test2.ts 中有同名类型，则会覆盖彼此，丢失了类型信息，相关 Issue: https://github.com/vega/ts-json-schema-generator/issues/1738
 * 这里做一个拦截，在发现不同文件的同名导出类型后直接报错，让开发去定义非重名的类型定义
 * @param {*} filePath 
 * 
 * 检查重复的定义
 * 检查 schema 文件内部是否还包含文件夹
 * 生成 schema meta data
 */
function isValidSchemaFile(dirFilePath: string, outputPath: string) {
    // checkConflictTypeNameAndGenerateMetaData
    let hasConflict = false
    let hashMap: Record<string, string> = {} // map type name -> filePath

    let fileList: string[] = fs.readdirSync(dirFilePath); // 只支持一级目录下的扫码，先简化处理，因为需要做一一对应的 mock 跟 json schema 生成

    fileList.forEach((filename, index) => {
        if (hasConflict) { // 命名冲突就直接报错
            return
        }
        let filePath = path.join(dirFilePath, filename)
        if (fs.statSync(filePath).isDirectory()) {
            throw new Error(`${dirFilePath} should not contain directory: ${filePath}`)
        }
        if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) { // 忽略掉.d.ts，因为不是一个 module，会导致 checker.getExportsOfModule(sourceFile.symbol) 报错
            let tsFile = filePath;
            let exportedTypeNames = getExportedTypeNames(tsFile);
            exportedTypeNames.forEach((typeName: string) => {
                if (hashMap[typeName]) {
                    hasConflict = true
                    customErrorLog(`Duplicate type name ${typeName} in file \n  ${tsFile}\n  ${hashMap[typeName]} \nresolve to continue...`)
                } else {
                    hashMap[typeName] = tsFile
                }
            })
        }
    })

    // generate meta data
    if (!hasConflict) {
        Object.keys(hashMap).forEach((typeName: string) => {
            hashMap[typeName] = path.basename(hashMap[typeName], path.extname(hashMap[typeName]))
        })
        fs.writeFileSync(path.join(outputPath, 'metadata.json'), JSON.stringify(hashMap, null, 2))
    }

    return hasConflict
}

// 定义一个防抖函数
function debounce(func: () => any, delay = 1000) {
    // 定义一个定时器变量
    let timer: NodeJS.Timeout;
    // 返回一个包装后的函数
    return function (...args: any) {
        // 如果定时器存在，就清除它
        if (timer) {
            clearTimeout(timer);
        }
        // 设置一个新的定时器，并在 delay 时间后调用原始函数，并传入参数
        timer = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}

function isValidArgs(filePath: string, outputPath: string, tsconfigPath: string) {
    if (typeof filePath !== 'string' || typeof outputPath !== 'string' || typeof tsconfigPath !== 'string') {
        customErrorLog('filePath outputPath tsconfigPath must be string')
        return false
    }

    if (!fs.statSync(filePath).isDirectory() || !fs.statSync(filePath).isDirectory()) {
        customErrorLog('filePath, outputPath must be a directory')
        return false
    }

    return true
}
module.exports = (filePath: string, outputPath: string, tsconfigPath: string) => {
    // 转换 ts schema -> json schema
    function ts2json() {
        customLog(`Generating json schema from ${filePath}/*.ts...`)

        let fileList: string[] = fs.readdirSync(filePath);

        fileList.forEach((filename, index) => {
            const filenameWithoutExt = path.basename(filename, path.extname(filename))
            const schemaId = filenameWithoutExt;
            // const schemaId = 'api'
            /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
            const config = {
                // path: path.join(filePath, '/*.ts'),
                path: path.join(filePath, filename),
                tsconfig: tsconfigPath,
                type: "*", // Or <type-name> if you want to generate schema for that one type only
                schemaId: schemaId,
                uniqueNames: true
            };

            const schema = createGenerator(config).createSchema(config.type);
            let schemaString = JSON.stringify(schema, null, 2);
            /**
             * 这里补丁 $id prefix 到 $ref
             * 原因： ts-json-schema-generator 没有在 $ref 拼上 $id 前缀， 导致 ajv 寻址不到
             * 相关 Issue： https: //github.com/vega/ts-json-schema-generator/issues/1732
             * PS： typescript-json-schema 会自动拼上 id  但是使用如下命令会报错 typescript-json-schema './tsconfig.json' * --include 'src/pages/playground/typescript-json-schema/schema/*.ts'  -o 'src/pages/playground/typescript-json-schema/api/schema.json' --id='api'
             */
            schemaString = schemaString.replace(/(#\/definitions\/)/g, `${schemaId}$1`)


            let jsonSchemaDir = path.join((outputPath), 'jsonschema/'),
                mockDataDir = path.join((outputPath), 'mock/')
                
            fs.existsSync(jsonSchemaDir) || fs.mkdirSync(jsonSchemaDir, { recursive: true })
            fs.existsSync(mockDataDir) || fs.mkdirSync(mockDataDir, { recursive: true })

            fs.writeFileSync(path.join(jsonSchemaDir, filenameWithoutExt + '.json'), schemaString)
            if (index === fileList.length - 1) {
                customLog('JSON schema generated successfully!');
            }
            
            fs.writeFileSync(path.join(mockDataDir, filenameWithoutExt + '.json'), JSON.stringify(generateMockDataByFullSchema({}, JSON.parse(schemaString)), null, 2))
            if (index === fileList.length - 1) {
                customLog('mock data generated successfully!');
            }
        })
    }

    try {
        if (!isValidArgs(filePath, outputPath, tsconfigPath) || isValidSchemaFile(filePath, outputPath)) {
            return
        }

        ts2json()

        // 监听 test.txt 文件的变化
        const task = debounce(() => ts2json(), 1000)
        fs.watch(filePath, (event, filename) => {
            customLog(`File ${filename} ${event}`)
            task()
        })
    } catch (error) {
        customErrorLog(error)
    }

}