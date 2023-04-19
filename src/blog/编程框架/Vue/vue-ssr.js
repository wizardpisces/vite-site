/**
 * vue ssr code structure
 * 
 * createRenderer source code
 */

export function createRenderer(options ? : Object = {}): {
    renderToString: Function,
    renderToStream: Function
} {
    return _createRenderer(options)
}


function _createRenderer(options) {
    const templateRenderer = new TemplateRenderer({
        template,
        inject,
        shouldPreload,
        shouldPrefetch,
        clientManifest,
        serializer
    })

    const render = createRenderFunction(modules, directives, isUnaryTag, cache)

    return {
        renderToString() {
            const {
                promise,
                cb
            } = createPromiseCallback()

            render(component, write, context, err => {
                const res = templateRenderer.render(result, context)

                res.then(html => cb(null, html)).catch(cb)
            })
            return promise
        },
        renderToStream() {
            const renderStream = new RenderStream((write, done) => {
                render(component, write, context, done)
            })
            const templateStream = templateRenderer.createStream(context)
            renderStream.pipe(templateStream)

            return templateStream
        }
    }
}

export function createRenderFunction() {
    return function render(
        component: Component
    ) {
         const context = new RenderContext({
             activeInstance: component,
             write,
             done,
         })
        renderNode(component._render(), true, context)
    }
}

class RenderContext{
    
}

function renderNode(node, isRoot, context) {
    if (node.isString) {
        renderStringNode(node, context)
    }
}

function renderStringNode(el, context) {
    const {
        write,
        next
    } = context
    if (isUndef(el.children) || el.children.length === 0) {
        write(el.open + (el.close || ''), next)
    } else {
        const children: Array < VNode > = el.children
        context.renderStates.push({
            type: 'Element',
            children,
            rendered: 0,
            total: children.length,
            endTag: el.close
        })
        write(el.open, next)
    }
}
/**
 * createBundleRenderer source code
 */

export const createBundleRenderer = createBundleRendererCreator(createRenderer)

function createBundleRendererCreator(createRenderer) {

    return function createBundleRenderer(
        bundle, //(used webpack generated server manifest object)
        rendererOptions
    ) {
        let entry = bundle.entry,
            files = bundle.files

        const renderer = createRenderer(rendererOptions)
        /**
         * eg : 
         * bundle = {
         *    entry: 'src/main.js',
         *    files: {
         *        'entry-server.js':'bundled server source code'
         *    }
         * }
         * 
         * 如果是远程CDN拉取打包好的组件源码，想要在本地进行 SSR，是否可以直接构造一个 bundle manifest出来？
         * 
         */

        let run = createBundleRunner(entry, files, basedir, rendererOptions.runInNewContext)

        return {
            renderToString(context) {
                const {
                    promise,
                    cb
                } = createPromiseCallback();

                run(context).then((app) => {
                    renderer.renderToString(app, context, (err, res) => {
                        rewriteErrorTrace(err, maps)
                        cb(err, res)
                    })
                })

                return promise
            },
            renderToStream(context) {
                const res = new PassThrough()

                run(context).then((app) => {
                    const renderStream = renderer.renderToStream(app, context)
                    renderStream.pipe(res)
                })
                return res
            }
        }

    }
}

function compileModule(files, basedir, runInNewContext) {
    function getCompiledScript(filename) {
        var code = files[filename];

        // wrap code so each time run code will load dependencies which means run in new context
        var wrapper = NativeModule.wrap(code);

        var script = new vm.Script(wrapper, {
            filename: filename,
            displayErrors: true
        });
        return script
    }

    function evaluateModule(filename, sandbox, evaluatedFiles) {
        var script = getCompiledScript(filename);
        var compiledWrapper = runInNewContext === false ?
            script.runInThisContext() :
            script.runInNewContext(sandbox);
        var m = {
            exports: {}
        };

        // rewrite require to load file in new context
        var r = function (file) {
            if (files[file]) {
                return evaluateModule(file, sandbox, evaluatedFiles)
            } else {
                return require(file)
            }
        };
        compiledWrapper.call(m.exports, m.exports, r, m);

        var res = Object.prototype.hasOwnProperty.call(m.exports, 'default') ?
            m.exports.default :
            m.exports;
        return res
    }
    return evaluateModule
}

function createBundleRunner(entry, files, basedir, runInNewContext) {
    var evaluate = compileModule(files, basedir, runInNewContext)


    if (runInNewContext !== false && runInNewContext !== 'once') {
        return function (userContext) {
            return new Promise(function (resolve) {
                var res = evaluate(entry, createSandbox(userContext));
                resolve(typeof res === 'function' ? res(userContext) : res);
            });
        }
    } else {
        var runner;
        //cache runner so do not nead to load file when runInNewContext is false or once in production which has better performance than runInNewContext=true
        return function (userContext) {
            return new Promise(function (resolve) {
                if (!runner) {
                    runner = evaluate(entry, sandbox);
                }
                resolve(runner(userContext));
            })
        }
    }
}