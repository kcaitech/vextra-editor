import { XY } from "@/context/selection";
import { Segment } from "@/utils/pathedit";

/**
 * @description 路径的吸附辅助
 */
export class AdsorbAssist {
    getSegmentBoxes(segments: Segment[][]) {
        const boxes: {
            x: number;
            y: number;
            width: number;
            height: number;
        }[] = [];

        for (const __segment of segments) for (const segment of __segment) {
            const box = segment.type === 'curve'
                ? cubicBezierBoundingBox(segment.start, segment.from, segment.to, segment.end)
                : straightBoundingBox(segment.start, segment.end);
            boxes.push({ x: box.xmin, y: box.ymin, width: box.xmax - box.xmin, height: box.ymax - box.ymin });
        }

        return boxes;
    }
}

function cubicBezierBoundingBox(p0: XY, p1: XY, p2: XY, p3: XY) {
    function bezier(t: number, p0: number, p1: number, p2: number, p3: number) {
        const mt = 1 - t;
        return (
            mt ** 3 * p0 +
            3 * mt ** 2 * t * p1 +
            3 * mt * t ** 2 * p2 +
            t ** 3 * p3
        );
    }

    function solveQuadratic(a: number, b: number, c: number) {
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return [];
        if (discriminant === 0) return [-b / (2 * a)];
        const sqrtD = Math.sqrt(discriminant);
        return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
    }

    function findCriticalPoints(p0: number, p1: number, p2: number, p3: number) {
        const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
        const b = 6 * (p0 - 2 * p1 + p2);
        const c = 3 * (p1 - p0);
        if (Math.abs(a) < 1e-10) {
            if (Math.abs(b) > 1e-10) {
                let t = -c / b;
                return (t >= 0 && t <= 1) ? [t] : [];
            }
            return [];
        }
        return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
    }

    const tx = findCriticalPoints(p0.x, p1.x, p2.x, p3.x);
    const ty = findCriticalPoints(p0.y, p1.y, p2.y, p3.y);

    const xValues = [p0.x, p3.x, ...tx.map(t => bezier(t, p0.x, p1.x, p2.x, p3.x))];
    const yValues = [p0.y, p3.y, ...ty.map(t => bezier(t, p0.y, p1.y, p2.y, p3.y))];

    return {
        xmin: Math.min(...xValues),
        xmax: Math.max(...xValues),
        ymin: Math.min(...yValues),
        ymax: Math.max(...yValues),
    };
}

function straightBoundingBox(start: XY, end: XY) {
    return {
        xmin: Math.min(start.x, end.x),
        xmax: Math.max(start.x, end.x),
        ymin: Math.min(start.y, end.y),
        ymax: Math.max(start.y, end.y),
    }
}