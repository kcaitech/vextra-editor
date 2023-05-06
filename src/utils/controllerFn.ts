import { Context } from "@/context"

export function keyboardHandle(e: KeyboardEvent, context: Context) {
    const shapes = context.selection.selectedShapes;
    if (!shapes.length) return;
    const step = e.shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step, dy = 0, transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step, dy = 0, transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0, dy = -step, transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0, dy = step, transform = true;
    } else if (e.code === 'Backspace') { // 删除图层
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape(shapes[i]);
            editor.delete();
        }
        context.selection.selectShape();
    }
    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape(shapes[i]);
            editor.translate(dx, dy)
        }
    }
}