import {WatchableObject} from "@kcdesign/data";

interface EscItem {
    key: string
    task: Function
}

export class EscStack extends WatchableObject {
    private m_stack_map: Map<string, EscItem> = new Map();

    constructor() {
        super();
    }

    keyboardHandle(event: KeyboardEvent) {
        const {code, shiftKey} = event;
        if (code !== 'Escape') return;
        if (shiftKey) {
            this.clear_stack();
        } else {
            this.execute();
        }
    }

    save(key: string, call: Function) {
        if (this.m_stack_map.has(key)) { // 先删后加，保持先来的后出
            this.m_stack_map.delete(key);
        }
        this.m_stack_map.set(key, {key: key, task: call});
    }

    remove(key: string) {
        this.m_stack_map.delete(key);
    }

    execute() {
        const queue = Array.from(this.m_stack_map.values());
        for (let i = queue.length - 1; i > -1; i--) {
            const item = queue[i];
            this.m_stack_map.delete(item.key);
            if (typeof item.task !== 'function') continue;
            if (item.task()) break;
        }
    }

    clear_stack() {
        const queue = Array.from(this.m_stack_map.values());
        while (queue.length) {
            const f = queue.pop()?.task;
            if (typeof f !== 'function') continue;
            f();
        }
    }
}