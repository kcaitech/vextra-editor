import { accurateBezierCrossPoint, B3Curve, ICrossPoint, solveBezierLineCrossPoint } from "./b3curve";
import { Box, float_accuracy, ISegment, Line, Point, solveLineCrossPoint, solvePointTOfLine } from "./basic";

export class B3Path extends Array<ISegment> {
    private m_bbox?: Box;
    private m_obox?: Box;
    static make() {
        return new B3Path();
    }
    get bbox(): Box {
        if (this.m_bbox) return this.m_bbox;
        if (this.length == 0) {
            return (this.m_bbox = Box.make(0, 0, 0, 0));
        }
        this.m_bbox = this.reduce<Box>(function (p: Box, c: ISegment): Box {
            p.union(c.bbox);
            return p;
        }, Box.make(this[0].start, this[0].end));
        return this.m_bbox;
    }
    clone(): B3Path {
        const p = <B3Path>this.map((v) => v.clone());
        if (this.m_bbox) p.m_bbox = this.m_bbox.clone();
        if (this.m_obox) p.m_obox = this.m_obox.clone();
        return p;
    }
    reverse(): B3Path {
        this.forEach((v) => v.invert());
        return <B3Path>super.reverse();
    }
    innerRevert() {
        this.forEach((v) => v.invert());
    }
    nonezeroCount(l: Line, exclude?: ISegment):number {
        return this.reduce<number>((count, curve) => {
            if (exclude && exclude.equals(curve)) return count;
            return count + curve.nonezeroCount(l);
        }, 0);
    }
}

export enum InnerSide {
    Left,
    Right,
    Bouth,
}

export interface PathSegment {
    segment:B3Path, 
    origin:B3Path,
    inside?:InnerSide, 
    used?: boolean,
}

/**
 * segment: 曲线片段
 * inside: 曲线前进方向的左边还是右边是在曲线内部（有填充）
 * origin: 曲线片段的原始路径
 */
export class B3PathSegments extends Array<PathSegment> {
    private m_endpoints:{[key:string]: [PathSegment]} = {};
    private m_startpoints:{[key:string]: [PathSegment]} = {};
    static make() {
        return new B3PathSegments();
    }
    push(val: {segment:B3Path, inside?:InnerSide, origin:B3Path}) {
        const start = val.segment[0].start;
        const end = val.segment[val.segment.length - 1].end;
        this.m_startpoints[start.toString()] && this.m_startpoints[start.toString()].push(val) 
            || (this.m_startpoints[start.toString()] = [val]);
        this.m_endpoints[end.toString()] && this.m_endpoints[end.toString()].push(val) 
            || (this.m_endpoints[end.toString()] = [val]);
        return super.push(val);
    }
    getStartSegments(startPoint: Point): PathSegment[] {
        return this.m_startpoints[startPoint.toString()];
    }
    getEndSegments(endPoint: Point): PathSegment[] {
        return this.m_endpoints[endPoint.toString()];
    }
}

export class PathCrossPoint implements ICrossPoint {
    private m_point: Point;
    private m_c0: ISegment;
    private m_c1: ISegment;
    private m_t0: number;
    private m_t1: number;
    private m_index0: number; // ref to path
    private m_path0: B3Path;
    private m_index1: number; // ref to path
    private m_path1: B3Path;
    constructor(p: ICrossPoint, path0: B3Path, idx0: number, path1: B3Path, idx1: number) {
        this.m_point = p.point;
        this.m_c0 = p.c0;
        this.m_t0 = p.t0;
        this.m_c1 = p.c1;
        this.m_t1 = p.t1;
        this.m_index0 = idx0;
        this.m_index1 = idx1;
        this.m_path0 = path0;
        this.m_path1 = path1;
    }
    static make(p: ICrossPoint, path0: B3Path, idx0: number, path1: B3Path, idx1: number) {
        return new PathCrossPoint(p, path0, idx0, path1, idx1);
    }
    get point() {
        return this.m_point;
    }
    get c0() {
        return this.m_c0;
    }
    get t0() {
        return this.m_t0;
    }
    get c1() {
        return this.m_c1;
    }
    get t1() {
        return this.m_t1;
    }
    get index0() {
        return this.m_index0;
    }
    get index1() {
        return this.m_index1;
    }
    get path0() {
        return this.m_path0;
    }
    get path1() {
        return this.m_path1;
    }
    improveAccuracy() {
        if (this.m_c0 instanceof B3Curve && this.m_c1 instanceof B3Curve) {
            const { t0, t1 } = accurateBezierCrossPoint(this.m_c0, this.m_t0, this.m_c1, this.m_t1);
            this.m_t0 = t0;
            this.m_t1 = t1;
            this.m_point = this.m_c0.getPointAt(t0);
        }
        else if (this.m_c0 instanceof Line && this.m_c1 instanceof B3Curve) {
            const points:ICrossPoint[] = solveBezierLineCrossPoint(this.m_c0, this.m_c1);
            if (points.length !== 1) {
                throw new Error("??");
            }
            const p = points[0];
            this.m_t0 = p.t0;
            this.m_t1 = p.t1;
            this.m_point = p.point;
        }
        else if (this.m_c0 instanceof B3Curve && this.m_c1 instanceof Line) {
            const points:ICrossPoint[] = solveBezierLineCrossPoint(this.m_c1, this.m_c0);
            if (points.length !== 1) {
                throw new Error("??");
            }
            const p = points[0];
            this.m_t0 = p.t0;
            this.m_t1 = p.t1;
            this.m_point = p.point;
        }
    }
}

