
// trans path(lavhqs) to curve path

// eslint-disable-next-line
const pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig;
// eslint-disable-next-line
const pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig;

export function parsePathString(pathString: string): (string | number)[][] {
    if (!pathString || pathString.length == 0) {
        return [];
    }
    // const pth = paths(pathString);
    // if (pth.arr) {
    //     return pathClone(pth.arr);
    // }

    const paramCounts: any = { a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0 };
    const data: (string | number)[][] = [];
    // if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
    //     data = pathClone(pathString);
    // }
    // if (!data.length) {
    pathString.replace(pathCommand, function (a: string, b: string, c: string): string {
        const params: (string | number)[] = [];
        let name = b.toLowerCase();
        c.replace(pathValues, function (a: string, b: string): string {
            b && params.push(+b);
            return "";
        });
        if (name == "m" && params.length > 2) {
            data.push(([b] as (string | number)[]).concat(params.splice(0, 2)));
            name = "l";
            b = b == "m" ? "l" : "L";
        }
        if (name == "r") {
            data.push(([b] as (string | number)[]).concat(params));
        } else while (params.length >= paramCounts[name]) {
            data.push(([b] as (string | number)[]).concat(params.splice(0, paramCounts[name])));
            if (!paramCounts[name]) {
                break;
            }
        }
        return "";// todo
    });

    // }
    // data.toString = R._path2string;
    // pth.arr = pathClone(data);
    return data;
}

// http://schepers.cc/getting-to-the-point
function catmullRom2bezier(crp: number[], z: boolean): (string | number)[][] {
    const d = [];
    for (let i = 0, iLen = crp.length; iLen - 2 * (z ? 0 : 1) > i; i += 2) {
        const p = [
            { x: +crp[i - 2], y: +crp[i - 1] },
            { x: +crp[i], y: +crp[i + 1] },
            { x: +crp[i + 2], y: +crp[i + 3] },
            { x: +crp[i + 4], y: +crp[i + 5] }
        ];
        if (z) {
            if (!i) {
                p[0] = { x: +crp[iLen - 2], y: +crp[iLen - 1] };
            } else if (iLen - 4 == i) {
                p[3] = { x: +crp[0], y: +crp[1] };
            } else if (iLen - 2 == i) {
                p[2] = { x: +crp[0], y: +crp[1] };
                p[3] = { x: +crp[2], y: +crp[3] };
            }
        } else {
            if (iLen - 4 == i) {
                p[3] = p[2];
            } else if (!i) {
                p[0] = { x: +crp[i], y: +crp[i + 1] };
            }
        }
        d.push(["C",
            (-p[0].x + 6 * p[1].x + p[2].x) / 6,
            (-p[0].y + 6 * p[1].y + p[2].y) / 6,
            (p[1].x + 6 * p[2].x - p[3].x) / 6,
            (p[1].y + 6 * p[2].y - p[3].y) / 6,
            p[2].x,
            p[2].y
        ]);
    }
    return d;
}

export function pathToAbsolute(pathArray: (string | number)[][]):(string | number)[][] {
    // let pth = paths(pathArray);
    // if (pth.abs) {
    //     return pathClone(pth.abs);
    // }
    // if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
    //     pathArray = R.parsePathString(pathArray);
    // }
    if (pathArray.length == 0) {
        return [["M", 0, 0]];
    }

    let res = [],
        x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0;
    if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
    }
    const crz: boolean = pathArray.length == 3 && pathArray[0][0] == "M" && (pathArray[1][0] as string).toUpperCase() == "R" && (pathArray[2][0] as string).toUpperCase() == "Z";
    for (let r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push(r = []);
        pa = pathArray[i];
        if (pa[0] != (pa[0] as string).toUpperCase()) {
            r[0] = (pa[0] as string).toUpperCase();
            switch (r[0]) {
                case "A":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +(pa[6] as number + x);
                    r[7] = +(pa[7] as number + y);
                    break;
                case "V":
                    r[1] = +pa[1] + y;
                    break;
                case "H":
                    r[1] = +pa[1] + x;
                    break;
                case "R": {
                    const dots = [x, y].concat(pa.slice(1) as number[]);
                    for (let j = 2, jj = dots.length; j < jj; j++) {
                        dots[j] = +dots[j] + x;
                        dots[++j] = +dots[j] + y;
                    }
                    res.pop();
                    res = res.concat(catmullRom2bezier(dots, crz));
                    break;
                }
                case "M":
                    mx = +pa[1] + x;
                    my = +pa[2] + y;
                    // todo 是否需要？
                    for (let j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + ((j % 2) ? x : y);
                    }
                    break;
                default:
                    for (let j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + ((j % 2) ? x : y);
                    }
                    break;
            }
        } else if (pa[0] == "R") {
            const dots = [x, y].concat(pa.slice(1) as number[]);
            res.pop();
            res = res.concat(catmullRom2bezier(dots, crz));
            r = (["R"] as (string | number)[]).concat(pa.slice(-2));
        } else {
            for (let k = 0, kk = pa.length; k < kk; k++) {
                r[k] = pa[k];
            }
        }
        switch (r[0]) {
            case "Z":
                x = mx;
                y = my;
                break;
            case "H":
                x = r[1] as number;
                break;
            case "V":
                y = r[1] as number;
                break;
            case "M":
                mx = r[r.length - 2] as number;
                my = r[r.length - 1] as number;
                x = r[r.length - 2] as number;
                y = r[r.length - 1] as number;
                break;
            default:
                x = r[r.length - 2] as number;
                y = r[r.length - 1] as number;
                break;
        }
    }
    // res.toString = R._path2string;
    // pth.abs = pathClone(res);
    return res;
}

