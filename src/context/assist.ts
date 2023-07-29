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
    private m_context: Context;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    init() {
        this.m_context.selection.watch(this.selection_watcher.bind(this));
    }
    update() { }
    adsorb() { }
    /**
     * @description 收集在画面内的图形
     */
    collect() {
        const page = this.m_context.selection.selectedPage;
        if (!page) return;
        const root = this.m_context.workspace.root;
        const w_m = this.m_context.workspace.matrix;

    }
    selection_watcher(t?: any) {
        if (t === Selection.CHANGE_SHAPE) {
            const selected = this.m_context.selection.selectedShapes;
            if (selected.length) {
                console.log(getClosestAB(selected[0]).name);
            } else {
                console.log('page');
            }
        } else if (t === Selection.CHANGE_PAGE) {
            console.log('page');
        }
    }
}

function update_pg(s: Shape) {
    const m = s.matrix2Root(), f = s.frame;
    return {
        host: s.id,
        lt: m.cc(0, 0),
        rt: m.cc(f.width, 0),
        rb: m.cc(f.width, f.height),
        lb: m.cc(0, f.height),
        pivot: m.cc(f.width / 2, f.height / 2)
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
function finder(context: Context, g?: GroupShape) {
    const page = context.selection.selectedPage;
    if (!page) return [];
    const scope = g || page;

}
function getClosestAB(shape: Shape) {
    let resust: GroupShape = shape.parent as GroupShape;
    while (resust && resust.type !== ShapeType.Artboard) resust = shape.parent as GroupShape;
    return resust;
}