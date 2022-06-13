


//import { accuracy, Box, contains, extremeClose, extremeSmall, intersect, makeBox, Point, pointInside, sameBox, strictIntersect } from "./basic";

export const accuracy = 1e-6;

export interface Point {
    x: number;
    y: number;
}

export function extremeClose(p0: Point, p1: Point) {
    return Math.abs(p0.x - p1.x) < accuracy &&
        Math.abs(p0.y - p1.y) < accuracy;
}

export function pointInside(p: Point, b: Box) {
    return p.x <= b.right && p.x >= b.left &&
        p.y <= b.bottom && p.y >= b.top;
}

export interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function makeBox(p0: Point, p1: Point): Box {
    const left = Math.min(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const right = Math.max(p0.x, p1.x);
    const bottom = Math.max(p0.y, p1.y);
    return {left, top, right, bottom};
}

export function sameBox(b0: Box, b1: Box): boolean {
    return Math.abs(b0.left - b1.left) < accuracy &&
        Math.abs(b0.top - b1.top) < accuracy &&
        Math.abs(b0.right - b1.right) < accuracy &&
        Math.abs(b0.bottom - b1.bottom) < accuracy;
}

export function intersect(b0: Box, b1: Box): boolean {
    return b0.left <= b1.right && b0.right >= b1.left &&
        b0.top <= b1.bottom && b0.bottom >= b1.top;
}

export function strictIntersect(b0: Box, b1: Box): boolean {
    return b0.left < b1.right && b0.right > b1.left &&
        b0.top < b1.bottom && b0.bottom > b1.top;
}

export function contains(b0: Box, b1: Box): boolean {
    return b0.left <= b1.left && b0.right >= b1.right &&
        b0.top <= b1.top && b0.bottom >= b1.bottom;
}

export function strictContains(b0: Box, b1: Box): boolean {
    return b0.left < b1.left && b0.right > b1.right &&
        b0.top < b1.top && b0.bottom > b1.bottom;
}

export function width(b: Box) {
    return b.right - b.left;
}

export function height(b: Box) {
    return b.bottom - b.top;
}

export function extremeSmall(b: Box) {
    return width(b) < accuracy && height(b) < accuracy;
}

//---------------------------------------------------------------------------------------------

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
    return [(-b + e) / (2 * a), (-b - e) / (2 * a)];
}

function cordAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const _t = 1 - t;
    const _t_2 = _t * _t;
    const _t_3 = _t_2 * _t;
    const t_2 = t * t;
    const t_3 = t_2 * t;
    return p0 * _t_3 + 3 * p1 * t * _t_2 + 3 * p2 * t_2 * _t + p3 * t_3;
}

function pointAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const x = cordAt(p0.x, p1.x, p2.x, p3.x, t);
    const y = cordAt(p0.y, p1.y, p2.y, p3.y, t);
    return { x, y };
}

function boundingBox(p0: Point, p1: Point, p2: Point, p3: Point): Box {
    const ex = extreme(p0.x, p1.x, p2.x, p3.x);
    const ey = extreme(p0.y, p1.y, p2.y, p3.y);
    const boundingPoints: Point[] = [...ex, ...ey, 1].map((t) => {
        if (t == 0) return p0;
        if (t == 1) return p1;
        return pointAt(p0, p1, p2, p3, t)
    });
    let left = p0.x, top = p0.y, right = p0.x, bottom = p0.y;
    boundingPoints.forEach((p) => {
        left = Math.min(left, p.x);
        top = Math.min(top, p.y);
        right = Math.max(right, p.x);
        bottom = Math.max(bottom, p.y);
    })
    return { left, top, right, bottom };
}

function outerBox(p0: Point, p1: Point, p2: Point, p3: Point): Box {
    let left = p0.x, top = p0.y, right = p0.x, bottom = p0.y;
    [p1, p2, p3].forEach((p) => {
        left = Math.min(left, p.x);
        top = Math.min(top, p.y);
        right = Math.max(right, p.x);
        bottom = Math.max(bottom, p.y);
    })
    return { left, top, right, bottom };
}

function splitCurve(p0: Point, p1: Point, p2: Point, p3: Point, t: number): CCurve[] {
    const p10: Point = { x: p0.x + t * (p1.x - p0.x), y: p0.y + t * (p1.y - p0.y) }
    const p11: Point = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }
    const p12: Point = { x: p2.x + t * (p3.x - p2.x), y: p2.y + t * (p3.y - p2.y) }
    const p20: Point = { x: p10.x + t * (p11.x - p10.x), y: p10.y + t * (p11.y - p10.y) }
    const p21: Point = { x: p11.x + t * (p12.x - p11.x), y: p11.y + t * (p12.y - p11.y) }
    const p30: Point = { x: p20.x + t * (p21.x - p20.x), y: p20.y + t * (p21.y - p20.y) }
    const curve0: CCurve = makeCurve(p0, p10, p20, p30);
    const curve1: CCurve = makeCurve(p30, p21, p12, p3);
    return [curve0, curve1];
}

