import { Context } from "@/context";
import { Asssit, PT1, PT2, PT4P1, PT4P2, PointGroup } from "@/context/assist";
import { PageXY } from "@/context/selection";
import { GroupShape, Matrix, Shape, ShapeType } from "@kcdesign/data";
import { debounce } from "lodash";
import { XYsBounding } from "./common";

enum Align {
    LT_X,
    RT_X,
    C_X,
    RB_X,
    LB_X,
    LT_Y,
    RT_Y,
    C_Y,
    RB_Y,
    LB_Y
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
    return shape.matrix2Root().computeCoord2(shape.frame.width, shape.frame.height).x;
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
    return shape.matrix2Root().computeCoord2(shape.frame.width, shape.frame.height).y;
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
export function update_pg(host: Shape): PointGroup {
    const m = host.matrix2Root(), f = host.frame;
    const lt = m.computeCoord2(0, 0);
    const rt = m.computeCoord2(f.width, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const lb = m.computeCoord2(0, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    const apexX = [lt.x, rt.x, rb.x, lb.x, pivot.x];
    const apexY = [lt.y, rt.y, rb.y, lb.y, pivot.y];
    if (host.type === ShapeType.Artboard) {
        const th = m.computeCoord2(f.width / 2, 0);
        const rh = m.computeCoord2(f.width, f.height / 2);
        const bh = m.computeCoord2(f.width / 2, f.height);
        const lh = m.computeCoord2(0, f.height / 2);
        apexX.push(th.x, rh.x, bh.x, lh.x);
        apexY.push(th.y, rh.y, bh.y, lh.y);
        return { lt, rt, rb, lb, th, rh, bh, lh, pivot, apexX, apexY };
    }
    return { lt, rt, rb, lb, pivot, apexX, apexY };
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
export function finder(context: Context, scope: GroupShape, all_pg: Map<string, PointGroup>, x_axis: Map<number, PageXY[]>, y_axis: Map<number, PageXY[]>) {
    let result: Shape[] = [];
    if (scope.type === ShapeType.Artboard) {
        result.push(scope);
        const pg = update_pg(scope);
        all_pg.set(scope.id, pg);
        const pvs = Object.values(pg);
        for (let i = 0; i < pvs.length; i++) {
            const p = pvs[i];
            const x = x_axis.get(p.x);
            const y = y_axis.get(p.y);
            if (x) x.push(p); else x_axis.set(p.x, [p]);
            if (y) y.push(p); else y_axis.set(p.y, [p]);
        }
    }
    const cs = scope.childs;
    for (let i = 0; i < cs.length; i++) {
        const c = cs[i];
        if (isShapeOut(context, cs[i])) continue;
        result.push(c);
        const pg = update_pg(c);
        all_pg.set(c.id, pg);
        const pvs = Object.values(pg);
        for (let i = 0; i < pvs.length; i++) {
            const p = pvs[i];
            const x = x_axis.get(p.x);
            const y = y_axis.get(p.y);
            if (x) x.push(p); else x_axis.set(p.x, [p]);
            if (y) y.push(p); else y_axis.set(p.y, [p]);
        }
        if (c instanceof GroupShape) result = [...result, ...finder(context, c, all_pg, x_axis, y_axis)];
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
    context.assist.setStickness(Math.ceil(3 / new_matrix.m00));
}
export function modify_pt_x(pre_target1: PT1, s_pg: PointGroup, apexX: number[], stickness: number) {
    for (let i = 0; i < apexX.length; i++) {
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
export function modify_pt_y(pre_target2: PT2, s_pg: PointGroup, apexY: number[], stickness: number) {
    for (let i = 0; i < apexY.length; i++) {
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
export function get_tree(shape: Shape, init: Map<string, Shape>) {
    init.set(shape.id, shape);
    const cs = shape.childs
    if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++)  get_tree(cs[i], init);
    }
}
export const collect_once = debounce(_collect, 100);
export function modify_pt_x4p(pre_target1: PT4P1, p: PageXY, apexX: number[], stickness: number) {
    for (let i = 0; i < apexX.length; i++) {
        const x = apexX[i]
        const delta = Math.abs(x - p.x);
        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta, pre_target1.x = x, pre_target1.sy = p.y;
        }
    }
}
export function modify_pt_y4p(pre_target2: PT4P2, p: PageXY, apexY: number[], stickness: number) {
    for (let i = 0; i < apexY.length; i++) {
        const y = apexY[i]
        const delta = Math.abs(y - p.y);
        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta, pre_target2.y = y, pre_target2.sx = p.x;
        }
    }
}
export function modify_pt_x4create(pre_target1: PT4P1, p: PageXY, apexX: number[], stickness: number) {
    for (let i = 0; i < apexX.length; i++) {
        const x = apexX[i]
        const delta = Math.abs(x - p.x);
        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta, pre_target1.x = x, pre_target1.sy = p.y;
        }
    }
}
export function modify_pt_y4create(pre_target2: PT4P2, p: PageXY, apexY: number[], stickness: number) {
    for (let i = 0; i < apexY.length; i++) {
        const y = apexY[i]
        const delta = Math.abs(y - p.y);
        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta, pre_target2.y = y, pre_target2.sx = p.x;
        }
    }
}
interface Point {
    x: number
    y: number
}
export function get_pg_by_frame(frame: Point[]): PointGroup {
    const lt = frame[0], rt = frame[1], rb = frame[2], lb = frame[3];
    const pivot = { x: (rb.x - lt.x) / 2, y: (rb.y - lt.y) / 2 };
    return {
        lt, rt, rb, lb, pivot,
        apexX: [lt.x, rt.x, rb.x, lb.x, pivot.x],
        apexY: [lt.y, rt.y, rb.y, lb.y, pivot.y]
    }
}
export function get_frame(selection: Shape[]): Point[] {
    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < selection.length; i++) {
        const s = selection[i];
        const m = s.matrix2Root();
        const f = s.frame;
        const ps: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, { x: 0, y: f.height }].map(p => m.computeCoord2(p.x, p.y));
        points.push(...ps);
    }
    const b = XYsBounding(points);
    return [{ x: b.left, y: b.top }, { x: b.right, y: b.top }, { x: b.right, y: b.bottom }, { x: b.left, y: b.bottom }];
}