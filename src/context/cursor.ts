import { styleSheetController } from "@/utils/cursor";
import { WatchableObject } from "@kcdesign/data";
import { Context } from ".";

export class Cursor extends WatchableObject {
    static CHANGE_CURSOR = 1;
    static RESET = 2;
    private m_current_cursor_type: string = '';
    private m_context: Context;
    private m_styler = styleSheetController();
    private m_freeze: boolean = false;
    private m_auto: string = '';
    private m_reseted: boolean = true;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    async init() {
        await this.m_styler.setup();
        this.m_auto = `auto-0-${this.m_styler.getId()}`;
        const auto = await this.m_styler.getClass('auto-0');
        if (!auto) {
            return;
        }

        this.notify(Cursor.CHANGE_CURSOR, auto);
    }

    get type() {
        return this.m_current_cursor_type;
    }

    cursor_freeze(val: boolean) {
        this.m_freeze = val;
    }

    async setType(type: string, force = false) {
        if (this.m_freeze) {
            console.log('this.m_freeze');

            return;
        }
        if (this.m_context.workspace.transforming && !force) {
            console.log('this.m_context.workspace.transforming && !force');

            return;
        }
        this.m_reseted = false;
        let res = await this.m_styler.getClass(type) || this.m_auto;
        if (this.m_reseted) {
            res = this.m_auto;
        }
        this.m_current_cursor_type = res;
        console.log('this.m_current_cursor_type:', this.m_current_cursor_type);

        this.notify(Cursor.CHANGE_CURSOR, res);
    }

    reset() {
        if (this.m_freeze) return;
        if (this.m_context.workspace.transforming) return;
        this.m_current_cursor_type = this.m_auto;
        this.m_reseted = true;
        this.notify(Cursor.CHANGE_CURSOR, this.m_auto);
    }
}