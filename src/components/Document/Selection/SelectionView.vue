<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";
import { Shape } from "@kcdesign/data/data/shape";
import ControlPoint from "./ControlPoint.vue"
import { ShapeEditor } from "@kcdesign/data/editor/shape";
import { CtrlElementType } from "@/context/workspace";
type Side = 'top' | 'right' | 'bottom' | 'left';
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
    updater();
}

const props = defineProps<{
    context: Context,
    matrix: number[],
}>();
interface ShapeSelectData {
    width: number,
    height: number,
    x: number,
    y: number,
    radius: number[],
    id: string,
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
let editor: ShapeEditor;
const shapes: Array<Shape> = [];
// [side, x, y, width, height, cursor type][];
const controllerBars: [Side, number, number, number, number, string][] = [
    ['top', 0, 0, 0, 0, 'ns-resize'],
    ['right', 0, 0, 0, 0, 'ew-resize'],
    ['bottom', 0, 0, 0, 0, 'ns-resize'],
    ['left', 0, 0, 0, 0, 'ew-resize']
];
// [point, x, y, cursor type][]
const controllerPoints: [string, number, number, string][] = [
    [CtrlElementType.RectLT, 0, 0, 'nwse-resize'],
    [CtrlElementType.RectRT, 0, 0, 'nesw-resize'],
    [CtrlElementType.RectRB, 0, 0, 'nwse-resize'],
    [CtrlElementType.RectLB, 0, 0, 'nesw-resize']
];

const matrix = new Matrix();
const borderWidth = 2;
const halfBorderWidth = borderWidth / 2;
let startPosition = { x: 0, y: 0 };

function updateShape(shapeData: ShapeSelectData | undefined, shape: Shape): ShapeSelectData {
    const data = shapeData ? shapeData : {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        radius: [5, 5, 5, 5],
        id: "",
    };
    data.id = shape.id;

    const frame = shape.frame;
    const width = frame.width;
    const height = frame.height;
    const rXY = shape.realXY();
    let x = rXY.x;
    let y = rXY.y;

    const xy0 = matrix.computeCoord(x, y);
    const xy1 = matrix.computeCoord(x + width, y + height);

    data.x = xy0.x - halfBorderWidth;
    data.y = xy0.y - halfBorderWidth;
    data.width = xy1.x - xy0.x - borderWidth;
    data.height = xy1.y - xy0.y - borderWidth;

    return data;
}

function updater() {

    matrix.reset(props.matrix);
    const selection = props.context.selection;
    data.isHover = selection.hoveredShape != undefined;
    data.isSelect = !data.isHover && selection.selectedShapes.length > 0;
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
        setPoint(data.shapes[0]);
    }
}
function setPoint(s: ShapeSelectData) {
    controllerPoints[0] = [CtrlElementType.RectLT, s.x, s.y, 'nwse-resize'];
    controllerPoints[1] = [CtrlElementType.RectRT, s.x + s.width, s.y, 'nesw-resize'];
    controllerPoints[2] = [CtrlElementType.RectRB, s.x + s.width, s.y + s.height, 'nwse-resize'];
    controllerPoints[3] = [CtrlElementType.RectLB, s.x, s.y + s.height, 'nesw-resize'];
    const offset = 13;
    controllerPoints.forEach(point => { point[1] -= offset; point[2] -= offset; });
}
function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    startPosition = { x: e.clientX, y: e.clientY };
    editor = props.context.editor4Shape(shapes[0]);
}
function mousemove(e: MouseEvent) {
    if (!editor) return
    editor.translate(e.clientX - startPosition.x, e.clientY - startPosition.y);
    startPosition = { x: e.clientX, y: e.clientY };
}
function mouseup() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
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
    <div v-if="data.isSelect">
        <ControlPoint v-for="(point, index) in controllerPoints" :point="point" :key="index" :shape="shapes[0]"
            :context="props.context">
        </ControlPoint>
    </div>
    <div @mousedown="mousedown" v-for="s in data.shapes" :class="{ selectrect: data.isSelect, hoverrect: data.isHover }"
        :style="{
            left: '' + s.x + 'px',
            top: '' + s.y + 'px',
            width: '' + s.width + 'px',
            height: '' + s.height + 'px',
            borderWidth: '' + borderWidth + 'px'
        }" :key="s.id" :reflush="reflush">
    </div>
</template>

<style scoped lang="scss">
.selectrect {
    border-radius: 0px;
    border-style: solid;
    border-color: var(--active-color);
    position: absolute;
}

.hoverrect {
    background-color: none;
    border-radius: 0px;
    border-style: solid;
    border-color: var(--active-color);
    position: absolute;
}
</style>