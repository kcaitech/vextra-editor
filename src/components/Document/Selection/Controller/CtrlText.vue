<script setup lang='ts'>
import { watch, onMounted, onUnmounted, ref, reactive } from 'vue';
import { Selection } from '@/context/selection';
import { Matrix } from '@kcdesign/data';
import { TextShape } from '@kcdesign/data';
import { Shape } from "@kcdesign/data";
import { Context } from '@/context';
import TextInput from './Text/TextInput.vue';
import SelectView from "./Text/SelectView.vue";
import { genRectPath, throttle } from '../common';
import { useController } from '../Controller/controller';
import { Point } from "../SelectionView.vue";
import { WorkSpace } from '@/context/workspace';

const props = defineProps<{
    context: Context,
    controllerFrame: Point[],
    rotate: number,
    matrix: number[],
    shape: Shape
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
const visible = ref<boolean>(true);
function _update() {
    const m2p = props.shape.matrix2Root();
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
    if (e.button === 0) {
        const workspace = props.context.workspace;
        if (!editing && isDblClick()) {
            editing = true;
            workspace.contentEdit(editing);
            workspace.setCursorStyle('text', 0);
        }
        if (!editing) return;
        workspace.setCtrl('controller');
        const selection = props.context.selection;
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(e.offsetX + bounds.left, e.offsetY + bounds.top);
        downIndex = selection.locateText(xy.x, xy.y);
        e.stopPropagation();
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        if (workspace.isMenuMount) {
            workspace.menuMount(false);
        }
    } else if (e.button === 2) {
        if (!(e.target as Element).closest('#text-selection')) {
            e.stopPropagation();
        }
    }
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
function mouseenter() {
    if (editing) {
        props.context.workspace.setCursorStyle('text', 0);
    }
}
function mouseleave() {
    props.context.workspace.resetCursor();
}
function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top)
}
function selected_all() {
    const selection = props.context.selection;
    const end = props.shape.text.length;
    selection.selectText(0, end);
}
function workspace_watcher(t?: number) {
    if (t === WorkSpace.TRANSLATING) {
        if (props.context.workspace.isTranslating) {
            visible.value = false;
        } else {
            visible.value = true;
        }
    }
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
    props.context.workspace.watch(workspace_watcher);
    update();
})

onUnmounted(() => {
    const selection = props.context.selection;
    props.shape.unwatch(update);
    selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspace_watcher);
})

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-area="controller"
        id="text-selection" xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox=genViewBox(bounds) :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        :onmousedown="onMouseDown" :on-mouseup="onMouseUp" :on-mousemove="onMouseMove" overflow="visible"
        @mouseenter="mouseenter" @mouseleave="mouseleave" :class="{ 'un-visible': !visible }">
        <SelectView :context="props.context" :shape="(props.shape as TextShape)" :matrix="submatrix.toArray()"></SelectView>
        <path :d="boundrectPath" fill="none" stroke='#2561D9' stroke-width="1px"></path>
    </svg>
    <TextInput :context="props.context" :shape="(props.shape as TextShape)" :matrix="submatrix.toArray()"></TextInput>
</template>

<style lang='scss' scoped>
.un-visible {
    opacity: 0;
}
</style>