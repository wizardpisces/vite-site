const stream = require('stream')

export default class RenderStream extends stream.Readable {
    constructor(render) {
        super()
        this.buffer = ''
        this.render = render
        this.write = (text, next) => {
            this.buffer += text
        }
    }

    tryRender() {
        try {
            this.render(this.write, this.end)
        } catch (e) {
            this.emit('error', e)
        }
    }

    tryNext() {
        try {
            this.next()
        } catch (e) {
            this.emit('error', e)
        }
    }

    _read() {
        if (isUndef(this.next)) {
            // start the rendering chain.
            this.tryRender()
        } else {
            // continue with the rendering.
            this.tryNext()
        }
    }
}