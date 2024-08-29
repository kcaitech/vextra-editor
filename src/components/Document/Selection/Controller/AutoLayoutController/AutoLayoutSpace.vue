<script setup lang="ts">
import { Context } from '@/context';
import { Selection, XY } from '@/context/selection';
import { ArtboradView, ColVector3D, Matrix, PaddingDir, ShapeView, StackSizing, layoutShapesOrder, makeShapeTransform2By1 } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { AutoLayoutHandler } from '@/transform/autoLayout';
import { getTransformCol } from '@/utils/content';

type Box = {
    lt: Point,
    rt: Point,
    rb: Point,
    lb: Point
}

interface Props {
    context: Context
    controllerFrame: Point[];
}

interface ControlsLine extends Box {
    offset: Point,
    rotate: number,
}

interface Point {
    x: number,
    y: number
}

const props = defineProps<Props>();
const verSpaceBox = ref<Box[]>([]);
const verSpaceLine = ref<ControlsLine[]>([]);
const horSpaceBox = ref<Box[]>([]);
const horSpaceLine = ref<ControlsLine[]>([]);
const matrix = reactive(new Matrix());
const verSpaceFill = ref(false);
const horSpaceFill = ref(false);
let autoLayoutModifyHandler: AutoLayoutHandler | undefined = undefined;
function update() {
    update_padding_position();
}

const update_padding_position = () => {
    getVerSpacePosition();
    getHorSpacePosition();
}

function getVerSpacePosition() {
    verSpaceBox.value = [];
    verSpaceLine.value = [];
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
    let verSpacing = autoLayout.stackCounterSpacing; //垂直间距
    let topPadding = autoLayout.stackVerticalPadding; //上边距
    let leftPadding = autoLayout.stackHorizontalPadding; //左边距
    const shape_rows = layoutShapesOrder(shape.childs);
    for (let i = 0; i < shape_rows.length - 1; i++) {
        const row = shape_rows[i];
        const max_height = Math.max(...row.map(shape => shape._p_frame.height));
        topPadding += max_height;
        if (autoLayout.stackVerticalGapSizing === StackSizing.Auto) {
            const cur_row_h = Math.max(...row.map(s => s._p_frame.y + s._p_frame.height));
            const next_min_x = Math.min(...shape_rows[i + 1].map(s => s._p_frame.y));
            verSpacing = next_min_x - cur_row_h;
        }
        const verSpace = m.transform([
            ColVector3D.FromXY(leftPadding, topPadding),
            ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, topPadding),
            ColVector3D.FromXY(x + width - autoLayout.stackPaddingRight, topPadding + verSpacing),
            ColVector3D.FromXY(leftPadding, topPadding + verSpacing)
        ]);
        const hor_rotate = Math.atan2(verSpace.col1.y - verSpace.col0.y, verSpace.col1.x - verSpace.col0.x) * (180 / Math.PI);
        const ver: Box = { lt: verSpace.col0, rt: verSpace.col1, rb: verSpace.col2, lb: verSpace.col3 };
        verSpaceBox.value.push(ver);
        const topLine = m.transform([ColVector3D.FromXY(x + (width / 2), topPadding + (verSpacing / 2))]);
        const ling: ControlsLine = { lt: { x: topLine.col0.x - 7, y: topLine.col0.y - 1.5 }, rt: { x: topLine.col0.x + 7, y: topLine.col0.y - 1.5 }, rb: { x: topLine.col0.x + 7, y: topLine.col0.y + 1.5 }, lb: { x: topLine.col0.x - 7, y: topLine.col0.y + 1.5 }, offset: topLine.col0, rotate: hor_rotate }
        verSpaceLine.value.push(ling);
        topPadding += verSpacing;
    }
}

function getHorSpacePosition() {
    horSpaceBox.value = [];
    horSpaceLine.value = [];
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length || shapes.length > 1) return;
    const shape = shapes[0] as ArtboradView;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = shape.matrix2Root();
    const m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix2);
    m.addTransform(clientTransform); //root到视图
    let topPadding = autoLayout.stackVerticalPadding; //上边距
    const shape_rows = layoutShapesOrder(shape.childs);
    let verSpacing = autoLayout.stackCounterSpacing; //垂直间距
    for (let i = 0; i < shape_rows.length; i++) {
        let leftPadding = autoLayout.stackHorizontalPadding; //左边距
        const shape_row = shape_rows[i];
        const maxHeightInRow = Math.max(...shape_row.map(s => s._p_frame.height));
        for (let j = 0; j < shape_row.length - 1; j++) {
            const shape = shape_row[j];
            const frame = shape._p_frame;
            const row_space = shape_row[j + 1]._p_frame.x - (frame.x + frame.width);
            leftPadding += frame.width;
            const horSpace = m.transform([
                ColVector3D.FromXY(leftPadding, topPadding),
                ColVector3D.FromXY(leftPadding + row_space, topPadding),
                ColVector3D.FromXY(leftPadding + row_space, topPadding + maxHeightInRow),
                ColVector3D.FromXY(leftPadding, topPadding + maxHeightInRow)
            ]);
            const hor: Box = { lt: horSpace.col0, rt: horSpace.col1, rb: horSpace.col2, lb: horSpace.col3 };
            horSpaceBox.value.push(hor);
            const ver_rotate = Math.atan2(horSpace.col3.y - horSpace.col0.y, horSpace.col3.x - horSpace.col0.x) * (180 / Math.PI);
            const spaceLine = m.transform([ColVector3D.FromXY(leftPadding + (row_space / 2), topPadding + (maxHeightInRow / 2))]);
            const ling: ControlsLine = { lt: { x: spaceLine.col0.x - 7, y: spaceLine.col0.y - 1.5 }, rt: { x: spaceLine.col0.x + 7, y: spaceLine.col0.y - 1.5 }, rb: { x: spaceLine.col0.x + 7, y: spaceLine.col0.y + 1.5 }, lb: { x: spaceLine.col0.x - 7, y: spaceLine.col0.y + 1.5 }, offset: spaceLine.col0, rotate: ver_rotate }
            horSpaceLine.value.push(ling);
            leftPadding += row_space;
        }
        if (autoLayout.stackVerticalGapSizing === StackSizing.Auto && (i !== shape_rows.length - 1)) {
            const cur_row_h = Math.max(...shape_row.map(s => s._p_frame.y + s._p_frame.height))
            const next_min_x = Math.min(...shape_rows[i + 1].map(s => s._p_frame.y));
            verSpacing = next_min_x - cur_row_h;
        }
        topPadding += maxHeightInRow + verSpacing;
    }
}

let downClientXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;
let downDir = '';
const down_point = ref<Point>({ x: 0, y: 0 });
const verMousedown = (e: MouseEvent, dir: PaddingDir) => {
    e.stopPropagation();
    const shape = props.context.selection.selectedShapes[0];
    const { height } = shape.frame;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    down_point.value = props.context.workspace.getContentXY(e);
    downDir = dir;
    const start = getTransformCol(props.context, shape, 0, 0);
    const end = getTransformCol(props.context, shape, 0, height);
    const p = getMoveLength(start, end, e, props.context) * height;
    down_point.value.y = p;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}



const horMousedown = (e: MouseEvent, dir: PaddingDir) => {
    e.stopPropagation();
    const shape = props.context.selection.selectedShapes[0];
    const { width } = shape.frame;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    down_point.value = props.context.workspace.getContentXY(e);
    downDir = dir;
    const start = getTransformCol(props.context, shape, 0, 0);
    const end = getTransformCol(props.context, shape, width, 0);
    const p = getMoveLength(start, end, e, props.context) * width;
    down_point.value.x = p;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
    e.stopPropagation();
    if (isDragging) {
        if (!autoLayoutModifyHandler) {
            return
        }
        if (!autoLayoutModifyHandler.asyncApiCaller) {
            autoLayoutModifyHandler.createApiCaller();
        }
        const shape = props.context.selection.selectedShapes[0] as ArtboradView;
        const { width, height } = shape.frame;
        const autoLayout = shape.autoLayout;
        if (!autoLayout) return;
        if (downDir === 'ver') {
            const start = getTransformCol(props.context, shape, 0, 0);
            const end = getTransformCol(props.context, shape, 0, height);
            const p = getMoveLength(start, end, e, props.context) * height;
            let length = p - down_point.value.y;
            length += autoLayout.stackCounterSpacing;
            if (length <= 0) length = 0;
            autoLayoutModifyHandler.executeSpace(length, downDir);
            down_point.value.y = p;
        } else if (downDir === 'hor') {
            const start = getTransformCol(props.context, shape, 0, 0);
            const end = getTransformCol(props.context, shape, width, 0);
            const p = getMoveLength(start, end, e, props.context) * width;
            let length = p - down_point.value.x;
            length += autoLayout.stackSpacing;
            if (length <= 0) length = 0;
            autoLayoutModifyHandler.executeSpace(length, downDir);
            down_point.value.x = p;
        }
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
        }
    }
}

function mouseup(e: MouseEvent) {
    e.stopPropagation();
    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
    isDragging = false;
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



const verMouseenter = (e: MouseEvent) => {
    verSpaceFill.value = true;
}

const verMouseleave = (e: MouseEvent) => {
    verSpaceFill.value = false;
}

const horMouseenter = (e: MouseEvent) => {
    horSpaceFill.value = true;
}

const horMouseleave = (e: MouseEvent) => {
    horSpaceFill.value = false;
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
    <clipPath id="auto-layout-scape">
        <path
            :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
            fill="transparent" clip-rule="evenodd" />
    </clipPath>
    <g v-if="verSpaceBox.length" clip-path="url(#auto-layout-scape)" @mouseenter="verMouseenter"
        @mouseleave="verMouseleave">
        <path v-for="(box, index) in verSpaceBox" :key="index" class="padding-rect" ref="verSpace"
            :class="{ spaceFill: verSpaceFill }"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        <g v-for="(box, index) in verSpaceLine" :key="index">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mousedown="(e) => verMousedown(e, 'ver')"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
    <g v-if="horSpaceBox.length" clip-path="url(#auto-layout-scape)" @mouseenter="horMouseenter"
        @mouseleave="horMouseleave">
        <path v-for="(box, index) in horSpaceBox" :key="index" class="padding-rect" ref="horSpcae"
            :class="{ spaceFill: horSpaceFill }"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        <g v-for="(box, index) in horSpaceLine" :key="index">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mousedown="(e) => horMousedown(e, 'hor')"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
</template>

<style scoped lang="scss">
.padding-rect {
    fill: transparent;
    opacity: 0.5;
}

.padding-line {
    fill: rgb(214, 118, 234);
    stroke-width: 1px;
    stroke: white;
    opacity: 1;
}

.spaceFill {
    fill: pink;
}
</style>