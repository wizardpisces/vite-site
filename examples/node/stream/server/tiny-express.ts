const http = require('http');

type LayerOptions = {
    handle: Function;
    url: string
}

class Layer {
    handle: Function
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

    use(path: string, handle: Function) {
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

module.exports = App