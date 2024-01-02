<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { ClientXY } from "@/context/selection";
import { Point } from "../SelectionView.vue";
import { getAxle } from "@/utils/common";
import PointContainerForStraightLine from "./Points/PointsContainerForStraightLine.SVG.vue"
import { Selection } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { useController } from "./controller";
import { Matrix, Shape, ShapeView } from "@kcdesign/data";
interface Props {
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: Matrix,
    shape: ShapeView
}
const props = defineProps<Props>();
const { isDblClick, isDrag } = useController(props.context);
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const visible = ref<boolean>(true);
let viewBox = '';
const line_path = ref("");
const editing = ref<boolean>(false);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
// #region 绘制控件
const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})
// #endregion
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}
function updateControllerView() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    const framePoint = props.controllerFrame;
    const path = props.shape.getPath().clone();
    path.transform(matrix);
    line_path.value = path.toString();
    props.context.workspace.setCtrlPath(line_path.value);
    const p0 = framePoint[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    framePoint.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds);
    viewBox = genViewBox(bounds);
}
function workspace_watcher(t?: number) {
    if (t === WorkSpace.TRANSLATING) {
        visible.value = !props.context.workspace.isTranslating;
    }
    else if (t === WorkSpace.PATH_EDIT_MODE) {
        visible.value = !props.context.workspace.is_path_edit_mode;
    }
}
function mousedown(e: MouseEvent) {
    const isdblc = isDblClick();
    if (isdblc) { }
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}
function mousemove(e: MouseEvent) {
    if (isDrag()) visible.value = false;
}
function check_status() {
    visible.value = !props.context.workspace.is_path_edit_mode;
}
function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}
function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) editing.value = false;
}
function windowBlur() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    window.addEventListener('blur', windowBlur);
    check_status();
})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', windowBlur);
})
watchEffect(updateControllerView)
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox" :width="width"
        :height="height"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        :class="{ 'un-visible': !visible }" @mousedown="mousedown" overflow="visible">
        <path :d="line_path" class="main-path"></path>
        <PointContainerForStraightLine :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :rotation="props.rotate" :axle="axle" :c-frame="props.controllerFrame"></PointContainerForStraightLine>
    </svg>
</template>
<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}

.main-path {
    stroke: var(--active-color);
    fill: none;
}
</style>