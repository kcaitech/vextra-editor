import { GroupShape, Shape, ShapeType, Watchable } from "@kcdesign/data";
import { PageXY, Selection } from "./selection";
import { Context } from ".";
import { debounce } from "lodash";
interface PointGroup {
    lt: PageXY
    rt: PageXY
    rb: PageXY
    lb: PageXY
    th?: PageXY
    rh?: PageXY
    bh?: PageXY
    lh?: PageXY
    pivot: PageXY
    apexX: number[]
    apexY: number[]
}
interface PT1 {
    x: number
    sy: number
    align: Align
    delta: number | undefined
}
interface PT2 {
    y: number
    sx: number
    align: Align
    delta: number | undefined
}
export enum Align {
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
export class Asssit extends Watchable(Object) {
    static UPDATE_ASSIST = 1;
    static STICKNESS = 5;
    private m_context: Context;
    private m_shape_inner: Shape[] = [];
    private m_pg_inner: Map<string, PointGroup> = new Map();
    private m_x_axis: Map<number, PageXY[]> = new Map();
    private m_y_axis: Map<number, PageXY[]> = new Map();
    private m_current_pg: PointGroup | undefined;
    private m_nodes_x: PageXY[] = [];
    private m_nodes_y: PageXY[] = [];
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    get nodes_x() {
        return this.m_nodes_x;
    }
    get nodes_y() {
        return this.m_nodes_y;
    }
    init() { this.m_context.selection.watch(this.selection_watcher.bind(this)) }
    collect() {
        const s = Date.now();
        const page = this.m_context.selection.selectedPage;
        if (!page) return;
        this.clear();
        this.m_shape_inner = finder(this.m_context, page, this.m_pg_inner, this.m_x_axis, this.m_y_axis);
        const e = Date.now();
        console.log('点位收集用时(ms):', e - s);
    }
    selection_watcher(t?: any) {
        if (t === Selection.CHANGE_SHAPE) {
            const selected = this.m_context.selection.selectedShapes;
            if (selected.length) {
                this.m_current_pg = update_pg(selected[0]);
            } else {
                this.m_current_pg = undefined;
            }
        } else if (t === Selection.CHANGE_PAGE) {
            this.m_current_pg = undefined;
        }
    }
    match(s: Shape) {
        const st = Date.now();
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_current_pg = update_pg(s);
        const s_pg = this.m_current_pg;
        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false, alignX: Align.LT_X, alignY: Align.LT_Y };
        const pre_target1: PT1 = { x: 0, sy: 0, align: Align.LT_X, delta: undefined };
        const pre_target2: PT2 = { y: 0, sx: 0, align: Align.LT_Y, delta: undefined };
        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const cs = this.m_shape_inner[i];
            if (cs.id === s.id) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x(pre_target1, s_pg, c_pg.apexX);
            modify_pt_y(pre_target2, s_pg, c_pg.apexY);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x, target.sticked_by_x = true, target.alignX = pre_target1.align;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([{ x: target.x, y: pre_target1.sy }]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y, target.sticked_by_y = true, target.alignY = pre_target2.align;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([{ x: pre_target2.sx, y: target.y }]);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        const e = Date.now();
        console.log('单次匹配用时(ms):', e - st);
        return target;
    }
    match_test() {
        const st = Date.now();
        const s = this.m_context.selection.selectedShapes[0];
        this.match(s);
        const et = Date.now();
        console.log('单次匹配用时(ms):', et - st);
    }
    reset() {
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.notify(Asssit.UPDATE_ASSIST);
    }
    clear() {
        this.m_shape_inner.length = 0;
        this.m_pg_inner.clear();
        this.m_x_axis.clear();
        this.m_y_axis.clear();
    }
}
function update_pg(host: Shape): PointGroup {
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

function isShapeOut(context: Context, shape: Shape) {
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
function finder(context: Context, scope: GroupShape, all_pg: Map<string, PointGroup>, x_axis: Map<number, PageXY[]>, y_axis: Map<number, PageXY[]>) {
    let result: Shape[] = [];
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
function getClosestAB(shape: Shape) {
    let resust: GroupShape = shape.parent as GroupShape;
    while (resust && resust.type !== ShapeType.Artboard) resust = shape.parent as GroupShape;
    return resust;
}
function _collect(context: Context) {
    context.assist.collect();
}
function modify_pt_x(pre_target1: PT1, s_pg: PointGroup, apexX: number[]) {
    for (let i = 0; i < apexX.length; i++) {
        const x = apexX[i]
        const delta1 = Math.abs(x - s_pg.lt.x);
        if (delta1 < Asssit.STICKNESS && (pre_target1.delta === undefined || delta1 < pre_target1.delta)) {
            pre_target1.delta = delta1, pre_target1.x = x, pre_target1.sy = s_pg.lt.y, pre_target1.align = Align.LT_X;
        }
        const delta2 = Math.abs(x - s_pg.pivot.x);
        if (delta2 < Asssit.STICKNESS && (pre_target1.delta === undefined || delta2 < pre_target1.delta)) {
            pre_target1.delta = delta2, pre_target1.x = x, pre_target1.sy = s_pg.pivot.y, pre_target1.align = Align.C_X;
        }
        const delta3 = Math.abs(x - s_pg.rb.x)
        if (delta3 < Asssit.STICKNESS && (pre_target1.delta === undefined || delta3 < pre_target1.delta)) {
            pre_target1.delta = delta3, pre_target1.x = x, pre_target1.sy = s_pg.rb.y, pre_target1.align = Align.RB_X;
        }
        const delta4 = Math.abs(x - s_pg.lb.x);
        if (delta4 < Asssit.STICKNESS && (pre_target1.delta === undefined || delta4 < pre_target1.delta)) {
            pre_target1.delta = delta4, pre_target1.x = x, pre_target1.sy = s_pg.lb.y, pre_target1.align = Align.LB_X;
        }
        const delta5 = Math.abs(x - s_pg.rt.x);
        if (delta5 < Asssit.STICKNESS && (pre_target1.delta === undefined || delta5 < pre_target1.delta)) {
            pre_target1.delta = delta5, pre_target1.x = x, pre_target1.sy = s_pg.rt.y, pre_target1.align = Align.RT_X;
        }
    }
}
function modify_pt_y(pre_target2: PT2, s_pg: PointGroup, apexY: number[]) {
    for (let i = 0; i < apexY.length; i++) {
        const y = apexY[i];
        const delta1 = Math.abs(y - s_pg.lt.y);
        if (delta1 < Asssit.STICKNESS && (pre_target2.delta === undefined || delta1 < pre_target2.delta)) {
            pre_target2.delta = delta1, pre_target2.y = y, pre_target2.sx = s_pg.lt.x, pre_target2.align = Align.LT_Y;
        }
        const delta2 = Math.abs(y - s_pg.pivot.y);
        if (delta2 < Asssit.STICKNESS && (pre_target2.delta === undefined || delta2 < pre_target2.delta)) {
            pre_target2.delta = delta2, pre_target2.y = y, pre_target2.sx = s_pg.pivot.x, pre_target2.align = Align.C_Y;
        }
        const delta3 = Math.abs(y - s_pg.rb.y);
        if (delta3 < Asssit.STICKNESS && (pre_target2.delta === undefined || delta3 < pre_target2.delta)) {
            pre_target2.delta = delta3, pre_target2.y = y, pre_target2.sx = s_pg.rb.x, pre_target2.align = Align.RB_Y;
        }
        const delta4 = Math.abs(y - s_pg.lb.y);
        if (delta4 < Asssit.STICKNESS && (pre_target2.delta === undefined || delta4 < pre_target2.delta)) {
            pre_target2.delta = delta4, pre_target2.y = y, pre_target2.sx = s_pg.lb.x, pre_target2.align = Align.LB_Y;
        }
        const delta5 = Math.abs(y - s_pg.rt.y);
        if (delta5 < Asssit.STICKNESS && (pre_target2.delta === undefined || delta5 < pre_target2.delta)) {
            pre_target2.delta = delta5, pre_target2.y = y, pre_target2.sx = s_pg.rt.x, pre_target2.align = Align.RT_Y;
        }
    }
}
export const collect_once = debounce(_collect, 100);