class CCurve {
    private m_p0: Point;
    private m_p1: Point;
    private m_p2: Point;
    private m_p3: Point;
    private m_parent: CCurve | undefined;
    private m_outerBox: Box | undefined;
    private m_boundingBox: Box | undefined;
    private m_midSplit: CCurve[] | undefined;

    constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
        this.m_p0 = p0;
        this.m_p1 = p1;
        this.m_p2 = p2;
        this.m_p3 = p3;
    }
    get outerBox() {
        return this.m_outerBox ||
            (this.m_outerBox = outerBox(this.m_p0,
                this.m_p1,
                this.m_p2,
                this.m_p3));
    }
    get boundingBox() {
        return this.m_boundingBox ||
            (this.m_boundingBox = boundingBox(this.m_p0,
                this.m_p1,
                this.m_p2,
                this.m_p3));
    }
    splitAtMid(): CCurve[] {
        return this.m_midSplit ||
            (this.m_midSplit = splitCurve(this.m_p0,
                this.m_p1,
                this.m_p2,
                this.m_p3, 0.5).map((c) => {
                    c.m_parent = this;
                    return c;
                }));
    }
    getTRefTo(p: CCurve): number {
        let c: CCurve | undefined = this;
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
            const p = c.m_parent as CCurve;
            if (c == (p?.m_midSplit as Array<CCurve>)[1]) {
                t = t + (1 / 2) ** (i + 1);
            }
        }
        return t;
    }
    getTAtPoint(p: Point): number {
        const pending = [this as CCurve];
        let ret: CCurve | undefined;
        let isMid = false;
        while (pending.length > 0) {
            const c = pending.pop() as CCurve;
            const outerBox = c.outerBox;
            if (!pointInside(p, outerBox)) {
                continue;
            }
            if (extremeSmall(c.outerBox)) {
                ret = c;
                break;
            }
            const subc = c.splitAtMid();
            const in0 = pointInside(p, subc[0].outerBox);
            const in1 = pointInside(p, subc[1].outerBox);
            if (in0 && in1) {
                if (strictIntersect(subc[0].outerBox, subc[1].outerBox)) {
                    // todo 不确定会不会有这种情况
                    throw new Error("p0:" + this.m_p0 + 
                        " p1:" + this.m_p1 + 
                        " p2:" + this.m_p2 + 
                        " p3:" + this.m_p3);
                }
                // 刚好是中点
                if (extremeClose(subc[0].m_p3, p)) {
                    isMid = true;
                    ret = c;
                    break;
                }
            }
            if (in0) {
                pending.push(subc[0]);
            }
            if (in1) {
                pending.push(subc[1]);
            }
        }
        if (ret == undefined) {
            return -1;
        }

        let arr = [];
        while (ret) {
            if (ret == this) {
                break;
            }
            arr.push(ret);
            ret = ret.m_parent;
        }

        arr = arr.reverse();
        let t = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            const c = arr[i];
            const p = c.m_parent as CCurve;
            if (c == (p?.m_midSplit as Array<CCurve>)[1]) {
                t = t + (1 / 2) ** (i + 1);
            }
            if (i == len - 1 && isMid) {
                // last one
                t = t + (1 / 2) ** (i + 2);
            }
        }
        return t;
    }
    getPointAt(t: number): Point {
        return pointAt(this.m_p0, this.m_p1, this.m_p2, this.m_p3, t);
    }
    getCoincide(other: CCurve): {t00: number, t01: number, t10: number, t11: number} | false {
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

        // todo 应该直接判断控制点
        
        // 先用outerbox判断下 todo 
        const outBoxT = this.outerBox;
        const outBoxO = other.outerBox;
        if (!intersect(outBoxO, outBoxT)) {
            return false;
        }
        if (contains(outBoxT, outBoxO)) {
            // case 3
            const o0inT = this.getTAtPoint(other.m_p0); // 1
            if (o0inT < 0) {
                return false;
            }
            const o3inT = this.getTAtPoint(other.m_p3); // 2
            if (o3inT < 0) {
                return false;
            }
            const mp = other.getPointAt(0.5);
            const tMinO = this.getTAtPoint(mp); // 3
            if (tMinO < 0) {
                return false;
            }
            // 单调的
            if (sameBox(other.boundingBox, makeBox(other.m_p0, other.m_p3))) {
                const qp = other.getPointAt(0.25);
                const tQinO = this.getTAtPoint(qp); // 4
                if (tQinO < 0) {
                    return false;
                }
            }
            const t00 = o0inT;
            const t01 = o3inT;
            const t10 = 0;
            const t11 = 1;
            return {t00, t01, t10, t11};
        }
        else if (contains(outBoxO, outBoxT)) {
            // case 4
            const t0inO = other.getTAtPoint(this.m_p0);
            if (t0inO < 0) {
                return false;// 不可能
            }
            const t3inO = other.getTAtPoint(this.m_p3);
            if (t3inO < 0) {
                return false;
            }
            // this 头尾已在other中
            const mp = this.getPointAt(0.5);
            const tMinO = other.getTAtPoint(mp); // 3
            if (tMinO < 0) {
                return false;
            }
            // 单调的
            if (!sameBox(this.boundingBox, makeBox(this.m_p0, this.m_p3))) {
                const qp = this.getPointAt(0.25);
                const tQinO = other.getTAtPoint(qp); // 4
                if (tQinO < 0) {
                    return false;
                }
            }
            const t00 = 0;
            const t01 = 1;
            const t10 = t0inO;
            const t11 = t3inO;
            return {t00, t01, t10, t11};
        }
        else {
            const o0inT = this.getTAtPoint(other.m_p0);
            if (o0inT >= 0) {
                // case 1
                // const o0inT = this.getTAtPoint(other.m_p0); // 1
                // if (o0inT < 0) {
                //     return false;
                // }
                const t3inO = other.getTAtPoint(this.m_p3); // 2
                if (t3inO < 0) {
                    return false;
                }
                // o0inT~1 之间再取this一个值判断other
                // 或者0~t3inO 之间取other一个值判断this
                const lp = other.getPointAt(t3inO / 4);
                const oLinT = this.getTAtPoint(lp); // 3
                if (oLinT < 0) {
                    return false;
                }
                const rp = other.getPointAt(t3inO / 4 + t3inO / 2);
                const oRinT = this.getTAtPoint(rp); // 4
                if (oRinT < 0) {
                    return false;
                }

                const t00 = o0inT;
                const t01 = 1;
                const t10 = 0;
                const t11 = t3inO;
                return {t00, t01, t10, t11};
            }
            else {
                // maybe case 2
                const o3inT = this.getTAtPoint(other.m_p3); // 1
                if (o3inT < 0) {
                    return false;
                }
                const t0inO = other.getTAtPoint(this.m_p0); // 2
                if (t0inO < 0) {
                    return false;
                }

                const lp = this.getPointAt(o3inT / 4);
                const tLinO = other.getTAtPoint(lp); // 3
                if (tLinO < 0) {
                    return false;
                }
                const rp = this.getPointAt(o3inT / 4 + o3inT / 2);
                const tRinO = other.getTAtPoint(rp); // 4
                if (tRinO < 0) {
                    return false;
                }
                const t00 = 0;
                const t01 = o3inT;
                const t10 = t0inO;
                const t11 = 1;
                return {t00, t01, t10, t11};
            }
        }
    }
}

