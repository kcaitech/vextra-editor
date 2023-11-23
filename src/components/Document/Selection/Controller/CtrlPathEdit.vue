<script lang="ts" setup>
import PointsPathEditContainer from "@/components/Document/Selection/Controller/Points/PointsPathEditContainer.vue";
import {Context} from "@/context";
import {computed, onMounted, onUnmounted, reactive} from "vue";

interface Props {
    context: Context
}

const props = defineProps<Props>();
const bounds = reactive({left: 0, top: 0, right: 0, bottom: 0});
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})

function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}

function update() {
    console.log('emit update');
    const path_shape = props.context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    const m = path_shape.matrix2Root();
    m.multiAtLeft(props.context.workspace.matrix);
    const f = path_shape.frame;
    const __points = [{x: 0, y: 0}, {x: f.width, y: 0}, {x: f.width, y: f.height}, {x: 0, y: f.height}];
    for (let i = 0; i < __points.length; i++) {
        const p = __points[i];
        __points[i] = m.computeCoord3(p);
    }
    bounds.left = Math.min(__points[0].x, __points[1].x, __points[2].x, __points[3].x);
    bounds.top = Math.min(__points[0].y, __points[1].y, __points[2].y, __points[3].y);
    bounds.right = Math.max(__points[0].x, __points[1].x, __points[2].x, __points[3].x);
    bounds.bottom = Math.max(__points[0].y, __points[1].y, __points[2].y, __points[3].y);
}

onMounted(() => {
    console.log('CtrlPathEdit MOUNTED');
    const path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.watch(update);
    }
    update();
});
onUnmounted(() => {
    console.log('CtrlPathEdit UNMOUNTED')
    const path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.unwatch(update);
    }
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         data-area="controller"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
         :width="width" :height="height" overflow="visible" :viewBox="genViewBox(bounds)"
         :style="{transform: `translate(${bounds.left}px,${bounds.top}px)`}"
    >
        <PointsPathEditContainer :context="props.context"></PointsPathEditContainer>
    </svg>
</template>
<style lang="scss" scoped>
svg {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.1);
}
</style>