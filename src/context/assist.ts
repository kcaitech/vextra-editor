import { GroupShape, Matrix, Shape, ShapeView, WatchableObject, adapt2Shape } from "@kcdesign/data";
import { PageXY, Selection, XY } from "./selection";
import { Context } from ".";
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
    PointsOffset,
    gen_match_points_by_map2,
    modify_pt_x_4_path_edit,
    modify_pt_y_4_path_edit,
    alignXFromPointGroup,
    alignYFromPointGroup
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

export class Assist extends WatchableObject {
    static UPDATE_ASSIST = 1;
    static UPDATE_MAIN_LINE = 2;
    static CLEAR = 3;
    static UPDATE_ASSIST_PATH = 4;
    static UPDATE_MAIN_LINE_PATH = 5;
    static STICKNESS = 6;
    static MULTI_LINE_ASSIST = 7;
    private m_stickness: number = 5;
    private m_collect_target: ShapeView[] = [];
    private m_context: Context;
    private m_shape_inner: ShapeView[] = [];
    private m_pg_inner: Map<string, PointGroup1> = new Map();
    private m_x_axis: Map<number, PageXY2[]> = new Map();
    private m_y_axis: Map<number, PageXY2[]> = new Map();
    private m_except: Map<string, ShapeView> = new Map();
    private m_current_pg: PointGroup2 | undefined;
    private m_nodes_x: PageXY2[] = [];
    private m_nodes_y: PageXY2[] = [];

    multi_line_x: { x: number, pre: XY[] }[] = [];
    multi_line_y: { y: number, pre: XY[] }[] = [];

    private m_nodes_x2: XY[] = [];
    private m_nodes_y2: XY[] = [];

    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    setNodesX2(xys: XY[]) {
        this.m_nodes_x2 = xys;
    }

    get nodesX2() {
        return this.m_nodes_x2;
    }

    setNodesY2(xys: XY[]) {
        this.m_nodes_y2 = xys;
    }

    get nodesY2() {
        return this.m_nodes_y2;
    }

    get CPG() {
        return this.m_current_pg;
    }

    setCPG(pg: PointGroup2) {
        this.m_current_pg = pg;
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

    clear() {
        this.m_shape_inner.length = 0;
        this.m_pg_inner.clear();
        this.m_x_axis.clear();
        this.m_y_axis.clear();
        this.m_nodes_x2.length = 0;
        this.m_nodes_y2.length = 0;
    }

    set_collect_target(shapes: ShapeView[], collect_immediate = false) {
        const page = this.m_context.selection.selectedPage!;

        if (!shapes.length) {
            this.m_collect_target = [page];
        }

        const parents: Map<string, ShapeView> = new Map();
        for (let i = 0; i < shapes.length; i++) {
            const parent = shapes[i].parent!;
            parents.set(parent.id, parent);
        }

        if (parents.has(page.id)) {
            this.m_collect_target = [page];
        } else {
            const chains: Map<string, Set<ShapeView>> = new Map();
            let longest = 0;
            let longestChains: Set<ShapeView> = new Set<ShapeView>([page]);

            parents.forEach(p => {
                const id = p.id;
                const __set: Set<ShapeView> = new Set();
                let __p: ShapeView | undefined = p;
                let layoutCount = 0;
                while (__p) {
                    __set.add(__p);
                    __p = __p.parent;
                    layoutCount++;
                }

                if (layoutCount > longest) {
                    longest = layoutCount;
                    longestChains = __set;
                }

                chains.set(id, __set);
            })

            const __longestChains = Array.from(longestChains.values());

            let env: ShapeView = page;
            for (let i = 0; i < __longestChains.length; i++) {
                env = __longestChains[i];

                let isCommon = true;
                chains.forEach(c => {
                    if (!c.has(env)) {
                        isCommon = false;
                    }
                })

                if (isCommon) {
                    break;
                }
            }
            this.m_collect_target = [env];
        }

        if (collect_immediate) {
            this.collect();
        }
    }

    set_collect_target_force(shapes: ShapeView[], collect_immediate = false) {
        this.m_collect_target = shapes;
        if (collect_immediate) {
            this.collect();
        }
    }

    collect() {
        // const s = Date.now();
        const page = this.m_context.selection.selectedPage;
        if (page) {
            this.clear();
            let targets: ShapeView[] = this.m_collect_target.length ? this.m_collect_target : [page];
            this.m_shape_inner = [];
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                this.m_shape_inner = this.m_shape_inner
                    .concat(finder(this.m_context, target, this.m_pg_inner, this.m_x_axis, this.m_y_axis));
            }
        }
        // const e = Date.now();
        // console.log('点位收集用时(ms):', e - s);
    }

