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
        
        const auto = await this.m_styler.getClass('auto', 0);
        if (!auto) {
            return;
        }

        this.m_auto = auto;

        this.notify(Cursor.CHANGE_CURSOR, auto);
    }

    get type() {
        return this.m_current_cursor_type;
    }

    cursor_freeze(val: boolean) {
        this.m_freeze = val;
    }

    async setType(type: string, rotate: number) {
        if (this.m_freeze) {
            return;
        }

        let res = await this.m_styler.getClass(type, rotate) || this.m_auto;

        this.m_current_cursor_type = res;
        this.notify(Cursor.CHANGE_CURSOR, res);
    }

    async setTypeForce(type: string, rotate: number) {
        let res = await this.m_styler.getClass(type, rotate) || this.m_auto;

        this.m_current_cursor_type = res;
        this.notify(Cursor.CHANGE_CURSOR, res);
    }

    reset() {
        if (this.m_freeze) {
            return;
        }

        this.m_current_cursor_type = this.m_auto;

        this.notify(Cursor.CHANGE_CURSOR, this.m_auto);
    }

    resetForce() {
        this.m_current_cursor_type = this.m_auto;

        this.notify(Cursor.CHANGE_CURSOR, this.m_auto);
    }
}