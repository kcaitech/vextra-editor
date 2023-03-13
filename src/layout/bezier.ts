// cubic bezier curve

// 极值点
function extreme(p0: number, p1: number, p2: number, p3: number): number[] {
    const _a = p3 - p2;
    const _b = p2 - p1;
    const _c = p1 - p0;
    const a = _a - 2 * _b + _c;
    const b = 2 * (_b - _c);
    const c = _c;
    if (a == 0) return [-c / b];
    const d = b * b - 4 * a * c;
    if (d < 0) return [];
    if (d == 0) return [-b / (2 * a)];
    const e = Math.sqrt(d);
    return [ (-b + e) / (2 * a), (-b - e) / (2 * a)];
}

type Point = {x: number, y: number};

function b(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const _t = 1 - t;
    const _t_2 = _t * _t;
    const _t_3 = _t_2 * _t;
    const t_2 = t * t;
    const t_3 = t_2 * t;
    return p0 * _t_3 + 3 * p1 * t * _t_2 + 3 * p2 * t_2 * _t + p3 * t_3;
}

function bezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const x = b(p0.x, p1.x, p2.x, p3.x, t);
    const y = b(p0.y, p1.y, p2.y, p3.y, t);
    return {x, y};
}

class Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
    constructor(left: number, top: number, right: number, bottom: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    intersect(b: Box): boolean {
        return b.left <= this.right && b.right >= this.left &&
        b.top <= this.bottom && b.bottom >= this.top;
    }
    get width() {
        return this.right - this.left;
    }
    get height() {
        return this.bottom - this.top;
    }
}

function boundingBox(p0: Point, p1: Point, p2: Point, p3: Point): Box {
    const ex = extreme(p0.x, p1.x, p2.x, p3.x);
    const ey = extreme(p0.y, p1.y, p2.y, p3.y);
    const boundingPoints:Point[] = [...ex, ...ey, 1].map((t) => {
        if (t == 0) return p0;
        if (t == 1) return p1;
        return bezierPoint(p0, p1, p2, p3, t)
    });
    let left = p0.x, top = p0.y, right = p0.x, bottom = p0.y;
    boundingPoints.forEach((p) => {
        left = Math.min(left, p.x);
        top = Math.min(top, p.y);
        right = Math.max(right, p.x);
        bottom = Math.max(bottom, p.y);
    })
    return new Box(left, top, right, bottom);
}

function outerBox(p0: Point, p1: Point, p2: Point, p3: Point): Box {
    let left = p0.x, top = p0.y, right = p0.x, bottom = p0.y;
    [p1, p2, p3].forEach((p) => {
        left = Math.min(left, p.x);
        top = Math.min(top, p.y);
        right = Math.max(right, p.x);
        bottom = Math.max(bottom, p.y);
    })
    return new Box(left, top, right, bottom);
}

class CubicBezier {
    p0: Point;
    p1: Point;
    p2: Point;
    p3: Point;
    private m_uperCurve: CubicBezier | undefined;
    private m_outerBox: Box | undefined;
    private m_boundingBox: Box | undefined;
    private m_splitedCurve: CubicBezier[] | undefined;
    constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
    // set uperCurve(u: CubicBezier) {
    // }
    get outerBox() {
        return this.m_outerBox || 
            (this.m_outerBox = outerBox(this.p0, 
                this.p1, 
                this.p2, 
                this.p3));
    }
    get boundingBox() {
        return this.m_boundingBox || 
            (this.m_boundingBox = boundingBox(this.p0, 
                this.p1, 
                this.p2, 
                this.p3));
    }
    midSplitCurve(): CubicBezier[] {
        return this.m_splitedCurve || 
            (this.m_splitedCurve = splitCurve(this.p0, 
                this.p1, 
                this.p2, 
                this.p3, 0.5).map((c) => {
                    c.m_uperCurve = this;
                    return c;
                }));
    }
    isLeftCurve() {
        if (!this.m_uperCurve) return true;
        return (this.m_uperCurve.m_splitedCurve as CubicBezier[])[0] == this;
    }
}

function splitCurve(p0: Point, p1: Point, p2: Point, p3: Point, t: number): CubicBezier[] {
    const p10: Point = {x:p0.x + t * (p1.x - p0.x), y:p0.y + t * (p1.y - p0.y)}
    const p11: Point = {x:p1.x + t * (p2.x - p1.x), y:p1.y + t * (p2.y - p1.y)}
    const p12: Point = {x:p2.x + t * (p3.x - p2.x), y:p2.y + t * (p3.y - p2.y)}
    const p20: Point = {x:p10.x + t * (p11.x - p10.x), y:p10.y + t * (p11.y - p10.y)}
    const p21: Point = {x:p11.x + t * (p12.x - p11.x), y:p11.y + t * (p12.y - p11.y)}
    const p30: Point = {x:p20.x + t * (p21.x - p20.x), y:p20.y + t * (p21.y - p20.y)}
    const curve0:CubicBezier = new CubicBezier(p0, p10, p20, p30);
    const curve1:CubicBezier = new CubicBezier(p30, p21, p12, p3);
    return [curve0, curve1];
}

function intersectPoints(curve0: CubicBezier, curve1: CubicBezier) {
    if (!curve0.outerBox.intersect(curve1.outerBox)) {
        return [];
    }

    const ret = [];
    const accuracy = 0.000001;
    const pending = [curve0, curve1];
    while (pending.length > 0) {
        let c0 = pending.pop() as CubicBezier;
        let c1 = pending.pop() as CubicBezier;

        if (c0?.outerBox.width < accuracy && c0?.outerBox.height < accuracy &&
            c1?.outerBox.width < accuracy && c1?.outerBox.width < accuracy) {
                ret.push(c0, c1);
                continue;
            }

        let a0 = c0?.midSplitCurve() as CubicBezier[];
        let a1 = c1?.midSplitCurve() as CubicBezier[];
        if ((a0[0] as CubicBezier).outerBox.intersect((a1[0] as CubicBezier).outerBox)) {
            pending.push(a0[0], a1[0]);
        }
        if ((a0[0] as CubicBezier).outerBox.intersect((a1[1] as CubicBezier).outerBox)) {
            pending.push(a0[0], a1[1]);
        }
        if ((a0[1] as CubicBezier).outerBox.intersect((a1[0] as CubicBezier).outerBox)) {
            pending.push(a0[1], a1[0]);
        }
        if ((a0[1] as CubicBezier).outerBox.intersect((a1[1] as CubicBezier).outerBox)) {
            pending.push(a0[1], a1[1]);
        }
    }

    // todo

}