<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Shape, ShapeType } from "@kcdesign/data/data/shape";
import { ControllerType, ctrlMap } from "./Controller";
import { CtrlElementType } from "@/context/workspace";
import { getHorizontalAngle, createRect, createHorizontalBox } from "@/utils/common";
import { XY } from "@/context/selection";
export interface Point {
    x: number,
    y: number,
    type: CtrlElementType
}
export interface Bar {
    width: number,
    height: number,
    type: CtrlElementType
}
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
    updater();
}
const props = defineProps<{
    context: Context,
    matrix: number[],
    isController: boolean,
}>();

const shapes: Array<Shape> = [];
const controllerType = ref<ControllerType>(ControllerType.Rect);
const matrix = new Matrix();
const controllerFrame = ref<Point[]>([]);
const tracing = ref<XY[]>([]);
const rotate = ref<number>(0);
let tracingStyle: string;
let tracingPath: string;
let tracingViewBox: string;
let tracingHeight: number;
let tracingWidth: number;
let tracingX: number;
let tracingY: number;

const watchedShapes = new Map();
function watchShapes() { // 监听选区相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection;
    if (selection.hoveredShape) {
        needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);
    }
    if (selection.selectedShapes.length > 0) {
        selection.selectedShapes.forEach((v) => {
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

function updater() {
    matrix.reset(props.matrix);
    watchShapes();
    createController();
    createShapeTracing();
}
function createController() {
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (!selection.length) return;
    if (selection.length === 1) { // 单选
        const shape = selection[0];
        const m = shape.matrix2Page();
        const frame = shape.frame;
        // p1 p2
        // p4 p3
        const points = [
            { x: 0, y: 0, type: CtrlElementType.RectLT },
            { x: frame.width, y: 0, type: CtrlElementType.RectRT },
            { x: frame.width, y: frame.height, type: CtrlElementType.RectRB },
            { x: 0, y: frame.height, type: CtrlElementType.RectLB }
        ];
        controllerFrame.value = points.map(p => {
            let _s = m.computeCoord(p.x, p.y);
            let _p = matrix.computeCoord(_s.x, _s.y);
            p.x = _p.x; p.y = _p.y;
            return p;
        });
        // rotate.value = getHorizontalAngle(points[0], points[1]);
        if (selection[0].type === ShapeType.Line) {
            controllerType.value = ControllerType.Line;
            rotate.value = getHorizontalAngle(points[0], points[2]);
        } else {
            controllerType.value = ControllerType.Rect;
            rotate.value = getHorizontalAngle(points[0], points[1]);
        }
    } else { // 多选
        const __points: [number, number][] = [];
        selection.forEach(p => {
            const m = p.matrix2Page();
            const frame = p.frame;
            let _ps: [number, number][] = [
                [0, 0],
                [frame.width, 0],
                [frame.width, frame.height],
                [0, frame.height]
            ];
            _ps = _ps.map(p => {
                let _s = m.computeCoord(p[0], p[1])
                let _p = matrix.computeCoord(_s.x, _s.y);

                return [_p.x, _p.y];
            });
            __points.push(..._ps);
            const bounding = createHorizontalBox(__points);
            if (bounding) {
                controllerFrame.value = [
                    { x: bounding.left, y: bounding.top, type: CtrlElementType.RectLT },
                    { x: bounding.right, y: bounding.top, type: CtrlElementType.RectRT },
                    { x: bounding.right, y: bounding.bottom, type: CtrlElementType.RectRB },
                    { x: bounding.left, y: bounding.bottom, type: CtrlElementType.RectLB }
                ]
            }
            rotate.value = 0; // 多选时，rect只为水平状态
        });
        controllerType.value = ControllerType.Rect;
    }
}
function createShapeTracing() { // 描边
    const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
    if (!hoveredShape) {
        tracing.value.length = 0;
    } else {
        const selected = props.context.selection.selectedShapes;
        if (selected.includes(hoveredShape)) {
            tracing.value.length = 0;
            return;
        }
        const m = hoveredShape.matrix2Page();
        const frame = hoveredShape.frame;
        // p1 p2
        // p4 p3
        const points = [
            { x: 0, y: 0 },
            { x: frame.width, y: 0 },
            { x: frame.width, y: frame.height },
            { x: 0, y: frame.height }
        ];
        tracing.value = points.map(p => {
            let _s = m.computeCoord(p.x, p.y);
            let _p = matrix.computeCoord(_s.x, _s.y);
            p.x = _p.x; p.y = _p.y;
            return p;
        });
        const [p0, p1, p2, p3] = tracing.value;
        tracingStyle = createRect(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        const path = hoveredShape.getPath(true);
        const m2page = hoveredShape.matrix2Page();
        path.transform(m2page);
        path.transform(matrix);
        const bounds = path.bounds;
        const { minX, maxX, minY, maxY } = bounds;
        tracingX = minX;
        tracingY = minY;
        tracingWidth = maxX - minX;
        tracingHeight = maxY - minY;
        tracingViewBox = `${minX} ${minY} ${tracingWidth} ${tracingHeight}`;
        tracingPath = path.toString();
    }
}
// hooks
onMounted(() => {
    props.context.selection.watch(updater);
})

onUnmounted(() => {
    props.context.selection.unwatch(updater);
    shapes.length = 0;
})
watchEffect(updater)
</script>

<template>
    <!-- 描边 -->
    <svg v-if="tracing.length" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingWidth" :height="tracingHeight" :viewBox="tracingViewBox"
        :style="`transform: translate(${tracingX}px, ${tracingY}px)`" :reflush="reflush !== 0 ? reflush : undefined">
        <path :d="tracingPath" style="fill: transparent; stroke: #2561D9; stroke-width: 1.5;"></path>
    </svg>
    <!-- 控制 -->
    <component v-if="context.selection.selectedShapes.length > 0" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :is-controller="props.isController" :rotate="rotate">
    </component>
</template>