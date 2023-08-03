type UnwrappedPromise<T> = T extends Promise<infer U> ? U : T

// 节流
// 被后续调用取消时会抛出异常
export function throttle<T extends (this: any, ...args: any[]) => any>(func: T, delay: number): (...funcArgs: Parameters<T>) => Promise<UnwrappedPromise<ReturnType<T>>> {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    let cancel: (reason?: any) => void = () => {}
    let previous: number = 0
    return function (this: any, ...args: Parameters<T>) {
        if (timer) {
            clearTimeout(timer)
            timer = undefined
            cancel("cancel")
        }
        const now = Date.now()
        const remaining = delay - (now - previous)
        if (remaining <= 0) {
            previous = now
            return func.apply(this, args)
        }
        return new Promise((resolve, reject) => {
            timer = setTimeout(() => {
                previous = Date.now()
                resolve(func.apply(this, args))
            }, remaining) as any
            cancel = reject
        })
    }
}

// 防抖
// 被后续调用取消时会抛出异常
export function debounce<T extends (this: any, ...args: any[]) => any>(func: T, delay: number): (...funcArgs: Parameters<T>) => Promise<UnwrappedPromise<ReturnType<T>>> {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    let cancel: (reason?: any) => void = () => {}
    return function (this: any, ...args: Parameters<T>) {
        if (timer) {
            clearTimeout(timer)
            timer = undefined
            cancel("cancel")
        }
        return new Promise((resolve, reject) => {
            timer = setTimeout(() => {
                resolve(func.apply(this, args))
            }, delay) as any
            cancel = reject
        })
    }
}
