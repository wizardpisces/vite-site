// prompting 生成 fn 函数满足以下测试用例：

function test0(fn) {
    if (fn(0) === 0 && fn(1) === 1) {
        return true
    }
    return false
}

function test1(fn) {
    if (fn(0) === 0 && fn(1) === 1 && fn(2) === 1 && fn(3) === 2) {
        return true
    }
    return false
}