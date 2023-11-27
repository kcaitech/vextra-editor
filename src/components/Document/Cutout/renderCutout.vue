<script setup lang="ts">
import { Context } from '@/context';
import { CutoutShape, Matrix } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { genRectPath } from '../Selection/common';
import { WorkSpace } from '@/context/workspace';

const props = defineProps<{
    context: Context
    matrix: Matrix
    data: CutoutShape
}>();

const cutoutPath = ref<string>();
const matrix = new Matrix();
const getCutoutPath = () => {
    const b = props.data.frame;
    let framePoint = [{ x: 0, y: 0 }, { x: b.width, y: 0 }, { x: b.width, y: b.height }, { x: 0, y: b.height }];
    matrix.reset(props.matrix);
    const m = props.data.matrix2Root();
    m.multiAtLeft(matrix);
    framePoint = framePoint.map(p => m.computeCoord(p.x, p.y));
    const path = genRectPath(framePoint);
    cutoutPath.value = path;
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getCutoutPath();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        getCutoutPath();
    }
}
watch(() => props.data, (v, o) => {
    o.unwatch(getCutoutPath);
    v.watch(getCutoutPath);
})
onMounted(() => {
    props.data.watch(getCutoutPath);
    props.context.workspace.watch(workspaceUpdate);
})
onUnmounted(() => {
    props.data.unwatch(getCutoutPath);
    props.context.workspace.unwatch(workspaceUpdate);

})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <path :d="cutoutPath" fill="none" stroke="rgba(0,0, 0, 0.2)" stroke-dasharray="5,3"></path>
    </svg>
</template>

<style scoped lang="scss"></style>