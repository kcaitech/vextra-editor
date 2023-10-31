import { Context } from "@/context";
import { PT1, PT2, PT4P1, PT4P2, PageXY2, PointGroup1, PointGroup2, Asssit } from "@/context/assist";
import { PageXY } from "@/context/selection";
import { GroupShape, Matrix, Shape, ShapeType } from "@kcdesign/data";
import { debounce } from "lodash";
import { XYsBounding } from "./common";

enum Align {
    LT_X = 'lt_x',
    RT_X = 'rt_x',
    C_X = 'c_x',
    RB_X = 'rb_x',
    LB_X = 'lb_x',
    LT_Y = 'lt_y',
    RT_Y = 'rt_y',
    C_Y = 'c_y',
    RB_Y = 'rb_y',
    LB_Y = 'lb_y'
}

const get_pos: { [key: string]: (shape: Shape) => number } = {};
get_pos[Align.LT_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, 0).x;
}
get_pos[Align.RT_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).x;
}
get_pos[Align.C_X] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).x;
}
get_pos[Align.RB_X] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width, f.height).x;
}
get_pos[Align.LB_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).x;
}
get_pos[Align.LT_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, 0).y;
}
get_pos[Align.RT_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).y;
}
get_pos[Align.C_Y] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).y;
}
get_pos[Align.RB_Y] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width, f.height).y;
}
get_pos[Align.LB_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).y;
}

export function distance2apex(shape: Shape, align: Align): number {
    return get_pos[align](shape);
}

const get_pos2: { [key: string]: (frame: Point[]) => number } = {};
get_pos2[Align.LT_X] = function (frame: Point[]) {
    return frame[0].x;
}
get_pos2[Align.RT_X] = function (frame: Point[]) {
    return frame[1].x;
}
get_pos2[Align.C_X] = function (frame: Point[]) {
    return (frame[0].x + frame[2].x) / 2;
}
get_pos2[Align.RB_X] = function (frame: Point[]) {
    return frame[2].x;
}
get_pos2[Align.LB_X] = function (frame: Point[]) {
    return frame[3].x;
}
get_pos2[Align.LT_Y] = function (frame: Point[]) {
    return frame[0].y;
}
get_pos2[Align.RT_Y] = function (frame: Point[]) {
    return frame[1].y;
}
get_pos2[Align.C_Y] = function (frame: Point[]) {
    return (frame[0].y + frame[2].y) / 2;
}
get_pos2[Align.RB_Y] = function (frame: Point[]) {
    return frame[2].y;
}
get_pos2[Align.LB_Y] = function (frame: Point[]) {
    return frame[3].y;
}

export function distance2apex2(frame: Point[], align: Align): number {
    return get_pos2[align](frame);
}

export function get_apex(context: Context, shape: Shape, is_multi: boolean, align: Align) {
    if (!is_multi) {
        return distance2apex(shape, align);
    } else {
        return distance2apex2(context.workspace.controllerFrame, align);
    }
}

/**
 * @description 判断两数是否相等
 * @param a
 * @param b
 */
export function is_equal(a: number, b: number) {
    return Math.abs(a - b) < 0.001;
}

/**
 * @description 收集时使用
 */
export function colloct_point_group(host: Shape): PointGroup1 {
    const m = host.matrix2Root(), f = host.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    if (host.type === ShapeType.Line) {
        const apexX = [lt.x, rb.x, pivot.x];
        const apexY = [lt.y, rb.y, pivot.y];
        return { lt, rb, pivot, apexX, apexY };
    }
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);
    const apexX = [lt.x, rt.x, rb.x, lb.x, pivot.x];
    const apexY = [lt.y, rt.y, rb.y, lb.y, pivot.y];
    const pg: PointGroup1 = { lt, rt, rb, lb, pivot, apexX, apexY };
    if (host.type === ShapeType.Artboard) {
        const th = m.computeCoord2(f.width / 2, 0);
        const rh = m.computeCoord2(f.width, f.height / 2);
        const bh = m.computeCoord2(f.width / 2, f.height);
        const lh = m.computeCoord2(0, f.height / 2);
        apexX.push(th.x, rh.x, bh.x, lh.x);
        apexY.push(th.y, rh.y, bh.y, lh.y);
        pg.th = th, pg.rh = rh, pg.bh = bh, pg.lh = lh;
    }
    return pg;
}

/**
 * @description 比对时使用
 */
