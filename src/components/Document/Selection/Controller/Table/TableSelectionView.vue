<script lang="ts" setup>
import { Context } from '@/context';
import { ClientXY, Selection } from '@/context/selection';
import { Shape, ShapeType, TableCell, TableShape } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { genRectPath } from '../../common';

interface Props {
    context: Context
}
const props = defineProps<Props>();
const selection_path = ref<string>('');
function update_cell_selection() {
    selection_path.value = '';
    const selection = props.context.selection;
    const shape = selection.selectedShapes[0];
    if (shape && shape.type === ShapeType.Table) {
        const table_selection = selection.getTableSelection(shape as TableShape, props.context);
        const m2f = table_selection.map2Frame;
        if (m2f.size) {
            const cells = table_selection.getSelectedCells(true);
            gen_view(shape, cells, m2f);
        }
    }
}
function gen_view(table: Shape, cells: TableCell[], m2f: Map<string, { row: number, col: number }>) {
    const t2r = table.matrix2Root(), m = props.context.workspace.matrix;
    t2r.multiAtLeft(m);
    let points: ClientXY[] = [];
    const grid = (table as TableShape).getLayout().grid;
    for (let i = 0, len = cells.length; i < len; i++) {
        const cell = cells[i];
        const c2p = cell.matrix2Parent();
        c2p.multiAtLeft(t2r);
        const rc = m2f.get(cell.id);
        if (!rc) continue;
        const f = grid.get(rc.row, rc.col).frame;
        const cps = [{ x: f.x, y: f.y }, { x: f.x + f.width, y: f.y }, { x: f.x + f.width, y: f.y + f.height }, { x: f.x, y: f.y + f.height }];
        for (let j = 0; j < 4; j++) {
            const p = cps[j];
            points.push(c2p.computeCoord2(p.x, p.y));
        }
    }
    selection_path.value = genRectPath(points);
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_TABLE_CELL) return update_cell_selection();
    if (t === Selection.CHANGE_SHAPE) return update_cell_selection();
    if (t === Selection.CHANGE_PAGE) return update_cell_selection();
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <path v-if="selection_path" :d="selection_path" fill="#865dff" fill-opacity="0.25" stroke='none'>
    </path>
</template>
<style scoped lang="scss"></style>