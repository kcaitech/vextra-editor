import { Context } from "@/context";
import { Text, Shape, TextShapeView, TableCellView } from "@kcdesign/data";
import { TextShapeEditor } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";

const keydelays = 15;
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

const enterNewLine = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const selection = context.textSelection;
    let index = selection.cursorStart;
    let end = selection.cursorEnd;
    if (index > end) {
        const t = index;
        index = end;
        end = t;
    }

    const count = editor.insertTextForNewLine(index, end - index);
    if (count !== 0) {
        selection.setCursor(index + count, false);
    }
}, keydelays);

const enterArrowLeft = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const shapetext = shape.getText();
    const selection = context.textSelection;
    let start = selection.cursorStart;
    let end = selection.cursorEnd;
    if (e.shiftKey) {
        if (start === end - 1) {
            const span = shapetext.spanAt(start);
            if (span?.placeholder && span.length === 1) start--;
            selection.setCursor(start, false);
        } else {
            selection.selectText(start, end - 1);
        }
    } else {
        const span = shapetext.spanAt(end - 1);
        if (span?.placeholder && span.length === 1) {
            if (end - 1 <= 0) end = 2;
            else end--;
        }
        selection.setCursor(end - 1, false);
    }
}, keydelays);
const enterArrowRight = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const shapetext = shape.getText();
    const selection = context.textSelection;
    let start = selection.cursorStart;
    let end = selection.cursorEnd;
    if (e.shiftKey) {
        if (start === end + 1) {
            const span = shapetext.spanAt(start);
            if (span?.placeholder && span.length === 1) start++;
            selection.setCursor(start, false);
        } else {
            selection.selectText(start, end + 1);
        }
    } else {
        const span = shapetext.spanAt(end + 1);
        if (span?.placeholder && span.length === 1) end++;
        selection.setCursor(end + 1, false);
    }
}, keydelays);
const enterArrowUp = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const selection = context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const cursorAtBefore = start === end && selection.cursorAtBefore;
    const cursor = shape.locateCursor(end, cursorAtBefore);
    if (!cursor || cursor.cursorPoints.length !== 2) return;
    const x = cursor.cursorPoints[0].x;
    const y = cursor.preLineY + (cursor.preLineHeight) / 2;
    const locate = shape.locateText(x, y);
    if (e.shiftKey) {
        selection.selectText(start, locate.index);
    }
    else {
        if (locate.placeholder) selection.setCursor(locate.index + 1, false);
        else selection.setCursor(locate.index, locate.before);
    }
}, keydelays);
const enterArrowDown = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const selection = context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    const cursorAtBefore = start === end && selection.cursorAtBefore;
    const cursor = shape.locateCursor(end, cursorAtBefore);
    if (!cursor || cursor.cursorPoints.length !== 2) return;
    const x = cursor.cursorPoints[0].x;
    const y = cursor.nextLineY + (cursor.nextLineHeight) / 2;
    const locate = shape.locateText(x, y);
    if (e.shiftKey) {
        selection.selectText(start, locate.index);
    }
    else {
        if (locate.placeholder) selection.setCursor(locate.index + 1, false);
        else selection.setCursor(locate.index, locate.before);
    }
}, keydelays);

const enterBackspace = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const shapetext = shape.getText();
    const selection = context.textSelection;
    const start = selection.cursorStart;
    const end = selection.cursorEnd;
    if (start === end) {
        if (start === 0) {
            const firstChar = shapetext.charAt(0);
            if (firstChar === '\n') {
                if (editor.deleteText(start, 1)) {
                    const index = start;
                    const preChar = shapetext.charAt(index - 1);
                    selection.setCursor(index, preChar !== '\n');
                }
            }
        }
        else if (editor.deleteText(start - 1, 1)) {
            const index = start - 1;
            const preChar = shapetext.charAt(index - 1);
            selection.setCursor(index, preChar !== '\n');
        }
    }
    else {
        if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
            const index = Math.min(start, end);
            const preChar = shapetext.charAt(index - 1);
            selection.setCursor(index, preChar !== '\n');
        }
    }
}, keydelays);
const enterDelete = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const selection = context.textSelection;
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

const escape = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    e.preventDefault();
    const selection = context.textSelection;
    if (selection.cursorStart > -1) {
        context.selection.resetSelectShapes();
        const timer = setTimeout(() => {
            const s = context.selection.selectedPage?.getShape(editor.shape.id);
            context.selection.selectShape(s);
            // clearTimeout(timer);
        })
        context.cursor.reset();
        context.workspace.contentEdit(false);
    }

}, keydelays);

