import { float_accuracy, Box, ISegment, Line, getLinePointAt, Point, solveLineCrossPoint, solvePointSideOfLine, result_accuracy, solvePointTOfLine, solveQubicIn01, solveBezierConvex, solveBezierLength } from "./basic";

function extreme(p0: number, p1: number, p2: number, p3: number): number[] {
    const _a = p3 - p2;
    const _b = p2 - p1;
    const _c = p1 - p0;
    const a = _a - 2 * _b + _c;
    const b = 2 * (_b - _c);
    const c = _c;
    if (a == 0) {
        const r0 = -c / b;
        if (r0 >= 0 && r0 <= 1) return [r0];
        return [];
    }
    const d = b * b - 4 * a * c;
    if (d < 0) return [];
    if (Math.abs(d) < float_accuracy) {
        const r0 = -b / (2 * a);
        if (r0 >= 0 && r0 <= 1) return [r0];
        return [];
    }
    const e = Math.sqrt(d);
    const ret = [];
    const r0 = (-b + e) / (2 * a);
    const r1 = (-b - e) / (2 * a);
    if (r0 >= 0 && r0 <= 1) ret.push(r0);
    if (r1 >= 0 && r1 <= 1 && Math.abs(r0 - r1) > float_accuracy) ret.push(r1);
    return ret.sort();
}

function cordAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const _t = 1 - t;
    const _t_2 = _t * _t;
    const _t_3 = _t_2 * _t;
    const t_2 = t * t;
    const t_3 = t_2 * t;
    return p0 * _t_3 + 3 * p1 * t * _t_2 + 3 * p3 * t_2 * _t + p3 * t_3;
}

function bpointAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const x = cordAt(p0.x, p1.x, p2.x, p3.x, t);
    const y = cordAt(p0.y, p1.y, p2.y, p3.y, t);
    return Point.make(x, y);
}

function splitCurve(p0: Point, p1: Point, p2: Point, p3: Point, t: number, p?: Point): B3Curve[] {
    const p10: Point = Point.make(p0.x + t * (p1.x - p0.x), p0.y + t * (p1.y - p0.y))
    const p11: Point = Point.make(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y))
    const p12: Point = Point.make(p2.x + t * (p3.x - p2.x), p2.y + t * (p3.y - p2.y))
    const p20: Point = Point.make(p10.x + t * (p11.x - p10.x), p10.y + t * (p11.y - p10.y))
    const p21: Point = Point.make(p11.x + t * (p12.x - p11.x), p11.y + t * (p12.y - p11.y))
    const p30: Point = p ? p : Point.make(p20.x + t * (p21.x - p20.x), p20.y + t * (p21.y - p20.y))

    // if (p) {
    //     console.log("split", p, Point.make(p20.x + t * (p21.x - p20.x), p20.y + t * (p21.y - p20.y)));
    // }
    const curve0: B3Curve = B3Curve.make(p0, p10, p20, p30);
    const curve1: B3Curve = B3Curve.make(p30, p21, p12, p3);
    return [curve0, curve1];
}

