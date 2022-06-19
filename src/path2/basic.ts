
export const float_accuracy = 1e-6;
export const result_accuracy = 1e-4;
const result_accuracy_count = 4;

// 解方程：ax + b = 0
function solveLine(a: number, b: number): number[] {
    return a === 0 ? [] : [-b / a];
}

// 解方程：ax^2 + bx + c = 0
function solveQuadratic(a: number, b: number, c: number): number[] {
    if (a === 0) return solveLine(b, c);
    const delta = b ** 2 - 4 * a * c;
    if (delta === 0) return [-b / (2 * a)];
    if (delta < 0) return [];
    const d = Math.sqrt(delta);
    return [(-b + d) / (2 * a), (-b - d) / (2 * a)];
}

// 解方程：ax^3 + bx^2 + cx + d = 0
function solveQubic(a: number, b: number, c: number, d: number): number[] {
    if (a === 0) return solveQuadratic(b, c, c);
    if (d === 0) return solveQuadratic(a, b, c).concat([0]);

    // 盛金公式, 预先需满足, a !== 0
    // 判别式
    const A = Math.pow(b, 2) - 3 * a * c
    const B = b * c - 9 * a * d
    const C = Math.pow(c, 2) - 3 * b * d
    const delta = Math.pow(B, 2) - 4 * A * C

    // 3个相同实数根
    if (Math.abs(A - B) < float_accuracy && Math.abs(A) < float_accuracy) {
        const t1 = -b / (3 * a)
        const t2 = -c / b
        const t3 = -3 * d / c
        return [t1, t2, t3]
    }

    // 3个实数根
    if (Math.abs(delta) < float_accuracy) {
        const K = B / A
        const t1 = -b / a + K
        const t2 = -K / 2
        return [t1, t2];
    }

    // 1个实数根和1对共轭复数根
    if (delta > 0) {
        const v = Math.pow(B, 2) - 4 * A * C
        const xsv = v < 0 ? -1 : 1

        const m1 = A * b + 3 * a * (-B + (v * xsv) ** (1 / 2) * xsv) / 2
        const m2 = A * b + 3 * a * (-B - (v * xsv) ** (1 / 2) * xsv) / 2

        const xs1 = m1 < 0 ? -1 : 1
        const xs2 = m2 < 0 ? -1 : 1

        const t1 = (-b - (m1 * xs1) ** (1 / 3) * xs1 - (m2 * xs2) ** (1 / 3) * xs2) / (3 * a)
        // 涉及虚数，可不考虑。i ** 2 = -1
        return [t1];
    }

    // 3个不相等实数根
    if (delta < 0) {
        const xsA = A < 0 ? -1 : 1
        const T = (2 * A * b - 3 * a * B) / (2 * (A * xsA) ** (3 / 2) * xsA)
        const theta = Math.acos(T)

        if (A > 0 && T < 1 && T > -1) {
            const t1 = (-b - 2 * A ** (1 / 2) * Math.cos(theta / 3)) / (3 * a)
            const t2 = (-b + A ** (1 / 2) * (Math.cos(theta / 3) + 3 ** (1 / 2) * Math.sin(theta / 3))) / (3 * a)
            const t3 = (-b + A ** (1 / 2) * (Math.cos(theta / 3) - 3 ** (1 / 2) * Math.sin(theta / 3))) / (3 * a)
            return [t1, t2, t3]
        }
    }
    return []
}

export function solveQubicIn01(a: number, b: number, c: number, d: number): number[] {
    return solveQubic(a, b, c, d).sort().reduce<number[]>((pre, cur) => {
        let t = -1;
        if (cur >= 0 && cur <= 1) {
            t = cur;
        } else if (Math.abs(cur) < float_accuracy) {
            t = 0;
        } else if (Math.abs(1 - cur) < float_accuracy) {
            t = 1;
        }
        if (t < 0) return pre;
        if (pre.length === 0) {
            pre.push(t);
        }
        else {
            const last = pre[pre.length - 1];
            if (Math.abs(last - t) > float_accuracy) {
                pre.push(t);
            }
        }
        return pre;
    }, []);
}

function solveBezierT(p0: number, p1: number, p2: number, p3: number, p: number): number[] {
    const a = p3 - 3 * p2 + 3 * p1 - p0;
    const b = 3 * (p0 - 2 * p1 + p2);
    const c = 3 * (p1 - p0);
    const d = p0 - p;
    return solveQubicIn01(a, b, c, d);
}

