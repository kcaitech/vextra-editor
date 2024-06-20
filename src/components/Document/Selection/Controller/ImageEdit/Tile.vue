<script setup lang="ts">
import { Context } from '@/context';
import { ColorCtx } from '@/context/color';
import { ClientXY } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { ColorHandler } from '@/transform/color';
import { ColorPicker, Matrix, ShapeView } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';

interface Props {
    context: Context
    matrix: Matrix
}

enum Direction {
    X,
    Y,
    Angle
}

const props = defineProps<Props>();
const image_width = ref(0);
const image_height = ref(0);
const matrix = reactive(new Matrix());
const transform = ref('');
let colorEditor: ColorPicker | undefined;
let startPosition: ClientXY = { x: 0, y: 0 };
const cur_shape = ref<ShapeView>();

let isDragging = false;
const dragActiveDis = 3;
const update_frame = () => {
    const locat = props.context.color.locat;
    if (!locat) return;
    const frame = props.context.color.imageOriginFrame;
    if (frame) {
        const shapes = props.context.selection.selectedShapes;
        if (!shapes.length) return;
        const shape = shapes[0];
        const scale = props.context.color.imageScale;
        image_width.value = frame.width * (scale || 0.5);
        image_height.value = frame.height * (scale || 0.5);
        const fill = shape.style.getFills()[locat.index];
        if (!fill) return;
        if (fill.rotation === 90 || fill.rotation === 270) {
            image_width.value = frame.height * (scale || 0.5);
            image_height.value = frame.width * (scale || 0.5);
        }
    }
}

