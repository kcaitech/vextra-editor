<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, PolygonShapeView, ShapeView } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection, SelectionTheme } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
import BarsContainer from "./Bars/BarsContainer.vue";
import PointsContainer from "./Points/PointsContainer.vue";
import { getAxle } from "@/utils/common";
import { point_map } from "./Points/map"
import { ColorCtx } from "@/context/color";


interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: ShapeView
    theme: SelectionTheme
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const editing = ref<boolean>(false);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
const selection_hidden = ref<boolean>(false);
let hidden_holder: any = null;

function modify_selection_hidden() {
    if (hidden_holder) {
        clearTimeout(hidden_holder);
    }

    hidden_holder = setTimeout(() => {
        selection_hidden.value = false;
        clearTimeout(hidden_holder);
        hidden_holder = null;
    }, 1000);

    selection_hidden.value = true;
}

function reset_hidden() {
    selection_hidden.value = false;
    clearTimeout(hidden_holder);
    hidden_holder = null;
}

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
const partVisible = computed(() => {
    return bounds.bottom - bounds.top > 8 || bounds.right - bounds.left > 8;
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
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

// const testPathData = ref<string>('');

function workspace_watcher(t: number, some: any) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
    } else if (t === WorkSpace.PATH_EDIT_MODE) {
        selection_hidden.value = props.context.workspace.is_path_edit_mode;
    }
    // else if (t === 999) {
    //     const { l, r, t, b } = some;
    //     const m = props.context.workspace.matrix;
    //     const p1 = m.computeCoord2(l, t);
    //     const p2 = m.computeCoord2(r, t);
    //     const p3 = m.computeCoord2(r, b);
    //     const p4 = m.computeCoord2(l, b);
    //
    //     testPathData.value = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}L ${p4.x} ${p4.y} Z`
    //
    // }
}

function check_status() {
    selection_hidden.value = props.context.workspace.is_path_edit_mode;
}

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
    if (isDrag()) selection_hidden.value = true;
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}


const pointVisible = computed(() => {
    return bounds.bottom - bounds.top > 90 && bounds.right - bounds.left > 90;
})
const is_enter = ref(false);
const mouseenter = () => {
    if (props.context.workspace.transforming) {
        return;
    }
    is_enter.value = true;
}

const mouseleave = () => {
    is_enter.value = false;
}

const color_watcher = (t: number, hidden: boolean) => {
    if (t === ColorCtx.HIDDEN_SELECTED) {
        selection_hidden.value = hidden;
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    props.context.color.watch(color_watcher);
    window.addEventListener('blur', windowBlur);
    check_status();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    props.context.color.unwatch(color_watcher);
    window.removeEventListener('blur', windowBlur);
    props.context.cursor.reset();
    reset_hidden();
})
watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        data-area="controller" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox="viewBox" :width="width" :height="height" :class="{ hidden: selection_hidden }" @mousedown="mousedown"
        overflow="visible" :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)` }"
        @mouseenter="mouseenter" @mouseleave="mouseleave">
        <ShapesStrokeContainer :context="props.context">
        </ShapesStrokeContainer>
        <BarsContainer v-if="partVisible" :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame" :theme="theme"></BarsContainer>
        <PointsContainer v-if="partVisible" :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :axle="axle" :c-frame="props.controllerFrame" :theme="theme">
        </PointsContainer>
        <component v-if="!shape.data.haveEdit" :pointVisible="is_enter && pointVisible" :is="point_map.get(shape.type)"
            :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape as PolygonShapeView"
            :theme="theme"></component>
        <!--        <path :d="testPathData" stroke="green" stroke-width="1" fill="none"/>-->
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}

svg {
    position: absolute;
}
</style>