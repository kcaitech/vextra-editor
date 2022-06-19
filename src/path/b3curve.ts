import { float_accuracy, Box, ISegment, Line, solveLineLength, getLinePointAt, Point, solveBezierLength, solveLineCrossPoint, solvePointSideOfLine } from "./basic";

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
    if (d == 0) {
        const r0 = -b / (2 * a);
        if (r0 >= 0 && r0 <= 1) return [r0];
        return [];
    }
    const e = Math.sqrt(d);
    const ret = [];
    const r0 = (-b + e) / (2 * a);
    const r1 = (-b - e) / (2 * a);
    if (r0 >= 0 && r0 <= 1) ret.push(r0);
    if (r1 >= 0 && r1 <= 1) ret.push(r1);
    return ret;
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

function splitCurve(p0: Point, p1: Point, p2: Point, p3: Point, t: number): B3Curve[] {
    const p10: Point = Point.make(p0.x + t * (p1.x - p0.x), p0.y + t * (p1.y - p0.y))
    const p11: Point = Point.make(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y))
    const p12: Point = Point.make(p2.x + t * (p3.x - p2.x), p2.y + t * (p3.y - p2.y))
    const p20: Point = Point.make(p10.x + t * (p11.x - p10.x), p10.y + t * (p11.y - p10.y))
    const p21: Point = Point.make(p11.x + t * (p12.x - p11.x), p11.y + t * (p12.y - p11.y))
    const p30: Point = Point.make(p20.x + t * (p21.x - p20.x), p20.y + t * (p21.y - p20.y))
    const curve0: B3Curve = B3Curve.make(p0, p10, p20, p30);
    const curve1: B3Curve = B3Curve.make(p30, p21, p12, p3);
    return [curve0, curve1];
}

function selfIntersections(bez: B3Curve): { x: number, y: number, t0: number, t1: number }[] {
    // 有没有快速判断的办法
    // x,y各至少1个拐点？
    const ex = extreme(bez.start.x, bez.c0.x, bez.c1.x, bez.end.x);
    if (ex.length == 0) {
        return [];
    }
    const ey = extreme(bez.start.y, bez.c0.y, bez.c1.y, bez.end.y);
    if (ey.length == 0) {
        return [];
    }

    const dots: { p: Point, t: number }[] = bez.discretePoints;
    const n = dots.length;
    const xy: { [key: string]: string } = {},
        res: { x: number, y: number, t0: number, t1: number }[] = [];

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < i - 1; j++) {
            const di: { p: Point, t: number } = dots[i],
                di1: { p: Point, t: number } = dots[i + 1],
                dj: { p: Point, t: number } = dots[j],
                dj1: { p: Point, t: number } = dots[j + 1],
                ci: boolean = Math.abs(di1.p.x - di.p.x) < .001,// ? "y" : "x",
                cj: boolean = Math.abs(dj1.p.x - dj.p.x) < .001,// ? "y" : "x",
                is: Point | undefined = solveLineCrossPoint(di.p,
                    di1.p,
                    dj.p,
                    dj1.p)[0];
            if (is) {
                if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                    continue;
                }
                xy[is.x.toFixed(4)] = is.y.toFixed(4);
                const t1 = di.t + Math.abs((ci ? (is.y - di.p.y) / (di1.p.y - di.p.y) : (is.x - di.p.x) / (di1.p.x - di.p.x))) * (di1.t - di.t),
                    t2 = dj.t + Math.abs((cj ? (is.y - dj.p.y) / (dj1.p.y - dj.p.y) : (is.x - dj.p.x) / (dj1.p.x - dj.p.x)) * (dj1.t - dj.t));
                if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                    (res as { x: number, y: number, t0: number, t1: number }[]).push({
                        x: is.x,
                        y: is.y,
                        t0: Math.min(t1, 1),
                        t1: Math.min(t2, 1)
                    });
                }
            }
        }
    }
    return res;
}

