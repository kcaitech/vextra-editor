import { Shape, Watchable } from "@kcdesign/data";
import { Context } from ".";
export class Component extends Watchable(Object) {
    static BRIDGE_CHANGE = 1;
    static WONDER_CHANGE = 2;
    private m_context: Context;
    private m_bridge: boolean = false;
    private m_wonder: Shape | undefined;
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
}