    set_trans_target(shapes: ShapeView[]) {
        this.m_context.workspace.clear_cache_map();
        this.collect();
        this.m_except.clear();
        if (shapes.length === 1) {
            get_tree(shapes[0], this.m_except);
        } else if (shapes.length > 1) {
            for (let i = 0, len = shapes.length; i < len; i++) {
                get_tree(shapes[i], this.m_except);
            }
        }
    }

    point_match(point: PageXY) {
        // const st = Date.now();
        if (!this.m_except.size) return;
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        // this.m_current_pg = gen_match_points(s);  // *
        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false };
        const pre_target1: PT4P1 = { x: 0, sy: 0, delta: undefined };
        const pre_target2: PT4P2 = { y: 0, sx: 0, delta: undefined };
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
                p: { x: target.x, y: pre_target1.sy },
                id: 'ex'
            }]);
        }
        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;
            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([{
                p: { x: pre_target2.sx, y: target.y },
                id: 'ex'
            }]);
        }
        this.notify(Assist.UPDATE_ASSIST);
        // const e = Date.now();
        // console.log('单次匹配用时(ms):', e - st);
        return target;
    }

    alignX(point: XY, self: XY[]) {
        if (!this.m_except.size) {
            return;
        }

        this.m_nodes_x = [];
        const target = { x: 0, sticked_by_x: false };
        const pre_target: PT4P1 = { x: 0, sy: 0, delta: undefined };

        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const c_pg = this.m_pg_inner.get(shape.id);
            if (!c_pg) {
                continue;
            }

            modify_pt_x4p(pre_target, point, c_pg.apexX, this.m_stickness);
        }

        if (pre_target.delta !== undefined) {
            target.x = pre_target.x;
            target.sticked_by_x = true;

            const _self = [];

            for (let i = 0; i < self.length; i++) {
                _self.push({ id: 'self', p: { x: target.x, y: self[i].y } });
            }

            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat(_self);
        }

        this.notify(Assist.UPDATE_ASSIST);

        return target;
    }

    alignY(point: XY, self: XY[]) {
        if (!this.m_except.size) {
            return;
        }
        this.m_nodes_y = [];
        const target = { y: 0, sticked_by_y: false };
        const pre_target: PT4P2 = { y: 0, sx: 0, delta: undefined };

        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const c_pg = this.m_pg_inner.get(shape.id);
            if (!c_pg) {
                continue;
            }

            modify_pt_y4p(pre_target, point, c_pg.apexY, this.m_stickness);
        }

        if (pre_target.delta !== undefined) {
            target.y = pre_target.y;
            target.sticked_by_y = true;

            const _self = [];

            for (let i = 0; i < self.length; i++) {
                _self.push({ id: 'self', p: { x: self[i].x, y: target.y } })
            }

            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat(_self);
        }

        this.notify(Assist.UPDATE_ASSIST);

        return target;
    }

    alignXY(point: XY) {
        if (!this.m_except.size) {
            return;
        }

        this.m_nodes_x = [];
        this.m_nodes_y = [];

        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false };

        const pre_target1: PT4P1 = { x: 0, sy: 0, delta: undefined };
        const pre_target2: PT4P2 = { y: 0, sx: 0, delta: undefined };

        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const c_pg = this.m_pg_inner.get(shape.id);
            if (!c_pg) {
                continue;
            }

            modify_pt_x4p(pre_target1, point, c_pg.apexX, this.m_stickness);
            modify_pt_y4p(pre_target2, point, c_pg.apexY, this.m_stickness);
        }

        const _self = { id: 'self', p: { x: point.x, y: point.y } };
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x;
            target.sticked_by_x = true;

            _self.p.x = target.x;

            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([_self]);
        }

        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;

            _self.p.y = target.y;

            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([_self]);
        }

        this.notify(Assist.UPDATE_ASSIST);
        return target;
    }

    alignXY2(point: XY) {
        this.m_nodes_x = [];
        this.m_nodes_y = [];

        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false };

        const pre_target1: PT4P1 = { x: 0, sy: 0, delta: undefined };
        const pre_target2: PT4P2 = { y: 0, sx: 0, delta: undefined };

        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const c_pg = this.m_pg_inner.get(shape.id);
            if (!c_pg) {
                continue;
            }

            modify_pt_x4p(pre_target1, point, c_pg.apexX, this.m_stickness);
            modify_pt_y4p(pre_target2, point, c_pg.apexY, this.m_stickness);
        }

        const _self = { id: 'self', p: { x: point.x, y: point.y } };
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x;
            target.sticked_by_x = true;

            _self.p.x = target.x;

            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([_self]);
        }

        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;

            _self.p.y = target.y;

            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([_self]);
        }

        return target;
    }


    alignPoints(livingXs: number[], livingYs: number[]) {
        if (!this.m_except.size) {
            return;
        }
        // this.m_nodes_x = [];
        // this.m_nodes_y = [];

        this.multi_line_x = [];
        this.multi_line_y = [];

        const assistResult = {
            dx: 0,
            dy: 0,
            sticked_by_x: false,
            sticked_by_y: false,
            targetX: 0,
            targetY: 0
        }

        let targetX = Infinity;
        let targetY = Infinity;
        let dx = Infinity;
        let dy = Infinity;

        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const pointsGroup = this.m_pg_inner.get(shape.id);
            if (!pointsGroup) {
                continue;
            }

            const rx = alignXFromPointGroup(dx, pointsGroup.apexX, livingXs);
            dx = rx.dx;
            targetX = rx.targetX;

            const ry = alignYFromPointGroup(dy, pointsGroup.apexY, livingYs);
            dy = ry.dy;
            targetY = ry.targetY;
        }

        if (Math.abs(dx) < this.stickness) {
            assistResult.dx = dx;
            assistResult.sticked_by_x = true;
            assistResult.targetX = targetX;

            // this.m_nodes_x = this.m_x_axis.get(targetX) || [];
            // this.multi_line_x = [targetX];
        }

        if (Math.abs(dy) < this.stickness) {
            assistResult.dy = dy;
            assistResult.sticked_by_y = true;
            assistResult.targetY = targetY;

            // this.m_nodes_y = this.m_y_axis.get(targetY) || [];
            // this.multi_line_y = [targetY];
        }

        return assistResult;
    }

    creator(point: XY) {
        if (!this.m_except.size) {
            return;
        }

        this.m_nodes_x = [];
        this.m_nodes_y = [];

        const target = { x: 0, y: 0, sticked_by_x: false, sticked_by_y: false };

        const pre_target1: PT4P1 = { x: 0, sy: 0, delta: undefined };
        const pre_target2: PT4P2 = { y: 0, sx: 0, delta: undefined };

        for (let i = 0, len = this.m_shape_inner.length; i < len; i++) {
            const shape = this.m_shape_inner[i];
            if (this.m_except.get(shape.id)) {
                continue;
            }

            const c_pg = this.m_pg_inner.get(shape.id);
            if (!c_pg) {
                continue;
            }

            modify_pt_x4p(pre_target1, point, c_pg.apexX, this.m_stickness);
            modify_pt_y4p(pre_target2, point, c_pg.apexY, this.m_stickness);
        }

        const _self = { id: 'self', p: { x: point.x, y: point.y } };
        if (pre_target1.delta !== undefined) {
            target.x = pre_target1.x;
            target.sticked_by_x = true;

            _self.p.x = target.x;

            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat([_self]);
        }

        if (pre_target2.delta !== undefined) {
            target.y = pre_target2.y;
            target.sticked_by_y = true;

            _self.p.y = target.y;

            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat([_self]);
        }

        return target;
    }

    reset() {
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_nodes_x2 = [];
        this.m_nodes_y2 = [];
        this.multi_line_x = [];
        this.multi_line_y = [];
        this.m_except.clear();
        this.m_current_pg = undefined;
        this.notify(Assist.CLEAR);
    }
}