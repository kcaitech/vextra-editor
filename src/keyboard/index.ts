import { Context } from "@/context";

interface AddEventListenerOptionsEx extends AddEventListenerOptions {
    watchInput?: boolean; // 处理输入框内的键盘事件
}

export class KeyboardMgr {
    constructor(private context: Context) {
    }

    addEventListener(type: string, listener: Function, options?: boolean | AddEventListenerOptionsEx | undefined) {
        const handler = (event: Event) => {
            // todo 抽离权限相关逻辑

            const active = this.context.active; //焦点不在当前文档，阻止键盘事件继续执行
            if (!active && typeof active === 'boolean') return;

            const target = event.target as HTMLElement;

            if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
                (!(typeof options === 'object') || !options?.watchInput)) return;

            listener(event, this.context);
        };

        document.addEventListener(type, handler, options);

        return () => document.removeEventListener(type, handler);
    }
}