import { Context } from "@/context";
import { XY } from "@/context/selection";
import { CurveMode, CurvePoint, Matrix, PathShape } from "@kcdesign/data";

export function get_root_points(context: Context, indexes?: number[]) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    const f = path_shape.frame;
    const m = new Matrix(path_shape.matrix2Root());
    m.preScale(f.width, f.height);
    const points = path_shape.points;
    const result: XY[] = [];
    if (indexes) {
        for (let i = 0, l = indexes.length; i < l; i++) {
            const __p = points[indexes[i]];
            if (!__p) {
                continue;
            }
            result.push(m.computeCoord2(__p.x, __p.y));
        }
    } else {
        for (let i = 0, l = points.length; i < l; i++) {
            const __p = points[i];
            if (!__p) {
                continue;
            }
            result.push(m.computeCoord(__p.x, __p.y));
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
            const _p = points[indexes[i]];
            if (!_p) continue;
            result.push(m.computeCoord3(_p));
        }
    } else {
        for (let i = 0, l = points.length; i < l; i++) {
            result.push(m.computeCoord(points[i]));
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
    const p = m.computeCoord3(c);
    return {
        x: p.x,
        y: p.y,
        r: c.radius || 0
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
    const __points = context.selection.pathshape!.points;
    let r: number | 'mix' = __points[indexes[0]].radius || 0;
    for (let i = 0, l = indexes.length; i < l; i++) {
        const index = indexes[i];
        if (r !== __points[index].radius) {
            r = 'mix';
            break;
        }
    }
    return {
        x,
        y,
        r
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
        const _p = m.computeCoord3(__points[index]);
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

export function modify_point_curve_mode(context: Context, index: number, shape?: PathShape) {
    const path_shape = shape || context.selection.pathshape;
    if (!path_shape) return;
    const point = path_shape.points[index];
    if (!point) return;
    const editor = context.editor4Shape(path_shape);
    let target_curve_mode: CurveMode;
    const _curve_mode = point.mode;
    if (_curve_mode === CurveMode.Straight || _curve_mode === CurveMode.Asymmetric) {
        target_curve_mode = CurveMode.Mirrored;
    } else {
        target_curve_mode = CurveMode.Straight
    }
    editor.modifyPointsCurveMode([index], target_curve_mode);
}

/**
 * @description 获取当前编辑点的上一个点
 */
export function __previous_curve_point(shape: PathShape, index: number) {
    const points = shape.points;
    return index === 0 ? points[points.length - 1] : points[index - 1];
}

/**
 * @description 获取当前编辑点的下一个点
 */
export function __next_curve_point(shape: PathShape, index: number) {
    const points = shape.points;
    return index === points.length - 1 ? points[0] : points[index + 1];
}

/**
 * @description 获取当前编辑点的周围两点
 */
export function __round_curve_point(shape: PathShape, index: number) {
    const points = shape.points;
    const previous_index = index === 0 ? points.length - 1 : index - 1;
    const next_index = index === points.length - 1 ? 0 : index + 1;
    return {
        previous: points[previous_index],
        next: points[next_index],
        previous_index,
        next_index
    }
}
export function __angle(x1: number, y1: number, x2: number, y2: number) {
    return (Math.atan2(x2 - x1, y1 - y2) * (180 / Math.PI) + 360) % 360;
}
export function __anther_side_xy(curve_point: CurvePoint, handle_site: XY, current_side: 'from' | 'to') {
    const is_from = current_side === 'from';
    const _a_xy = { x: 0, y: 0 };
    if (curve_point.mode === CurveMode.Mirrored) {
        _a_xy.x = 2 * curve_point.x - handle_site.x;
        _a_xy.y = 2 * curve_point.y - handle_site.y;
        return _a_xy;
    } else if (curve_point.mode === CurveMode.Asymmetric) {
        _a_xy.x = is_from ? curve_point.toX || 0 : curve_point.fromX || 0;
        _a_xy.y = is_from ? curve_point.toY || 0 : curve_point.fromY || 0;
        const l = Math.hypot(_a_xy.x - curve_point.x, _a_xy.y - curve_point.y);
        const __angle = Math.atan2(handle_site.x - curve_point.x, handle_site.y - curve_point.y);
        const _l_x = Math.abs(Math.sin(__angle) * l);
        const _l_y = Math.abs(Math.cos(__angle) * l);
        const _delta_x = handle_site.x - curve_point.x;
        const _delta_y = handle_site.y - curve_point.y;
        _a_xy.x = curve_point.x - (_delta_x / Math.abs(_delta_x)) * _l_x;
        _a_xy.y = curve_point.y - (_delta_y / Math.abs(_delta_y)) * _l_y;
        return _a_xy;
    }
    _a_xy.x = is_from ? curve_point.toX || 0 : curve_point.fromX || 0;
    _a_xy.y = is_from ? curve_point.toY || 0 : curve_point.fromY || 0;
    return _a_xy;
}

export function __round_curve_point2(points: CurvePoint[], index: number) {
    const previous_index = index === 0 ? points.length - 1 : index - 1;
    const next_index = index === points.length - 1 ? 0 : index + 1;
    return {
        previous: points[previous_index],
        next: points[next_index],
    }
}
export interface Segment {
    mode: CurveMode
    start: XY
    from: XY
    to: XY
    end: XY
    add: XY
    index: number
    is_selected: boolean
}
export function get_segments(shape: PathShape, matrix: Matrix, segment_set: Set<number>) {
    const result_segments: Segment[] = [];
    const points = shape.points;
    if (!points?.length) {
        console.log('points?.length');
        return result_segments;
    }
    for (let index = 0, l = points.length; index < l; index++) {
        const point = points[index];
        const { previous, next } = __round_curve_point2(points, index);
        if (previous.mode === CurveMode.Straight && next.mode !==  CurveMode.Straight) { // 前直后曲
            
        }
    }


}