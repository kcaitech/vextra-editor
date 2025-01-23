import { nextTick, watch } from "vue";
import { Context } from "@/context";
import { Selection } from "@/context/selection";
import { v4 } from "uuid";

export type ElementStatus = {
    id: string;
    visible: boolean;
}

/*以下是一段测试代码，记得删*/
const counter = new Set<any>();
(window as any).__event_counter = counter;

/*==end==*/

export class ElementManager { /* 可用于窗口状态处理，窗口应该要是一个DIV类型的元素 */
    private m_left: number;
    private m_top: number;
    private m_offset_l: number;
    private m_offset_t: number;
    private m_white_list: string[];
    private m_stop: any[] = [];

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

        this.m_stop.push(watch(() => this.element.visible, (val) => !val && this.removeEvent()));
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

    private trigger: Element | null = null;
    private scope: Element | undefined;
    private m_target: HTMLDivElement | undefined;

    private shutExist(keep: string) { /* 关闭已经打开的同类型弹框 */
        if (keep !== 'no') {
            let events = this.context.eventsMap.get(keep);
            if (!events) {
                events = [];
                this.context.eventsMap.set(keep, events);
            } else {
                let f = events.pop();
                while (f) {
                    f();
                    f = events.pop();
                }
            }
            events.push(() => {
                this.element.visible = false;
            });
        }
    }

    private get target() {
        return this.m_target ?? (this.m_target = (this.scope ?? document).querySelector(this.element.id) as HTMLDivElement);
    }

    private dragging: boolean = false;
    private downXY: { x: number, y: number } = {x: 0, y: 0};
    private clientX: number = 0;
    private clientY: number = 0;

    private _move(event: MouseEvent) {
        const {clientX, clientY} = event;
        if (this.dragging) {
            const dx = clientX - this.downXY.x;
            const dy = clientY - this.downXY.y;
            const left = this.clientX + dx;
            const top = this.clientY + dy;
            const target = this.target;
            target.style.left = `${left}px`;
            target.style.top = `${top}px`;
        } else if (Math.hypot(clientX - this.downXY.x, clientY - this.downXY.y) > 5) this.dragging = true;
    }

    private move = this._move.bind(this);

    private _up(event: MouseEvent) {
        const {clientX, clientY} = event;
        const dx = clientX - this.downXY.x;
        const dy = clientY - this.downXY.y;
        this.clientX = this.clientX + dx;
        this.clientY = this.clientY + dy;
        this.dragging = false;
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.up);
    }

    private up = this._up.bind(this);

    private _down(event: MouseEvent) {
        const target = event.target as HTMLDivElement;
        if (!target.classList.contains('header')) return;
        event.stopPropagation();
        this.downXY = {x: event.clientX, y: event.clientY};
        document.addEventListener('mousemove', this.move);
        document.addEventListener('mouseup', this.up);
    }

    private down = this._down.bind(this);

    private initDragEvent() {
        const target = this.target;
        target.addEventListener('mousedown', this.down);
    }

    private locate(once?: { offsetLeft?: number, offsetTop?: number }) {
        const fromPreset = () => {
            return {left: this.left, top: this.top};
        }
        const fromTrigger = () => {
            const trigger = this.trigger!;
            const offsetLeft = once?.offsetLeft ?? this.offsetLeft;
            const offsetTop = once?.offsetTop ?? this.offsetTop;
            const triggerRect = trigger.getBoundingClientRect();
            return {left: triggerRect.left + offsetLeft, top: triggerRect.top + offsetTop};
        }

        const target = this.target;
        const rect = target.getBoundingClientRect();

        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        let {left, top} = this.trigger ? fromTrigger() : fromPreset();

        const exceedW = clientWidth - (left + rect.width);
        if (exceedW < 0) left = Math.max(0, left + exceedW);
        const exceedH = clientHeight - 4 - (top + rect.height);
        if (exceedH < 0) top = Math.max(0, top + exceedH);

        this.clientX = left;
        this.clientY = top;

        target.style.position = "fixed";
        target.style.zIndex = '1';
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
        counter.delete(this.downCheck); // todo 测试代码
        document.removeEventListener("mousedown", this.downCheck);
        this.m_stop.forEach(stop => stop());
    }

    showBy(
        trigger: Element | MouseEvent | null /*触发元素|事件*/,
        params?: {
            scope?: Element,
            protect?: boolean,
            once?: {
                offsetLeft?: number;
                offsetTop?: number;
            },
            fixed?: boolean;
            keep?: string;
        }
    ) {
        if (this.element.visible) {
            this.element.visible = false;
            return;
        }

        this.shutExist(params?.keep ?? 'popover');

        this.m_target = undefined;
        this.trigger = getTriggerFromE(trigger);
        this.scope = params?.scope;
        this.element.visible = true;

        /*保护状态下只有关闭按钮可以直接将改弹窗关闭, 否则添加其他辅助关闭事件*/
        if (!params?.protect) {
            this.m_stop.push(this.context.selection.watch((t: any) => {
                t === Selection.CHANGE_SHAPE && this.close();
            }));
            this.context.escstack.save(v4(), () => {
                const achieve = this.element.visible;
                this.element.visible = false;
                return achieve;
            });
            document.addEventListener('mousedown', this.downCheck);

            counter.add(this.downCheck); // todo 测试代码
        }

        nextTick(() => {
            this.locate(params?.once);
            if (!params?.fixed) this.initDragEvent();
        });

        function getTriggerFromE(e: Element | MouseEvent | null) {
            if (e instanceof MouseEvent) {
                let tgr = e.target as Element;
                if (!(tgr instanceof Element)) return null;
                if (tgr.classList.contains('svg-icon')) tgr = tgr.parentElement as Element;
                return tgr;
            } else return e;
        }
    }

    close() {
        this.element.visible = false;
    }

    unmounted() {
        this.removeEvent();
        this.close();
    }

}