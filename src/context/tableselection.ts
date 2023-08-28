import { TableShape, TableCell, Notifiable, TableGridItem } from "@kcdesign/data";
import { ClientXY, Selection } from "./selection"
import { Context } from ".";
export class TableSelection implements Notifiable {
    private m_shape: TableShape;
    private m_notify: Notifiable;
    // table
    private m_tableRowStart: number = -1;
    private m_tableRowEnd: number = -1;
    private m_tableColStart: number = -1;
    private m_tableColEnd: number = -1;
    private m_context: Context;
    private m_editing_cell: TableGridItem & { cell: TableCell | undefined } | undefined;

    constructor(shape: TableShape, context: Context, notify: Notifiable) {
        this.m_shape = shape;
        this.m_context = context;
        this.m_notify = notify;
    }

    get shape() {
        return this.m_shape;
    }

    notify(...args: any[]): void {
        this.m_notify.notify(...args);
    }

    resetSelection() {
        this.m_tableRowStart = -1;
        this.m_tableRowEnd = -1;
        this.m_tableColStart = -1;
        this.m_tableColEnd = -1;
        this.notify(Selection.CHANGE_TABLE_CELL);
    }

    get tableRowStart() {
        return this.m_tableRowStart;
    }
    get tableRowEnd() {
        return this.m_tableRowEnd;
    }
    get tableColStart() {
        return this.m_tableColStart;
    }
    get tableColEnd() {
        return this.m_tableColEnd;
    }
    get editingCell() {
        return this.m_editing_cell;
    }
    setEditingCell(cell?: TableGridItem & { cell: TableCell | undefined }) {
        if (cell) this.resetSelection(); // 进入编辑状态默认清除所有选区
        this.m_editing_cell = cell;
        console.log('this.m_editing_cell', this.m_editing_cell);
        this.notify(Selection.CHANGE_EDITING_CELL);
    }
    getSelectedCells(visible: boolean = true): {
        cell: TableCell | undefined;
        rowIdx: number;
        colIdx: number;
    }[] {
        if (visible) return this.m_shape.getVisibleCells(this.m_tableRowStart,
            this.m_tableRowEnd,
            this.m_tableColStart,
            this.m_tableColEnd);
        return this.m_shape.getCells(this.m_tableRowStart,
            this.m_tableRowEnd,
            this.m_tableColStart,
            this.m_tableColEnd);
    }

    // table
    /**
     * @param gen_menu_posi 默认产生小菜单位置
     */
    selectTableCellRange(rowStart: number, rowEnd: number, colStart: number, colEnd: number, gen_menu_posi = true) {
        if (this.m_tableRowStart !== rowStart ||
            this.m_tableRowEnd !== rowEnd ||
            this.m_tableColStart !== colStart ||
            this.m_tableColEnd !== colEnd) {
            this.m_tableRowStart = rowStart;
            this.m_tableRowEnd = rowEnd;
            this.m_tableColStart = colStart;
            this.m_tableColEnd = colEnd;
            this.notify(Selection.CHANGE_TABLE_CELL, gen_menu_posi);
        }
    }
    selectTableCell(rowIdx: number, colIdx: number, gen_menu_posi = true) {
        if (this.m_tableRowStart !== this.m_tableRowEnd ||
            this.m_tableRowStart !== rowIdx ||
            this.m_tableColStart !== this.m_tableColEnd ||
            this.m_tableColStart !== colIdx) {
            this.m_tableRowStart = this.m_tableRowEnd = rowIdx;
            this.m_tableColStart = this.m_tableColEnd = colIdx;
            this.notify(Selection.CHANGE_TABLE_CELL, gen_menu_posi);
        }
    }
}