export function gen_match_points(host: Shape, multi?: boolean): PointGroup2 {
    const m = host.matrix2Root(), f = host.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);
    const apexX = [lt.x, rt.x, rb.x, lb.x, pivot.x];
    const apexY = [lt.y, rt.y, rb.y, lb.y, pivot.y];
    const pg: PointGroup2 = { lt, rt, rb, lb, pivot };
    if (multi) {
        pg.top = Math.min(...apexY), pg.right = Math.max(...apexX), pg.bottom = Math.max(...apexY), pg.left = Math.min(...apexX), pg.cy = pivot.y, pg.cx = pivot.x;
    }
    return pg;
}

export interface PointsOffset {
    lt: PageXY
    rb: PageXY
    pivot: PageXY
    rt: PageXY
    lb: PageXY
}

export function gen_match_points_by_map(offset: PointsOffset, p: PageXY, multi?: boolean) {
    const lt = { x: p.x + offset.lt.x, y: p.y + offset.lt.y };
    const rb = { x: p.x + offset.rb.x, y: p.y + offset.rb.y };
    const pivot = { x: p.x + offset.pivot.x, y: p.y + offset.pivot.y };
    const rt = { x: p.x + offset.rt.x, y: p.y + offset.rt.y };
    const lb = { x: p.x + offset.lb.x, y: p.y + offset.lb.y };
    const apexX = [lt.x, rt.x, rb.x, lb.x, pivot.x];
    const apexY = [lt.y, rt.y, rb.y, lb.y, pivot.y];
    const pg: PointGroup2 = { lt, rt, rb, lb, pivot };
    if (multi) {
        pg.top = Math.min(...apexY), pg.right = Math.max(...apexX), pg.bottom = Math.max(...apexY), pg.left = Math.min(...apexX), pg.cy = pivot.y, pg.cx = pivot.x;
    }
    return pg;
}

export function isShapeOut(context: Context, shape: Shape) {
    const { x, y, bottom, right } = context.workspace.root;
    const { width, height } = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(context.workspace.matrix);
    const point: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }].map(p => m.computeCoord2(p.x, p.y));
    return Math.min(point[0].x, point[1].x, point[2].x, point[3].x) > right - x ||
        Math.max(point[0].x, point[1].x, point[2].x, point[3].x) < 0 ||
        Math.max(point[0].y, point[1].y, point[2].y, point[3].y) < 0 ||
        Math.min(point[0].y, point[1].y, point[2].y, point[3].y) > bottom - y;
}

export function finder(context: Context, scope: GroupShape, all_pg: Map<string, PointGroup1>, x_axis: Map<number, PageXY2[]>, y_axis: Map<number, PageXY2[]>) {
    let result: Shape[] = [];
    if (scope.type === ShapeType.Artboard) {
        result.push(scope);
        const pg = colloct_point_group(scope);
        all_pg.set(scope.id, pg);
        const pvs = Object.values(pg);
        for (let i = 0, len = pvs.length; i < len; i++) {
            const p2 = { id: scope.id, p: pvs[i] };
            const x = x_axis.get(p2.p.x);
            const y = y_axis.get(p2.p.y);
            if (x) x.push(p2); else x_axis.set(p2.p.x, [p2]);
            if (y) y.push(p2); else y_axis.set(p2.p.y, [p2]);
        }
    }
    const cs = scope.childs;
    for (let i = 0; i < cs.length; i++) {
        const c = cs[i];
        if (isShapeOut(context, c) || c.type === ShapeType.Contact) continue;
        result.push(c);
        const pg = colloct_point_group(c);
        all_pg.set(c.id, pg);
        const pvs = Object.values(pg);
        for (let i = 0, len = pvs.length; i < len; i++) {
            const p2 = { id: c.id, p: pvs[i] };
            const x = x_axis.get(p2.p.x);
            const y = y_axis.get(p2.p.y);
            if (x) x.push(p2); else x_axis.set(p2.p.x, [p2]);
            if (y) y.push(p2); else y_axis.set(p2.p.y, [p2]);
        }
        if (c instanceof GroupShape && c.type === ShapeType.Group) result = result.concat(finder(context, c, all_pg, x_axis, y_axis));
    }
    return result;
}

export function getClosestAB(shape: Shape) {
    let resust: GroupShape = shape.parent as GroupShape;
    while (resust && resust.type !== ShapeType.Artboard) {
        resust = resust.parent as GroupShape;
    }
    return resust;
}

