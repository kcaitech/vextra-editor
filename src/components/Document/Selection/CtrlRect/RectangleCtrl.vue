<script setup lang='ts'>
import { defineProps, watchEffect, onMounted, onUnmounted, reactive, ref, computed } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";
import { CtrlElementType } from "@/context/workspace";
import { AbsolutePosition } from "@/context/selection";
import { translate, translateTo, expandTo } from "@kcdesign/data/editor/frame";
import CtrlPoint from "../CtrlPoint.vue";
import { CtrlRect } from "../SelectionView.vue";
import { Shape } from "@kcdesign/data/data/shape";
export type CPoint = [CtrlElementType, number, number, string];
interface Props {
    context: Context,
    ctrlRect: CtrlRect,
    isController: boolean
}
const props = defineProps<Props>();
const workspace = computed(() => props.context.workspace);
const matrix = new Matrix();
const dragActiveDis = 3;
const borderWidth = 2;
const offset = 3.5;
let isDragging = false;
let systemPosition: AbsolutePosition = { x: 0, y: 0 };
let startPosition: AbsolutePosition = { x: 0, y: 0 };
let root: AbsolutePosition = { x: 0, y: 0 };
let shapes: Shape[] = [];
const points = computed<CPoint[]>(() => {
    const { width, height } = props.ctrlRect;
    const p1: CPoint = [CtrlElementType.RectLT, 0 - borderWidth, 0 - borderWidth, 'move']
    const p2: CPoint = [CtrlElementType.RectRT, width - 2 * borderWidth, 0 - borderWidth, 'move']
    const p3: CPoint = [CtrlElementType.RectRB, width - 2 * borderWidth, height - 2 * borderWidth, 'move']
    const p4: CPoint = [CtrlElementType.RectLB, 0 - borderWidth, height - 2 * borderWidth, 'move']
    const ps: CPoint[] = [p1, p2, p3, p4];
    ps.forEach(p => {
        p[1] -= offset;
        p[2] -= offset;
    })
    return ps;
});

function mousedown(e: MouseEvent) {
    shapes = props.context.selection.selectedShapes;
    if (!shapes.length) return;
    props.context.editor4Shape(shapes[0]);
    matrix.reset(workspace.value.matrix);
    if (!props.isController || !props.context.repo) return;
    const { clientX, clientY } = e;
    root = workspace.value.root;
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    startPosition = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    systemPosition = { x: clientX, y: clientY };
    props.context.repo.start('transform', {});
}
function mousemove(e: MouseEvent) {
    const { clientX, clientY } = e;
    if (isDragging) {
        const mousePosition = matrix.inverseCoord(clientX - root.x, clientY - root.y);
        const delta: AbsolutePosition = { x: mousePosition.x - startPosition.x, y: mousePosition.y - startPosition.y };
        transform(shapes, delta);
        props.context.repo?.transactCtx.fireNotify();
        startPosition = { x: mousePosition.x, y: mousePosition.y };
    } else {
        if (Math.hypot(systemPosition.x - clientX, systemPosition.y - clientY) > dragActiveDis) isDragging = true;
    }
}
function transform(shapes: Shape[], delta: AbsolutePosition) {
    for (let i = 0; i < shapes.length; i++) {
        translate(shapes[i], delta.x, delta.y);
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
function handlePointAction(type: CtrlElementType, delta: { x: number, y: number, deg: number }) {
    shapes.forEach(item => {
        const realXY = item.realXY();
        if (type === CtrlElementType.RectLT) {
            translateTo(item, realXY.x + delta.x, realXY.y + delta.y);
            expandTo(item, realXY.width - delta.x, realXY.height - delta.y);
        } else if (type === CtrlElementType.RectRT) {
            translateTo(item, realXY.x, realXY.y + delta.y);
            expandTo(item, realXY.width + delta.x, realXY.height - delta.y);
        } else if (type === CtrlElementType.RectRB) {
            expandTo(item, realXY.width + delta.x, realXY.height + delta.y);
        } else if (type === CtrlElementType.RectLB) {
            translateTo(item, realXY.x + delta.x, realXY.y);
            expandTo(item, realXY.width - delta.x, realXY.height + delta.y);
        }
    });

}
</script>
<template>
    <div class="ctrl-rect" @mousedown="mousedown" :style="{
        left: `${props.ctrlRect.x}px`,
        top: `${props.ctrlRect.y}px`,
        width: `${props.ctrlRect.width}px`,
        height: `${props.ctrlRect.height}px`,
        borderWidth: '' + borderWidth + 'px',
        transform: `rotate(${props.ctrlRect.rotate}deg)`
    }">
        <CtrlPoint v-for="(point, index) in points" :key="index" :context="props.context"
            :ctrl-point-type="CtrlElementType.RectLT" :axle="props.ctrlRect.axle" :point="point"
            @transform="handlePointAction"></CtrlPoint>
        <div class="frame" :style="{
            top: `${props.ctrlRect.height}px`,
            width: `${(props.ctrlRect.width.toFixed(2).length + props.ctrlRect.height.toFixed(2).length + 5.2) * 5}px`
        }">
            {{ `${props.ctrlRect.width.toFixed(2)} * ${props.ctrlRect.height.toFixed(2)}` }}
        </div>
    </div>
</template>
<style lang='scss' scoped>
.ctrl-rect {
    border-radius: 0px;
    border-style: solid;
    border-color: var(--active-color);
    position: absolute;
    box-sizing: border-box;
    background-color: transparent;

    >.frame {
        position: absolute;
        display: inline-block;
        text-align: center;
        height: 20px;
        padding: 0 var(--default-padding-quarter);
        font-size: var(--font-default-fontsize);
        line-height: 20px;
        color: var(--theme-color-anti);
        background-color: var(--active-color);
        border-radius: 2px;
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>