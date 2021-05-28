/**
 * Copyright(c) 2021 wizardpisces
 */

const http = require('http');

type Next<T = void> = (err?: Error | null) => void;
type RequestHandler<T, U, V = void> = (
    req: T,
    res: U,
    next: Next<V>
) => V;

type Handler<T, U, V = void> = RequestHandler<T, U, V>

type Handle = RequestHandler<any, any, void>

type LayerOptions = {
    handle: Handle;
    url: string
}

class Layer {
    handle: Handle
    url: string
    constructor(options: LayerOptions) {
        this.handle = options.handle
        this.url = options.url
    }
}

class App {
    stack: Layer[]
    constructor() {
        this.stack = []
    }

    handle(req: any, res: any) {

        let middleware: Layer[] = this.stack.filter((layer) => {
            return layer.url === '/' || req.path === layer.url
        });

        let len = middleware.length, i = 0;

        const next = (i: number, err: any) => {
            if (err) {
                throw new Error(err)
            }
            if (i >= len) return

            middleware[i].handle(req, res, (err: any) => next(i + 1, err))
        }

        next(i, null)
    }

    use(path: string, handle: Handle) {
        let url = '/'
        if (typeof path === 'function') {
            handle = path
        } else {
            url = path;
        }

        this.stack.push(new Layer({
            handle,
            url
        }))
    }

    listen(port: number, cb: Function) {
        let server = http.createServer(this.handle.bind(this))
        server.listen(port, cb);
    }
}

function compose< T, U, V = void> (handlers: Handler < T, U, V > []) {
    let len = handlers.length,
        i = 0;
    return (req: T, res: U, done: Next<V>) => {

        function dispatch(i: number, err?: any) {
            if (i === len) return done(err)
            handlers[i](req, res, (err) => {
                dispatch(i + 1, err);
            })
        }

        dispatch(i)
    }
}

module.exports = {
    App,
    compose
}