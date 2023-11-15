import {Context} from "@/context";
import {Navi} from "@/context/navigate";
import {Shape, ShapeType, SymbolShape, VariableType} from "@kcdesign/data";
import {XYsBounding} from "./common";
import {WorkSpace} from "@/context/workspace";

export type Area = number | 'artboard' | 'group' | 'normal';

export function is_shape_in_selection(shapes: Shape[], shape: Shape): boolean {
    const map: Map<string, Shape> = new Map();
    for (let i = 0; i < shapes.length; i++) {
        if (shape.id === shapes[i].id) return true;
        map.set(shapes[i].id, shapes[i])
    }

    let p = shape.parent;

    while (p && p.type !== ShapeType.Page) {
        if (map.get(p.id)) {
            return true;
        }
        p = p.parent;
    }
    return false;
}

export function selection_types(shapes: Shape[]): number {
    let types = 0;
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Artboard) {
            types = types | 2;
        } else if (shapes[i].type === ShapeType.Group) {
            types = types | 1;
        }
        if (types === 3) return types;
    }
    return types;
}

export function is_parent_unvisible(shape: Shape): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (!p.isVisible) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}

export function is_parent_locked(shape: Shape): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (p.isLocked) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}

export function is_valid_data(context: Context, shape: Shape) {
    const page = context.selection.selectedPage;
    if (!page) return false;
    if (!page.shapes.get(shape.id)) {
        context.navi.notify(Navi.SEARCHING);
        return false;
    }
    return true;
}

export function fit(context: Context, shape: Shape) {
    const m = shape.matrix2Root(), f = shape.frame, matrix = context.workspace.matrix, root = context.workspace.root;
    m.multiAtLeft(matrix);
    const points: { x: number, y: number }[] = [{x: 0, y: 0}, {x: f.width, y: 0}, {x: f.width, y: f.height}, {
        x: 0,
        y: f.height
    }];
    const box = XYsBounding(points.map(p => m.computeCoord2(p.x, p.y)));
    const width = box.right - box.left, height = box.bottom - box.top;
    const w_max = root.width, h_max = root.height;
    const ratio_w = width / w_max * 1.06, ratio_h = height / h_max * 1.12;
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        const pageViewEl = context.workspace.pageView;
        if (pageViewEl) {
            pageViewEl.classList.add('transition-400');
            context.selection.unHoverShape();
            context.selection.selectShape();
            const timer = setTimeout(() => {
                context.selection.selectShape(shape);
                pageViewEl.classList.remove('transition-400');
                clearTimeout(timer);
            }, 400);
        }
        const p_center = {x: box.left + width / 2, y: box.top + height / 2};
        const del = {x: root.center.x - p_center.x, y: root.center.y - p_center.y};
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2);
        if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 7.2) matrix.scale(1 / ratio);
        else {
            if (matrix.m00 * 1 / ratio <= 0.02) matrix.scale(0.02 / matrix.m00);
            else if (matrix.m00 * 1 / ratio >= 7.2) matrix.scale(7.2 / matrix.m00);
        }
        matrix.trans(root.width / 2, root.height / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        const pageViewEl = context.workspace.pageView;
        if (pageViewEl) {
            pageViewEl.classList.add('transition-400');
            context.selection.unHoverShape();
            context.selection.selectShape();
            const timer = setTimeout(() => {
                context.selection.selectShape(shape);
                pageViewEl.classList.remove('transition-400');
                clearTimeout(timer);
            }, 400);
        }
        const p_center = {x: box.left + width / 2, y: box.top + height / 2};
        const del = {x: root.center.x - p_center.x, y: root.center.y - p_center.y};
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}

export function fit_no_transform(context: Context, shape: Shape) {
    const m = shape.matrix2Root(), f = shape.frame, matrix = context.workspace.matrix, root = context.workspace.root;
    m.multiAtLeft(matrix);
    const points: { x: number, y: number }[] = [{x: 0, y: 0}, {x: f.width, y: 0}, {x: f.width, y: f.height}, {
        x: 0,
        y: f.height
    }];
    const box = XYsBounding(points.map(p => m.computeCoord2(p.x, p.y)));
    const width = box.right - box.left, height = box.bottom - box.top;
    const w_max = root.width, h_max = root.height;
    const ratio_w = width / w_max * 1.06, ratio_h = height / h_max * 1.12;
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        context.selection.selectShape(shape);
        const p_center = {x: box.left + width / 2, y: box.top + height / 2};
        const del = {x: root.center.x - p_center.x, y: root.center.y - p_center.y};
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2);
        if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 7.2) matrix.scale(1 / ratio);
        else {
            if (matrix.m00 * 1 / ratio <= 0.02) matrix.scale(0.02 / matrix.m00);
            else if (matrix.m00 * 1 / ratio >= 7.2) matrix.scale(7.2 / matrix.m00);
        }
        matrix.trans(root.width / 2, root.height / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        context.selection.selectShape(shape);
        const p_center = {x: box.left + width / 2, y: box.top + height / 2};
        const del = {x: root.center.x - p_center.x, y: root.center.y - p_center.y};
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}

function get_state_name(state: SymbolShape, dlt: string) {
    if (!state.parent?.isUnionSymbolShape) return state.name;
    const variables = (state.parent as SymbolShape).variables;
    if (!variables) return state.name;
    let name_slice: string[] = [];
    variables.forEach((v, k) => {
        if (v.type !== VariableType.Status) return;
        let slice = state.vartag?.get(k) || v.value;
        if (slice === SymbolShape.Default_State) slice = dlt;
        slice && name_slice.push(slice);
    })
    return name_slice.toString();
}

export function get_name(shape: Shape, dlt: string) {
    if (shape.type !== ShapeType.Symbol) {
        return shape.name;
    } else {
        return get_state_name(shape as SymbolShape, dlt);
    }
}