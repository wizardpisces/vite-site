const request = require('./util')

class WL {
    constructor(options) {
        this.num = options.req
    }

    setNum(req) {
        this.num = req
    }

    async asyncCall(req) {

        let result = await request({
            hostname: 'localhost',
            port: 8080,
            method: 'get',
            path: `/multiple?id=${req}`
        })
        // console.log(`${req} : ${num}`)
    }
}

let singleTon,
    req = 0,
    num = 0

function wlFun(req) {
    if (!singleTon) {
        singleTon = new WL(req)
    } else {
        singleTon.setNum(req)
    }
    return singleTon
}

async function plugin(req) {
    num = req
    let wl = new wlFun(req)

    await wl.asyncCall(req)
    // console.log(`${req} : ${num}`)

    // await wl.asyncCall(req)

}

async function createApp(req) {
    await plugin(req)
}

async function start() {
    while (++req < 10) {
        await createApp(req)
    }
}

start()