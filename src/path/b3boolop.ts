/**

path0,1:string -> to array -> absolute -> to curve:B3Curve ->
自相交拆分->闭合&非闭合拆分 -[闭合]-> 重合拆分 -> 去掉包含在自身path内的
相交拆分 -> 
boolean op -> rebuild path [+非闭合?]-> ant curve -> path:string

*/

import { B3Curve } from "./b3curve";
import { B3Path, B3PathSegments, InnerSide, Segment } from "./b3path";
import { accuracy, Line, Point } from "./basic";
import { parsePathString, path2curve, pathToAbsolute } from "./transform";

interface B3Pos {
    t: number,
    index: number,
    curve: B3Curve | Line,
    path: B3Path | Line[],
}

interface B3PathInters {
    point: Point,
    pos0: B3Pos,
    pos1: B3Pos,
}

function intersections(_this: B3Path, a: Line | B3Path): B3PathInters[] {
    const p = a instanceof Line ? [a] : a;
    const ret: B3PathInters[] = [];
    _this.forEach((c0, i) => p.forEach((c1, j) => {
        ret.push(...c0.intersections(c1).map<B3PathInters>((v) => {
            return {
                point: Point.make(v.x, v.y),
                pos0: {
                    t: v.t0,
                    index: i,
                    curve: c0,
                    path: _this
                },
                pos1: {
                    t: v.t1,
                    index: j,
                    curve: c1,
                    path: p
                }
            }
        }))
    }))

    // 去重
    return ret.reduce<B3PathInters[]>((pre, c) => {
        if (pre.length > 0) {
            const last = pre[pre.length - 1];
            if (!last.point.extremeClose(c.point)) {
                pre.push(c);
            }
        }
        else {
            pre.push(c);
        }
        return pre;
    }, []);
}

