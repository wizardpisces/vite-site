module.exports = {
  transform: {                                  //ts、tsx类型文件使用ts-jest进行转换
    // '^.+\\.tsx?$': 'ts-jest',
    // '^.+\\.ts?$': 'ts-jest',
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
}