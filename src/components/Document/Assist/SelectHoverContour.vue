<script setup lang="ts">
import { Matrix, Shape } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { WorkSpace } from '@/context/workspace'
import { Selection } from '@/context/selection';
import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { genRectPath } from "../Selection/common";
interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const tracingPath = ref<string[]>([]);
const matrix = new Matrix();
// hover后给选中和hover的图形描边
const contour = () => {
    tracingPath.value = [];
    const hoveredShape = props.context.selection.hoveredShape;
    const selectShape = props.context.selection.selectedShapes;
    if (!hoveredShape || selectShape.length === 0) return;
    if (selectShape.length === 1 && selectShape[0].id === hoveredShape.id) return;
    matrix.reset(props.matrix);
    selectContour(selectShape);
    hoveredContour(hoveredShape);
}

const selectContour = (shapes: Shape[]) => {
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(matrix);
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
        points.push(...ps);
        const path = s.getPath();
        path.transform(m);
    }
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    const borPath = genRectPath(framePoint)
    tracingPath.value.push(borPath);
}

const hoveredContour = (shape: Shape) => {
    const points: { x: number, y: number }[] = [];
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix);
    const f = shape.frame;
    const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
    points.push(...ps);
    const path = shape.getPath();
    path.transform(m);
    const b = XYsBounding(points);
    const framePoint = [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
    const borPath = genRectPath(framePoint)
    tracingPath.value.push(borPath);
}

const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        contour();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        contour();
    }
}

const selectionWatcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        contour();
    } else if (t === Selection.CHANGE_SHAPE_HOVER) {
        contour();
    }
}

onMounted(() => {
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectionWatcher);

})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute; z-index: 999;">
        <path v-for="(p, i) in tracingPath" :key="i" :d="p" fill="transparent" stroke="#ff2200" stroke-width="1px"
            opacity="0.8"></path>
    </svg>
</template>

<style scoped lang="scss"></style>