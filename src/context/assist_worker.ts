function calc(num: number) {
    let result = 0
    let startTime = performance.now()
    // 计算求和（模拟复杂计算）
    for (let i = 0; i <= num; i++) {
        result += i
    }
    // 由于是同步计算，在没计算完成之前下面的代码都无法执行
    const time = performance.now() - startTime
    console.log('总计算花费时间:', time)
    self.postMessage(result)
}

self.onmessage = function (e) {
    calc(e.data)
}