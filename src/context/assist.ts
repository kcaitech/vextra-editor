import { GroupShape, Shape, ShapeType, Watchable } from "@kcdesign/data";
import { ClientXY, Selection } from "./selection";
import { Context } from ".";
import { debounce } from "lodash";
interface PointGroup {
    host: Shape
    lt: ClientXY
    rt: ClientXY
    rb: ClientXY
    lb: ClientXY
    pivot: ClientXY
}
export class Asssit extends Watchable(Object) {
    static UPDATE_ASSIST = 1;
    private m_context: Context;
    private m_shape_inner: Shape[] = [];
    private m_pg_inner: Map<string, PointGroup> = new Map();
    private m_x_axis: Map<number, ClientXY[]> = new Map();
    private m_y_axis: Map<number, ClientXY[]> = new Map();
    private m_current_pg: PointGroup | undefined;
    private m_nodes_x: ClientXY[] = [];
    private m_nodes_y: ClientXY[] = [];
    private m_x_sticked: boolean = false;
    private m_y_sticked: boolean = false;
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
        const delta = { x: 0, y: 0 };
        for (let i = 0; i < this.m_shape_inner.length; i++) {
            const cs = this.m_shape_inner[i];
            if (cs.id === s.id) continue;
            const c_pg = this.m_pg_inner.get(cs.id);
            if (!c_pg) continue;
            if (Math.abs(c_pg.lt.x - s_pg.lt.x) < 5) {
                this.m_nodes_x = this.m_x_axis.get(c_pg.lt.x) || [];
                delta.x = c_pg.lt.x - s_pg.lt.x;
            }
            if (Math.abs(c_pg.lt.y - s_pg.lt.y) < 5) {
                this.m_nodes_y = this.m_y_axis.get(c_pg.lt.y) || [];
                delta.x = c_pg.lt.y - s_pg.lt.y;
            }
        }
        this.notify(Asssit.UPDATE_ASSIST);
        const e = Date.now();
        console.log('单次匹配用时(ms):', e - st);
        return delta;
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
function update_pg(s: Shape): PointGroup {
    const m = s.matrix2Root(), f = s.frame;
    return { host: s, lt: m.computeCoord2(0, 0), rt: m.computeCoord2(f.width, 0), rb: m.computeCoord2(f.width, f.height), lb: m.computeCoord2(0, f.height), pivot: m.computeCoord2(f.width / 2, f.height / 2) };
}

function isShapeOut(context: Context, shape: Shape) {
    const { x, y, bottom, right } = context.workspace.root;
    const { width, height } = shape.frame;
    const m = shape.matrix2Root();
    m.multiAtLeft(context.workspace.matrix);
    const point = [[0, 0], [width, 0], [width, height], [0, height]].map(p => {
        const _p = m.computeCoord2(p[0], p[1]);
        return [_p.x, _p.y];
    })
    const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
    const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
    const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
    const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);
    return l > right - x || r < 0 || b < 0 || t > bottom - y;
}
function finder(context: Context, scope: GroupShape, all_pg: Map<string, PointGroup>, x_axis: Map<number, ClientXY[]>, y_axis: Map<number, ClientXY[]>) {
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
function get_nodes_from_pg_by_x(pg: PointGroup, x: number) {
    const result: ClientXY[] = [];
    const pvs = Object.values(pg);
    for (let i = 0; i < pvs.length; i++) {
        const p = pvs[i];
        if (p.x === x) result.push(p);
    }
    return result;
}
function get_nodes_from_pg_by_y(pg: PointGroup, y: number) {
    const result: ClientXY[] = [];
    const pvs = Object.values(pg);
    for (let i = 0; i < pvs.length; i++) {
        const p = pvs[i];
        if (p.y === y) result.push(p);
    }
    return result;
}
export const collect_once = debounce(_collect, 100);