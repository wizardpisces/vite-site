const Stream = require('stream');

module.exports = function upcaseTransform() {

    function toBuffer(chunk, encoding) {
        return !Buffer.isBuffer(chunk) ?
            Buffer.from(chunk, encoding) :
            chunk
    }

    return (req, res, next) => {
        let stream = new UpCaseTransformStream(),
            _end = res.end,
            _on = res.on,
            _write = res.write;

        res.on = function on(type, listener) {
            return stream.on(type, listener)
        }

        res.end = function (chunk) {
            return chunk ? stream.end(toBuffer(chunk)) : stream.end()
        }

        res.write = function write(chunk, encoding) {
            return stream.write(toBuffer(chunk, encoding))
        }

        stream.on('data', function onStreamData(chunk) {
            if (_write.call(res, chunk) === false) {
                stream.pause()
            }
        })

        stream.on('end', () => {
            _end.call(res)
        })

        _on.call(res, 'drain', function onResponseDrain() {
            stream.resume()
        })

        next()
    }
}

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

exports.UpCaseTransformStream = UpCaseTransformStream
