import { Context } from "@/context"

export function keyboardHandle(e: KeyboardEvent, context: Context) {
    const { target, shiftKey, ctrlKey, metaKey } = e;
    if (target instanceof HTMLInputElement) return;
    const shapes = context.selection.selectedShapes;
    if (!shapes.length) return;
    const step = shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step, dy = 0, transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step, dy = 0, transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0, dy = -step, transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0, dy = step, transform = true;
    } else if (e.code === 'Backspace' || e.code === 'Delete') { // 删除图层
        if (ctrlKey || metaKey) return;
        if (shapes.length > 1) {
            const page = context.selection.selectedPage;
            if (page) {
                const editor = context.editor4Page(page);
                editor.delete_batch(shapes);
            }
        } else {
            const editor = context.editor4Shape(shapes[0]);
            editor.delete();
        }
        context.selection.resetSelectShapes();
    } else if (e.code === 'Escape') {
        context.selection.resetSelectShapes();
    }
    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape(shapes[i]);
            editor.translate(dx, dy);
        }
    }
}