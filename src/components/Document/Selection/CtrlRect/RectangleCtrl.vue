<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect } from "vue";
import { Context } from "@/context";
import { Matrix } from "@/basic/matrix";
import { CtrlElementType } from "@/context/workspace";
import { AbsolutePosition } from "@/context/selection";
import { translate, translateTo, expandTo } from "@kcdesign/data/editor/frame";
import CtrlPoint from "../Points/PointForRect.vue";
import { CtrlRect } from "../SelectionView.vue";
import { Shape } from "@kcdesign/data/data/shape";

export type CPoint = [CtrlElementType, number, number, string];
interface Props {
    context: Context,
    ctrlRect: CtrlRect,
    isController: boolean
}
interface FramePosition {
    top: string,
    left: string,
    transX: number,
    transY: number,
    rotate: number
}
const props = defineProps<Props>();
const workspace = computed(() => props.context.workspace);
const matrix = new Matrix();
const dragActiveDis = 3;
const borderWidth = 2;
const offset = 14.5;
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
    const ps: CPoint[] = [p1, p2, p4, p3];
    ps.forEach(p => {
        p[1] -= offset;
        p[2] -= offset;
    })
    return ps;
});
let framePosition: FramePosition = {
    top: `${props.ctrlRect.height}px`,
    left: '50%',
    transX: -50,
    transY: 0,
    rotate: 0
}

function updater() {
    let rotate = (props.ctrlRect.rotate || 0) % 360;
    rotate = rotate < 0 ? rotate + 360 : rotate;
    if (0 <= rotate && rotate < 45) {
        framePosition = { top: `${props.ctrlRect.height}px`, left: '50%', transX: -50, transY: 0, rotate: 0 }
    } else if (45 <= rotate && rotate < 135) {
        framePosition = { top: '50%', left: `${props.ctrlRect.width + 10}px`, transX: -50, transY: -50, rotate: 270 }
    } else if (135 <= rotate && rotate < 225) {
        framePosition = { top: '-4px', left: '50%', transX: -50, transY: -100, rotate: 180 }
    } else if (225 <= rotate && rotate < 315) {
        framePosition = { top: '50%', left: '-14px', transX: -50, transY: -50, rotate: 90 }
    } else if (315 <= rotate && rotate < 360) {
        framePosition = { top: `${props.ctrlRect.height}px`, left: '50%', transX: -50, transY: 0, rotate: 0 }
    }
}

function mousedown(e: MouseEvent) {
    if (workspace.value.transforming) return;
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
        workspace.value.translating(true);
        props.context.selection.unHoverShape();
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
function mouseup(e: MouseEvent) {
    if (workspace.value.transforming && e.button) return;
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
        if (delta.deg !== 0 && item.rotation !== undefined) {
            const newDeg = item.rotation + delta.deg;
            item.rotate(newDeg);
            delta.x = 0;
            delta.y = 0;
        }
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
    <div class="ctrl-rect" @mousedown="mousedown" :style="{
        left: `${props.ctrlRect.x}px`,
        top: `${props.ctrlRect.y}px`,
        width: `${props.ctrlRect.width}px`,
        height: `${props.ctrlRect.height}px`,
        borderWidth: '' + borderWidth + 'px',
        transform: `rotate(${props.ctrlRect.rotate}deg)`
    }">
        <CtrlPoint v-for="(point, index) in points" :key="index" :context="props.context" :axle="props.ctrlRect.axle"
            :ctrl-rect="props.ctrlRect" :point="point" @transform="handlePointAction"></CtrlPoint>
        <div class="frame" :style="{
            top: framePosition.top,
            left: framePosition.left,
            transform: `translate(${framePosition.transX}%, ${framePosition.transY}%) rotate(${framePosition.rotate}deg)`
        }">
            <span>{{ `${props.ctrlRect.realWidth.toFixed(2)} * ${props.ctrlRect.realHeight.toFixed(2)}` }}</span>
        </div>
    </div>
</template>
<style lang='scss' scoped>
.ctrl-rect {
    border-style: solid;
    border-color: var(--active-color);
    position: absolute;
    box-sizing: border-box;
    background-color: transparent;

    >.frame {
        position: absolute;
        display: table;
        text-align: center;
        height: 20px;
        padding: 0 var(--default-padding-quarter);
        font-size: var(--font-default-fontsize);
        line-height: 20px;
        color: var(--theme-color-anti);
        background-color: var(--active-color);
        border-radius: 2px;

        >span {
            display: table-cell;
            white-space: nowrap;
        }
    }
}
</style>