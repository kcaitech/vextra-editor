

/**
 * 两根直线相交
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @param x3 
 * @param y3 
 * @param x4 
 * @param y4 
 * @returns 
 */
function intersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): { x: number, y: number } | undefined {
    if (
        Math.max(x1, x2) < Math.min(x3, x4) ||
        Math.min(x1, x2) > Math.max(x3, x4) ||
        Math.max(y1, y2) < Math.min(y3, y4) ||
        Math.min(y1, y2) > Math.max(y3, y4)
    ) {
        return;
    }
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
        ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (!denominator) {
        return;
    }
    const px = nx / denominator,
        py = ny / denominator,
        px2 = +px.toFixed(2),
        py2 = +py.toFixed(2);
    if (
        px2 < +Math.min(x1, x2).toFixed(2) ||
        px2 > +Math.max(x1, x2).toFixed(2) ||
        px2 < +Math.min(x3, x4).toFixed(2) ||
        px2 > +Math.max(x3, x4).toFixed(2) ||
        py2 < +Math.min(y1, y2).toFixed(2) ||
        py2 > +Math.max(y1, y2).toFixed(2) ||
        py2 < +Math.min(y3, y4).toFixed(2) ||
        py2 > +Math.max(y3, y4).toFixed(2)
    ) {
        return;
    }
    return { x: px, y: py };
}

function findDotAtSegment(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, t: number) {
    const t1 = 1 - t;
    return {
        x: Math.pow(t1, 3) * p1x + Math.pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + Math.pow(t, 3) * p2x,
        y: Math.pow(t1, 3) * p1y + Math.pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + Math.pow(t, 3) * p2y
    };
}

function curveDim(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number) {
    let a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
        b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
        c = p1x - c1x,
        t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a,
        t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
    const y = [p1y, p2y],
        x = [p1x, p2x];
    let dot;
    Math.abs(t1) > 1e12 && (t1 = .5);
    Math.abs(t2) > 1e12 && (t2 = .5);
    if (t1 > 0 && t1 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
        x.push(dot.x);
        y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
        x.push(dot.x);
        y.push(dot.y);
    }
    a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
    b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
    c = p1y - c1y;
    t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
    t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
    Math.abs(t1) > 1e12 && (t1 = .5);
    Math.abs(t2) > 1e12 && (t2 = .5);
    if (t1 > 0 && t1 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
        x.push(dot.x);
        y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
        x.push(dot.x);
        y.push(dot.y);
    }
    // [0].reduce((p, c, ci, arr) => Math.min(p, c));
    return {
        min: { x: x.reduce((p, c, ci, arr) => Math.min(p, c)), y: y.reduce((p, c, ci, arr) => Math.min(p, c)) },
        max: { x: x.reduce((p, c, ci, arr) => Math.max(p, c)), y: y.reduce((p, c, ci, arr) => Math.max(p, c)) }
    };
}

interface BBox {
    x: number,
    y: number,
    x2: number,
    y2: number,
    width: number,
    height: number
}

function bezierBBox(arr: number[]): BBox;
function bezierBBox(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number): BBox;
function bezierBBox(...args: any[]): BBox {
    const arr: number[] = args.length == 1 ? args[0] : args;
    const p1x = arr[0];
    const p1y = arr[1];
    const c1x = arr[2];
    const c1y = arr[3];
    const c2x = arr[4];
    const c2y = arr[5];
    const p2x = arr[6];
    const p2y = arr[7];
    // if (!Array.isArray(p1x)) {
    //     p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
    // }
    const bbox = curveDim(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
    return {
        x: bbox.min.x,
        y: bbox.min.y,
        x2: bbox.max.x,
        y2: bbox.max.y,
        width: bbox.max.x - bbox.min.x,
        height: bbox.max.y - bbox.min.y
    };
}

function isPointInsideBBox(bbox: BBox, x: number, y: number) {
    return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
}

function isBBoxIntersect(bbox1: BBox, bbox2: BBox) {
    const i = isPointInsideBBox;
    return i(bbox2, bbox1.x, bbox1.y)
        || i(bbox2, bbox1.x2, bbox1.y)
        || i(bbox2, bbox1.x, bbox1.y2)
        || i(bbox2, bbox1.x2, bbox1.y2)
        || i(bbox1, bbox2.x, bbox2.y)
        || i(bbox1, bbox2.x2, bbox2.y)
        || i(bbox1, bbox2.x, bbox2.y2)
        || i(bbox1, bbox2.x2, bbox2.y2)
        || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
        && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
}

function base3(t: number, p1: number, p2: number, p3: number, p4: number): number {
    const t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
        t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
    return t * t2 - 3 * p1 + 3 * p2;
}

function bezlen(arr: number[]): number
function bezlen(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, z?: number): number;
function bezlen(...args: any[]): number {
    const arr: number[] = args.length == 1 ? args[0] : args;
    const x1 = arr[0];
    const y1 = arr[1];
    const x2 = arr[2];
    const y2 = arr[3];
    const x3 = arr[4];
    const y3 = arr[5];
    const x4 = arr[6];
    const y4 = arr[7];
    let z = arr[8];

    if (z == undefined) {
        z = 1;
    }
    z = z > 1 ? 1 : z < 0 ? 0 : z;
    const z2 = z / 2,
        n = 12,
        Tvalues = [-0.1252, 0.1252, -0.3678, 0.3678, -0.5873, 0.5873, -0.7699, 0.7699, -0.9041, 0.9041, -0.9816, 0.9816],
        Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472];

    let sum = 0;
    for (let i = 0; i < n; i++) {
        const ct = z2 * Tvalues[i] + z2,
            xbase = base3(ct, x1, x2, x3, x4),
            ybase = base3(ct, y1, y2, y3, y4),
            comb = xbase * xbase + ybase * ybase;
        sum += Cvalues[i] * Math.sqrt(comb);
    }
    return z2 * sum;
}

