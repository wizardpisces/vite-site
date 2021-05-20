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

let compiledScript = new vm.Script(wrappedCode)

// runInContext 性能会比 runInThisContext 低
let runableWrapper = compiledScript.runInContext(sandBox)

let m = {
    exports: {}
}

const r = (filepath) => {
    return require(filepath)
}

runableWrapper.call(m.exports, m.exports, r, m)

console.log('res',m)
