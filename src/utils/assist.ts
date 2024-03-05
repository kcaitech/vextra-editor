import { Context } from "@/context";
import { Asssit, PageXY2, PointGroup1, PointGroup2, PT1, PT2, PT4P1, PT4P2 } from "@/context/assist";
import { PageXY, XY } from "@/context/selection";
import { GroupShape, Matrix, Shape, ShapeType, ShapeView } from "@kcdesign/data";
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

const get_pos: { [key: string]: (shape: ShapeView) => number } = {};
get_pos[Align.LT_X] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(0, 0).x;
}
get_pos[Align.RT_X] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).x;
}
get_pos[Align.C_X] = function (shape: ShapeView) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).x;
}
get_pos[Align.RB_X] = function (shape: ShapeView) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width, f.height).x;
}
get_pos[Align.LB_X] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).x;
}
get_pos[Align.LT_Y] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(0, 0).y;
}
get_pos[Align.RT_Y] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).y;
}
get_pos[Align.C_Y] = function (shape: ShapeView) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).y;
}
get_pos[Align.RB_Y] = function (shape: ShapeView) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width, f.height).y;
}
get_pos[Align.LB_Y] = function (shape: ShapeView) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).y;
}

export function distance2apex(shape: ShapeView, align: Align): number {
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

export function get_apex(context: Context, shape: ShapeView, is_multi: boolean, align: Align) {
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
export function colloct_point_group(host: ShapeView): PointGroup1 {
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
    const apexX = Array.from(new Set([lt.x, rt.x, rb.x, lb.x, pivot.x]).values());
    const apexY = Array.from(new Set([lt.y, rt.y, rb.y, lb.y, pivot.y]).values());
    const pg: PointGroup1 = { lt, rt, rb, lb, pivot, apexX, apexY };
    if (host.type === ShapeType.Artboard || host.type === ShapeType.Symbol) {
        const th = m.computeCoord2(f.width / 2, 0);
        const rh = m.computeCoord2(f.width, f.height / 2);
        const bh = m.computeCoord2(f.width / 2, f.height);
        const lh = m.computeCoord2(0, f.height / 2);
        apexX.push(th.x, rh.x, bh.x, lh.x);
        apexY.push(th.y, rh.y, bh.y, lh.y);
        pg.th = th;
        pg.rh = rh;
        pg.bh = bh;
        pg.lh = lh;
    }
    return pg;
}

/**
 * @description 比对时使用
 */
export function gen_match_points(host: ShapeView, multi?: boolean): PointGroup2 {
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

export function gen_match_points_by_map2(offset: XY[], p: PageXY) {
    return offset.map(i => {
        return { x: p.x + i.x, y: p.y + i.y };
    })
}

export function isShapeOut(context: Context, shape: Shape | ShapeView) {
    const { x, y, bottom, right } = context.workspace.root;
    const { width, height } = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(context.workspace.matrix);
    const point: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, {
        x: 0,
        y: height
    }];
    for (let i = 0; i < 4; i++) point[i] = m.computeCoord3(point[i]);
    return Math.min(point[0].x, point[1].x, point[2].x, point[3].x) > right - x ||
        Math.max(point[0].x, point[1].x, point[2].x, point[3].x) < 0 ||
        Math.max(point[0].y, point[1].y, point[2].y, point[3].y) < 0 ||
        Math.min(point[0].y, point[1].y, point[2].y, point[3].y) > bottom - y;
}

export function finder(context: Context, scope: ShapeView, all_pg: Map<string, PointGroup1>, x_axis: Map<number, PageXY2[]>, y_axis: Map<number, PageXY2[]>) {
    let result: ShapeView[] = [];
    if (scope.type === ShapeType.Artboard || scope.type === ShapeType.Symbol) {
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
        if (c.type === ShapeType.Group) result = result.concat(finder(context, c, all_pg, x_axis, y_axis));
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

export function getClosestContainer(shape: ShapeView) {
    let result: ShapeView | undefined = shape.parent;
    while (result) {
        if (result.type === ShapeType.Artboard || result.type === ShapeType.Symbol) break;
        result = result.parent;
    }
    return result;
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

export function alignXFromPointGroup(dx: number, xs: number[], livingXs: number[]) {
    let livingD = dx;
    let livingAD = Math.abs(dx);
    let targetX = 0;

    for (let i = 0; i < livingXs.length; i++) {
        const x = livingXs[i];

        for (let j = 0; j < xs.length; j++) {
            const fixedX = xs[j];
            const d = fixedX - x;
            const ad = Math.abs(d);

            if (ad < livingAD) {
                livingD = d;
                livingAD = ad;
                targetX = fixedX;
            }
        }
    }
    return { dx: livingD, targetX };
}
export function alignYFromPointGroup(dy: number, ys: number[], livingYs: number[]) {
    let livingD = dy;
    let livingAD = Math.abs(dy);
    let targetY = 0;

    for (let i = 0; i < livingYs.length; i++) {
        const y = livingYs[i];

        for (let j = 0; j < ys.length; j++) {
            const fixedY = ys[j];
            const d = fixedY - y;
            const ad = Math.abs(d);
            
            if (ad < livingAD) {
                livingD = d;
                livingAD = ad;
                targetY = fixedY;
            }
        }
    }
    return { dy: livingD, targetY };
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

export function modify_pt_x_4_path_edit(pre_target1: any, point_of_map: XY, calc_points: XY[], stickness: number) {
    for (let i = 0, len = calc_points.length; i < len; i++) {
        const __p = calc_points[i];
        const x = __p.x;

        const delta = Math.abs(x - point_of_map.x);

        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta;
            pre_target1.x = point_of_map.x;
            pre_target1.sy = __p.y;
            pre_target1.index = i;
        }
    }
}

export function modify_pt_y_4_path_edit(pre_target2: any, point_of_map: XY, calc_points: XY[], stickness: number) {
    for (let i = 0, len = calc_points.length; i < len; i++) {
        const __p = calc_points[i];
        const y = __p.y;

        const delta = Math.abs(y - point_of_map.y);

        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta;
            pre_target2.sx = __p.x;
            pre_target2.y = point_of_map.y
            pre_target2.index = i;
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

export function get_tree(shape: ShapeView, init: Map<string, ShapeView>) {
    init.set(shape.id, shape);
    if (shape.type !== ShapeType.Table) {
        const cs = (shape).childs;
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

export function get_frame(shapes: ShapeView[]): Point[] {
    const points: { x: number, y: number }[] = [];
    for (let i = 0, len = shapes.length; i < len; i++) {
        const s = shapes[i];
        const m = s.matrix2Root();
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, {
            x: 0,
            y: f.height
        }];
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
export function pre_render_assist_line(context: Context, is_multi: boolean, shape: ShapeView, shapes: ShapeView[]) {
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
export class ActionEndGenerator {
    private stickedX: boolean = false;
    private stickedY: boolean = false;
    private sticked_x_v: number = 0;
    private sticked_y_v: number = 0;
    private pre_target_x: number = 0
    private pre_target_y: number = 0;
    private offset_map: XY[] = [];
    private context: Context;
    private stickness: number;
    private origin_position: XY;

    constructor(context: Context, map: XY[], origin: XY) {
        this.context = context;
        this.offset_map = map;
        this.stickness = context.assist.stickness;
        this.origin_position = origin;
    }

    _break_free(a: number, b: number) {
        return Math.abs(a - b) >= this.stickness;
    }

    modify_fix_x(p2: PageXY, fix: number) {
        this.stickedX = true;
        this.sticked_x_v = fix;
        this.pre_target_x = fix;

        p2.x = fix;
    }

    modify_fix_y(p2: PageXY, fix: number) {
        this.stickedY = true;
        this.sticked_y_v = fix;
        this.pre_target_y = fix;

        p2.y = fix;
    }

    modify_point_x(point: XY, target: any) {
        if (this._break_free(point.x, this.sticked_x_v)) {
            this.stickedX = false;
            return;
        }

        if (this.pre_target_x === target.x) {
            point.x = this.sticked_x_v;
        }
        else if (target.sticked_by_x) {
            this.modify_fix_x(point, target.x);
        }
    }

    modify_point_y(point: XY, target: any) {
        if (this._break_free(point.y, this.sticked_y_v)) {
            this.stickedY = false;
            return;
        }

        if (this.pre_target_y === target.x) {
            point.y = this.sticked_y_v;
        }
        else if (target.sticked_by_y) {
            this.modify_fix_y(point, target.y);
        }
    }

    get_direction(current: XY, origin: XY): 'x' | 'y' {
        const dx = Math.abs(origin.x - current.x);
        const dy = Math.abs(origin.y - current.y);
        return dx > dy ? 'y' : 'x';
    }

    __gen(point: XY, indexes: number[], f: Function, shift_key?: boolean) {
        if (shift_key) {
            const key = this.get_direction(point, this.origin_position);
            point[key] = this.origin_position[key];
        }
        // const target = f(point, indexes, this.offset_map);

        // if (!target) {
        //     return point;
        // }

        // if (this.stickedX) {
        //     this.modify_point_x(point, target);
        // }
        // else if (target.sticked_by_x) {
        //     this.modify_fix_x(point, target.x);
        // }

        // if (this.stickedY) {
        //     this.modify_point_y(point, target);
        // }
        // else if (target.sticked_by_y) {
        //     this.modify_fix_y(point, target.y);
        // }

        return point;
    }

    __reset() {
        this.stickedX = false;
        this.stickedY = false;
    }
}