/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { ArtboardView, ColVector3D, Matrix, PaddingDir, StackSizing } from '@kcdesign/data';
import { Selection, XY } from '@/context/selection';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { fixedZero } from '@/utils/common';
import { WorkSpace } from '@/context/workspace';
import { AutoLayoutHandler } from '@/transform/autoLayout';
import { CursorType } from '@/utils/cursor';

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
    // center: {x: number, y: number}[]
}

const emits = defineEmits<{
    (e: 'hoverPadding', index: number): void;
}>();

const props = defineProps<Props>();
const cursor_point = ref<Point>({ x: 0, y: 0 });
const cursor_down = ref(false);
const controls_line = ref<ControlsLine[]>([]);
const paddingBox = ref<PaddingBox[]>([]);
const matrix = reactive(new Matrix());
const cursor_hover = ref(false);
const paddingIndex = ref(-1);
const hover_cursor_switch = ref(false);
const saveHeight = ref(0);
let autoLayoutModifyHandler: AutoLayoutHandler | undefined = undefined;

function update() {
    update_padding_position();
}

const update_padding_position = () => {
    getPaddingPosition();
}

function getPaddingPosition() {
    controls_line.value = [];
    paddingBox.value = [];
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length || shapes.length > 1) return;
    const shape = shapes[0] as ArtboardView;
    const { x, y, width, height } = shape.frame;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    const matrix2 = new Matrix(props.context.workspace.matrix);
    matrix.reset(matrix2);
    const shape_root_m = shape.matrix2Root();
    const m = (shape_root_m).clone();
    const clientTransform = (matrix2);
    m.addTransform(clientTransform); //root到视图
    const topPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
    ]);
    const leftPadding = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x, y + height)
    ]);
    const hor_rotate = Math.atan2(topPadding[1].y - topPadding[0].y, topPadding[1].x - topPadding[0].x) * (180 / Math.PI);
    const ver_rotate = Math.atan2(leftPadding[1].y - leftPadding[0].y, leftPadding[1].x - leftPadding[0].x) * (180 / Math.PI) + 90;
    const bottomLine = m.transform([ColVector3D.FromXY(x + (width / 2), y + height - (autoLayout.stackPaddingBottom / 2)), ColVector3D.FromXY(x + (width / 2), y + height)]);
    const leftLine = m.transform([ColVector3D.FromXY(x + (autoLayout.stackHorizontalPadding / 2), y + (height / 2)), ColVector3D.FromXY(x, y + (height / 2))]);
    const rightLine = m.transform([ColVector3D.FromXY(x + width - (autoLayout.stackPaddingRight / 2), y + (height / 2)), ColVector3D.FromXY(x + width, y + (height / 2))]);
    const topLine = m.transform([ColVector3D.FromXY(x + (width / 2), y + (autoLayout.stackVerticalPadding / 2)), ColVector3D.FromXY(x + (width / 2), y)]);
    const t_ling: ControlsLine = { lt: { x: topLine[0].x - 7, y: topLine[0].y - 1.5 }, rt: { x: topLine[0].x + 7, y: topLine[0].y - 1.5 }, rb: { x: topLine[0].x + 7, y: topLine[0].y + 1.5 }, lb: { x: topLine[0].x - 7, y: topLine[0].y + 1.5 }, offset: topLine[0], rotate: hor_rotate }
    const r_ling: ControlsLine = { lt: { x: rightLine[0].x + 1.5, y: rightLine[0].y - 7 }, rt: { x: rightLine[0].x + 1.5, y: rightLine[0].y + 7 }, rb: { x: rightLine[0].x - 1.5, y: rightLine[0].y + 7 }, lb: { x: rightLine[0].x - 1.5, y: rightLine[0].y - 7 }, offset: rightLine[0], rotate: ver_rotate }
    const b_ling: ControlsLine = { lt: { x: bottomLine[0].x - 7, y: bottomLine[0].y - 1.5 }, rt: { x: bottomLine[0].x + 7, y: bottomLine[0].y - 1.5 }, rb: { x: bottomLine[0].x + 7, y: bottomLine[0].y + 1.5 }, lb: { x: bottomLine[0].x - 7, y: bottomLine[0].y + 1.5 }, offset: bottomLine[0], rotate: hor_rotate }
    const l_ling: ControlsLine = { lt: { x: leftLine[0].x + 1.5, y: leftLine[0].y - 7 }, rt: { x: leftLine[0].x + 1.5, y: leftLine[0].y + 7 }, rb: { x: leftLine[0].x - 1.5, y: leftLine[0].y + 7 }, lb: { x: leftLine[0].x - 1.5, y: leftLine[0].y - 7 }, offset: leftLine[0], rotate: ver_rotate }
    controls_line.value.push(t_ling, r_ling, b_ling, l_ling);
    const t_padding: PaddingBox = { size: autoLayout.stackVerticalPadding,  }
    const r_padding: PaddingBox = { size: autoLayout.stackPaddingRight,  }
    const b_padding: PaddingBox = { size: autoLayout.stackPaddingBottom,  }
    const l_padding: PaddingBox = { size: autoLayout.stackHorizontalPadding,  }
    paddingBox.value.push(t_padding, r_padding, b_padding, l_padding);
    if (paddingBox.value[paddingIndex.value]?.size === 0 && hover_cursor_switch.value) {
        hover_cursor_switch.value = false;
    } else if (paddingBox.value[paddingIndex.value]?.size !== 0 && !hover_cursor_switch.value) {
        hover_cursor_switch.value = true;
    }
}
let downClientXY: XY = { x: 0, y: 0 };
let downXY: XY = { x: 0, y: 0 };
let isDragging: boolean = false;

