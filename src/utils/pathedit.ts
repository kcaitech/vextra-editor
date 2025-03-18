/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { XY } from "@/context/selection";
import { ContactLineView, CurveMode, CurvePoint, Matrix, PathShapeView, PathType, ShapeType, ShapeView, GroupShapeView, Transform } from "@kcdesign/data";
import { Action } from "@/context/tool";

export type Segment = {
    mode: CurveMode
    start: XY
    from: XY
    to: XY
    end: XY
    add: XY
    segment: number
    index: number
    is_selected: boolean
    path: string
}

export function get_parent_points(context: Context, range?: Map<number, number[]>) {
    const path_shape = context.selection.pathshape;
    if (!path_shape)  return;

    const parent = path_shape.parent!;

    let m: Transform;

    if (parent.type === ShapeType.Page) {
        m = path_shape.matrix2Root();
    } else {
        m = path_shape.matrix2Parent();
    }

    const f = path_shape.frame;
    m.preScale(f.width, f.height);

    const result: { x: number, y: number, radius: number }[] = [];
    let points: CurvePoint[] = [];

    if (range) {
        if (path_shape.pathType === PathType.Editable) {
            (path_shape as PathShapeView).segments.forEach((segment, index) => {
                exe(range, index, segment.points as CurvePoint[]);
            });
        }
    }

    for (let i = 0, l = points.length; i < l; i++) {
        const p = points[i];
        const _p = m.computeCoord3(p);
        result.push({ x: _p.x, y: _p.y, radius: p.radius || 0 });
    }

    return result;

    function exe(range: Map<number, number[]>, segment: number, __points: CurvePoint[]) {
        const indexes = range.get(segment);
        if (!indexes?.length) {
            return;
        }

        for (let i = 0; i < indexes.length; i++) {
            const p = __points[indexes[i]];
            if (p) {
                points.push(p);
            }
        }
    }
}

export function get_value_from_points(context: Context, range?: Map<number, number[]>) {
    const points = get_parent_points(context, range);
    if (!points?.length) {
        return;
    }

    let x: number | 'mix' = points[0].x;
    let y: number | 'mix' = points[0].y;
    let r: number | 'mix' = points[0].radius;

    for (let i = 1, l = points.length; i < l; i++) {
        const p = points[i];
        if (x !== 'mix' && p.x !== x) x = 'mix';
        if (y !== 'mix' && p.y !== y) y = 'mix';

        if (x === y && y === 'mix') {
            break;
        }
    }

    for (let i = 1, l = points.length; i < l; i++) {
        const p = points[i];

        if (p.radius !== r) {
            r = 'mix';
            break;
        }
    }

    return { x, y, r };
}

export function get_action_for_key_change(context: Context, val: number, key: 'x' | 'y') {
    const path_shape = context.selection.pathshape;
    if (!path_shape) {
        return;
    }
    const selected = context.path.selectedPoints;
    const parent = path_shape.parent!;

    if (parent.type === ShapeType.Page) {
        const _m = (parent.matrix2Root().inverse);
        let _p = { x: 0, y: 0 };

        _p[key] = val;

        _p = _m.computeCoord3(_p);

        val = _p[key];
    }

    const f = path_shape.frame;
    const m = (path_shape.matrix2Parent());
    m.preScale(f.width, f.height);

    const actions: { x: number, y: number, segment: number, index: number }[] = [];
    if (path_shape.pathType === PathType.Editable) {
        (path_shape as PathShapeView).segments.forEach((segment, index) => {
            exe(index, segment.points as CurvePoint[]);
        })
    }

    return actions;

    function exe(segment: number, points: CurvePoint[]) {
        const indexes = selected.get(segment);
        if (!indexes?.length) {
            return;
        }

        for (let i = 0, l = indexes.length; i < l; i++) {
            const index = indexes[i];
            const __p = points[index];
            const _p = m.computeCoord2(__p.x, __p.y);
            const item = {
                x: _p.x,
                y: _p.y,
                segment,
                index
            }
            item[key] = val;
            actions.push(item);
        }
    }
}

export function modify_point_curve_mode(context: Context, index: number) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) {
        return;
    }

    const selected = context.path.selectedPoints;

    let point: CurvePoint | undefined;

    if (path_shape.pathType === PathType.Editable) {
        selected.forEach((indexes, segment) => {
            point = (path_shape as PathShapeView).segments[segment].points[index] as CurvePoint;
        })
    }

    if (!point) {
        return;
    }

    const editor = context.editor4Shape(path_shape);

    let target_curve_mode: CurveMode;

    const _curve_mode = point.mode;

    if (_curve_mode === CurveMode.Straight || _curve_mode === CurveMode.Asymmetric) {
        target_curve_mode = CurveMode.Mirrored;
    } else {
        target_curve_mode = CurveMode.Straight
    }

    editor.modifyPointsCurveMode(selected, target_curve_mode);
}

/**
 * @description 获取当前编辑点的周围两点
 */
