import { GroupShape, Shape, Watchable } from "@kcdesign/data";
import { PageXY, Selection } from "./selection";
import { Context } from ".";
import { _collect, finder, getClosestAB, get_pg_by_frame, get_tree, modify_pt_x, modify_pt_x4p, modify_pt_y, modify_pt_y4p, update_pg } from "@/utils/assist";
export interface PointGroup {
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
export type PointType = 'lt' | 'rt' | 'rb' | 'lb' | 'pivot';

export interface PT1 {
    x: number
    sy: number
    align: Align
    delta: number | undefined
}
export interface PT2 {
    y: number
    sx: number
    align: Align
    delta: number | undefined
}
export interface PT4P1 {
    x: number
    sy: number
    delta: number | undefined
}
export interface PT4P2 {
    y: number
    sx: number
    delta: number | undefined
}
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
export class Asssit extends Watchable(Object) {
    static UPDATE_ASSIST = 1;
    static STICKNESS = 5;
    private m_collect_target: GroupShape[] = [];
    private m_context: Context;
    private m_shape_inner: Shape[] = [];
    private m_pg_inner: Map<string, PointGroup> = new Map();
    private m_x_axis: Map<number, PageXY[]> = new Map();
    private m_y_axis: Map<number, PageXY[]> = new Map();
    private m_except: Map<string, Shape> = new Map();
    private m_current_pg: PointGroup | undefined;
    private m_nodes_x: PageXY[] = [];
    private m_nodes_y: PageXY[] = [];
    private m_stickness: number = 5;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    get stickness() {
        return this.m_stickness;
    }
    setStickness(v: number) {
        this.m_stickness = v;
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
        // let target: GroupShape = page;
        // if (this.m_collect_target.length) target = this.m_collect_target[0] || page;
        this.m_shape_inner = finder(this.m_context, page, this.m_pg_inner, this.m_x_axis, this.m_y_axis);
        const e = Date.now();
        console.log('点位收集用时(ms):', e - s);
    }
    selection_watcher(t?: any) {
        if (t === Selection.CHANGE_SHAPE) {
            this.m_collect_target = [];
            const shapes = this.m_context.selection.selectedShapes;
            if (shapes.length === 1) {
                this.m_collect_target = [getClosestAB(shapes[0])];
            } else {
                this.m_collect_target = [];
            }
        } else if (t === Selection.CHANGE_PAGE) {
            this.m_collect_target = [];
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
            modify_pt_x(pre_target1, s_pg, c_pg.apexX, this.m_stickness);
            modify_pt_y(pre_target2, s_pg, c_pg.apexY, this.m_stickness);
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
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }
    setTransTarget(shapes: Shape[]) {
        this.m_except.clear();
        if (shapes.length === 1) {
            const s = shapes[0];
            get_tree(s, this.m_except);
        } else if (shapes.length > 1) {
            for (let i = 0, len = shapes.length; i < len; i++) {
                get_tree(shapes[i], this.m_except);
            }
        }
    }
    trans_match(s: Shape) {
        const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_current_pg = update_pg(s);
        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false, alignX: Align.LT_X, alignY: Align.LT_Y };
        const pre_target1: PT1 = { x: 0, sy: 0, align: Align.LT_X, delta: undefined };
        const pre_target2: PT2 = { y: 0, sx: 0, align: Align.LT_Y, delta: undefined };
        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x(pre_target1, this.m_current_pg, c_pg.apexX, this.m_stickness);
            modify_pt_y(pre_target2, this.m_current_pg, c_pg.apexY, this.m_stickness);
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
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }
    trans_match_multi() {
        const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_current_pg = get_pg_by_frame(this.m_context.workspace.controllerFrame);
        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false, alignX: Align.LT_X, alignY: Align.LT_Y };
        const pre_target1: PT1 = { x: 0, sy: 0, align: Align.LT_X, delta: undefined };
        const pre_target2: PT2 = { y: 0, sx: 0, align: Align.LT_Y, delta: undefined };
        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x(pre_target1, this.m_current_pg, c_pg.apexX, this.m_stickness);
            modify_pt_y(pre_target2, this.m_current_pg, c_pg.apexY, this.m_stickness);
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
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }
    point_match(s: Shape, t: PointType) {
        const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_current_pg = update_pg(s);
        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false };
        const pre_target1: PT4P1 = { x: 0, sy: 0, delta: undefined };
        const pre_target2: PT4P2 = { y: 0, sx: 0, delta: undefined };
        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            const p = this.m_current_pg[t];
            modify_pt_x4p(pre_target1, p, c_pg.apexX, this.m_stickness);
            modify_pt_y4p(pre_target2, p, c_pg.apexY, this.m_stickness);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x, target.sticked_by_x = true;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([{ x: target.x, y: pre_target1.sy }]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y, target.sticked_by_y = true;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([{ x: pre_target2.sx, y: target.y }]);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
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