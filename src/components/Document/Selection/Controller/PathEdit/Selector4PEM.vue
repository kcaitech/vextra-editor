<script setup lang="ts">
import { Context } from '@/context';
import { CurvePoint, Matrix, PathShapeView, PathType, ShapeView } from '@kcdesign/data';
import { watch } from 'vue';
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

const selected_points = new Map<number, Set<number>>();
const selected_segs = new Map<number, Set<number>>();

let p_changed: boolean = false;
let s_changed: boolean = false;

let path_shape: ShapeView | undefined;
let path_string: string = '';
let reusableMatrix: Matrix | undefined;

function select() {
    path_shape = props.context.selection.pathshape;
    if (!path_shape) return;

    p_changed = false;
    s_changed = false;

    modify_select_path();

    remove_points();
    remove_segs();

    finder_points();
    finder_segs();

    if (p_changed || s_changed) {
        props.context.path.select(selected_points, selected_segs);
    }
}

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

function finder_points() {
    if (!path_shape || path_shape.pathType !== PathType.Editable) return;

    if (!reusableMatrix) {
        reusableMatrix = path_shape.matrix2Root();
        reusableMatrix.preScale(path_shape.size.width, path_shape.size.height);
    }

    const segments = (path_shape as PathShapeView).segments;
    segments.forEach((segment, k) => {
        __exe(k, segment.points as CurvePoint[], reusableMatrix!);
    })

    function __exe(segmentIdx: number, points: CurvePoint[], matrix: Matrix) {
        let __indexes = selected_points.get(segmentIdx);

        if (!__indexes) {
            const s = new Set<number>();
            selected_points.set(segmentIdx, s);
            __indexes = s;
        }

        for (let i = 0, l = points.length; i < l; i++) {
            if (__indexes.has(i)) continue;

            const p = matrix.computeCoord3(points[i]);
            if (point_is_target(p)) {
                __indexes.add(i);
                p_changed = true;
            }
        }
    }
}

function remove_points() {
    if (!selected_points.size || !path_shape || path_shape.pathType !== PathType.Editable) return;

    if (!reusableMatrix) {
        reusableMatrix = path_shape.matrix2Root();
        reusableMatrix.preScale(path_shape.size.width, path_shape.size.height);
    }

    const segments = (path_shape as PathShapeView).segments;
    segments.forEach((segment, index) => {
        __exe(index, segment.points as CurvePoint[], reusableMatrix!);
    });

    function __exe(segmentIdx: number, points: CurvePoint[], matrix: Matrix) {
        const __points = selected_points.get(segmentIdx);

        if (!__points) return;

        __points.forEach(i => {
            if (!point_is_target(matrix.computeCoord3(points[i]))) {
                __points.delete(i);
                p_changed = true;
            }
        })
    }
}

function finder_segs() {
    if (!path_shape) return;

    const segments = props.context.path.segments;

    segments.forEach((seg, index) => {
        let __selected = selected_segs.get(index);
        if (!__selected) {
            const s = new Set<number>();
            selected_segs.set(index, s);
            __selected = s;
        }

        for (let i = 0, l = seg.length; i < l; i++) {
            if (__selected.has(i)) continue;

            if (is_target_segs(seg[i])) {
                __selected.add(i);
                s_changed = true;
            }
        }
    })
}

function remove_segs() {
    if (!selected_segs.size || !path_shape) {
        return;
    }
    const segments = props.context.path.segments;

    selected_segs.forEach((segment, index) => {
        const __segments = segments[index];

        if (!__segments) return;

        segment.forEach(i => {
            if (__segments[i] && !is_target_segs(__segments[i])) {
                segment.delete(i);
                s_changed = true;
            }
        })
    })
}

function point_is_target(p: XY) {
    return props.context.selection.scout.isPointInPath(path_string, p);
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
    const { start, end } = segs;

    return (isPointInsideRect(start.x, start.y) || isPointInsideRect(end.x, end.y))
        ? is_bezise_inside_rect(segs)
        : is_bezise_intersect_rect(segs);
}

function is_bezise_inside_rect(segs: Segment) { // 内包
    const { start, from, to, end } = segs;
    const step = 0.01;
    for (let t = 0; t <= 1; t += step) {
        const xy = cubicBezierPoint(t, start, from, to, end);
        if (!isPointInsideRect(xy.x, xy.y)) return false;
    }
    return true;
}

function is_bezise_intersect_rect(segs: Segment) { // 相交
    const { start, from, to, end } = segs;
    const step = 0.01;
    for (let t = 0; t <= 1; t += step) {
        const xy = cubicBezierPoint(t, start, from, to, end);
        if (isPointInsideRect(xy.x, xy.y)) return true;
    }
    return false;
}

watch(() => props.selectorFrame, select, { deep: true });
</script>
<template>
<div class="selector" :style="{
        top: `${props.selectorFrame.top}px`,
        left: `${props.selectorFrame.left}px`,
        width: `${props.selectorFrame.width}px`,
        height: `${props.selectorFrame.height}px`
    }"
/>
</template>
<style scoped lang="scss">
.selector {
    position: absolute;
    border: 1px solid var(--active-color);
    background-color: rgba($color: #1878f5, $alpha: 0.1);
}
</style>