<script lang="ts" setup>
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ShapeType, TableShape } from '@kcdesign/data';
import { onMounted, onUnmounted } from 'vue';

interface Props {
    context: Context
}
const props = defineProps<Props>();
function update_cell_selection() {
    const selection = props.context.selection;
    const shape = selection.selectedShapes[0];
    if (shape && shape.type === ShapeType.Table) {
        const table_selection = selection.getTableSelection(shape as TableShape, props.context);
        const cell = table_selection.getSelectedCells(true);
        console.log('画面', cell);
    }
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
<template></template>
<style scoped lang="scss"></style>