<script lang="ts" setup>
import { Context } from '@/context';
import { WorkSpace } from '@/context/workspace';
import { Segment2, get_segments2 } from '@/utils/pathedit';
import { GroupShapeView, Matrix, PathShapeView, Shape, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { get_path_by_point } from '../Points/common';
interface Props {
    context: Context
}
interface Dot {
    point: { x: number, y: number }
    index: number
    selected: boolean
}
const props = defineProps<Props>();
const data: { segments: Segment2[], dots: Dot[] } = reactive({ segments: [], dots: [] });
const { segments, dots } = data;
const new_high_light = ref<number>(-1);
const matrices: Map<string, Matrix> = new Map();
let shape: ShapeView;
function update() {
    segments.length = 0;
    dots.length = 0;
    if (!props.context.workspace.shouldSelectionViewUpdate) {
        return;
    }
    update_matrices();
    if (!confirm_shape()) {
        console.log('!confirm_shape()');
        return;
    }
    dots.push(...get_path_by_point(shape as PathShapeView, matrices.get(shape.id)!, new Set()));
    segments.push(...get_segments2(shape as PathShapeView, matrices));
}
function confirm_shape() {
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
    if (shape instanceof PathShapeView) {
        __init_m(shape, matrices);
        return;
    }
    __init_m_for_g(shape as GroupShapeView, matrices);
}
function __init_m_for_g(group: GroupShapeView, matrices: Map<string, Matrix>) {
    const shapes = group.childs;
    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        if (shape instanceof GroupShapeView) {
            __init_m_for_g(shape, matrices);
            continue;
        }
        if (!(shape instanceof PathShapeView)) {
            continue;
        }
        __init_m(shape, matrices);
    }
}
function __init_m(shape: PathShapeView, container: Map<string, Matrix>) {
    const wm = props.context.workspace.matrix;
    const m = new Matrix(shape.matrix2Root());
    m.multiAtLeft(wm);
    container.set(shape.id, m);
}
function down_background_path(index: number) {
    const seg = segments[index];
    if (!seg) {
        console.log('!seg');
        return;
    }
    const editor = props.context.editor4Shape(seg.shape);
    const code = editor.clipPathShape(index, props.context.workspace.t('attr.path'));

    after_clip(code);
}
function after_clip(data: { code: number, ex: Shape | undefined }) {
    if (data.code === 1) {
        props.context.selection.resetSelectShapes();
        props.context.workspace.setPathEditMode(false);
    }
    if (data.ex) {
        const s = props.context.selection.selectedPage!.getShape(data.ex.id);
        s && props.context.selection.selectShape(s);
    }
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
function init_shape() {
    shape = props.context.selection.selectedShapes[0];
    if (!shape) {
        console.log('!shape');
        return false;
    }
    return true;
}
onMounted(() => {
    props.context.workspace.watch(matrix_watcher);
    init_shape();
    update();
    watch_at_once();
})
onUnmounted(() => {
    break_watch();
    props.context.workspace.unwatch(matrix_watcher);
})
</script>
<template>
    <g v-for="(seg, i) in segments" :key="i" data-area="controller-element" @mouseenter="() => enter(i)"
        @mouseleave="leave">
        <g @mousedown.stop="() => down_background_path(seg.index)">
            <path class="background-path" :d="seg.path"></path>
            <path :class="{ path: true, 'path-high-light': new_high_light === i }" :d="seg.path">
            </path>
        </g>
    </g>
    <rect v-for="(p, i) in dots" :key="i" :style="{ transform: `translate(${p.point.x - 4}px, ${p.point.y - 4}px)` }"
        class="point" rx="4" ry="4">
    </rect>
</template>
<style scoped lang="scss">
.background-path {
    stroke: transparent;
    stroke-width: 14px;
    fill: none;
}

.path {
    stroke: #f5f5f5;
    fill: none;
}

.path-high-light {
    stroke: var(--active-color);
}

.point {
    fill: #ffffff;
    stroke: var(--active-color);
    height: 8px;
    width: 8px;
}
</style>