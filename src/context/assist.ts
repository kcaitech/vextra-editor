import {GroupShape, Matrix, Shape, WatchableObject} from "@kcdesign/data";
import {PageXY, Selection, XY} from "./selection";
import {Context} from ".";
import {
    finder,
    get_frame,
    get_tree,
    modify_pt_x,
    modify_pt_x4create,
    modify_pt_x4p,
    modify_pt_y,
    modify_pt_y4create,
    modify_pt_y4p,
    gen_match_points_by_map,
    PointsOffset, getClosestContainer, gen_match_points_by_map2, modify_pt_x_4_path_edit, modify_pt_y_4_path_edit
} from "@/utils/assist";

export interface PointGroup1 {
    lt: PageXY
    rb: PageXY
    pivot: PageXY
    apexX: number[]
    apexY: number[]
    lb?: PageXY
    rt?: PageXY
    th?: PageXY
    rh?: PageXY
    bh?: PageXY
    lh?: PageXY
}

export interface PointGroup2 {
    lt: PageXY
    rt: PageXY
    rb: PageXY
    lb: PageXY
    pivot: PageXY
    top?: number
    cx?: number
    bottom?: number
    left?: number
    cy?: number
    right?: number
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

export interface PT1_2 {
    x: number
    sy: number
    align: Align
    delta: number | undefined
    ex: PageXY2[]
}

export interface PT2_2 {
    y: number
    sx: number
    align: Align
    delta: number | undefined
    ex: PageXY2[]
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

export interface PageXY2 {
    id: string
    p: PageXY
}

export class Asssit extends WatchableObject {
    static UPDATE_ASSIST = 1;
    static UPDATE_MAIN_LINE = 2;
    static CLEAR = 3;
    static STICKNESS = 5;
    private m_stickness: number = 5;
    private m_collect_target: GroupShape[] = [];
    private m_context: Context;
    private m_shape_inner: Shape[] = [];
    private m_pg_inner: Map<string, PointGroup1> = new Map();
    private m_x_axis: Map<number, PageXY2[]> = new Map();
    private m_y_axis: Map<number, PageXY2[]> = new Map();
    private m_except: Map<string, Shape> = new Map();
    private m_current_pg: PointGroup2 | undefined;
    private m_nodes_x: PageXY2[] = [];
    private m_nodes_y: PageXY2[] = [];
    private m_path_pg: Map<number, PageXY2> = new Map(); // 路径编辑模式

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    get CPG() {
        return this.m_current_pg;
    }

    setCPG(pg: PointGroup2) {
        this.m_current_pg = pg;
    }

    setCPG2() {
        const path_shape = this.m_context.selection.pathshape;
        if (!path_shape) return;
        const points = path_shape.points;
        const f = path_shape.frame;
        const m = new Matrix();
        m.preScale(f.width, f.height);
        m.multiAtLeft(path_shape.matrix2Root());
        this.clear();
        for (let i = 0, l = points.length; i < l; i++) {
            const p = m.computeCoord(points[i]);
            const item = {id: 'path-edit-mode', p};
            this.m_path_pg.set(i, item);
            const xs = this.m_x_axis.get(p.x);
            if (xs) {
                xs.push(item);
            } else {
                this.m_x_axis.set(p.x, [item]);
            }
            const ys = this.m_y_axis.get(p.y);
            if (ys) {
                ys.push(item);
            } else {
                this.m_y_axis.set(p.y, [item]);
            }
        }
    }

    get except() {
        return this.m_except;
    }

    get stickness() {
        return this.m_stickness;
    }

    set_stickness(v: number) {
        this.m_stickness = v;
    }

    get xAxis() {
        return this.m_x_axis;
    }

    get yAxis() {
        return this.m_y_axis;
    }

    get nodes_x() {
        return this.m_nodes_x;
    }

    get nodes_y() {
        return this.m_nodes_y;
    }

    get shape_in_view() {
        return this.m_shape_inner;
    }

    is_shape_in_view(shape: Shape) {
        return !!this.m_pg_inner.get(shape.id);
    }

    private clear() {
        this.m_shape_inner.length = 0;
        this.m_pg_inner.clear();
        this.m_x_axis.clear();
        this.m_y_axis.clear();
    }

    private selection_watcher(t?: any) {
        if (t === Selection.CHANGE_SHAPE) {
            this.m_collect_target = [];
            const shapes = this.m_context.selection.selectedShapes;
            if (shapes.length === 1) {
                this.m_collect_target = [getClosestContainer(shapes[0])];
            } else {
                this.m_collect_target = [];
            }
        } else if (t === Selection.CHANGE_PAGE) {
            this.m_collect_target = [];
        }
    }

    init() {
        this.m_context.selection.watch(this.selection_watcher.bind(this))
    }

    set_collect_target(groups: GroupShape[], collect?: boolean) {
        this.m_collect_target = groups;
        if (collect) this.collect();
    }

    collect() {
        // const s = Date.now();
        const page = this.m_context.selection.selectedPage;
        if (page) {
            this.clear();
            let target: GroupShape = page;
            if (this.m_collect_target.length) target = this.m_collect_target[0] || page;
            this.m_shape_inner = finder(this.m_context, target, this.m_pg_inner, this.m_x_axis, this.m_y_axis);
        }
        // const e = Date.now();
        // console.log('点位收集用时(ms):', e - s);
    }

