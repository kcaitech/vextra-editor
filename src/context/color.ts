import { GradientFrom } from "@/components/Document/Selection/Controller/ColorEdit/gradient_utils";
import { WatchableObject, Gradient, GradientType } from "@kcdesign/data";

export class ColorCtx extends WatchableObject {
    static CHANGE_STOP = 1;
    static COLOR_EDITOR = 2;
    static STOP_DELETE = 3;
    static CHANGE_GRADIENT_TYPE = 4;
    static GRADIENT_UPDATE = 5;
    private m_selected_stop: string | undefined = undefined;
    private editor_mode: boolean = false;
    private m_gradient: undefined | Gradient = undefined;
    private m_gradient_type: GradientType | undefined = undefined;
    private m_locat: { index: number, type: GradientFrom } | undefined;
    constructor() {
        super();
    }
    select_stop(id: string | undefined) {
        this.m_selected_stop = id;
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
    set_gradient_type(type: GradientType | undefined) {
        this.m_gradient_type = type;
        this.notify(ColorCtx.CHANGE_GRADIENT_TYPE);
    }
    get gradient_type() {
        return this.m_gradient_type;
    }
    get mode() {
        return this.editor_mode;
    }
    get gradient() {
        return this.m_gradient
    }
    gradinet_locat(locat: { index: number, type: GradientFrom } | undefined) {
        this.m_locat = locat;
    }
    get locat() {
        return this.m_locat;
    }
    clear_locat() {
        this.m_locat = undefined;
    }
}