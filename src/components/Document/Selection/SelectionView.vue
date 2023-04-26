<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Shape, ShapeType } from "@kcdesign/data/data/shape";
import { ControllerType, ctrlMap } from "./CtrlRect";
import { CtrlElementType } from "@/context/workspace";
import { getHorizontalAngle, createRect, createHorizontalBox } from "@/utils/common";
import { XY } from "@/context/selection";
export interface Point {
    x: number,
    y: number,
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
        rotate.value = getHorizontalAngle(points[0], points[1]);
        if (selection[0].type === ShapeType.Line) {
            controllerType.value = ControllerType.Line;
            // controllerType.value = ControllerType.Rect;
        } else {
            controllerType.value = ControllerType.Rect;
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
        // todo
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
            let _s = m.computeCoord(p.x, p.y)
            let _p = matrix.computeCoord(_s.x, _s.y);
            p.x = _p.x; p.y = _p.y;
            return p;
        });
        tracingStyle = createRect(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        tracingPath = hoveredShape.getPath(true).toString();
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
        :style="tracingStyle" :reflush="reflush !== 0 ? reflush : undefined">
        <path :d="tracingPath" style="fill: transparent; stroke: #e4bf7a; stroke-width: 2;"></path>
    </svg>
    <!-- 控制 -->
    <component v-if="data.isSelect" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :is-controller="props.isController" :rotate="rotate">
    </component>
</template>