<script setup lang='ts'>
import { defineProps, watch, onMounted, onUnmounted, ref, onBeforeUpdate, reactive } from 'vue';
import { Selection } from '@/context/selection';
import { Matrix } from '@kcdesign/data/basic/matrix';
import { TextShape } from '@kcdesign/data/data/shape';
import { layoutText, locateCursor, locateRange } from '@/layout/text';
import { Context } from '@/context';

const props = defineProps<{
    shape: TextShape,
    selection: Selection,
    matrix: number[],
    context: Context
}>();

let editor = props.context.editor4Shape(props.shape);
const stopWatch = watch(() => props.shape, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    editor = props.context.editor4Shape(props.shape);
})

const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}

const matrix = new Matrix();
const isCursor = ref(true);
const cursorPath = ref("");
const selectPath = ref("");
const boundrectPath = ref("");
const bounds = reactive({ left: 0, top: 0, right: 0, bottom: 0 }); // viewbox

function update() {
    const m2p = props.shape.matrix2Page();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);

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

    if (props.selection.cursorStart !== props.selection.cursorEnd) {
        isCursor.value = false;
        // selected range
        const start = props.selection.cursorStart;
        const end = props.selection.cursorEnd;
        const layout = props.shape.getLayout(layoutText);
        selectPath.value = genRectPath(locateRange(layout, start, end).map((point) => matrix.computeCoord(point.x, point.y)));
    } else {
        isCursor.value = true;
        // cursor
        const cursorAtBefore = props.selection.cursorAtBefore;
        const index = props.selection.cursorStart;
        const layout = props.shape.getLayout(layoutText);
        const cursor = locateCursor(layout, index, cursorAtBefore).map((point) => matrix.computeCoord(point.x, point.y));
        cursorPath.value = genCursorPath(cursor);
    }
}

onBeforeUpdate(update)

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) update();
}

onMounted(() => {
    props.shape.watch(watcher);
    update();
    props.selection.watch(selectionWatcher);
})

onUnmounted(() => {
    props.shape.unwatch(watcher);
    stopWatch();
    props.selection.unwatch(selectionWatcher);
})

function genViewBox(bounds: { left: number, top: number, right: number, bottom: number }) {
    return "" + bounds.left + " " + bounds.top + " " + (bounds.right - bounds.left) + " " + (bounds.bottom - bounds.top)
}

function genCursorPath(cursor: { x: number, y: number }[]): string {
    if (cursor.length !== 2) return "";
    const p0 = cursor[0];
    const p1 = cursor[1];
    return "M " + p0.x + " " + p0.y + " L " + p1.x + " " + p1.y;
}

function genRectPath(points: { x: number, y: number }[]): string {
    let path = ""
    for (let i = 0, len = points.length; (i + 3) < len; i = i + 4) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3];
        path += "M " + p0.x + " " + p0.y;
        path += "L " + p1.x + " " + p1.y;
        path += "L " + p2.x + " " + p2.y;
        path += "L " + p3.x + " " + p3.y;
        path += "Z"
    }
    return path;
}

const inputel = ref<HTMLInputElement>();
const inputpos = ref({ left: 0, top: 0 })

let downIndex: { index: number, before: boolean };
function onMouseDown(e: MouseEvent) {
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(e.offsetX + bounds.left, e.offsetY + bounds.top);
    downIndex = props.selection.locateText(xy.x, xy.y);
    e.stopPropagation();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    if (inputel.value) inputel.value.hidden = true;
}
function onMouseUp(e: MouseEvent) {
    e.stopPropagation();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = props.selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        props.selection.setCursor(locate.index, locate.before)
    }
    else {
        props.selection.selectText(downIndex.index, locate.index);
    }
    updateInputPos(locate.before);
}

function onMouseMove(e: MouseEvent) {
    const workspace = props.context.workspace;
    const { clientX, clientY } = e;
    const root = workspace.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = props.selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        props.selection.setCursor(locate.index, locate.before)
    }
    else {
        props.selection.selectText(downIndex.index, locate.index);
    }
}

