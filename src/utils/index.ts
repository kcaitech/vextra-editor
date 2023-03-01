/*
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-28 10:54:18
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-01 14:32:13
 * @FilePath: \kcdesign\src\utils\index.ts
 */

export function debounce(fn: Function, time: number): Function {
    let timer:  number;
    return () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            fn.call(null, ...arguments)
        }, time)
    }
}