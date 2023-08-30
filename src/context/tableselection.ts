import { TableCell, TableGridItem, Watchable, ShapeType } from "@kcdesign/data";
import { Context } from ".";
export class TableSelection extends Watchable(Object) {
    static CHANGE_TABLE_CELL = 1;
    static CHANGE_EDITING_CELL = 2;
    private m_tableRowStart: number = -1;
    private m_tableRowEnd: number = -1;
    private m_tableColStart: number = -1;
    private m_tableColEnd: number = -1;
    private m_editing_cell: TableGridItem & { cell: TableCell | undefined } | undefined;
    private m_context: Context;
    constructor(cxt: Context) {
        super();
        this.m_context = cxt;
    }

    get shape() {
        return this.m_shape;
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
    resetSelection() {
        this.m_tableRowStart = -1;
        this.m_tableRowEnd = -1;
        this.m_tableColStart = -1;
        this.m_tableColEnd = -1;
        this.notify(TableSelection.CHANGE_TABLE_CELL);
    }
    setEditingCell(cell?: TableGridItem & { cell: TableCell | undefined }) {
        if (cell) this.resetSelection(); // 进入编辑状态默认清除所有选区
        this.m_editing_cell = cell;
        this.notify(TableSelection.CHANGE_EDITING_CELL);
    }
    getSelectedCells(visible: boolean = true): {
        cell: TableCell | undefined;
        rowIdx: number;
        colIdx: number;
    }[] {
        const shape = this.m_context.selection.selectedShapes[0];
        if (shape && shape.type === ShapeType.Table) {
            if (visible) return shape.getVisibleCells(this.m_tableRowStart,
                this.m_tableRowEnd,
                this.m_tableColStart,
                this.m_tableColEnd);
            return shape.getCells(this.m_tableRowStart,
                this.m_tableRowEnd,
                this.m_tableColStart,
                this.m_tableColEnd);
        } else return []

    }
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
            this.notify(TableSelection.CHANGE_TABLE_CELL, gen_menu_posi);
        }
    }
    selectTableCell(rowIdx: number, colIdx: number, gen_menu_posi = true) {
        if (this.m_tableRowStart !== this.m_tableRowEnd ||
            this.m_tableRowStart !== rowIdx ||
            this.m_tableColStart !== this.m_tableColEnd ||
            this.m_tableColStart !== colIdx) {
            this.m_tableRowStart = this.m_tableRowEnd = rowIdx;
            this.m_tableColStart = this.m_tableColEnd = colIdx;
            this.notify(TableSelection.CHANGE_TABLE_CELL, gen_menu_posi);
        }
    }
}