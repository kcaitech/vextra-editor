import { Context } from "@/context";
import { XY } from "@/context/selection";
import { CurveMode, CurvePoint, GroupShape, Matrix, PathShape, Shape, ShapeType } from "@kcdesign/data";
import { getHorizontalAngle } from "./common";

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
    if (!path_shape) {
        console.log('!path_shape');
        return;
    }
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Parent());
    const c = path_shape.points[index];
    if (!c) {
        console.log('!c:', index);
        return;
    }
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

export function __next_points(points: CurvePoint[], index: number, is_cloesed: boolean) {
    if (!is_cloesed && index === points.length - 1) {
        return;
    }
    const next_index = index === points.length - 1 ? 0 : index + 1;
    return points[next_index];
}

export function bezierCurvePoint(t: number, p0: XY, p1: XY, p2: XY, p3: XY): XY {
    return {
        x: Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x,
        y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y
    };
}
export function straightPoint(t: number, p0: XY, p1: XY) {
    return {
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t
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
    path: string
}
function s_s(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _next = m.computeCoord2(next.x, next.y);
    const add = straightPoint(0.5, _p, _next);
    return {
        mode: point.mode,
        start: _p,
        from: _p,
        to: _p,
        end: _next,
        add,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} L${_next.x} ${_next.y}`
    }

}
function s_c(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _next_to = m.computeCoord2(next.toX || 0, next.toY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    const add = bezierCurvePoint(0.5, _p, _p, _next_to, _next);
    return {
        mode: point.mode,
        start: _p,
        from: _p,
        to: _next_to,
        end: _next,
        add,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} C ${_p.x} ${_p.y} ${_next_to.x} ${_next_to.y} ${_next.x} ${_next.y}`
    }
}
function c_s(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _point_from = m.computeCoord2(point.fromX || 0, point.fromY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    const add = bezierCurvePoint(0.5, _p, _point_from, _next, _next);
    return {
        mode: point.mode,
        start: _p,
        from: _point_from,
        to: _next,
        end: _next,
        add,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} C ${_point_from.x} ${_point_from.y} ${_next.x} ${_next.y} ${_next.x} ${_next.y}`
    }
}
function c_c(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _point_from = m.computeCoord2(point.fromX || 0, point.fromY || 0);
    const _next_to = m.computeCoord2(next.toX || 0, next.toY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    const add = bezierCurvePoint(0.5, _p, _point_from, _next_to, _next);
    return {
        mode: point.mode,
        start: _p,
        from: _point_from,
        to: _next_to,
        end: _next,
        add,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} C ${_point_from.x} ${_point_from.y} ${_next_to.x} ${_next_to.y} ${_next.x} ${_next.y}`
    }
}
function _segmeng_generator(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, segment_set: Set<number>) {
    if (point.hasFrom) {
        if (next.hasTo) {
            return c_c(m, point, next, index, segment_set);
        } else {
            return c_s(m, point, next, index, segment_set);
        }
    } else {
        if (next.hasTo) {
            return s_c(m, point, next, index, segment_set);
        } else {
            return s_s(m, point, next, index, segment_set);
        }
    }
}

