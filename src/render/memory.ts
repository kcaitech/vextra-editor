
type MemoryHead = { ref: number /* 1byte */, capacity: number /* 3byte */ }
type MemoryTail = { free: boolean /* 1byte */, capacity: number /* 3byte */ } // 用于合并内容空间
const mem_head_len = 4 // 1个uint32
const mem_tail_len = 4; // 1个uint32

// 对齐4个字节
function align4bytes(len: number) {
    return Math.round((len + 1) / 4) * 4
}

function lowerBound(data: { len: number, idxs: number[] }[], len: number) {
    let left = 0;
    let right = data.length;

    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (data[mid].len < len) {
            left = mid + 1; // 向右半部分搜索
        } else {
            right = mid; // 在左半部分（包括mid）搜索
        }
    }

    return left; // 返回第一个不小于targetLen的元素的索引
}

export class Memory {

    private buffer: SharedArrayBuffer = new SharedArrayBuffer(1024 * 1024) // 初始1M
    private _freeidx: number = 0
    private _capacity: number = 1024 * 1024
    private freebuffer: { len: number, idxs: number[] }[] = []

    private _gethead(idx: number): MemoryHead {
        const uint32 = new Uint32Array(this.buffer, idx)
        const ref = (uint32[0] & 0xff000000) >> 24
        const capacity = uint32[0] & 0xffffff
        return { ref, capacity }
    }
    private _gettail(idx: number): MemoryTail {
        const uint32 = new Uint32Array(this.buffer, idx)
        const capacity = uint32[0] & 0xffffff
        const tail = this.__gettail(idx + mem_head_len + capacity)
        if (capacity !== tail.capacity) throw new Error()
        return tail
    }
    private __gettail(idx: number): MemoryTail {
        const uint32 = new Uint32Array(this.buffer, idx)
        const tail = uint32[0]
        const free = ((tail & 0xff000000) >> 24) === 0xff
        const capacity = tail & 0xffffff
        return { free, capacity }
    }
    private _sethead(idx: number, head: MemoryHead) {
        if (head.ref > 0xff || head.capacity > 0xffffff) throw new Error()
        const uint32 = new Uint32Array(this.buffer, idx)
        const h = (head.ref << 24) | (head.capacity)
        uint32.fill(h)
    }
    private _settail(idx: number, tail: MemoryTail) {
        if (tail.capacity > 0xffffff) throw new Error()
        const uint32 = new Uint32Array(this.buffer, idx + mem_head_len + tail.capacity)
        const h = (tail.free ? 0xff : 0) | (tail.capacity)
        uint32.fill(h)
    }
    private _getpreidx(idx: number) {
        if (idx <= 0) return -1
        const tail = this.__gettail(idx - mem_tail_len)
        return idx - mem_tail_len - tail.capacity - mem_head_len
    }
    private _getnextidx(idx: number) {
        if (idx >= this.buffer.byteLength) return -1
        const head = this._gethead(idx)
        idx = idx + mem_head_len + head.capacity + mem_tail_len
        if (idx >= this.buffer.byteLength) return -1
        return idx
    }

    private __alloc(len: number): { idx: number, len: number } {
        if (this._capacity < len) {
            if (!this.buffer.growable) throw new Error("OOM");
            const byteLength = this.buffer.byteLength
            const grow = Math.max(len - this._capacity, byteLength)
            this.buffer.grow(grow)
            this._capacity += this.buffer.byteLength - byteLength
            if (this._capacity < len) throw new Error("OOM")
        }
        const ret = { idx: this._freeidx, len }
        this._freeidx += len;
        this._capacity -= len;

        // set head
        this._sethead(ret.idx, { ref: 0, capacity: len - mem_head_len - mem_tail_len })
        // set tail
        this._settail(ret.idx, { free: false, capacity: len - mem_head_len - mem_tail_len })
        return ret;
    }

    private _alloc(len: number): { idx: number, len: number } {
        len = align4bytes(len) + mem_head_len + mem_tail_len
        if (this.freebuffer.length === 0) {
            return this.__alloc(len)
        }
        const idx = lowerBound(this.freebuffer, len)
        if (idx >= this.freebuffer.length) {
            // 不存在足够大的
            return this.__alloc(len)
        }
        const mem = {idx: this.freebuffer[idx].idxs.pop()!, len: this.freebuffer[idx].len}
        if (this.freebuffer[idx].idxs.length === 0) {
            this.freebuffer.splice(idx, 1)
        }
        if (mem.len >= len * 2) {
            // todo 拆分mem
        }
        this._settail(mem.idx, { free: false, capacity: mem.len - mem_head_len - mem_tail_len })
        return mem
    }

    private _free(index: { idx: number, len: number }) {
        const head = this._gethead(index.idx)
        const tail = this._gettail(index.idx)
        if (head.ref > 0) throw new Error();
        if (tail.free) throw new Error();
        if (head.capacity !== tail.capacity) throw new Error();

        // todo 合并前后空闲内存块

        this._settail(index.idx, { free: true, capacity: head.capacity })
        const len = head.capacity + mem_head_len + mem_tail_len
        const idx = lowerBound(this.freebuffer, len)
        if (idx >= this.freebuffer.length || idx < 0) {
            this.freebuffer.push({ len, idxs: [index.idx] })
        } else if (this.freebuffer[idx].len === len) {
            this.freebuffer[idx].idxs.push(index.idx)
        } else {
            this.freebuffer.splice(idx, 0, { len, idxs: [index.idx] })
        }
    }

    update(index: { idx: number, len: number }, value: Uint8Array) {
        const head = this._gethead(index.idx)

        const buffer = new Uint8Array(this.buffer)
        if (head.ref > 0 || head.capacity <= value.length) {
            index = this._alloc(value.length)
        }

        buffer.set(value, index.idx + mem_head_len)
        buffer.fill(0, index.idx + mem_head_len + value.length) // 最后填充0
        return { idx: index.idx, len: value.length }
    }
    put(value: Uint8Array): { idx: number, len: number } {
        const index = this._alloc(value.length)
        const buffer = new Uint8Array(this.buffer, index.idx + mem_head_len)
        buffer.set(value)
        buffer.fill(0, value.length) // 最后填充0
        return { idx: index.idx, len: value.length }
    }
    get(index: { idx: number, len: number }): Uint8Array {
        return new Uint8Array(this.buffer, index.idx + mem_head_len, index.len)
    }

    private _incRef(index: { idx: number, len: number }) {
        const head = this._gethead(index.idx)
        ++head.ref;
        this._sethead(index.idx, head)
    }

    private _decRef(index: { idx: number, len: number }) {
        const head = this._gethead(index.idx)
        if (head.ref <= 0) throw new Error()
        --head.ref;
        this._sethead(index.idx, head)
        if (head.ref === 1) this._free(index)
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