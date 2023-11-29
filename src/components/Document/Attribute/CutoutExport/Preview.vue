<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import comsMap from '@/components/Document/Content/comsmap';
import { Matrix, Shape, ShapeType } from '@kcdesign/data';
import { Context } from '@/context';
import { getCutoutShape, getShadowMax } from '@/utils/cutout';
import { color2string } from '@/utils/content';
import { Selection } from '@/context/selection';
interface Props {
    context: Context
    shapes: Shape[]
    unfold: boolean
}
const DEFAULT_COLOR = () => {
    const f = props.context.selection.selectedPage!.style.fills[0];
    if (f) {
        return color2string(f.color);
    } else {
        return 'rgba(239,239,239,1)';
    }
}
const props = defineProps<Props>();
const reflush = ref(0);
const isTriangle = ref(props.unfold);
const width = ref<number>(0);
const height = ref<number>(0);
const xy = ref<{ x: number, y: number }>({ x: 0, y: 0 });
const background_color = ref<string>(DEFAULT_COLOR());
let renderItems: Shape[] = [];
const selectedShapes: Map<string, Shape> = new Map();
const matrix = reactive<Matrix>(new Matrix());
const toggleExpand = () => {
    isTriangle.value = !isTriangle.value;
    if (isTriangle.value) getCanvasShape();
}

const getCanvasShape = () => {
    if (!isTriangle.value) return;
    const shapes = props.context.selection.selectedShapes;
    const shape = shapes[0];
    if (!shapes.length) return;
    resetSvg();
    if (shapes.length === 1 && shape.type === ShapeType.Cutout) {
        selectedShapes.clear();
        getCutoutShape(shape, props.context.selection.selectedPage!, selectedShapes);
        getPosition(shape);
        renderItems = Array.from(selectedShapes.values());
        reflush.value++;
    } else {
        getPosition(shape);
        renderItems = [shape];
    }
}

const getPosition = (shape: Shape) => {
    width.value = shape.frame.width;
    height.value = shape.frame.height;
    xy.value.x = shape.frame.x;
    xy.value.y = shape.frame.y;
    if (shape.type !== ShapeType.Cutout) {
        const { left, top, right, bottom } = getShadowMax(shape);
        xy.value.x -= right;
        xy.value.y -= top;
        width.value += right + left;
        height.value += top + bottom;
    }
    const svg_center = { x: width.value / 2, y: height.value / 2 };
    const canvas_center = { x: 236 / 2, y: 240 / 2 };
    matrix.reset();
    const center_delta = {
        x: svg_center.x - canvas_center.x,
        y: svg_center.y - canvas_center.y,
    }
    const ratio = Math.max(width.value / 236 * 1.06, height.value / 240 * 1.03);
    matrix.trans(-center_delta.x, -center_delta.y);
    matrix.trans(-236 / 2, -240 / 2);
    matrix.scale(1 / ratio);
    matrix.trans(236 / 2, 240 / 2);
}

const resetSvg = () => {
    renderItems = [];
    width.value = 0;
    height.value = 0;
    xy.value.x = 0;
    xy.value.y = 0;
    reflush.value++;
}
function page_color() {
    background_color.value = DEFAULT_COLOR();
    const selected = props.context.selection.selectedShapes;
    if (!selected.length) {
        return;
    }
    if (selected[0].type !== ShapeType.Cutout) {
        background_color.value = 'transparent';
        return;
    }
}

const select_watcher = (t: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        page_color();
        getCanvasShape();
    }
}

onMounted(() => {
    page_color();
    getCanvasShape();
    props.context.selection.watch(select_watcher);
})
onUnmounted(() => {
    props.context.selection.watch(select_watcher);
})

</script>

<template>
    <div class="preview_box">
        <div class="title" @click="toggleExpand">
            <div class="triangle">
                <div :class="{ 'triangle-right': !isTriangle, 'triangle-down': isTriangle }">
                </div>
            </div>
            <span>预览</span>
        </div>
        <div class="preview-canvas" v-if="isTriangle" :reflush="reflush !== 0 ? reflush : undefined">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :width="width"
                :height="height" :viewBox="`${xy.x} ${xy.y} ${width} ${height}`"
                :style="{ transform: matrix.toString(), 'background-color': background_color }">
                <component :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)" v-for="c in renderItems"
                    :key="c.id" :data="c" />
            </svg>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview_box {
    .title {
        display: flex;
        height: 30px;
        width: 100%;
        align-items: center;

        >.triangle {
            width: 12px;
            min-width: 12px;
            height: 100%;
            display: flex;
            justify-content: center;
            margin-right: 5px;

            >.triangle-right {
                width: 0;
                height: 0;
                border-left: 6px solid gray;
                border-top: 3.5px solid transparent;
                border-bottom: 3.5px solid transparent;
                position: relative;
                left: 2px;
                top: 13px;
            }

            >.triangle-down {
                width: 0;
                height: 0;
                border-top: 6px solid gray;
                border-left: 3.5px solid transparent;
                border-right: 3.5px solid transparent;
                position: relative;
                left: 1px;
                top: 14px;
            }
        }

        span {
            color: rgba(0, 0, 0, 0.5);
        }
    }

    .preview-canvas {
        position: relative;
        width: 100%;
        height: 240px;
        background: #fafafa;
        background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0), linear-gradient(45deg, rgba(0, 0, 0, 0.04) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.04) 0);
        background-position: 0 0, 8px 8px;
        background-size: 16px 16px;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.04);
        box-sizing: border-box;

        >svg {
            position: absolute;
            transform-origin: left top;
        }
    }
}
</style>