export function _collect(context: Context, new_matrix: Matrix) {
    context.assist.collect();
    context.assist.set_stickness(Math.ceil(5 / new_matrix.m00));
}

export function modify_pt_x(pre_target1: PT1, s_pg: PointGroup2, apexX: number[], stickness: number) {
    for (let i = 0, len = apexX.length; i < len; i++) {
        const x = apexX[i]
        const delta1 = Math.abs(x - s_pg.lt.x);
        if (delta1 < stickness && (pre_target1.delta === undefined || delta1 < pre_target1.delta)) {
            pre_target1.delta = delta1, pre_target1.x = x, pre_target1.sy = s_pg.lt.y, pre_target1.align = Align.LT_X;
        }
        const delta2 = Math.abs(x - s_pg.pivot.x);
        if (delta2 < stickness && (pre_target1.delta === undefined || delta2 < pre_target1.delta)) {
            pre_target1.delta = delta2, pre_target1.x = x, pre_target1.sy = s_pg.pivot.y, pre_target1.align = Align.C_X;
        }
        const delta3 = Math.abs(x - s_pg.rb.x)
        if (delta3 < stickness && (pre_target1.delta === undefined || delta3 < pre_target1.delta)) {
            pre_target1.delta = delta3, pre_target1.x = x, pre_target1.sy = s_pg.rb.y, pre_target1.align = Align.RB_X;
        }
        const delta4 = Math.abs(x - s_pg.lb.x);
        if (delta4 < stickness && (pre_target1.delta === undefined || delta4 < pre_target1.delta)) {
            pre_target1.delta = delta4, pre_target1.x = x, pre_target1.sy = s_pg.lb.y, pre_target1.align = Align.LB_X;
        }
        const delta5 = Math.abs(x - s_pg.rt.x);
        if (delta5 < stickness && (pre_target1.delta === undefined || delta5 < pre_target1.delta)) {
            pre_target1.delta = delta5, pre_target1.x = x, pre_target1.sy = s_pg.rt.y, pre_target1.align = Align.RT_X;
        }
    }
}

export function modify_pt_y(pre_target2: PT2, s_pg: PointGroup2, apexY: number[], stickness: number) {
    for (let i = 0, len = apexY.length; i < len; i++) {
        const y = apexY[i];
        const delta1 = Math.abs(y - s_pg.lt.y);
        if (delta1 < stickness && (pre_target2.delta === undefined || delta1 < pre_target2.delta)) {
            pre_target2.delta = delta1, pre_target2.y = y, pre_target2.sx = s_pg.lt.x, pre_target2.align = Align.LT_Y;
        }
        const delta2 = Math.abs(y - s_pg.pivot.y);
        if (delta2 < stickness && (pre_target2.delta === undefined || delta2 < pre_target2.delta)) {
            pre_target2.delta = delta2, pre_target2.y = y, pre_target2.sx = s_pg.pivot.x, pre_target2.align = Align.C_Y;
        }
        const delta3 = Math.abs(y - s_pg.rb.y);
        if (delta3 < stickness && (pre_target2.delta === undefined || delta3 < pre_target2.delta)) {
            pre_target2.delta = delta3, pre_target2.y = y, pre_target2.sx = s_pg.rb.x, pre_target2.align = Align.RB_Y;
        }
        const delta4 = Math.abs(y - s_pg.lb.y);
        if (delta4 < stickness && (pre_target2.delta === undefined || delta4 < pre_target2.delta)) {
            pre_target2.delta = delta4, pre_target2.y = y, pre_target2.sx = s_pg.lb.x, pre_target2.align = Align.LB_Y;
        }
        const delta5 = Math.abs(y - s_pg.rt.y);
        if (delta5 < stickness && (pre_target2.delta === undefined || delta5 < pre_target2.delta)) {
            pre_target2.delta = delta5, pre_target2.y = y, pre_target2.sx = s_pg.rt.x, pre_target2.align = Align.RT_Y;
        }
    }
}

export function modify_pt_x4p(pre_target1: PT4P1, p: PageXY, apexX: number[], stickness: number) {
    for (let i = 0, len = apexX.length; i < len; i++) {
        const x = apexX[i]
        const delta = Math.abs(x - p.x);
        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta, pre_target1.x = x, pre_target1.sy = p.y;
        }
    }
}

