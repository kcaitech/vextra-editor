import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Matrix } from "@kcdesign/data";
import { roundBy } from "@/path/common";

export const AdsorbConfigLocalKey = 'AdsorbAssist';

export type BoxInfo = {
    type: 'straight' | 'curve';
    segmentIndex: number;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    target?: boolean
}

/**
 * @description 路径的吸附辅助
 */
export class AdsorbAssist {
    static viscosity = 5;
    constructor(private context: Context) {
    }

    private m_boxes: BoxInfo[] | undefined;

    private get segments() {
        return this.context.path.segments;
    }

    private get segmentBoxes() {
        if (this.m_boxes) return this.m_boxes;
        const boxes: BoxInfo[] = [];
        const segments = this.context.path.segments;
        for (const __segment of segments) for (const segment of __segment) {
            const box = segment.type === 'curve'
                ? cubicBezierBoundingBox(segment.start, segment.from, segment.to, segment.end)
                : straightBoundingBox(segment.start, segment.end);
            const boxInfo: BoxInfo = {
                x: box.xmin,
                y: box.ymin,
                width: box.xmax - box.xmin,
                height: box.ymax - box.ymin,
                type: segment.type,
                segmentIndex: segment.segment,
                index: segment.index
            }
            boxes.push(boxInfo);
        }
        return this.m_boxes = boxes;
    }

    private fixXYByPointsMap(xy: XY): XY | null {
        let bestX = 0;
        let bestDX = Infinity;
        let bestY = 0;
        let bestDY = Infinity;
        const living = { ...xy };
        // todo 辅助线的绘制
        const segments = this.segments;
        for (const _segment of segments) for (const segment of _segment) {
            const start = segment.start;
            const dx = Math.abs(living.x - start.x);
            if (dx < bestDX) {
                bestDX = dx;
                bestX = start.x;
            }
            const dy = Math.abs(living.y - start.y);
            if (dy < bestDY) {
                bestDY = dy;
                bestY = start.y;
            }
        }

        let changed = false;
        if (bestDX < AdsorbAssist.viscosity) {
            living.x = bestX;
            changed = true;
        }
        if (bestDY < AdsorbAssist.viscosity) {
            living.y = bestY;
            changed = true;
        }
        return changed ? living : null;
    }

    private fixYBySegmentsMap(point: XY): XY | null {
        const roundAlphaBoxes: BoxInfo[] = [];
        const boxes = this.segmentBoxes
        for (const box of boxes) {
            if (pointToRectDistance(box, point) < AdsorbAssist.viscosity) roundAlphaBoxes.push(box);
        }
        if (!roundAlphaBoxes.length) return null;
        const segments = this.segments;
        let bd = Infinity;
        let bestPoint: null | XY = null;
        for (const box of roundAlphaBoxes) {
            const { segmentIndex, index } = box;
            const segment = segments[segmentIndex][index];
            if (box.type === 'curve') {
                const d = findClosestPointOnBezier(point, segment.start, segment.from, segment.to, segment.end);
                if (d.distance < bd) {
                    bd = d.distance;
                    bestPoint = d.point;
                }
            } else {
                const __point = findClosestPointOnLine(segment.start.x, segment.start.y, segment.end.x, segment.end.y, point.x, point.y);
                const d = Math.hypot(point.x - __point.x, point.y - __point.y);
                if (d < bd) {
                    bd = d;
                    bestPoint = __point;
                }
            }
        }
        if (bd < AdsorbAssist.viscosity) return bestPoint!;
        else return null;
    }

    private align(xy: XY) {
        const __xy = new Matrix(this.context.workspace.matrix.inverse).computeCoord3(xy);
        __xy.x = roundBy(__xy.x);
        __xy.y = roundBy(__xy.y);
        return this.context.workspace.matrix.computeCoord3(__xy);
    }

    private get config(): { adsorb: boolean, align: boolean } {
        return JSON.parse(localStorage.getItem(AdsorbConfigLocalKey) ?? '');
    }

    getAssistPoint(event: MouseEvent): XY {
        const baseXY = this.context.workspace.getContentXY(event);
        if (event.shiftKey) {
            // todo shift操作
            return baseXY;
        }
        let livingXY = { ...baseXY };
        const config = this.config;

        if (config.align) {
            livingXY = this.align(baseXY);
        }

        if (config.adsorb) {
            livingXY = this.fixXYByPointsMap(baseXY) ?? livingXY;
            livingXY = this.fixYBySegmentsMap(baseXY) ?? livingXY;
        }

        return livingXY;
    }

    clear() {
        this.m_boxes = undefined;
    }
}

// 点到包围盒的距离
function pointToRectDistance(rect: BoxInfo, point: XY) {
    // 计算矩形边界
    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;

    // 判断点是否在矩形内部
    if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
        // 点在矩形内部，返回负值
        const dx = Math.max(left - point.x, 0, point.x - right);
        const dy = Math.max(top - point.y, 0, point.y - bottom);
        return -Math.sqrt(dx * dx + dy * dy);
    }

    // 点在矩形外部，计算最近距离
    const closestX = Math.max(left, Math.min(point.x, right));
    const closestY = Math.max(top, Math.min(point.y, bottom));

    const dx = point.x - closestX;
    const dy = point.y - closestY;

    return Math.sqrt(dx * dx + dy * dy);
}