const update_position = () => {
    update_frame();
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const shape = shapes[0];
    const m = shape.matrix2Root();
    m.multiAtLeft(matrix as Matrix);
    const trans = m.computeCoord2(0, 0);
    image_width.value *= matrix.m00;
    image_height.value *= matrix.m00;
    let rotate = shape.rotation || 0;
    let flippedX = shape.isFlippedVertical ? 180 : 0;
    transform.value = `translate(${trans.x}px, ${trans.y}px) rotateX(${flippedX}deg) rotateY(${shape.isFlippedHorizontal ? 180 : 0}deg) rotate(${rotate}deg)`
}
let direction = Direction.X;
const onMouseDown = (e: MouseEvent, d: Direction) => {
    e.stopPropagation();
    direction = d;
    const page = props.context.selection.selectedPage;
    if (colorEditor || !page) return;
    colorEditor = new ColorPicker(props.context.coopRepo, props.context.data, page);
    startPosition = props.context.workspace.getContentXY(e);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

const onMouseMove = (e: MouseEvent) => {
    e.stopPropagation();
    const workspace = props.context.workspace;
    const { x: sx, y: sy } = startPosition;
    const { x: mx, y: my } = workspace.getContentXY(e)
    if (isDragging) {
        if (!colorEditor) {
            return;
        }
        const locat = props.context.color.locat;
        if (!locat) return;
        setImageScale(e, locat.index, direction);
    } else if (Math.hypot(mx - sx, my - sy) > dragActiveDis) {
        isDragging = true;
    }
}

const setImageScale = (e: MouseEvent, index: number, direction: Direction) => {
    const locat = props.context.color.locat;
    if (!locat) return;

    const { x, y } = props.context.workspace.getContentXY(e);
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    const shape = shapes[0];
    const image_frame = props.context.color.imageOriginFrame;
    if (!image_frame) return;
    const fill = shape.style.getFills()[locat.index];
    if (!fill) return;
    const matrix = new Matrix();
    if (fill.rotation === 90 || fill.rotation === 270) {
        matrix.preScale(image_frame.height, image_frame.width);
    } else {
        matrix.preScale(image_frame.width, image_frame.height);
    }
    matrix.multiAtLeft(shape.matrix2Root()); // 图形转页面矩阵
    matrix.multiAtLeft(props.context.workspace.matrix); // 页面转视图
    const m = new Matrix(matrix.inverse); // 视图转图形
    const trans = m.computeCoord(x, y);
    let scale = trans.x;
    if (direction === Direction.X) {
        scale = trans.x;
    } else if (direction === Direction.Y) {
        scale = trans.y;
    } else {
        scale = Math.max(trans.x, trans.y);
    }
    if (scale === 0) return;
    colorEditor?.executeImageScale(shapes, Math.abs(scale), index);
    props.context.color.setImageScale(Math.abs(scale));
}

const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    isDragging = false;
    colorEditor?.commit();
    colorEditor = undefined;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

const colorWatcher = (t: number) => {
    if (t === ColorCtx.IMAGE_ORIGIN_CHANGE) {
        update_frame();
    }
}
const watcher = () => {
    matrix.reset(props.matrix);
    update_position();
}

const workspace_watcher = (t: number) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        watcher();
    }
}
const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes;
    if (selection) {
        selection.forEach((v) => {
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

const editImage = (edit: boolean) => {
    const locat = props.context.color.locat;
    if (!locat) return;
    const shape = cur_shape.value!;
    const page = props.context.selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesFillEdit(shape, locat.index, edit);
    }
}
const selectShape = () => {
    cur_shape.value = props.context.selection.selectedShapes[0];
}
onMounted(() => {
    watcher();
    update_frame();
    watchShapes();
    nextTick(() => {
        update_position();
    })
    selectShape();
    editImage(true);
    props.context.workspace.watch(workspace_watcher);
    props.context.color.watch(colorWatcher);
})
onUnmounted(() => {
    editImage(false);
    props.context.workspace.unwatch(workspace_watcher);
    props.context.color.unwatch(colorWatcher);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="transform: translate(0px, 0px); position: absolute;">
        <g :style="{ transform: transform }">
            <rect x="0" y="0" :width="image_width" :height="image_height" fill="rgba(0,0,0,0.35)"></rect>
            <g v-if="Math.max(image_width, image_height) > 20">
                <!-- 左上 -->
                <path :d="`M 16 2.5 L 2.5 2.5 L 2.5 16`" stroke="#1878f5" stroke-width="5" fill="none"></path>
                <!-- 中上 -->
                <path :d="`M ${(image_width / 2) - 8} 2.5 L ${(image_width / 2) + 8} 2.5`" stroke="#1878f5"
                    stroke-width="5" fill="none"></path>
                <!-- 右上 -->
                <path :d="`M ${image_width - 16} 2.5 L ${image_width - 2.5} 2.5 L ${image_width - 2.5} 16`"
                    stroke="#1878f5" stroke-width="5" fill="none"></path>
                <!-- 中左 -->
                <path :d="`M 2.5 ${(image_height / 2) - 8} L 2.5 ${(image_height / 2) + 8}`" stroke="#1878f5"
                    stroke-width="5" fill="none"></path>
                <!-- 中右 -->
                <path
                    :d="`M ${image_width - 2.5} ${(image_height / 2) - 8} L ${image_width - 2.5} ${(image_height / 2) + 8}`"
                    stroke="#1878f5" stroke-width="5" fill="none"></path>
                <!-- 左下 -->
                <path :d="`M 2.5 ${image_height - 16} L 2.5 ${image_height - 2.5} L 16 ${image_height - 2.5}`"
                    stroke="#1878f5" stroke-width="5" fill="none"></path>
                <!-- 中下 -->
                <path
                    :d="`M ${(image_width / 2) - 8} ${image_height - 2.5} L ${(image_width / 2) + 8} ${image_height - 2.5}`"
                    stroke="#1878f5" stroke-width="5" fill="none"></path>
                <!-- 右下 -->
                <path
                    :d="`M ${image_width - 2.5} ${image_height - 16} L ${image_width - 2.5} ${image_height - 2.5} L ${image_width - 16} ${image_height - 2.5}`"
                    stroke="#1878f5" stroke-width="5" fill="none"></path>
            </g>
            <g v-else>
                <rect x="2.5" y="2.5" :width="Math.max(image_width - 5, 1)" :height="Math.max(image_height - 5, 1)"
                    fill="transparent" stroke="#1878f5" stroke-width="5"></rect>
            </g>
            <!-- 中下 -->
            <rect :x="0" :y="image_height - 6" :width="Math.abs(image_width - 16)" :height="12" fill="transparent"
                @mousedown="(e) => onMouseDown(e, Direction.Y)"></rect>
            <!-- 中右 -->
            <rect :x="image_width - 6" y="0" :width="12" :height="Math.abs(image_height - 16)" fill="transparent"
                @mousedown="(e) => onMouseDown(e, Direction.X)"></rect>
            <!-- 右下 -->
            <rect :x="image_width - 16" :y="image_height - 16" width="22" height="22" fill="transparent"
                @mousedown="(e) => onMouseDown(e, Direction.Angle)"></rect>
        </g>
    </svg>
</template>

<style scoped lang="scss"></style>