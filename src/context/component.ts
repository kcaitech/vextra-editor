import { Shape, Watchable } from "@kcdesign/data";
import { Context } from ".";
export class Component extends Watchable(Object) {
    static BRIDGE_CHANGE = 1;
    static WONDER_CHANGE = 2;
    static EXTEND_FOLDER = 3;
    private m_context: Context;
    private m_bridge: boolean = false;
    private m_wonder: Shape | undefined;
    private m_list_action_target: string = '';
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
    get list_action_target() {
        return this.m_list_action_target;
    }
    set_list_action_target(v: string) {
        this.m_list_action_target = v;
        this.notify(Component.EXTEND_FOLDER);
    }
}