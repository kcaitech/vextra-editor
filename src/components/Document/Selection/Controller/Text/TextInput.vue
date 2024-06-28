<script setup lang='ts'>
import { Context } from '@/context';
import { Matrix, TableCell, TableCellView, TextShape, TextShapeView } from '@kcdesign/data';
import { Shape, Text } from '@kcdesign/data';
import { onUnmounted, ref, watch, onMounted } from 'vue';
import { throttle } from '../../common';
import { handleKeyEvent } from './keyhandler';
import { WorkSpace } from '@/context/workspace';
import { TextSelectionLite } from "@/context/textselectionlite";
import { permIsEdit } from '@/utils/permission';

type SelectionLike = TextSelectionLite;

interface Props {
    shape: TextShapeView | TableCellView
    context: Context
    matrix: number[]
    mainNotify: number | string
    selection: SelectionLike
    root?: { x: number, y: number }
}

defineExpose({ attention });

const props = defineProps<Props>();

function getText(shape: TextShapeView | TableCellView): Text {
    return (shape).getText();
}

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

function attention() {
    inputel.value?.focus();
}

function _updateInputPos() {
    if (!inputel.value) return;
    const text = getText(props.shape);
    if (!text) return;
    const selection = props.selection;
    matrix.reset(props.matrix);

    let cursorAtBefore = selection.cursorAtBefore;
    let index = selection.cursorStart;
    const end = selection.cursorEnd;
    if (index === end) {
        //
    } else if (end >= 0) {
        index = end;
    }
    const locatepoints = props.shape.locateCursor(index, cursorAtBefore);
    if (!locatepoints) return;

    const cursor = locatepoints.cursorPoints.map((point) => matrix.computeCoord(point.x, point.y));

    if (cursor.length !== 2) return;

    const x = cursor[0].x;
    let y = cursor[0].y;
    if (cursor[1].y > y) y = cursor[1].y;
    y -= 10; // input 框高度
    const root = props.root || props.context.workspace.root;
    inputpos.value.left = x + root.x;
    inputpos.value.top = y + root.y;
    
    inputel.value.focus();
}

function selectionWatcher(...args: any[]) {
    if (editor && !editor.isInComposingInput()) editor.resetCachedSpanAttr(); // TODO 应该过滤掉协作变换的选区变化
    if (args.indexOf(props.mainNotify) >= 0) updateInputPos();
}

function workspaceWatcher(t: number) {
    if (t === WorkSpace.TEXT_FORMAT) {
        updateInputPos()
    }
}
function copy_watcher(event: ClipboardEvent) {
    event.stopPropagation();
    props.context.workspace.clipboard.write(event);
}
function cut_watcher(event: ClipboardEvent) {
    event.stopPropagation();

    if (!permIsEdit(props.context)) {
        return;
    }

    const write_result = props.context.workspace.clipboard.write(event);
    if (!write_result) {
        return;
    }

    const text_shape = props.context.selection.textshape;
    if (!text_shape) {
        return;
    }

    const selection = props.context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    if (start === end) {
        return;
    }

    const editor = props.context.editor4TextShape(text_shape);
    if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
        selection.setCursor(Math.min(start, end), false);
    }


}

function paste_watcher(event: ClipboardEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!permIsEdit(props.context)) {
        return;
    }
    props.context.workspace.clipboard.paste_text(event);
}

onMounted(() => {
    props.shape.watch(updateInputPos)
    props.context.selection.watch(selectionWatcher);
    props.context.workspace.watch(workspaceWatcher);

    if (inputel.value) {
        inputel.value.addEventListener('copy', copy_watcher);
        inputel.value.addEventListener('cut', cut_watcher);
        inputel.value.addEventListener('paste', paste_watcher);
    }

    updateInputPos();
})

onUnmounted(() => {
    props.shape.unwatch(updateInputPos)
    props.context.selection.unwatch(selectionWatcher);
    props.context.workspace.unwatch(workspaceWatcher);

    if (inputel.value) {
        inputel.value.removeEventListener('copy', copy_watcher);
        inputel.value.removeEventListener('cut', cut_watcher);
        inputel.value.addEventListener('paste', paste_watcher);
    }
})

function committext() {
    if (!inputel.value) return;
    const text = inputel.value.value;
    if (text.length === 0) return;

    const selection = props.selection;

    if (editor.isInComposingInput()) {
        if (editor.composingInputEnd(text)) {
            selection.setCursor(composingStartIndex + text.length, true);
        }
    } else {
        let index = selection.cursorStart;
        let end = selection.cursorEnd;
        if (index > end) {
            let t = index;
            index = end;
            end = t;
        }
        const count = editor.insertText2(text, index, end - index);
        if (count !== 0) {
            selection.setCursor(index + count, true);
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
            const selection = props.selection;
            selection.setCursor(composingStartIndex + text.length, true);
        }
    } else {
        committext();
    }
}

let composingStartIndex = 0;

function compositionstart(e: Event) {
    if (!inputel.value) return;
    const selection = props.selection;
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
        props.selection.setCursor(composingStartIndex + text.length, true);
    }
    inputel.value.value = ''
}

function compositionupdate(e: Event) {
}

function onfocusout() {
    committext();
}

function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Tab') {
        e.preventDefault();
    }
    handleKeyEvent(e, props.context, (props.shape), editor);
}

function onKeyUp(e: KeyboardEvent) {
}

function onKeyPress(e: KeyboardEvent) {
    if (e.code === 'Tab') {
        e.preventDefault();
    }
    handleKeyEvent(e, props.context, (props.shape), editor);
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