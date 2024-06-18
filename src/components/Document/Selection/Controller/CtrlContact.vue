<script setup lang='ts'>
import { onMounted, onUnmounted, watchEffect, ref, reactive, computed } from "vue";
import { Context } from "@/context";
import { ContactLineView, Matrix } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { Selection, SelectionTheme } from "@/context/selection";
import { useController } from "./controller4contact";
import ContactApex from "./Points/ContactApex.vue";
import BarsContainer from "./Bars/BarsContainerForContact.vue";

interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: ContactLineView
    theme: SelectionTheme
}
const props = defineProps<Props>();
useController(props.context);
const editing = ref<boolean>(false);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
// #region 绘制控件
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });

let viewBox = '';
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})
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
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}
function updateControllerView() {
    const m2p = props.shape.matrix2Root();

    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);

    if (!submatrix.equals(matrix)) {
        submatrix.reset(matrix);
    }

    const path = props.shape.getPath().clone();

    path.transform(matrix);

    props.context.workspace.setCtrlPath(path.toString());

    const m2 = new Matrix(matrix);
    const f = props.shape.frame;
    m2.preScale(f.width, f.height);

    const framePoint = (props.shape as ContactLineView)
        .getPoints()
        .map(i => m2.computeCoord2(i.x, i.y));

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
function selection_watcher(t: number | string) {
    if (t == Selection.CHANGE_SHAPE) {
        editing.value = false;
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}
function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
    }
    else if (t === WorkSpace.PRE_EDIT) {
        editing.value = props.context.workspace.isEditing;
    }
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    props.shape.watch(updateControllerView);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    props.shape.unwatch(updateControllerView);
    props.context.cursor.reset();
    reset_hidden();
})
watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :viewBox="viewBox"
        :width="width" :height="height"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, position: 'absolute' }"
        :class="{ hidden: selection_hidden }">
        <ContactApex :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame"></ContactApex>
        <BarsContainer :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame"></BarsContainer>
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>