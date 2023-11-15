import {Watchable} from "@kcdesign/data";

export class EscStack extends Watchable(Object) {
    private m_stack_set: Set<Function> = new Set();

    constructor() {
        super();
    }

    keyboardHandle(event: KeyboardEvent) {
        const {code, shiftKey} = event;
        if (code !== 'Escape') return;
        if (shiftKey) {
            this.clear_stack();
        } else {
            this.excute();
        }
    }

    save(call: Function) {
        if (this.m_stack_set.has(call)) { // 先删后加，保持先来的后出
            this.m_stack_set.delete(call);
        }
        this.m_stack_set.add(call);
    }

    remove(call: Function) {
        this.m_stack_set.delete(call);
    }

    excute() {
        const queue = Array.from(this.m_stack_set.values());
        let result: boolean = false;
        while (!result && queue.length) {
            const task = queue.pop();
            if (!task) continue;
            this.m_stack_set.delete(task);
            if (typeof task !== 'function') break;
            result = task();
        }
    }

    clear_stack() {
        const queue = Array.from(this.m_stack_set.values());
        while (queue.length) {
            const f = queue.pop();
            if (typeof f !== 'function') continue;
            f();
        }
    }
}