export function solveBezierTAtPoint(p0: Point, p1: Point, p2: Point, p3: Point, p: Point): number[] {
    // bounding box check first
    const sx = solveBezierT(p0.x, p1.x, p2.x, p3.x, p.x);
    if (sx.length === 0) return [];
    const sy = solveBezierT(p0.y, p1.y, p2.y, p3.y, p.y);
    if (sy.length === 0) return [];
    return sx.reduce<number[]>((pre, cur) => {
        if (sy.findIndex((v) => Math.abs(v - cur) < float_accuracy) >= 0) {
            pre.push(cur);
        }
        return pre;
    }, []);
}

export function solvePointTAtLine(l: Line, p: Point): number[] {
    const d = (p.y - l.start.y)*(l.end.x - l.start.x) - (p.x - l.start.x)*(l.end.y - l.start.y);
    if (Math.abs(d) > float_accuracy) {
        return [];
    }
    let t = solvePointTOfLine(p, l.start, l.end);
    if (Math.abs(t) < float_accuracy) t = 0;
    else if (Math.abs(1-t) < float_accuracy) t = 1;
    if (t >= 0 && t <= 1) {
        return [t]
    }
    return [];
}

/**
 * 两根直线相交
 * @returns 
 */
export function solveLineCrossPoint(p0: Point, p1: Point, p2: Point, p3: Point): Point[] {
    const max01x = Math.max(p0.x, p1.x);
    const min01x = Math.min(p0.x, p1.x);
    const max01y = Math.max(p0.y, p1.y);
    const min01y = Math.min(p0.y, p1.y);
    const max23x = Math.max(p2.x, p3.x);
    const min23x = Math.min(p2.x, p3.x);
    const max23y = Math.max(p2.y, p3.y);
    const min23y = Math.min(p2.y, p3.y);
    if (
        max01x < min23x ||
        min01x > max23x ||
        max01y < min23y ||
        min01y > max23y) {
        return [];
    }

    const d = (p0.x - p1.x) * (p2.y - p3.y) - (p0.y - p1.y) * (p2.x - p3.x);
    if (!d) return [];

    const nx = (p0.x * p1.y - p0.y * p1.x) * (p2.x - p3.x) - (p0.x - p1.x) * (p2.x * p3.y - p2.y * p3.x);
    const ny = (p0.x * p1.y - p0.y * p1.x) * (p2.y - p3.y) - (p0.y - p1.y) * (p2.x * p3.y - p2.y * p3.x);
    const sx = nx / d;
    const sy = ny / d;
    // point valid
    if (
        sx < min01x - float_accuracy ||
        sx > max01x + float_accuracy ||
        sx < min23x - float_accuracy ||
        sx > max23x + float_accuracy ||
        sy < min01y - float_accuracy ||
        sy > max01y + float_accuracy ||
        sy < min23y - float_accuracy ||
        sy > max23y + float_accuracy
    ) {
        return [];
    }
    return [Point.make(sx, sy)];
}