const mousedown = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    emits('hoverPadding', paddingIndex.value);
    cursor_down.value = true;
    paddingIndex.value = index;
    downClientXY.x = e.clientX;
    downClientXY.y = e.clientY;
    const shape = props.context.selection.selectedShapes[0];
    const { height } = shape.frame;
    saveHeight.value = height;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

let layout_padding = { top: 0, right: 0, bottom: 0, left: 0 };
function mousemove(e: MouseEvent) {
    e.stopPropagation();
    cursor_point.value = props.context.workspace.getContentXY(e);
    emits('hoverPadding', paddingIndex.value);
    if (isDragging) {
        if (!autoLayoutModifyHandler) {
            return
        }
        if (!autoLayoutModifyHandler.asyncApiCaller) {
            autoLayoutModifyHandler.createApiCaller();
        }
        updatePadding(e);
        downXY.x = e.clientX;
        downXY.y = e.clientY;
    } else {
        const shape = props.context.selection.selectedShapes[0] as ArtboardView;
        const autoLayout = shape.autoLayout;
        if (!autoLayout) return;
        const diff = Math.hypot(e.clientX - downClientXY.x, e.clientY - downClientXY.y);
        if (diff > 4) {
            isDragging = true;
            layout_padding.top = autoLayout.stackVerticalPadding;
            layout_padding.left = autoLayout.stackHorizontalPadding;
            layout_padding.right = autoLayout.stackPaddingRight;
            layout_padding.bottom = autoLayout.stackPaddingBottom;
            downXY.x = e.clientX;
            downXY.y = e.clientY;
            autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
        }
    }
}

const updatePadding = (e: MouseEvent) => {
    if (!autoLayoutModifyHandler || paddingIndex.value < 0) return;
    cursor_down.value = true;
    const shape = props.context.selection.selectedShapes[0];
    const autoInfo = (shape as ArtboardView).autoLayout!;
    const matrix2Root = shape.matrix2Root();
    const m = (matrix2Root.inverse);
    const downXy = m.computeCoord(downClientXY);
    const moveXy = m.computeCoord2(e.clientX, e.clientY);
    const scale = props.context.workspace.matrix.m00;
    let dir: PaddingDir = 'top';
    let padding = 0;
    if (paddingIndex.value === 0) {
        dir = 'top';
        padding = (((moveXy.y - downXy.y) / scale) * 2) + layout_padding.top;
    } else if (paddingIndex.value === 1) {
        dir = 'right';
        if (autoInfo.stackPrimarySizing === StackSizing.Fixed) {
            padding = (((downXy.x - moveXy.x) / scale) * 2) + layout_padding.right;
        } else {
            padding = (((moveXy.x - downXy.x) / scale) * 2) + layout_padding.right;
        }
    } else if (paddingIndex.value === 2) {
        dir = 'bottom';
        if (autoInfo.stackCounterSizing === StackSizing.Fixed) {
            padding = (((downXy.y - moveXy.y) / scale) * 2) + layout_padding.bottom;
        } else {
            padding = (((moveXy.y - downXy.y) / scale) * 2) + layout_padding.bottom;
        }
    } else if (paddingIndex.value === 3) {
        dir = 'left';
        padding = (((moveXy.x - downXy.x) / scale) * 2) + layout_padding.left;
    }
    autoLayoutModifyHandler.executePadding(padding, dir);
}