function intersections(bez1: B3Curve, bez2: B3Curve | Line): { x: number, y: number, t0: number, t1: number }[] {
    const bbox1 = bez1.bbox,
        bbox2 = bez2.bbox;
    if (!bbox1.intersect(bbox2)) {
        return [];
    }
    const dots1: { p: Point, t: number }[] = bez1.discretePoints;
    const dots2: { p: Point, t: number }[] = bez2 instanceof Line ? [{ p: bez2.start, t: 0 }, { p: bez2.end, t: 1 }] : bez2.discretePoints;
    const n1 = dots1.length;
    const n2 = dots2.length;
    // const xy: { [key: string]: string } = {}
    const res: { x: number, y: number, t0: number, t1: number }[] = [];

    for (let i = 0; i < n1 - 1; i++) {
        for (let j = 0; j < n2 - 1; j++) {
            const di: { p: Point, t: number } = dots1[i],
                di1: { p: Point, t: number } = dots1[i + 1],
                dj: { p: Point, t: number } = dots2[j],
                dj1: { p: Point, t: number } = dots2[j + 1],
                // ci: boolean = Math.abs(di1.p.x - di.p.x) < .001,// ? "y" : "x",
                // cj: boolean = Math.abs(dj1.p.x - dj.p.x) < .001,// ? "y" : "x",
                is: Point | undefined = solveLineCrossPoint(di.p,
                    di1.p,
                    dj.p,
                    dj1.p)[0];
            if (is) {
                // if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) { // 重复的点
                //     continue;
                // }
                // xy[is.x.toFixed(4)] = is.y.toFixed(4);
                const t1 = Math.sqrt(((is.y - di.p.y) ** 2 + (is.x - di.p.x) ** 2) / ((di1.p.y - di.p.y) ** 2 + (di1.p.x - di.p.x) ** 2)) * (di1.t - di.t) + di.t;
                const t2 = Math.sqrt(((is.y - dj.p.y) ** 2 + (is.x - dj.p.x) ** 2) / ((dj1.p.y - dj.p.y) ** 2 + (dj1.p.x - dj.p.x) ** 2)) * (dj1.t - dj.t) + dj.t;
                if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                    (res as { x: number, y: number, t0: number, t1: number }[]).push({
                        x: is.x,
                        y: is.y,
                        t0: Math.min(t1, 1),
                        t1: Math.min(t2, 1)
                    });
                }
            }
        }
    }
    return res;
}

function intersections2(curve0: B3Curve, curve1: B3Curve | Line): { x: number, y: number, t0: number, t1: number }[] {
    if (!curve0.bbox.intersect(curve1.bbox)) {
        return [];
    }
    // if (curve1 instanceof Line) { // todo
    //     curve1 = B3Curve.make(curve1.start, curve1.start, curve1.end, curve1.end);
    // }

    const ret:{ x: number, y: number, t0: number, t1: number }[] = [];
    const pending:(B3Curve|Line)[] = [curve0, curve1];
    while (pending.length > 0) {
        const c1 = <B3Curve|Line>pending.pop();
        const c0 = <B3Curve|Line>pending.pop();
        if (c0.bbox.isPoint() && c1.bbox.isPoint()) {
                // console.log("intersections2", c0, c1);
                ret.push({x: c0.start.x, y: c0.start.y, t0: c0.getTRefTo(<any>curve0), t1:c1.getTRefTo(<any>curve1)});
                continue;
        }
        if (c0.bbox.isPoint()) {
            const a1 = c1?.splitAtMid();
            if (c0.bbox.intersect(a1[0].bbox)) {
                pending.push(c0, a1[0]);
            }
            if (c0.bbox.intersect(a1[1].bbox)) {
                pending.push(c0, a1[1]);
            }
        }
        else if (c1.bbox.isPoint()) {
            const a0 = c0?.splitAtMid();
            if (a0[0].bbox.intersect(c1.bbox)) {
                pending.push(a0[0], c1);
            }
            if (a0[1].bbox.intersect(c1.bbox)) {
                pending.push(a0[1], c1);
            }
        }
        else {
            const a0 = c0?.splitAtMid();
            const a1 = c1?.splitAtMid();
            if (a0[0].bbox.intersect(a1[0].bbox)) {
                pending.push(a0[0], a1[0]);
            }
            if (a0[0].bbox.intersect(a1[1].bbox)) {
                pending.push(a0[0], a1[1]);
            }
            if (a0[1].bbox.intersect(a1[0].bbox)) {
                pending.push(a0[1], a1[0]);
            }
            if (a0[1].bbox.intersect(a1[1].bbox)) {
                pending.push(a0[1], a1[1]);
            }
        }
    }
    return ret;
}

