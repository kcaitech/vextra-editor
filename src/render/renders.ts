// 多线程绘制

const workerUrl = new URL('./thread.worker.ts', import.meta.url);
const worker = new Worker(workerUrl);

worker.onmessage = (e: MessageEvent) => {
  console.log('Message received from worker:', e.data);
};

worker.postMessage('Hello Worker!');


class ThreadPool {
    private workers: Worker[] = []
    private idles: Worker[] = []
    private capacity: number
    private messages: { message: any & {cancled?: boolean}, resolve: Function, reject: Function}[] = []
    private _uid: number = 0

    constructor(capacity: number) {
        this.capacity = capacity
    }

    _continue() {
        // todo
    }

    postTask(message: any & {cancled?: boolean}): Promise<any> {
        return new Promise((resolve, reject) => {
            this.messages.push({
                message, resolve, reject
            })
            this._continue()
        })
    }
}