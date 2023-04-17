<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Shape } from "@kcdesign/data/data/shape";
import { AbsolutePosition } from "@/context/selection";
import { CtrlGroupType, ctrlMap } from "./CtrlRect";
export interface ControllerFrame {
    width: number,
    height: number,
    realWidth: number,
    realHeight: number,
    x: number,
    y: number,
    axle: AbsolutePosition,
    rotate: number,
    visible: boolean
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
    width: number,
    height: number,
    x: number,
    y: number,
    radius: number[],
    id: string,
    rotate: number,
    axle: {
        x: number,
        y: number
    }
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
const ctrlGroupType = ref<CtrlGroupType>(CtrlGroupType.Rect);
const matrix = new Matrix();
const borderWidth = 2;
const halfBorderWidth = borderWidth / 2;
const controllerFrame: ControllerFrame = reactive({
    width: 0,
    height: 0,
    realWidth: 0,
    realHeight: 0,
    x: 0,
    y: 0,
    rotate: 0,
    visible: false,
    axle: { x: 0, y: 0 }
});

function updateShape(shapeData: ShapeSelectData | undefined, shape: Shape): ShapeSelectData {
    const data = shapeData ? shapeData : {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        radius: [5, 5, 5, 5],
        id: "",
        rotate: 0,
        axle: {
            x: 0,
            y: 0
        }
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
    data.axle = {
        x: (xy0.x + xy1.x) / 2,
        y: (xy0.y + xy1.y) / 2
    }
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
        genControlRect();
    }
}
function genControlRect() {
    const selection: Shape[] = props.context.selection.selectedShapes;
    const xy0 = matrix.computeCoord(selection[0].realXY().x, selection[0].realXY().y);
    const xy1 = { x: 0, y: 0 };
    for (let i = 0; i < selection.length; i++) {
        const { width, height } = selection[i].frame;
        const realXY = selection[i].realXY();
        const cXY0 = matrix.computeCoord(realXY.x, realXY.y);
        const cXY1 = matrix.computeCoord(realXY.x + width, realXY.y + height);
        xy0.x = xy0.x > cXY0.x ? cXY0.x : xy0.x;
        xy0.y = xy0.y > cXY0.y ? cXY0.y : xy0.y;
        xy1.x = xy1.x < cXY1.x ? cXY1.x : xy1.x;
        xy1.y = xy1.y < cXY1.y ? cXY1.y : xy1.y;
    }
    controllerFrame.x = xy0.x;
    controllerFrame.y = xy0.y;
    controllerFrame.width = xy1.x - xy0.x;
    controllerFrame.height = xy1.y - xy0.y;
    controllerFrame.axle = matrix.inverseCoord((xy0.x + xy1.x) / 2, (xy0.y + xy1.y) / 2);
    controllerFrame.realWidth = matrix.inverseCoord(xy1.x, xy1.y).x - matrix.inverseCoord(xy0.x, xy0.y).x;
    controllerFrame.realHeight = matrix.inverseCoord(xy1.x, xy1.y).y - matrix.inverseCoord(xy0.x, xy0.y).y;
    if (selection.length === 1) {
        controllerFrame.rotate = selection[0].rotation || 0;
    } else {
        controllerFrame.rotate = 0;
    }
    ctrlGroupType.value = CtrlGroupType.Rect;
    if (selection.length === 1 && selection[0].typeId === 'line-shape') {
        ctrlGroupType.value = CtrlGroupType.Line;
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
    <!-- <div v-for="s in data.shapes" :class="{ selectrect: data.isSelect, hoverrect: data.isHover }" :style="{
        left: '' + s.x + 'px',
        top: '' + s.y + 'px',
        width: '' + s.width + 'px',
        height: '' + s.height + 'px',
        borderWidth: '' + borderWidth + 'px',
        transform: `rotate(${s.rotate}deg)`
    }" :key="s.id" :reflush="reflush">
    </div> -->
    <component v-if="data.isSelect" :is="ctrlMap.get(ctrlGroupType) ?? ctrlMap.get(CtrlGroupType.Rect)"
        :context="props.context" :controller-frame="controllerFrame" :is-controller="props.isController"></component>
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