<script setup lang='ts'>
import { computed, onMounted, onUnmounted, watchEffect, ref, reactive, watch } from "vue";
import { Context } from "@/context";
import { Matrix, ShapeType, Shape, ShapeView } from '@kcdesign/data';
import { WorkSpace } from "@/context/workspace";
import { Point } from "../SelectionView.vue";
import { ClientXY, Selection } from "@/context/selection";
import { useController } from "./controller";
import { genRectPath } from "../common";
import BarsContainer from "./Bars/BarsContainerForSym.vue";
import PointsContainer from "./Points/PointsContainerForSym.vue";
import { getAxle } from "@/utils/common";
import AddState from "./Symbol/AddState.vue";
import { SymbolType } from "@/utils/symbol";

interface Props {
    context: Context
    controllerFrame: Point[]
    rotate: number
    matrix: Matrix
    shape: ShapeView
}

const props = defineProps<Props>();
const { isDrag } = useController(props.context);
const editing = ref<boolean>(false);
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 });
const matrix = new Matrix();
const submatrix = new Matrix();
const symbol_type = ref<SymbolType>(SymbolType.Symbol);
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
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + width.value + " " + height.value;
}

function updateControllerView() {
    const m2p = props.shape.matrix2Root();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);
    if (!submatrix.equals(matrix)) submatrix.reset(matrix)
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
function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        editing.value = false;
        reset_hidden();
    } else if (t === Selection.SELECTION_HIDDEN) {
        modify_selection_hidden();
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.TRANSLATING) selection_hidden.value = props.context.workspace.isTranslating;
    else if (t === WorkSpace.PRE_EDIT) {
        editing.value = props.context.workspace.isEditing;
    }
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
    }
    else if (shape.type === ShapeType.SymbolUnion) {
        symbol_type.value = SymbolType.Union;
    }
}

const stop_shape_watch = watch(() => props.shape, (n, o) => {
    n.watch(modify_symbol_type);
    o.unwatch(modify_symbol_type);
    modify_symbol_type();
});
onMounted(() => {
    props.context.selection.watch(selection_watcher);
    props.context.workspace.watch(workspace_watcher);
    props.shape.watch(modify_symbol_type);
    window.addEventListener('blur', windowBlur);
    modify_symbol_type();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    window.removeEventListener('blur', windowBlur);
    props.context.cursor.reset();
    stop_shape_watch();
    props.shape.unwatch(modify_symbol_type);
    reset_hidden();
})
watchEffect(updateControllerView);
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox" :width="width"
        :height="height" :class="{ hidden: selection_hidden }" @mousedown="mousedown" overflow="visible"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }">
        <BarsContainer v-if="partVisible" :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape"
            :c-frame="props.controllerFrame"></BarsContainer>
        <PointsContainer v-if="partVisible" :context="props.context" :matrix="submatrix.toArray()" :shape="props.shape" :axle="axle"
            :c-frame="props.controllerFrame">
        </PointsContainer>
        <AddState v-if="symbol_type === SymbolType.State || symbol_type === SymbolType.Union" :context="props.context"
            :matrix="submatrix.toArray()" :shape="props.shape" :symbol-type="symbol_type" @checkout="modify_symbol_type">
        </AddState>
    </svg>
</template>
<style lang='scss' scoped>
.hidden {
    opacity: 0;
}
</style>