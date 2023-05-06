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
interface ShapeSelectData {
    id: string,
    isSelected: boolean
}
const data = reactive<{
    isHover: boolean,
    isSelect: boolean,
    shapes: ShapeSelectData[],
}>({
    isHover: false,
    isSelect: false,
    shapes: []
});
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
function updateShape(shapeData: ShapeSelectData | undefined, shape: Shape): ShapeSelectData {
    const data = shapeData ? shapeData : {
        id: "",
        isSelected: false
    };
    data.id = shape.id;
    data.isSelected = props.context.selection.isSelectedShape(shape);
    return data;
}
function updater() {
    matrix.reset(props.matrix);
    const selection = props.context.selection;
    data.isHover = selection.hoveredShape != undefined;
    data.isSelect = selection.selectedShapes.length > 0;
    if (!data.isHover && !data.isSelect) {
        shapes.forEach((s) => {
            s.unwatch(watcher);
        })
        shapes.length = 0;
        data.shapes.length = 0;
    }
    else if (data.isHover) {
        data.shapes.length = 1;
        for (let i = 1, len = shapes.length; i < len; i++) {
            shapes[i].unwatch(watcher);
        }
        if (shapes.length > 0) {
            shapes.length = 1;
            if (shapes[0].id !== (selection.hoveredShape as Shape).id) {
                shapes[0].unwatch(watcher);
                shapes[0] = selection.hoveredShape as Shape;
                shapes[0].watch(watcher);
            }
        }
        else {
            shapes.length = 1;
            shapes[0] = selection.hoveredShape as Shape;
            shapes[0].watch(watcher);
        }
        data.shapes[0] = updateShape(data.shapes[0], selection.hoveredShape as Shape);
        createController(); // 根据已选图层生成控制器
    }
    else if (data.isSelect) {
        data.shapes.length = selection.selectedShapes.length;
        for (let i = 0, len = selection.selectedShapes.length; i < len; i++) {
            data.shapes[i] = updateShape(data.shapes[i], selection.selectedShapes[i]);
        }
        for (let i = data.shapes.length, len = shapes.length; i < len; i++) {
            shapes[i].unwatch(watcher);
        }
        shapes.length = data.shapes.length;
        for (let i = 0, len = shapes.length; i < len; i++) {
            if (!shapes[i]) {
                shapes[i] = selection.selectedShapes[i];
                shapes[i].watch(watcher);
            }
            else if (shapes[i].id != selection.selectedShapes[i].id) {
                shapes[i].unwatch(watcher);
                shapes[i] = selection.selectedShapes[i];
                shapes[i].watch(watcher);
            }
            else {
                // do nothing
            }
        }
        createController();
    }
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
        tracingViewBox = `0 0 ${tracingWidth} ${tracingHeight}`;
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
    <component v-if="data.isSelect" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :is-controller="props.isController" :rotate="rotate">
    </component>
</template>