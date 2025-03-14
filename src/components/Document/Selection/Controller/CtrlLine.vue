/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { ClientXY, SelectionTheme } from "@/context/selection";
import { Point } from "../SelectionView.vue";
import { getAxle } from "@/utils/common";
import PointContainerForStraightLine from "./Points/PointsContainerForStraightLine.SVG.vue"
import { Selection } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";
import { useController } from "./controller";
import { Matrix, Path, ShapeView } from "@kcdesign/data";

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
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
let viewBox = '';
const line_path = ref("");
const editing = ref<boolean>(false);
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
    matrix.reset(m2p.toMatrix());
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
        selection_hidden.value = props.context.workspace.isTranslating;
    } else if (t === WorkSpace.PATH_EDIT_MODE) {
        selection_hidden.value = props.context.workspace.is_path_edit_mode;
    }
}

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
    if (isDrag()) selection_hidden.value = true;
}

function check_status() {
    selection_hidden.value = props.context.workspace.is_path_edit_mode;
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        editing.value = false;
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
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
    reset_hidden();
})
watchEffect(updateControllerView)
const testPath = ref<string>('');

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.altKey) {
        const path: Path = (props.context.selection.selectedShapes[0].borderPath ?? new Path()).clone();
        const transform = props.context.selection.selectedShapes[0].matrix2Root().multiAtLeft(props.context.workspace.matrix);
        path.transform(transform);
        testPath.value = path.toString();
    }
});
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg"
         data-area="controller" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox"
         :width="width"
         :height="height"
         :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
         :class="{ hidden: selection_hidden }"
         overflow="visible"
         @mousedown="mousedown"
    >
        <path :d="line_path" class="main-path" :stroke="theme"></path>
        <path :d="testPath" fill="rgba(0, 255, 0, 0.8)" fill-rule="evenodd"/>
        <PointContainerForStraightLine :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
                                       :rotation="props.rotate" :axle="axle" :c-frame="props.controllerFrame"
                                       :theme="theme">
        </PointContainerForStraightLine>
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}

.main-path {
    fill: none;
}
</style>