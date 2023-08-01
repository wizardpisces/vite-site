const fs = require('fs');
const path = require("path");
const {
    createGenerator
} = require("ts-json-schema-generator");
const ts = require("typescript");

const schemaId = 'api';

function getExportedTypeNames(filePath) {
    const program = ts.createProgram([filePath], {});
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const exps = checker.getExportsOfModule(sourceFile.symbol);
    return exps.map(e => e.getName());
}

/**
 * 背景：如果 ts-json-schema-generator 编译 test.ts 跟 test2.ts 中有同名类型，则会覆盖彼此，丢失了类型信息，相关 Issue: https://github.com/vega/ts-json-schema-generator/issues/1738
 * 这里做一个拦截，在发现不同文件的同名导出类型后直接报错，让开发去定义非重名的类型定义
 * @param {*} filePath 
 */
function checkConflictTypeName(filePath) {
    let isValid = true
    let hashMap = {} // map type name -> filePath
    // console.log('exportedTypeNames', getExportedTypeNames(filePath + '/test2.ts'));
    function traverseFile(filePath) {
        if(!isValid){ // 命名冲突就直接报错
            return
        }
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            let fileList = fs.readdirSync(filePath);
            fileList.forEach(file => {
                traverseFile(path.join(filePath, file))
            })
        } else {
            if (filePath.endsWith('.ts')) {
                let tsFile = filePath;
                let exportedTypeNames = getExportedTypeNames(tsFile);
                exportedTypeNames.forEach(typeName => {
                    if(hashMap[typeName]) {
                        isValid = false
                        console.error(`[api-defense] error: duplicate type name ${typeName} in file \n  ${tsFile} \n  ${hashMap[typeName]} \nresolve to continue...`)
                    }else{
                        hashMap[typeName] = tsFile
                    }
                })

            }
        }
    }

    traverseFile(filePath);

    return isValid
}

module.exports = (filePath, outputPath, tsconfigPath) => {
    // 监听 test.txt 文件的变化
    fs.watch(filePath, (event, filename) => {
        console.log(`file ${filename} ${event}`)
        ts2json()
    })
    // 转换 ts schema -> json schema
    function ts2json() {
        try {
            const isValid = checkConflictTypeName(filePath)
            if (!isValid) {
                return
            }

            console.log(`generating json schema from ${filePath}/*.ts...`)
            /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
            const config = {
                path: path.join(filePath, '/*.ts'),
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

            fs.writeFile(outputPath, schemaString, (err) => {
                if (err) throw err;
                console.log('json schema generated successfully!');
            });
        } catch (e) {
            console.error('[schema2json]: ', e)
        }
    }

    ts2json()
}