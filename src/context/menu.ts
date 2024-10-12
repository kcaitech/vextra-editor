import { WatchableObject } from "@kcdesign/data";
import { Context } from ".";
import { v4 } from "uuid";
import { set } from "lodash";

export enum CellMenu {
    MultiSelect = 'multiCells', //多选单元格时
    SelectRow = 'row', //选中整行单元格
    selectCol = 'col' //选中整列单元格
}

export class Menu extends WatchableObject {
    static SHUTDOWN_MENU = 1;
    static SHUTDOWN_POPOVER = 2;
    static REMOVE_COLOR_PICKER = 3;
    static SHOW_PLACEMENT = 4;
    static HIDE_PLACEMENT = 5;
    static CHANGE_USER_CURSOR = 6;
    static OPEN_SPLIT_CELL = 7;
    static CLOSE_COMP_MENU = 8;
    static LABLE_PLATFROM_CHANGE = 11;
    static LABLE_MULRIPLE = 9;
    static SHUTDOWN_LABLE_MENU = 10;
    static SHADOW_POSITION_MENU = 11;
    static SHADOW_CUTOUT_ARGS_MENU = 12;
    static CLOSE_INSTANCE_ATTR_MENU = 13;
    // static OPEN_SHORTCUTS = 14;
    static WRITE_MEDIA = 15;
    static UPDATE_LOCATE = 16;
    static EXPORT_DIALOG = 17;
    static WRITE_MEDIA_LAZY = 18;
    static AUTO_LAYOUT = 19;
    private m_menu_mounted: string = '';
    private m_popover: boolean = false;
    private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
    private m_user_cursor_visible: boolean = true;
    private m_context: Context;
    private m_platfrom: number = 1;
    private m_mulriple: number = 1;
    private m_mulriple_i: number = 1
    private m_lable_menu_mounted: string = '';
    private m_cell_menu_type: CellMenu | undefined;
    private m_export_dialog: boolean = false;

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get isMenuMount() {
        return this.m_menu_mounted;
    }

    get ispopover() {
        return this.m_popover;
    }

    get isUserCursorVisible() {
        return this.m_user_cursor_visible;
    }

    setPopoverVisible(v: boolean) {
        this.m_popover = v;
    }

    menuMount(mount?: string) {
        this.m_menu_mounted = mount || '';
        if (!mount) this.notify(Menu.SHUTDOWN_MENU);
    }

    get isColorPickerMount() {
        return this.m_color_picker;
    }

    setupColorPicker(id: string) {
        this.m_color_picker = id;
        this.m_context.escstack.save(v4(), this.removeColorPicker.bind(this));
    }

    clearColorPickerId() {
        this.m_color_picker = undefined;
    }

    removeColorPicker() {
        if (!this.m_color_picker) return false;
        this.notify(Menu.REMOVE_COLOR_PICKER, this.m_color_picker);
        this.m_color_picker = undefined;
        return true;
    }

    setVisibleCursor(visible: boolean) {
        this.m_user_cursor_visible = visible;
        this.notify(Menu.CHANGE_USER_CURSOR);
    }

    setSplitCell(mount?: string) {
        // this.m_split_cell = mount || '';
        if (mount) {
            this.notify(Menu.OPEN_SPLIT_CELL, mount);
        }
    }

    get isPlatfrom() {
        return this.m_platfrom;
    }

    setPlatfrom(v: number) {
        this.m_platfrom = v;
        this.notify(Menu.LABLE_PLATFROM_CHANGE);
    }

    get isMulriple() {
        return this.m_mulriple;
    }

    get isMulripleI() {
        return this.m_mulriple_i;
    }

    setLableMulriple(v: number, i: number) {
        this.m_mulriple = v;
        this.m_mulriple_i = i;
        this.notify(Menu.LABLE_MULRIPLE);
    }

    get isLableMenuMount() {
        return this.m_lable_menu_mounted;
    }

    lableMenuMount(mount?: string) {
        this.m_lable_menu_mounted = mount || '';
        if (!mount) this.notify(Menu.SHUTDOWN_LABLE_MENU);
    }

    shadowPositionMenu() {
        this.notify(Menu.SHADOW_POSITION_MENU);
    }

    get cellMenuType() {
        return this.m_cell_menu_type;
    }

    setCellMenuType(type: CellMenu | undefined) {
        this.m_cell_menu_type = type;
    }

    get isExportDialog() {
        return this.m_export_dialog;
    }

    setExportDialog(visible: boolean) {
        this.m_export_dialog = visible;
        this.notify(Menu.EXPORT_DIALOG);
    }
}