    set_trans_target(shapes: Shape[]) {
        this.m_context.workspace.clear_cache_map();
        this.collect();
        this.m_except.clear();
        if (shapes.length === 1) {
            get_tree(shapes[0], this.m_except);
        } else if (shapes.length > 1) {
            for (let i = 0, len = shapes.length; i < len; i++) get_tree(shapes[i], this.m_except);
        }
    }

    trans_match(offsetMap: PointsOffset, p: PageXY) {
        // const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_current_pg = gen_match_points_by_map(offsetMap, p);
        const target = {x: 0, y: 0, sticked_by_x: false, sticked_by_y: false, alignX: Align.LT_X, alignY: Align.LT_Y};
        const pre_target1: PT1 = {x: 0, sy: 0, align: Align.LT_X, delta: undefined};
        const pre_target2: PT2 = {y: 0, sx: 0, align: Align.LT_Y, delta: undefined};
        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x(pre_target1, this.m_current_pg, c_pg.apexX, this.m_stickness);
            modify_pt_y(pre_target2, this.m_current_pg, c_pg.apexY, this.m_stickness);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x, target.sticked_by_x = true, target.alignX = pre_target1.align;
            this.m_nodes_x = this.m_x_axis.get(target.x) || [];
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y, target.sticked_by_y = true, target.alignY = pre_target2.align;
            this.m_nodes_y = this.m_y_axis.get(target.y) || [];
        }
        this.notify(Asssit.UPDATE_ASSIST);
        // console.log('单次匹配辅助点位(ms):', Date.now() - st);
        return target;
    }

    trans_match_multi(shapes: Shape[], offsetMap: PointsOffset, p: PageXY) {
        // const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        const cache_map = this.m_context.workspace.cache_map;
        if (cache_map) {
            this.m_context.workspace.revert_frame_by_map(shapes[0]);
        } else {
            const frame = get_frame(shapes);
            this.m_context.workspace.gen_chahe_map_by_shape_one(shapes[0], frame);
            this.m_context.workspace.setCFrame(frame);
        }
        this.m_current_pg = gen_match_points_by_map(offsetMap, p);
        const target = {x: 0, y: 0, sticked_by_x: false, sticked_by_y: false, alignX: Align.LT_X, alignY: Align.LT_Y};
        const pre_target1: PT1 = {x: 0, sy: 0, align: Align.LT_X, delta: undefined};
        const pre_target2: PT2 = {y: 0, sx: 0, align: Align.LT_Y, delta: undefined};
        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x(pre_target1, this.m_current_pg, c_pg.apexX, this.m_stickness);
            modify_pt_y(pre_target2, this.m_current_pg, c_pg.apexY, this.m_stickness);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x, target.sticked_by_x = true, target.alignX = pre_target1.align;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y, target.sticked_by_y = true, target.alignY = pre_target2.align;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        // const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }

    point_match(point: PageXY) {
        // const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        // this.m_current_pg = gen_match_points(s);  // *
        const target = {x: 0, y: 0, sticked_by_x: false, sticked_by_y: false};
        const pre_target1: PT4P1 = {x: 0, sy: 0, delta: undefined};
        const pre_target2: PT4P2 = {y: 0, sx: 0, delta: undefined};
        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x4p(pre_target1, point, c_pg.apexX, this.m_stickness);
            modify_pt_y4p(pre_target2, point, c_pg.apexY, this.m_stickness);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x;
            target.sticked_by_x = true;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([{
                p: {x: target.x, y: pre_target1.sy},
                id: 'ex'
            }]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([{
                p: {x: pre_target2.sx, y: target.y},
                id: 'ex'
            }]);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        // const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }

    create_match(p: PageXY) {
        const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        const target = {x: 0, y: 0, sticked_by_x: false, sticked_by_y: false};
        const pre_target1: PT4P1 = {x: 0, sy: 0, delta: undefined};
        const pre_target2: PT4P2 = {y: 0, sx: 0, delta: undefined};
        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const cs = this.m_shape_inner[i];
            if (this.m_except.get(cs.id)) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            modify_pt_x4create(pre_target1, p, c_pg.apexX, this.m_stickness);
            modify_pt_y4create(pre_target2, p, c_pg.apexY, this.m_stickness);
        }
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x, target.sticked_by_x = true;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([{
                p: {x: target.x, y: pre_target1.sy},
                id: 'ex'
            }]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y, target.sticked_by_y = true;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([{
                p: {x: pre_target2.sx, y: target.y},
                id: 'ex'
            }]);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }

    edit_mode_match(point: PageXY, offsetMap: XY[]) {
        const indexes = this.m_context.path.selectedPoints;
        if (!indexes.length) return;
        const indexes_set = new Set(indexes);
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        const points = gen_match_points_by_map2(offsetMap, point);
        const target = {x: 0, y: 0, sticked_by_x: false, sticked_by_y: false};
        const pre_target1: PT4P1 = {x: 0, sy: 0, delta: undefined};
        const pre_target2: PT4P2 = {y: 0, sx: 0, delta: undefined};
        this.m_path_pg.forEach((v, k) => {
            if (indexes_set.has(k)) return;
            modify_pt_x_4_path_edit(pre_target1, v.p, points, this.stickness);
            modify_pt_y_4_path_edit(pre_target2, v.p, points, this.stickness);
        })
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x;
            target.sticked_by_x = true;
            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([
                {p: {x: target.x, y: pre_target1.sy}, id: 'ex'}
            ]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([
                {p: {x: pre_target2.sx, y: target.y}, id: 'ex'}
            ]);
        }
        this.notify(Asssit.UPDATE_ASSIST);
        // const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }

    reset() {
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_except.clear();
        this.notify(Asssit.UPDATE_ASSIST);
    }
}