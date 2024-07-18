<script setup lang="ts">
import { Context } from '@/context';
import { Preview } from '@/context/preview';
import { Selection, XY } from '@/context/selection';
import { dbl_action } from '@/utils/mouse_interactive';
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
let downXY: XY = { x: 0, y: 0 };
let isDragging = false;
const saveShape = ref<ShapeView>();

function pathMousedown(e: MouseEvent) {
    const selection = props.context.selection;
    e.stopPropagation();

    if (props.context.preview.menuVisible) {
        props.context.preview.notify(Preview.MENU_VISIBLE);
    }

    const hoveredShape = selection.hoveredShape;
    if (!hoveredShape) {
        return;
    }
    downXY = { x: e.x, y: e.y };
    if (e.button === 0) {
        if (dbl_action()) {
            console.log('双击事件');
            return;
        }
        console.log('按下鼠标');
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
    } else if (Math.hypot(e.x - downXY.x, e.y - downXY.y) > 3) {
        console.log('拖拽事件');

        isDragging = true;
    }
}

const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    const hoveredShape = props.context.selection.hoveredShape;
    if(!hoveredShape) return;
    if (e.button === 0) {
        console.log('松开鼠标');
    }
    if (isDragging) {
        isDragging = false;
    } else {
        if (e.button === 0) {
            console.log('单击事件');
        } else if (e.button === 2) {
            console.log('右键事件');
        }
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
const onMouseenter = () => {
    const hoveredShape = props.context.selection.hoveredShape;
    if (hoveredShape) {
        if (saveShape.value && saveShape.value.id !== hoveredShape.id) {
            console.log('saveShape.value: 移出');
            console.log('hoveredShape: 移入');
        } else {
            console.log('鼠标移入');
        }
        console.log('鼠标悬停');
        console.log('鼠标延迟');
        saveShape.value = hoveredShape;
    } else {
        console.log('鼠标移出');
        saveShape.value = undefined;
    }
}

function createShapeTracing() {
    const hoveredShape = props.context.selection.hoveredShape;
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
        onMouseenter()
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
            @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
        <path :d="tracingFrame.path" :fill="tracing_class.hollow_fill ? 'none' : 'transparent'" stroke="red"
            stroke-width="1.5" @mousedown="(e: MouseEvent) => pathMousedown(e)">
        </path>
    </svg>
</template>

<style scoped lang="scss"></style>