import { Context } from "@/context";
import { Navi } from "@/context/navigate";
import { Shape, ShapeType } from "@kcdesign/data";
import { createHorizontalBox } from "./common";
import { WorkSpace } from "@/context/workspace";
export type Area = number | 'artboard' | 'group' | 'normal'; // number 说明在选区内
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
    const m = shape.matrix2Root();
    const frame = shape.frame;
    const matrix = context.workspace.matrix;
    const points: [number, number][] = [];
    const _points: [number, number][] = [
        [0, 0],
        [frame.width, 0],
        [frame.width, frame.height],
        [0, frame.height]
    ]
    points.push(..._points.map(p => {
        const r = m.computeCoord(p[0], p[1]);
        const _r = matrix.computeCoord(r.x, r.y);
        return [_r.x, _r.y] as [number, number];
    }))
    const box = createHorizontalBox(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const root = context.workspace.root;
    const w_max = root.width;
    const h_max = root.height;
    const ratio_w = width / w_max * 1.06;
    const ratio_h = height / h_max * 1.12;
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
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2); // 先去中心点
        if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 7.2) { // 不能小于2%,不能大于720%
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 * 1 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            } else if (matrix.m00 * 1 / ratio >= 7.2) {
                matrix.scale(7.2 / matrix.m00);
            }
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
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}