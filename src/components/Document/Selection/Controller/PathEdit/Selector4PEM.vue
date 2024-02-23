<script setup lang="ts">
import { Context } from '@/context';
import { Matrix, PathShape, Shape } from '@kcdesign/data';
import { onMounted, onUnmounted, watch } from 'vue';
import { XY } from "@/context/selection";
import { Segment } from '@/utils/pathedit';
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
const selected_segs: Set<number> = new Set();
let p_changed: boolean = false;
let s_changed: boolean = false;
let path_shape: Shape | undefined;
let path_string: string = '';
let m42Dp: Matrix | undefined; // 2D点到页面的转换矩阵
function select() {
    path_shape = props.context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    p_changed = false;
    s_changed = false;
    modify_select_path();
    remove_points();
    remove_segs();
    finder_points();
    finder_segs();
    if (p_changed || s_changed) {
        props.context.path.select(Array.from(selected_points.values()), Array.from(selected_segs.values()));
    }
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
        { x: l, y: t },
        { x: r, y: t },
        { x: r, y: b },
        { x: l, y: b },
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
    const points = (path_shape as PathShape).points;
    for (let i = 0, l = points.length; i < l; i++) {
        if (selected_points.has(i)) continue;
        const __cp = points[i];
        const p = m42Dp.computeCoord2(__cp.x, __cp.y);
        if (point_is_target(p)) {
            selected_points.add(i);
            p_changed = true;
        }
    }
}
function finder_segs() {
    if (!path_shape) {
        return;
    }
    const segments = props.context.path.segments;
    for (let i = 0, l = segments.length; i < l; i++) {
        if (selected_segs.has(i)) {
            continue;
        }
        if (is_target_segs(segments[i])) {
            selected_segs.add(i);
            s_changed = true;
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
    const points = (path_shape as PathShape).points;
    selected_points.forEach(i => {
        const __cp = points[i];
        const p = m42Dp!.computeCoord2(__cp.x, __cp.y);
        if (!point_is_target(p)) {
            selected_points.delete(i);
            p_changed = true;
        }
    })
}

function remove_segs() {
    if (!selected_segs.size || !path_shape) {
        return;
    }
    const segments = props.context.path.segments;
    selected_segs.forEach(i => {
        if (!is_target_segs(segments[i])) {
            selected_segs.delete(i);
            s_changed = true;
        }
    })
}

function point_is_target(p: XY) {
    const scout = props.context.selection.scout!;
    return scout.isPointInPath(path_string, p);
}

function isPointInsideRect(x: number, y: number) {
    const { left, top, width, height } = props.selectorFrame;
    return x >= left && x <= left + width &&
        y >= top && y <= top + height;
}

function cubicBezierPoint(t: number, p0: XY, p1: XY, p2: XY, p3: XY) {
    const a = Math.pow(1 - t, 3);
    const b = 3 * Math.pow(1 - t, 2) * t;
    const c = 3 * (1 - t) * Math.pow(t, 2);
    const d = Math.pow(t, 3);
    return {
        x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + d * p3.y
    };
}

function is_target_segs(segs: Segment) {
    return selected_points.size ? is_bezise_inside_rect(segs) : is_bezise_intersect_rect(segs);
}

function is_bezise_inside_rect(segs: Segment) { // 内包
    const { start, from, to, end } = segs;
    const step = 0.01;
    for (let t = 0; t <= 1; t += step) {
        const xy = cubicBezierPoint(t, start, from, to, end);
        if (!isPointInsideRect(xy.x, xy.y)) {
            return false;
        }
    }
    return true;
}
function is_bezise_intersect_rect(segs: Segment) { // 相交
    const { start, from, to, end } = segs;
    const step = 0.01;
    for (let t = 0; t <= 1; t += step) {
        const xy = cubicBezierPoint(t, start, from, to, end);
        if (isPointInsideRect(xy.x, xy.y)) {
            return true;
        }
    }
    return false;
}
function reset() {
    selected_points.clear();
    selected_segs.clear();
}

watch(() => props.selectorFrame, select, { deep: true });
// hooks
onMounted(() => {
});
onUnmounted(() => {
});
</script>
<template>
    <div class="selector" :style="{
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
    border: 1px solid var(--active-color);
    background-color: rgba($color: #1878f5, $alpha: 0.1);
}
</style>