export function __round_curve_point(points: CurvePoint[], index: number) {
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

export function __next_points(points: CurvePoint[], index: number, is_closed: boolean) {
    if (!is_closed && index === points.length - 1) {
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

function qua2cube(p0: XY, p1: XY, p2: XY) {
    const p3 = {x: p0.x / 3 + 2 * p1.x / 3, y: p0.y / 3 + 2 * p1.y / 3}
    const p4 = {x: p2.x / 3 + 2 * p1.x / 3, y: p2.y / 3 + 2 * p1.y / 3}
    return [p0, p3, p4, p2];
}

function s_s(m: Matrix, point: CurvePoint, next: CurvePoint, segment: number, index: number, segment_set: Set<number>): Segment {
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
        segment,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} L${_next.x} ${_next.y}`
    }

}

function s_c(m: Matrix, point: CurvePoint, next: CurvePoint, segment: number, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _next_to = m.computeCoord2(next.toX || 0, next.toY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    const [start, from, to, end] = qua2cube(_p, _next_to, _next);
    const add = bezierCurvePoint(0.5, start, from, to, end);
    return {
        mode: point.mode,
        start,
        from,
        to,
        end,
        add,
        segment,
        index,
        is_selected: segment_set.has(index),
        path: `M ${start.x} ${start.y} C ${from.x} ${from.y} ${to.x} ${to.y} ${end.x} ${end.y}`
    }
}

function c_s(m: Matrix, point: CurvePoint, next: CurvePoint, segment: number, index: number, segment_set: Set<number>): Segment {
    const _p = m.computeCoord2(point.x, point.y);
    const _point_from = m.computeCoord2(point.fromX || 0, point.fromY || 0);
    const _next = m.computeCoord2(next.x, next.y);
    const [start, from, to, end] = qua2cube(_p, _point_from, _next);
    const add = bezierCurvePoint(0.5, start, from, to, end);
    return {
        mode: point.mode,
        start,
        from,
        to,
        end,
        add,
        segment,
        index,
        is_selected: segment_set.has(index),
        path: `M ${start.x} ${start.y} C ${from.x} ${from.y} ${to.x} ${to.y} ${end.x} ${end.y}`
    }
}

function c_c(m: Matrix, point: CurvePoint, next: CurvePoint, segment: number, index: number, segment_set: Set<number>): Segment {
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
        segment,
        index,
        is_selected: segment_set.has(index),
        path: `M ${_p.x} ${_p.y} C ${_point_from.x} ${_point_from.y} ${_next_to.x} ${_next_to.y} ${_next.x} ${_next.y}`
    }
}

function _segment_generator(m: Matrix, point: CurvePoint, next: CurvePoint, segment: number, index: number, segment_set: Set<number>) {
    if (point.hasFrom) {
        if (next.hasTo) {
            return c_c(m, point, next, segment, index, segment_set);
        } else {
            return c_s(m, point, next, segment, index, segment_set);
        }
    } else {
        if (next.hasTo) {
            return s_c(m, point, next, segment, index, segment_set);
        } else {
            return s_s(m, point, next, segment, index, segment_set);
        }
    }
}

export function get_segments(shape: ShapeView, matrix: Matrix, map: Map<number, number[]>): Segment[][] {
    const result_segments: Segment[][] = [];

    if (shape.pathType === PathType.Editable) {
        (shape as PathShapeView).segments.forEach((seg, index) => {
            result_segments.push(_gen(index, seg.points as CurvePoint[], seg.isClosed));
        })
    }

    return result_segments;

    function _gen(segment: number, points: CurvePoint[], isClosed: boolean) {
        if (!points?.length || points.length < 2) {
            return [];
        }

        const __seg: Segment[] = [];
        const segment_set = new Set(map.get(segment) || []);

        const m = new Matrix(matrix);
        m.preScale(shape.frame.width, shape.frame.height);
        for (let index = 0, l = points.length; index < l; index++) {
            const point = points[index];
            const next = __next_points(points, index, isClosed);
            if (!next) {
                break;
            }
            __seg.push(_segment_generator(m, point, next, segment, index, segment_set))
        }

        return __seg;
    }
}

export function enter_path_edit_mode(context: Context, event: KeyboardEvent) {
    const selected = context.selection.selectedShapes;

    if (!context.workspace.is_path_edit_mode && event.shiftKey) {
        const set = new Set<ShapeView>();
        let changed = false;
        for (const view of selected) {
            if (view.parent!.type === ShapeType.Page) {
                set.add(view);
                changed = true;
            } else {
                set.add(view.parent!);
            }
        }
        if (set.size && changed) context.selection.rangeSelectShape(Array.from(set.values()));
        return;
    }

    if (selected.length === 1) {
        const shape = selected[0];

        if (shape instanceof GroupShapeView && shape.childs.length) {
            context.selection.rangeSelectShape([...shape.childs]);
        } else {
            if (!shape.pathType || shape.isVirtualShape || shape instanceof ContactLineView) return;
            context.tool.setAction(Action.AutoV);
            context.workspace.setPathEditMode(true); // --开启对象编辑
            context.escstack.save('path-edit', () => {
                const al = context.workspace.is_path_edit_mode;
                context.workspace.setPathEditMode(false);
                return al
            });
        }
    } else {
        const target: ShapeView[] = [];
        let changed = false;
        for (const view of selected) {
            if (view instanceof GroupShapeView && view.childs.length) {
                changed = true;
                target.push(...view.childs);
            } else target.push(view);
        }
        if (changed) context.selection.rangeSelectShape(target);
    }
}