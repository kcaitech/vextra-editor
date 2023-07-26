import { styleSheetController } from "@/utils/cursor";
import { Watchable } from "@kcdesign/data";
import { Context } from ".";
export class Cursor extends Watchable(Object) {
    static CHANGE_CURSOR = 1;
    static RESET = 2;
    private m_current_cursor_type: string = '';
    private m_context: Context;
    private m_styler = styleSheetController();
    private m_freeze: boolean = false;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    async init() {
        await this.m_styler.setup();
        const auto = await this.m_styler.getClass('auto-0');
        if (!auto) return;
        this.notify(Cursor.CHANGE_CURSOR, auto);
    }
    get type() {
        return this.m_current_cursor_type;
    }
    cursor_freeze(val: boolean) {
        this.m_freeze = val;
    }
    async setType(type: string, force = false) {
        if (this.m_freeze) return;
        if (this.m_context.workspace.transforming && !force) return;
        const res = await this.m_styler.getClass(type);
        if (!res) return;
        this.m_current_cursor_type = res;        
        this.notify(Cursor.CHANGE_CURSOR, res);
    }
    async reset() {
        if (this.m_freeze) return;
        if (this.m_context.workspace.transforming) return;
        const auto = await this.m_styler.getClass('auto-0');
        if (!auto) return;
        this.m_current_cursor_type = auto;
        this.notify(Cursor.CHANGE_CURSOR, auto);
    }
}