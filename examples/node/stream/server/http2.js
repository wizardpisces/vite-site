/**
 * example: Readable + Transform + Writable
 */
const http = require('http');
const Stream = require('stream');
const App = require('./tiny-server');
const {
    UpCaseTransformStream,
    RenderStream
} = require('./base')

let app = new App(),
    port = 8080

app.use((req, res, next) => {
    req.str = '<h1>this is a test</h1> , should also be in uppercase'
    next()
})

app.use(logger())
app.use(upcaseTransform())

app.use('/', (req, res) => {
    new RenderStream((write, end) => {
        write('<h1>this is a test</h1> , should also be in uppercase<br>');
        end('this is the end')
    }).pipe(res)
    // res.end(req.str)
})

app.use('*', (req, res) => {
    res.end('404 not found')
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})

function logger() {
    return (req, res, next) => {
        console.log('------logger----', req.url);
        next()
    }
}

function upcaseTransform() {

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