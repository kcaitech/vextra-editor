<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, ShapeView } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
import BarsContainer from "./Bars/BarsContainer.vue";
import PointsContainer from "./Points/PointsContainer.vue";
import { getAxle } from "@/utils/common";
interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: ShapeView
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const visible = ref<boolean>(true);
const editing = ref<boolean>(false);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
let viewBox = '';
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

// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}

function updateControllerView() {
    const m2r = props.shape.matrix2Root();
    matrix.reset(m2r);
    matrix.multiAtLeft(props.matrix);
    submatrix.reset(matrix);

    const framePoint = props.controllerFrame;
    boundrectPath.value = genRectPath(framePoint);
    props.context.workspace.setCtrlPath(boundrectPath.value);

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

// #endregion
function selection_watcher(t: number) {
    if (t == Selection.CHANGE_SHAPE) {
        editing.value = false;
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        visible.value = !props.context.workspace.isTranslating;
    } else if (t === WorkSpace.PATH_EDIT_MODE) {
        visible.value = !props.context.workspace.is_path_edit_mode;
    }
}

function check_status() {
    visible.value = !props.context.workspace.is_path_edit_mode;
}

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
    if (isDrag()) visible.value = false;
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
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
    props.context.cursor.reset();
})
watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox" :width="width"
        :height="height" :class="{ 'un-visible': !visible }" @mousedown="mousedown" overflow="visible"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)` }">
        <ShapesStrokeContainer :context="props.context" :matrix="props.matrix" color-hex="#1878f5">
        </ShapesStrokeContainer>
        <BarsContainer :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame"></BarsContainer>
        <PointsContainer :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape" :axle="axle"
            :c-frame="props.controllerFrame">
        </PointsContainer>
    </svg>
</template>
<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}

svg {
    position: absolute;
}
</style>