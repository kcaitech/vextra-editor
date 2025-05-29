/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ShapeType, TableGridItem, TableCellType, TableCell, TableView, ShapeView, TableCellView } from '@kcdesign/data';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data';
import { ClientXY } from "@/context/selection";
import { Wheel } from "@/utils/wheel";
import { get_range, keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection, TableArea } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { AsyncTransfer } from "@kcdesign/data";
import { useI18n } from 'vue-i18n';
import { TableSelection } from '@/context/tableselection';
import { TextSelectionLite as TextSelection } from '@/context/textselectionlite';
import { DBL_CLICK } from "@/const";
import { KeyboardMgr } from '@/keyboard';

function useControllerCustom(context: Context, i18nT: Function) {
    const workspace = computed(() => context.workspace);
    const workspace_matrix = ref<Matrix>(context.workspace.matrix);
    const matrix = new Matrix();
    const dragActiveDis = 3;
    const TIMER = DBL_CLICK; // 连续点击最大间隔时间
    let isDragging = false;
    let startPosition: ClientXY = { x: 0, y: 0 };
    let root: ClientXY = { x: 0, y: 0 };
    let wheel: Wheel | undefined = undefined;
    let asyncTransfer: AsyncTransfer | undefined = undefined;
    let area: TableArea = 'invalid';
    let move: any, up: any;
    let matrix4table = new Matrix();
    let down_item: (TableGridItem & { cell: TableCellView | undefined }) | undefined;
    let table: TableView = context.selection.selectedShapes[0] as TableView;
    let table_selection: TableSelection;
    let text_selection: TextSelection;
    let down_index: { index: number, before: boolean };
    let point_on_table: { x: number, y: number } = { x: 0, y: 0 };
    let down_type: number = 1; //针对主键 1 单击 2 双击 3 三次点击
    let down_timer: any = null;
    let shapes: ShapeView[] = [];
    let is_diposed: boolean = false;

    function mousedown(e: MouseEvent) {
        if (context.workspace.isPageDragging) {
            return;
        }
        shapes = context.selection.selectedShapes;
        root = context.workspace.root;
        area = context.selection.getArea({ x: e.clientX - root.x, y: e.clientY - root.y });
        // console.log('click-area', area);
        if (area === 'body') {
            workspace.value.setCtrl('controller');
            down4body(e);
        } else if (area === 'content' || area === 'hover') {
            if (is_diposed) {
                return;
            }
            const selection = context.selection;
            const selected = selection.selectedShapes;
            const h = selection.hoveredShape;
            if (!h) {
                selection.resetSelectShapes();
            } else {
                e.shiftKey ? selection.rangeSelectShape([...selected, h]) : selection.selectShape(h);
            }
        } else {
            workspace.value.setCtrl('page');
        }
    }
    function checkStatus() {
        if (workspace.value.isPreToTranslating) {
            const start = workspace.value.startPoint;
            if (!start) return;
            matrix.reset(workspace.value.matrix.inverse);
            set_position(start);
            nextTick(() => {
                mousedown(start);
                workspace.value.preToTranslating(false);
            })
        }
    }

    // #region 4body action
    function check_cell_on_point(e: MouseEvent) {
        const root = workspace.value.root;
        const p = matrix4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
        return table.locateCell(p.x, p.y);
    }
    function check_coord_on_point2(e: MouseEvent) {
        const root = workspace.value.root;
        const p = matrix4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
        return table.locateCellIndex(p.x, p.y);
    }
    function get_matrix4table() {
        const m = table.matrix2Root();
        m.multiAtLeft(workspace.value.matrix);
        matrix4table = (m.inverse.toMatrix());
    }
    function down4body(e: MouseEvent) {
        if (e.button !== 0) return;
        const new_down_item = check_cell_on_point(e);
        if (down_item && ((new_down_item?.index.col !== down_item.index.col) || (new_down_item?.index.row !== down_item.index.row))) init_down_timer();
        down_item = new_down_item;
        if (down_type === 1) down(e) // 单击
        else if (down_type === 2) dbldown();
        else if (down_type === 3) multidown();
        down_type++;
        set_timer();
    }
    function mousemove4body(e: MouseEvent) {
        if (e.buttons !== 1) return;
        const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
        if (isDragging && down_item) {
            startPosition = { ...mousePosition };
            const editingCell = table_selection.editingCell;
            const m_item = check_cell_on_point(e);
            if (!m_item) return;
            if (editingCell && editingCell.cellType === TableCellType.Text) {
                const { rows, rowe, cols, cole } = get_range(down_item.index, m_item.index);
                if (rows !== rowe || cols !== cole) {
                    table_selection.setEditingCell();
                } else {
                    const f = m_item.frame;
                    const point_on_table = matrix4table.computeCoord2(mousePosition.x, mousePosition.y);
                    const xy = { x: point_on_table.x - f.x, y: point_on_table.y - f.y };
                    const text = editingCell.text;
                    if (!text) return;
                    const m_index = editingCell.locateText(xy.x, xy.y);
                    text_selection.selectText(down_index.index, m_index.index);
                }
            } else {
                if (m_item.cell?.id === down_item.cell?.id) {
                    table_selection.setEditingCell(down_item.cell);
                } else {
                    const coord = check_coord_on_point2(e);
                    if (!coord) return;
                    const { rows, rowe, cols, cole } = get_range(down_item.index, coord);
                    table_selection.selectTableCellRange(rows, rowe, cols, cole);
                }
            }
        } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) {
            isDragging = true;
        }
    }
    function mouseup4body() {
        if (isDragging) isDragging = false;
        workspace.value.setCtrl('page');
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
    // function init_text_cell(cell: TableGridItem) {
    //     const editor = context.editor4Table(table);
    //     editor.initTextCell(cell.index.row, cell.index.col);
    // }
    function down(e: MouseEvent) {        
        // console.log('单击 cell:', down_item);
        table_selection.resetSelection();
        set_position(e);
        if (down_item) {
            if (down_item.cell) {
                if (down_item.cell.cellType === TableCellType.Text) {
                    const f = down_item.frame;
                    const xy = { x: point_on_table.x - f.x, y: point_on_table.y - f.y };
                    // console.log('点到textcell', xy);
                    table_selection.setEditingCell(down_item.cell);
                    const text = down_item.cell.text;
                    if (!text) return;
                    down_index = down_item.cell.locateText(xy.x, xy.y);
                    text_selection = context.textSelection;
                    text_selection.setCursor(down_index.index, down_index.before);
                } else if (down_item.cell.cellType === TableCellType.Image) {
                    // console.log('点到imagecell');
                    table_selection.setEditingCell();
                    table_selection.selectTableCell(down_item.index.row, down_item.index.col);
                } else {
                    // console.log('unexcept');
                    // init_text_cell(down_item);
                    context.nextTick(context.selection.selectedPage!, () => {
                        text_selection = context.textSelection;
                        text_selection.setCursor(0, false);
                        const cellView = down_item ? table.getCellAt(down_item.index.row, down_item.index.col) : undefined;
                        table_selection.setEditingCell(cellView);
                    })
                }
            } else {
                // console.log('init cell');
                // init_text_cell(down_item);
                down_item = check_cell_on_point(e);
                context.nextTick(context.selection.selectedPage!, () => {
                    const cellView = down_item ? table.getCellAt(down_item.index.row, down_item.index.col) : undefined;
                    table_selection.setEditingCell(cellView);
                    down_index = cellView?.locateText(0, 0) || { index: -1, before: false };
                    text_selection = context.textSelection;
                    text_selection.setCursor(down_index.index, down_index.before);
                })
            }
        }
        document.addEventListener('mousemove', mousemove4body);
        document.addEventListener('mouseup', mouseup4body);
        move = mousemove4body, up = mouseup4body;
    }
    function dbldown() {
        // console.log('双击');
        if (down_item && down_item.cell && down_item.cell.cellType === TableCellType.Text) {
            const text = down_item.cell.text, len: number = text?.length!;
            if (text && len !== 1) {
                text_selection.selectText(0, len);
            } else {
                table_selection.setEditingCell();
                table_selection.selectTableCell(down_item.index.row, down_item.index.col);
            }
        }
        document.addEventListener('mouseup', mouseup4body);
        up = mouseup4body;
    }
    function multidown() {
        init_down_timer();
        // console.log('三次点击');
        if (down_item && down_item.cell && down_item.cell.cellType === TableCellType.Text) {
            table_selection.setEditingCell();
            table_selection.selectTableCell(down_item.index.row, down_item.index.col);
        }
        document.addEventListener('mouseup', mouseup4body);
        up = mouseup4body;
    }
    // #endregion
    function set_position(e: MouseEvent) {
        const { clientX, clientY } = e;
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        point_on_table = matrix4table.computeCoord2(startPosition.x, startPosition.y);
    }
    function initController() {
        const t: TableView = context.selection.selectedShapes[0] as TableView;
        if (t && t.type === ShapeType.Table) {
            table = t;
            get_matrix4table();
            init_down_timer();
            table_selection = context.tableSelection;
        }
    }
    function init_down_timer() {
        clearTimeout(down_timer);
        down_timer = null, down_type = 1;
    }
    function set_timer() {
        clearTimeout(down_timer);
        down_timer = setTimeout(() => {
            clearTimeout(down_timer);
            down_type = 1, down_timer = null;
        }, TIMER)
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context);
    }
    function selection_watcher(t?: number | string) {
        if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) initController();
    }
    function workspace_watcher(t?: number) {
        if (t === WorkSpace.CHECKSTATUS) checkStatus();
    }
    function windowBlur() {
        if (isDragging) {
            workspace.value.translating(false);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            if (asyncTransfer) asyncTransfer = asyncTransfer.close();
            isDragging = false;
        }
        if (wheel) wheel = wheel.remove();
        workspace.value.setCtrl('page');
        context.cursor.cursor_freeze(false);
    }
    const boardMgr = new KeyboardMgr(context);
    function init() {
        context.workspace.watch(workspace_watcher);
        context.selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        boardMgr.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
        context.workspace.contentEdit(false);
        table.watch(get_matrix4table);
        shapes = context.selection.selectedShapes;
    }
    function dispose() {
        context.workspace.unwatch(workspace_watcher);
        context.selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        boardMgr.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        table.unwatch(get_matrix4table);
        is_diposed = true;
    }
    function m4table() {
        return matrix4table;
    }
    watch(() => workspace_matrix.value, get_matrix4table, { deep: true });
    return { m4table, init, dispose };
}

export function useController(context: Context) {
    const { t } = useI18n();
    const ctrl = useControllerCustom(context, t);
    onMounted(() => {
        ctrl.init();
    })
    onUnmounted(() => {
        ctrl.dispose();
    })
    return ctrl;
}