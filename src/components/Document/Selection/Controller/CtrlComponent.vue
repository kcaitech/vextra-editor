/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive, watch } from "vue";
import { Context } from "@/context";
import { ArtboardView, ShapeType, ShapeView, SymbolRefView } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection, SelectionTheme } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import BarsContainer from "./Bars/BarsContainer.vue";
import PointsContainer from "./Points/PointsContainer.vue";
import { getAxle } from "@/utils/common";
import AddState from "./Symbol/AddState.vue";
import { SymbolType } from "@/utils/symbol";
import AutoLayoutPadding from "./AutoLayoutController/AutoLayoutPadding.vue";
import AutoLayoutPaddingLine from "./AutoLayoutController/AutoLayoutPaddingLine.vue";
import AutoLayoutSpace from "./AutoLayoutController/AutoLayoutSpace.vue";
import ShapesStrokeContainer from "@/components/Document/Selection/Controller/ShapeStroke/ShapesStrokeContainer.vue";

interface Props {
    context: Context
    shape: ShapeView;

    controllerFrame: Point[]

    theme: SelectionTheme;
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });

const symbol_type = ref<SymbolType>(SymbolType.Symbol);

const axle = computed<ClientXY>(() => {
    const [lt, rt, rb, lb] = props.controllerFrame;
    return getAxle(lt.x, lt.y, rt.x, rt.y, rb.x, rb.y, lb.x, lb.y);
});

const partVisible = computed(() => {
    return bounds.bottom - bounds.top > 8 || bounds.right - bounds.left > 8;
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

// #endregion
function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
        autoLayoutShow.value = false;
    }
}

function mousedown() {
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
}

function mousemove() {
    selection_hidden.value = isDrag();
}

function mouseup() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

function windowBlur() {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
}

const autoLayoutShow = ref(false);

const mouseleave = () => {
    if (props.context.workspace.transforming) {
        return;
    }
    autoLayoutShow.value = false;
}

const move = () => {
    autoLayoutShow.value = true;
}

const paddingIndex = ref(-1);
const hoverPaddingIndex = (index: number) => {
    paddingIndex.value = index;
}

function modify_symbol_type() {
    const shape = props.shape;

    if (shape.type === ShapeType.Symbol) {
        if (shape.parent && shape.parent.type === ShapeType.SymbolUnion) {
            symbol_type.value = SymbolType.State;
        } else {
            symbol_type.value = SymbolType.Symbol;
        }
    } else if (shape.type === ShapeType.SymbolRef) {
        symbol_type.value = SymbolType.Ref;
    } else if (shape.type === ShapeType.SymbolUnion) {
        symbol_type.value = SymbolType.Union;
    }
}

const stop_shape_watch = watch(() => props.shape, (n, o) => {
    n.watch(modify_symbol_type);
    o.unwatch(modify_symbol_type);
    modify_symbol_type();
});

const stop = watchEffect(updateControllerView);

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);

    window.addEventListener('blur', windowBlur);

    props.shape.watch(modify_symbol_type);

    modify_symbol_type();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);

    window.removeEventListener('blur', windowBlur);

    props.shape.unwatch(modify_symbol_type);

    props.context.cursor.reset();

    stop_shape_watch();
    stop();
    reset_hidden();
})
</script>
<template>
<svg xmlns="http://www.w3.org/2000/svg" data-area="controller" preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 100 100" width="100" height="100" :class="{ hidden: selection_hidden }" overflow="visible"
        @mousedown="mousedown" @mouseleave="mouseleave" @mousemove="move">
    <ShapesStrokeContainer :context="props.context"/>
    <path
        :d="`M ${controllerFrame[0].x} ${controllerFrame[0].y} L ${controllerFrame[1].x} ${controllerFrame[1].y} L ${controllerFrame[2].x} ${controllerFrame[2].y} L ${controllerFrame[3].x} ${controllerFrame[3].y} Z`"
        fill="transparent"/>
    <AutoLayoutPadding v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                       :paddingIndex="paddingIndex"/>
    <BarsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :c-frame="props.controllerFrame"
                   :theme="theme"/>
    <PointsContainer v-if="partVisible" :context="props.context" :shape="props.shape" :axle="axle"
                     :c-frame="props.controllerFrame" :theme="theme"/>
    <AutoLayoutSpace v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                     :controllerFrame="controllerFrame"/>
    <AutoLayoutPaddingLine v-if="autoLayoutShow && (shape as ArtboardView).autoLayout && !(shape instanceof SymbolRefView)" :context="props.context"
                           @hoverPadding="hoverPaddingIndex"/>
    <AddState v-if="symbol_type === SymbolType.State || symbol_type === SymbolType.Union" :context="props.context"
              :shape="props.shape" :c-frame="props.controllerFrame" :symbol-type="symbol_type"/>
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