// 三次贝塞尔曲线包围盒
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

// 直线包围盒
function straightBoundingBox(start: XY, end: XY) {
    return {
        xmin: Math.min(start.x, end.x),
        xmax: Math.max(start.x, end.x),
        ymin: Math.min(start.y, end.y),
        ymax: Math.max(start.y, end.y),
    }
}

// 三次贝塞尔曲线最近点 O(1)
function findClosestPointOnBezier(Q: XY, P0: XY, P1: XY, P2: XY, P3: XY) {
    // 计算贝塞尔曲线点
    const bezier = (t: number) => {
        const t1 = 1 - t;
        const x = t1 ** 3 * P0.x + 3 * t * t1 ** 2 * P1.x + 3 * t ** 2 * t1 * P2.x + t ** 3 * P3.x;
        const y = t1 ** 3 * P0.y + 3 * t * t1 ** 2 * P1.y + 3 * t ** 2 * t1 * P2.y + t ** 3 * P3.y;
        return { x, y };
    };

    // 计算一阶导数（切线向量）
    const bezierPrime = (t: number) => {
        const t1 = 1 - t;
        const dx = 3 * t1 ** 2 * (P1.x - P0.x) + 6 * t * t1 * (P2.x - P1.x) + 3 * t ** 2 * (P3.x - P2.x);
        const dy = 3 * t1 ** 2 * (P1.y - P0.y) + 6 * t * t1 * (P2.y - P1.y) + 3 * t ** 2 * (P3.y - P2.y);
        return { dx, dy };
    };

    // 计算二阶导数
    const bezierDoublePrime = (t: number) => {
        const ddx = 6 * (1 - t) * (P2.x - 2 * P1.x + P0.x) + 6 * t * (P3.x - 2 * P2.x + P1.x);
        const ddy = 6 * (1 - t) * (P2.y - 2 * P1.y + P0.y) + 6 * t * (P3.y - 2 * P2.y + P1.y);
        return { ddx, ddy };
    };

    // 牛顿迭代法求根
    const letNewtonBe = (initialT: number, maxIterations = 10) => {
        let t = initialT;
        for (let i = 0; i < maxIterations; i++) {
            const B = bezier(t);
            const BPrime = bezierPrime(t);
            const BDoublePrime = bezierDoublePrime(t);

            // 计算 f(t) = (B(t) - Q) · B'(t)
            const f = (B.x - Q.x) * BPrime.dx + (B.y - Q.y) * BPrime.dy;
            if (Math.abs(f) < 1e-6) break;

            // 计算 f'(t) = |B'(t)|² + (B(t) - Q) · B''(t)
            const fPrime =
                BPrime.dx ** 2 + BPrime.dy ** 2 +
                (B.x - Q.x) * BDoublePrime.ddx +
                (B.y - Q.y) * BDoublePrime.ddy;

            // 更新 t 并约束在 [0,1] 范围内
            t = Math.max(0, Math.min(1, t - f / fPrime));
        }
        return t;
    };

    // 均匀采样找初始点
    let closestT = 0;
    let minDistSq = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
        const B = bezier(t);
        const distSq = (B.x - Q.x) ** 2 + (B.y - Q.y) ** 2;
        if (distSq < minDistSq) {
            minDistSq = distSq;
            closestT = t;
        }
    }

    // 牛顿法优化
    const optimizedT = letNewtonBe(closestT);

    // 检查端点和优化结果
    const candidates = [0, 1, optimizedT];
    let bestT = 0;
    minDistSq = Infinity;
    for (const t of candidates) {
        const B = bezier(t);
        const distSq = (B.x - Q.x) ** 2 + (B.y - Q.y) ** 2;
        if (distSq < minDistSq) {
            minDistSq = distSq;
            bestT = t;
        }
    }

    const point = bezier(bestT);

    return {
        point,
        t: bestT,
        distance: Math.hypot(point.x - Q.x, point.y - Q.y),
    };
}

// 直线最近点
function findClosestPointOnLine(x1: number, y1: number, x2: number, y2: number, x0: number, y0: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0) {
        return { x: x1, y: y0 };
    }

    if (dy === 0) {
        return { x: x0, y: y1 };
    }


    const m = dy / dx;
    const b = y1 - m * x1;

    const x = (m * (y0 - b) + x0) / (m * m + 1);
    const y = m * x + b;

    return { x, y };
}

export function getAdsorbConfig() {
    let configStr = localStorage.getItem(AdsorbConfigLocalKey);
    if (configStr === null) {
        localStorage.setItem(AdsorbConfigLocalKey, configStr = JSON.stringify({ adsorb: true, align: true }));
    }
    return JSON.parse(configStr);
}

export function modifyAdsorbConfig(key: string, val: boolean) {
    let configStr = localStorage.getItem(AdsorbConfigLocalKey);
    if (configStr === null) {
        localStorage.setItem(AdsorbConfigLocalKey, configStr = JSON.stringify({ adsorb: true, align: true }));
    }
    const config = JSON.parse(configStr);
    config[key] = val;
    localStorage.setItem(AdsorbConfigLocalKey, JSON.stringify(config));
}