function updateInputPos(cursorAtBefore: boolean) {
    if (!inputel.value) return;
    inputel.value.hidden = false;

    const m2p = props.shape.matrix2Page();
    matrix.reset(m2p);
    matrix.multiAtLeft(props.matrix);

    // let cursorAtBefore = props.selection.cursorAtBefore;
    let index = props.selection.cursorStart;
    const end = props.selection.cursorEnd;
    if (index === end) {
        //
    }
    else {
        index = end;
    }

    const layout = props.shape.getLayout(layoutText);
    const cursor = locateCursor(layout, index, cursorAtBefore).map((point) => matrix.computeCoord(point.x, point.y));

    if (cursor.length !== 2) return;

    const x = cursor[0].x;
    let y = cursor[0].y;

    if (cursor[1].y < y) y = cursor[1].y;

    inputpos.value.left = x;
    inputpos.value.top = y;

    inputel.value.focus();
}

function committext() {
    if (!inputel.value) return;
    const text = inputel.value.value;
    if (text.length === 0) return;

    if (editor.isInComposingInput()) {
        if (editor.composingInputEnd(text)) {
            props.selection.setCursor(composingStartIndex + text.length, true);
        }
    }
    else {
        let index = props.selection.cursorStart;
        let end = props.selection.cursorEnd;
        if (index > end) {
            let t = index;
            index = end;
            end = t;
        }
        if (editor.insertText2(text, index, end - index)) {
            props.selection.setCursor(index + text.length, true);
        }
    }

    inputel.value.value = ''
}

function oninput(e: Event) {
    const event = e as InputEvent;
    if (event.isComposing) {
        if (!inputel.value) return;
        const text = inputel.value.value;
        if (editor.composingInputUpdate(text)) {
            props.selection.setCursor(composingStartIndex + text.length, true);
        }
    } else {
        committext();
    }
}

let composingStartIndex = 0;
function compositionstart(e: Event) {
    if (!inputel.value) return;
    let index = props.selection.cursorStart;
    let end = props.selection.cursorEnd;
    if (index > end) {
        let t = index;
        index = end;
        end = t;
    }
    composingStartIndex = index;
    editor.composingInputStart(index, end - index)
}

function compositionend(e: Event) {
    if (!inputel.value) return;
    const text = inputel.value.value;
    if (editor.composingInputEnd(text)) {
        props.selection.setCursor(composingStartIndex + text.length, true);
    }
    inputel.value.value = ''
}

function compositionupdate(e: Event) {
}

function onFocueOut() {
    committext();
}

function onKeyDown(e: KeyboardEvent) {
    console.log("onKeyDown", inputel.value?.value)
}

function onKeyUp(e: KeyboardEvent) {
    console.log("onKeyUp", inputel.value?.value)
}

function onKeyPress(e: KeyboardEvent) {
    console.log("onKeyPress", inputel.value?.value)
}

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox=genViewBox(bounds)
        :width="bounds.right - bounds.left" :height="bounds.bottom - bounds.top"
        :style="{ transform: `translate(${bounds.left}px,${bounds.top}px)`, left: 0, top: 0, position: 'absolute' }"
        :onmousedown="onMouseDown" :on-mouseup="onMouseUp" :on-mousemove="onMouseMove" overflow="visible"
        :reflush="reflush !== 0 ? reflush : undefined">
        <path v-if="isCursor" :d="cursorPath" fill="none" stroke='blue' stroke-width="2px"></path>
        <path v-if="!isCursor" :d="selectPath" fill="blue" fill-opacity="0.5" stroke='none'></path>
        <path :d="boundrectPath" fill="none" stroke='blue' stroke-width="1px"></path>
    </svg>
    <input type="text" class="input" @focusout="onFocueOut" @input="oninput" @compositionstart="compositionstart"
        @compositionend="compositionend" @compositionupdate="compositionupdate" @keydown="onKeyDown" @keypress="onKeyPress"
        @keyup="onKeyUp" :style="{ left: `${inputpos.left}px`, top: `${inputpos.top}px`, position: 'absolute' }"
        ref="inputel" />
</template>

<style lang='scss' scoped>
.input {
    z-index: -999;
    border: none;
    fill: transparent;
}
</style>