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
/**
 * @description 单选通用型控件
 */
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { ArtboardView, PolygonShapeView, ShapeView, PathShapeView, SymbolRefView, Path } from '@kcdesign/data';
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
import AutoLayoutPadding from "./AutoLayoutController/AutoLayoutPadding.vue";
import AutoLayoutPaddingLine from "./AutoLayoutController/AutoLayoutPaddingLine.vue";
import AutoLayoutSpace from "./AutoLayoutController/AutoLayoutSpace.vue";

interface Props {
    context: Context;
    shape: ShapeView;
    controllerFrame: Point[];
    theme: SelectionTheme;
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);

const boundRectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });

const selection_hidden = ref<boolean>(false);
let hidden_holder: any = null;

function modify_selection_hidden() {
    if (hidden_holder) clearTimeout(hidden_holder);

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

const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});

const partVisible = computed(() => {
    return bounds.bottom - bounds.top > 8 || bounds.right - bounds.left > 8;
});
const testPath = ref<string>('');
function updateControllerView() {
    const framePoint = props.controllerFrame;
    boundRectPath.value = genRectPath(framePoint);
    props.context.workspace.setCtrlPath(boundRectPath.value);

    bounds.left = Infinity;
    bounds.top = Infinity;
    bounds.right = -Infinity;
    bounds.bottom = -Infinity;
    framePoint.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds);
}

function check_status() {
    selection_hidden.value = props.context.workspace.is_path_edit_mode;
}

function mousedown() {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove() {
    if (isDrag()) selection_hidden.value = true;
}

function mouseup() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

let needActivateAfterEditorDestroy: boolean = false;
const pointActivated = ref(false);
const autoLayoutShow = ref(false);
const mouseenter = () => {
    if (props.context.workspace.linearEditorExist) return needActivateAfterEditorDestroy = true;
    needActivateAfterEditorDestroy = true;
    pointActivated.value = true;
}
const move = () => {
    autoLayoutShow.value = true;
}
const mouseleave = () => {
    if (props.context.workspace.linearEditorExist) return needActivateAfterEditorDestroy = false;
    needActivateAfterEditorDestroy = false;
    pointActivated.value = false;
    autoLayoutShow.value = false;
}

const pointVisible = computed(() => {
    return !(props.shape as PathShapeView).haveEdit && pointActivated.value && (bounds.bottom - bounds.top > 60 && bounds.right - bounds.left > 60);
})

const paddingIndex = ref(-1);
const hoverPaddingIndex = (index: number) => paddingIndex.value = index;

function color_watcher(t: number, hidden: boolean) {
    if (t === ColorCtx.HIDDEN_SELECTED) selection_hidden.value = hidden;
}

function selection_watcher(t: number | string) {
    if (t == Selection.CHANGE_SHAPE || t === Selection.HIDDEN_RESET) {
        if (!props.context.workspace.isTranslating) reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
        autoLayoutShow.value = false;
    } else if (t === WorkSpace.PATH_EDIT_MODE) {
        selection_hidden.value = props.context.workspace.is_path_edit_mode;
    } else if (t === WorkSpace.LINER_EDITOR_CONSTRUCTED) {
        pointActivated.value = false;
    } else if (t === WorkSpace.LINER_EDITOR_DESTROYED) {
        if (needActivateAfterEditorDestroy) pointActivated.value = true;
    }
}
document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.altKey) {
        const path: Path = (props.context.selection.selectedShapes[0].borderPath ?? new Path()).clone();
        const transform = props.context.selection.selectedShapes[0].matrix2Root().multiAtLeft(props.context.workspace.matrix);
        path.transform(transform);
        testPath.value = path.toString();
    }
});
const stop = watchEffect(updateControllerView);
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
    stop();
})
</script>
<template>
<svg xmlns="http://www.w3.org/2000/svg" data-area="controller" preserveAspectRatio="xMinYMin meet"
     viewBox="0 0 100 100" width="100" height="100" overflow="visible" :class="{ hidden: selection_hidden }"
     @mousedown="mousedown" @mouseenter="mouseenter" @mouseleave="mouseleave" @mousemove="move">
    <path :d="testPath" fill="rgba(255, 255, 0, 0.5)" fill-rule="evenodd"/>
    <path
        :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
        fill="transparent"/>
    <ShapesStrokeContainer :context="props.context"/>
    <AutoLayoutPadding v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                       :paddingIndex="paddingIndex"/>
    <BarsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :c-frame="props.controllerFrame"
                   :theme="theme"/>
    <PointsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :axle="axle"
                     :c-frame="props.controllerFrame" :theme="theme"/>
    <AutoLayoutSpace v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                     :controllerFrame="controllerFrame"/>
    <AutoLayoutPaddingLine v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                           @hover-padding="hoverPaddingIndex"/>
    <component v-if="pointVisible" :is="point_map.get(shape.type)" :context="props.context"
               :shape="props.shape as PolygonShapeView"/>
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