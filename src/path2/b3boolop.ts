/**

path0,1:string -> to array -> absolute -> to curve:B3Curve ->
自相交拆分->闭合&非闭合拆分 -[闭合]-> 重合拆分 -> 去掉包含在自身path内的
相交拆分 -> 
boolean op -> rebuild path [+非闭合?]-> ant curve -> path:string

*/

import { B3Path, B3PathSegments, InnerSide, intersections, PathSegment, splitAtInters } from "./b3path";
import { ISegment, Line, Point } from "./basic";

function isCurveInsidePath(curve: ISegment, path: B3Path): boolean {
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
    return path.nonezeroCount(line, curve) !== 0;
}

function nonezero(curve: ISegment, path: B3Path, leftSide?: boolean) {
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
    // 右射线
    const line = Line.make(point.clone(), Point.make(x, y));
    return path.nonezeroCount(line, curve);
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
            if (last.end.equals(v.start)) {
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
    let firstSeg:PathSegment | undefined;
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
            if ((firstSeg).segment[0].start.equals(last.segment[last.segment.length - 1].end)) { // closed
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

    // sort segments
    let firstSeg:PathSegment | undefined;
    const newsegments = B3PathSegments.make();
    for (let i = 0, len = segments.length; i < len; i++) {
        const seg = segments[i];
        if (!seg.used && seg.origin === path0) {
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
            if ((firstSeg).segment[0].start.equals(last.segment[last.segment.length - 1].end)) { // closed
                for (let i = 0, len = segments.length; i < len; i++) {
                    const seg = segments[i];
                    if (!seg.used) {
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
    return toPath(newsegments);
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
    let firstSeg:PathSegment | undefined;
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
            if (firstSeg !== last && firstSeg.segment[0].start.equals(last.segment[last.segment.length - 1].end)) { // closed
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

export function union(b3path0: B3Path, b3path1: B3Path): B3Path {
    // 自相交拆分

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    return _union(b3path0, b3path1);
}

export function subtract(b3path0: B3Path, b3path1: B3Path): B3Path {
    // 自相交拆分

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    return _subtract(b3path0, b3path1);
}

export function intersect(b3path0: B3Path, b3path1: B3Path): B3Path {

    // 自相交拆分

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    return _intersect(b3path0, b3path1);
}

export function xor(b3path0: B3Path, b3path1: B3Path): B3Path {

    // 自相交拆分

    // 闭合非闭合拆分

    // 重合拆分

    // 相交拆分
    const inters = intersections(b3path0, b3path1);
    splitAtInters(b3path0, inters);
    splitAtInters(b3path1, inters);

    return _xor(b3path0, b3path1);
}