function l2c(x1: number, y1: number, x2: number, y2: number): number[] {
    return [x1, y1, x2, y2, x2, y2];
}
function q2c(x1: number, y1: number, ax: number, ay: number, x2: number, y2: number): number[] {
    const _13 = 1 / 3,
        _23 = 2 / 3;
    return [
            _13 * x1 + _23 * ax,
            _13 * y1 + _23 * ay,
            _13 * x2 + _23 * ax,
            _13 * y2 + _23 * ay,
            x2,
            y2
        ];
}
function a2c(x1: number, y1: number, rx: number, ry: number, angle: number, large_arc_flag: number, sweep_flag: number, x2: number, y2: number, recursive?: number[]): number[] {
    // for more information of where this math came from visit:
    // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
    const _120 = Math.PI * 120 / 180,
        rad = Math.PI / 180 * (+angle || 0);
    let res: number[] = [],
        xy;
    const rotate = function (x: number, y: number, rad: number) {
            const X = x * Math.cos(rad) - y * Math.sin(rad),
                Y = x * Math.sin(rad) + y * Math.cos(rad);
            return {x: X, y: Y};
        };
    let f1, f2, cx, cy;
    if (!recursive) {
        xy = rotate(x1, y1, -rad);
        x1 = xy.x;
        y1 = xy.y;
        xy = rotate(x2, y2, -rad);
        x2 = xy.x;
        y2 = xy.y;
        // let cos = Math.cos(Math.PI / 180 * angle),
        //     sin = Math.sin(Math.PI / 180 * angle),
        const x = (x1 - x2) / 2,
            y = (y1 - y2) / 2;
        let h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (h > 1) {
            h = Math.sqrt(h);
            rx = h * rx;
            ry = h * ry;
        }
        const rx2 = rx * rx,
            ry2 = ry * ry,
            k = (large_arc_flag == sweep_flag ? -1 : 1) *
                Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));

        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = Math.asin(((y1 - cy) / ry)),
        f2 = Math.asin(((y2 - cy) / ry));

        f1 = x1 < cx ? Math.PI - f1 : f1;
        f2 = x2 < cx ? Math.PI - f2 : f2;
        f1 < 0 && (f1 = Math.PI * 2 + f1);
        f2 < 0 && (f2 = Math.PI * 2 + f2);
        if (sweep_flag && f1 > f2) {
            f1 = f1 - Math.PI * 2;
        }
        if (!sweep_flag && f2 > f1) {
            f2 = f2 - Math.PI * 2;
        }
    } else {
        f1 = recursive[0];
        f2 = recursive[1];
        cx = recursive[2];
        cy = recursive[3];
    }
    let df = f2 - f1;
    if (Math.abs(df) > _120) {
        const f2old = f2,
            x2old = x2,
            y2old = y2;
        f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
        x2 = cx + rx * Math.cos(f2);
        y2 = cy + ry * Math.sin(f2);
        res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
    }
    df = f2 - f1;
    const c1 = Math.cos(f1),
        s1 = Math.sin(f1),
        c2 = Math.cos(f2),
        s2 = Math.sin(f2),
        t = Math.tan(df / 4),
        hx = 4 / 3 * rx * t,
        hy = 4 / 3 * ry * t,
        m1 = [x1, y1],
        m2 = [x1 + hx * s1, y1 - hy * c1],
        m3 = [x2 + hx * s2, y2 - hy * c2],
        m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (recursive) {
        return [...m2, ...m3, ...m4].concat(res);
    } else {
        res = [...m2, ...m3, ...m4].concat(res);
        const newres = [];
        for (let i = 0, ii = res.length; i < ii; i++) {
            newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
        }
        return newres;
    }
}

