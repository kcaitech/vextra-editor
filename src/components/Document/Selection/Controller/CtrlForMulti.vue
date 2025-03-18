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
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection, SelectionTheme } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import ShapesStrokeContainer from "./ShapeStroke/ShapesStrokeContainer.vue";
import BarsContainer from "./Bars/BarsContainerForMulti.vue";
import PointsContainer from "./Points/PointsContainerForMulti.vue";
import { getAxle } from "@/utils/common";
import TidyUpButton from "./TidyUpButton.vue";
import { hiddenTidyUp } from "@/utils/tidy_up";

interface Props {
    context: Context;
    controllerFrame: Point[];
    rotate: number;
    theme: SelectionTheme;
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const isTidyUp = ref(false);

const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});

const partVisible = computed(() => {
    return bounds.bottom - bounds.top > 8 || bounds.right - bounds.left > 8;
})

const tidyVisible = computed(() => {
    return bounds.bottom - bounds.top > 40 && bounds.right - bounds.left > 40;
})

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

function updateControllerView() {
    const framePoint = props.controllerFrame;

    props.context.workspace.setCtrlPath(genRectPath(framePoint));

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

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
    }
}

function selection_watcher(t: number | string) {
    if (t == Selection.CHANGE_SHAPE || t === Selection.HIDDEN_RESET) {
        if (!props.context.workspace.isTranslating) {
            reset_hidden();
            tidyUpHidden();
        }
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

const tidyUpHidden = () => {
    const shapes = props.context.selection.selectedShapes;
    const length = shapes.filter(shape => shape.isVisible).length;
    if (length <= 1 || length > 100) return isTidyUp.value = false;
    isTidyUp.value = !hiddenTidyUp(shapes);
}

function mousedown(e: MouseEvent) {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
    if (isDrag()) {
        selection_hidden.value = true;
    }
}

function mouseup(e: MouseEvent) {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

const stop = watchEffect(updateControllerView);

onMounted(() => {
    tidyUpHidden();
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    window.addEventListener('blur', windowBlur);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', windowBlur);

    props.context.cursor.reset();
    reset_hidden();
    stop();
})
</script>
<template>
<svg xmlns="http://www.w3.org/2000/svg" data-area="controller" preserveAspectRatio="xMinYMin meet"
     viewBox="0 0 100 100" width="100" height="100" :class="{ hidden: selection_hidden }" overflow="visible"
     @mousedown="mousedown">
    <path
        :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
        fill="transparent"></path>
    <ShapesStrokeContainer :context="props.context"/>
    <!-- 整理 -->
    <TidyUpButton v-if="tidyVisible && isTidyUp" :context="props.context" :controller-frame="controllerFrame">
    </TidyUpButton>
    <BarsContainer v-if="partVisible" :context="props.context" :frame="props.controllerFrame"/>
    <PointsContainer v-if="partVisible" :context="props.context" :axle="axle" :frame="props.controllerFrame"/>
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