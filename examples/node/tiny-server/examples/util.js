const Stream = require('stream')
class RenderStream extends Stream.Readable {
    constructor(render) {
        super();
        this.done = false
        this.render = render;
        this.write = (chunk) => {
            this.push(chunk)
        }
        this.end = (chunk) => {
            this.emit('beforeEnd')
            this.done = true;
            this.push(chunk)
        }
    }

    tryRender() {
        this.render(this.write, this.end)
    }

    _read(size) {
        if (this.done) {
            this.push(null)
            return
        }
        this.tryRender()
    }
}

function info(str){
    return `[tiny-server]: ${str}`
}

module.exports = {
    RenderStream,
    info
}