<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Action, CtrlElementType } from "@/context/workspace";
import { XY } from "@/context/selection";
import { translate, adjustLT2, adjustLB2, adjustRT2, adjustRB2, translateTo } from "@kcdesign/data/editor/frame";
import CtrlPoint from "./Points/CtrlPoint.vue";
import { Point } from "../SelectionView.vue";
import { GroupShape, Shape } from "@kcdesign/data/data/shape";
import { createRect, getAxle, getRectWH } from "@/utils/common";
interface Props {
    context: Context,
    isController: boolean
    controllerFrame: Point[],
    rotate: number
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
const offset = 17;
let isDragging = false;
let startPosition: XY = { x: 0, y: 0 };
let root: XY = { x: 0, y: 0 };
let shapes: Shape[] = [];
let rectStyle: string;
const points = computed<Point[]>(() => {
    const [lt, rt, rb] = props.controllerFrame;
    const { width, height } = getRectWH(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y);
    const p1: Point = { x: 0, y: 0, type: CtrlElementType.RectLT };
    const p2: Point = { x: width - borderWidth, y: 0, type: CtrlElementType.RectRT };
    const p3: Point = { x: width - borderWidth, y: height - borderWidth, type: CtrlElementType.RectRB };
    const p4: Point = { x: 0, y: height - borderWidth, type: CtrlElementType.RectLB };
    const ps: Point[] = [p1, p2, p4, p3];
    ps.forEach(p => {
        p.x -= offset;
        p.y -= offset;
    })
    return ps;
});
const axle = computed<XY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
// let framePosition: FramePosition = {
//     top: `${props.controllerFrame.height}px`,
//     left: '50%',
//     transX: -50,
//     transY: 0,
//     rotate: 0
// }
function updater() {
    // let rotate = (props.controllerFrame.rotate || 0) % 360;
    // rotate = rotate < 0 ? rotate + 360 : rotate;
    // const { width, height } = props.controllerFrame;
    // if (0 <= rotate && rotate < 45) {
    //     framePosition = { top: `${height}px`, left: '50%', transX: -50, transY: 0, rotate: 0 }
    // } else if (45 <= rotate && rotate < 135) {
    //     framePosition = { top: '50%', left: `${width + 10}px`, transX: -50, transY: -50, rotate: 270 }
    // } else if (135 <= rotate && rotate < 225) {
    //     framePosition = { top: '-4px', left: '50%', transX: -50, transY: -100, rotate: 180 }
    // } else if (225 <= rotate && rotate < 315) {
    //     framePosition = { top: '50%', left: '-14px', transX: -50, transY: -50, rotate: 90 }
    // } else if (315 <= rotate && rotate < 360) {
    //     framePosition = { top: `${height}px`, left: '50%', transX: -50, transY: 0, rotate: 0 }
    // }    
    getRect(props.controllerFrame);
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
        if (shapes[i].isLocked) continue; // 🔒住不让动
        translate(shapes[i], pe.x - ps.x, pe.y - ps.y);
        if (origin.id !== targetParent.id) {
            shapeMoveNoTransaction(shapes[i], targetParent);
        }
    }
    props.context.repo.transactCtx.fireNotify(); // 通常情况下,当事务结束(commit),系统会根据事务中的改动更新视图. 而移动的过程中,整个移动(transform)的事务并未结束,即尚未commit,此时视图无法得到更新, 可以用此方法更新事务过程中的视图 ---before end transaction---
}
function mouseup(e: MouseEvent) {
    if (e.button === 0) { // 只处理鼠标左键按下时的抬起
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
        if (item.isLocked) continue; // 🔒住不让动
        if (aType === 'rotate') {
            const newDeg = (item.rotation || 0) + deg;
            item.rotate(newDeg);
        } else {
            const p2Onpage = matrix.inverseCoord(p2.x, p2.y); // page
            if (type === CtrlElementType.RectLT) {
                adjustLT2(item, p2Onpage.x, p2Onpage.y);
            } else if (type === CtrlElementType.RectRT) {
                adjustRT2(item, p2Onpage.x, p2Onpage.y);
            } else if (type === CtrlElementType.RectRB) {
                adjustRB2(item, p2Onpage.x, p2Onpage.y);
            } else if (type === CtrlElementType.RectLB) {
                adjustLB2(item, p2Onpage.x, p2Onpage.y);
            }
        }
    }
}
// 自身不带事务的图形移动, 只能在事务开启之后调用
function shapeMoveNoTransaction(shape: Shape, targetParent: GroupShape) {
    const origin: GroupShape = ((shape.parent || props.context.selection.selectedPage) as GroupShape);
    origin.removeChild(shape);
    const { x, y } = shape.frame2Page();
    targetParent.addChild(shape);
    translateTo(shape, x, y);
}
function keyboardHandle(e: KeyboardEvent) {
    if (!shapes.length) return;
    const step = e.shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step, dy = 0, transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step, dy = 0, transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0, dy = -step, transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0, dy = step, transform = true;
    }
    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = props.context.editor4Shape(shapes[i]);
            editor.translate(dx, dy)
        }
    }
}
function getRect(points: Point[]) {
    rectStyle = createRect(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
}
function windowBlur() {
    if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
        workspace.value.translating(false);
        props.context.repo.commit({});
        isDragging = false;
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
}
onMounted(() => {
    props.context.selection.watch(updater);
    window.addEventListener('blur', windowBlur);
    document.addEventListener('keydown', keyboardHandle);
    getRect(props.controllerFrame);
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
    <div class="ctrl-rect" @mousedown="mousedown" :style="rectStyle">
        <CtrlPoint v-for="(point, index) in points" :key="index" :context="props.context" :axle="axle" :point="point"
            :rotate="props.rotate" @transform="handlePointAction" :controller-frame="props.controllerFrame"></CtrlPoint>
        <!-- <div class="frame" :style="{
                        top: framePosition.top,
                        left: framePosition.left,
                        transform: `translate(${framePosition.transX}%, ${framePosition.transY}%) rotate(${framePosition.rotate}deg)`
                    }">
                        <span>{{ `${props.controllerFrame.realWidth.toFixed(2)} * ${props.controllerFrame.realHeight.toFixed(2)}`
                        }}</span>
                    </div> -->
    </div>
</template>
<style lang='scss' scoped>
.ctrl-rect {
    position: absolute;
    box-sizing: border-box;
    background-color: transparent;
    border: 2px solid #2561D9;
    opacity: 1;

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