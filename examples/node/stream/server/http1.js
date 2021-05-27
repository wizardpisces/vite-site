/**
 * example: Readable + Transform + Writable
 * run:  node http1.js
 */
const http = require('http');

const {
    UpCaseTransformStream,
    RenderStream
} = require('./base')

const server = http.createServer((req, res) => {
    // req 是一个 http.IncomingMessage 实例，它是可读流。
    // res 是一个 http.ServerResponse 实例，它是可写流。
    console.log(req.url)
    if (req.url === '/') {
        let sourceStream = new RenderStream((write, end) => {
            write('<h1>this is a test</h1>');
            end()
        })

        sourceStream.on('end', () => {
            console.log('request ended')
        }).on('error', (e) => {
            throw new Error(e)
        }).pipe(new UpCaseTransformStream()).pipe(res);

    } else {
        res.end('null data')
    }
});

let port = 8080
server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
});