export class B3Curve implements ISegment {
    private m_start: Point;
    private m_c0: Point;
    private m_c1: Point;
    private m_end: Point;
    private m_bbox?: Box;
    private m_isLine?: boolean;
    private m_rawdiscretize?: B3Curve[]; // 粗分裂，用于判断是否有交点
    private m_discretize?: B3Curve[];
    private m_parent?: B3Curve;
    private m_offsetT: number = 0;
    private m_offsetTLen: number = 1;
    // private m_startPointId?: string;
    // private m_endPointId?: string;
    constructor(start: Point, c0: Point, c1: Point, end: Point) {
        this.m_start = start;
        this.m_c0 = c0;
        this.m_c1 = c1;
        this.m_end = end;
    }
    static make(start: Point, c0: Point, c1: Point, end: Point): B3Curve {
        return new B3Curve(start, c0, c1, end);
    }
    // get startPointId(): string | undefined {
    //     return this.m_startPointId;
    // }
    // get endPointId(): string | undefined {
    //     return this.m_endPointId;
    // }
    equals(curve: ISegment, includeRevert?:boolean): boolean {
        return curve instanceof B3Curve && (
            this.m_start.equals(curve.m_start) &&
            this.m_c0.equals(curve.m_c0) &&
            this.m_c1.equals(curve.m_c1) &&
            this.m_end.equals(curve.m_end) || 
            includeRevert === true && 
            this.m_start.equals(curve.m_end) &&
            this.m_end.equals(curve.m_start) &&
            this.m_c0.equals(curve.m_c1) &&
            this.m_c1.equals(curve.m_c0));
    }
    get rawDiscretize(): B3Curve[] {
        if (this.m_rawdiscretize) return this.m_rawdiscretize;
        this.m_rawdiscretize = extreme(this.m_start.x, this.m_c0.x, this.m_c1.x, this.m_end.x)
            .concat(extreme(this.m_start.y, this.m_c0.y, this.m_c1.y, this.m_end.y))
            .sort()
            .reduce<number[]>((ret, t) => {
                // 去重
                if (Math.abs(t) < float_accuracy || Math.abs(1 - t) < float_accuracy) { // 端点
                    return ret;
                }
                if (ret.length === 0) {
                    ret.push(t);
                }
                else {
                    const last = ret[ret.length - 1];
                    if (Math.abs(last - t) > float_accuracy) {
                        ret.push(t);
                    }
                }
                return ret;
            }, [])
            .reduce<B3Curve[]>((ret, t1, i, arr) => {
                const t0 = i === 0 ? 0 : arr[i - 1];
                const t = (t1 - t0) / (1 - t0);
                const last = ret[ret.length - 1];
                const splits = last.split(t);
                if (splits[0] !== this) {
                    splits[0].m_offsetT = t0;
                    splits[0].m_offsetTLen = t1 - t0;
                    splits[0].m_parent = this;
                    splits[0].m_rawdiscretize = [splits[0]]
                }
                if (splits.length > 1) {
                    splits[1].m_offsetT = t1;
                    splits[1].m_offsetTLen = 1 - t1;
                    splits[1].m_parent = this;
                    splits[1].m_rawdiscretize = [splits[1]]
                }
                ret.splice(ret.length - 1, 1, ...splits);
                return ret;
            }, [this])
        return this.m_rawdiscretize;
    }
    get start() {
        return this.m_start;
    }
    get end() {
        return this.m_end;
    }
    get c0() {
        return this.m_c0;
    }
    get c1() {
        return this.m_c1;
    }
    get bbox(): Box {
        if (this.m_bbox) return this.m_bbox;
        const ret = this.rawDiscretize.reduce((pre, c) => {
            pre.left = Math.min(pre.left, Math.min(c.start.x, c.end.x));
            pre.top = Math.min(pre.top, Math.min(c.start.y, c.end.y));
            pre.right = Math.max(pre.right, Math.max(c.start.x, c.end.x));
            pre.bottom = Math.max(pre.bottom, Math.max(c.start.y, c.end.y));
            return pre;
        },
            { left: this.start.x, top: this.start.y, right: this.start.x, bottom: this.start.y });
        this.m_bbox = Box.make(ret.left, ret.top, ret.right, ret.bottom);
        return this.m_bbox;
    }
    get isLine(): boolean {
        if (this.m_isLine !== undefined) return this.m_isLine;
        this.m_isLine = this.m_start.equals(this.m_c0) && this.m_end.equals(this.m_c1);
        return this.m_isLine;
    }
    split(t: number, p?: Point): B3Curve[] {
        // 边界值判断？
        if (Math.abs(t) < float_accuracy || Math.abs(1 - t) < float_accuracy) { // 端点
            return [this];
        }
        return splitCurve(this.m_start, this.m_c0, this.m_c1, this.m_end, t, p);
    }

    getPointAt(t: number): Point {
        return this.isLine ? getLinePointAt(this.m_start, this.m_end, t) : bpointAt(this.m_start, this.m_c0, this.m_c1, this.m_end, t);
    }

