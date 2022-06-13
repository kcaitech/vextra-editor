import { B3Curve } from "./b3curve";
import { Box, Point } from "./basic";

export class B3Path extends Array<B3Curve> {
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
        this.m_bbox = this.reduce<Box>(function (p: Box, c: B3Curve, i: number, arr: B3Curve[]): Box {
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
}

export enum InnerSide {
    Left,
    Right,
    Bouth,
}

export interface Segment {
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
export class B3PathSegments extends Array<Segment> {

    private m_endpoints:{[key:string]: [Segment]} = {};
    private m_startpoints:{[key:string]: [Segment]} = {};
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
    getStartSegments(startPoint: Point): Segment[] {
        return this.m_startpoints[startPoint.toString()];
    }
    getEndSegments(endPoint: Point): Segment[] {
        return this.m_endpoints[endPoint.toString()];
    }
}