export function modify_pt_y4p(pre_target2: PT4P2, p: PageXY, apexY: number[], stickness: number) {
    for (let i = 0, len = apexY.length; i < len; i++) {
        const y = apexY[i]
        const delta = Math.abs(y - p.y);
        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta, pre_target2.y = y, pre_target2.sx = p.x;
        }
    }
}

export function modify_pt_x4create(pre_target1: PT4P1, p: PageXY, apexX: number[], stickness: number) {
    for (let i = 0, len = apexX.length; i < len; i++) {
        const x = apexX[i]
        const delta = Math.abs(x - p.x);
        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta, pre_target1.x = x, pre_target1.sy = p.y;
        }
    }
}

export function modify_pt_y4create(pre_target2: PT4P2, p: PageXY, apexY: number[], stickness: number) {
    for (let i = 0, len = apexY.length; i < len; i++) {
        const y = apexY[i]
        const delta = Math.abs(y - p.y);
        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta, pre_target2.y = y, pre_target2.sx = p.x;
        }
    }
}

export function get_tree(shape: Shape, init: Map<string, Shape>) {
    init.set(shape.id, shape);
    if (shape.type !== ShapeType.Table) {
        const cs = shape.childs;
        if (cs && cs.length) for (let i = 0, len = cs.length; i < len; i++) get_tree(cs[i], init);
    }
}

export const collect_once = debounce(_collect, 100);

interface Point {
    x: number
    y: number
}

export function get_pg_by_frame(frame: Point[], multi?: boolean): PointGroup2 { // 无旋转
    const lt = frame[0], rt = frame[1], rb = frame[2], lb = frame[3];
    const pivot = { x: lt.x + (rb.x - lt.x) / 2, y: lt.y + (rb.y - lt.y) / 2 };
    const apexX = [lt.x, rt.x, rb.x, lb.x, pivot.x];
    const apexY = [lt.y, rt.y, rb.y, lb.y, pivot.y];
    if (multi) {
        return {
            lt, rt, rb, lb, pivot,
            top: Math.min(...apexY),
            right: Math.max(...apexX),
            bottom: Math.max(...apexY),
            left: Math.min(...apexX),
            cy: pivot.y,
            cx: pivot.x
        }
    } else {
        return { lt, rt, rb, lb, pivot };
    }
}

export function get_frame(shapes: Shape[]): Point[] {
    const points: { x: number, y: number }[] = [];
    for (let i = 0, len = shapes.length; i < len; i++) {
        const s = shapes[i];
        const m = s.matrix2Root();
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }];
        for (let i = 0; i < 4; i++) points.push(m.computeCoord3(ps[i]));
    }
    const b = XYsBounding(points);
    return [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
}

/**
 * @description 根据x值在点图中寻找与之相等的点
 */
export function get_p_form_pg_by_x(pg: PointGroup2, x: number): PageXY[] {
    const result: PageXY[] = [];
    if (is_equal(pg.lt.x, x)) result.push(pg.lt);
    if (is_equal(pg.rt.x, x)) result.push(pg.rt);
    if (is_equal(pg.rb.x, x)) result.push(pg.rb);
    if (is_equal(pg.lb.x, x)) result.push(pg.lb);
    if (is_equal(pg.pivot.x, x)) result.push(pg.pivot);
    return result;
}

/**
 * @description 根据y值在点图中寻找与之相等的点
 */
export function get_p_form_pg_by_y(pg: PointGroup2, y: number): PageXY[] {
    const result: PageXY[] = [];
    if (is_equal(pg.lt.y, y)) result.push(pg.lt);
    if (is_equal(pg.rt.y, y)) result.push(pg.rt);
    if (is_equal(pg.rb.y, y)) result.push(pg.rb);
    if (is_equal(pg.lb.y, y)) result.push(pg.lb);
    if (is_equal(pg.pivot.y, y)) result.push(pg.pivot);
    return result;
}

/**
 * @description 辅助线预备渲染
 * @param is_multi
 */
export function pre_render_assist_line(context: Context, is_multi: boolean, shape: Shape, shapes: Shape[]) {
    const assist = context.assist;
    if (is_multi) {
        const cache_map = context.workspace.cache_map;
        if (cache_map) {
            context.workspace.revert_frame_by_map(shapes[0]);
        } else {
            const fs = get_frame(shapes);
            context.workspace.gen_chahe_map_by_shape_one(shapes[0], fs);
            context.workspace.setCFrame(fs);
        }
        const fs = context.workspace.controllerFrame;
        assist.setCPG(get_pg_by_frame(fs, true));
    } else {
        assist.setCPG(gen_match_points(shape, true));
    }
    assist.notify(Asssit.UPDATE_ASSIST);
    assist.notify(Asssit.UPDATE_MAIN_LINE);
}

