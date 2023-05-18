<script setup lang='ts'>
import { defineProps, computed, onMounted, onUnmounted, watchEffect, ref } from "vue";
import { Context } from "@/context";
import { CtrlElementType } from "@/context/workspace";
import { ClientXY } from "@/context/selection";
import { Point } from "../SelectionView.vue";
import { createLine, getAxle } from "@/utils/common";
import CtrlPoint from "./Points/CtrlPointForStraightLine.vue";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { useController } from "./controller";
interface Props {
    context: Context,
    isController: boolean
    controllerFrame: Point[],
    rotate: number
}
const props = defineProps<Props>();
const { isDblClick, isDrag, isEditing } = useController(props.context);
const workspace = computed(() => props.context.workspace);
const visible = ref<boolean>(true);
let lineStyle: string;
const editing = ref<boolean>(false); // 是否进入路径编辑状态

// #region 绘制控件
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
function getLine(points: Point[]) {
    lineStyle = createLine(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
}
// #endregion
function updater(t?: number) {
    getLine(props.controllerFrame);
    if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
        editing.value = isEditing();
    }
}
function workspaceUpdate(t?: number) {
    if (t === WorkSpace.TRANSLATING) {
        visible.value = !workspace.value.isTranslating;
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
    <div :class="{ 'ctrl-line': true, 'un-visible': !visible, editing }" @mousedown="mousedown" :style="lineStyle"
        data-area="controller">
        <div class="display" data-area="controller"></div>
        <CtrlPoint :context="props.context" :axle="axle" :rotate="rotate" :pointType="CtrlElementType.LineStart">
        </CtrlPoint>
        <CtrlPoint :context="props.context" :axle="axle" :rotate="rotate" :pointType="CtrlElementType.LineEnd"></CtrlPoint>
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

.un-visible {
    opacity: 0;
}

.editing {
    background-color: rgba($color: #2561D9, $alpha: 0.15);
}
</style>