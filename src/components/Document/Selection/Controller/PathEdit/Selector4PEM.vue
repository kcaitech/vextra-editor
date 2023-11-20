<script setup lang="ts">
import {Context} from '@/context';
import {Matrix, Shape} from '@kcdesign/data';
import {onMounted, onUnmounted, watch} from 'vue';
import {XY} from "@/context/selection";

export interface SelectorFrame {
    top: number
    left: number
    width: number
    height: number
    includes: boolean
}

interface Props {
    selectorFrame: SelectorFrame
    context: Context
}

const props = defineProps<Props>();
const selected_points: Set<number> = new Set();
let changed: boolean = false;
let path_shape: Shape | undefined;
let path_string: string = '';
let m42Dp: Matrix | undefined; // 2D点到页面的转换矩阵
function select() {
    path_shape = props.context.selection.pathshape;
    if (!path_shape) return;
    changed = false;
    modify_select_path();
    remove_points();
    finder_points();
    if (!changed) return;
    props.context.path.select_points(Array.from(selected_points.values()));
}

/**
 * @description 得到selector框在page上的路径path
 */
function modify_select_path() {
    const m = new Matrix(props.context.workspace.matrix.inverse);
    const l = props.selectorFrame.left;
    const r = props.selectorFrame.left + props.selectorFrame.width;
    const t = props.selectorFrame.top;
    const b = props.selectorFrame.top + props.selectorFrame.height;
    const _ps = [
        {x: l, y: t},
        {x: r, y: t},
        {x: r, y: b},
        {x: l, y: b},
    ].map(i => m.computeCoord3(i));
    const [lt, rt, rb, lb] = _ps;
    path_string = `M${lt.x} ${lt.y} L${rt.x} ${rt.y} L${rb.x} ${rb.y} L${lb.x} ${lb.y} z`;
}

// 加入
function finder_points() {
    if (!path_shape) return;
    if (!m42Dp) {
        m42Dp = new Matrix();
        m42Dp.preScale(path_shape.frame.width, path_shape.frame.height);
        m42Dp.multiAtLeft(path_shape.matrix2Root());
    }
    const points = path_shape.points;
    for (let i = 0, l = points.length; i < l; i++) {
        if (selected_points.has(i)) continue;
        const p = m42Dp.computeCoord3(points[i].point);
        if (point_is_target(p)) {
            selected_points.add(i);
            changed = true;
        }
    }
}

// 剔除
function remove_points() {
    if (!selected_points.size || !path_shape) return;
    if (!m42Dp) {
        m42Dp = new Matrix();
        m42Dp.preScale(path_shape.frame.width, path_shape.frame.height);
        m42Dp.multiAtLeft(path_shape.matrix2Root());
    }
    const points = path_shape.points;
    selected_points.forEach(i => {
        const p = m42Dp!.computeCoord3(points[i].point);
        if (!point_is_target(p)) {
            selected_points.delete(i);
            changed = true;
        }
    })
}

function point_is_target(p: XY) {
    const scout = props.context.selection.scout!;
    return scout.isPointInPath(path_string, p);
}

function reset() {
    selected_points.clear();
}

watch(() => props.selectorFrame, select, {deep: true});
// hooks
onMounted(() => {
});
onUnmounted(() => {
});
</script>
<template>
    <div class="selector"
         :style="{
        top: `${props.selectorFrame.top}px`,
        left: `${props.selectorFrame.left}px`,
        width: `${props.selectorFrame.width}px`,
        height: `${props.selectorFrame.height}px`
    }">
    </div>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--theme-color-anti);
    background-color: rgba($color: #ffffff, $alpha: 0.1);
}
</style>