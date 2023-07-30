import { GroupShape, Shape, ShapeType, Watchable } from "@kcdesign/data";
import { PageXY, Selection } from "./selection";
import { Context } from ".";
interface PointGroup {
    host: Shape
    lt: PageXY
    rt: PageXY
    rb: PageXY
    lb: PageXY
    pivot: PageXY
}
export class Asssit extends Watchable(Object) {
    static UPDATE_ASSIST = 1;
    private m_context: Context;
    private m_shape_inner: Map<string, Shape> = new Map();
    private m_pg_inner: Map<string, PointGroup> = new Map();
    private m_current_pg: PointGroup | undefined;
    private m_nodes: PageXY[] = [];
    private m_is_shaps_sticked: number = 0;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    get nodes() {
        return this.m_nodes;
    }
    init() {
        this.m_context.selection.watch(this.selection_watcher.bind(this));
    }
    update() { }
    adsorb() { }
    collect(update_p?: boolean) {
        const page = this.m_context.selection.selectedPage;
        if (!page) return;
        if (update_p) this.m_pg_inner.clear();
        this.m_shape_inner = finder(this.m_context, page, update_p ? this.m_pg_inner : undefined);
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
        this.m_current_pg = update_pg(s);
        const c = this.m_current_pg;
        const delta = { x: 0, y: 0 };
        const nodes: PageXY[] = [];
        let need_update: boolean = false;
        this.m_shape_inner.forEach((v, k) => {
            if (v.id !== s.id) {
                const tg = this.m_pg_inner.get(k);
                if (tg) {
                    if (Math.abs(tg.lt.x - c.lt.x) < 5) {
                        need_update = true;
                        delta.x = tg.lt.x - c.lt.x;
                        nodes.push(...[tg.lt, { x: tg.lt.x, y: c.lt.y }]);
                        this.m_is_shaps_sticked = 1;
                    }
                }
            }
        })
        if (need_update) {
            this.m_nodes = nodes;
            this.notify(Asssit.UPDATE_ASSIST);
        }
        return delta;
    }
    reset() {
        this.m_nodes = [];
        this.notify(Asssit.UPDATE_ASSIST);
    }
}
function update_pg(s: Shape): PointGroup {
    const m = s.matrix2Root(), f = s.frame;
    return {
        host: s, lt: m.cc(0, 0), rt: m.cc(f.width, 0), rb: m.cc(f.width, f.height), lb: m.cc(0, f.height), pivot: m.cc(f.width / 2, f.height / 2)
    }
}

function isShapeOut(context: Context, shape: Shape) {
    const { x, y, bottom, right } = context.workspace.root;
    const { width, height } = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(context.workspace.matrix);
    const point = [[0, 0], [width, 0], [width, height], [0, height]].map(p => {
        const _p = m.cc(p[0], p[1]);
        return [_p.x, _p.y];
    })
    const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
    const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
    const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
    const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);
    return l > right - x || r < 0 || b < 0 || t > bottom - y;
}
function finder(context: Context, scope: GroupShape, u_pg?: Map<string, PointGroup>) {
    let result: Map<string, Shape> = new Map();
    const cs = scope.childs;
    for (let i = 0; i < cs.length; i++) {
        const c = cs[i];
        if (isShapeOut(context, cs[i])) continue;
        result.set(c.id, c);
        if (u_pg) u_pg.set(c.id, update_pg(c));
        if (c instanceof GroupShape) result = new Map([...result, ...finder(context, c, u_pg)]);
    }
    return result;
}
function getClosestAB(shape: Shape) {
    let resust: GroupShape = shape.parent as GroupShape;
    while (resust && resust.type !== ShapeType.Artboard) resust = shape.parent as GroupShape;
    return resust;
}