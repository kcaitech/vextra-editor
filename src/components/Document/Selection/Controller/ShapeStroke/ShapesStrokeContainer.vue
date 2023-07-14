<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
const props = defineProps<{
    matrix: number[]
    context: Context
}>();
const matrix = new Matrix();
const paths = ref<string[]>([]);
function update() {
    matrix.reset(props.matrix);
    update_paths(props.context.selection.selectedShapes);
}
function selection_watcher(t?: number) {
    if (t === Selection.CHANGE_SHAPE) {
        update();
    }
}
function update_paths(shapes: Shape[]) {
    paths.value.length = 0;
    matrix.reset(props.matrix);
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const path = shape.getPath(true);
        const m2r = shape.matrix2Root();
        path.transform(m2r);
        path.transform(matrix);
        paths.value.push(path.toString());
    }
}
function workspace_watcher(t?: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        update();
    }
}
watch(() => props.matrix, () => {
    update();
})
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    update();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <g>
        <path v-for="(p, i) in paths" :key="i" :d="p" stroke='#865dff' stroke-width="1px" fill="none"></path>
    </g>
</template>
<style lang='scss' scoped></style>