function pathToRelative(pathArray: (string | number)[][]) {
    // var pth = paths(pathArray);
    // if (pth.rel) {
    //     return pathClone(pth.rel);
    // }
    // if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
    //     pathArray = R.parsePathString(pathArray);
    // }
    const res = [];
    let x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0;
    if (pathArray[0][0] == "M") {
        x = pathArray[0][1] as number;
        y = pathArray[0][2] as number;
        mx = x;
        my = y;
        start++;
        res.push(["M", x, y]);
    }
    for (let i = start, ii = pathArray.length; i < ii; i++) {
        let r:(string | number)[] = res[i] = [];
        const pa = pathArray[i];
        if (pa[0] != (pa[0] as string).toLowerCase()) {
            r[0] = (pa[0] as string).toLowerCase();
            switch (r[0]) {
                case "a":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +(pa[6] as number - x).toFixed(3);
                    r[7] = +(pa[7] as number - y).toFixed(3);
                    break;
                case "v":
                    r[1] = +(pa[1] as number - y).toFixed(3);
                    break;
                case "m":
                    mx = pa[1] as number;
                    my = pa[2] as number;
                    for (let j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +(pa[j] as number - ((j % 2) ? x : y)).toFixed(3);
                    }
                    break;
                default:
                    for (let j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +(pa[j] as number - ((j % 2) ? x : y)).toFixed(3);
                    }
                    break;
            }
        } else {
            r = res[i] = [];
            if (pa[0] == "m") {
                mx = pa[1] as number + x;
                my = pa[2] as number + y;
            }
            for (let k = 0, kk = pa.length; k < kk; k++) {
                res[i][k] = pa[k];
            }
        }
        const len = res[i].length;
        switch (res[i][0]) {
            case "z":
                x = mx;
                y = my;
                break;
            case "h":
                x += +res[i][len - 1];
                break;
            case "v":
                y += +res[i][len - 1];
                break;
            default:
                x += +res[i][len - 2];
                y += +res[i][len - 1];
        }
    }
    // res.toString = R._path2string;
    // pth.rel = pathClone(res);
    return res;
}

