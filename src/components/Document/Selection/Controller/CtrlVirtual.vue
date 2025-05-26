/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { Matrix, ShapeView } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { Selection, SelectionTheme } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import { Shape } from "@kcdesign/data";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
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
const workspace = computed(() => props.context.workspace);
const visible = ref<boolean>(true);
const editing = ref<boolean>(false); // 是否进入路径编辑状态
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
let viewBox = '';
// #region 绘制控件
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top);
}
function updateControllerView() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p.toMatrix());
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
    const framePoint = props.controllerFrame;
    boundrectPath.value = genRectPath(framePoint);
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
function workspace_watcher(t?: number) {
    if (t === WorkSpace.TRANSLATING) visible.value = !workspace.value.isTranslating;
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
    // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}
function selection_watcher(t: number | string) {
    if (t == Selection.CHANGE_SHAPE) editing.value = false;
}
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', windowBlur);
})
watchEffect(updateControllerView);
const width = computed(() => {
    const w = bounds.right - bounds.left;
    return w < 10 ? 10 : w;
})
const height = computed(() => {
    const h = bounds.bottom - bounds.top;
    return h < 10 ? 10 : h;
})
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox"
         :width="width" :height="height"
         :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
         :class="{ 'un-visible': !visible }" @mousedown="mousedown" overflow="visible">
        <path :d="boundrectPath" fill="none" stroke='#7F58F9' stroke-width="1.5px"></path>
        <ShapesStrokeContainer :context="props.context" :matrix="props.matrix" :shape="props.shape" color-hex="#7F58F9">
        </ShapesStrokeContainer>
    </svg>
</template>
<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}

.editing {
    background-color: rgba($color: #1878f5, $alpha: 0.15);
}
</style>