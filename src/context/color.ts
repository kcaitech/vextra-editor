import { Watchable } from "@kcdesign/data";

export class ColorCtx extends Watchable(Object) {
    static CHANGE_STOP = 1;
    private m_selected_stop: number = -1;
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
}