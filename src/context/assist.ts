import { ArtboradView, GuideAxis, ShapeType, ShapeView, WatchableObject } from "@kcdesign/data";
import { PageXY, XY } from "./selection";
import { Context } from ".";
import {
    alignXFromPointGroup,
    alignYFromPointGroup,
    finder,
    get_tree,
    modify_pt_x4p,
    modify_pt_y4p
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

export interface PageXY2 {
    id: string
    p: PageXY
}

interface AssistGuide {
    env: ShapeView;
    offsetFix: number;
    offsetRoot: number;
    axis: GuideAxis;
}

export class Assist extends WatchableObject {
    readonly m_context: Context;

    static UPDATE_ASSIST = 1;
    static CLEAR = 3;
    static UPDATE_ASSIST_PATH = 4;
    static MULTI_LINE_ASSIST = 7;
    private m_stickness: number = 5;
    private m_collect_target: ShapeView | undefined;

    private m_shape_inner: ShapeView[] = [];
    private m_pg_inner: Map<string, PointGroup1> = new Map();
    private m_x_axis: Map<number, PageXY2[]> = new Map();
    private m_y_axis: Map<number, PageXY2[]> = new Map();
    private m_except: Map<string, ShapeView> = new Map();
    private m_nodes_x: PageXY2[] = [];
    private m_nodes_y: PageXY2[] = [];

    multi_line_x: { x: number, pre: XY[] }[] = [];
    multi_line_y: { y: number, pre: XY[] }[] = [];

    highlight_guide_x: string[] = [];
    highlight_guide_y: string[] = [];

    private m_nodes_x2: XY[] = [];
    private m_nodes_y2: XY[] = [];

    private m_fixed_target: ShapeView | undefined;

    m_guides_x: AssistGuide[] = [];
    m_guides_y: AssistGuide[] = [];

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

        this.m_guides_x.length = 0;
        this.m_guides_y.length = 0;
    }

    get fixedTarget() {
        return this.m_fixed_target;
    }

    set_collect_target(shapes: ShapeView[], collect_immediate = false) {
        const page = this.m_context.selection.selectedPage!;

        if (!shapes.length) {
            this.m_collect_target = page;
        }

        const parents: Map<string, ShapeView> = new Map();
        for (let i = 0; i < shapes.length; i++) {
            const parent = shapes[i].parent!;
            parents.set(parent.id, parent);
        }

        if (parents.has(page.id)) {
            this.m_collect_target = page;
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
            this.m_collect_target = env;
        }

        if (collect_immediate) {
            this.collect();
        }
    }

    collect() {
        // const s = Date.now();
        this.clear();
        const target: ShapeView = this.m_collect_target || this.m_context.selection.selectedPage!;
        this.m_shape_inner = [];
        this.m_shape_inner.push(...finder(this.m_context, target, this.m_pg_inner, this.m_x_axis, this.m_y_axis));

        if (this.m_context.user.isRuleVisible) {
            this.collectGuides();
        }
        // console.log('__COLLECT_TARGET__', target.name, (target as ArtboradView).guides?.length);
        // const e = Date.now();
        // console.log('点位收集用时(ms):', e - s);
    }

    collectGuides() {
        const guideTarget = this.getFixedContainer() as ArtboradView;

        this.m_fixed_target = guideTarget;

        const guides = guideTarget?.guides;
        if (!guides?.length) {
            return;
        }

        const gxs = this.m_guides_x;
        const gys = this.m_guides_y;

        if (guideTarget.type !== ShapeType.Page) {
            const matrix = guideTarget.matrix2Root();
            for (let i = 0; i < guides.length; i++) {
                const { axis, offset } = guides[i];
                const assistGui: AssistGuide = {
                    env: guideTarget,
                    offsetFix: offset,
                    offsetRoot: offset,
                    axis
                }
                if (axis === GuideAxis.X) {
                    assistGui.offsetRoot = matrix.computeCoord2(offset, 0).x;
                    gxs.push(assistGui);
                } else {
                    assistGui.offsetRoot = matrix.computeCoord2(0, offset).y;
                    gys.push(assistGui);
                }
            }
        } else {
            for (let i = 0; i < guides.length; i++) {
                const { axis, offset } = guides[i];
                const assistGui: AssistGuide = {
                    env: guideTarget,
                    offsetFix: offset,
                    offsetRoot: offset,
                    axis
                }
                if (axis === GuideAxis.X) {
                    gxs.push(assistGui);
                } else {
                    gys.push(assistGui);
                }
            }
        }
        // console.log('__GUIDE_TARGET__', guideTarget.name);
        // console.log('__GUIX__', this.m_guides_x);
        // console.log('__GUIY__', this.m_guides_y);
    }

    getFixedContainer() {
        const page = this.m_context.selection.selectedPage!;
        let target = this.m_collect_target || page;

        if (target.type === ShapeType.Page) {
            return page;
        } else {
            while (target) {
                if (target.type === ShapeType.Page || (target.isContainer && target.parent?.type === ShapeType.Page && !((target.rotation || 0) % 180))) {
                    break;
                }
                target = target.parent as any
            }
        }
        return target;
    }

    set_trans_target(shapes: ShapeView[]) {
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

        const hgx = this.highlight_guide_x;
        hgx.length = 0;

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

        // 参考线
        let sparkX = false;
        if (this.m_guides_x.length) {
            const gx = this.m_guides_x.map(g => g.offsetRoot);
            sparkX = modify_pt_x4p(pre_target, point, gx, this.m_stickness);
        }

        if (pre_target.delta !== undefined) {
            target.x = pre_target.x;
            target.sticked_by_x = true;

            const _self = [];

            for (let i = 0; i < self.length; i++) {
                _self.push({ id: 'self', p: { x: target.x, y: self[i].y } });
            }

            this.m_nodes_x = (this.m_x_axis.get(target.x) || []).concat(_self);

            const fixed = this.fixedTarget;
            if (sparkX && fixed) {
                if (fixed.type === ShapeType.Page) {
                    const matrix = this.m_context.workspace.matrix;
                    const guides_x = this.m_guides_x;
                    const height = this.m_context.workspace.root.height;
                    for (let i = 0; i < guides_x.length; i++) {
                        let offset = guides_x[i].offsetRoot;
                        if (offset !== _self[0]?.p.x) {
                            continue;
                        }
                        offset = matrix.computeCoord2(offset, 0).x;
                        hgx.push(`M${offset} 0 L${offset} ${height}`);
                    }
                } else {
                    const guides_x = this.m_guides_x;
                    const height = fixed.frame.height;
                    const matrix = fixed.matrix2Root();
                    matrix.multiAtLeft(this.m_context.workspace.matrix);

                    for (let i = 0; i < guides_x.length; i++) {
                        const g = guides_x[i];
                        let offset = g.offsetRoot;

                        if (offset !== _self[0]?.p.x) {
                            continue;
                        }

                        offset = g.offsetFix;

                        const start = matrix.computeCoord2(offset, 0);
                        const end = matrix.computeCoord2(offset, height);

                        hgx.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                    }
                }
            }
        }

        this.notify(Assist.UPDATE_ASSIST);

        return target;
    }

    alignY(point: XY, self: XY[]) {
        if (!this.m_except.size) {
            return;
        }

        const hgy = this.highlight_guide_y;
        hgy.length = 0;

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

        // 参考线
        let sparkY = false;
        if (this.m_guides_y.length) {
            const gy = this.m_guides_y.map(g => g.offsetRoot);
            sparkY = modify_pt_y4p(pre_target, point, gy, this.m_stickness);
        }

        if (pre_target.delta !== undefined) {
            target.y = pre_target.y;
            target.sticked_by_y = true;

            const _self = [];

            for (let i = 0; i < self.length; i++) {
                _self.push({ id: 'self', p: { x: self[i].x, y: target.y } })
            }

            this.m_nodes_y = (this.m_y_axis.get(target.y) || []).concat(_self);

            const fixed = this.fixedTarget;
            if (sparkY && fixed) {
                if (fixed.type === ShapeType.Page) {
                    const matrix = this.m_context.workspace.matrix;
                    const guides_y = this.m_guides_y;
                    const width = this.m_context.workspace.root.width;
                    for (let i = 0; i < guides_y.length; i++) {
                        let offset = guides_y[i].offsetRoot;
                        if (offset !== _self[0]?.p.y) {
                            continue;
                        }
                        offset = matrix.computeCoord2(0, offset).y;
                        hgy.push(`M0 ${offset} L${width} ${offset}`);
                    }
                } else {
                    const guides_y = this.m_guides_y;
                    const width = fixed.frame.width;
                    const matrix = fixed.matrix2Root();
                    matrix.multiAtLeft(this.m_context.workspace.matrix);

                    for (let i = 0; i < guides_y.length; i++) {
                        const g = guides_y[i];
                        let offset = g.offsetRoot;

                        if (offset !== _self[0]?.p.y) {
                            continue;
                        }

                        offset = g.offsetFix;

                        const start = matrix.computeCoord2(0, offset);
                        const end = matrix.computeCoord2(width, offset);

                        hgy.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                    }
                }
            }
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

        const hgx = this.highlight_guide_x;
        const hgy = this.highlight_guide_y;
        hgx.length = 0;
        hgy.length = 0;

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

        // 参考线
        let sparkX = false;
        let sparkY = false;
        if (this.m_guides_x.length) {
            const gx = this.m_guides_x.map(g => g.offsetRoot);
            sparkX = modify_pt_x4p(pre_target1, point, gx, this.m_stickness);
        }
        if (this.m_guides_y.length) {
            const gy = this.m_guides_y.map(g => g.offsetRoot);
            sparkY = modify_pt_y4p(pre_target2, point, gy, this.m_stickness);
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

        const fixed = this.fixedTarget;

        if (pre_target1.delta !== undefined && sparkX && fixed) {
            if (fixed.type === ShapeType.Page) {
                const matrix = this.m_context.workspace.matrix;
                const guides_x = this.m_guides_x;
                const height = this.m_context.workspace.root.height;
                for (let i = 0; i < guides_x.length; i++) {
                    let offset = guides_x[i].offsetRoot;
                    if (offset !== _self.p.x) {
                        continue;
                    }
                    offset = matrix.computeCoord2(offset, 0).x;
                    hgx.push(`M${offset} 0 L${offset} ${height}`);
                }
            } else {
                const guides_x = this.m_guides_x;
                const height = fixed.frame.height;
                const matrix = fixed.matrix2Root();
                matrix.multiAtLeft(this.m_context.workspace.matrix);

                for (let i = 0; i < guides_x.length; i++) {
                    const g = guides_x[i];
                    let offset = g.offsetRoot;

                    if (offset !== _self.p.x) {
                        continue;
                    }

                    offset = g.offsetFix;

                    const start = matrix.computeCoord2(offset, 0);
                    const end = matrix.computeCoord2(offset, height);

                    hgx.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                }
            }
        }
        if (pre_target2.delta !== undefined && sparkY && fixed) {
            if (fixed.type === ShapeType.Page) {
                const matrix = this.m_context.workspace.matrix;
                const guides_y = this.m_guides_y;
                const width = this.m_context.workspace.root.width;
                for (let i = 0; i < guides_y.length; i++) {
                    let offset = guides_y[i].offsetRoot;

                    if (offset !== _self.p.y) {
                        continue;
                    }
                    offset = matrix.computeCoord2(0, offset).y;
                    hgy.push(`M0 ${offset} L${width} ${offset}`);
                }
            } else {
                const guides_y = this.m_guides_y;
                const width = fixed.frame.width;
                const matrix = fixed.matrix2Root();
                matrix.multiAtLeft(this.m_context.workspace.matrix);

                for (let i = 0; i < guides_y.length; i++) {
                    const g = guides_y[i];
                    let offset = g.offsetRoot;

                    if (offset !== _self.p.y) {
                        continue;
                    }

                    offset = g.offsetFix;

                    const start = matrix.computeCoord2(0, offset);
                    const end = matrix.computeCoord2(width, offset);

                    hgy.push(`M${start.x} ${start.y} L${end.x} ${end.y}`);
                }
            }
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

        this.multi_line_x = [];
        this.multi_line_y = [];

        const assistResult = {
            dx: 0,
            dy: 0,
            sticked_by_x: false,
            sticked_by_y: false,
            targetX: 0,
            targetY: 0,
            sparkX: false,
            sparkY: false
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

        if (this.m_guides_x.length) {
            const gx = this.m_guides_x.map(g => g.offsetRoot);
            const rx = alignXFromPointGroup(dx, gx, livingXs);
            dx = rx.dx;
            targetX = rx.targetX;
            assistResult.sparkX = rx.spark;
        }
        if (this.m_guides_y.length) {
            const gy = this.m_guides_y.map(g => g.offsetRoot);
            const ry = alignYFromPointGroup(dy, gy, livingYs);
            dy = ry.dy;
            targetY = ry.targetY;
            assistResult.sparkY = ry.spark;
        }

        if (Math.abs(dx) < this.stickness) {
            assistResult.dx = dx;
            assistResult.sticked_by_x = true;
            assistResult.targetX = targetX;
        }

        if (Math.abs(dy) < this.stickness) {
            assistResult.dy = dy;
            assistResult.sticked_by_y = true;
            assistResult.targetY = targetY;
        }

        return assistResult;
    }

    reset() {
        this.m_nodes_x = [];
        this.m_nodes_y = [];
        this.m_nodes_x2 = [];
        this.m_nodes_y2 = [];
        this.multi_line_x = [];
        this.multi_line_y = [];
        this.m_except.clear();
        this.notify(Assist.CLEAR);
    }
}