function mouseup(e: MouseEvent) {
    e.stopPropagation();
    clear_status();
}

function clear_status() {
    cursor_down.value = false;
    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
    isDragging = false;
    paddingIndex.value = -1;
    emits('hoverPadding', -1);
    if (!cursor_hover.value) {
        props.context.cursor.reset();
    }
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

const mouseenter = (e: MouseEvent, index: number) => {
    emits('hoverPadding', index);
    paddingIndex.value = index;
    cursor_point.value = props.context.workspace.getContentXY(e);
    cursor_hover.value = true;
    setCursor(index);
}

const mouseleave = (e: MouseEvent, index: number) => {
    emits('hoverPadding', -1);
    cursor_hover.value = false;
    if (!cursor_down.value && !isDragging) {
        paddingIndex.value = -1;
        props.context.cursor.reset();
    }
}

const mousemove2 = (e: MouseEvent, index: number) => {
    cursor_point.value = props.context.workspace.getContentXY(e);
    cursor_hover.value = true;
    paddingIndex.value = index;
}

function setCursor(index: number) {
    if (index < 0) return;
    const cursor = props.context.cursor;
    if (paddingBox.value[index].size === 0) {
        let deg = controls_line.value[index].rotate;
        if (index === 1) {
            deg -= 90;
        } else if (index === 2) {
            deg -= 180;
        } else if (index === 3) {
            deg += 90;
        }
        const shape = props.context.selection.selectedShapes[0];
        const autoInfo = (shape as ArtboardView).autoLayout!;
        if (index === 2 && autoInfo.stackCounterSizing !== StackSizing.Fixed) {
            deg = 0;
        }
        cursor.setType(CursorType.AutoPadding, deg);
    } else {
        let deg = controls_line.value[index].rotate;
        if (index === 1 || index === 3) {
            deg += 90;
        }
        cursor.setType(CursorType.AutoSpace, deg);
    }
}
function forceSetCursor(index: number) {
    if (index < 0) return;
    const cursor = props.context.cursor;
    if (paddingBox.value[index].size === 0) {
        let deg = controls_line.value[index].rotate;
        if (index === 1) {
            deg -= 90;
        } else if (index === 2) {
            deg -= 180;
        } else if (index === 3) {
            deg += 90;
        }
        const shape = props.context.selection.selectedShapes[0];
        const autoInfo = (shape as ArtboardView).autoLayout!;
        if (index === 2 && autoInfo.stackCounterSizing !== StackSizing.Fixed) {
            deg = 0;
        }
        cursor.setTypeForce(CursorType.AutoPadding, deg);
    } else {
        let deg = controls_line.value[index].rotate;
        if (index === 1 || index === 3) {
            deg += 90;
        }
        cursor.setTypeForce(CursorType.AutoSpace, deg);
    }
}

watch(() => hover_cursor_switch.value, (v) => {
    forceSetCursor(paddingIndex.value);
})

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
    <g v-if="controls_line.length">
        <g v-for="(box, index) in controls_line" :key="index">
            <path class="padding-line"
                :style="{ transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
            <path @mousedown="(e) => mousedown(e, index)" @mouseenter="(e) => mouseenter(e, index)"
                @mouseleave="(e) => mouseleave(e, index)" @mousemove="(e) => mousemove2(e, index)"
                :style="{ stroke: 'transparent', fill: 'transparent', 'stroke-width': '1px', transform: `translate(${box.offset.x}px, ${box.offset.y}px) rotate(${box.rotate}deg) scale(2) translate(${-box.offset.x}px, ${-box.offset.y}px)` }"
                :d="`M ${box.lt.x} ${box.lt.y} L ${box.rt.x} ${box.rt.y} L ${box.rb.x} ${box.rb.y} L ${box.lb.x} ${box.lb.y} Z`" />
        </g>
    </g>
    <foreignObject v-if="paddingIndex > -1 && (cursor_down || cursor_hover)" :x="cursor_point.x + 10"
        :y="cursor_point.y + 15" width="100px" height="28px">
        <div class="percent_container">
            <span>{{ fixedZero(paddingBox[paddingIndex].size) }} </span>
        </div>
    </foreignObject>
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