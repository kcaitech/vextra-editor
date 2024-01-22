import { WatchableObject, Gradient } from "@kcdesign/data";

export class ColorCtx extends WatchableObject {
    static CHANGE_STOP = 1;
    static COLOR_EDITOR = 2;
    static STOP_DELETE = 3;
    private m_selected_stop: number = -1;
    private editor_mode: boolean = false;
    private m_gradient: undefined | Gradient = undefined;
    constructor() {
        super();
    }
    select_stop(index: number) {
        this.m_selected_stop = index;
        this.notify(ColorCtx.CHANGE_STOP)
    }
    get selected_stop() {
        return this.m_selected_stop;
    }
    switch_editor_mode(val: boolean, gradient?: Gradient) {
        this.editor_mode = val && !!gradient;
        this.m_gradient = gradient;
        this.notify(ColorCtx.COLOR_EDITOR);
    }
    get mode() {
        return this.editor_mode;
    }
    get gradient() {
        return this.m_gradient
    }
}