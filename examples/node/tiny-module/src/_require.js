const vm = require('vm')
const fs = require('fs')
const moduleNativeModule = require('module')
const path = require('path')

let moduleCache = {}

function r(filepath) {
    return _esm_require(filepath)
};

function _esm_require(filepath) {
    filepath = path.join(process.cwd(), filepath)
    let runableWrapper,
        exports = {},
        m = {
            module: {
                exports
            },
            exports
        };

    if (!moduleCache[filepath]) {
        let code = fs.readFileSync(filepath, 'utf-8')
        let wrappedCode = moduleNativeModule.wrap(code)
        /**
         * wrappedCode: (function (exports, require, module, __filename, __dirname) { ${code} })
         */
        let compiledScript = new vm.Script(wrappedCode)
        /**
         * runInContext 性能会比 runInThisContext 低
         * cache 
         */
        runableWrapper = compiledScript.runInThisContext()
        runableWrapper.call(m.exports, m.exports, r, m)
        /**
         * cache compiled and wrapped function and runed result
         */
        moduleCache[filepath] = exports
    }

    return clone(moduleCache[filepath])
}

function clone(obj) {
    let copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
module.exports = _esm_require