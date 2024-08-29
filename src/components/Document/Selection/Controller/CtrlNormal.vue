<script setup lang='ts'>
/**
 * @description 单选通用型控件
 */

import { computed, onMounted, onUnmounted, watchEffect, ref, reactive } from "vue";
import { Context } from "@/context";
import { ArtboradView, PolygonShapeView, ShapeView } from '@kcdesign/data';
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

const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });

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

const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});

const partVisible = computed(() => {
    return bounds.bottom - bounds.top > 8 || bounds.right - bounds.left > 8;
})

function updateControllerView() {
    const framePoint = props.controllerFrame;
    boundrectPath.value = genRectPath(framePoint);
    props.context.workspace.setCtrlPath(boundrectPath.value);

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

// #endregion
function selection_watcher(t: number | string) {
    if (t == Selection.CHANGE_SHAPE) {
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

function workspace_watcher(t: number, some: any) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
    } else if (t === WorkSpace.PATH_EDIT_MODE) {
        selection_hidden.value = props.context.workspace.is_path_edit_mode;
    }
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

const is_enter = ref(false);
const autoLayoutShow = ref(false);
const mouseenter = () => {
    if (props.context.workspace.transforming) {
        return;
    }
    is_enter.value = true;
}

const mouseleave = () => {
    is_enter.value = false;
    autoLayoutShow.value = false;
}

const move = () => {
    autoLayoutShow.value = true;
}

const stop = watchEffect(updateControllerView);

const pointVisible = computed(() => {
    return bounds.bottom - bounds.top > 90 && bounds.right - bounds.left > 90;
})

const paddintIndex = ref(-1);
const hoverPaddintIndex = (index: number) => {
    paddintIndex.value = index;
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
    stop();
})
</script>
<template>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" data-area="controller" preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 100 100" width="100" height="100" overflow="visible" :class="{ hidden: selection_hidden }"
        @mousedown="mousedown" @mouseenter="mouseenter" @mouseleave="mouseleave" @mousemove="move">
        <path
            :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
            fill="transparent" />
        <ShapesStrokeContainer :context="props.context" />

        <AutoLayoutPadding v-if="autoLayoutShow && (shape as ArtboradView).autoLayout" :context="props.context"
            :paddintIndex="paddintIndex"></AutoLayoutPadding>

        <BarsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :c-frame="props.controllerFrame"
            :theme="theme" />
        <PointsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :axle="axle"
            :c-frame="props.controllerFrame" :theme="theme" />

        <AutoLayoutSpace v-if="autoLayoutShow && (shape as ArtboradView).autoLayout" :context="props.context"
            :controllerFrame="controllerFrame"></AutoLayoutSpace>
        <AutoLayoutPaddingLine v-if="autoLayoutShow && (shape as ArtboradView).autoLayout" :context="props.context"
            @hoverPaddint="hoverPaddintIndex"></AutoLayoutPaddingLine>

        <component v-if="!shape.data.haveEdit" :pointVisible="is_enter && pointVisible" :is="point_map.get(shape.type)"
            :context="props.context" :shape="props.shape as PolygonShapeView" :theme="theme"></component>
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