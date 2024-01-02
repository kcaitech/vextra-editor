<script setup lang="ts">
import { Context } from '@/context';
import { CutoutShape, CutoutShapeView, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { genRectPath } from '../Selection/common';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { Selection } from '@/context/selection';

const props = defineProps<{
    context: Context
    matrix: Matrix
    data: CutoutShapeView
}>();

const cutoutPath = ref<string>();
const matrix = new Matrix();
const isSelected = ref(false);
const getCutoutPath = () => {
    const points: { x: number, y: number }[] = [];
    matrix.reset(props.matrix);
    const m = props.data.matrix2Root();
    m.multiAtLeft(matrix);
    const f = props.data.frame;
    const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
    points.push(...ps);
    const path = props.data.getPath().clone();
    path.transform(m);
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    const borPath = genRectPath(framePoint);
    cutoutPath.value = borPath;
    // const b = props.data.frame;
    // let framePoint = [{ x: 0, y: 0 }, { x: b.width, y: 0 }, { x: b.width, y: b.height }, { x: 0, y: b.height }];
    // matrix.reset(props.matrix);
    // const m = props.data.matrix2Root();
    // m.multiAtLeft(matrix);
    // framePoint = framePoint.map(p => m.computeCoord(p.x, p.y));
    // const path = genRectPath(framePoint);
    // cutoutPath.value = path;
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getCutoutPath();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getCutoutPath();
    }
}
const selectedWatcher = ( t: number ) => {
    if (t === Selection.CHANGE_SHAPE) {
        const shapes = props.context.selection.selectedShapes;
        isSelected.value = shapes.some(v => v.id === props.data.id);
    } 
}

watch(() => props.data, (v, o) => {
    o.unwatch(getCutoutPath);
    v.watch(getCutoutPath);
})

onMounted(() => {
    getCutoutPath();
    props.data.watch(getCutoutPath);
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.data.unwatch(getCutoutPath);
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectedWatcher);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <path :d="cutoutPath" fill="none" :stroke="isSelected ? '#865dff' : 'rgba(0,0, 0, 0.2)'" stroke-dasharray="5,3">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>