/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { IEscStack } from "@/openapi";
import { debounce } from "lodash";

interface EscItem {
    key: string
    task: () => boolean
}

export class EscStack implements IEscStack {
    private m_stack_map: Map<string, EscItem> = new Map();

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

    private _execute() {
        const queue = Array.from(this.m_stack_map.values());
        for (let i = queue.length - 1; i > -1; i--) {
            const item = queue[i];
            this.m_stack_map.delete(item.key);
            if (typeof item.task !== 'function') continue;
            if (item.task()) break;
        }
    }

    // debounce 防止被多次调用
    execute = debounce(this._execute.bind(this), 60);

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