function copy(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) {
    context.menu.menuMount();
    // if (e.ctrlKey || e.metaKey) {
    //     e.preventDefault();
    //     const selection = context.textSelection;
    //     const start = selection.cursorStart;
    //     const end = selection.cursorEnd;
    //     if (start === end) return;
    //     const s = Math.min(start, end);
    //     const len = Math.abs(start - end)
    //     const text = shapetext.getTextWithFormat(s, len);
    //     context.workspace.clipboard.write2(e as unknown as ClipboardEvent, text);
    //     context.menu.menuMount();
    // }
}
async function cut(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        context.workspace.notify(WorkSpace.DELETE_LINE);
    }
    context.menu.menuMount();
    // if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
    //     e.preventDefault();
    //     const selection = context.textSelection;
    //     const start = selection.cursorStart;
    //     const end = selection.cursorEnd;
    //     if (start === end) return;
    //     const text = shapetext.getTextWithFormat(Math.min(start, end), Math.abs(start - end));
    //     const copy_result = await context.workspace.clipboard.write(text);
    //     if (copy_result) {
    //         if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
    //             selection.setCursor(Math.min(start, end), false);
    //         }
    //     }
    //     context.menu.menuMount();
    // } else if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
    //     context.workspace.notify(WorkSpace.DELETE_LINE);
    // }
}
function paster(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) {
    // if (e.ctrlKey || e.metaKey) {
    //     e.preventDefault(); // 阻止input的粘贴事件
    //     paster_inner_shape(context, editor, e.altKey);
    //     context.menu.menuMount();
    // }
    context.menu.menuMount();
}
function select_all(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const shapetext = shape.getText();
        const selection = context.textSelection;
        const end = shapetext.length;
        selection.selectText(0, end);
        context.menu.menuMount();
    }
}
function undo_redo(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView) {
    const { ctrlKey, metaKey, shiftKey } = e;
    if (ctrlKey || metaKey) {
        const shapetext = shape.getText();
        e.preventDefault();
        const repo = context.repo;
        if (shiftKey) {
            repo.canRedo() && repo.redo();
        } else {
            repo.canUndo() && repo.undo();
        }
        const selection = context.textSelection;
        const len = shapetext.length;
        if (selection.cursorEnd >= len) {
            selection.setCursor(len - 1, false);
        }
    }
}

const enterTab = throttle2((e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => {
    const selection = context.textSelection;
    const start = Math.min(selection.cursorStart, selection.cursorEnd);
    const end = Math.max(selection.cursorStart, selection.cursorEnd);
    const offset = e.shiftKey ? -1 : 1;
    editor.offsetParaIndent(offset, start, end - start);

}, keydelays);
// 文本下划线
const Underline = (e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView) => {
    const { ctrlKey, metaKey, shiftKey } = e;
    if ((ctrlKey || metaKey) && !shiftKey) {
        e.preventDefault();
        context.workspace.notify(WorkSpace.UNDER_LINE);
    }
}
//文本倾斜
const Italic = (e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView) => {
    const { ctrlKey, metaKey, shiftKey } = e;
    if ((ctrlKey || metaKey) && !shiftKey) {
        e.preventDefault();
        context.workspace.notify(WorkSpace.ITALIC);
    }
}
//文本加粗
const Bold = (e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView) => {
    const { ctrlKey, metaKey, shiftKey } = e;
    if ((ctrlKey || metaKey) && !shiftKey) {
        e.preventDefault();
        context.workspace.notify(WorkSpace.BOLD);
    }
}

const handler: { [key: string]: (e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) => void } = {}
handler['enter'] = enterNewLine;
handler['arrowleft'] = enterArrowLeft;
handler['arrowright'] = enterArrowRight;
handler['arrowup'] = enterArrowUp;
handler['arrowdown'] = enterArrowDown;
handler['backspace'] = enterBackspace;
handler['delete'] = enterDelete;
handler['escape'] = escape;
handler['c'] = copy;
handler['x'] = cut;
handler['v'] = paster;
handler['√'] = paster;
handler['a'] = select_all;
handler['z'] = undo_redo;
handler['tab'] = enterTab;
handler['u'] = Underline;
handler['i'] = Italic;
handler['b'] = Bold;
// todo end home


export function handleKeyEvent(e: KeyboardEvent, context: Context, shape: TextShapeView | TableCellView, editor: TextShapeEditor) {
    if (editor.isInComposingInput()) {
        return;
    }
    const key = e.key.toLowerCase();
    const h = handler[key];
    if (h) {
        h(e, context, shape, editor);
    }
}