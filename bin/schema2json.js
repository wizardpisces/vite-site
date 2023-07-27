const path = require('path');
const filePath = "src/pages/playground/typescript-json-schema/api-defense/__tests__/schema"
const outputPath = "src/pages/playground/typescript-json-schema/api-defense/__tests__/api/scheme.json";
require(path.join(__dirname, '../src/pages/playground/typescript-json-schema/api-defense/bin/schema2json.js'))(filePath, outputPath, path.join(__dirname, "../tsconfig.json"));