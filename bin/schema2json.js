const tsj = require("ts-json-schema-generator");
const fs = require("fs");

const schemaId = 'api';

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
    path: "src/pages/playground/typescript-json-schema/schema/*.ts",
    tsconfig: "./tsconfig.json",
    type: "*", // Or <type-name> if you want to generate schema for that one type only
    schemaId: schemaId
};

const output_path = "src/pages/playground/typescript-json-schema/api/scheme.json";

const schema = tsj.createGenerator(config).createSchema(config.type);
let schemaString = JSON.stringify(schema, null, 2);


/**
 * 这里补丁 $id prefix 到 $ref
 * 原因： ts - json - schema - generator 没有在 $ref 拼上 $id 前缀， 导致 ajv 寻址不到
 * 相关 Issue： https: //github.com/vega/ts-json-schema-generator/issues/1732
 * PS： typescript-json-schema 会自动拼上 id  但是使用如下命令会报错 typescript-json-schema './tsconfig.json' * --include 'src/pages/playground/typescript-json-schema/schema/*.ts'  -o 'src/pages/playground/typescript-json-schema/api/scheme.json' --id='api'
 */
schemaString = schemaString.replace(/(#\/definitions\/)/g, `${schemaId}$1`)

fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
});