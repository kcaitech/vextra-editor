<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive, watch } from "vue";
import { Context } from "@/context";
import { ShapeType, ShapeView } from '@kcdesign/data';
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

function selection_watcher(t: number) {
    if (t === Selection.CHANGE_SHAPE) {
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) {
        selection_hidden.value = props.context.workspace.isTranslating;
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
    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:xhtml="http://www.w3.org/1999/xhtml"
         data-area="controller"
         preserveAspectRatio="xMinYMin meet"
         viewBox="0 0 100 100"
         width="100"
         height="100"
         :class="{ hidden: selection_hidden }"
         overflow="visible"
         @mousedown="mousedown"
    >
        <BarsContainer
            v-if="partVisible"
            :context="props.context"
            :shape="props.shape"
            :c-frame="props.controllerFrame"
            :theme="theme"
        />
        <PointsContainer
            v-if="partVisible"
            :context="props.context"
            :shape="props.shape"
            :axle="axle"
            :c-frame="props.controllerFrame"
            :theme="theme"
        />
        <AddState
            v-if="symbol_type === SymbolType.State || symbol_type === SymbolType.Union"
            :context="props.context"
            :shape="props.shape"
            :c-frame="props.controllerFrame"
            :symbol-type="symbol_type"
        />
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