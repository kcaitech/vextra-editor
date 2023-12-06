<script lang="ts" setup>
import { Context } from '@/context';
import { Segment2, get_segments2 } from '@/utils/pathedit';
import { GroupShape, Matrix, PathShape } from '@kcdesign/data';
import { reactive, ref } from 'vue';
interface Props {
    context: Context
    shape: PathShape | GroupShape
}
const props = defineProps<Props>();
const data: { segments: Segment2[] } = reactive({ segments: [] });
const segments = data.segments;
const new_high_light = ref<number>(-1);
const matrices: Map<string, Matrix> = new Map();

function update() {
    segments.length = 0;
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    update_matrices();
    segments.push(...get_segments2(props.shape, matrices));
}
function update_matrices() {
    matrices.clear();
    const shape = props.shape;
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
function down_background_path(e: MouseEvent, index: number) { }
function enter(e: MouseEvent, index: number) { }
function leave() { }
</script>
<template>
    <g v-for="(p, i) in segments" :key="i" data-area="controller-element" @mouseenter="(e) => enter(e, i)"
        @mouseleave="leave">
        <g @mousedown="(e) => down_background_path(e, i)">
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
    stroke: rgba(255, 166, 0, 0.3);
}
</style>