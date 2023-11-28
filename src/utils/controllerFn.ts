import { Context } from "@/context";
import { message } from "./message";
import { replace } from "./clipboard";
import { is_parent_locked, is_parent_unvisible } from "@/utils/shapelist";
import { map_from_shapes, permIsEdit } from "./content";
import { Action } from "@/context/tool";
import { AsyncTransfer, GroupShape, Shape, ShapeType, TableShape } from "@kcdesign/data";
import { ClientXY, PageXY } from "@/context/selection";
import { debounce } from "lodash";
import { WorkSpace } from "@/context/workspace";
import { Menu } from "@/context/menu";
import { compare_layer_3 } from "./group_ungroup";
import { get_symbolref_by_layer, make_symbol } from "./symbol";

export function keyboardHandle(e: KeyboardEvent, context: Context, t: Function) {
    if (!permIsEdit(context) || context.tool.action === Action.AddComment) return;
    const { target, shiftKey, ctrlKey, metaKey, altKey } = e;
    if (target instanceof HTMLInputElement) return;
    const shapes = context.selection.selectedShapes;
    if (!shapes.length) return;
    const step = shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0;
        dy = -step;
        transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0;
        dy = step;
        transform = true;
    } else if (e.code === 'BracketRight') {
        const selection = context.selection;
        if (selection.selectedShapes.length !== 1) return;
        const page = selection.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.uppper_layer(selection.selectedShapes[0]);
            if (!result) {
                message('info', t('homerightmenu.unable_upper'));
            }
        }
    } else if (e.code === 'BracketLeft') {
        const selection = context.selection;
        if (selection.selectedShapes.length !== 1) return;
        const page = selection.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.lower_layer(selection.selectedShapes[0]);
            if (!result) {
                message('info', t('homerightmenu.unable_lower'));
            }
        }
    } else if (e.code === 'Minus') {
        const selection = context.selection;
        if (selection.selectedShapes.length !== 1) return;
        const page = selection.selectedPage;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.lower_layer(selection.selectedShapes[0], 1);
            if (!result) {
                message('info', t('homerightmenu.unable_lower'));
            }
        }
    } else if (e.code === 'Equal') {
        const selection = context.selection;
        if (selection.selectedShapes.length !== 1) return;
        const page = selection.selectedPage;
        if (selection.selectedShapes.length !== 1) return;
        if (page) {
            const editor = context.editor4Page(page);
            const result = editor.uppper_layer(selection.selectedShapes[0], 1);
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
            if (context.workspace.is_path_edit_mode) {
                const points = context.path.selectedPoints;
                if (points.length) {
                    const editor = context.editor4Shape(shape);
                    const result = editor.removePoints(points);
                    result && context.path.reset_points();
                }
            } else {
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
        }
    } else if (e.code === 'KeyR') {
        if (shiftKey && (ctrlKey || metaKey)) {
            e.preventDefault();
            const selected = context.selection.selectedShapes;
            if (selected.length) replace(context, t, selected);
        }
    } else if (e.code === 'KeyX') {
        if (!(ctrlKey || metaKey) || shiftKey) return;
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
    } else if (e.code === 'KeyK') {
        if (altKey && (ctrlKey || metaKey)) {
            const symbol = make_symbol(context, t);
            if (symbol) {
                context.selection.selectShape(symbol as unknown as Shape);
            }
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
export function gen_offset_map(shape: Shape, down: PageXY) {
    const m = shape.matrix2Root(), f = shape.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);
    return {
        lt: { x: lt.x - down.x, y: lt.y - down.y },
        rb: { x: rb.x - down.x, y: rb.y - down.y },
        pivot: { x: pivot.x - down.x, y: pivot.y - down.y },
        rt: { x: rt.x - down.x, y: rt.y - down.y },
        lb: { x: lb.x - down.x, y: lb.y - down.y }
    }
}

export function pre_translate(context: Context, shapes: Shape[]) {
    context.selection.unHoverShape();
    context.workspace.setSelectionViewUpdater(false);
    context.workspace.translating(true);
    context.assist.set_trans_target(shapes);
    context.cursor.cursor_freeze(true); // 拖动过程中禁止鼠标光标切换
}
export function modify_mouse_position_by_type(update_type: number, startPosition: ClientXY, mousePosition: ClientXY,) {
    if (update_type === 3) startPosition.x = mousePosition.x, startPosition.y = mousePosition.y;
    else if (update_type === 2) startPosition.y = mousePosition.y;
    else if (update_type === 1) startPosition.x = mousePosition.x;
}

export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: Shape[], shape: Shape) {
    if (!shapes.length) return;
    const p = shape.matrix2Root().computeCoord2(4, 4);
    const map = map_from_shapes(shapes);
    const targetParent = context.selection.getClosestContainer(p, map);
    if (targetParent.id === shape.id) return;
    const m = getCloesetContainer(context, shape).id !== targetParent.id;
    if (m && asyncTransfer) {
        asyncTransfer.migrate(targetParent as GroupShape, compare_layer_3(shapes), context.workspace.t('compos.dlt'));
    }
}

// 判断当前所处的wrap
function getCloesetContainer(context: Context, shape: Shape): Shape {
    let result = context.selection.selectedPage!
    let p = shape.parent;
    while (p) {
        if (p.type == ShapeType.Artboard) return p;
        p = p.parent;
    }
    return result
}

// 迁移
export const migrate = debounce(migrate_immediate, 100);

export function end_transalte(context: Context) {
    context.workspace.translating(false);
    context.workspace.setSelectionViewUpdater(true);
    context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    context.assist.reset();
    context.workspace.setCtrl('page');
    context.cursor.cursor_freeze(false);
}
export function check_status(context: Context) {
    context.menu.menuMount(); // 关闭可能已经打开的右键菜单
    context.menu.notify(Menu.SHUTDOWN_POPOVER); // 关闭可能已经打开的弹窗
    const action = context.tool.action;
    return action === Action.AutoV || action === Action.AutoK;
}

/**
 * @description 整理选区，避免实例内部被控件修改
 * @param context
 * @param shapes
 * @returns
 */
export function modify_shapes(context: Context, shapes: Shape[]) {
    const shape_map = new Map<string, Shape>();
    let is_change = false;
    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        const symref = get_symbolref_by_layer(shape);
        if (symref) {
            shape_map.set(symref.id, symref);
            is_change = true;
        } else {
            shape_map.set(shape.id, shape);
        }
    }
    if (is_change) {
        context.selection.rangeSelectShape(Array.from(shape_map.values()));
    }
    return context.selection.selectedShapes;
}