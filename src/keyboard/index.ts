/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";

interface AddEventListenerOptionsEx extends AddEventListenerOptions {
    watchInput?: boolean; // 处理输入框内的键盘事件
}

export class KeyboardMgr {
    constructor(private context: Context) {
    }

    private map: Map<Function, (ev: Event) => void> = new Map();

    addEventListener(type: string, listener: Function, options?: boolean | AddEventListenerOptionsEx | undefined) {
        const handler = (event: Event) => {
            // todo 后续应该将权限相关逻辑抽离到这里

            if (this.context.inactive) return; // 焦点不在当前文档，阻止键盘事件继续执行

            const target = event.target as HTMLElement;

            if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
                (!(typeof options === 'object') || !options?.watchInput)) return;

            listener(event, this.context);
        };

        this.map.set(listener, handler);

        document.addEventListener(type, handler, options);

        return () => document.removeEventListener(type, handler);
    }

    removeEventListener(type: string, listener: Function) {
        const handler = this.map.get(listener);
        if (handler) {
            this.map.delete(listener);
            document.removeEventListener(type, handler);
        }
    }
}