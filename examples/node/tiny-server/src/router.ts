class Layer {
    handle: Handle
    url: string
    constructor(options: LayerOptions) {
        this.handle = options.handle
        this.url = options.url
    }
}

module.exports = class Router {
    stack: Layer[]

    constructor() {
        this.stack = []
    }

    use(url: string, handle: Handle) {
        this.stack.push(new Layer({
            handle,
            url
        }))
    }

    handle(req: any, res: any) {

        let middleware: Layer[] = this.stack.filter((layer) => {
            return req.url === layer.url
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

}
