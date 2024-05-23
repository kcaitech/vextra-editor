// 判断一个Promise当前的状态
export enum PromiseStatus {
    Pending,
    Fulfilled,
    Rejected,
}

export async function checkPromiseStatus(promise: Promise<any>): Promise<PromiseStatus> {
    const t = {}
    return await Promise.race([promise, t])
        .then(v => (v === t) ? PromiseStatus.Pending : PromiseStatus.Fulfilled)
        .catch(() => PromiseStatus.Rejected)
}