// 标注相对位置
enum Direction {
    TL = 'Top-Left',
    T = 'Top',
    L = 'Left',
    TR = 'Top-Right',
    C = 'Center',
    R = 'Right',
    BL = 'Bottom-Left',
    B = 'Bottom',
    BR = 'Bottom-Right'
}

//边
enum Sides {
    Top = 'top',
    Left = 'left',
    Bottom = 'bottom',
    Right = 'right'
}

/**
 *  @description 一个图形相对于另一个图形的位置
 *  @param
 * */
export function get_graph_relative_posi(sp: { x: number, y: number }[], hp: { x: number, y: number }[]) {
    if (sp.length === 0 || hp.length === 0) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;

    const relativeDirection = {
        horizontal: Direction.C,
        vertical: Direction.C,
    };

    if (sb <= ht || (sb > ht && st < ht && sb < hb)) relativeDirection.vertical = Direction.B;
    if ((st > ht && sb < hb) || (st < ht && sb > hb)) relativeDirection.vertical = Direction.C;
    if (st >= hb || (sb > hb && st < hb && st > ht)) relativeDirection.vertical = Direction.T;
    if (sl >= hr || (sl > hl && sl < hr && sr > hr)) relativeDirection.horizontal = Direction.L;
    if ((sl > hl && sr < hr) || (sl < hl && sr > hr)) relativeDirection.horizontal = Direction.C;
    if (sr <= hl || (sl < hl && sr < hr && sr > hl)) relativeDirection.horizontal = Direction.R;

    let result
    if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.C) {
        result = Direction.C;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.C) {
        result = Direction.L;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.C) {
        result = Direction.R;
    } else if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.T) {
        result = Direction.T;
    } else if (relativeDirection.horizontal === Direction.C && relativeDirection.vertical === Direction.B) {
        result = Direction.B;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.T) {
        result = Direction.TL;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.T) {
        result = Direction.TR;
    } else if (relativeDirection.horizontal === Direction.R && relativeDirection.vertical === Direction.B) {
        result = Direction.BR;
    } else if (relativeDirection.horizontal === Direction.L && relativeDirection.vertical === Direction.B) {
        result = Direction.BL;
    }
    return result;
}

/**
 *  @description 获取选中图层边的中心点
 * */

function get_select_sides_midpoint(posi: { x: number, y: number }[]) {
    if (posi.length === 0) return;
    const xc = (posi[0].x + posi[1].x) / 2;
    const yc = (posi[0].y + posi[2].y) / 2;
    return { xc, yc };
}
/**
 *  @description 获取hover图形相对方向上最近的边的位置,两条边的情况
 * */

function get_hovered_sides_dir(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sides: { s1: Sides, s2: Sides } = { s1: Sides.Bottom, s2: Sides.Left };
    if (dir === Direction.TR) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.TL) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    } else if (dir === Direction.BL) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    } else if (dir === Direction.BR) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.T) {
        sides.s1 = st > hb ? Sides.Bottom : Sides.Top;
    } else if (dir === Direction.R) {
        sides.s2 = sr < hl ? Sides.Left : Sides.Right;
    } else if (dir === Direction.B) {
        sides.s1 = sb > ht ? Sides.Bottom : Sides.Top;
    } else if (dir === Direction.L) {
        sides.s2 = sl < hr ? Sides.Left : Sides.Right;
    }
    return sides;
}
/**
 *  @description 获取实线的点,四角方向，两条线的情况
 * */
export function get_solid_line_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sides = [];

    if (dir === Direction.TR) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.TL) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sl; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BL) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sl; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BR) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.C) {
        let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
        let sieds4 = { x1: 0, y1: 0, x2: 0, y2: 0 };
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc; sieds1.y2 = ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = hr; sieds2.y2 = midpoint.yc;
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb;
        sieds4.x1 = sl; sieds4.y1 = midpoint.yc; sieds4.x2 = hl; sieds4.y2 = midpoint.yc;
        sides = [sieds1, sieds2, sieds3, sieds4];
    } else {
        sides = get_solid_line_sieds_point(sp, hp, dir) as any[];
    }
    return sides;
}
/**
 *  @description 获取实线的点,垂直水平方向，三条线的情况
 * */
