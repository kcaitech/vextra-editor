import {Context} from "@/context";
import {XY} from "@/context/selection";
import {Matrix} from "@kcdesign/data";

export function get_root_points(context: Context, indexes?: number[]) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Root());
    const points = path_shape.points;
    const result: XY[] = [];
    if (indexes) {
        for (let i = 0, l = indexes.length; i < l; i++) {
            result.push(m.computeCoord3(points[indexes[i]].point));
        }
    } else {
        for (let i = 0, l = points.length; i < l; i++) {
            result.push(m.computeCoord3(points[i].point));
        }
    }
    return result;
}

export function get_parent_points(context: Context, indexes?: number[]) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Parent());
    const points = path_shape.points;
    const result: XY[] = [];
    if (indexes) {
        for (let i = 0, l = indexes.length; i < l; i++) {
            const _p = points[indexes[i]]?.point;
            if (!_p) continue;
            result.push(m.computeCoord3(_p));
        }
    } else {
        for (let i = 0, l = points.length; i < l; i++) {
            result.push(m.computeCoord3(points[i].point));
        }
    }
    return result;
}

export function get_value_from_point(context: Context, index: number) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Parent());
    const c = path_shape.points[index];
    const p = m.computeCoord3(c.point);
    return {
        x: p.x,
        y: p.y,
        r: c.cornerRadius
    }
}

export function get_num_by_event(e: Event) {
    const _val = Number((e.target as HTMLInputElement).value);
    if (isNaN(_val)) return;
    return _val;
}

export function get_value_from_points(context: Context, indexes: number[]) {
    const points = get_parent_points(context, indexes);
    if (!points?.length) return;
    let x: number | 'mix' = points[0].x;
    let y: number | 'mix' = points[0].y;
    for (let i = 1, l = points.length; i < l; i++) {
        const p = points[i];
        if (x !== 'mix' && p.x !== x) x = 'mix';
        if (y !== 'mix' && p.y !== y) y = 'mix';
        if (x === y && x === 'mix') break;
    }
    return {
        x,
        y,
        r: 0
    }
}

export function get_action_for_key_change(context: Context, val: number, key: 'x' | 'y') {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;
    const indexes = context.path.selectedPoints;
    if (!indexes.length) return;
    const __points = path_shape.points;
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Parent());
    const actions: { x: number, y: number, index: number }[] = [];
    for (let i = 0, l = indexes.length; i < l; i++) {
        const index = indexes[i];
        const _p = m.computeCoord3(__points[index].point);
        const item = {
            x: _p.x,
            y: _p.y,
            index: index
        }
        item[key] = val;
        actions.push(item);
    }
    return actions;
}