<script setup lang="ts">
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Shape } from "@kcdesign/data/data/shape";
import { ControllerType, ctrlMap } from "./CtrlRect";
import { CtrlElementType } from "@/context/workspace";
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
    },
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
const borderWidth = 2;
const halfBorderWidth = borderWidth / 2;
const controllerFrame = ref<Point[]>([]);

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
        },
        isSelected: false
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
    data.isSelected = props.context.selection.isSelectedShape(shape)
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
        createController();
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
        createController(); // 根据已选图层生成控制器
    }
}
function createController() {
    const selection: Shape[] = props.context.selection.selectedShapes;
    if (!selection.length) return;
    const shape = selection[0];
    const m = shape.matrix2Root();
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
        let _s = m.computeCoord(p.x, p.y)
        let _p = matrix.computeCoord(_s.x, _s.y);
        p.x = _p.x; p.y = _p.y;
        return p;
    });
    // const points = [{ x: 0, y: 0 }, { x: 0, y: 0 }].map((p) => matrix.inverseCoord(p.x, p.y)).map((p) => m.inverseCoord(p.x, p.y));
    controllerType.value = ControllerType.Rect;
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
    <div v-for="s in data.shapes" :class="{ selectrect: data.isSelect, hoverrect: data.isHover }" :style="{
        left: '' + s.x + 'px',
        top: '' + s.y + 'px',
        width: '' + s.width + 'px',
        height: '' + s.height + 'px',
        borderWidth: `${s.isSelected ? 0 : borderWidth}px`,
        transform: `rotate(${s.rotate}deg)`
    }" :key="s.id" :reflush="reflush">
    </div>
    <component v-if="data.isSelect" :is="ctrlMap.get(controllerType) ?? ctrlMap.get(ControllerType.Rect)"
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