import path  from 'path'
const filePath = "src/pages/playground/typescript-json-schema/api-defense/__tests__/schema"
const outputPath = "src/pages/playground/typescript-json-schema/api-defense/__tests__/api/";
require(path.join(__dirname, '../src/pages/playground/typescript-json-schema/api-defense/bin/schema2json.ts'))(filePath, outputPath, path.join(__dirname, "../tsconfig.json"));
export {}