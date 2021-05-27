const Stream = require('stream')

class UpCaseTransformStream extends Stream.Transform {
    constructor() {
        super()
    }

    _transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }

    // _flush(done) {
    //     this.emit('beforeEnd')
    //     done()
    // }
}

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
        console.log('done', this.done)
        if (this.done) {
            this.push(null)
            return
        }
        this.tryRender()
    }
}

module.exports = {
    UpCaseTransformStream,
    RenderStream
}