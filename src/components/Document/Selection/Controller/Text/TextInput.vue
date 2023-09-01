<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, TableShape } from '@kcdesign/data';
import { Shape, Text } from '@kcdesign/data';
import { onUnmounted, ref, watch, onMounted } from 'vue';
import { Selection } from '@/context/selection';
import { throttle } from '../../common';
import { handleKeyEvent } from './keyhandler';
import { WorkSpace } from '@/context/workspace';

const props = defineProps<{
    shape: Shape & { text: Text },
    context: Context,
    matrix: number[],
}>();

let editor = props.context.editor4TextShape(props.shape);
watch(() => props.shape, (value, old) => {
    old.unwatch(updateInputPos);
    value.watch(updateInputPos);
    editor = props.context.editor4TextShape(props.shape);
    updateInputPos();
})

watch(() => props.matrix, () => {
    updateInputPos();
})

const inputel = ref<HTMLInputElement>();
const inputpos = ref({ left: 0, top: 0 })
const matrix = new Matrix();

const updateInputPos = throttle(_updateInputPos, 5);

function _updateInputPos() {
    if (!inputel.value || !props.shape.text) return;
    // inputel.value.hidden = false;
    const selection = props.context.textSelection;
    // const m2p = props.shape.matrix2Root();
    // matrix.reset(m2p);
    // matrix.multiAtLeft(props.matrix);
    matrix.reset(props.matrix);

    let cursorAtBefore = selection.cursorAtBefore;
    let index = selection.cursorStart;
    const end = selection.cursorEnd;
    if (index === end) {
        //
    }
    else if (end >= 0) {
        index = end;
    }
    const text = props.shape.text;
    const locatepoints = text.locateCursor(index, cursorAtBefore);
    if (!locatepoints) return;
    const cursor = locatepoints.cursorPoints.map((point) => matrix.computeCoord(point.x, point.y));

    if (cursor.length !== 2) return;

    const x = cursor[0].x;
    let y = cursor[0].y;
    if (cursor[1].y > y) y = cursor[1].y;
    y -= 10; // input 框高度
    const root = props.context.workspace.root;
    inputpos.value.left = x + root.x;
    inputpos.value.top = y + root.y;
    inputel.value.focus();
}

function selectionWatcher(...args: any[]) {
    if (editor && !editor.isInComposingInput()) editor.resetCachedSpanAttr(); // TODO 应该过滤掉协作变换的选区变化
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) updateInputPos();
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.TEXT_FORMAT) {
        updateInputPos()
    }
}

onMounted(() => {
    props.shape.watch(updateInputPos)
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspaceWatcher);
    updateInputPos();
})

onUnmounted(() => {
    props.shape.unwatch(updateInputPos)
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspaceWatcher);
})

function committext() {
    if (!inputel.value) return;
    const text = inputel.value.value;
    if (text.length === 0) return;

    const selection = props.context.textSelection;

    if (editor.isInComposingInput()) {
        if (editor.composingInputEnd(text)) {
            selection.setCursor(composingStartIndex + text.length, true, props.shape.text);
        }
    }
    else {
        let index = selection.cursorStart;
        let end = selection.cursorEnd;
        if (index > end) {
            let t = index;
            index = end;
            end = t;
        }
        const count = editor.insertText2(text, index, end - index);
        if (count !== 0) {
            selection.setCursor(index + count, true, props.shape.text);
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
            const selection = props.context.textSelection;
            selection.setCursor(composingStartIndex + text.length, true, props.shape.text);
        }
    } else {
        committext();
    }
}

let composingStartIndex = 0;
function compositionstart(e: Event) {
    if (!inputel.value) return;
    const selection = props.context.textSelection;
    let index = selection.cursorStart;
    let end = selection.cursorEnd;
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
        const selection = props.context.textSelection;
        selection.setCursor(composingStartIndex + text.length, true, props.shape.text);
    }
    inputel.value.value = ''
}

function compositionupdate(e: Event) {
}

function onfocusout() {
    committext();
}

function onKeyDown(e: KeyboardEvent) {
    handleKeyEvent(e, props.context, props.shape, editor);
}

function onKeyUp(e: KeyboardEvent) {
}

function onKeyPress(e: KeyboardEvent) {
    handleKeyEvent(e, props.context, props.shape, editor);
}
</script>
<template>
    <input type="text" :tabindex="-1" class="input" @focusout="onfocusout" @input="oninput"
        @compositionstart="compositionstart" @compositionend="compositionend" @compositionupdate="compositionupdate"
        @keydown="onKeyDown" @keypress="onKeyPress" @keyup="onKeyUp"
        :style="{ left: `${inputpos.left}px`, top: `${inputpos.top}px` }" ref="inputel" />
</template>
<style lang='scss' scoped>
.input {
    opacity: 0;
    height: 10px;
    width: 1px;
    z-index: -1;
    position: fixed;
    contain: strict;
}
</style>