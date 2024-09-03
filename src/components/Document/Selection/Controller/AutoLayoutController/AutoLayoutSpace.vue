<script setup lang="ts">
import { Context } from '@/context';
import { Selection, XY } from '@/context/selection';
import { ArtboradView, BorderPosition, ColVector3D, CtrlElementType, Matrix, PaddingDir, Shape, ShapeView, StackSizing, adapt2Shape, getHorizontalAngle, layoutShapesOrder, makeShapeTransform2By1 } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { WorkSpace } from '@/context/workspace';
import { AutoLayoutHandler } from '@/transform/autoLayout';
import { getTransformCol } from '@/utils/content';
import { fixedZero } from '@/utils/common';
import { CursorType } from '@/utils/cursor2';

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
    index: number,
}

interface Point {
    x: number,
    y: number
}

const emits = defineEmits<{
    (e: 'hoverPaddint', index: number): void;
}>();


const props = defineProps<Props>();
const verSpaceBox = ref<Box[]>([]);
const verSpaceLine = ref<ControlsLine[]>([]);
const horSpaceBox = ref<Box[]>([]);
const horSpaceLine = ref<ControlsLine[]>([]);
const matrix = reactive(new Matrix());
const verSpaceFill = ref(false);
const horSpaceFill = ref(false);
const cursor_point = ref<Point>({ x: 0, y: 0 });
const cursor_down = ref(false);
const cursor_hover = ref(false);
const hor_space = ref<number | string>(0);
const ver_space = ref<number | string>(0);
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
    ver_space.value = verSpacing;
    if (autoLayout.stackVerticalGapSizing === StackSizing.Auto) {
        ver_space.value = '自动'
    }
    const shape_rows = layoutShapesOrder(shape.childs.map(s => adapt2Shape(s)));
    for (let i = 0; i < shape_rows.length - 1; i++) {
        const row = shape_rows[i];
        topPadding = Math.max(...row.map(s => {
            const frame = getIncludedBorderFrame(s, autoLayout.bordersTakeSpace)
            return frame.y + frame.height;
        }));
        if (autoLayout.stackVerticalGapSizing === StackSizing.Auto) {
            const cur_row_h = Math.max(...row.map(s => getIncludedBorderFrame(s, autoLayout.bordersTakeSpace).y + getIncludedBorderFrame(s, autoLayout.bordersTakeSpace).height));
            const next_min_x = Math.min(...shape_rows[i + 1].map(s => getIncludedBorderFrame(s, autoLayout.bordersTakeSpace).y));
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
        const verWidth = width - autoLayout.stackPaddingRight - autoLayout.stackHorizontalPadding;
        const topLine = m.transform([ColVector3D.FromXY(leftPadding + (verWidth / 2), topPadding + (verSpacing / 2))]);
        const ling: ControlsLine = {
            lt: { x: topLine.col0.x - 7, y: topLine.col0.y - 1.5 },
            rt: { x: topLine.col0.x + 7, y: topLine.col0.y - 1.5 },
            rb: { x: topLine.col0.x + 7, y: topLine.col0.y + 1.5 },
            lb: { x: topLine.col0.x - 7, y: topLine.col0.y + 1.5 },
            offset: topLine.col0, rotate: hor_rotate, index: i
        }
        verSpaceLine.value.push(ling);
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
    const shape_rows = layoutShapesOrder(shape.childs.map(s => adapt2Shape(s)));
    hor_space.value = autoLayout.stackSpacing;
    if (autoLayout.stackHorizontalGapSizing === StackSizing.Auto) {
        hor_space.value = '自动'
    }
    for (let i = 0; i < shape_rows.length; i++) {
        let leftPadding = autoLayout.stackHorizontalPadding; //左边距
        const shape_row = shape_rows[i];
        topPadding = Math.min(...shape_row.map(s => getIncludedBorderFrame(s, autoLayout.bordersTakeSpace).y));
        const maxHeightInRow = Math.max(...shape_row.map(s => getIncludedBorderFrame(s, autoLayout.bordersTakeSpace).height));
        for (let j = 0; j < shape_row.length - 1; j++) {
            const shape = shape_row[j];
            const frame = getIncludedBorderFrame(shape, autoLayout.bordersTakeSpace);
            const row_space = getIncludedBorderFrame(shape_row[j + 1], autoLayout.bordersTakeSpace).x - (frame.x + frame.width);
            leftPadding = frame.x + frame.width;
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
            const ling: ControlsLine = {
                lt: { x: spaceLine.col0.x - 7, y: spaceLine.col0.y - 1.5 },
                rt: { x: spaceLine.col0.x + 7, y: spaceLine.col0.y - 1.5 },
                rb: { x: spaceLine.col0.x + 7, y: spaceLine.col0.y + 1.5 },
                lb: { x: spaceLine.col0.x - 7, y: spaceLine.col0.y + 1.5 },
                offset: spaceLine.col0, rotate: ver_rotate, index: j
            }
            horSpaceLine.value.push(ling);
        }
    }
}

const getIncludedBorderFrame = (shape: Shape, includedBorder?: boolean) => {
    let f = shape.frame;
    if (includedBorder) {
        const borders = shape.getBorders();
        let maxtopborder = 0, maxleftborder = 0, maxrightborder = 0, maxbottomborder = 0;
        borders.forEach(b => {
            if (b.isEnabled) {
                if (b.position === BorderPosition.Outer) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom, maxbottomborder);
                } else if (b.position === BorderPosition.Center) {
                    maxtopborder = Math.max(b.sideSetting.thicknessTop / 2, maxtopborder);
                    maxleftborder = Math.max(b.sideSetting.thicknessLeft / 2, maxleftborder);
                    maxrightborder = Math.max(b.sideSetting.thicknessRight / 2, maxrightborder);
                    maxbottomborder = Math.max(b.sideSetting.thicknessBottom / 2, maxbottomborder);
                }
            }
        })
        f.x -= maxleftborder;
        f.y -= maxtopborder;
        f.width += maxleftborder + maxrightborder;
        f.height += maxtopborder + maxbottomborder;
    }
    const m = shape.transform;
    if (shape.isNoTransform()) {
        f.x = f.x + m.translateX, f.y = f.y + m.translateY
    } else {
        const corners = [
            { x: f.x, y: f.y },
            { x: f.x + f.width, y: f.y },
            { x: f.x + f.width, y: f.y + f.height },
            { x: f.x, y: f.y + f.height }]
            .map((p) => m.computeCoord(p));
        const minx = corners.reduce((pre, cur) => Math.min(pre, cur.x), corners[0].x);
        const maxx = corners.reduce((pre, cur) => Math.max(pre, cur.x), corners[0].x);
        const miny = corners.reduce((pre, cur) => Math.min(pre, cur.y), corners[0].y);
        const maxy = corners.reduce((pre, cur) => Math.max(pre, cur.y), corners[0].y);
        f.x = minx, f.y = miny, f.width = maxx - minx, f.height = maxy - miny
    }
    return f;
}

let downClientXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;
let downDir = '';
let moveIndex = 1;
const verMousedown = (e: MouseEvent, dir: PaddingDir, index: number) => {
    e.stopPropagation();
    cursor_down.value = true;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    downDir = dir;
    moveIndex = index;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}


const horMousedown = (e: MouseEvent, dir: PaddingDir, index: number) => {
    e.stopPropagation();
    cursor_down.value = true;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    downDir = dir;
    moveIndex = index;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

let counterSpacing = 0;
let spacing = 0;

function mousemove(e: MouseEvent) {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    const shape = props.context.selection.selectedShapes[0] as ArtboradView;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    if (isDragging) {
        if (!autoLayoutModifyHandler) {
            return
        }
        if (!autoLayoutModifyHandler.asyncApiCaller) {
            autoLayoutModifyHandler.createApiCaller();
        }

        const matrix2Root = shape.matrix2Root();
        const m = new Matrix(matrix2Root.inverse);
        const downXy = m.computeCoord(downClientXY);
        const moveXy = m.computeCoord2(e.clientX, e.clientY);
        if (downDir === 'ver') {
            const scale = props.context.workspace.matrix.m00;
            const length = ((moveXy.y - downXy.y) / scale) * 2;
            autoLayoutModifyHandler.executeSpace((length / moveIndex) + counterSpacing, downDir);
        } else if (downDir === 'hor') {
            const scale = props.context.workspace.matrix.m00;
            const length = ((moveXy.x - downXy.x) / scale) * 2;
            autoLayoutModifyHandler.executeSpace((length / moveIndex) + spacing, downDir);
        }
    } else {
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
            counterSpacing = autoLayout.stackCounterSpacing;
            spacing = autoLayout.stackSpacing;
        }
    }
}