export class B3Curve implements ISegment {
    private m_start: Point;
    private m_c0: Point;
    private m_c1: Point;
    private m_end: Point;
    private m_bbox?: Box;
    private m_obox?: Box;
    private m_len?: number;
    private m_isLine?: boolean;
    private m_discretePoints?: { p: Point, t: number }[];
    private m_selfInters?: { x: number, y: number, t0: number, t1: number }[];
    private m_midSplit?: B3Curve[];
    private m_parent?: B3Curve;
    private m_extreme?: number[];
    private m_extremeSplit?: B3Curve[];
    private m_startPointId?: string;
    private m_endPointId?: string;
    constructor(start: Point, c0: Point, c1: Point, end: Point) {
        this.m_start = start;
        this.m_c0 = c0;
        this.m_c1 = c1;
        this.m_end = end;
    }
    static make(start: Point, c0: Point, c1: Point, end: Point): B3Curve {
        return new B3Curve(start, c0, c1, end);
    }
    get startPointId(): string | undefined {
        return this.m_startPointId;
    }
    get endPointId(): string | undefined {
        return this.m_endPointId;
    }
    equals(curve:B3Curve):boolean {
        return this.m_start.equals(curve.m_start) &&
            this.m_c0.equals(curve.m_c0) &&
            this.m_c1.equals(curve.m_c1) &&
            this.m_end.equals(curve.m_end);
    }
    private get extremes() {
        if (this.m_extreme) return this.m_extreme;
        const ex = extreme(this.m_start.x, this.m_c0.x, this.m_c1.x, this.m_end.x);
        const ey = extreme(this.m_start.y, this.m_c0.y, this.m_c1.y, this.m_end.y);
        this.m_extreme = ([...ex, ...ey].sort()).reduce<number[]>((arr, cur) => {
            if (Math.abs(cur) > float_accuracy && Math.abs(1-cur) > float_accuracy) {
                if (arr.length === 0) {
                    arr.push(cur);
                    return arr;
                }
                const last = arr[arr.length - 1];
                if (Math.abs(last - cur) > float_accuracy) {
                    arr.push(cur);
                    return arr;
                }
            }
            return arr;
        }, []);
        return this.m_extreme;
    }
    get extremeSplits():B3Curve[] {
        if (this.m_extremeSplit) return this.m_extremeSplit;
        const ex = this.extremes;
        const ret:B3Curve[] = [];
        let lastCurve:B3Curve = this;
        for (let i = 0, len = ex.length, pre = 0; i < len; i++) {
            const e = (ex[i] - pre) / (1 - pre);
            pre = ex[i];
            const splits = lastCurve.split(e);
            ret.push(splits[0]);
            lastCurve = splits[1];
        }
        if (lastCurve !== this) {
            ret.push(lastCurve);
        }
        this.m_extremeSplit = ret;
        return ret;
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
        const exsplits = this.extremeSplits;
        if (exsplits.length > 0) {
            const ret = exsplits.reduce((pre, c) => {
                pre.left = Math.min(pre.left, Math.min(c.start.x, c.end.x));
                pre.top = Math.min(pre.top, Math.min(c.start.y, c.end.y));
                pre.right = Math.max(pre.right, Math.max(c.start.x, c.end.x));
                pre.bottom = Math.max(pre.bottom, Math.max(c.start.y, c.end.y));
                return pre;
            }, 
            {left: this.start.x, top: this.start.y, right: this.start.x, bottom: this.start.y});
            this.m_bbox = Box.make(ret.left, ret.top, ret.right, ret.bottom);
        }
        else {
            this.m_bbox = Box.make(this.m_start, this.m_end);
        }
        return this.m_bbox;
    }
    get isLine(): boolean {
        if (this.m_isLine !== undefined) return this.m_isLine;
        this.m_isLine = this.m_start.equals(this.m_c0) && this.m_end.equals(this.m_c1);
        return this.m_isLine;
    }
    split(t: number): B3Curve[] {
        return splitCurve(this.m_start, this.m_c0, this.m_c1, this.m_end, t);
    }
    get curveLen(): number {
        if (this.m_len) return this.m_len;
        this.m_len = this.isLine ? solveLineLength(this.m_start, this.m_end) : solveBezierLength(this.m_start,
            this.m_c0,
            this.m_c1,
            this.m_end);
        return this.m_len;
    }
    getPointAt(t: number): Point {
        return this.isLine ? getLinePointAt(this.m_start, this.m_end, t) : bpointAt(this.m_start, this.m_c0, this.m_c1, this.m_end, t);
    }
    get discretePoints() {
        if (this.m_discretePoints) return this.m_discretePoints;

        // 极值点要分割
        
        const n1 = this.isLine ? 1 : Math.max((this.curveLen / 1), 1),
            dots1: { p: Point, t: number }[] = [];
        // 线段化
        for (let i = 0; i < n1; i++) {
            const p = this.getPointAt(i / n1);
            dots1.push({ p, t: i / n1 });
        }
        const p = this.getPointAt(1);
        dots1.push({ p, t: 1 });

        this.m_discretePoints = dots1;
        return this.m_discretePoints;
    }
    // intersections(l: Line): { x: number, y: number, t0: number, t1: number }[];
    // intersections(c: B3Curve): { x: number, y: number, t0: number, t1: number }[];
    intersections(c: Line | B3Curve): { x: number, y: number, t0: number, t1: number }[] {
        return intersections2(this, c);
    }
    clone() {
        const c = B3Curve.make(this.start, this.c0, this.c1, this.end);
        if (this.m_bbox) c.m_bbox = this.m_bbox.clone();
        if (this.m_obox) c.m_obox = this.m_obox.clone();
        if (this.m_isLine !== undefined) c.m_isLine = this.m_isLine;
        if (this.m_len) c.m_len = this.m_len;
        if (this.m_discretePoints) c.m_discretePoints = this.m_discretePoints.map<{ p: Point, t: number }>((v) => { return { p: v.p.clone(), t: v.t } });
        return c;
    }
    get selfInters() {
        return this.m_selfInters || (this.m_selfInters = this.isLine ? [] : selfIntersections(this));
    }
    get isSelfClose() {
        return this.selfInters.length > 0;
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
        if (this.m_discretePoints) {
            this.m_discretePoints.forEach((v) => { v.t = 1 - v.t })
        }
        if (this.m_selfInters) {
            this.m_selfInters.forEach((v) => { v.t0 = 1 - v.t0; v.t1 = 1 - v.t1; })
        }
    }
    splitAtMid(): B3Curve[] {
        return this.m_midSplit ||
            (this.m_midSplit = splitCurve(this.m_start,
                this.m_c0,
                this.m_c1,
                this.m_end, 0.5).map((c) => {
                    c.m_parent = this;
                    if (this.extremeSplits.length === 0) {
                        c.m_extremeSplit = [];
                        c.m_extreme = [];
                    }
                    return c;
                }));
    }
    getTRefTo(p: B3Curve): number {
        let c: B3Curve | undefined = this;
        let arr = [];
        while (c) {
            if (c == p) {
                break;
            }
            arr.push(c);
            c = c.m_parent;
        }
        if (c == undefined) {
            return -1;
        }
        arr = arr.reverse();
        let t = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            const c = arr[i];
            const p = c.m_parent as B3Curve;
            if (c == (p?.m_midSplit as Array<B3Curve>)[1]) {
                t = t + (1 / 2) ** (i + 1);
            }
        }
        return t;
    }
    nonezeroCount(l: Line):number {
        const ex = this.extremeSplits;
        const nz: number = ((ex.length > 0 ? ex : [this]).reduce<number>((pre, c) => {
            const crossPoint = solveLineCrossPoint(c.start,
                c.end,
                l.start,
                l.end);
            if (crossPoint.length > 0) {
                const d = solvePointSideOfLine(l.start, c.start, c.end);
                if (d > 0) { // point at curve's left side, so nonezero direction is counertclockwise
                    pre--;
                }
                else if (d < 0) { // right side, clockwise
                    pre++;
                }
            }
            return pre;

        }, 0))
        return nz;
    }
}
