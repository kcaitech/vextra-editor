import { TableShape, TableCell, Notifiable, TableGridItem } from "@kcdesign/data";
import { ClientXY, Selection } from "./selection"
import { Context } from ".";
export type TableArea = 'invalid' | 'move' | 'body' | 'content';
export class TableSelection implements Notifiable {
    private m_shape: TableShape;
    private m_notify: Notifiable;
    // table
    private m_tableRowStart: number = -1;
    private m_tableRowEnd: number = -1;
    private m_tableColStart: number = -1;
    private m_tableColEnd: number = -1;
    private m_table_area: { id: TableArea, area: string }[] = [];
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

    reset() {
        this.m_tableRowStart = -1;
        this.m_tableRowEnd = -1;
        this.m_tableColStart = -1;
        this.m_tableColEnd = -1;
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
        if (cell) {
            this.reset();
            this.notify(Selection.CHANGE_TABLE_CELL);
        }
        this.m_editing_cell = cell;
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
     * @param gen_menu_posi 默认产生菜单位置
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
        console.log('====', rowIdx, colIdx);

        if (this.m_tableRowStart !== this.m_tableRowEnd ||
            this.m_tableRowStart !== rowIdx ||
            this.m_tableColStart !== this.m_tableColEnd ||
            this.m_tableColStart !== colIdx) {
            this.m_tableRowStart = this.m_tableRowEnd = rowIdx;
            this.m_tableColStart = this.m_tableColEnd = colIdx;
            this.notify(Selection.CHANGE_TABLE_CELL, gen_menu_posi);
        }
    }
    getArea(p: ClientXY): TableArea {
        let area: TableArea = 'invalid';
        const scout = this.m_context.selection.scout;
        for (let i = 0, len = this.m_table_area.length; i < len; i++) {
            const a = this.m_table_area[i];
            if (scout!.isPointInPath(a.area, p)) {
                area = a.id;
                break;
            }
        }
        return area;
    }
    setArea(table_area: { id: TableArea, area: string }[]) {
        this.m_table_area = table_area;
    }
}