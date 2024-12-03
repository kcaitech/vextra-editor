// 多线程绘制

const workerUrl = new URL('./thread.worker.ts', import.meta.url);
// const worker = new Worker(workerUrl);
// worker.onmessage = (e: MessageEvent) => {
//   console.log('Message received from worker:', e.data);
// };
// worker.postMessage('Hello Worker!');


type Task = { task: { cancled?: boolean, args(): any }, resolve: Function, reject: Function, id?: number }

class ThreadPool {
    private workers: Worker[] = []
    private idles: Worker[] = []
    private capacity: number
    private pending: Task[] = []
    private running: Task[] = []
    private _uid: number = 0
    private terminated: boolean = false;

    private _onmessage(e: MessageEvent) {
        const data = e.data as { id: number, result: any }
        const idx = this.running.findIndex((v) => v.id === data.id)
        if (idx >= 0) { // throw new Error();
            const task = this.running.splice(idx, 1)[0];
            task.resolve(data.result)
        }
        this._continue()
    }

    constructor(capacity: number) {
        this.capacity = capacity
        this._onmessage = this._onmessage.bind(this)
    }

    _continue() {
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
        if (worker) {
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
        this.running.forEach(t => t.reject("terminated"))
        this.running.length = 0
    }
}


const min_canvas_size = 100 // 考虑根据设备设置？
const max_usable_size_ratio = 4
// 管理一批OffscreenCanvas
class CanvasCache {
    // 自动清理掉超出capacity且空闲一段时间的canvas
    private maxidlecount: number
    private maxidletime: number

    private _idle: { canvas: OffscreenCanvas, lastuse: number }[] = []


    constructor(maxidlecount: number, maxidletime: number) {
        this.maxidlecount = maxidlecount
        this.maxidletime = maxidletime
    }
    get(width: number, height: number): OffscreenCanvas {
        // 有空闲的canvas时,找个最接近大小的
        // 无空闲时生成一个特定大小的
        if (width < min_canvas_size) width = min_canvas_size
        if (height < min_canvas_size) height = min_canvas_size
        let idx = -1
        for (let i = 0, len = this._idle.length; i < len; ++i) {
            const idle = this._idle[i]
            if (idle.canvas.width >= width && idle.canvas.height >= height &&
                idle.canvas.width < width * max_usable_size_ratio && idle.canvas.height < height * max_usable_size_ratio) {
                if (idx >= 0) {
                    const idle2 = this._idle[idx]
                    if (idle.canvas.width * idle.canvas.height < idle2.canvas.width * idle2.canvas.height) {
                        idx = i
                    }
                } else {
                    idx = i
                }
            }
        }
        if (idx >= 0) {
            const idle = this._idle.splice(idx, 1)[0]
            return idle.canvas
        }

        const canvas = new OffscreenCanvas(width, height)
        return canvas
    }
    put(canvas: OffscreenCanvas) {
        this._idle.push({ canvas, lastuse: Date.now() })
        this._release()
    }

    private _release() {
        if (this._idle.length <= this.maxidlecount) return;
        const now = Date.now()
        for (let i = 0, len = this._idle.length; i < len && len > this.maxidlecount;) {
            const idle = this._idle[i]
            if (now - idle.lastuse > this.maxidletime) {
                this._idle.splice(i, 1)
                --len
            } else {
                ++i
            }
        }
    }
}

type MemoryHead = { ref: number, capacity: number }
const mem_head_len = 8 // 2个uint32
class Memory {

    private buffer: SharedArrayBuffer = new SharedArrayBuffer(1024 * 1024) // 初始1M
    private freebuffer: { idx: number, len: number }[] = []

    private _alloc(len: number): { idx: number, len: number } {
        throw new Error()
    }
    private _free(index: { idx: number, len: number }) {

        throw new Error()
    }

    update(index: { idx: number, len: number }, value: Uint8Array) {
        const uint32 = new Uint32Array(this.buffer.slice(index.idx, index.idx + mem_head_len))
        const ref = uint32[0]
        const capacity = uint32[1]

        const buffer = new Uint8Array(this.buffer)
        if (ref > 0 || capacity <= value.length) {
            index = this._alloc(value.length)
        }

        buffer.set(value, index.idx + mem_head_len)
        buffer.fill(0, index.idx + mem_head_len + value.length) // 最后填充0
        return { idx: index.idx, len: value.length }
    }
    put(value: Uint8Array): { idx: number, len: number } {
        const buffer = new Uint8Array(this.buffer)
        const index = this._alloc(value.length)
        buffer.set(value, index.idx + mem_head_len)
        buffer.fill(0, index.idx + mem_head_len + value.length) // 最后填充0
        return { idx: index.idx, len: value.length }
    }
    get(index: { idx: number, len: number }): Uint8Array {
        return new Uint8Array(this.buffer.slice(index.idx + mem_head_len, index.idx + mem_head_len + index.len))
    }


    private _incRef(index: { idx: number, len: number }) {
        const uint32 = new Uint32Array(this.buffer)
        const ref = uint32[index.idx / 4]
        uint32.fill(ref + 1, index.idx / 4)
    }

    private _decRef(index: { idx: number, len: number }) {
        const uint32 = new Uint32Array(this.buffer)
        const ref = uint32[index.idx / 4]
        if (ref <= 0) throw new Error()
        uint32.fill(ref - 1, index.idx / 4)
        if (ref === 1) this._free(index)
    }

    // 怎么防止内存泄露？
    // 传递给线程里需要加引用记数，线程返回后即刻释放。其它操作不用增加引用记数
    incRef(shapes: { index: { idx: number, len: number } }[]) {
        shapes.forEach(s => this._incRef(s.index))
    }
    decRef(shapes: { index: { idx: number, len: number } }[]) {
        shapes.forEach(s => this._decRef(s.index))
    }
}

const thread_count = Math.min(4, Math.max(navigator.hardwareConcurrency, 2))
class Render {
    private canvas: CanvasCache = new CanvasCache(thread_count * 2, 15000/* 15s */)
    private threads: ThreadPool = new ThreadPool(thread_count)

    // 是否需要？



}