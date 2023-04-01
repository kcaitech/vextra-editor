<script setup lang="ts">
import { defineProps, onBeforeUpdate, onMounted, onUnmounted, reactive, ref, computed } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";
import { Shape } from "@kcdesign/data/data/shape";
import ControlPoint from "./ControlPoint.vue"
type Side = 'top' | 'right' | 'bottom' | 'left';
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
const props = defineProps<{
    context: Context,
    matrix: number[],
    viewbox: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    width: number,
    height: number
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
const editor = computed(() => {
    return props.context.editor4Shape(props.context.selection.selectedShapes[0]);
})
const refresh = ref<number>(0);
const shapes: Array<Shape> = [];
const controllerBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
}
const top = ref<HTMLDivElement>();
const right = ref<HTMLDivElement>();
const bottom = ref<HTMLDivElement>();
const left = ref<HTMLDivElement>();
const currentTarget = ref<HTMLDivElement>();
let currentSide: Side | undefined;
const moveFrom = { x: 0, y: 0 };
// [side, x, y, width, height, cursor type][];
const controllerBars: [Side, number, number, number, number, string][] = [
    ['top', 0, 0, 0, 0, 'ns-resize'],
    ['right', 0, 0, 0, 0, 'ew-resize'],
    ['bottom', 0, 0, 0, 0, 'ns-resize'],
    ['left', 0, 0, 0, 0, 'ew-resize']
];
// [point, x, y, cursor type][]
const controllerPoints: [string, number, number, string][] = [
    ['lt', 0, 0, 'nwse-resize'],
    ['rt', 0, 0, 'nesw-resize'],
    ['rb', 0, 0, 'nwse-resize'],
    ['lb', 0, 0, 'nesw-resize']
];

const matrix = new Matrix();
const borderWidth = 2;
const halfBorderWidth = borderWidth / 2;

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

    // view box
    const scale = Math.min(props.width / props.viewbox.width, props.height / props.viewbox.height);
    x = x - props.viewbox.x;
    y = y - props.viewbox.y;

    const xy0 = matrix.computeCoord(x * scale, y * scale);
    const xy1 = matrix.computeCoord((x + width) * scale, (y + height) * scale);

    data.x = xy0.x - halfBorderWidth;
    data.y = xy0.y - halfBorderWidth;
    data.width = xy1.x - xy0.x - borderWidth;
    data.height = xy1.y - xy0.y - borderWidth;

    return data;
}

function updater(_: number) {

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

onBeforeUpdate(() => {
    updater(0);
})

</script>

<template>
    <ControlPoint></ControlPoint>
    <div v-for="s in data.shapes" :class="{ selectrect: data.isSelect, hoverrect: data.isHover }" :style="{
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