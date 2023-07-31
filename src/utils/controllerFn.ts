import { Context } from "@/context";
import { message } from "./message";
import { replace } from "./clipaboard";
import { is_parent_locked, is_parent_unvisible } from "@/utils/shapelist";
import { permIsEdit } from "./content";

export function keyboardHandle(e: KeyboardEvent, context: Context, t: Function) {
    if (!permIsEdit(context)) return;
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
    } else if (e.code === 'BracketRight') {
        const selction = context.selection;
        if (selction.selectedShapes.length !== 1) return;
        const page = selction.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.uppper_layer(selction.selectedShapes[0]);
            if (!result) {
                message('info', t('homerightmenu.unable_upper'));
            }
        }
    } else if (e.code === 'BracketLeft') {
        const selction = context.selection;
        if (selction.selectedShapes.length !== 1) return;
        const page = selction.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.lower_layer(selction.selectedShapes[0]);
            if (!result) {
                message('info', t('homerightmenu.unable_lower'));
            }
        }
    } else if (e.code === 'Minus') {
        const selction = context.selection;
        if (selction.selectedShapes.length !== 1) return;
        const page = selction.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.lower_layer(selction.selectedShapes[0], 1);
            if (!result) {
                message('info', t('homerightmenu.unable_lower'));
            }
        }
    } else if (e.code === 'Equal') {
        const selction = context.selection;
        if (selction.selectedShapes.length !== 1) return;
        const page = selction.selectedPage;
        if (selction.selectedShapes.length !== 1) return;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.uppper_layer(selction.selectedShapes[0], 1);
            if (!result) {
                message('info', t('homerightmenu.unable_upper'));
            }
        }
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
    } else if (e.code === 'KeyR') {
        if (shiftKey && (ctrlKey || metaKey)) {
            e.preventDefault();
            const selected = context.selection.selectedShapes;
            if (selected.length) replace(context, t, selected);
        }
    } else if (e.code === 'KeyX') {
        context.workspace.clipboard.cut().then((res) => {
            if (res) {
                context.selection.resetSelectShapes();
            }
        })

    } else if (e.code === 'KeyH') {
        if (shiftKey) {
            let shapes = context.selection.selectedShapes;
            const page = context.selection.selectedPage;
            shapes = shapes.filter(s => !is_parent_unvisible(s));
            if (!page) return;
            const editor = context.editor4Page(page);
            editor.toggleShapesVisible(shapes);
            context.selection.resetSelectShapes();
        }
    } else if (e.code === 'KeyL') {
        if (shiftKey) {
            let shapes = context.selection.selectedShapes;
            const page = context.selection.selectedPage;
            shapes = shapes.filter(s => !is_parent_locked(s));
            if (!page) return;
            const editor = context.editor4Page(page);
            editor.toggleShapesLock(shapes);
            context.selection.resetSelectShapes();
        }
    }
    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape(shapes[i]);
            editor.translate(dx, dy);
        }
    }
}
export function d(s: { x: number, y: number }, e: { x: number, y: number }): number {
    const is2r = e.x - s.x;
    const is2b = e.y - s.y;
    let d = 0;
    if (is2r > 0) {
        d = d ^ 2;
    } else if (is2r < 0) {
        d = d ^ 1;
    }
    if (is2b > 0) {
        d = d ^ 8
    } else if (is2b < 0) {
        d = d ^ 4;
    }
    return d;
}