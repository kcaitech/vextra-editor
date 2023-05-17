<script setup lang='ts'>
import { defineProps, watch, onMounted, onUnmounted, ref, reactive } from 'vue';
import { Selection } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { TextShape } from '@kcdesign/data/data/shape';
import { Context } from '@/context';
import TextInput from './TextInput.vue';
import SelectView from "./SelectView.vue";
import { genRectPath, throttle } from './common';
import { useController } from '../Controller/controller';
import { fa } from 'element-plus/es/locale';

const props = defineProps<{
    shape: TextShape,
    matrix: number[],
    context: Context
}>();

watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})

watch(() => props.matrix, () => {
    update();
})
const { isDblClick } = useController(props.context);
const update = throttle(_update, 5);
const matrix = new Matrix();
const submatrix = reactive(new Matrix());
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox
let editing: boolean = false;
function _update() {
    const m2p = props.shape.matrix2Page();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);

    if (!submatrix.equals(matrix)) submatrix.reset(matrix)

    const frame = props.shape.frame;
    const points = [
        { x: 0, y: 0 }, // left top
        { x: frame.width, y: 0 }, //right top
        { x: frame.width, y: frame.height }, // right bottom
        { x: 0, y: frame.height }, // left bottom
    ];

    const boundrect = points.map((point) => matrix.computeCoord(point.x, point.y));
    boundrectPath.value = genRectPath(boundrect);

    const p0 = boundrect[0];
    bounds.left = p0.x;
    bounds.top = p0.y;
    bounds.right = p0.x;
    bounds.bottom = p0.y;
    boundrect.reduce((bounds, point) => {
        if (point.x < bounds.left) bounds.left = point.x;
        else if (point.x > bounds.right) bounds.right = point.x;
        if (point.y < bounds.top) bounds.top = point.y;
        else if (point.y > bounds.bottom) bounds.bottom = point.y;
        return bounds;
    }, bounds)
}

let downIndex: { index: number, before: boolean };
function onMouseDown(e: MouseEvent) {
    if (isDblClick() && !editing) {
        editing = true;
        props.context.workspace.contentEdit(editing);
    }
    if (!editing) return;
    props.context.workspace.setCtrl('controller');
    const selection = props.context.selection;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(e.offsetX + bounds.left, e.offsetY + bounds.top);
    downIndex = selection.locateText(xy.x, xy.y);
    e.stopPropagation();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function onMouseUp(e: MouseEvent) {
    e.stopPropagation();
    if (!editing) return;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    const selection = props.context.selection;
    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        selection.setCursor(locate.index, locate.before)
    }
    else {
        selection.selectText(downIndex.index, locate.index);
    }
    props.context.workspace.setCtrl('page');
}

function onMouseMove(e: MouseEvent) {
    if (!editing) return;
    const workspace = props.context.workspace;
    const selection = props.context.selection;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        selection.setCursor(locate.index, locate.before)
    }
    else {
        selection.selectText(downIndex.index, locate.index);
    }
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top)
}

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
    if (args.indexOf(Selection.CHANGE_SHAPE) >= 0) {
        editing = false;
    }
}

onMounted(() => {
    const selection = props.context.selection;
    props.shape.watch(update);
    selection.watch(selectionWatcher);
    update();
})

onUnmounted(() => {
    const selection = props.context.selection;
    props.shape.unwatch(update);
    selection.unwatch(selectionWatcher);
})

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        :onmousedown="onMouseDown" :on-mouseup="onMouseUp" :on-mousemove="onMouseMove" overflow="visible">
        <SelectView :context="props.context" :shape="props.shape" :matrix="submatrix.toArray()"></SelectView>
        <path :d="boundrectPath" fill="none" stroke='blue' stroke-width="1px" data-area="controller"></path>
    </svg>
    <TextInput :context="props.context" :shape="props.shape" :matrix="submatrix.toArray()"></TextInput>
</template>

<style lang='scss' scoped></style>