<script setup lang="ts">
import { Context } from '@/context';
import {
    ColVector3D, makeMatrixByTransform2,
    makeShapeTransform2By1,
    Matrix,
    Matrix2, NumberArray2D,
    TableLayout,
    TableView,
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { CellMenu } from '@/context/menu'
import { XY } from "@/context/selection";

interface Emits {
    (e: 'get-menu', x: number, y: number, type: CellMenu, cell_menu: boolean): void;
}

interface Props {
    context: Context;
    shape: TableView;
}

interface Bar {
    start: XY;
    end: XY;
    index: number;
}

interface Dot {
    point: XY;
    index: number;
}

const emits = defineEmits<Emits>();
const props = defineProps<Props>();

const data: {
    xbars: Bar[];
    ybars: Bar[];
    xs: Dot[];
    ys: Dot[];
} = reactive({
    xbars: [],
    ybars: [],
    xs: [],
    ys: []
});

let { xbars, xs, ybars, ys } = data;

const hidden = ref<boolean>(false);


let layout: TableLayout;
let m4table: Matrix = new Matrix();

let move: any;
let index_col: number = 0, index_row: number = 0;
let m_index_col: number = 0, m_index_row: number = 0;

let selecting: boolean = false;
let offset: number = 0.5;

function update_position() {
    if (props.context.workspace.shouldSelectionViewUpdate) {
        xbars = [];
        ybars = [];
        xs = [];
        ys = [];

        const table = props.shape;
        const { width, height } = table.size;

        layout = table.getLayout();

        const m = table.transform2FromRoot;
        const mClient = makeShapeTransform2By1(props.context.workspace.matrix);
        m.addTransform(mClient);

        const { col0: lt, col1: rt, col2: lb } = m.transform([
            ColVector3D.FromXY(0, 0),
            ColVector3D.FromXY(width, 0),
            ColVector3D.FromXY(0, height)
        ]);

        const X = rt.clone().subtract(lt);
        const Y = lb.clone().subtract(lt);

        const deYDirection = new Transform({
            matrix: new Matrix2(new NumberArray2D([4, 4], [
                X.x, Y.x, 0, 0,
                X.y, Y.y, 0, 0,
                X.z, Y.z, 1, 0,
                0, 0, 0, 1,
            ]))
        }).transform(ColVector3D.FromXY(0, -1)).col0;
        const deXDirection = new Transform({
            matrix: new Matrix2(new NumberArray2D([4, 4], [
                X.x, Y.x, 0, 0,
                X.y, Y.y, 0, 0,
                X.z, Y.z, 1, 0,
                0, 0, 0, 1,
            ]))
        }).transform(ColVector3D.FromXY(-1, 0)).col0;
        const delta = 8 / mClient.m00;

        const cols = layout.colWidths;
        let preWidth = 0;
        const offsetYTrans = m.clone().translateAt({
            axis: deYDirection,
            distance: 4
        });
        for (let index = 0; index < cols.length; index++) {
            const __s = preWidth;
            const currentWidth = cols[index];

            const { col0: start, col1: end, col2: point } = offsetYTrans.transform([
                ColVector3D.FromXY(__s + delta, 0),
                ColVector3D.FromXY(__s + currentWidth - delta, 0),
                ColVector3D.FromXY(__s + currentWidth, 0)
            ]);


            preWidth += currentWidth;

            xs.push({ point, index });

            if (Math.hypot(start.x - end.x, start.y - end.y) < 14) continue;

            xbars.push({ start, end, index });
        }

        const rows = layout.rowHeights;

        let preHeight = 0;
        const offsetXTrans = m.clone().translateAt({
            axis: deXDirection,
            distance: 4
        });
        for (let index = 0; index < rows.length; index++) {
            const __s = preHeight;
            const currentHeight = rows[index];

            const { col0: start, col1: end, col2: point } = offsetXTrans.transform([
                ColVector3D.FromXY(0, __s + delta),
                ColVector3D.FromXY(0, __s + currentHeight - delta),
                ColVector3D.FromXY(0, __s + currentHeight)
            ]);

            preHeight += currentHeight;

            ys.push({ point, index });

            if (Math.hypot(start.x - end.x, start.y - end.y) < 14) continue;

            ybars.push({ start, end, index })
        }
    } else {
        hidden.value = true;
    }
}

const show_add_x = ref<boolean>(false);
const show_add_y = ref<boolean>(false);

let addTransform: string;
let addP1: XY;
let addP2: XY;
let ids_x: number;
let ids_y: number;

function x_dot_mouseenter(index: number) {
    if (selecting) return;
    show_add_x.value = true;
    let width = 0;
    const cols = layout.colWidths;
    for (let i = 0; i <= index; i++) {
        width += cols[i];
    }
    const m = props.shape.transform2FromRoot;
    m.addTransform(makeShapeTransform2By1(props.context.workspace.matrix));

    addTransform = makeMatrixByTransform2(
        new Transform()
            .setTranslate(ColVector3D.FromXY(width, 0))
            .addTransform(m)
            .clearSkew()
            .clearScaleSize()
            .translateInLocal(ColVector3D.FromXY(-10, -14))
    ).toString();

    const { col0, col1 } = m.transform([
        ColVector3D.FromXY(width, 0),
        ColVector3D.FromXY(width, props.shape.size.height)
    ]);

    addP1 = col0;
    addP2 = col1;
    ids_x = index;
}

function x_dot_mouseleave() {
    show_add_x.value = false;
}

function y_dot_mouseenter(index: number) {
    if (selecting) return;
    show_add_y.value = true;
    let height = 0;
    const rows = layout.rowHeights;
    for (let i = 0; i <= index; i++) {
        height += rows[i];
    }

    const m = props.shape.transform2FromRoot;
    m.addTransform(makeShapeTransform2By1(props.context.workspace.matrix));
    addTransform = makeMatrixByTransform2(
        new Transform()
            .setTranslate(ColVector3D.FromXY(0, height))
            .addTransform(m)
            .clearSkew()
            .clearScaleSize()
            .translateInLocal(ColVector3D.FromXY(-14, -10))
    ).toString();

    const { col0, col1 } = m.transform([
        ColVector3D.FromXY(0, height),
        ColVector3D.FromXY(props.shape.size.width, height)
    ]);

    addP1 = col0;
    addP2 = col1;
    ids_y = index;
}

function y_dot_mouseleave() {
    show_add_y.value = false;
}

function add_cols() {
    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();
    const editor = props.context.editor4Table(props.shape);
    editor.insertCol(ids_x + 1, layout.colWidths[ids_x]);
}

function add_rows() {
    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    table_selection.resetSelection();
    const editor = props.context.editor4Table(props.shape);
    editor.insertRow(ids_y + 1, layout.rowHeights[ids_y]);
}

function select_col(index: number) {
    const idx = xs[index].index;
    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    const rl = layout.grid.rowCount;
    table_selection.selectTableCellRange(0, rl - 1, idx, idx, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    m4table.reset(m.inverse);
    index_col = idx, m_index_col = idx;
    props.context.menu.setCellMenuType(CellMenu.selectCol);
    emits("get-menu", (xs[index].point.x + (xs[index - 1]?.point.x || 0)) / 2, xs[index].point.y, CellMenu.selectCol, true);
    // document.addEventListener('mousemove', move_x);
    // document.addEventListener('mouseup', up);
    // move = move_x;
}

function select_row(index: number) {
    const idx = ys[index].index;
    const table_selection = props.context.tableSelection;
    table_selection.setEditingCell();
    const cl = layout.grid.colCount;
    table_selection.selectTableCellRange(idx, idx, 0, cl - 1, false);
    const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
    m.multiAtLeft(wm);
    m4table.reset(m.inverse);
    index_row = idx, m_index_row = idx;
    props.context.menu.setCellMenuType(CellMenu.SelectRow);
    emits("get-menu", ys[index].point.x, (ys[index].point.y + (ys[index - 1]?.point.y || 0)) / 2, CellMenu.SelectRow, true);
    // document.addEventListener('mousemove', move_y);
    // document.addEventListener('mouseup', up);
    // move = move_y;
}

// function move_x(e: MouseEvent) {
//     const root = props.context.workspace.root;
//     const xy = m4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
//     const cell = (props.shape).locateCell(xy.x, 1);
//     if (!cell) return;
//     if (cell.index.col !== m_index_col) select_cols(Math.min(index_col, cell.index.col), Math.max(index_col, cell.index.col));
//     m_index_col = cell.index.col, selecting = true;
//
// }
//
// function move_y(e: MouseEvent) {
//     const root = props.context.workspace.root;
//     const xy = m4table.computeCoord2(e.clientX - root.x, e.clientY - root.y);
//     const cell = (props.shape).locateCell(1, xy.y);
//     if (!cell) return;
//     if (cell.index.row !== m_index_row) select_rows(Math.min(index_row, cell.index.row), Math.max(index_row, cell.index.row));
//     m_index_row = cell.index.row, selecting = true;
// }

function up() {
    selecting = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

// function select_cols(index1: number, index2: number) {
//     if (index1 === index2) return select_col(index1);
//     const table_selection = props.context.tableSelection;
//     table_selection.setEditingCell();
//     const rl = layout.grid.rowCount;
//     table_selection.selectTableCellRange(0, rl - 1, index1, index2, false);
//     const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
//     m.multiAtLeft(wm);
//     const xy = m.computeCoord2(((xs[index2].x + (xs[index1 - 1]?.x || 0)) / 2) / wm.m00, 0);
//     props.context.menu.setCellMenuType(CellMenu.selectCol);
//     emits("get-menu", xy.x, xy.y, CellMenu.selectCol, true);
// }
//
// function select_rows(index1: number, index2: number) {
//     if (index1 === index2) return select_row(index1);
//     const table_selection = props.context.tableSelection;
//     table_selection.setEditingCell();
//     const cl = layout.grid.colCount;
//     table_selection.selectTableCellRange(index1, index2, 0, cl - 1, false);
//     const m = props.shape.matrix2Root(), wm = props.context.workspace.matrix;
//     m.multiAtLeft(wm);
//     const xy = m.computeCoord2(0, ((ys[index2].y + (ys[index1 - 1]?.y || 0)) / 2) / wm.m00);
//     props.context.menu.setCellMenuType(CellMenu.SelectRow);
//     emits("get-menu", xy.x, xy.y, CellMenu.SelectRow, true);
// }

function workspace_watcher(t?: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        hidden.value = false;
        update_position();
    } else if (WorkSpace.MATRIX_TRANSFORMATION) {
        update_position();
    }
}

function window_blur() {
    m_index_col = 0;
    index_col = 0;
    index_row = 0;
    m_index_row = 0;
    selecting = false;

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

const stopShapeWatcher = watch(() => props.shape, (v, o) => {
    o.unwatch(update_position);
    v.watch(update_position);

    update_position();
});

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
    stopShapeWatcher();
})
</script>

<template>
    <g :class="{ hidden }">
        <path v-for="(x, ids) in xbars" :key="ids" :d="`M${x.start.x} ${x.start.y} L ${x.end.x} ${x.end.y}`"
            stroke-width="8" stroke-linecap="round" class="bar" @mousedown.stop="() => select_col(x.index)" />
        <circle v-for="(p, ids) in xs" :key="ids" :cx="p.point.x" :cy="p.point.y" r="4" stroke="none" class="dot"
            @mouseenter="() => { x_dot_mouseenter(p.index) }" />
        <path v-for="(y, ids) in ybars" :key="ids" :d="`M${y.start.x} ${y.start.y} L ${y.end.x} ${y.end.y}`"
            stroke-width="8" stroke-linecap="round" class="bar" @mousedown.stop="() => select_row(y.index)" />
        <circle v-for="(p, ids) in ys" :key="ids" :cx="p.point.x" :cy="p.point.y" r="4" stroke="none" class="dot"
            @mouseenter="() => { y_dot_mouseenter(p.index) }" />
        <g v-if="show_add_x">
            <line :x1="addP1.x" :y1="addP1.y" :x2="addP2.x" :y2="addP2.y" class="line" />
            <g :style="`transform: ${addTransform}`">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    @mouseleave="x_dot_mouseleave" @mousedown.stop="add_cols" class="add">
                    <circle cx="512" cy="512" r="512" stroke="none" fill="#ffffff" />
                    <path
                        d="M828.704099 196.575729C744.096116 112.384034 631.648434 66.016073 512 66.016073s-232.1288 46.367961-316.736783 130.559656C110.624271 280.800108 64 392.831501 64 512c0 119.199462 46.624271 231.199892 131.232254 315.424271 84.607983 84.191695 197.088348 130.559656 316.736783 130.559656s232.1288-46.367961 316.704099-130.559656c84.67163-84.255342 131.295901-196.288456 131.263217-315.455235C959.967316 392.800538 913.375729 280.800108 828.704099 196.575729zM736.00086 544.00086 544.00086 544.00086l0 192c0 17.695686-14.336138 32.00086-32.00086 32.00086s-32.00086-14.303454-32.00086-32.00086L479.99914 544.00086 288.00086 544.00086c-17.664722 0-32.00086-14.336138-32.00086-32.00086s14.336138-32.00086 32.00086-32.00086l192 0L480.00086 288.00086c0-17.664722 14.336138-32.00086 32.00086-32.00086s32.00086 14.336138 32.00086 32.00086l0 192 192 0c17.695686 0 32.00086 14.336138 32.00086 32.00086S753.696546 544.00086 736.00086 544.00086z"
                        fill="#1878f5"></path>
                </svg>
            </g>

        </g>
        <g v-if="show_add_y">
            <line :x1="addP1.x" :y1="addP1.y" :x2="addP2.x" :y2="addP2.y" class="line" />
            <g :style="`transform: ${addTransform}`">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    @mouseleave="y_dot_mouseleave" @mousedown.stop="add_rows" class="add">
                    <circle cx="512" cy="512" r="512" stroke="none" fill="#ffffff" />
                    <path
                        d="M828.704099 196.575729C744.096116 112.384034 631.648434 66.016073 512 66.016073s-232.1288 46.367961-316.736783 130.559656C110.624271 280.800108 64 392.831501 64 512c0 119.199462 46.624271 231.199892 131.232254 315.424271 84.607983 84.191695 197.088348 130.559656 316.736783 130.559656s232.1288-46.367961 316.704099-130.559656c84.67163-84.255342 131.295901-196.288456 131.263217-315.455235C959.967316 392.800538 913.375729 280.800108 828.704099 196.575729zM736.00086 544.00086 544.00086 544.00086l0 192c0 17.695686-14.336138 32.00086-32.00086 32.00086s-32.00086-14.303454-32.00086-32.00086L479.99914 544.00086 288.00086 544.00086c-17.664722 0-32.00086-14.336138-32.00086-32.00086s14.336138-32.00086 32.00086-32.00086l192 0L480.00086 288.00086c0-17.664722 14.336138-32.00086 32.00086-32.00086s32.00086 14.336138 32.00086 32.00086l0 192 192 0c17.695686 0 32.00086 14.336138 32.00086 32.00086S753.696546 544.00086 736.00086 544.00086z"
                        fill="#1878f5"></path>
                </svg>
            </g>

        </g>
    </g>
</template>

<style lang='scss' scoped>
.dot {
    fill: #1878f575;
    cursor: pointer;
}

.bar-back {
    fill: transparent;
    stroke: none;
    cursor: pointer;
}

.bar {
    fill: none;
    stroke: #1878f545;
    cursor: pointer;
}

.bar:hover {
    stroke: #1878f575;
}

.line {
    stroke: #1878f5;
    stroke-width: 3px;
    stroke-linecap: round;
}

.hidden {
    opacity: 0;
}

.add {
    cursor: pointer;
}
</style>