<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, TableShape, Text, TableGridItem } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef, onBeforeUpdate } from 'vue';
import { genRectPath } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection } from '@/context/selection';
import BarsContainer from "./Bars/BarsContainerForTable.vue";
import PointsContainer from "./Points/PointsContainerForTable.vue";
import { useController } from './controller4table';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import TableHeader from './Table/TableHeader.vue';
import TableSelectionView from './Table/TableSelectionView.vue';
import TableCellsMenu from '@/components/Document/Menu/TableMenu/TableCellsMenu.vue';
import { CellMenu } from '@/context/menu';
import { TableSelection } from '@/context/tableselection';
type TextShape = Shape & { text: Text };
const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix, // root->屏幕 变换矩阵
    shape: TableShape
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
const editingCell = shallowRef<TableGridItem & { cell: TableCell | undefined }>();
const editingCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (editingCell.value) {
        matrix.preTrans(editingCell.value.frame.x, editingCell.value.frame.y);
    }
    return matrix.toArray();
})
const m_x = ref<number>(0), m_y = ref<number>(0);
const col_dash = ref<boolean>(false), row_dash = ref<boolean>(false);
let x_checked: boolean = false, y_checked: boolean = false;
let m_col: number = 0, m_row: number = 0, down_x: number = 0, down_y: number = 0, t_height: number = 0, t_width: number = 0, t_x: number = 0, t_y: number = 0;
function update() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix); // table -> 屏幕
    if (!submatrix.equals(matrix)) submatrix.reset(matrix);
    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];
    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);
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
    if (editingCell.value && editingCell.value.cell) {
        editingCell.value = props.shape.locateCell2(editingCell.value.cell);
    }
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function isEditingText() {
    return editingCell.value &&
        editingCell.value.cell &&
        editingCell.value.cell.cellType === TableCellType.Text &&
        editingCell.value.cell.text;
}
const closeCellMenu = () => {
    props.context.tableSelection.resetSelection();
    cell_menu.value = false;
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) return init();
    else if (t === Selection.CHANGE_PAGE) return init();
}
function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_EDITING_CELL) editingCell.value = props.context.tableSelection.editingCell;
}
function init() {
    props.context.tableSelection.resetSelection();
    editingCell.value = undefined;
    update();
}
/**
 * @description 更新小菜单状态
 * @param cmt 小菜单类型
 * @param cm 小菜单展示与否
 */
function update_menu_posi(x: number, y: number, cmt: CellMenu, cm: boolean) {
    cell_menu_posi.value.x = x, cell_menu_posi.value.y = y, cell_menu_type.value = cmt, cell_menu.value = cm;
}
function move(e: MouseEvent) {
    if (e.buttons !== 0) return;
    x_checked = false, y_checked = false;
    const m4t = new Matrix(submatrix.inverse), root = props.context.workspace.root;
    const p = m4t.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const cell = (props.shape as TableShape).locateCell(p.x, p.y);
    if (!cell) return;
    const frame = cell.frame;
    const trans_p = { x: p.x - frame.x, y: p.y - frame.y };
    if (trans_p.x < 3) {
        if (cell.index.col) {
            x_checked = true, m_col = cell.index.col;
        }
    } else if (frame.width - trans_p.x < 3) {
        x_checked = true, m_col = cell.index.col + 1;
    }
    if (trans_p.y < 3) {
        if (cell.index.row) {
            y_checked = true, m_row = cell.index.row;
        }
    } else if (frame.height - trans_p.y < 3) {
        y_checked = true, m_row = cell.index.row + 1;
    }
    if (!x_checked && !y_checked) {
        props.context.cursor.reset();
    } else if (x_checked) {
        props.context.cursor.setType('scale-0');
    } else if (y_checked) {
        props.context.cursor.setType('scale-90');
    }
}
function down(e: MouseEvent) {
    if (e.button !== 0) return;
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
    }
}
function move_x(e: MouseEvent) {
    const root = props.context.workspace.root;
    m_x.value = e.clientX - root.x;
}
function up_x() {
    const dx = down_x - m_x.value;
    const scale = props.context.workspace.matrix.m00;
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.adjColWidth(m_col - 1, m_col, dx / scale);
    col_dash.value = false;
    document.removeEventListener('mousemove', move_x);
    document.removeEventListener('mouseup', up_x);
}
function move_y(e: MouseEvent) {
    const root = props.context.workspace.root;
    m_y.value = e.clientY - root.y;
}
function up_y() {
    const dy = down_y - m_y.value;
    const scale = props.context.workspace.matrix.m00;
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.adjRowHeight(m_row - 1, m_row, dy / scale);
    row_dash.value = false;
    document.removeEventListener('mousemove', move_y);
    document.removeEventListener('mouseup', up_y);
}
function get_x_by_col(col: number) {
    const mw = new Matrix(props.context.workspace.matrix);
    const table: TableShape = props.shape as TableShape;
    const layout = table.getLayout();
    const cols = layout.colWidths;
    const scale = mw.m00;
    let growx = 0;
    for (let i = 0; i < col; i++)  growx += cols[i];
    const xy = submatrix.computeCoord2(growx, 0);
    growx = xy.x, t_y = xy.y;
    down_x = growx, t_height = layout.height * scale, m_x.value = growx;
}
function get_y_by_row(row: number) {
    const mw = new Matrix(props.context.workspace.matrix);
    const table: TableShape = props.shape as TableShape;
    const layout = table.getLayout();
    const rows = layout.rowHeights;
    const scale = mw.m00;
    let growy = 0;
    for (let i = 0; i < row; i++)  growy += rows[i];
    const xy = submatrix.computeCoord2(0, growy);
    growy = xy.y, t_x = xy.x;
    down_y = growy, t_width = layout.width * scale, m_y.value = growy;
}
function leave() {
    props.context.cursor.reset();
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
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.shape.unwatch(update);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)` }" overflow="visible" @mousemove="move"
        @mousedown="down" @mouseleave="leave">
        <!-- 表格选区 -->
        <TableSelectionView :context="props.context" @get-menu="update_menu_posi" :cell="editingCell?.cell"
            :table="props.shape" :matrix="submatrixArray">
        </TableSelectionView>
        <!-- 文本选区 -->
        <SelectView v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
            :matrix="editingCellMatrix"></SelectView>
        <!-- 列宽缩放 -->
        <BarsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </BarsContainer>
        <!-- 表头 -->
        <TableHeader :context="props.context" :matrix="submatrixArray" :shape="props.shape" :c-frame="props.controllerFrame"
            @get-menu="update_menu_posi"></TableHeader>
        <!-- 表格拖拽 -->
        <PointsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </PointsContainer>
        <!-- 列宽缩放 -->
        <g>
            <line v-if="col_dash" :x1="m_x" :y1="t_y" :x2="m_x" :y2="t_y + t_height" stroke="#865dff" stroke-dasharray="3 3"
                stroke-width="3"></line>
            <line v-if="row_dash" :x1="t_x" :y1="m_y" :x2="t_x + t_width" :y2="m_y" stroke="#865dff" stroke-dasharray="3 3"
                stroke-width="3"></line>
        </g>
    </svg>
    <!-- 输入 -->
    <TextInput v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
        :matrix="editingCellMatrix"></TextInput>
    <!-- 小菜单 -->
    <TableCellsMenu :cells="[]" v-if="cell_menu" :context="props.context" @close="closeCellMenu"
        :position="{ x: cell_menu_posi.x, y: cell_menu_posi.y }" :cell-menu="cell_menu_type"></TableCellsMenu>
</template>
<style lang='scss' scoped>
svg {
    position: absolute;
}
</style>