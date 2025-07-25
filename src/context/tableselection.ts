/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject, ShapeType, TableView, TableCellView } from "@kcaitech/vextra-core";
import { Context } from ".";

export class TableSelection extends WatchableObject {
    static CHANGE_TABLE_CELL = 1;
    static CHANGE_EDITING_CELL = 2;
    private m_tableRowStart: number = -1;
    private m_tableRowEnd: number = -1;
    private m_tableColStart: number = -1;
    private m_tableColEnd: number = -1;
    private m_editing_cell: TableCellView | undefined;
    private m_context: Context;
    private m_menu_visible: boolean = false;
    private m_onCellChange: () => void;
    constructor(cxt: Context, onCellChange: () => void) {
        super();
        this.m_context = cxt;
        this.m_onCellChange = onCellChange;
    }

    // get shape() {
    //     return this.m_shape;
    // }

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
        this.m_editing_cell = undefined;
        this.m_tableRowStart = -1;
        this.m_tableRowEnd = -1;
        this.m_tableColStart = -1;
        this.m_tableColEnd = -1;
        this.notify(TableSelection.CHANGE_TABLE_CELL);
    }
    setEditingCell(cell?: TableCellView) {
        if (this.m_editing_cell === cell) return;
        if (cell) this.resetSelection(); // 进入编辑状态默认清除所有选区
        this.m_editing_cell = cell;
        this.m_onCellChange();
        this.notify(TableSelection.CHANGE_EDITING_CELL);
    }
    getSelectedCells(visible: boolean = true): {
        cell: TableCellView | undefined;
        rowIdx: number;
        colIdx: number;
    }[] {
        const shape = this.m_context.selection.selectedShapes[0];
        if (shape && shape.type === ShapeType.Table && this.m_tableRowStart > -1) {
            const _shape = shape as TableView;
            if (visible) return _shape.getVisibleCells(this.m_tableRowStart,
                this.m_tableRowEnd,
                this.m_tableColStart,
                this.m_tableColEnd);
            return _shape.getCells(this.m_tableRowStart,
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

            this.m_context.escstack.save('table-selection', () => {
                const achieve = this.m_tableRowStart > -1 || this.m_tableColStart > -1;
                this.resetSelection();
                return achieve;
            });
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

            this.m_context.escstack.save('table-selection', () => {
                const achieve = this.m_tableRowStart > -1 || this.m_tableColStart > -1;
                this.resetSelection();
                return achieve;
            });
        }
    }

    setTableMenuVisible(visible: boolean) {
        this.m_menu_visible = visible;
    }
    get tableMenuVRowVisible() {
        return this.m_menu_visible;
    }
}