function makeCurve(p0: Point, p1: Point, p2: Point, p3: Point) {
    return new CCurve(p0, p1, p2, p3);
}

/**
 * 
 * @param curve0 
 * @param curve1 
 * @returns {t0, t1}[], intersectpoints || {t00, t01, t10, t11}, coincide curve
 */
function intersectPoints(curve0: CCurve, curve1: CCurve): {t0:number, t1:number}[] | {t00: number, t01: number, t10: number, t11: number} {
    if (!intersect(curve0.outerBox, curve1.outerBox)) {
        return [];
    }
    let coincide = curve0.getCoincide(curve1);
    if (coincide) { // 重合
        return coincide;
    }
    const ret:{t0:number, t1:number}[] = [];
    const pending = [curve0, curve1];
    while (pending.length > 0) {
        let c0 = pending.pop() as CCurve;
        let c1 = pending.pop() as CCurve;
        if (extremeSmall(c0?.outerBox) &&
            extremeSmall(c1?.outerBox)) {
                ret.push({t0: c0.getTRefTo(curve0), t1:c1.getTRefTo(curve1)});
                continue;
        }
        let a0 = c0?.splitAtMid() as CCurve[];
        let a1 = c1?.splitAtMid() as CCurve[];
        if (intersect((a0[0] as CCurve).outerBox, (a1[0] as CCurve).outerBox)) {
            pending.push(a0[0], a1[0]);
        }
        if (intersect((a0[0] as CCurve).outerBox, (a1[1] as CCurve).outerBox)) {
            pending.push(a0[0], a1[1]);
        }
        if (intersect((a0[1] as CCurve).outerBox, (a1[0] as CCurve).outerBox)) {
            pending.push(a0[1], a1[0]);
        }
        if (intersect((a0[1] as CCurve).outerBox, (a1[1] as CCurve).outerBox)) {
            pending.push(a0[1], a1[1]);
        }
    }
    return ret;
}