export function solveBezierExtreme(p0: number, p1: number, p2: number, p3: number): number[] {
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

// 将bezier在凸点进行分裂，直到接近一样直线
// 在极值点分割后，获取bezier的凸点
export function solveBezierConvex(p0: Point, p1: Point, p2: Point, p3: Point): number {
    const x3 = p3.x - p0.x;
    const y3 = p3.y - p0.y;
    const r = Math.sqrt(x3 ** 2 + y3 ** 2);
    const x1 = p1.x - p0.x;
    const y1 = p1.y - p0.y;
    const x2 = p2.x - p0.x;
    const y2 = p2.y - p0.y;
    
    // const sin = (p3.y - p0.y) / r;
    // const cos = (p3.x - p0.x) / r;
    // const y11 = -sin * x1 + cos * y1;
    // const y21 = -sin * x2 + cos * y2;

    const y11 = (x3 * y1 - y3 * x1) / r;
    const y21 = (x3 * y2 - y3 * x2) / r;

    const ret = solveBezierExtreme(0, y11, y21, 0);
    if (ret.length !== 1) {
        return 0.5 //throw new Error("??");
    }
    return ret[0];
}

export function solveBezierLength(p0: Point, p1: Point, p2: Point, p3: Point): number {
    // 弧长=导数的积分
    // 再用Simpson's 3/8 rule求积分
    // 导数：f(p,t) = 3 * [ (1-t)^2 x (p1-p0) + 2(1-t)t x (p2-p1) + t^2 x (p3-p2) ]
    // F = sqrt(f(x,t)**2 + f(y,t)**2)
    // Simpson's 3/8: (F(0) + 3 x F(1/3) + 3 x F(2/3) + F(1)) / 8
    const ay = p1.y - p0.y;
    const ax = p1.x - p0.x;
    const bx = p2.x - p1.x;
    const by = p2.y - p1.y;
    const cx = p3.x - p2.x;
    const cy = p3.y - p2.y;
    const _f = function (t: number, a: number, b: number, c: number): number {
        const _t = 1-t;
        return 3 * (_t**2 * a + 2*_t*t * b + t**2 * c);
    }
    const fx = (t: number): number => {
        return _f(t, ax, bx, cx);
    }
    const fy = (t: number): number => {
        return _f(t, ay, by, cy)
    }
    const F = (t: number): number => {
        return Math.sqrt(fx(t)**2 + fy(t)**2);
    }
    return (F(0) + 3 * F(1/3) + 3 * F(2/3) + F(1)) / 8;
}

// class intersection
// interface SegNode
export interface ISegment {
    // startPointId?:string;
    // endPointId?: string;
    start: Point;
    end: Point;
    bbox: Box;
    clone(): ISegment;
    invert(): void;
    equals(v: ISegment): boolean;
    nonezeroCount(l: Line): number;
    split(t: number, p?: Point): ISegment[];
    discretize: ISegment[];
    offsetT: number;
    offsetTLen: number;
    getPointAt(t: number): Point;
}

export class Point {
    private m_x: number;
    private m_y: number;
    constructor(x: number, y: number) {
        this.m_x = x;
        this.m_y = y;
    }
    static make(x: number, y: number): Point {
        return new Point(x, y);
    }
    get x() {
        return this.m_x;
    }
    get y() {
        return this.m_y;
    }
    equals(p1: Point) {
        return Math.abs(this.x - p1.x) < float_accuracy &&
            Math.abs(this.y - p1.y) < float_accuracy;
    }
    isInside(b: Box) {
        return this.x <= b.right && this.x >= b.left &&
            this.y <= b.bottom && this.y >= b.top;
    }
    isStrictInside(b: Box) {
        return this.x < b.right && this.x > b.left &&
            this.y < b.bottom && this.y > b.top;
    }
    toString() {
        return "[" + this.x.toFixed(result_accuracy_count) + "," + this.y.toFixed(result_accuracy_count) + "]";
    }
    clone() {
        return Point.make(this.x, this.y);
    }
}

export class Box {
    private m_left: number;
    private m_top: number;
    private m_right: number;
    private m_bottom: number;
    constructor(left: number, top: number, right: number, bottom: number) {
        this.m_left = left;
        this.m_top = top;
        this.m_right = right;
        this.m_bottom = bottom;
    }
    static make(p0: Point, p1: Point): Box;
    static make(left: number, top: number, right: number, bottom: number): Box;
    static make(...args: Point[] | number[]): Box {
        let left: number, top: number, right: number, bottom: number;
        if (args.length == 2) {
            const p0: Point = <Point>args[0];
            const p1: Point = <Point>args[1];
            left = Math.min(p0.x, p1.x);
            top = Math.min(p0.y, p1.y);
            right = Math.max(p0.x, p1.x);
            bottom = Math.max(p0.y, p1.y);
        } else {
            left = <number>args[0];
            top = <number>args[1];
            right = <number>args[2];
            bottom = <number>args[3];
        }
        return new Box(left, top, right, bottom);
    }
    get left() {
        return this.m_left;
    }
    get top() {
        return this.m_top;
    }
    get right() {
        return this.m_right;
    }
    get bottom() {
        return this.m_bottom;
    }
    equals(b1: Box): boolean {
        return Math.abs(this.left - b1.left) < float_accuracy &&
            Math.abs(this.top - b1.top) < float_accuracy &&
            Math.abs(this.right - b1.right) < float_accuracy &&
            Math.abs(this.bottom - b1.bottom) < float_accuracy;
    }
    intersect(b1: Box): boolean {
        return this.left <= b1.right && this.right >= b1.left &&
            this.top <= b1.bottom && this.bottom >= b1.top;
    }
    strictIntersect(b1: Box): boolean {
        return this.left < b1.right && this.right > b1.left &&
            this.top < b1.bottom && this.bottom > b1.top;
    }
    contains(b1: Box): boolean {
        return this.left <= b1.left && this.right >= b1.right &&
            this.top <= b1.top && this.bottom >= b1.bottom;
    }
    strictContains(b1: Box): boolean {
        return this.left < b1.left && this.right > b1.right &&
            this.top < b1.top && this.bottom > b1.bottom;
    }
    get width() {
        return this.right - this.left;
    }
    get height() {
        return this.bottom - this.top;
    }
    isPoint() {
        return this.width < float_accuracy && this.height < float_accuracy;
    }
    union(b: Box) {
        this.m_left = Math.min(this.m_left, b.m_left);
        this.m_top = Math.min(this.m_top, b.m_top);
        this.m_right = Math.max(this.m_right, b.m_right);
        this.m_bottom = Math.max(this.m_bottom, b.m_bottom);
    }
    clone() {
        return Box.make(this.left, this.top, this.right, this.bottom);
    }
}

// 点到直线的距离
// 如果d>0，点在直线左边
// 如果d<0，点在直线右边
// 如果d=0, 点在直线上
export function solvePoint2LineDistance(p: Point, lstart: Point, lend: Point): number {
    const x1 = lend.x - lstart.x;
    const y1 = lend.y - lstart.y;
    const x2 = p.x - lstart.x;
    const y2 = p.y - lstart.y;
    const r = Math.sqrt(x1**2 + y1**2);
    const d = (x1*y2 - x2*y1) / r;
    return d;
}

// 如果d>0，点在直线左边
// 如果d<0，点在直线右边
// 如果d=0, 点在直线上
export function solvePointSideOfLine(p: Point, lstart: Point, lend: Point): number {
    const x1 = lend.x - lstart.x;
    const y1 = lend.y - lstart.y;
    const x2 = p.x - lstart.x;
    const y2 = p.y - lstart.y;
    const d = (x1*y2 - x2*y1);
    return d > 0 ? 1 : (d < 0 ? -1 : 0);
}

export function solveLineLength(p0: Point, p1: Point): number {
    return Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2)
}

