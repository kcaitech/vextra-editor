<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape, TableCell, TableCellType, TableShape, Text, TableGridItem } from '@kcdesign/data';
import { onMounted, onUnmounted, watch, ref, reactive, computed, shallowRef } from 'vue';
import { genRectPath } from '../common';
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection } from '@/context/selection';
import { getAxle } from '@/utils/common';
import BarsContainer from "./Bars/BarsContainerForTable.vue";
import PointsContainer from "./Points/PointsContainerForTable.vue";
import { useController } from './controller2';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import TableHeader from './Table/TableHeader.vue';
import TableSelectionView from './Table/TableSelectionView.vue';
import TableCellsMenu from '@/components/Document/Menu/TableMenu/TableCellsMenu.vue';
import { CellMenu } from '@/context/menu';
type TextShape = Shape & { text: Text };
const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix, // root->屏幕 变换矩阵
    shape: TableShape
}>();
const { tableSelection, m4table } = useController(props.context);
const matrix = new Matrix();
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const submatrix = reactive(new Matrix());
const submatrixArray = computed(() => submatrix.toArray());
const cell_menu = ref<boolean>(false);
const cell_menu_type = ref<CellMenu>(CellMenu.MultiSelect);
const cell_menu_posi = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
const editingCell = shallowRef<TableGridItem & { cell: TableCell | undefined }>();
const editingCellMatrix = computed(() => {
    matrix.reset(submatrix.toArray());
    if (editingCell.value) {
        matrix.preTrans(editingCell.value.frame.x, editingCell.value.frame.y);
    }
    return matrix.toArray();
})
let x_checked: boolean = false, y_checked: boolean = false;
let m_col: number = 0, m_row: number = 0, down_x: number = 0, down_y: number = 0, t_height: number = 0, t_width: number = 0;
const m_x = ref<number>(0), m_y = ref<number>(0);
let down_p_on_table: { x: number, y: number } = { x: 0, y: 0 };
const col_dash = ref<boolean>(false), row_dash = ref<boolean>(false);
function update() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix); // table -> 屏幕
    if (!submatrix.equals(matrix)) {
        submatrix.reset(matrix);
    }
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
    cell_menu.value = false;
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_EDITING_CELL) {
        editingCell.value = tableSelection().editingCell;
    }
}
function init() {
    editingCell.value = undefined;
    update();
}
function update_menu_posi(x: number, y: number, cmt: CellMenu, cm: boolean) {
    cell_menu_posi.value.x = x, cell_menu_posi.value.y = y, cell_menu_type.value = cmt, cell_menu.value = cm;
}
function move(e: MouseEvent) {
    if (e.buttons !== 0) return;
    x_checked = false, y_checked = false;
    const m4t = m4table(), root = props.context.workspace.root;
    const p = m4t.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const cell = (props.shape as TableShape).locateCell(p.x, p.y);
    if (!cell) return;
    const frame = cell.frame;
    const trans_p = { x: p.x - frame.x, y: p.y - frame.y };
    if (cell.index.col > 0) {
        if (trans_p.x < 5) {
            x_checked = true, m_col = cell.index.col;
        } else if (frame.width - trans_p.x < 5) {
            x_checked = true, m_col = cell.index.col + 1;
        }
    }
    if (cell.index.row > 0) {
        if (trans_p.y < 5) {
            y_checked = true, m_row = cell.index.row;
        } else if (frame.height - trans_p.y < 5) {
            y_checked = true, m_row = cell.index.row + 1;
        }
    }
    if (!x_checked && !y_checked) {
        props.context.cursor.reset();
    } else if (x_checked) {
        props.context.cursor.setType('extend-0');
    } else if (y_checked) {
        props.context.cursor.setType('extend-0');
    }

}
function down(e: MouseEvent) {
    if (e.button !== 0) return;
    if (x_checked || y_checked) {
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
    const m4t = m4table(), root = props.context.workspace.root;
    const p = m4t.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    m_x.value = p.x;
}
function up_x() {
    const dx = m_x.value - down_x;
    const table: TableShape = props.shape as TableShape;
    const layout = table.getLayout();
    const cols = layout.colWidths;
    const o_w = cols[m_col];
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.setColWidth(m_col - 1, o_w + dx);
    col_dash.value = false;
    document.removeEventListener('mousemove', move_x);
    document.removeEventListener('mouseup', up_x);
}
function move_y(e: MouseEvent) {
    const m4t = m4table(), root = props.context.workspace.root;
    const p = m4t.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    m_y.value = p.y;
}
function up_y() {
    const dy = m_y.value - down_y;
    const table: TableShape = props.shape as TableShape;
    const layout = table.getLayout();
    const rows = layout.rowHeights;
    const o_h = rows[m_row];
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.setRowHeight(m_row - 1, o_h + dy);
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
    for (let i = 0; i < col; i++)  growx += cols[i] * scale;
    down_x = growx, t_height = layout.height * scale, m_x.value = growx;
}
function get_y_by_row(row: number) {
    const mw = new Matrix(props.context.workspace.matrix);
    const table: TableShape = props.shape as TableShape;
    const layout = table.getLayout();
    const rows = layout.rowHeights;
    const scale = mw.m00;
    let growy = 0;
    for (let i = 0; i < row; i++)  growy += rows[i] * scale;
    down_y = growy, t_width = layout.width * scale, m_y.value = growy;
}
watch(() => props.matrix, update, { deep: true })
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.shape.watch(update);
    init();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.shape.unwatch(update);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        overflow="visible" @mousemove="move" @mousedown="down">
        <!-- 表格选区 -->
        <TableSelectionView :context="props.context" @get-menu="update_menu_posi"></TableSelectionView>
        <!-- 文本选区 -->
        <SelectView v-if="editingCell && editingCell.cell && editingCell.cell.cellType === TableCellType.Text"
            :context="props.context" :shape="(editingCell.cell as TextShape)" :matrix="editingCellMatrix"></SelectView>
        <!-- 列宽缩放 -->
        <BarsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame">
        </BarsContainer>
        <!-- 表头 -->
        <TableHeader :context="props.context" :matrix="submatrixArray" :shape="props.shape" :c-frame="props.controllerFrame"
            @get-menu="update_menu_posi"></TableHeader>
        <!-- 表格拖拽 -->
        <PointsContainer :context="props.context" :matrix="submatrixArray" :shape="props.shape"
            :c-frame="props.controllerFrame" :axle="axle">
        </PointsContainer>
        <g :transform="`translate(${bounds.left},${bounds.top})`">
            <line v-if="col_dash" :x1="m_x" y1="0" :x2="m_x" :y2="t_height" stroke="#865dff" stroke-dasharray="5 5"
                stroke-width="2"></line>
            <line v-if="row_dash" x1="0" :y1="m_y" :x2="t_width" :y2="m_y" stroke="#865dff" stroke-dasharray="5 5"
                stroke-width="2"></line>
        </g>
    </svg>
    <TextInput v-if="isEditingText()" :context="props.context" :shape="(editingCell!.cell as TextShape)"
        :matrix="editingCellMatrix"></TextInput>
    <TableCellsMenu :cells="[]" v-if="cell_menu" :context="props.context" @close="closeCellMenu"
        :position="{ x: cell_menu_posi.x, y: cell_menu_posi.y }" :cell-menu="cell_menu_type"></TableCellsMenu>
</template>
<style lang='scss' scoped></style>