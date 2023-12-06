<script lang="ts" setup>
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Segment2, get_segments2 } from '@/utils/pathedit';
import { GroupShape, Matrix, PathShape } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const data: { segments: Segment2[] } = reactive({ segments: [] });
const segments = data.segments;
const new_high_light = ref<number>(-1);
const matrices: Map<string, Matrix> = new Map();
let shape: PathShape | GroupShape;
function update() {
    segments.length = 0;
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    update_matrices();
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    segments.push(...get_segments2(shape, matrices));
}
function confirm_shape() {
    shape = props.context.selection.selectedShapes[0] as (PathShape | GroupShape);
    if (!shape) {
        console.log('!shape');
        return false;
    }
    return true;
}
function update_matrices() {
    matrices.clear();
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    if (shape instanceof PathShape) {
        __init_m(shape, matrices);
        return;
    }
    const shapes = shape.childs;
    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        if (!(shape instanceof PathShape)) {
            continue;
        }
        __init_m(shape, matrices);
    }
}
function __init_m(shape: PathShape, container: Map<string, Matrix>) {
    const wm = props.context.workspace.matrix;
    const m = new Matrix(shape.matrix2Root());
    m.multiAtLeft(wm);
    container.set(shape.id, m);
}
function down_background_path(index: number) {
    console.log('index:', index);

}
function enter(index: number) {
    new_high_light.value = index;
}
function leave() {
    new_high_light.value = -1;
}
function watch_at_once() {
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    shape.watch(update);
}
function break_watch() {
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    shape.unwatch(update);
}
function matrix_watcher(t: number) {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}

onMounted(() => {
    props.context.workspace.watch(matrix_watcher);
    update();
    watch_at_once();
})
onUnmounted(() => {
    break_watch();
    props.context.workspace.unwatch(matrix_watcher);
})
</script>
<template>
    <g v-for="(p, i) in segments" :key="i" data-area="controller-element" @mouseenter="() => enter(i)" @mouseleave="leave">
        <g @mousedown.stop="() => down_background_path(i)">
            <path class="background-path" :d="p.path"></path>
            <path :class="{ path: true, 'path-high-light': new_high_light === i }" :d="p.path">
            </path>
        </g>
    </g>
</template>
<style scoped lang="scss">
.background-path {
    stroke: transparent;
    stroke-width: 14px;
    fill: none;
}

.path {
    stroke: gray;
    fill: none;
}

.path-high-light {
    stroke: orange;
    stroke-dasharray: 4 4;
}
</style>