function mouseup(e: MouseEvent) {
    e.stopPropagation();
    clear_status();
}


function clear_status() {
    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
    isDragging = false;
    cursor_down.value = false;
    downDir = '';
    if (!cursor_hover.value) {
        props.context.cursor.reset();
    }
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function setCursor(dir: 'ver' | 'hor') {
    const cursor = props.context.cursor;

    let deg = 0;
    if (dir === 'hor') {
        deg = horSpaceLine.value[0].rotate;
    } else if (dir === 'ver') {
        deg = verSpaceLine.value[0].rotate;
    }

    cursor.setType(CursorType.AutoSpace, deg);
}

const verMouseenter = (e: MouseEvent) => {
    emits('hoverPaddint', -1);
    verSpaceFill.value = true;
}

const verMouseleave = (e: MouseEvent) => {
    verSpaceFill.value = false;
}

const verMousemove = (e: MouseEvent) => {
    cursor_point.value = props.context.workspace.getContentXY(e);
    cursor_hover.value = true;
}

const horMouseenter = (e: MouseEvent) => {
    emits('hoverPaddint', -1);
    horSpaceFill.value = true;
}

const horMouseleave = (e: MouseEvent) => {
    horSpaceFill.value = false;
}

const horMousemove = (e: MouseEvent) => {
    cursor_point.value = props.context.workspace.getContentXY(e);
    cursor_hover.value = true;
}

const Mouseenter = (e: MouseEvent, dir: 'ver' | 'hor') => {
    cursor_point.value = props.context.workspace.getContentXY(e);
    cursor_hover.value = true;
    setCursor(dir);
}
const Mouseleave = (e: MouseEvent) => {
    cursor_hover.value = false;
    props.context.cursor.reset();
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

function window_blur() {
    clear_status();
}

onMounted(() => {
    update();
    watchShapes();
    window.addEventListener('blur', window_blur);
    props.context.workspace.watch(workspaceWatcher);
    props.context.selection.watch(selectionWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
    props.context.selection.unwatch(selectionWatcher);
    window.removeEventListener('blur', window_blur);
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
            :class="{ spaceFill: downDir === 'ver' || verSpaceFill }"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        <g v-for="(box, index) in verSpaceLine" :key="index" @mouseenter="(e) => Mouseenter(e, 'ver')"
            @mouseleave="Mouseleave" @mousemove="verMousemove">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mousedown="(e) => verMousedown(e, 'ver', box.index * 2 + 1)"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
    <g v-if="horSpaceBox.length" clip-path="url(#auto-layout-scape)" @mouseenter="horMouseenter"
        @mouseleave="horMouseleave">
        <path v-for="(box, index) in horSpaceBox" :key="index" class="padding-rect" ref="horSpcae"
            :class="{ spaceFill: downDir === 'hor' || horSpaceFill }"
            :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        <g v-for="(box, index) in horSpaceLine" :key="index" @mouseenter="(e) => Mouseenter(e, 'hor')"
            @mouseleave="Mouseleave" @mousemove="horMousemove">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mousedown="(e) => horMousedown(e, 'hor', box.index * 2 + 1)"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
    <foreignObject v-if="(cursor_down || cursor_hover)" :x="cursor_point.x + 10" :y="cursor_point.y + 15" width="100px"
        height="28px">
        <div class="percent_container">
            <span>{{ fixedZero(downDir === 'ver' || verSpaceFill ? ver_space : hor_space) }} </span>
        </div>
    </foreignObject>
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

.percent_container {
    position: absolute;
    display: flex;
    max-width: 100px;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;

    span {
        padding: 4px;
        border-radius: 4px;
        background-color: #D13BCD;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>