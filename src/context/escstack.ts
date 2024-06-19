import { IEscStack } from "@/openapi";


interface EscItem {
    key: string
    task: () => boolean
}

export class EscStack implements IEscStack {
    private m_stack_map: Map<string, EscItem> = new Map();

    // constructor() {
    //     super();
    // }
    save(key: string, call: () => boolean) {
        if (this.m_stack_map.has(key)) { // 先删后加，保持先来的后出
            this.m_stack_map.delete(key);
        }
        this.m_stack_map.set(key, {key: key, task: call});
    }

    remove(key: string) {
        this.m_stack_map.delete(key);
    }

    has(key: string) {
        return this.m_stack_map.has(key);
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

    clear() {
        const queue = Array.from(this.m_stack_map.values());
        while (queue.length) {
            const f = queue.pop()?.task;
            if (typeof f !== 'function') continue;
            f();
        }
        this.m_stack_map.clear();
    }
}