function get_solid_line_sieds_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds3 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    if (dir === Direction.T) {
        //垂直线
        sieds1.x1 = midpoint.xc; sieds1.y1 = st; sieds1.x2 = midpoint.xc;
        sieds1.y2 = st === hb ? ((midpoint.xc > hl && midpoint.xc < hr) ? hb : ht) : (s.s1 === Sides.Bottom ? hb : ht);
        //右侧线
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = hr; sieds2.y2 = midpoint.yc;
        //左侧线
        sieds3.x1 = sl; sieds3.y1 = midpoint.yc; sieds3.x2 = hl; sieds3.y2 = midpoint.yc;
    } else if (dir === Direction.R) {
        //右侧线
        sieds1.x1 = sr; sieds1.y1 = midpoint.yc;
        sieds1.x2 = sr === hl ? ((midpoint.yc > ht && midpoint.yc < hb) ? hl : hr) : (s.s2 === Sides.Left ? hl : hr); sieds1.y2 = midpoint.yc;
        // 上
        sieds2.x1 = midpoint.xc; sieds2.y1 = st; sieds2.x2 = midpoint.xc; sieds2.y2 = ht;
        // 下
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb;
    } else if (dir === Direction.B) {
        //下线
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc;
        sieds1.y2 = sb === ht ? ((midpoint.xc > hl && midpoint.xc < hr) ? ht : hb) : (s.s1 === Sides.Bottom ? hb : ht);
        // 右线
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = hr; sieds2.y2 = midpoint.yc;
        // 左线
        sieds3.x1 = sl; sieds3.y1 = midpoint.yc; sieds3.x2 = hl; sieds3.y2 = midpoint.yc;
    } else if (dir === Direction.L) {
        //左线
        sieds1.x1 = sl; sieds1.y1 = midpoint.yc;
        sieds1.x2 = sl === hr ? ((midpoint.yc > ht && midpoint.yc < hb) ? hr : hl) : (s.s2 === Sides.Left ? hl : hr); sieds1.y2 = midpoint.yc;
        // 上线
        sieds2.x1 = midpoint.xc; sieds2.y1 = st; sieds2.x2 = midpoint.xc; sieds2.y2 = ht;
        // 下线
        sieds3.x1 = midpoint.xc; sieds3.y1 = sb; sieds3.x2 = midpoint.xc; sieds3.y2 = hb;
    }
    return [sieds1, sieds2, sieds3];
}

/**
 *  @description 获取虚线的点,四角方向 dotted line
 * */ 
export function get_dotted_line_point(sp: { x: number, y: number }[], hp: { x: number, y: number }[], dir?: Direction) {
    if (sp.length === 0 || hp.length === 0 || !dir) return;
    const s = get_hovered_sides_dir(sp, hp, dir);
    const midpoint = get_select_sides_midpoint(sp);
    if (!s || !midpoint) return;
    const st = sp[0].y, sb = sp[2].y, sl = sp[0].x, sr = sp[2].x;
    const ht = hp[0].y, hb = hp[2].y, hl = hp[0].x, hr = hp[2].x;
    let sieds1 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sieds2 = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let sides = [];
    if (dir === Direction.TR) {
        sieds1.x1 = hl; sieds1.y1 = s.s1 === Sides.Bottom ? hb : ht; sieds1.x2 = sl; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? hl : hr; sieds2.y1 = hb; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = sb;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.TL) {
        sieds1.x1 = hr; sieds1.y1 = s.s1 === Sides.Bottom ? hb : ht; sieds1.x2 = sr; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = s.s2 === Sides.Left ? hl : hr; sieds2.y1 = hb; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = sb;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BL) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sl; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else if (dir === Direction.BR) {
        sieds1.x1 = midpoint.xc; sieds1.y1 = sb; sieds1.x2 = midpoint.xc; sieds1.y2 = s.s1 === Sides.Bottom ? hb : ht;
        sieds2.x1 = sr; sieds2.y1 = midpoint.yc; sieds2.x2 = s.s2 === Sides.Left ? hl : hr; sieds2.y2 = midpoint.yc;
        sides = [sieds1, sieds2];
    } else {
        sides = get_solid_line_sieds_point(sp, hp, dir) as any[];
    }
    return sides;
}