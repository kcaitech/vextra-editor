<script setup lang="ts">
import { Context } from '@/context';
import { Selection, SelectionTheme, XY } from '@/context/selection';
import { PointHandler } from '@/transform/point';
import { ArtboradView, ColVector3D, CurvePoint, Matrix, PaddingDir, PolygonShapeView, ShapeFrame, makeShapeTransform2By1 } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { fixedZero, XYsBounding } from '@/utils/common';
import { getTransformCol } from '@/utils/content';
import { WorkSpace } from '@/context/workspace';
import { AutoLayoutHandler } from '@/transform/autoLayout';
import { getRadiusValue } from '../Points/common';

type Box = {
    lt: Point,
    rt: Point,
    rb: Point,
    lb: Point
}

interface Props {
    context: Context
}

interface Point {
    x: number,
    y: number
}

interface ControlsLine extends Box {
    offset: Point,
    rotate: number,
}
interface PaddingBox {
    size: number,
    center: Point
}

const emits = defineEmits<{
    (e: 'hoverPaddint', index: number): void;
}>();

const props = defineProps<Props>();
const cursor_point = ref<Point>({ x: 0, y: 0 });
const cursor_down = ref(false);
const controls_line = ref<ControlsLine[]>([]);
const paddingBox = ref<PaddingBox[]>([]);
const matrix = reactive(new Matrix());
let paddingIndex = -1;
let autoLayoutModifyHandler: AutoLayoutHandler | undefined = undefined;

function update() {
    update_padding_position();
}

const update_padding_position = () => {
    getPaddingPosition();
}

function getPaddingPosition() {
    controls_line.value = [];
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length || shapes.length > 1) return;
    const shape = shapes[0] as ArtboradView;
    const { x, y, width, height } = shape.frame;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = shape.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    const topPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
    ]);
    const leftPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x, y + height)
    ]);
    const hor_rotate = Math.atan2(topPadding.col1.y - topPadding.col0.y, topPadding.col1.x - topPadding.col0.x) * (180 / Math.PI);
    const ver_rotate = Math.atan2(leftPadding.col1.y - leftPadding.col0.y, leftPadding.col1.x - leftPadding.col0.x) * (180 / Math.PI) + 90;
    const bottomLine = m.transform([ColVector3D.FromXY(x + (width / 2), y + height - (autoLayout.stackPaddingBottom / 2)), ColVector3D.FromXY(x + (width / 2), y)]);
    const leftLine = m.transform([ColVector3D.FromXY(x + (autoLayout.stackHorizontalPadding / 2), y + (height / 2)), ColVector3D.FromXY(x, y + (height / 2))]);
    const rightLine = m.transform([ColVector3D.FromXY(x + width - (autoLayout.stackPaddingRight / 2), y + (height / 2)), ColVector3D.FromXY(x + width, y + (height / 2))]);
    const topLine = m.transform([ColVector3D.FromXY(x + (width / 2), y + (autoLayout.stackVerticalPadding / 2)), ColVector3D.FromXY(x + (width / 2), y)]);
    const t_ling: ControlsLine = { lt: { x: topLine.col0.x - 7, y: topLine.col0.y - 1.5 }, rt: { x: topLine.col0.x + 7, y: topLine.col0.y - 1.5 }, rb: { x: topLine.col0.x + 7, y: topLine.col0.y + 1.5 }, lb: { x: topLine.col0.x - 7, y: topLine.col0.y + 1.5 }, offset: topLine.col0, rotate: hor_rotate }
    const r_ling: ControlsLine = { lt: { x: rightLine.col0.x + 1.5, y: rightLine.col0.y - 7 }, rt: { x: rightLine.col0.x + 1.5, y: rightLine.col0.y + 7 }, rb: { x: rightLine.col0.x - 1.5, y: rightLine.col0.y + 7 }, lb: { x: rightLine.col0.x - 1.5, y: rightLine.col0.y - 7 }, offset: rightLine.col0, rotate: ver_rotate }
    const b_ling: ControlsLine = { lt: { x: bottomLine.col0.x - 7, y: bottomLine.col0.y - 1.5 }, rt: { x: bottomLine.col0.x + 7, y: bottomLine.col0.y - 1.5 }, rb: { x: bottomLine.col0.x + 7, y: bottomLine.col0.y + 1.5 }, lb: { x: bottomLine.col0.x - 7, y: bottomLine.col0.y + 1.5 }, offset: bottomLine.col0, rotate: hor_rotate }
    const l_ling: ControlsLine = { lt: { x: leftLine.col0.x + 1.5, y: leftLine.col0.y - 7 }, rt: { x: leftLine.col0.x + 1.5, y: leftLine.col0.y + 7 }, rb: { x: leftLine.col0.x - 1.5, y: leftLine.col0.y + 7 }, lb: { x: leftLine.col0.x - 1.5, y: leftLine.col0.y - 7 }, offset: leftLine.col0, rotate: ver_rotate }
    controls_line.value.push(t_ling, r_ling, b_ling, l_ling);
    const t_padding: PaddingBox = { size: autoLayout.stackVerticalPadding, center: topLine.col1 }
    const r_padding: PaddingBox = { size: autoLayout.stackPaddingRight, center: rightLine.col1 }
    const b_padding: PaddingBox = { size: autoLayout.stackPaddingBottom, center: bottomLine.col1 }
    const l_padding: PaddingBox = { size: autoLayout.stackHorizontalPadding, center: leftLine.col1 }
    paddingBox.value.push(t_padding, r_padding, b_padding, l_padding);
}

let downClientXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;
const mousedown = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    cursor_down.value = true;
    emits('hoverPaddint', paddingIndex);
    paddingIndex = index;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}
function mousemove(e: MouseEvent) {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    emits('hoverPaddint', paddingIndex);
    if (isDragging) {
        if (!autoLayoutModifyHandler) {
            return
        }
        if (!autoLayoutModifyHandler.asyncApiCaller) {
            autoLayoutModifyHandler.createApiCaller();
        }
        updatePadding(e);
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
        }
    }
}

const updatePadding = (e: MouseEvent) => {
    if (!autoLayoutModifyHandler) return;
    const shape = props.context.selection.selectedShapes[0];
    const { width, height } = shape.frame;
    if (paddingIndex === 2) {
        const start = paddingBox.value[paddingIndex].center;
        const end = getTransformCol(props.context, shape, width / 2, height / 2);
        const padding = getMoveLength(start, end, e, props.context) * (height / 2);
        if (padding === 0) return;
        autoLayoutModifyHandler.executePadding((height - padding / 2) * 2, 'bottom');
    } else {
        const start = paddingBox.value[paddingIndex].center;
        const end = getTransformCol(props.context, shape, width / 2, height / 2);
        const v = paddingIndex % 2 === 0 ? height / 2 : width / 2;
        const padding = getMoveLength(start, end, e, props.context) * v;
        if (padding === 0) return;
        let dir: PaddingDir = 'top';
        if (paddingIndex === 1) {
            dir = 'right';
        } else if (paddingIndex === 3) {
            dir = 'left';
        }
        autoLayoutModifyHandler.executePadding(padding, dir);
    }
}

function mouseup(e: MouseEvent) {
    e.stopPropagation();
    updatePadding(e);
    cursor_down.value = false;
    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
    isDragging = false;
    paddingIndex = -1;
    emits('hoverPaddint', -1);
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

const getMoveLength = (start: XY, end: XY, e: MouseEvent, context: Context) => {
    const point3 = context.workspace.getContentXY(e); //鼠标位置
    if (start.x === end.x) {
        // 如果线段是竖直的
        const intersectionY = point3.y;
        const lineLength = Math.abs(end.y - start.y); // 计算线段的长度（竖直线段的长度即为纵坐标的差的绝对值）
        const distanceFromStart = Math.abs(intersectionY - start.y); // 交点到起点的距离（竖直线段的距离即为交点纵坐标与起点纵坐标的差的绝对值）
        const distanceFromEnd = Math.abs(intersectionY - end.y); // 交点到终点的距离（竖直线段的距离即为交点纵坐标与终点纵坐标的差的绝对值）
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        const percent = distanceFromStart / (lineLength / 2);
        return percent;
    } else if (start.y === end.y) {
        // 如果线段是水平的
        const intersectionX = point3.x;
        const lineLength = Math.abs(end.x - start.x);
        const distanceFromStart = Math.abs(intersectionX - start.x);
        const distanceFromEnd = Math.abs(intersectionX - end.x);
        if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
            return 0;
        }
        const percent1 = distanceFromStart / (lineLength / 2);
        return percent1;
    }
    const slope = (end.y - start.y) / (end.x - start.x); // 起点和终点的斜率
    const intercept = start.y - slope * start.x; //起点和终点的截距
    const verSlope = -1 / slope; //起点和终点的垂线斜率
    const verIntercept = point3.y - verSlope * point3.x; //垂线截距
    const intersectionX = (verIntercept - intercept) / (slope - verSlope); //直线垂线的交点
    const intersectionY = slope * intersectionX + intercept;
    const lineLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const distanceFromStart = Math.sqrt(Math.pow(intersectionX - start.x, 2) + Math.pow(intersectionY - start.y, 2)); // 交点到起点的距离
    const distanceFromEnd = Math.sqrt(Math.pow(intersectionX - end.x, 2) + Math.pow(intersectionY - end.y, 2)); // 交点到终点的距离
    if ((distanceFromStart + distanceFromEnd) > lineLength && distanceFromStart < distanceFromEnd && distanceFromEnd > lineLength) {
        return 0;
    }
    const percent1 = distanceFromStart / (lineLength / 2); // 交点所在百分比位置
    return percent1;
}

const mouseenter = (e: MouseEvent, index: number) => {
    emits('hoverPaddint', index);
}

const mouseleave = (e: MouseEvent, index: number) => {
    emits('hoverPaddint', -1);
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
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(update);
        watchedShapes.set(k, v);
    })
}

const workspaceWatcher = (t: number | string) => {
    if (t === WorkSpace.MATRIX_TRANSFORMATION) {
        update();
    }
}
const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        update();
        watchShapes();
    }
}
onMounted(() => {
    update();
    watchShapes();
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
})
</script>

<template>
    <g v-if="controls_line.length">
        <g v-for="(box, index) in controls_line" :key="index">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mouseenter="(e) => mouseenter(e, index)" @mouseleave="(e) => mouseleave(e, index)"
                @mousedown="(e) => mousedown(e, index)"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
</template>

<style scoped lang="scss">
.padding-rect {
    fill: pink;
    opacity: 0.5;
}

.padding-line {
    fill: rgb(214, 118, 234);
    stroke-width: 1px;
    stroke: white;
}
</style>