function findDotsAtSegment(arr: number[]): any;
function findDotsAtSegment(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, t: number): any;
function findDotsAtSegment(...args: any[]) {
    const arr = args.length == 1 ? args[0] : args;
    const p1x = arr[0], p1y = arr[1], c1x = arr[2], c1y = arr[3], c2x = arr[4], c2y = arr[5], p2x = arr[6], p2y = arr[7], t = arr[8];
    const t1 = 1 - t,
        t13 = Math.pow(t1, 3),
        t12 = Math.pow(t1, 2),
        t2 = t * t,
        t3 = t2 * t,
        x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
        y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
        mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
        my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
        nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
        ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
        ax = t1 * p1x + t * c1x,
        ay = t1 * p1y + t * c1y,
        cx = t1 * c2x + t * p2x,
        cy = t1 * c2y + t * p2y;
    let alpha = (90 - Math.atan2(mx - nx, my - ny) * 180 / Math.PI);
    (mx > nx || my < ny) && (alpha += 180);
    return {
        x: x,
        y: y,
        m: { x: mx, y: my },
        n: { x: nx, y: ny },
        start: { x: ax, y: ay },
        end: { x: cx, y: cy },
        alpha: alpha
    };
}

function interHelper(bez1: number[], bez2: number[], justCount: boolean): number | { x: number, y: number, t1: number, t2: number }[] {
    const bbox1 = bezierBBox(bez1),
        bbox2 = bezierBBox(bez2);
    if (!isBBoxIntersect(bbox1, bbox2)) {
        return justCount ? 0 : [];
    }
    const l1 = bezlen(bez1),
        l2 = bezlen(bez2),
        n1 = Math.max(~~(l1 / 5), 1),
        n2 = Math.max(~~(l2 / 5), 1),
        dots1 = [],
        dots2 = [],
        xy: any = {},
        res: number | { x: number, y: number, t1: number, t2: number }[] = justCount ? 0 : [];
    for (let i = 0; i < n1 + 1; i++) {
        const p = findDotsAtSegment(bez1.concat(i / n1));
        dots1.push({ x: p.x, y: p.y, t: i / n1 });
    }
    for (let i = 0; i < n2 + 1; i++) {
        const p = findDotsAtSegment(bez2.concat(i / n2));
        dots2.push({ x: p.x, y: p.y, t: i / n2 });
    }
    for (let i = 0; i < n1; i++) {
        for (let j = 0; j < n2; j++) {
            const di: any = dots1[i],
                di1: any = dots1[i + 1],
                dj: any = dots2[j],
                dj1: any = dots2[j + 1],
                ci: string = Math.abs(di1.x - di.x) < .001 ? "y" : "x",
                cj: string = Math.abs(dj1.x - dj.x) < .001 ? "y" : "x",
                is: any = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
            if (is) {
                if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                    continue;
                }
                xy[is.x.toFixed(4)] = is.y.toFixed(4);
                const t1 = di.t + Math.abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                    t2 = dj.t + Math.abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                    if (justCount) {
                        (res as number)++;
                    } else {
                        (res as { x: number, y: number, t1: number, t2: number }[]).push({
                            x: is.x,
                            y: is.y,
                            t1: Math.min(t1, 1),
                            t2: Math.min(t2, 1)
                        });
                    }
                }
            }
        }
    }
    return res;
}

export function pathIntersection(path1: (string | number)[][], path2: (string | number)[][], justCount?: boolean) {
    // path1 = R._path2curve(path1);
    // path2 = R._path2curve(path2);
    let x1: number = 0, y1: number = 0,
        x2: number = 0, y2: number = 0,
        x1m: number = 0, y1m: number = 0,
        x2m: number = 0, y2m: number = 0,
        bez1: number[], bez2: number[];
    let res: number | any[] = justCount ? 0 : [];
    for (let i = 0, ii = path1.length; i < ii; i++) {
        const pi = path1[i];
        if (pi[0] == "M") {
            x1 = x1m = pi[1] as number;
            y1 = y1m = pi[2] as number;
        } else {
            if (pi[0] == "C") {
                bez1 = [x1, y1].concat(pi.slice(1) as number[]);
                x1 = bez1[6];
                y1 = bez1[7];
            } else {
                bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                x1 = x1m;
                y1 = y1m;
            }
            for (let j = 0, jj = path2.length; j < jj; j++) {
                const pj = path2[j];
                if (pj[0] == "M") {
                    x2 = x2m = pj[1] as number;
                    y2 = y2m = pj[2] as number;
                } else {
                    if (pj[0] == "C") {
                        bez2 = [x2, y2].concat(pj.slice(1) as number[]);
                        x2 = bez2[6];
                        y2 = bez2[7];
                    } else {
                        bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                        x2 = x2m;
                        y2 = y2m;
                    }
                    const intr = interHelper(bez1, bez2, justCount || false);
                    if (justCount) {
                        (res as number) += intr as number;
                    } else {
                        const arr = intr as any[];
                        for (let k = 0, kk = arr.length; k < kk; k++) {
                            arr[k].segment1 = i;
                            arr[k].segment2 = j;
                            arr[k].bez1 = bez1;
                            arr[k].bez2 = bez2;
                        }
                        res = (res as any[]).concat(arr);
                    }
                }
            }
        }
    }
    return res;
}