export function path2curve(path: (string | number)[][], path2?: (string | number)[][]): (string | number)[][] | (string | number)[][][] {
    // let pth = !path2 && paths(path);
    // if (!path2 && pth.curve) {
    //     return pathClone(pth.curve);
    // }
    const p = pathToAbsolute(path),
        p2 = path2 && pathToAbsolute(path2),
        attrs: any = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
        attrs2: any = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
        processPath = function (path:(string | number)[], d: any, pcom: string) {
            let nx, ny;
            const tq = {T:1, Q:1};
            if (!path) {
                return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
            }
            !(path[0] in tq) && (d.qx = d.qy = null);
            switch (path[0]) {
                case "M":
                    d.X = path[1];
                    d.Y = path[2];
                    break;
                case "A":
                    path = (["C"] as (string | number)[]).concat(a2c(d.x, d.y, path[1] as number, path[2] as number, path[3] as number, path[4] as number, path[5] as number, path[6] as number, path[7] as number));
                    break;
                case "S":
                    if (pcom == "C" || pcom == "S") { // In "S" case we have to take into account, if the previous command is C/S.
                        nx = d.x * 2 - d.bx;          // And reflect the previous
                        ny = d.y * 2 - d.by;          // command's control point relative to the current point.
                    }
                    else {                            // or some else or nothing
                        nx = d.x;
                        ny = d.y;
                    }
                    path = ["C", nx, ny].concat(path.slice(1));
                    break;
                case "T":
                    if (pcom == "Q" || pcom == "T") { // In "T" case we have to take into account, if the previous command is Q/T.
                        d.qx = d.x * 2 - d.qx;        // And make a reflection similar
                        d.qy = d.y * 2 - d.qy;        // to case "S".
                    }
                    else {                            // or something else or nothing
                        d.qx = d.x;
                        d.qy = d.y;
                    }
                    path = (["C"] as (string | number)[]).concat(q2c(d.x, d.y, d.qx, d.qy, path[1] as number, path[2] as number));
                    break;
                case "Q":
                    d.qx = path[1];
                    d.qy = path[2];
                    path = (["C"] as (string | number)[]).concat(q2c(d.x, d.y, path[1] as number, path[2] as number, path[3] as number, path[4] as number));
                    break;
                case "L":
                    path = (["C"] as (string | number)[]).concat(l2c(d.x, d.y, path[1] as number, path[2] as number));
                    break;
                case "H":
                    path = (["C"] as (string | number)[]).concat(l2c(d.x, d.y, path[1] as number, d.y));
                    break;
                case "V":
                    path = (["C"] as (string | number)[]).concat(l2c(d.x, d.y, d.x, path[1] as number));
                    break;
                case "Z":
                    path = (["C"] as (string | number)[]).concat(l2c(d.x, d.y, d.X, d.Y));
                    break;
            }
            return path;
        },
        fixArc = function (pp: (string | number)[][], i: number, ii: number): number {
            if (pp[i].length > 7) {
                pp[i].shift();
                const pi = pp[i];
                while (pi.length) {
                    pcoms1[i]="A"; // if created multiple C:s, their original seg is saved
                    p2 && (pcoms2[i]="A"); // the same as above
                    pp.splice(i++, 0, (["C"] as (string | number)[]).concat(pi.splice(0, 6)));
                }
                pp.splice(i, 1);
                ii = Math.max(p.length, p2 && p2.length || 0);
            }
            return ii;
        },
        fixM = function (path1: (string | number)[][] | undefined, path2: (string | number)[][] | undefined, a1: any, a2: any, i: number, ii: number): number {
            if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                path2.splice(i, 0, ["M", a2.x, a2.y]);
                a1.bx = 0;
                a1.by = 0;
                a1.x = path1[i][1];
                a1.y = path1[i][2];
                ii = Math.max(p.length, p2 && p2.length || 0);
            }
            return ii;
        },
        pcoms1 = [], // path commands of original path p
        pcoms2 = []; // path commands of original path p2
    let pfirst = "", // temporary holder for original path command
        pcom = ""; // holder for previous path command of original path
    for (let i = 0, ii = Math.max(p.length, p2 && p2.length || 0); i < ii; i++) {
        p[i] && (pfirst = p[i][0] as string); // save current path command

        if (pfirst != "C") // C is not saved yet, because it may be result of conversion
        {
            pcoms1[i] = pfirst; // Save current path command
            i && ( pcom = pcoms1[i-1]); // Get previous path command pcom
        }
        p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

        if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
        // which may produce multiple C:s
        // so we have to make sure that C is also C in original path

        ii = fixArc(p, i, ii); // fixArc adds also the right amount of A:s to pcoms1

        if (p2) { // the same procedures is done to p2
            p2[i] && (pfirst = p2[i][0] as string);
            if (pfirst != "C")
            {
                pcoms2[i] = pfirst;
                i && (pcom = pcoms2[i-1]);
            }
            p2[i] = processPath(p2[i], attrs2, pcom);

            if (pcoms2[i]!="A" && pfirst=="C") pcoms2[i]="C";

            ii = fixArc(p2, i, ii);
        }
        ii = fixM(p, p2, attrs, attrs2, i, ii);
        ii = fixM(p2, p, attrs2, attrs, i, ii);
        const seg = p[i],
            seg2 = p2 && p2[i],
            seglen = seg.length,
            seg2len = seg2 && seg2.length || 0;
        attrs.x = seg[seglen - 2];
        attrs.y = seg[seglen - 1];
        attrs.bx = (seg[seglen - 4]) || attrs.x;
        attrs.by = (seg[seglen - 3]) || attrs.y;
        attrs2.bx = seg2 && ((seg2[seg2len - 4]) || attrs2.x);
        attrs2.by = seg2 && ((seg2[seg2len - 3]) || attrs2.y);
        attrs2.x = seg2 && seg2[seg2len - 2];
        attrs2.y = seg2 && seg2[seg2len - 1];
    }
    // if (!p2) {
    //     pth.curve = pathClone(p);
    // }
    return p2 ? [p, p2] : p;
}

