/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, TableCellType, TableLayout, TableView, TableCellView } from '@kcaitech/vextra-core';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef } from 'vue';
import { genRectPath } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection, SelectionTheme } from '@/context/selection';
import PointsContainer from "./Points/PointsContainerForVirtualTable.vue";
import { useController } from './controller4table';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import TableSelectionView from './Table/TableSelectionView.vue';
import TableCellsMenu from '@/components/Document/Menu/TableMenu/TableCellsMenu.vue';
import { CellMenu } from '@/context/menu';
import { TableSelection } from '@/context/tableselection';

const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix, // root->屏幕 变换矩阵
    shape: TableView,
    theme: SelectionTheme
}>();
useController(props.context);
const matrix = new Matrix();
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const submatrix = reactive(new Matrix());
const submatrixArray = computed(() => submatrix.toArray());
const cell_menu = ref<boolean>(false);
const cell_menu_type = ref<CellMenu>(CellMenu.MultiSelect);
const cell_menu_posi = ref<ClientXY>({ x: 0, y: 0 });
const editingCell = shallowRef<TableCellView>();
// const editingCellView = shallowRef<TableCellView>();
const editingCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (editingCell.value) {
        const transform = editingCell.value.transform;
        matrix.preTrans(transform.translateX, transform.translateY);
    }
    return matrix.toArray();
})
const m_x = ref<number>(0), m_y = ref<number>(0);
const col_dash = ref<boolean>(false), row_dash = ref<boolean>(false);
let x_checked: boolean = false, y_checked: boolean = false;
let x1: number, x2: number, y1: number, y2: number;
let m_col: number = 0, down_x: number = 0;
let m_row: number = 0, down_y: number = 0;
let layout: TableLayout;
let submatrix_inverse: Matrix;
function update() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p.toMatrix());
    matrix.multiAtLeft(props.matrix); // table -> 屏幕
    if (!submatrix.equals(matrix)) submatrix.reset(matrix);
    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];
    const boundrect = points.map((point) => matrix.computeCoord2(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);
    props.context.workspace.setCtrlPath(boundrectPath.value);
    const p0 = boundrect[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    boundrect.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds)
    // if (editingCell.value) {
    //     updateCellView();
    // }
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function isEditingText() {
    const ret = editingCell.value &&
        editingCell.value.cellType === TableCellType.Text &&
        editingCell.value.text
        return ret;
}
const closeCellMenu = () => {
    props.context.tableSelection.resetSelection();
    cell_menu.value = false;
}
function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) return init();
    else if (t === Selection.CHANGE_PAGE) return init();
}
function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_EDITING_CELL) {
        editingCell.value = props.context.tableSelection.editingCell;
        // updateCellView();
    }
}

// function updateCellView() {
//     const cell = editingCell.value;
//     if (cell) {
//         editingCellView.value = cell;
//         if (!editingCellView.value) {
//             props.context.nextTick(props.context.selection.selectedPage!, () => {
//                 editingCellView.value = props.shape.cells.get(cell.id);
//             })
//         }
//     }
//     else {
//         editingCellView.value = undefined;
//     }
// }

function init() {
    // props.context.tableSelection.resetSelection();
    editingCell.value = undefined;
    update();
}
/**
 * @description 更新小菜单状态
 * @param cmt 小菜单类型
 * @param cm 小菜单展示与否
 */