interface RemainRule {
    remainOut: boolean,
    remainInside: boolean,
}

// rules {
// for path0: { remainOutIf paht1? remainInside path1?}
// for path1: { remainOut }
// }
export function intersections(_this: B3Path, p: B3Path): PathCrossPoint[] {
    const ret: PathCrossPoint[] = [];
    _this.forEach((c0, i) => p.forEach((c1, j) => {
        const c0d = c0.discretize;
        const c1d = c1.discretize;
        c0d.forEach((d0) => c1d.forEach((d1) => {
            const crossPoint = solveLineCrossPoint(d0.start, d0.end, d1.start, d1.end)[0];
            if (crossPoint) {
                const t0 = solvePointTOfLine(crossPoint, d0.start, d0.end) * d0.offsetTLen + d0.offsetT;
                const t1 = solvePointTOfLine(crossPoint, d1.start, d1.end) * d1.offsetTLen + d1.offsetT;
                ret.push(PathCrossPoint.make({point:crossPoint, c0, t0, c1, t1}, _this, i, p, j));
            }
        }))
    }))
    return ret;
    // 去重
    // return ret.reduce<PathCrossPoint[]>((pre, c) => {
    //     if (pre.length > 0) {
    //         const last = pre[pre.length - 1];
    //         if (!last.point.equals(c.point)) {
    //             pre.push(c);
    //         }
    //     }
    //     else {
    //         pre.push(c);
    //     }
    //     return pre;
    // }, []);
}

export function selfIntersections(_this: B3Path): PathCrossPoint[] {
    const ret: PathCrossPoint[] = [];
    const len = _this.length;
    for (let i = 1; i < len; i++) {
        for (let j = 0; j < i; j++) {
            const c0 = _this[i];
            const c1 = _this[j];
            const c0d = c0.discretize;
            const c1d = c1.discretize;
            c0d.forEach((d0) => c1d.forEach((d1) => {
                const crossPoint = solveLineCrossPoint(d0.start, d0.end, d1.start, d1.end)[0];
                if (crossPoint) {
                    const t0 = solvePointTOfLine(crossPoint, d0.start, d0.end) * d0.offsetTLen + d0.offsetT;
                    const t1 = solvePointTOfLine(crossPoint, d1.start, d1.end) * d1.offsetTLen + d1.offsetT;
                    ret.push(PathCrossPoint.make({point:crossPoint, c0, t0, c1, t1}, _this, i, _this, j));
                }
            }))
        }
    }
    return ret;
}

export function splitAtInters(_this: B3Path, inters: PathCrossPoint[]) {
    const indexs = [];
    for (let i = 0; i < inters.length; i++) {
        const inter = inters[i];
        if (inter.path0 == _this) {
            indexs.push({ i: inter.index0, t: inter.t0, p: inter.point })
        }
        else if (inter.path1 == _this) {
            indexs.push({ i: inter.index1, t: inter.t1, p: inter.point })
        }
    }
    let offset = 0;
    indexs.sort((a, b) => { return a.i - b.i || a.t - b.t });
    for (let i = 0, len = indexs.length; i < len; i++) {
        const ii = indexs[i];
        const idx = ii.i + offset;
        const t = ii.t;
        if (Math.abs(t) < float_accuracy || Math.abs(1-t) < float_accuracy) { // 端点
            continue;
        }
        const c = _this[idx];
        const s = c.split(t, ii.p);
        _this.splice(idx, 1, ...s);
        offset++;
        // todo 同一个curve多次split
        for (let j = i + 1; j < len; j++) {
            const ji = indexs[j];
            if (ji.i !== ii.i) {
                break;
            }
            ji.t = (ji.t - t) / (1-t);
        }
    }
}

// path自己相交，需要拆分成几个闭合路径跟非闭合路径
// 不然后面的算法不好处理
// 如8字形的路径，在8的中间处，路径的内外方向反转了
function spliceAtSelfInters(_this: B3Path, inters: PathCrossPoint[]): B3Path[] {
    return [];
}

export class PathCoincident {

}

export function coincidents(path0: B3Path, path1: B3Path): PathCoincident {
    /*
    case 1
    this ---------------------
    other           ------------------

    case 2
    this           -------------
    other ----------------

    case 3
    this --------------------------
    other       -----------

    case 4
    this        ---------
    other ---------------------------
    */

    path0.forEach((c0, i) => path1.forEach((c1, j) => {

    }))

    return {};
}