/**
 * Copyright(c) 2021 wizardpisces
 */

const http = require('http');
const Router = require('./router')
module.exports = class App {
    _router:typeof Router 
    constructor() {
        this._router = new Router()
    }

    handle(req: any, res: any) {
        this._router.handle(req, res)
    }

    use(path: string, handle: Handle) {
        let url = '/'
        if (typeof path === 'function') {
            handle = path
        } else {
            url = path;
        }

        this._router.use(url, handle)
    }

    listen(port: number, cb: Function) {
        let server = http.createServer(this.handle.bind(this))
        server.listen(port, cb);

        /**
         * Todos: should be modified
         */
        // this.stack.push(new Layer({
        //     handle: (req, res) => {
        //         res.status = 404
        //         res.end('not found')
        //     },
        //     url: '/404'
        // }))
    }
}