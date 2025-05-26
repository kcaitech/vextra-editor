/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


const workerUrl = new URL('./thread.worker.ts', import.meta.url);
// const worker = new Worker(workerUrl);
// worker.onmessage = (e: MessageEvent) => {
//   console.log('Message received from worker:', e.data);
// };
// worker.postMessage('Hello Worker!');


type Task = { task: { cancled?: boolean, args(): any }, resolve: Function, reject: Function, id?: number }

export class ThreadPool {
    private workers: Worker[] = []
    private idles: Worker[] = []
    private capacity: number
    private pending: Task[] = []
    private running: Task[] = []
    private _uid: number = 0
    private terminated: boolean = false;

    private _onmessage(e: MessageEvent) {
        const data = e.data as { id: number, result: any, err: any }
        const idx = this.running.findIndex((v) => v.id === data.id)
        if (idx >= 0) { // throw new Error();
            const task = this.running.splice(idx, 1)[0];
            if (data.err) task.reject(data.err)
            else task.resolve(data.result)
        }
        this._continue()
    }

    constructor(capacity: number) {
        this.capacity = capacity
        this._onmessage = this._onmessage.bind(this)
    }

    private _continue() {
        if (this.pending.length === 0) return;
        if (this.terminated) {
            return
        }

        let worker: Worker | undefined
        if (this.idles.length > 0) {
            worker = this.idles.pop()
        } else if (this.workers.length < this.capacity) {
            worker = new Worker(workerUrl);
            worker.onmessage = this._onmessage
            this.workers.push(worker)
        }
        if (!worker) {
            return
        }

        let task = this.pending.pop()
        while (task && task.task.cancled) {
            task.reject("cancled")
            task = this.pending.pop();
        }
        if (task) {
            task.id = ++this._uid
            this.running.push(task)
            worker.postMessage({ id: task.id, args: task.task.args() })
        } else {
            this.idles.push(worker)
        }
    }

    postTask(task: { cancled?: boolean, args(): any }): Promise<any> {
        if (this.terminated) throw new Error("terminated")
        return new Promise((resolve, reject) => {
            this.pending.push({
                task, resolve, reject
            })
            this._continue()
        })
    }

    terminate() {
        this.terminated = true;
        this.workers.forEach(w => w.terminate())
        this.pending.forEach(t => t.reject("terminated"))
        this.pending.length = 0
        // 不能简单reject，可能会导致线程在使用的数据被提前释放掉了
        // this.running.forEach(t => t.reject("terminated"))
        // this.running.length = 0
    }
}