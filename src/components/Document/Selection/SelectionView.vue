<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";
import { Shape } from "@kcdesign/data/data/shape";
import ControlPoint from "./ControlPoint.vue"
import { CtrlElementType } from "@/context/workspace";
import { AbsolutePosition } from "@/context/selection";
import { translate } from "@kcdesign/data/editor/frame";
const reflush = ref(0);
const watcher = () => { reflush.value++; }
const props = defineProps<{
    context: Context,
    matrix: number[],
    isController: boolean
}>();
interface ShapeSelectData {
    width: number,
    height: number,
    x: number,
    y: number,
    radius: number[],
    id: string,
    rotate: number
}
interface ControlRect {
    width: number,
    height: number,
    x: number,
    y: number,
    rotate: number,
    visible: boolean
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
// let editor: ShapeEditor;
const shapes: Array<Shape> = [];
// [side type, x, y, width, height, cursor type][];
const controllerBars: [CtrlElementType, number, number, number, number, string][] = [
    [CtrlElementType.RectT, 0, 0, 0, 0, 'ns-resize'],
    [CtrlElementType.RectR, 0, 0, 0, 0, 'ew-resize'],
    [CtrlElementType.RectB, 0, 0, 0, 0, 'ns-resize'],
    [CtrlElementType.RectL, 0, 0, 0, 0, 'ew-resize']
];
// [point type, x, y, cursor type][]
const controllerPoints: [CtrlElementType, number, number, string][] = [
    [CtrlElementType.RectLT, 0, 0, 'nwse-resize'],
    [CtrlElementType.RectRT, 0, 0, 'nesw-resize'],
    [CtrlElementType.RectRB, 0, 0, 'nwse-resize'],
    [CtrlElementType.RectLB, 0, 0, 'nesw-resize']
];

const matrix = new Matrix();
const borderWidth = 2;
const halfBorderWidth = borderWidth / 2;
let startPosition = { x: 0, y: 0 };
let isDragging = false;
const dragActiveDis = 3;
const controlRect: ControlRect = reactive({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    rotate: 0,
    visible: false
});

function updateShape(shapeData: ShapeSelectData | undefined, shape: Shape): ShapeSelectData {
    const data = shapeData ? shapeData : {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        radius: [5, 5, 5, 5],
        id: "",
        rotate: 0
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
    data.rotate = shape.rotation || 0;
    return data;
}

function updater() {

    matrix.reset(props.matrix);
    const selection = props.context.selection;
    data.isHover = selection.hoveredShape != undefined;
    // data.isSelect = !data.isHover && selection.selectedShapes.length > 0;
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
        genControlRect(data.shapes);
        genPoint();
        
    }
}
function genPoint() {
    controllerPoints[0] = [CtrlElementType.RectLT, 0, 0, 'nwse-resize'];
    controllerPoints[1] = [CtrlElementType.RectRT, controlRect.width, 0, 'nesw-resize'];
    controllerPoints[2] = [CtrlElementType.RectRB, controlRect.width, controlRect.height, 'nwse-resize'];
    controllerPoints[3] = [CtrlElementType.RectLB, 0, controlRect.height, 'nesw-resize'];
    const offset = 13;
    controllerPoints.forEach(point => { point[1] -= offset; point[2] -= offset; });
}
function genControlRect(shapes: ShapeSelectData[]) {
    const s = shapes[0];
    controlRect.x = s.x;
    controlRect.y = s.y;
    controlRect.width = s.width;
    controlRect.height = s.height;
    controlRect.rotate = s.rotate;
    if (shapes.length > 1) {
        for (let i = 1; i < shapes.length; i++) {
            const si = shapes[i];
            if (si.x < controlRect.x) controlRect.x = si.x;
            if (si.y < controlRect.y) controlRect.y = si.y;
            if (si.x + si.width > controlRect.width) controlRect.width = si.x + si.width;
            if (si.y + si.height > controlRect.height) controlRect.height = si.y + si.height;
        }
        controlRect.rotate = 0;
    }
}
function mousedown(e: MouseEvent) {    
    props.context.editor4Shape(shapes[0]);
    if (!props.isController || !props.context.repo) return;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    startPosition = { x: e.clientX, y: e.clientY };
    props.context.repo.start('transform', {});
}
function mousemove(e: MouseEvent) {    
    const delta: AbsolutePosition = { x: e.clientX - startPosition.x, y: e.clientY - startPosition.y };
    if (isDragging) {
        translate(shapes[0], delta.x, delta.y);
        props.context.repo?.transactCtx.fireNotify();
        startPosition = { x: e.clientX, y: e.clientY };
    } else {
        if (Math.hypot(delta.x, delta.y) > dragActiveDis) isDragging = true;
    }
}
function mouseup() {
    if (isDragging) {
        props.context.repo?.commit({});
    } else {
        props.context.repo?.rollback();
    }
    isDragging = false;
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
    <div class="control-rect" @mousedown="mousedown" v-if="data.isSelect" :style="{
        left: '' + controlRect.x + 'px',
        top: '' + controlRect.y + 'px',
        width: '' + controlRect.width + 'px',
        height: '' + controlRect.height + 'px',
        borderWidth: '' + borderWidth + 'px',
        transform: `rotate(${controlRect.rotate}deg)`
    }">
        <ControlPoint v-for="(point, index) in controllerPoints" :point="point" :key="index" :shape="shapes[0]"
            :context="props.context">
        </ControlPoint>
    </div>
    <div v-for="s in data.shapes" :class="{ selectrect: data.isSelect, hoverrect: data.isHover }"
        :style="{
            left: '' + s.x + 'px',
            top: '' + s.y + 'px',
            width: '' + s.width + 'px',
            height: '' + s.height + 'px',
            borderWidth: '' + borderWidth + 'px',
            transform: `rotate(${s.rotate}deg)`
        }" :key="s.id" :reflush="reflush">
    </div>
</template>

<style scoped lang="scss">
.control-rect {
    border-radius: 0px;
    border-style: solid;
    border-color: var(--active-color);
    position: absolute;
    z-index: 1;
}

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