function update_menu_posi(x: number, y: number, cmt: CellMenu, cm: boolean) {
    if (props.context.menu.cellMenuType) {
        cell_menu_type.value = props.context.menu.cellMenuType;
    } else {
        cell_menu_type.value = cmt;
    }
    cell_menu_posi.value.x = x, cell_menu_posi.value.y = y, cell_menu.value = cm;
}
function move(e: MouseEvent) {
    if (e.buttons !== 0) return;
    x_checked = false, y_checked = false;
    const m4t = new Matrix(submatrix.inverse), root = props.context.workspace.root;
    const p = m4t.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const cell = (props.shape).locateCell(p.x, p.y);
    if (!cell) return;
    const frame = cell.frame;
    const trans_p = { x: p.x - frame.x, y: p.y - frame.y };

    if (trans_p.x < 3) {
        if (cell.index.col) x_checked = true, m_col = cell.index.col;
    } else if (frame.width - trans_p.x < 3) x_checked = true, m_col = cell.index.col + 1;

    if (trans_p.y < 3) {
        if (cell.index.row) y_checked = true, m_row = cell.index.row;
    } else if (frame.height - trans_p.y < 3) y_checked = true, m_row = cell.index.row + 1;

    // if (!x_checked && !y_checked) {
    //     props.context.cursor.reset();
    // } else {
    //     let deg = props.shape.rotation || 0;
    //     if (props.shape.isFlippedHorizontal) deg = 180 - deg;
    //     if (props.shape.isFlippedVertical) deg = 360 - deg;
    //     if (x_checked) {
    //         props.context.cursor.setType('scale', deg);
    //     } else if (y_checked) {
    //         props.context.cursor.setType('scale', 90 + deg);
    //     }
    // }
}
function down(e: MouseEvent) {
    if (e.button !== 0) {
        return;
    }
    if (x_checked || y_checked) {
        const table_selection = props.context.tableSelection;
        table_selection.setEditingCell();
        table_selection.resetSelection();
        e.stopPropagation();
        if (x_checked) {
            get_x_by_col(m_col);
            col_dash.value = true;
            document.addEventListener('mouseup', up_x);
            document.addEventListener('mousemove', move_x);
        } else if (y_checked) {
            get_y_by_row(m_row);
            row_dash.value = true;
            document.addEventListener('mouseup', up_y);
            document.addEventListener('mousemove', move_y);
        }
        submatrix_inverse = new Matrix(submatrix.inverse);
    }
}
function move_x(e: MouseEvent) {
    const root = props.context.workspace.root;
    const height = layout.height;
    const x = submatrix_inverse.computeCoord2(e.clientX - root.x, e.clientY - root.y).x;
    const xy1 = submatrix.computeCoord2(x, 0);
    const xy2 = submatrix.computeCoord2(x, height);
    m_x.value = xy1.x, x1 = xy1.x, y1 = xy1.y;
    x2 = xy2.x, y2 = xy2.y;
}
function up_x() {
    // const dx = down_x - m_x.value;
    // const scale = props.context.workspace.matrix.m00;
    // const editor = props.context.editor4Table(props.shape);
    // editor.adjColWidth(m_col - 1, m_col, dx / scale);
    col_dash.value = false;
    document.removeEventListener('mousemove', move_x);
    document.removeEventListener('mouseup', up_x);
}
function move_y(e: MouseEvent) {
    const root = props.context.workspace.root;
    const width = layout.width;
    const y = submatrix_inverse.computeCoord2(e.clientX - root.x, e.clientY - root.y).y;
    const xy1 = submatrix.computeCoord2(0, y);
    const xy2 = submatrix.computeCoord2(width, y);
    m_y.value = xy1.y, x1 = xy1.x, y1 = xy1.y;
    x2 = xy2.x, y2 = xy2.y;
}
function up_y(e: MouseEvent) {
    // const root = props.context.workspace.root;
    // const y = submatrix_inverse.computeCoord2(e.clientX - root.x, e.clientY - root.y).y;
    // const xy1 = submatrix.computeCoord2(0, y);
    // const dy = down_y - xy1.y;
    // const scale = props.context.workspace.matrix.m00;
    // const editor = props.context.editor4Table(props.shape);
    // editor.adjRowHeight(m_row - 1, m_row, dy / scale);
    row_dash.value = false;
    document.removeEventListener('mousemove', move_y);
    document.removeEventListener('mouseup', up_y);
}
function get_x_by_col(col: number) {
    const table = props.shape;
    layout = table.getLayout();
    const cols = layout.colWidths;
    let growx = 0;
    for (let i = 0; i < col; i++)  growx += cols[i];
    const xy1 = submatrix.computeCoord2(growx, 0);
    const xy2 = submatrix.computeCoord2(growx, layout.height);
    x1 = xy1.x, y1 = xy1.y, x2 = xy2.x, y2 = xy2.y;
    down_x = xy1.x, m_x.value = xy1.x;
}
function get_y_by_row(row: number) {
    const table = props.shape;
    layout = table.getLayout();
    const rows = layout.rowHeights;
    let growy = 0;
    for (let i = 0; i < row; i++)  growy += rows[i];
    const xy1 = submatrix.computeCoord2(0, growy);
    const xy2 = submatrix.computeCoord2(layout.width, growy);
    x1 = xy1.x, y1 = xy1.y, x2 = xy2.x, y2 = xy2.y;
    down_y = xy1.y, m_y.value = xy1.y;
}
function leave() {
    props.context.cursor.reset();
}
function page_watcher() {
    const page = props.context.selection.selectedPage;

    if (page) {
        page.watch(update);
    }
}

function remove_page_watcher() {
    const page = props.context.selection.selectedPage;

    if (page) {
        page.unwatch(update);
    }
}
watch(() => props.matrix, update, { deep: true })
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    props.shape.watch(update);
    init();
    page_watcher();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.shape.unwatch(update);
    remove_page_watcher();
})
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="width" :height="height" :transform="`translate(${bounds.left},${bounds.top})`" overflow="visible"
        @mousemove="move" @mousedown="down" @mouseleave="leave">
        <!-- 表格选区 -->
        <TableSelectionView :context="props.context" @get-menu="update_menu_posi" :cell="editingCell"
            :table="props.shape" :matrix="submatrixArray">
        </TableSelectionView>
        <!-- 文本选区 -->
        <SelectView v-if="isEditingText()" :context="props.context" :shape="editingCell!"
            :matrix="editingCellMatrix" :main-notify="Selection.CHANGE_TEXT"
            :selection="props.context.selection.textSelection"></SelectView>
        <!-- 表格拖拽 -->
        <PointsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </PointsContainer>
    </svg>
    <!-- 输入 -->
    <TextInput v-if="isEditingText()" :context="props.context" :shape="editingCell!" :matrix="editingCellMatrix"
        :main-notify="Selection.CHANGE_TEXT" :selection="props.context.selection.textSelection"></TextInput>
    <!-- 小菜单 -->
    <TableCellsMenu :cells="[]" v-if="cell_menu" :context="props.context" @close="closeCellMenu"
        :position="{ x: cell_menu_posi.x, y: cell_menu_posi.y }" :cell-menu="cell_menu_type"></TableCellsMenu>
</template>

<style lang='scss' scoped>
svg {
    position: absolute;
}
</style>