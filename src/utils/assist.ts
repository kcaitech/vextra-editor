import { Context } from "@/context";
import { PageXY2, PointGroup1, PT4P1, PT4P2 } from "@/context/assist";
import { PageXY } from "@/context/selection";
import { Matrix, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import { debounce } from "lodash";

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
export function collect_point_group(host: ShapeView, align: boolean): PointGroup1 {
    const m = host.matrix2Root();
    const f = host.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    if (host.type === ShapeType.Line) { // todo 修改直线的收集方式
        const apexX = [lt.x, rb.x, pivot.x];
        const apexY = [lt.y, rb.y, pivot.y];
        return { lt, rb, pivot, apexX, apexY };
    }
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);

    if (align) {
        lt.x = Math.round(lt.x);
        lt.y = Math.round(lt.y);
        rb.x = Math.round(rb.x);
        rb.y = Math.round(rb.y);
        pivot.x = Math.round(pivot.x);
        pivot.y = Math.round(pivot.y);
        rt.x = Math.round(rt.x);
        rt.y = Math.round(rt.y);
        lb.x = Math.round(lb.x);
        lb.y = Math.round(lb.y);
    }

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

export function isShapeOut(context: Context, shape: Shape | ShapeView) {
    const m = shape.matrix2Root();
    m.multiAtLeft(context.workspace.matrix);

    const f = shape.frame;
    const r = f.x + f.width;
    const b = f.y + f.height;
    const x = f.x;
    const y = f.y;

    const point: { x: number, y: number }[] = [
        m.computeCoord2(x, y),
        m.computeCoord2(r, y),
        m.computeCoord2(r, b),
        m.computeCoord2(x, b)
    ];

    const { width, height } = context.workspace.root;

    return Math.min(point[0].x, point[1].x, point[2].x, point[3].x) > width ||
        Math.max(point[0].x, point[1].x, point[2].x, point[3].x) < 0 ||
        Math.max(point[0].y, point[1].y, point[2].y, point[3].y) < 0 ||
        Math.min(point[0].y, point[1].y, point[2].y, point[3].y) > height;
}

export function finder(context: Context, scope: ShapeView, all_pg: Map<string, PointGroup1>, x_axis: Map<number, PageXY2[]>, y_axis: Map<number, PageXY2[]>) {
    let result: ShapeView[] = [];
    const align = context.user.isPixelAlignMent;
    if (scope.type === ShapeType.Artboard || scope.type === ShapeType.Symbol) {
        result.push(scope);
        const pg = collect_point_group(scope, align);
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
        const pg = collect_point_group(c, align);
        all_pg.set(c.id, pg);
        const pvs = Object.values(pg);
        for (let i = 0, len = pvs.length; i < len; i++) {
            const p2 = { id: c.id, p: pvs[i] };
            const x = x_axis.get(p2.p.x);
            const y = y_axis.get(p2.p.y);
            if (x) x.push(p2); else x_axis.set(p2.p.x, [p2]);
            if (y) y.push(p2); else y_axis.set(p2.p.y, [p2]);
        }

        if (c.type === ShapeType.Group) {
            result = result.concat(finder(context, c, all_pg, x_axis, y_axis));
        }
    }
    return result;
}

export function _collect(context: Context, new_matrix: Matrix) {
    // 调整到每次执行transform任务前
    // context.assist.collect();
    context.assist.set_stickness(5 / new_matrix.m00);
}

export const collect_once = debounce(_collect, 100);

export function alignXFromPointGroup(dx: number, xs: number[], livingXs: number[]) {
    let livingD = dx;
    let livingAD = Math.abs(dx);
    let targetX = 0;
    let spark = false;

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
                spark = true;
            }
        }
    }
    return { dx: livingD, targetX, spark };
}

export function alignYFromPointGroup(dy: number, ys: number[], livingYs: number[]) {
    let livingD = dy;
    let livingAD = Math.abs(dy);
    let targetY = 0;
    let spark = false;

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
                spark = true;
            }
        }
    }
    return { dy: livingD, targetY, spark };
}

export function alignXFromSpacePoint(dx: number, xs: number[], livingXs: number[]) {
    let livingD = dx;
    let livingAD = Math.abs(dx);
    let targetX = 0;
    let spark = false;

    const x = livingXs[1];

    for (let j = 0; j < xs.length; j++) {
        const fixedX = xs[j];
        const d = fixedX - x;
        const ad = Math.abs(d);

        if (ad < livingAD) {
            livingD = d;
            livingAD = ad;
            targetX = fixedX;
            spark = true;
        }
    }
    return { dx: livingD, targetX, spark };
}

export function alignYFromSpacePoint(dy: number, ys: number[], livingYs: number[]) {
    let livingD = dy;
    let livingAD = Math.abs(dy);
    let targetY = 0;
    let spark = false;

    const y = livingYs[1];

    for (let j = 0; j < ys.length; j++) {
        const fixedY = ys[j];
        const d = fixedY - y;
        const ad = Math.abs(d);

        if (ad < livingAD) {
            livingD = d;
            livingAD = ad;
            targetY = fixedY;
            spark = true;
        }
    }
    return { dy: livingD, targetY, spark };
}
export function modify_pt_x4p(pre_target1: PT4P1, p: PageXY, apexX: number[], stickness: number) {
    let working = false;
    for (let i = 0, len = apexX.length; i < len; i++) {
        const x = apexX[i]
        const delta = Math.abs(x - p.x);
        if (delta < stickness && (pre_target1.delta === undefined || delta < pre_target1.delta)) {
            pre_target1.delta = delta;
            pre_target1.x = x;
            pre_target1.sy = p.y;
            working = true;
        }
    }
    return working;
}

export function modify_pt_y4p(pre_target2: PT4P2, p: PageXY, apexY: number[], stickness: number) {
    let working = false;
    for (let i = 0, len = apexY.length; i < len; i++) {
        const y = apexY[i]
        const delta = Math.abs(y - p.y);
        if (delta < stickness && (pre_target2.delta === undefined || delta < pre_target2.delta)) {
            pre_target2.delta = delta;
            pre_target2.y = y;
            pre_target2.sx = p.x;
            working = true;
        }
    }
    return working;
}

export function get_tree(shape: ShapeView, init: Map<string, ShapeView>) {
    init.set(shape.id, shape);

    if (shape.type === ShapeType.Table) {
        return;
    }

    const cs = shape.childs;
    if (!cs?.length) {
        return;
    }

    for (let i = 0, len = cs.length; i < len; i++) {
        get_tree(cs[i], init);
    }
}