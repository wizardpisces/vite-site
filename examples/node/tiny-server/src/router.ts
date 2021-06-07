import { Handle, LayerOptions } from './type'
class Layer {
    handle: Handle
    url: string
    asterisk:boolean // * 通配符
    constructor(options: LayerOptions) {
        this.handle = options.handle
        this.url = options.url
        this.asterisk = this.url === '*'
    }

    match(reqPath:string){
        if(this.asterisk){
            return true
        }

        return reqPath === this.url
    }
}

export default class Router {
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
            return layer.match(req.url)
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