export function getLinePointAt(p0: Point, p1: Point, t: number) {
    const x = (p1.x - p0.x) * t + p0.x;
    const y = (p1.y - p0.y) * t + p0.y;
    return Point.make(x, y);
}

export function solvePointTOfLine(p: Point, lstart: Point, lend: Point): number {
    const w = lend.x - lstart.x;
    const h = lend.y - lstart.y;
    return Math.abs(w) >= Math.abs(h) ? (p.x - lstart.x) / w : (p.y - lstart.y) / h;
}

function splitLine(start: Point, end: Point, t: number, p?: Point): Line[] {
    if (p) {
        return [Line.make(start, p), Line.make(p, end)]; // 保证最后可以查到
    }
    const pAtT = Point.make(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
    return [Line.make(start, pAtT), Line.make(pAtT, end)];
}

export class Line implements ISegment {
    private m_start: Point;
    private m_end: Point;
    private m_bbox?: Box;
    // private m_startPointId?: string;
    // private m_endPointId?: string;
    constructor(start: Point, end: Point) {
        this.m_start = start;
        this.m_end = end;
    }
    static make(start: Point, end: Point): Line {
        return new Line(start, end);
    }
    equals(l: ISegment): boolean {
        return l instanceof Line && this.m_start.equals(l.start) && this.m_end.equals(l.end);
    }
    invert() {
        const p = this.m_start;
        this.m_start = this.m_end;
        this.m_end = p;
        // if (this.m_startPointId) {
        //     const id = this.m_startPointId;
        //     this.m_startPointId = this.m_endPointId;
        //     this.m_endPointId = id;
        // } else if (this.m_endPointId) {
        //     const id = this.m_endPointId;
        //     this.m_endPointId = this.m_startPointId;
        //     this.m_startPointId = id;
        // }
    }
    nonezeroCount(l: Line): number {
        const crossPoint = solveLineCrossPoint(this.start, this.end, l.start, l.end);
        if (crossPoint.length > 0) {
            const d = solvePointSideOfLine(l.start, this.start, this.end);
            return d > 0 ?  - 1 : (d < 0 ?   1 : 0);
        }
        return 0;
    }
    // get startPointId(): string | undefined {
    //     return this.m_startPointId;
    // }
    // get endPointId(): string | undefined {
    //     return this.m_endPointId;
    // }
    get isVerticalLine() {
        return Math.abs(this.end.x - this.start.x) < float_accuracy;
    }
    get k() {
        return (this.end.y - this.start.y) / (this.end.x - this.start.x);
    }
    get start() {
        return this.m_start;
    }
    get end() {
        return this.m_end;
    }
    get bbox() {
        return this.m_bbox || (this.m_bbox = Box.make(this.m_start, this.m_end));
    }
    getCrossPoint(l: Line): Point | undefined {
        return solveLineCrossPoint(this.start,
            this.end,
            l.start,
            l.end)[0];
    }
    get length() {
        return solveLineLength(this.m_start, this.m_end);
    }
    getPointAt(t: number): Point {
        return getLinePointAt(this.m_start, this.m_end, t);
    }
    clone(): Line {
        return Line.make(this.start.clone(), this.end.clone());
    }
    split(t: number, p?: Point): Line[] {
        if (Math.abs(t) < float_accuracy || Math.abs(1-t) < float_accuracy) { // 端点
            return [this];
        }
        return splitLine(this.m_start, this.m_end, t, p);
    }
    get discretize(): Line[] {
        return [this];
    }
    get offsetT(): number {
        return 0;
    }
    get offsetTLen(): number {
        return 1;
    }
}
