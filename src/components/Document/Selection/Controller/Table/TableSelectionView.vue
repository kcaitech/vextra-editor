<script lang="ts" setup>
import { Context } from '@/context';
import { ClientXY, Selection } from '@/context/selection';
import { Shape, ShapeType, TableCell, TableShape } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { genRectPath } from '../../common';
import { XYsBounding } from '@/utils/common';
import { CellMenu } from '@/context/menu';
import { TableSelection } from '@/context/tableselection';

interface Props {
    context: Context
    cell: TableCell | undefined
    table: TableShape
    matrix: number[]
}
interface Emits {
    (e: 'get-menu', x: number, y: number, type: CellMenu, cell_menu: boolean): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const selection_path = ref<string>('');
const triangle = ref<boolean>(false);
let triangle_position: ClientXY = { x: 0, y: 0 };
function update_cell_selection(gen_menu_posi?: boolean) {
    selection_path.value = '';
    emits("get-menu", 0, 0, CellMenu.MultiSelect, false);
    if (props.table && props.table.type === ShapeType.Table) {
        const table_selection = props.context.tableSelection;
        if (!table_selection || table_selection.tableRowStart < 0) return;
        const cells = table_selection.getSelectedCells(true);
        gen_view(props.table, cells, gen_menu_posi);
    }
}
const t1 = () => update_cell_selection(true);
function gen_view(table: Shape, cells: { cell: TableCell | undefined, rowIdx: number, colIdx: number }[], gen_menu_posi?: boolean) {
    const t2r = table.matrix2Root(), m = props.context.workspace.matrix;
    t2r.multiAtLeft(m);
    let points: ClientXY[] = [];
    const grid = (table as TableShape).getLayout().grid;
    for (let i = 0, len = cells.length; i < len; i++) {
        const cell = cells[i];
        const f = grid.get(cell.rowIdx, cell.colIdx).frame;
        const cps = [{ x: f.x, y: f.y }, { x: f.x + f.width, y: f.y }, { x: f.x + f.width, y: f.y + f.height }, { x: f.x, y: f.y + f.height }];
        for (let j = 0; j < 4; j++) {
            const p = cps[j];
            points.push(t2r.computeCoord2(p.x, p.y));
        }
    }
    selection_path.value = genRectPath(points);
    if (gen_menu_posi) _get_menu_position(points);
}
function update_triangle() {
    triangle.value = false;
    const selection = props.context.selection;
    const shape = selection.selectedShapes[0];
    const tableSelection = props.context.tableSelection;
    if (shape && shape.type === ShapeType.Table && tableSelection) {
        const cell = tableSelection.editingCell;
        if (!cell) return false;
        const grid = (shape as TableShape).getLayout().grid;
        const g = grid.get(cell.index.row, cell.index.col);
        if (!g) return false;
        const f = grid.get(cell.index.row, cell.index.col).frame;
        const t2r = shape.matrix2Root(), m = props.context.workspace.matrix;
        t2r.multiAtLeft(m);
        const rb = t2r.computeCoord2(f.x + f.width, f.y + f.height);
        triangle_position.x = rb.x - 20, triangle_position.y = rb.y - 20;
        triangle.value = true;
    }
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        update_cell_selection();
        watchCells.forEach((v) => v.unwatch(t1));
        watchCells.clear();
    }
    else if (t === Selection.CHANGE_PAGE) {
        update_cell_selection();
        watchCells.forEach((v) => v.unwatch(t1));
        watchCells.clear();
    }
}
function table_selection_watcher(t: number, gen_menu_posi: any) {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        update_cell_selection(gen_menu_posi);
        cells_watcher();
    } else if (t === TableSelection.CHANGE_EDITING_CELL) return update_triangle();
}

function select_cell_by_triangle(e: MouseEvent) {
    const tableSelection = props.context.tableSelection;
    const cell = tableSelection.editingCell;
    if (cell) {
        tableSelection.selectTableCell(cell.index.row, cell.index.col);
        tableSelection.setEditingCell();
        e.stopPropagation();
    }
}
function _get_menu_position(points: ClientXY[]) {
    const b = XYsBounding(points);
    emits("get-menu", (b.right + b.left) / 2, b.top, CellMenu.MultiSelect, true);
}
let watchCells: Map<string, TableCell> = new Map();
function cells_watcher() {
    const table_selection = props.context.tableSelection;
    if (table_selection.tableRowStart > -1) {
        const cells = table_selection.getSelectedCells(true);
        const needWatch: Map<string, TableCell> = new Map();
        for (let i = 0, len = cells.length; i < len; i++) {
            let c = cells[i];
            if (c.cell) {
                needWatch.set(c.cell.id, c.cell);
                c.cell.watch(t1);
            }
        }
        watchCells.forEach((v, k) => {
            if (!needWatch.get(k)) v.unwatch(t1);
        })
        watchCells = needWatch;
    }
}
function table_watcher() {
    update_cell_selection(true);
    cells_watcher();
}
watch(() => props.cell, (c, oc) => {
    if (c) c.watch(update_triangle)
    if (oc) oc.unwatch(update_triangle);
})
watch(() => props.matrix, () => { update_cell_selection(true); update_triangle(); });
watch(() => props.table, (v, o) => {
    if (o) o.unwatch(table_watcher);
    v.watch(table_watcher);
})
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.tableSelection.watch(table_selection_watcher);
    props.table.watch(table_watcher);
    cells_watcher();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.tableSelection.unwatch(table_selection_watcher);
    props.table.unwatch(table_watcher);
})
</script>
<template>
    <path v-if="selection_path" :d="selection_path" fill="#865dff" fill-opacity="0.40" stroke='none'>
    </path>
    <svg v-if="triangle" :x="triangle_position.x" :y="triangle_position.y" viewBox="0 0 1024 1024" version="1.1"
        @mousedown="(e) => select_cell_by_triangle(e)" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
        style="cursor: pointer;">
        <rect x="200" y="200" width="824" height="824" fill="transparent"></rect>
        <path fill-opacity="0.75"
            d="M547.328 810.666667H810.666667v-263.338667L547.328 810.666667zM896 341.333333v554.666667H341.333333L896 341.333333z"
            fill="#444444"></path>
    </svg>
</template>
<style scoped lang="scss"></style>