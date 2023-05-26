<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import { Shape, ShapeType, Matrix } from "@kcdesign/data";
import { ControllerType, ctrlMap } from "./Controller/map";
import { CtrlElementType, Action } from "@/context/workspace";
import { getHorizontalAngle, createHorizontalBox } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";
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
}>();

const controllerType = ref<ControllerType>(ControllerType.Rect);
const matrix = new Matrix();
const controllerFrame = ref<Point[]>([]);
const tracing = ref<boolean>(false);
const controller = ref<boolean>(false);
const rotate = ref<number>(0);
let tracingPath: string;
let tracingViewBox: string;
let tracingHeight: number;
let tracingWidth: number;
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
function updater() { // 自动更新、可控更新
    const shouldSelectionViewUpdate = props.context.workspace.shouldSelectionViewUpdate;
    if (!shouldSelectionViewUpdate) return;
    watchShapes();
    matrix.reset(props.matrix);
    createController();
    createShapeTracing();
}
function handleWorkSpaceUpdate(t?: any) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        matrix.reset(props.matrix);
        watchShapes();
        createController();
        createShapeTracing();
    }
}
function createController() { // 计算点位以及控件类型判定
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (selection.length === 0) {
        controller.value = false;
    } else {
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
            if (selection[0].type === ShapeType.Line) {
                controllerType.value = ControllerType.Line;
                rotate.value = getHorizontalAngle(points[0], points[1]);
            } else if (selection[0].type === ShapeType.Text) {
                controllerType.value = ControllerType.Text;
                rotate.value = getHorizontalAngle(points[0], points[2]); // 线条的水平夹角与其他图形有区别
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
                    let _s = m.computeCoord(p[0], p[1]);
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
            });
            rotate.value = 0; // 多选时，rect只为水平状态
            controllerType.value = ControllerType.Rect; // 且控件类型都为矩形控件
        }
        controller.value = true;
    }
}
function createShapeTracing() { // 描边    
    tracing.value = false;
    const hoveredShape: Shape | undefined = props.context.selection.hoveredShape;
    if (hoveredShape) {
        const selected = props.context.selection.selectedShapes;
        if (selected.includes(hoveredShape)) {
            tracing.value = false;
            return;
        }
        tracing.value = true;
        const path = hoveredShape.getPath(true);
        const m2page = hoveredShape.matrix2Page();
        path.transform(m2page);
        path.transform(matrix);
        const { x, y, right, bottom } = props.context.workspace.root;
        tracingWidth = right - x;
        tracingHeight = bottom - y;
        tracingViewBox = `${0} ${0} ${tracingWidth} ${tracingHeight}`;
        tracingPath = path.toString();
    }
}
function pathMousedown(e: MouseEvent) {
    if (props.context.workspace.action == Action.AutoV) {
        if (e.button == 0) {
            e.stopPropagation();
            props.context.workspace.preToTranslating(e);
            const hoveredShape = props.context.selection.hoveredShape;
            if (e.shiftKey) {
                if (hoveredShape) {
                    const selected = props.context.selection.selectedShapes;
                    props.context.selection.rangeSelectShape([...selected, hoveredShape])
                }
            } else {
                props.context.selection.selectShape(hoveredShape);
            }

        }
    }
}
// hooks
onMounted(() => {
    props.context.selection.watch(updater);
    props.context.workspace.watch(handleWorkSpaceUpdate);
})
onUnmounted(() => {
    props.context.selection.unwatch(updater);
    props.context.workspace.unwatch(handleWorkSpaceUpdate);
})
watchEffect(updater);
</script>
<template>
    <!-- 描边 -->
    <svg v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingWidth" :height="tracingHeight" :viewBox="tracingViewBox"
        @mousedown="(e: MouseEvent) => pathMousedown(e)" style="transform: translate(0px, 0px)"
        :reflush="reflush !== 0 ? reflush : undefined">
        <path :d="tracingPath" style="fill: transparent; stroke: #2561D9; stroke-width: 1.5;">
        </path>
    </svg>
    <!-- 控制 -->
    <component v-if="controller" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :rotate="rotate" :matrix="props.matrix"
        :shape="context.selection.selectedShapes[0]">
    </component>
</template>