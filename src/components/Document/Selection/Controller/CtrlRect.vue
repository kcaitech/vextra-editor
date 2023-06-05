<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref } from "vue";
import { Context } from "@/context";
import { WorkSpace } from "@/context/workspace";
import { CtrlElementType } from "@kcdesign/data";
import { ClientXY } from "@/context/selection";
import CtrlBar from "./Bars/CtrlBar.vue";
import CtrlPoint from "./Points/CtrlPoint.vue";
import { Point, Bar } from "../SelectionView.vue";
import { createRect, getAxle, getRectWH } from "@/utils/common";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { useController } from "./controller";
import { Shape } from "@kcdesign/data";
interface Props {
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: number[],
    shape: Shape
}
const props = defineProps<Props>();
const { isDblClick, isDrag, isEditing } = useController(props.context);
const workspace = computed(() => props.context.workspace);
const visible = ref<boolean>(true);
let controllerStyle: string;
const editing = ref<boolean>(false); // 是否进入路径编辑状态

// #region 绘制控件
const points = computed<Point[]>(() => {
    const offset = 16;
    const [lt, rt, rb] = props.controllerFrame;
    const { width, height } = getRectWH(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y);
    const p1: Point = { x: 0, y: 0, type: CtrlElementType.RectLT };
    const p2: Point = { x: width, y: 0, type: CtrlElementType.RectRT };
    const p3: Point = { x: width, y: height, type: CtrlElementType.RectRB };
    const p4: Point = { x: 0, y: height, type: CtrlElementType.RectLB };
    const ps: Point[] = [p1, p2, p4, p3];
    ps.forEach(p => {
        p.x -= offset;
        p.y -= offset;
    })
    return ps;
});
const bars = computed<Bar[]>(() => {
    const [lt, rt, rb] = props.controllerFrame;
    const { width, height } = getRectWH(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y);
    const b1: Bar = { width, height, type: CtrlElementType.RectTop };
    const b2: Bar = { width, height, type: CtrlElementType.RectRight };
    const b3: Bar = { width, height, type: CtrlElementType.RectBottom };
    const b4: Bar = { width, height, type: CtrlElementType.RectLeft };
    const bs: Bar[] = [b1, b2, b3, b4];
    return bs;
});
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
function getRect(points: Point[]) {
    controllerStyle = createRect(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
}
// #endregion

function updater(t?: number) {
    getRect(props.controllerFrame);
    if (t == Selection.CHANGE_SHAPE) {
        editing.value = isEditing();
    }
}
function workspaceUpdate(t?: number) {
    if (t === WorkSpace.TRANSLATING) {
        if (!workspace.value.isTranslating) {
            visible.value = true;
        } else {
            visible.value = false;
        }
    }
}
function mousedown(e: MouseEvent) {
    const isdblc = isDblClick();
    if (isdblc) { //双击
        // todo
    }
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}
function mousemove(e: MouseEvent) {
    const isDragging = isDrag();
    if (isDragging) {
        visible.value = false; // 控件在移动过程中不可视
    }
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function keyboardHandle(e: KeyboardEvent) {
    handle(e, props.context);
}

function windowBlur() {
    // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}
onMounted(() => {
    props.context.selection.watch(updater);
    props.context.workspace.watch(workspaceUpdate);
    window.addEventListener('blur', windowBlur);
    document.addEventListener('keydown', keyboardHandle);
})

onUnmounted(() => {
    props.context.selection.unwatch(updater);
    props.context.workspace.unwatch(workspaceUpdate);
    window.removeEventListener('blur', windowBlur);
    document.removeEventListener('keydown', keyboardHandle);
})

watchEffect(() => { updater() })
</script>
<template>
    <div :class="{ 'ctrl-rect': true, 'un-visible': !visible, editing }" @mousedown="mousedown" :style="controllerStyle"
        data-area="controller">
        <CtrlBar v-for="(bar, index) in  bars" :key="index" :context="props.context" :width="bar.width" :height="bar.height"
            :ctrl-type="bar.type" :rotate="props.rotate"></CtrlBar>
        <CtrlPoint v-for="(point, index) in points" :key="index" :context="props.context" :axle="axle" :point="point"
            :rotate="props.rotate" :controller-frame="props.controllerFrame"></CtrlPoint>
    </div>
</template>
<style lang='scss' scoped>
.ctrl-rect {
    position: absolute;
    box-sizing: border-box;
    background-color: transparent;
}

.un-visible {
    opacity: 0;
}

.editing {
    background-color: rgba($color: #2561D9, $alpha: 0.15);
}
</style>