function splitAtInters(_this: B3Path, inters: B3PathInters[]) {
    const indexs = [];
    for (let i = 0; i < inters.length; i++) {
        const inter = inters[i];
        if (inter.pos0.path == _this) {
            indexs.push({ i: inter.pos0.index, t: inter.pos0.t })
        }
        else if (inter.pos1.path == _this) {
            indexs.push({ i: inter.pos1.index, t: inter.pos1.t })
        }
    }
    let offset = 0;
    indexs.sort((a, b) => { return a.i - b.i || a.t - b.t });
    for (let i = 0, len = indexs.length; i < len; i++) {
        const ii = indexs[i];
        const idx = ii.i + offset;
        const t = ii.t;
        if (Math.abs(t) < accuracy || Math.abs(1-t) < accuracy) { // 端点
            continue;
        }
        const c = _this[idx];
        const s = c.split(t);
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

function spliceAtSelfInters(_this: B3Path) {
    for (let i = 0; i < _this.length; i++) {
        const c = _this[i];
        if (!c.isSelfClose) {
            continue;
        }
        const inters = c.selfInters;
        if (inters.length > 1) {
            // ?
            throw new Error("cubic bezier curve can intersect self more than 1?");
        }
        const t0 = Math.min(inters[0].t0, inters[0].t1);
        const t1 = Math.min(inters[0].t0, inters[0].t1);
        const splits = [c];
        if (t0 !== 0 && t0 !== 1) {
            const s = splits[splits.length - 1].split(t0);
            splits.splice(splits.length - 1, 1, ...s);
        }
        if (t1 !== 0 && t1 !== 1 && t1 !== t0) {
            const t3 = (t1 - t0) / (1 - t0);
            const s = splits[splits.length - 1].split(t3);
            splits.splice(splits.length - 1, 1, ...s);
        }
        _this.splice(i, 1, ...splits);
        i = i + splits.length - 1;
    }
}

function pathArrToB3Path(pathArr: (string | number)[][]): B3Path {
    const path: B3Path = B3Path.make();
    for (let i = 1; i < pathArr.length; i++) {
        if (pathArr[i][0] == "M") { // 多个路径组合的
            continue;
        }
        const seg: number[] = [];
        seg.push(<number>pathArr[i - 1][pathArr[i - 1].length - 2], <number>pathArr[i - 1][pathArr[i - 1].length - 1]);
        for (let j = 1; j < pathArr[i].length; j++) {
            seg.push(<number>pathArr[i][j]);
        }
        path.push(B3Curve.make(Point.make(seg[0], seg[1]),
            Point.make(seg[2], seg[3]),
            Point.make(seg[4], seg[5]),
            Point.make(seg[6], seg[7])));
    }
    return path;
}

function b3pathToArr(path: B3Path): (string | number)[][] {
    const ret: (string | number)[][] = [];
    for (let i = 0; i < path.length; i++) {
        const c = path[i];
        if (i === 0) {
            ret.push(["M", c.start.x, c.start.y]);
            ret.push(["C", c.c0.x, c.c0.y, c.c1.x, c.c1.y, c.end.x, c.end.y]);
        } else {
            const pc = path[i - 1];
            if (!pc.end.extremeClose(c.start)) {
                ret.push(["M", c.start.x, c.start.y]);
            }
            ret.push(["C", c.c0.x, c.c0.y, c.c1.x, c.c1.y, c.end.x, c.end.y]);
        }
    }
    return ret;
}

function isCurveInsidePath(curve: B3Curve, path: B3Path): boolean {
    // 射线法
    // nonezero 填充规则
    // nonezero & evenodd 参考
    // https://www.zhangxinxu.com/wordpress/2018/10/nonzero-evenodd-fill-mode-rule/
    const point = curve.getPointAt(.5);
    const bbox = path.bbox;
    if (!point.isInside(bbox)) {
        return false;
    }

    const dx = bbox.width * 1.1;
    const dy = bbox.height * Math.random() / 100;
    const line = Line.make(point.clone(), Point.make(point.x + dx, point.y + dy));

    const inters = intersections(path, line);
    let nonezero = 0;
    // https://zhuanlan.zhihu.com/p/148148902
    inters.forEach((v) => {
        const curve = <B3Curve>v.pos0.curve;
        const a = { x: curve.end.x - curve.start.x, y: curve.end.y - curve.start.y };
        const b = { x: point.x - curve.start.x, y: point.y - curve.start.y };
        const d = a.x * b.y - a.y * b.x;
        if (d > 0) { // point at curve's left side, so nonezero direction is counertclockwise
            nonezero--;
        }
        else if (d < 0) { // right side, clockwise
            nonezero++;
        }
    });
    return nonezero !== 0;
}

// function nonezero(point: Point, path: B3Path) {
//     if (path.length == 0) {
//         return 0;
//     }
//     const curve = path[0];
//     const bbox = path.bbox;
//     const left = Math.min(bbox.left, point.x);
//     const top = Math.min(bbox.top, point.y);
//     const right = Math.max(bbox.right, point.x);
//     const bottom = Math.max(bbox.bottom, point.y);
// }

function nonezero(curve: B3Curve, path: B3Path, leftSide?: boolean) {
    const point = curve.getPointAt(.5);
    const bbox = path.bbox;
    const left = Math.min(bbox.left, point.x);
    const top = Math.min(bbox.top, point.y);
    const right = Math.max(bbox.right, point.x);
    const bottom = Math.max(bbox.bottom, point.y);
    const h = Math.sqrt((right - left) ** 2 + (bottom - top) ** 2);
    const start = curve.start;
    const a = { x: point.x - start.x, y: point.y - start.y };
    const l = Math.sqrt(a.x ** 2 + a.y ** 2);

    // 取start->end右侧的点
    const x = start.x + (leftSide ? -1 : 1) * h / l * (point.y - start.y);
    const y = start.y - (leftSide ? -1 : 1) * h / l * (point.x - start.x);
    //const crossSign = h / l * ((point.y - start.y)**2 + (point.x - start.x)**2);

    // 右射线
    const line = Line.make(point.clone(), Point.make(x, y));
    const inters = intersections(path, line);
    let nonezero = 0;
    // https://zhuanlan.zhihu.com/p/148148902
    inters.forEach((v) => {
        const c = <B3Curve>v.pos0.curve;
        if (!c.isSameCurve(curve)) {
            const a = { x: c.end.x - c.start.x, y: c.end.y - c.start.y };
            const b = { x: point.x - c.start.x, y: point.y - c.start.y };
            const d = a.x * b.y - a.y * b.x;
            if (d > 0) { // point at curve's left side, so nonezero direction is counertclockwise
                nonezero--;
            }
            else if (d < 0) { // right side, clockwise
                nonezero++;
            }
        }
    });
    // return nonezero !== 0 ? InnerSide.Right : InnerSide.Left;
    return nonezero;
}

function markInnerSide(segments: B3PathSegments) {
    for (let i = 0, len = segments.length; i < len; i++) {
        const seg = segments[i];
        seg.inside = nonezero(seg.segment[0], seg.origin) !== 0 ? InnerSide.Right : InnerSide.Left;
        if (nonezero(seg.segment[0], seg.origin, true) !== 0 && seg.inside === InnerSide.Right) {
            seg.inside = InnerSide.Bouth;
        }
    }
}


function toSegments(p0: B3Path, origin: B3Path, segments: B3PathSegments) {
    let seg: B3Path | undefined;
    p0.forEach((v) => {
        if (!seg) {
            seg = B3Path.make();
            seg.push(v);
        }
        else {
            const last = seg[seg.length - 1];
            if (last.end.extremeClose(v.start)) {
                seg.push(v);
            }
            else {
                if (seg) {
                    segments.push({ segment: seg, origin });
                }
                seg = B3Path.make();
                seg.push(v);
            }
        }
    })
    if (seg) {
        segments.push({ segment: seg, origin });
        seg = undefined;
    }
}

function toPath(segments: B3PathSegments) {
    return segments.reduce<B3Path>((p, s) => {
        p.push(...s.segment);
        return p;
    }, B3Path.make());
}

function sortSegments(segments: B3PathSegments, firstPath: B3Path) {
    let firstSeg:Segment | undefined;
    const newsegments = B3PathSegments.make();
    for (let i = 0, len = segments.length; i < len; i++) {
        const seg = segments[i];
        if (seg.origin === firstPath) {
            seg.used = true;
            newsegments.push(seg);
            firstSeg = seg;
            break;
        }
    }
    while (firstSeg && newsegments.length < segments.length) {
        const last = newsegments[newsegments.length - 1];
        let nexts = segments.getStartSegments(last.segment[last.segment.length - 1].end);
        let find = false;
        for (let i = 0, len = nexts && nexts.length || 0; i < len; i++) {
            if (!nexts[i].used) {
                if (firstSeg.inside === nexts[i].inside) {
                    nexts[i].used = true;
                    newsegments.push(nexts[i]);
                    find = true;
                    break;
                }
            }
        }
        if (find) {
            continue;
        }
        nexts = segments.getEndSegments(last.segment[last.segment.length - 1].end);
        for (let i = 0, len = nexts && nexts.length || 0; i < len; i++) {
            if (!nexts[i].used) {
                if (firstSeg.inside !== nexts[i].inside) {
                    nexts[i].used = true;
                    nexts[i].segment.reverse();
                    nexts[i].inside = ((inside)=>{
                        switch(inside) {
                            case InnerSide.Left: return InnerSide.Right;
                            case InnerSide.Right: return InnerSide.Left;
                            default: return inside;
                        }
                    })(nexts[i].inside);
                    newsegments.push(nexts[i]);
                    find = true;
                    break;
                }
            }
        }
        if (find) {
            continue;
        }
        else {
            if (firstSeg !== last && (firstSeg).segment[0].start.extremeClose(last.segment[last.segment.length - 1].end)) { // closed
                for (let i = 0, len = segments.length; i < len; i++) {
                    const seg = segments[i];
                    if (seg.origin === firstPath && !seg.used) {
                        seg.used = true;
                        newsegments.push(seg);
                        firstSeg = seg;
                        find = true;
                        break;
                    }
                }
            }
        }
        if (find) {
            continue;
        } else {
            // error?
            throw new Error("wrong path?");
            // break;
        }
        // 
    }
    return newsegments;
}


function _union(path0: B3Path, path1: B3Path): B3Path {
    const p0 = path0.clone();
    const p1 = path1.clone();
    for (let i = 0; i < p0.length; i++) {
        const c = p0[i];
        if (isCurveInsidePath(c, path1)) {
            p0.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < p1.length; i++) {
        const c = p1[i];
        if (isCurveInsidePath(c, path0)) {
            p1.splice(i, 1);
            i--;
        }
    }
    const segments = B3PathSegments.make();
    toSegments(p0, path0, segments);
    toSegments(p1, path1, segments);
    markInnerSide(segments);
    return toPath(sortSegments(segments, path0));
}

function _intersect(path0: B3Path, path1: B3Path): B3Path {
    const p0 = path0.clone();
    const p1 = path1.clone();
    for (let i = 0; i < p0.length; i++) {
        const c = p0[i];
        if (!isCurveInsidePath(c, path1)) {
            p0.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < p1.length; i++) {
        const c = p1[i];
        if (!isCurveInsidePath(c, path0)) {
            p1.splice(i, 1);
            i--;
        }
    }
    const segments = B3PathSegments.make();
    toSegments(p0, path0, segments);
    toSegments(p1, path1, segments);
    markInnerSide(segments);
    return toPath(sortSegments(segments, path0));
}

function _subtract(path0: B3Path, path1: B3Path): B3Path {
    const p0 = path0.clone();
    const p1 = path1.clone();
    for (let i = 0; i < p0.length; i++) {
        const c = p0[i];
        if (isCurveInsidePath(c, path1)) {
            p0.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < p1.length; i++) {
        const c = p1[i];
        if (!isCurveInsidePath(c, path0)) {
            p1.splice(i, 1);
            i--;
        }
    }
    const segments = B3PathSegments.make();
    toSegments(p0, path0, segments);
    toSegments(p1, path1, segments);
    markInnerSide(segments);
    // sort
    let firstSeg:Segment | undefined;
    const newsegments = B3PathSegments.make();
    for (let i = 0, len = segments.length; i < len; i++) {
        const seg = segments[i];
        if (seg.origin === path0) {
            seg.used = true;
            newsegments.push(seg);
            firstSeg = seg;
            break;
        }
    }
    while (firstSeg && newsegments.length < segments.length) {
        const last = newsegments[newsegments.length - 1];
        let nexts = segments.getStartSegments(last.segment[last.segment.length - 1].end);
        let find = false;
        for (let i = 0, len = nexts && nexts.length || 0; i < len; i++) {
            if (!nexts[i].used) {
                if (firstSeg.origin === nexts[i].origin && firstSeg.inside === nexts[i].inside ||
                    firstSeg.origin !== nexts[i].origin && firstSeg.inside !== nexts[i].inside) {
                    nexts[i].used = true;
                    newsegments.push(nexts[i]);
                    find = true;
                    break;
                }
            }
        }
        if (find) {
            continue;
        }
        nexts = segments.getEndSegments(last.segment[last.segment.length - 1].end);
        for (let i = 0, len = nexts && nexts.length || 0; i < len; i++) {
            if (!nexts[i].used) {
                if (firstSeg.origin !== nexts[i].origin && firstSeg.inside === nexts[i].inside ||
                    firstSeg.origin === nexts[i].origin && firstSeg.inside !== nexts[i].inside) {
                    nexts[i].used = true;
                    nexts[i].segment.reverse();
                    nexts[i].inside = ((inside)=>{
                            switch(inside) {
                                case InnerSide.Left: return InnerSide.Right;
                                case InnerSide.Right: return InnerSide.Left;
                                default: return inside;
                            }
                        })(nexts[i].inside);
                    newsegments.push(nexts[i]);
                    find = true;
                    break;
                }
            }
        }
        if (find) {
            continue;
        }
        else {
            if (firstSeg !== last && firstSeg.segment[0].start.extremeClose(last.segment[last.segment.length - 1].end)) { // closed
                for (let i = 0, len = segments.length; i < len; i++) {
                    const seg = segments[i];
                    if (seg.origin === path0 && !seg.used) {
                        seg.used = true;
                        newsegments.push(seg);
                        firstSeg = seg;
                        find = true;
                        break;
                    }
                }
            }
        }
        if (find) {
            continue;
        } else {
            // error?
            throw new Error("wrong path?");
            // break;
        }
    }
    return toPath(newsegments);
}

function _xor(path0: B3Path, path1: B3Path): B3Path {
    const p: B3Path = _subtract(path0, path1);
    p.push(..._subtract(path1, path0));
    return p;
}

export function union(el1: (string | number)[][], el2: (string | number)[][]): (string | number)[][] {
    // curve to b3curve
    const b3path0 = pathArrToB3Path(el1);
    const b3path1 = pathArrToB3Path(el2);

    // 自相交拆分
    spliceAtSelfInters(b3path0);
    spliceAtSelfInters(b3path1);

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    const path = _union(b3path0, b3path1);
    return b3pathToArr(path);
}

export function subtract(el1: (string | number)[][], el2: (string | number)[][]): (string | number)[][] {
    // curve to b3curve
    const b3path0 = pathArrToB3Path(el1);
    const b3path1 = pathArrToB3Path(el2);

    // 自相交拆分
    spliceAtSelfInters(b3path0);
    spliceAtSelfInters(b3path1);

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    const path = _subtract(b3path0, b3path1);
    return b3pathToArr(path);
}

export function intersect(el1: (string | number)[][], el2: (string | number)[][]): (string | number)[][] {
    // curve to b3curve
    const b3path0 = pathArrToB3Path(el1);
    const b3path1 = pathArrToB3Path(el2);

    // 自相交拆分
    spliceAtSelfInters(b3path0);
    spliceAtSelfInters(b3path1);

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    const path = _intersect(b3path0, b3path1);
    return b3pathToArr(path);
}

export function xor(el1: (string | number)[][], el2: (string | number)[][]): (string | number)[][] {
    // curve to b3curve
    const b3path0 = pathArrToB3Path(el1);
    const b3path1 = pathArrToB3Path(el2);

    // 自相交拆分
    spliceAtSelfInters(b3path0);
    spliceAtSelfInters(b3path1);

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    const path = _xor(b3path0, b3path1);
    return b3pathToArr(path);
}
