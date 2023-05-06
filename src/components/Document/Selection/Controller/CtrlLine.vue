<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Action, CtrlElementType } from "@/context/workspace";
import { XY } from "@/context/selection";
import { translate, adjustLT2, adjustRB2, translateTo } from "@kcdesign/data/editor/frame";
import { Point } from "../SelectionView.vue";
import { GroupShape, Shape } from "@kcdesign/data/data/shape";
import { createLine, getAxle } from "@/utils/common";
import CtrlPoint from "./Points/CtrlPointForStraightLine.vue";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { fourWayWheel, Wheel, forCtrlRect } from "@/utils/contentFn";

interface Props {
    context: Context,
    isController: boolean
    controllerFrame: Point[],
    rotate: number
}

const props = defineProps<Props>();
const workspace = computed(() => props.context.workspace);
const matrix = new Matrix();
const dragActiveDis = 3;
let isDragging = false;
let startPosition: XY = { x: 0, y: 0 };
let root: XY = { x: 0, y: 0 };
let shapes: Shape[] = [];
let lineStyle: string;
let wheel: Wheel | undefined = undefined;

const axle = computed<XY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});

function updater() {
    getLine(props.controllerFrame);
}
function getShapesByXY() {
    const shapes = props.context.selection.getShapesByXY(startPosition);
    if (shapes.length) {
        props.context.selection.selectShape(shapes.at(-1));
    } else {
        props.context.selection.selectShape();
    }
}

function mousedown(e: MouseEvent) {
    if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
        wheel = fourWayWheel(props.context, { rolling: forCtrlRect });
        const action = workspace.value.action;
        if (action === Action.AutoV && props.isController) {
            e.stopPropagation(); // props.isController 当控制权在selection时，不要冒泡出去, 否则父节点也会被控制
            shapes = props.context.selection.selectedShapes;
            if (!shapes.length) return;
            matrix.reset(workspace.value.matrix);
            const { clientX, clientY } = e;
            root = workspace.value.root;
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            startPosition = { x: clientX - root.x, y: clientY - root.y };
        }
    }
}
function mousemove(e: MouseEvent) {
    if (e.button === 0) { //只处理鼠标左键按下时的移动
        const { clientX, clientY } = e;
        if (wheel) {
            wheel.moving(e);
        }
        const mousePosition = { x: clientX - root.x, y: clientY - root.y };
        if (isDragging) {
            workspace.value.translating(true); // 编辑器开始处于transforming状态 ---start transforming---
            props.context.selection.unHoverShape(); // 当编辑器处于transforming状态时, 此时的编辑器焦点为选中的图层, 应该取消被hover图层的hover状态, 同时不再给其他图层赋予hover状态
            transform(shapes, startPosition, mousePosition);
            startPosition = { ...mousePosition };
        } else {
            if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 是否开始移动的判定条件
                isDragging = true;
                props.context.repo.start('transform', {}); // 开启当前事务,事务在结束(commit/rollback)之前只能开启一次!!! ---begin transaction---
            }
        }
    }
}
function transform(shapes: Shape[], start: XY, end: XY) {
    const ps = matrix.inverseCoord(start.x, start.y);
    const pe = matrix.inverseCoord(end.x, end.y);
    const origin = props.context.selection.getClosetContainer(ps);
    const targetParent = props.context.selection.getClosetContainer(pe);
    // 对选中的每个图层进行变换
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].isLocked) continue;
        translate(shapes[i], pe.x - ps.x, pe.y - ps.y);
        if (origin.id !== targetParent.id) {
            shapeMoveNoTransaction(shapes[i], targetParent);
        }
    }
    props.context.repo.transactCtx.fireNotify(); // 通常情况下,当事务结束(commit),系统会根据事务中的改动更新视图. 而移动的过程中,整个移动(transform)的事务并未结束,即尚未commit,此时视图无法得到更新, 可以用此方法更新事务过程中的视图 ---before end transaction---
}
function mouseup(e: MouseEvent) {
    if (e.button === 0) { // 只处理鼠标左键按下时的抬起
        if (wheel) wheel = wheel.remove();
        if (isDragging) {
            props.context.repo.commit({}); // 如果触发了拖拽状态,必定开启了事务 ---end transaction---
        } else {
            getShapesByXY(); // 单纯点击,只选择图层
        }
        isDragging = false;
        workspace.value.translating(false); // 编辑器关闭transforming状态  ---end transforming---
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
}
function handlePointAction(type: CtrlElementType, p2: XY, deg: number, aType: 'rotate' | 'scale') {
    shapes = props.context.selection.selectedShapes;
    matrix.reset(workspace.value.matrix);
    for (let i = 0; i < shapes.length; i++) {
        let item = shapes[i];
        if (item.isLocked) continue;
        if (aType === 'rotate') {
            const newDeg = (item.rotation || 0) + deg;
            item.rotate(newDeg);
        } else {
            const p2Onpage = matrix.inverseCoord(p2.x, p2.y); // page
            if (type === CtrlElementType.LineStart) {
                adjustLT2(item, p2Onpage.x, p2Onpage.y);
            } else if (type === CtrlElementType.LineEnd) {
                adjustRB2(item, p2Onpage.x, p2Onpage.y);
            }
        }
    }
}
function keyboardHandle(e: KeyboardEvent) {
    handle(e, props.context);
}
// 自身不带事务的图形移动, 只能在事务开启之后调用
function shapeMoveNoTransaction(shape: Shape, targetParent: GroupShape) {
    const origin: GroupShape = ((shape.parent || props.context.selection.selectedPage) as GroupShape);
    origin.removeChild(shape);
    const { x, y } = shape.frame2Page();
    targetParent.addChild(shape);
    translateTo(shape, x, y);
}
function getLine(points: Point[]) {
    lineStyle = createLine(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
}
function windowBlur() {
    if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
        workspace.value.translating(false);
        props.context.repo.commit({});
        isDragging = false;
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
    if (wheel) wheel = wheel.remove();
}
onMounted(() => {
    props.context.selection.watch(updater);
    window.addEventListener('blur', windowBlur);
    document.addEventListener('keydown', keyboardHandle);
    getLine(props.controllerFrame);
})

onUnmounted(() => {
    props.context.selection.unwatch(updater);
    shapes.length = 0;
    window.removeEventListener('blur', windowBlur);
    document.removeEventListener('keydown', keyboardHandle);
})

watchEffect(updater)
</script>
<template>
    <div class="ctrl-line" @mousedown="mousedown" :style="lineStyle">
        <div class="display"></div>
        <CtrlPoint :context="props.context" :axle="axle" :rotate="rotate" :pointType="CtrlElementType.LineStart"
            @transform="handlePointAction"></CtrlPoint>
        <CtrlPoint :context="props.context" :axle="axle" :rotate="rotate" :pointType="CtrlElementType.LineEnd"
            @transform="handlePointAction"></CtrlPoint>
    </div>
</template>
<style lang='scss' scoped>
.ctrl-line {
    box-sizing: border-box;
    opacity: 1;
    overflow: visible;

    .display {
        width: 100%;
        height: 2px;
        background-color: #2561D9;
        position: absolute;
        top: 6px;
    }
}
</style>