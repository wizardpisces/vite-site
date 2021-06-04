import b from './b.mjs';

b.fn()

setTimeout(() => {
    b.fn()
}, 1500)