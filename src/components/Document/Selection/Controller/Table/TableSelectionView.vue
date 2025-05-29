/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import { ClientXY, Selection } from '@/context/selection';
import {
    ColVector3D, 
    ShapeType,
    TableCellView,
    TableView,
    Transform
} from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { genRectPath } from '../../common';
import { XYsBounding } from '@/utils/common';
import { CellMenu } from '@/context/menu';
import { TableSelection } from '@/context/tableselection';

interface Props {
    context: Context
    cell: TableCellView | undefined
    table: TableView
    matrix: number[]
}

interface Emits {
    (e: 'get-menu', x: number, y: number, type: CellMenu, cell_menu: boolean): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const selection_path = ref<string>('');
const triangle = ref<boolean>(false);
let transform: string;

function update_cell_selection(gen_menu_posi?: boolean) {
    selection_path.value = '';
    emits("get-menu", 0, 0, CellMenu.MultiSelect, false);
    if (props.table && props.table.type === ShapeType.Table) {
        const table_selection = props.context.tableSelection;
        if (!table_selection || table_selection.tableRowStart < 0) {
            return;
        }
        const cells = table_selection.getSelectedCells(true);
        gen_view(props.table, cells, gen_menu_posi);
    }
}

const t1 = () => update_cell_selection(true);

function gen_view(table: TableView, cells: { cell: TableCellView | undefined, rowIdx: number, colIdx: number }[], gen_menu_posi?: boolean) {
    const t2r = table.matrix2Root();
    const m = props.context.workspace.matrix;
    t2r.multiAtLeft(m);
    let points: ClientXY[] = [];
    const grid = (table).getLayout().grid;
    let row_p = undefined;
    if (props.context.tableSelection.tableMenuVRowVisible) {
        const f = grid.get(props.context.tableSelection.tableRowStart, 0).frame;
        row_p = t2r.computeCoord2(f.x, f.y + (f.height / 2));
    }
    for (let i = 0, len = cells.length; i < len; i++) {
        const cell = cells[i];
        const f = grid.get(cell.rowIdx, cell.colIdx).frame;
        const cps = [{x: f.x, y: f.y}, {x: f.x + f.width, y: f.y}, {x: f.x + f.width, y: f.y + f.height}, {x: f.x, y: f.y + f.height}];
        for (let j = 0; j < 4; j++) {
            const p = cps[j];
            points.push(t2r.computeCoord2(p.x, p.y));
        }
    }
    selection_path.value = genRectPath(points);
    if (gen_menu_posi) {
        _get_menu_position(points, row_p);
    }
}

function update_triangle() {
    triangle.value = false;
    const selection = props.context.selection;
    const shape = selection.selectedShapes[0];
    const tableSelection = props.context.tableSelection;
    if (shape && shape.type === ShapeType.Table && tableSelection) {
        const cell = tableSelection.editingCell;
        if (!cell) return false;
        const grid = (shape as TableView).getLayout().grid;
        const g = grid.get(cell.index.row, cell.index.col);
        if (!g) return false;

        const f = grid.get(cell.index.row, cell.index.col).frame;

        const trans = (shape.matrix2Root());
        const mClient = (props.context.workspace.matrix);

        const __t = new Transform()
            .translate(ColVector3D.FromXY(f.x + f.width - 22, f.y + f.height - 22))
            .addTransform(trans)
            .addTransform(mClient);

        transform = (__t).toString();

        triangle.value = true;
    }
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        update_cell_selection();
        watchCells.forEach((v) => v.unwatch(t1));
        watchCells.clear();
    } else if (t === Selection.CHANGE_PAGE) {
        update_cell_selection();
        watchCells.forEach((v) => v.unwatch(t1));
        watchCells.clear();
    }
}

function table_selection_watcher(t: number, gen_menu_posi: any) {
    if (t === TableSelection.CHANGE_TABLE_CELL) {
        update_cell_selection(gen_menu_posi);
        cells_watcher();
        props.context.tableSelection.setTableMenuVisible(false);
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

function _get_menu_position(points: ClientXY[], row_p?: ClientXY) {
    // const tableSelection = props.context.tableSelection, rows = tableSelection.tableRowStart, rowe = tableSelection.tableRowEnd;
    // const pl = points.length, p1 = points[0], p2 = points[(pl / (rowe - rows + 1)) - 3];
    // if (p1 && p2) {
    //     emits("get-menu", (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, CellMenu.MultiSelect, true);
    // } else {
    //     const b = XYsBounding(points);
    //     emits("get-menu", (b.right + b.left) / 2, b.top, CellMenu.MultiSelect, true);
    // }
    if (row_p) {
        emits("get-menu", row_p.x, row_p.y, CellMenu.SelectRow, true);
    } else {

        const b = XYsBounding(points);
        emits("get-menu", (b.right + b.left) / 2, b.top, CellMenu.MultiSelect, true);
    }
}

let watchCells: Map<string, TableCellView> = new Map();

function cells_watcher() {
    const table_selection = props.context.tableSelection;
    if (table_selection.tableRowStart > -1) {
        const cells = table_selection.getSelectedCells(true);
        const needWatch: Map<string, TableCellView> = new Map();
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
watch(() => props.matrix, () => {
    update_cell_selection(true);
    update_triangle();
});
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
    <path v-if="selection_path" :d="selection_path" fill="#1878f5" fill-opacity="0.40" stroke='none'>
    </path>
    <g v-if="triangle" :style="{ transform }">
        <path stroke-opacity="0.75" d="M20 10 v10 h-10 z" stroke="#444444" stroke-width="2px" fill="transparent"></path>
        <rect width="20" height="20" fill="transparent" @mousedown="(e) => select_cell_by_triangle(e)"
              style="cursor: pointer;"></rect>
    </g>
</template>
<style scoped lang="scss"></style>