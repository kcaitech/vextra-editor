<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { getPreviewMatrix } from '@/utils/preview';
import { Matrix, PathShapeView, ShapeView } from '@kcdesign/data';
import { onMounted, onUnmounted, reactive, ref } from 'vue';


interface Props {
    context: Context
    matrix: Matrix
}

interface PathView {
    path: string,
    viewBox: string,
    height: number,
    width: number
}

const props = defineProps<Props>();
const tracing_class = reactive({ thick_stroke: false, hollow_fill: false });
const tracingFrame = ref<PathView>({ path: '', viewBox: '', height: 0, width: 0 });
const tracing = ref<boolean>(false);

function pathMousedown(e: MouseEvent) {
    const selection = props.context.selection;

    if (e.button !== 0) {
        return;
    }
    e.stopPropagation();

    if (props.context.preview.menuVisible) {
        props.context.preview.setMenuVisible(false);
    }

    const hoveredShape = selection.hoveredShape;
    if (!hoveredShape) {
        return;
    }
    // todo
}

const onMouseenter = (e: MouseEvent) => {

}

const onMouseleave = (e: MouseEvent) => {
    
}

function createShapeTracing() {
    const hoveredShape: ShapeView | undefined = props.context.selection.hoveredShape;
    tracing.value = false;

    if (!hoveredShape) {
        return;
    }
    const path = hoveredShape.getPath().clone();
    const m = getPreviewMatrix(hoveredShape);
    m.multiAtLeft(props.matrix.clone());
    path.transform(m);
    tracingFrame.value = { height: 10, width: 10, viewBox: `${0} ${0} ${10} ${10}`, path: path.toString() };
    tracing.value = true;
    modify_tracing_class(hoveredShape);
}

function modify_tracing_class(shape: ShapeView) {
    tracing_class.thick_stroke = false;
    tracing_class.hollow_fill = false;

    if (shape instanceof PathShapeView && !shape.isClosed) {
        tracing_class.hollow_fill = true;
        tracing_class.thick_stroke = true;
    }

    if (shape.getFills().length) {
        tracing_class.hollow_fill = false;
    }
}

const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE_HOVER) {
        createShapeTracing();
    }
}

onMounted(() => {
    props.context.selection.watch(selected_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
})
</script>

<template>
    <svg v-if="tracing" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible"
        :width="tracingFrame.width" :height="tracingFrame.height" :viewBox="tracingFrame.viewBox"
        style="position: absolute; top: 0; left: 0">
        <path :d="tracingFrame.path" fill="none" stroke="transparent" :stroke-width="context.selection.hoverStroke"
            @mousedown="(e: MouseEvent) => pathMousedown(e)" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
        </path>
        <path :d="tracingFrame.path" :fill="tracing_class.hollow_fill ? 'none' : 'transparent'" stroke="red"
            stroke-width="1.5" @mousedown="(e: MouseEvent) => pathMousedown(e)" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>