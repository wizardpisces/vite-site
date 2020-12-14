function partial(fn, ...arg) {
    return (...arg2) => {
        return fn.apply(null, arg.concat(arg2))
    }
}
