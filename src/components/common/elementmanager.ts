import { nextTick, watch } from "vue";
import { Context } from "@/context";
import { v4 } from "uuid";

export type ElementStatus = {
    id: string;
    visible: boolean;
}

export class ElementManager { /* 可用于窗口状态处理，窗口应该要是一个DIV类型的元素 */
    private m_left: number;
    private m_top: number;
    private m_offset_l: number;
    private m_offset_t: number;
    private m_white_list: string[];
    private m_stop: any = undefined;

    constructor(
        private context: Context,
        private element: ElementStatus,
        init?: {
            left?: number;
            top?: number;
            offsetTop?: number;
            offsetLeft?: number;
            whiteList?: string[];
        }
    ) {
        this.m_left = init?.left ?? 0;
        this.m_top = init?.top ?? 0;
        this.m_offset_l = init?.offsetLeft ?? 0;
        this.m_offset_t = init?.offsetTop ?? 0;
        this.m_white_list = init?.whiteList ?? [];

        this.m_stop = watch(() => this.element.visible, (val) => {
            if (!val) this.removeEvent();
        });
    }

    get left() {
        return this.m_left;
    }

    set left(val: number) {
        this.m_left = val;
    }

    get top() {
        return this.m_top;
    }

    set top(val: number) {
        this.m_top = val;
    }

    get offsetLeft() {
        return this.m_offset_l;
    }

    set offsetLeft(val: number) {
        this.m_offset_l = val;
    }

    get offsetTop() {
        return this.m_offset_t;
    }

    set offsetTop(val: number) {
        this.m_offset_t = val;
    }

    private trigger: Element | undefined;
    private scope: Element | undefined;

    showBy(trigger: Element /*触发元素*/, params?: { scope?: Element, protect?: boolean }) {
        if (this.element.visible) {
            this.element.visible = false;
            return;
        }

        this.trigger = trigger;
        this.scope = params?.scope;
        this.element.visible = true;

        /*保护状态下只有关闭按钮可以直接将改弹窗关闭, 否则添加其他辅助关闭事件*/
        if (!params?.protect) {
            this.context.escstack.save(v4(), () => {
                const achieve = this.element.visible;
                this.element.visible = false;
                return achieve;
            });
            document.addEventListener('mousedown', this.downCheck);
        }

        nextTick(this.locate.bind(this));
    }

    private get target() {
        return (this.scope ?? document).querySelector(`#${this.element.id}`) as HTMLDivElement;
    }

    private locate() {
        const fromPreset = () => {
            return {left: this.left, top: this.top};
        }
        const fromTrigger = () => {
            const trigger = this.trigger!;
            const triggerRect = trigger.getBoundingClientRect();
            return {left: triggerRect.left + this.offsetLeft, top: triggerRect.top + this.offsetTop};
        }

        const target = this.target;
        const rect = target.getBoundingClientRect();

        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        let {left, top} = this.trigger ? fromTrigger() : fromPreset();

        const exceedW = clientWidth - (left + rect.width);
        if (exceedW < 0) left = Math.max(0, left + exceedW);
        const exceedH = clientHeight - (top + rect.height);
        if (exceedH < 0) top = Math.max(0, top + exceedH);

        target.style.position = "fixed";
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
    }

    private __downCheck(event: MouseEvent) {
        if (!(event.target instanceof Element)) return;
        for (const query of this.m_white_list) {
            if (event.target.closest(query)) return;
        }
        this.element.visible = false;
    }

    private downCheck = this.__downCheck.bind(this);

    private removeEvent() {
        document.removeEventListener("mousedown", this.downCheck);
    }

    unmounted() {
        this.removeEvent();
        this.m_stop?.();
    }

    close() {
        this.element.visible = false;
    }
}