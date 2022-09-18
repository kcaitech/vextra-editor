<script setup lang="ts">
import { objectId } from '@/basic/objectid';
import { Page } from '@/data/page';
import { Shape } from '@/data/shape';
import { onBeforeMount, onMounted, onUnmounted, reactive, defineProps, ref, getCurrentInstance, ComponentInternalInstance } from 'vue';
import comsMap from './comsmap';

const props = defineProps<{ data: Page }>();
const childs = reactive(new Array<{ data: Shape, id: number }>());
const viewBox = reactive({ x: 0, y: 0, w: 0, h: 0 });

const updater = () => {
    const cc = props.data.childsCount || 0;
    const frame = props.data.frame;
    let right = frame.width || 800;
    let bottom = frame.height || 600;
    let left = 0;
    let top = 0;

    for (let i = 0; i < cc; i++) {
        const child = props.data.getChildByIndex(i);
        const cf = child.frame;
        right = Math.max(right, cf.x + cf.width + 1);
        bottom = Math.max(bottom, cf.y + cf.height + 1);
        left = Math.min(left, cf.x);
        top = Math.min(top, cf.y);
        childs.push({ data: child, id: objectId(child) });
    }

    viewBox.x = left;
    viewBox.y = top;
    viewBox.w = right - left;
    viewBox.h = bottom - top;
}

onBeforeMount(() => {
    updater();
})

onMounted(() => {
    props.data.watch(updater);
})

onUnmounted(() => {
    props.data.unwatch(updater);
})

const viewBox2Str = () => {
    return "" + viewBox.x + " " + viewBox.y + " " + viewBox.w + " " + viewBox.h;
}

const matrix = ref([1, 0, 0, 1, 0, 0]);
const matrix_multi = (m: number[]) => {
    const m0 = matrix.value;
    const m1 = [
        m[0] * m0[0] + m[1] * m0[2], m[0] * m0[1] + m[1] * m0[3],
        m[2] * m0[0] + m[3] * m0[2], m[2] * m0[1] + m[3] * m0[3],
        m[0] * m0[4] + m[1] * m0[5] + m[4], m[2] * m0[4] + m[3] * m0[5] + m[5]
    ]
    matrix.value = m1;
}
const matrix_trans = (x: number, y: number) => {
    matrix_multi([1, 0, 0, 1, x, y]);
}
const matrix_scale = (s: number) => {
    matrix_multi([s, 0, 0, s, 0, 0]);
}
function compute_matrix_coordX(x: number, y: number) {
    const m = matrix.value;
    return { x: m[0]*x + m[1]*y + m[4], y: m[2]*x + m[3]*y + m[5] };
}

function onMouseWheel(e: WheelEvent) {
    // console.log(e);
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;
    const { x, y } = compute_matrix_coordX(offsetX, offsetY);
    matrix_trans(-x, -y);
    const scale_delta = 1.05;
    const scale_delta_ = 1 / scale_delta;
    matrix_scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
    matrix_trans(x, y);
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

function onClick(e: MouseEvent) {
    console.log(e);
    console.log(proxy?.$el);
    // console.log(getCurrentInstance());
}

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" :viewBox="viewBox2Str()" :width="Math.min(1000, viewBox.w)"
        :height="Math.min(800, viewBox.h)" @wheel.passive="onMouseWheel" @click="onClick"
        :style="{ transform: 'matrix(' + matrix.join(',') + ')' }">

        <component v-for="c in childs" :key="c.id" :is="comsMap.get(c.data.type)" :data="c.data"
            :boolop="props.data.boolOp">
        </component>

    </svg>
</template>

<style scoped>
svg {
    transform-origin: top left;
}
</style>