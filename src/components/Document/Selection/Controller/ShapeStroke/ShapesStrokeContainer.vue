<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, Shape } from '@kcdesign/data';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
const watchedShapes = new Map();
interface Props {
    matrix: Matrix
    context: Context
}
const props = defineProps<Props>();
const matrix = new Matrix();
const paths = ref<string[]>([]);
function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(update);
        watchedShapes.set(k, v);
    })
}
function update() {
    matrix.reset(props.matrix);
    update_paths(props.context.selection.selectedShapes);
}
function selection_watcher(t?: number) {
    if (t === Selection.CHANGE_SHAPE) {
        update();
        watchShapes();
    }
}
function update_paths(shapes: Shape[]) {
    // const s = Date.now();
    const workspace = props.context.workspace;
    if (!workspace.shouldSelectionViewUpdate) return;
    paths.value.length = 0;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const path = shape.getPath();
        const m2r = shape.matrix2Root();
        m2r.multiAtLeft(props.matrix);
        path.transform(m2r);
        paths.value.push(path.toString());
    }
    if (shapes.length === 1 && paths.value.length === 1) {
        workspace.setCtrlPath(paths.value[0]);
    }
    // const e = Date.now();
    // console.log('描边绘制用时(ms):', e - s);
}
function workspace_watcher(t?: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) passive_update();
}
function passive_update() {
    matrix.reset(props.matrix);
    paths.value.length = 0;
    const shapes = props.context.selection.selectedShapes;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const path = shape.getPath();
        const m2r = shape.matrix2Root();
        m2r.multiAtLeft(props.matrix);
        path.transform(m2r);
        paths.value.push(path.toString());
    }
    if (shapes.length === 1 && paths.value.length === 1) {
        props.context.workspace.setCtrlPath(paths.value[0]);
    }
}
watch(() => props.matrix, update, { deep: true })
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    update();
    watchShapes();
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