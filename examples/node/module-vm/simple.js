const vm = require('vm')
const fs = require('fs')
const moduleNativeModule = require('module')

// let code = fs.readFileSync('./simple.js','utf-8')
let code = fs.readFileSync('./test-script.js', 'utf-8')

let wrappedCode = moduleNativeModule.wrap(code)

let sandBox = vm.createContext({
    setTimeout: setTimeout,
    console: console
})
// console.log('wrappedCode', wrappedCode)

let compiledScript = new vm.Script(wrappedCode)
// console.log('compiledScript', typeof compiledScript)

// runInContext 性能会比 runInThisContext 低
let runableWrapper = compiledScript.runInContext(sandBox)
// let runableWrapper = compiledScript.runInThisContext()

console.log('runableWrapper', runableWrapper);

let m = {
    exports: {}
}

const r = (filepath) => {
    return require(filepath)
}

runableWrapper.call(m.exports, m.exports, r, m)

console.log('res',m)
