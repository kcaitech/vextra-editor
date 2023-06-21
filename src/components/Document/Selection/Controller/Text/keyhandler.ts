import { Context } from "@/context";
import { layoutText, locateCursor, locateText } from "@/layout/text";
import { TextShape } from "@kcdesign/data";
import { TextShapeEditor } from "@kcdesign/data";

const keydelays = 150;
function throttle2<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timerId: number = 0;
    return function (...args: any[]) {
        const now = Date.now();
        if (timerId + delay < now) {
            func(...args);
            timerId = now;
        }
    } as T;
}

const enterNewLine = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    let index = selection.cursorStart;
    let end = selection.cursorEnd;
    if (index > end) {
        const t = index;
        index = end;
        end = t;
    }
    const text = '\n';
    if (editor.insertText2(text, index, end - index)) {
        selection.setCursor(index + text.length, false);
    }
}, keydelays);

const enterArrowLeft = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    let start = selection.cursorStart;
    let end = selection.cursorEnd;
    if (e.shiftKey) {
        if (start === end - 1) {
            selection.setCursor(start, false);
        } else {
            // 不只选择'\n'
            if (start === end && shape.text.charAt(end - 1) === '\n') {
                start = end = end - 1;
            }
            selection.selectText(start, end - 1);
        }
    } else {
        selection.setCursor(end - 1, false);
    }
}, keydelays);
const enterArrowRight = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    let start = selection.cursorStart;
    let end = selection.cursorEnd;
    if (e.shiftKey) {
        if (start === end + 1) {
            selection.setCursor(start, false);
        } else {
            // 不只选择'\n'
            if (start === end && shape.text.charAt(end) === '\n') {
                start = end = end + 1;
            }
            selection.selectText(start, end + 1);
        }
    } else {
        selection.setCursor(end + 1, false);
    }
}, keydelays);
const enterArrowUp = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const layout = shape.getLayout(layoutText);
    const selection = context.selection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const cursorAtBefore = start === end && selection.cursorAtBefore;
    const cursor = locateCursor(layout, end, cursorAtBefore);
    if (cursor.length !== 2) return;
    const x = cursor[0].x;
    const y = cursor[0].y - (cursor[1].y - cursor[0].y) / 2;
    const locate = locateText(layout, x, y);
    if (e.shiftKey) {
        const _end = locate.index;
        // 不只选择'\n'
        if (Math.abs(start - _end) === 1 && shape.text.charAt(Math.min(start, _end)) === '\n') {
            selection.setCursor(locate.index, locate.before)
        }
        else {
            selection.selectText(start, _end);
        }
    }
    else {
        selection.setCursor(locate.index, locate.before);
    }
}, keydelays);
const enterArrowDown = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const layout = shape.getLayout(layoutText);
    const selection = context.selection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const cursorAtBefore = start === end && selection.cursorAtBefore;
    const cursor = locateCursor(layout, end, cursorAtBefore);
    if (cursor.length !== 2) return;
    const x = cursor[0].x;
    const y = cursor[1].y + (cursor[1].y - cursor[0].y) / 2;
    const locate = locateText(layout, x, y);
    if (e.shiftKey) {
        const _end = locate.index;
        // 不只选择'\n'
        if (Math.abs(start - _end) === 1 && shape.text.charAt(Math.min(start, _end)) === '\n') {
            selection.setCursor(locate.index, locate.before)
        }
        else {
            selection.selectText(start, _end);
        }
    }
    else {
        selection.setCursor(locate.index, locate.before);
    }
}, keydelays);

const enterBackspace = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    if (start === end) {
        if (editor.deleteText(start - 1, 1)) {
            selection.setCursor(start - 1, true);
        }
    }
    else {
        if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
            selection.setCursor(Math.min(start, end), true);
        }
    }
}, keydelays);
const enterDelete = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    if (start === end) {
        if (editor.deleteText(start, 1)) {
            selection.setCursor(start, false);
        }
    }
    else {
        if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
            selection.setCursor(Math.min(start, end), false);
        }
    }
}, keydelays);

const escape = throttle2((e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => {
    const selection = context.selection;
    if (selection.cursorStart > -1) {
        selection.resetSelectShapes();
        const timer = setTimeout(() => {
            selection.selectShape(shape);
            clearTimeout(timer);
        })
        context.workspace.resetCursor();
        context.workspace.contentEdit(false);
    }

}, keydelays);

const handler: { [key: string]: (e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) => void } = {}
handler['enter'] = enterNewLine;
handler['arrowleft'] = enterArrowLeft;
handler['arrowright'] = enterArrowRight;
handler['arrowup'] = enterArrowUp;
handler['arrowdown'] = enterArrowDown;
handler['backspace'] = enterBackspace;
handler['delete'] = enterDelete;
handler['escape'] = escape;

export function handleKeyEvent(e: KeyboardEvent, context: Context, shape: TextShape, editor: TextShapeEditor) {
    if (editor.isInComposingInput()) {
        return;
    }
    const key = e.key.toLowerCase();
    const h = handler[key];
    if (h) h(e, context, shape, editor);
}