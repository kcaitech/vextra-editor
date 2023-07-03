<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix } from '@kcdesign/data';
import { TextShape } from '@kcdesign/data';
import { onUnmounted, ref, watch, onMounted } from 'vue';
import { Selection } from '@/context/selection';
import { throttle } from '../../common';
import { handleKeyEvent } from './keyhandler';

const props = defineProps<{
    shape: TextShape,
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
    if (!inputel.value) return;
    // inputel.value.hidden = false;
    const selection = props.context.selection;
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
    const cursor = locatepoints.map((point) => matrix.computeCoord(point.x, point.y));

    if (cursor.length !== 2) return;

    const x = cursor[0].x;
    let y = cursor[0].y;

    if (cursor[1].y > y) y = cursor[1].y;
    y -= 10; // input 框高度

    inputpos.value.left = x;
    inputpos.value.top = y;

    inputel.value.focus();
}

function selectionWatcher(...args: any[]) {
    if (args.indexOf(Selection.CHANGE_TEXT) >= 0) updateInputPos();
}

onMounted(() => {
    props.shape.watch(updateInputPos)
    props.context.selection.watch(selectionWatcher);
    updateInputPos();
})

onUnmounted(() => {
    props.shape.unwatch(updateInputPos)
    props.context.selection.unwatch(selectionWatcher);
})

function committext() {
    if (!inputel.value) return;
    const text = inputel.value.value;
    if (text.length === 0) return;

    const selection = props.context.selection;

    if (editor.isInComposingInput()) {
        if (editor.composingInputEnd(text)) {
            selection.setCursor(composingStartIndex + text.length, true);
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
        if (editor.insertText2(text, index, end - index)) {
            selection.setCursor(index + text.length, true);
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
            const selection = props.context.selection;
            selection.setCursor(composingStartIndex + text.length, true);
        }
    } else {
        committext();
    }
}

let composingStartIndex = 0;
function compositionstart(e: Event) {
    if (!inputel.value) return;
    const selection = props.context.selection;
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
        const selection = props.context.selection;
        selection.setCursor(composingStartIndex + text.length, true);
    }
    inputel.value.value = ''
}

function compositionupdate(e: Event) {
}

function onfocusout() {
    committext();
}

function onKeyDown(e: KeyboardEvent) {
    // console.log(e.key)
    handleKeyEvent(e, props.context, props.shape, editor);
}

function onKeyUp(e: KeyboardEvent) {
}

function onKeyPress(e: KeyboardEvent) {
    handleKeyEvent(e, props.context, props.shape, editor);
}

</script>
<template>
    <input type="text" class="input" @focusout="onfocusout" @input="oninput" @compositionstart="compositionstart"
        @compositionend="compositionend" @compositionupdate="compositionupdate" @keydown="onKeyDown" @keypress="onKeyPress"
        @keyup="onKeyUp" :style="{ left: `${inputpos.left}px`, top: `${inputpos.top}px`, position: 'absolute' }"
        ref="inputel" />
</template>
<style lang='scss' scoped>
.input {
    z-index: -999;
    background-color: transparent;
    border: none;
    box-shadow: none;
    outline: none;
    caret-color: transparent;
    height: 10px;
}
</style>