import { TableShape, TableCell, Notifiable } from "@kcdesign/data";
import { Selection } from "./selection"

export class TableSelection implements Notifiable {
    private m_shape: TableShape;
    private m_notify: Notifiable;
    // table
    private m_tableRowStart: number = -1;
    private m_tableRowEnd: number = -1;
    private m_tableColStart: number = -1;
    private m_tableColEnd: number = -1;

    constructor(shape: TableShape, notify: Notifiable) {
        this.m_shape = shape;
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
    getSelectedCells(visible: boolean = true): TableCell[] {
        return this.m_shape.getCells(this.m_tableRowStart,
            this.m_tableRowEnd,
            this.m_tableColStart,
            this.m_tableColEnd
            );
    }

    // table
    selectTableCellRange(rowStart: number, rowEnd: number, colStart: number, colEnd: number) {
        if (this.m_tableRowStart !== rowStart ||
            this.m_tableRowEnd !== rowEnd ||
            this.m_tableColStart !== colStart ||
            this.m_tableColEnd !== colEnd) {

            this.m_tableRowStart = rowStart;
            this.m_tableRowEnd = rowEnd;
            this.m_tableColStart = colStart;
            this.m_tableColEnd = colEnd;

            this.notify(Selection.CHANGE_TABLE_CELL);
        }
    }
    selectTableCell(cell: TableCell, rowIdx: number, colIdx: number) {
        if (this.m_tableRowStart !== this.m_tableRowEnd ||
            this.m_tableRowStart !== rowIdx ||
            this.m_tableColStart !== this.m_tableColEnd ||
            this.m_tableColStart !== colIdx) {
            this.m_tableRowStart = this.m_tableRowEnd = rowIdx;
            this.m_tableColStart = this.m_tableColEnd = colIdx;
            this.notify(Selection.CHANGE_TABLE_CELL);
        }
    }

}