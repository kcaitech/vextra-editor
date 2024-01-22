<script setup lang="ts">
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Matrix, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
    context: Context
    matrix: Matrix
}
const props = defineProps<Props>();
const matrix = new Matrix();
interface Dot {
    x: number, y: number
}
const dots = ref<Dot[]>([]);
const liner = ref({ x: 0, y: 0 , width: 0, height: 0 })
const get_linear_points = () => {
    const shapes = props.context.selection.selectedShapes;
    const shape = shapes[0];
    const gradinet = props.context.color.gradient;
    if(!gradinet) return;
    const frame = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix);
    const dot1 = m.computeCoord3({x: frame.width * gradinet.from.x, y: frame.height * gradinet.from.y});
    const dot2 = m.computeCoord3({x: frame.width * gradinet.to.x, y: frame.height * gradinet.to.y});
    dots.value = [dot1, dot2];
    liner.value = {
        x: dot1.x,
        y: dot1.y,
        width: 2,
        height: dot2.y - dot1.y
    };
}

const watcher = () => {
    matrix.reset(props.matrix);
    get_linear_points();
}

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes;
    if (selection) {
        selection.forEach((v) => {
            needWatchShapes.set(v.id, v);
        })
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(watcher);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(watcher);
        watchedShapes.set(k, v);
    })
}

const workspace_watcher = (t: number) => {
    if(t === WorkSpace.MATRIX_TRANSFORMATION) {
        watcher();
    }
}
onMounted(() => {
    watcher();
    watchShapes();
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <rect :x="liner.x - 1" :y="liner.y" :width="liner.width" :height="liner.height" fill="white" stroke="#000" stroke-width="0.5"></rect>
        <circle v-for="(p, ids) in dots" :key="ids" r="4" fill="white" stroke="#595959" stroke-width="1" :cx="p.x" :cy="p.y"></circle>
    </svg>
</template>
<style scoped lang="scss"></style>