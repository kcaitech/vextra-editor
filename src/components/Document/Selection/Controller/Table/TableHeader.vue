<script setup lang="ts">
import { Context } from '@/context';
import { Matrix, Shape, TableLayout, TableShape } from '@kcdesign/data';
import { Point } from '../../SelectionView.vue';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { Selection } from '@/context/selection';
import { CellMenu } from '@/context/menu'
interface Emits {
    (e: 'get-menu', x: number, y: number, type: CellMenu, cell_menu: boolean): void;
}
const emits = defineEmits<Emits>();
const props = defineProps<{
    matrix: number[]
    context: Context
    shape: Shape
    cFrame: Point[]
}>();
interface FrameParams {
    x: number
    y: number
    width: number
    height: number
}
const data: {
    frame_params: FrameParams
    xbars: { s: number, length: number, idx: number }[]
    ybars: { s: number, length: number, idx: number }[]
    xs: { x: number, idx: number }[]
    ys: { y: number, idx: number }[]
} = reactive({ frame_params: { x: 0, y: 0, width: 0, height: 0 }, xbars: [], ybars: [], xs: [], ys: [] });
const show_add_x = ref<boolean>(false);
let add_x: number = 0, ids_x = 0;
const show_add_y = ref<boolean>(false);
let add_y: number = 0, ids_y = 0;
const hidden = ref<boolean>(false);
let frame_params = data.frame_params, xbars = data.xbars, ybars = data.ybars, xs = data.xs, ys = data.ys;
let layout: TableLayout;
let m4table: Matrix = new Matrix();
let move: any;
let index_col: number = 0, index_row: number = 0;
let m_index_col: number = 0, m_index_row: number = 0;
let selecting: boolean = false;
function update_position() {
    if (props.context.workspace.shouldSelectionViewUpdate) {
        xbars = [], ybars = [], xs = [], ys = [];
        const m = new Matrix(props.matrix), lt = m.computeCoord2(0, 0), mw = new Matrix(props.context.workspace.matrix);
        const table: TableShape = props.shape as TableShape;
        layout = table.getLayout();
        frame_params = { x: lt.x, y: lt.y, width: layout.width * mw.m00, height: layout.height * mw.m00 };
        const cols = layout.colWidths, rows = layout.rowHeights;
        let growx = 0, growy = 0;
        for (let i = 0, len = cols.length; i < len; i++) {
            const tx = cols[i] * mw.m00, x = growx + tx;
            if (tx > 13) {
                xs.push({ x, idx: i }), xbars.push({ s: growx + 4, length: tx - 8, idx: i });
            }
            growx += tx;
        }
        for (let i = 0, len = rows.length; i < len; i++) {
            const ty = rows[i] * mw.m00, y = growy + ty;
            if (ty > 13) {
                ys.push({ y, idx: i }), ybars.push({ s: growy + 4, length: ty - 8, idx: i });
            }
            growy += ty;
        }
    } else {
        hidden.value = true;
    }
}
function x_dot_mouseennter(x: number, ids: number) {
    if (selecting) return;
    show_add_x.value = true, add_x = x, ids_x = ids;
}
function x_dot_mouseleave() {
    show_add_x.value = false;
}
function y_dot_mouseennter(y: number, ids: number) {
    if (selecting) return;
    show_add_y.value = true, add_y = y, ids_y = ids;
}
function y_dot_mouseleave() {
    show_add_y.value = false;
}
function add_cols() {
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.reset();
    selection.notify(Selection.CHANGE_TABLE_CELL);
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.insertCol(ids_x + 1, layout.colWidths[ids_x]);
}
function add_rows() {
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.setEditingCell();
    table_selection.reset();
    selection.notify(Selection.CHANGE_TABLE_CELL);
    const editor = props.context.editor4Table(props.shape as TableShape);
    editor.insertRow(ids_y + 1, layout.rowHeights[ids_y]);
}
function select_col(index: number) {
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.setEditingCell();
    const rl = layout.grid.rowCount;
    table_selection.selectTableCellRange(0, rl - 1, index, index, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    m4table.reset(m.inverse);
    const xy = m.computeCoord2((xs[index].x + (xs[index - 1]?.x || 0)) / 2, 0);
    index_col = index, m_index_col = index;
    emits("get-menu", xy.x, xy.y, CellMenu.selectCol, true);
    document.addEventListener('mousemove', move_x);
    document.addEventListener('mouseup', up);
    move = move_x;
}
function select_row(index: number) {
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.setEditingCell();
    const cl = layout.grid.colCount;
    table_selection.selectTableCellRange(index, index, 0, cl - 1, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    m4table.reset(m.inverse);
    const xy = m.computeCoord2(0, (ys[index].y + (ys[index - 1]?.y || 0)) / 2);
    index_row = index, m_index_row = index;
    emits("get-menu", xy.x, xy.y, CellMenu.SelectRow, true);
    document.addEventListener('mousemove', move_y);
    document.addEventListener('mouseup', up);
    move = move_y;
}
function move_x(e: MouseEvent) {
    const root = props.context.workspace.root;
    const xy = m4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const cell = (props.shape as TableShape).locateCell(xy.x, 1);
    if (!cell) return;
    if (cell.index.col !== m_index_col) select_cols(Math.min(index_col, cell.index.col), Math.max(index_col, cell.index.col));
    m_index_col = cell.index.col, selecting = true;

}
function move_y(e: MouseEvent) {
    const root = props.context.workspace.root;
    const xy = m4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
    const cell = (props.shape as TableShape).locateCell(1, xy.y);
    if (!cell) return;
    if (cell.index.row !== m_index_row) select_rows(Math.min(index_row, cell.index.row), Math.max(index_row, cell.index.row));
    m_index_row = cell.index.row, selecting = true;
}
function up() {
    selecting = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
function select_cols(index1: number, index2: number) {
    if (index1 === index2) return select_col(index1);
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.setEditingCell();
    const rl = layout.grid.rowCount;
    table_selection.selectTableCellRange(0, rl - 1, index1, index2, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    const xy = m.computeCoord2((xs[index2].x + (xs[index1 - 1]?.x || 0)) / 2, 0);
    emits("get-menu", xy.x, xy.y, CellMenu.selectCol, true);
}
function select_rows(index1: number, index2: number) {
    if (index1 === index2) return select_row(index1);
    const selection = props.context.selection;
    const table_selection = selection.getTableSelection(props.shape as TableShape, props.context);
    table_selection.setEditingCell();
    const cl = layout.grid.colCount;
    table_selection.selectTableCellRange(index1, index2, 0, cl - 1, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    const xy = m.computeCoord2(0, (ys[index2].y + (ys[index1 - 1]?.y || 0)) / 2);
    emits("get-menu", xy.x, xy.y, CellMenu.SelectRow, true);
}
function workspace_watcher(t?: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        hidden.value = false;
        update_position();
    }
}
function window_blur() {
    m_index_col = 0, index_col = 0, index_row = 0, m_index_row = 0, selecting = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
watch(() => props.matrix, update_position, { deep: true });

onMounted(() => {
    update_position();
    props.shape.watch(update_position);
    props.context.workspace.watch(workspace_watcher);
    window.addEventListener('blur', window_blur);
})
onUnmounted(() => {
    props.shape.unwatch(update_position);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', window_blur);
})
</script>

<template>
    <g :transform="`translate(${frame_params.x}, ${frame_params.y})`" :class="{ hidden }">
        <circle v-for="(d, ids) in xs" :key="ids" :cx="d.x" cy="-5.5" r="3" stroke="none" class="dot"
            @mouseenter="() => x_dot_mouseennter(d.x, d.idx)" />
        <rect v-for="(b, ids) in xbars" :key="ids" :x="b.s" y="-9" :width="b.length" height="7" stroke="none" rx="2.5"
            ry="2.5" class="bar" @mousedown.stop="() => select_col(b.idx)" />
        <circle v-for="(d, ids) in ys" :key="ids" cx="-5.5" :cy="d.y" r="3" stroke="none" class="dot"
            @mouseenter="() => y_dot_mouseennter(d.y, d.idx)" />
        <rect v-for="(b, ids) in ybars" :key="ids" x="-9" :y="b.s" :height="b.length" width="7" stroke="none" rx="2.5"
            ry="2.5" class="bar" @mousedown.stop="() => select_row(b.idx)" />
        <g v-if="show_add_x">
            <line :x1="add_x" y1="0" :x2="add_x" :y2="frame_params.height" class="line" />
            <svg t="1692244646475" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9259"
                :x="add_x - 10" y="-15.5" width="20" height="20" @mouseleave="x_dot_mouseleave" @mousedown.stop="add_cols"
                style="cursor:pointer;">
                <circle cx="512" cy="512" r="512" stroke="none" fill="#ffffff" />
                <path
                    d="M828.704099 196.575729C744.096116 112.384034 631.648434 66.016073 512 66.016073s-232.1288 46.367961-316.736783 130.559656C110.624271 280.800108 64 392.831501 64 512c0 119.199462 46.624271 231.199892 131.232254 315.424271 84.607983 84.191695 197.088348 130.559656 316.736783 130.559656s232.1288-46.367961 316.704099-130.559656c84.67163-84.255342 131.295901-196.288456 131.263217-315.455235C959.967316 392.800538 913.375729 280.800108 828.704099 196.575729zM736.00086 544.00086 544.00086 544.00086l0 192c0 17.695686-14.336138 32.00086-32.00086 32.00086s-32.00086-14.303454-32.00086-32.00086L479.99914 544.00086 288.00086 544.00086c-17.664722 0-32.00086-14.336138-32.00086-32.00086s14.336138-32.00086 32.00086-32.00086l192 0L480.00086 288.00086c0-17.664722 14.336138-32.00086 32.00086-32.00086s32.00086 14.336138 32.00086 32.00086l0 192 192 0c17.695686 0 32.00086 14.336138 32.00086 32.00086S753.696546 544.00086 736.00086 544.00086z"
                    fill="#865dff" p-id="9400"></path>
            </svg>
        </g>
        <g v-if="show_add_y">
            <line x1="0" :y1="add_y" :x2="frame_params.width" :y2="add_y" class="line" />
            <svg t="1692244646475" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9259"
                x="-15.5" :y="add_y - 10" width="20" height="20" @mouseleave="y_dot_mouseleave" @mousedown.stop="add_rows"
                style="cursor:pointer;">
                <circle cx="512" cy="512" r="512" stroke="none" fill="#ffffff" />
                <path
                    d="M828.704099 196.575729C744.096116 112.384034 631.648434 66.016073 512 66.016073s-232.1288 46.367961-316.736783 130.559656C110.624271 280.800108 64 392.831501 64 512c0 119.199462 46.624271 231.199892 131.232254 315.424271 84.607983 84.191695 197.088348 130.559656 316.736783 130.559656s232.1288-46.367961 316.704099-130.559656c84.67163-84.255342 131.295901-196.288456 131.263217-315.455235C959.967316 392.800538 913.375729 280.800108 828.704099 196.575729zM736.00086 544.00086 544.00086 544.00086l0 192c0 17.695686-14.336138 32.00086-32.00086 32.00086s-32.00086-14.303454-32.00086-32.00086L479.99914 544.00086 288.00086 544.00086c-17.664722 0-32.00086-14.336138-32.00086-32.00086s14.336138-32.00086 32.00086-32.00086l192 0L480.00086 288.00086c0-17.664722 14.336138-32.00086 32.00086-32.00086s32.00086 14.336138 32.00086 32.00086l0 192 192 0c17.695686 0 32.00086 14.336138 32.00086 32.00086S753.696546 544.00086 736.00086 544.00086z"
                    fill="#865dff" p-id="9400"></path>
            </svg>
        </g>
    </g>
</template>
<style lang='scss' scoped>
.dot {
    fill: #865dff75;
    cursor: pointer;
}

.bar {
    fill: #865dff45;
    cursor: pointer;
}

.bar:hover {
    fill: #865dff75;
}

.line {
    stroke: #865dff;
    stroke-width: 3px;
    stroke-linecap: round;
}

.hidden {
    opacity: 0;
}
</style>