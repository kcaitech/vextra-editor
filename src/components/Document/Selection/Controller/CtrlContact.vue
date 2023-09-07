<script setup lang='ts'>
import { onMounted, onUnmounted, watchEffect, ref, reactive, computed } from "vue";
import { Context } from "@/context";
import { Matrix, Shape } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { Selection } from "@/context/selection";
import { useController } from "./controller4contact";
import ContactApex from "./Points/ContactApex.vue";

interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: Shape
}
const props = defineProps<Props>();
useController(props.context);
const visible = ref<boolean>(true);
const editing = ref<boolean>(false);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
// #region 绘制控件
function updateControllerView() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    const path = props.shape.getPath();
    path.transform(matrix);
    props.context.workspace.setCtrlPath(path.toString());
}
// #endregion
function selection_watcher(t: number) {
    if (t == Selection.CHANGE_SHAPE) editing.value = false;
}
function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) visible.value = ! props.context.workspace.isTranslating;
    else if (t === WorkSpace.PRE_EDIT) editing.value = props.context.workspace.isEditing;
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    props.context.cursor.reset();
})
watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" viewBox="0 0 10 10" width="10"
        height="10" overflow="visible" style=" position: absolute">
        <ContactApex :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame"></ContactApex>
    </svg>
</template>
<style lang='scss' scoped></style>