import { Shape, Watchable } from "@kcdesign/data";
import { Context } from ".";
import { SymbolListItem } from '@/utils/symbol';
export class Component extends Watchable(Object) {
    static BRIDGE_CHANGE = 1;
    static WONDER_CHANGE = 2;
    static EXTEND_FOLDER = 3;
    static CONTAINER_INIT = 4;
    static CARD_TYPE_CHANGE = 5;
    static COMP_MENU = 6;
    private m_context: Context;
    private m_bridge: boolean = false;
    private m_wonder: Shape | undefined;
    private m_component_list_status_set: Set<string> = new Set();
    private m_card_type: 'alpha' | 'beta' = 'beta';

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
    set_list_status(v: string) {
        if (this.m_component_list_status_set.has(v)) {
            this.m_component_list_status_set.delete(v);
        } else {
            this.m_component_list_status_set.add(v);
        }
        this.notify(Component.EXTEND_FOLDER);
    }
    isExtend(item: SymbolListItem) {
        return this.m_component_list_status_set.has(item.id);
    }
    get list_status() {
        return this.m_component_list_status_set;
    }
    reset_list_status() {
        this.m_component_list_status_set.clear();
    }
    get card_type() {
        return this.m_card_type;
    }
    set_card_type(v: 'alpha' | 'beta') {
        this.m_card_type = v;
        this.notify(Component.CARD_TYPE_CHANGE);
    }
    compMenuMount(shape: Shape, e: MouseEvent) {
        this.notify(Component.COMP_MENU, shape, e);
    }
}