    // intersections(c: ISegment): SegmentCross[] {
    //     return [];
    // }
    clone() {
        const c = B3Curve.make(this.start, this.c0, this.c1, this.end);
        if (this.m_bbox) c.m_bbox = this.m_bbox.clone();
        if (this.m_isLine !== undefined) c.m_isLine = this.m_isLine;
        if (this.m_rawdiscretize) c.m_rawdiscretize = this.m_rawdiscretize;
        if (this.m_discretize) c.m_discretize = this.m_discretize;
        return c;
    }
    invert() {
        // start <-> end
        // c0 <-> c1
        let p = this.m_start;
        this.m_start = this.m_end;
        this.m_end = p;
        p = this.m_c0;
        this.m_c0 = this.m_c1;
        this.m_c1 = p;
    }
    nonezeroCount(l: Line): number {
        if (!l.bbox.intersect(this.bbox)) {
            return 0;
        }
        return this.discretize.reduce<number>((pre, c) => {
            const crossPoint = solveLineCrossPoint(c.start, c.end, l.start, l.end);
            if (crossPoint.length > 0) {
                const d = solvePointSideOfLine(l.start, c.start, c.end);
                pre = d > 0 ? pre - 1 : (d < 0 ? pre + 1 : pre);
            }
            return pre;
        }, 0);
    }
    get discretize(): B3Curve[] {
        if (this.m_discretize) return this.m_discretize;
        const splitAtConvex = (ret: B3Curve[], c: B3Curve, i: number, arr: B3Curve[]) => {
            const t0 = c.offsetT;
            const t1 = t0 + c.offsetTLen;
            const t = 0.5 //solveBezierConvex(c.start, c.c0, c.c1, c.end);
            const splits = c.split(t);
            if (splits[0] !== this) {
                splits[0].m_offsetT = t0;
                splits[0].m_offsetTLen = c.offsetTLen * t;
                splits[0].m_parent = this;
                splits[0].m_rawdiscretize = [splits[0]]
            }
            if (splits.length > 1) {
                splits[1].m_offsetT = t0 + t * (t1 - t0);
                splits[1].m_offsetTLen = c.offsetTLen * (1 - t);
                splits[1].m_parent = this;
                splits[1].m_rawdiscretize = [splits[1]]
            }
            ret.push(...splits);
            return ret;
        }
        const splitAverage = (ret: B3Curve[], c: B3Curve, i: number, arr: B3Curve[]) => {
            const t0 = c.offsetT;
            const oLen = c.offsetTLen;
            const blen = solveBezierLength(c.start, c.c0, c.c1, c.end);
            const count = Math.max(Math.round(blen / 5), 1);
            const step = 1 / count;
            for (let i = 1; i < count; i++) {
                const splits = c.split(step);
                splits[0].m_offsetT = t0 + oLen * step * (i - 1);
                splits[0].m_offsetTLen = oLen * step;
                splits[0].m_parent = this;
                splits[0].m_rawdiscretize = [splits[0]]
                ret.push(splits[0]);
                c = splits[1];
            }
            if (c !== this) {
                c.m_offsetT = t0 + oLen * step * (count - 1);
                c.m_offsetTLen = oLen * step;
                c.m_parent = this;
                c.m_rawdiscretize = [c]
            }
            ret.push(c);
            return ret;
        }
        const raw = this.rawDiscretize;
        this.m_discretize = raw.reduce<B3Curve[]>(splitAtConvex, []) // 2
            .reduce<B3Curve[]>(splitAtConvex, []) // 4
            .reduce<B3Curve[]>(splitAtConvex, []) // 8
            .reduce<B3Curve[]>(splitAverage, []) // 
        return this.m_discretize;// todo
    }
    get offsetT(): number {
        return this.m_offsetT;
    }
    get offsetTLen(): number {
        return this.m_offsetTLen;
    }
}

//---------------------------------------------------------------------
export interface ICrossPoint {
    point: Point,
    c0: ISegment,
    t0: number,
    c1: ISegment,
    t1: number
}

export function solveBezierLineCrossPoint(l: Line, c: B3Curve): ICrossPoint[] {
    if (l.isVerticalLine) {
        const a = -c.start.x + 3 * c.c0.x - 3 * c.c1.x + c.end.x;
        const b = 3 * (c.start.x - 2 * c.c0.x + c.c1.x);
        const _c = -3 * (c.start.x - c.c0.x);
        const d = c.start.x - l.start.x;
        return solveQubicIn01(a, b, _c, d).reduce<ICrossPoint[]>((arr, t) => {
            const p = c.getPointAt(t);
            if (Math.abs(p.x - l.start.x) < (result_accuracy)) {
                arr.push({ point: p, c0: c, t0: t, c1: l, t1: solvePointTOfLine(p, l) });
            }
            return arr;
        }, []);
    }
    else {
        const k = l.k;
        const h = (l.end.x * l.start.y - l.start.x * l.end.y) / (l.end.x - l.start.x);
        const a = k * (-c.start.x + 3 * c.c0.x - 3 * c.c1.x + c.end.x) - (-c.start.y + 3 * c.c0.y - 3 * c.c1.y + c.end.y);
        const b = k * (3 * (c.start.x - 2 * c.c0.x + c.c1.x)) - (3 * (c.start.y - 2 * c.c0.y + c.c1.y));
        const _c = k * (-3 * (c.start.x - c.c0.x)) - (-3 * (c.start.y - c.c0.y));
        const d = k * c.start.x - c.start.y + h;
        return solveQubicIn01(a, b, _c, d).reduce<ICrossPoint[]>((arr, t) => {
            const p = c.getPointAt(t);
            if (Math.abs(p.y - (k * p.x + h)) < (result_accuracy)) {
                arr.push({ point: p, c0: c, t0: t, c1: l, t1: solvePointTOfLine(p, l) });
            }
            return arr;
        }, []);
    }
}

// Improve accuracy
export function accurateBezierCrossPoint(c0: B3Curve, t0: number, c1: B3Curve, t1: number): { t0: number, t1: number } {
    // 梯度下降法提升交点的精度

    return { t0, t1 };
}