export function get_segments(shape: PathShape, matrix: Matrix, segment_set: Set<number>): Segment[] {
    const result_segments: Segment[] = [];
    const points = shape.points;
    if (!points?.length) {
        console.log('points?.length');
        return result_segments;
    }
    const m = new Matrix(matrix);
    m.preScale(shape.frame.width, shape.frame.height);
    for (let index = 0, l = points.length; index < l; index++) {
        const point = points[index];
        const next = __next_points(points, index, shape.isClosed);
        if (!next) {
            break;
        }
        result_segments.push(_segmeng_generator(m, point, next, index, segment_set))
    }
    return result_segments;
}
export interface Segment2 {
    mode: CurveMode
    start: XY
    from: XY
    to: XY
    end: XY
    index: number
    path: string
    shape: PathShape
}
function s_s2(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, shape: PathShape): Segment2 {
    const _p = m.computeCoord2(point.x, point.y);
    const _next = m.computeCoord2(next.x, next.y);
    return {
        mode: point.mode,
        start: _p,
        from: _p,
        to: _p,
        end: _next,
        index,
        shape,
        path: `M ${_p.x} ${_p.y} L${_next.x} ${_next.y}`
    }

}
function s_c2(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, shape: PathShape): Segment2 {
    const _p = m.computeCoord2(point.x, point.y);
    const _next_to = m.computeCoord2(next.toX || 0, next.toY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    return {
        mode: point.mode,
        start: _p,
        from: _p,
        to: _next_to,
        end: _next,
        index,
        shape,
        path: `M ${_p.x} ${_p.y} C ${_p.x} ${_p.y} ${_next_to.x} ${_next_to.y} ${_next.x} ${_next.y}`
    }
}
function c_s2(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, shape: PathShape): Segment2 {
    const _p = m.computeCoord2(point.x, point.y);
    const _point_from = m.computeCoord2(point.fromX || 0, point.fromY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    return {
        mode: point.mode,
        start: _p,
        from: _point_from,
        to: _next,
        end: _next,
        index,
        shape,
        path: `M ${_p.x} ${_p.y} C ${_point_from.x} ${_point_from.y} ${_next.x} ${_next.y} ${_next.x} ${_next.y}`
    }
}
function c_c2(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, shape: PathShape): Segment2 {
    const _p = m.computeCoord2(point.x, point.y);
    const _point_from = m.computeCoord2(point.fromX || 0, point.fromY || 0);
    const _next_to = m.computeCoord2(next.toX || 0, next.toY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    return {
        mode: point.mode,
        start: _p,
        from: _point_from,
        to: _next_to,
        end: _next,
        index,
        shape,
        path: `M ${_p.x} ${_p.y} C ${_point_from.x} ${_point_from.y} ${_next_to.x} ${_next_to.y} ${_next.x} ${_next.y}`
    }
}
function _segmeng_generator2(m: Matrix, point: CurvePoint, next: CurvePoint, index: number, shape: PathShape) {
    if (point.hasFrom) {
        if (next.hasTo) {
            return c_c2(m, point, next, index, shape);
        } else {
            return c_s2(m, point, next, index, shape);
        }
    } else {
        if (next.hasTo) {
            return s_c2(m, point, next, index, shape);
        } else {
            return s_s2(m, point, next, index, shape);
        }
    }
}
export function get_segments2(shape: PathShape | GroupShape, matrices: Map<string, Matrix>) {
    const result_segments: Segment2[] = [];
    if (shape instanceof PathShape) {
        const m = matrices.get(shape.id);
        if (!m) {
            console.log('!m');
            return result_segments;
        }
        _exe(shape, result_segments, m);
        return result_segments;
    }
    const shapes = shape.childs;
    if (!shapes?.length) {
        console.log('points?.length');
        return result_segments;
    }
    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        if (shape instanceof GroupShape) {
            result_segments.push(...get_segments2(shape, matrices));
            continue;
        }
        if (!(shape instanceof PathShape)) {
            continue;
        }
        const m = matrices.get(shape.id);
        if (!m) {
            continue;
        }
        _exe(shape, result_segments, m);
    }
    return result_segments;

    function _exe(__s: PathShape, container: Segment2[], matrix: Matrix) {
        const points = __s.points;
        if (!points?.length) {
            console.log('points?.length');
            return;
        }
        const m = new Matrix(matrix);
        m.preScale(__s.frame.width, __s.frame.height);
        for (let index = 0, l = points.length; index < l; index++) {
            const point = points[index];
            const next = __next_points(points, index, __s.isClosed);
            if (!next) {
                break;
            }
            container.push(_segmeng_generator2(m, point, next, index, __s));
        }
    }
}