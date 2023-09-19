import { Context } from "@/context";
import { message } from "./message";
import { replace } from "./clipboard";
import { is_parent_locked, is_parent_unvisible } from "@/utils/shapelist";
import { permIsEdit } from "./content";
import { Action } from "@/context/tool";
import { Shape, ShapeType, TableShape } from "@kcdesign/data";
import { PageXY } from "@/context/selection";

export function keyboardHandle(e: KeyboardEvent, context: Context, t: Function) {
    if (!permIsEdit(context) || context.tool.action === Action.AddComment) return;
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
            context.selection.resetSelectShapes();
        } else if (shapes.length === 1) {
            const shape = shapes[0];
            if (shape.type === ShapeType.Table) {
                const ts = context.tableSelection;
                const editor = context.editor4Table(shape as TableShape);
                if (ts.tableRowStart > -1 || ts.tableColStart > -1) {
                    editor.resetCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
                    ts.resetSelection();
                } else {
                    const editor = context.editor4Shape(shape);
                    editor.delete();
                    context.selection.resetSelectShapes();
                }
            } else {
                const editor = context.editor4Shape(shape);
                editor.delete();
                context.selection.resetSelectShapes();
            }
        }
    } else if (e.code === 'KeyR') {
        if (shiftKey && (ctrlKey || metaKey)) {
            e.preventDefault();
            const selected = context.selection.selectedShapes;
            if (selected.length) replace(context, t, selected);
        }
    } else if (e.code === 'KeyX') {
        if (!(ctrlKey || metaKey)) return;
        context.workspace.clipboard.cut().then((res) => {
            if (res) {
                context.selection.resetSelectShapes();
            }
        })
    } else if (e.code === 'KeyH') {
        if (shiftKey && (ctrlKey || metaKey)) {
            let shapes = context.selection.selectedShapes;
            const page = context.selection.selectedPage;
            shapes = shapes.filter(s => !is_parent_unvisible(s));
            if (!page) return;
            const editor = context.editor4Page(page);
            editor.toggleShapesVisible(shapes);
            context.selection.resetSelectShapes();
        }
    } else if (e.code === 'KeyL') {
        if (shiftKey && (ctrlKey || metaKey)) {
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
export function getDelta(s: Shape, p: PageXY) {
    const f2r = s.frame2Root();
    return { dx: p.x - f2r.x, dy: p.y - f2r.y };
}
export function get_speed(e1: MouseEvent, e2: MouseEvent) {
    return Math.hypot(Math.abs(e2.clientX - e1.clientX), Math.abs(e2.clientY - e1.clientY));
}
export function get_range(index1: { row: number, col: number }, index2: { row: number, col: number }) {
    const t1 = index1.row > index2.row;
    const t2 = index1.col > index2.col;
    return {
        rows: t1 ? index2.row : index1.row,
        rowe: t1 ? index1.row : index2.row,
        cols: t2 ? index2.col : index1.col,
        cole: t2 ? index1.col : index2.col,
    }
}
/**
 *          7
 *      6        8
 *  5       .        1 
 *      4        2
 *          3
 */
export type ActionDirection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export function get_direction(rotation: number) {
    if (rotation >= 0 && rotation < 22) return 0;
    else if (rotation >= 22 && rotation < 77) return 45;
    else if (rotation >= 77 && rotation < 113) return 90;
    else if (rotation >= 113 && rotation < 157) return 135;
    else if (rotation >= 157 && rotation < 200) return 180;
    else if (rotation >= 200 && rotation < 245) return 225;
    else if (rotation >= 245 && rotation < 293) return 270;
    else if (rotation >= 293 && rotation < 338) return 315;
    else if (rotation >= 338 && rotation <= 360) return 0;
    else return 0;
}