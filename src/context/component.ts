import {Shape, ShapeView, Variable, WatchableObject} from "@kcdesign/data";
import {Context} from ".";

export class Component extends WatchableObject {
    static BRIDGE_CHANGE = 1;
    static WONDER_CHANGE = 2;
    static CARD_TYPE_CHANGE = 5;
    static COMP_MENU = 6;
    static SELECTED_VAL = 7;
    private m_context: Context;
    private m_bridge: boolean = false;
    private m_wonder: Shape | undefined;
    private m_into_view_after_mounted: string | undefined = undefined;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get bridge() {
        return this.m_bridge;
    }

    set_brige_status(status: boolean) {        
        this.m_bridge = status;
        this.notify(Component.BRIDGE_CHANGE);
    }

    get wonder() {
        return this.m_wonder;
    }

    register_wonder(shape: Shape) {
        this.m_wonder = shape;
        this.notify(Component.WONDER_CHANGE);
    }

    logout_wonder() {
        this.m_wonder = undefined;
        this.notify(Component.WONDER_CHANGE);
    }

    get into_view_target() {
        return this.m_into_view_after_mounted;
    }

    set_scroll_target(id: string | undefined) {
        this.m_into_view_after_mounted = id;
    }

    is_need_into_view(id: string) {
        if (!this.m_into_view_after_mounted) return false;
        return id === this.m_into_view_after_mounted;
    }

    compMenuMount(shape: Shape, e: MouseEvent) {
        this.notify(Component.COMP_MENU, shape, e);
    }
}