<script setup lang="ts">
import { Context } from '@/context';
import { Assist } from '@/context/assist';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted } from 'vue';

interface Props {
    context: Context
}
const props = defineProps<Props>();
const getIntersectShapes = () => {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const points: { x: number, y: number }[] = [];
    for (let index = 0; index < shapes.length; index++) {
        const s = shapes[index];
        const m = s.matrix2Root();
        m.multiAtLeft(props.context.workspace.matrix);
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord(p.x, p.y));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    const h_shape = props.context.assist.horIntersect(b.left, b.right);
    const v_shape = props.context.assist.verIntersect(b.top, b.bottom);
    console.log(h_shape, '垂直');
    console.log(v_shape, '水平');
    
}

const selectedWatcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        watch_shapes();
    }
}
const workspaceUpdate = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        getIntersectShapes();
    }
}

const watchedShapes = new Map<string, ShapeView>(); // 图层监听
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(getIntersectShapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    selectedShapes.forEach((v) => {
        v.watch(getIntersectShapes);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    watch_shapes();
    props.context.workspace.watch(workspaceUpdate);
    props.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceUpdate);
    props.context.selection.unwatch(selectedWatcher);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" width="100"
        height="100" viewBox="0 0 100 100" style="position: absolute">

    </svg>
</template>

<style scoped lang="scss"></style>