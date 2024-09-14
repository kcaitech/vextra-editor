import { Context } from "@/context";
import { BasicArray, CurveMode, CurvePoint, Matrix, PathShapeView, ShapeView } from "@kcdesign/data";
import { v4 } from "uuid";
import { XY } from "@/context/selection";

export interface OvalOptions {
    start: number | string;
    sweep: number | string;
    ratio: number | string;
}

export function sortValue(value: string) {
    let __value: number | string = Number(value.replace(/[°|%]/g, ''));
    __value = Number(__value.toFixed(2));
    if (isNaN(__value)) return __value;
    if (!(__value * 100 % 10)) __value = Number(__value.toFixed(1));
    return __value;
}


export class OvalData {
    static MIXED = 'mixed';

    private readonly m_options: OvalOptions;
    private readonly m_context: Context;

    private m_selected: ShapeView[];

    constructor(context: Context, options: OvalOptions) {
        this.m_context = context;
        this.m_options = options;
        this.m_selected = context.selection.selectedShapes;
    }

    stashSelection(selected?: ShapeView[]) {
        this.m_selected = [...(selected || this.m_context.selection.selectedShapes)];
    }

    update(trigger: any[]) {

    }

    __update() {
        const selected = this.m_selected;
        let START = new Set<number | undefined>();
        let END = new Set<number | undefined>();
        let RATIO = new Set<number | undefined>();
        for (const oval of selected) {
            if (!(oval instanceof PathShapeView) || oval.haveEdit) continue;
            const start = oval.startingAngle ?? 0;
            const end = oval.endingAngle ?? Math.PI * 2;
            const ratio = oval.innerRadius ?? 0;
            START.add(start);
            END.add(end);
            RATIO.add(ratio);
        }
        const options = this.m_options;
        let __start;
        if (START.size > 1) {
            __start = OvalData.MIXED;
        } else {
            __start = Array.from(START.values()).pop() || 0;
        }

        if (END.size > 1 || typeof __start === "string") {
            options.sweep = OvalData.MIXED;
        } else {
            let __end = Array.from(END.values()).pop() || 0;
            options.sweep = 100 * (__end - __start) / (Math.PI * 2);
        }

        if (typeof __start === "string") {
            options.start = OvalData.MIXED;
        } else {
            __start = 360 * (__start / (Math.PI * 2));
            if (__start > 180) __start -= 360;
            options.start = __start;
        }

        if (RATIO.size > 1) {
            options.ratio = OvalData.MIXED;
        } else {
            options.ratio = (Array.from(RATIO.values()).pop() || 0) * 100;
        }
    }

    getPath() {
        let { start, sweep, ratio } = this.m_options;
        const segments: { points: CurvePoint[], isClosed: boolean }[] = [];
        if (typeof start === "string" || typeof sweep === "string" || typeof ratio === "string") {
            // 分别给path

        } else {
            // 统一的path
            const startRad = start / 180 * Math.PI;
            if (ratio === 0) {
                // 检查sweep的数值
                if (!Math.abs(sweep)) {
                    // 一条线，两个点
                    const P0 = getPO();
                    const P1 = getP1(start / 180 * Math.PI, 0.5);
                    segments.push({ points: [P0, P1], isClosed: false });
                } else {
                    // 看弧度处理
                    const P0 = getPO();
                    const __arc = getArcPointsBySweep(sweep, 1);
                    const matrix = new Matrix();
                    matrix.rotate(startRad);
                    transform(__arc, matrix);
                    segments.push({ points: [P0, ...__arc], isClosed: true });
                }
            } else if (ratio > 0 && ratio < 1) {
                // 检查end和start的相交场景
                if (!Math.abs(sweep)) {
                    // 一条线，两个点
                } else if (Math.abs(sweep) === 100) {
                    // 两个圆
                } else {
                    // 看弧度处理
                }
            } else {
                // 一条路径
            }
        }

        function getPO() {
            return new CurvePoint([0] as BasicArray<number>, v4(), 0.5, 0.5, CurveMode.Straight);
        }

        function getP1(arc: number, length: number) {
            const matrix = new Matrix();
            matrix.rotate(arc);
            const xy = matrix.computeCoord2(length, 0.5);
            return new CurvePoint([0] as BasicArray<number>, v4(), xy.x, xy.y, CurveMode.Straight);
        }

        function getQuarters(radius: number = 1) {
            const kappa = 4 * (Math.sqrt(2) - 1) / 3 * (radius / 2);
            const padding = (1 - radius) / 2;
            const top = new CurvePoint([0] as BasicArray<number>, v4(), 0.5, padding, CurveMode.Mirrored);
            top.toX = 0.5 - kappa;
            top.toY = padding;
            top.fromX = 0.5 + kappa;
            top.fromY = padding
            top.hasTo = true;
            top.hasFrom = true;

            const right = new CurvePoint([0] as BasicArray<number>, v4(), 1 - padding, 0.5, CurveMode.Mirrored);
            right.toX = 1 - padding;
            right.toY = 0.5 - kappa;
            right.fromX = 1 - padding;
            right.fromY = 0.5 + kappa;
            right.hasTo = true;
            right.hasFrom = true;

            const bottom = new CurvePoint([0] as BasicArray<number>, v4(), 0.5, 1 - padding, CurveMode.Mirrored);
            bottom.toX = 0.5 + kappa;
            bottom.toY = 1 - padding;
            bottom.fromX = 0.5 - kappa;
            bottom.fromY = 1 - padding;
            bottom.hasTo = true;
            bottom.hasFrom = true;

            const left = new CurvePoint([0] as BasicArray<number>, v4(), padding, 0.5, CurveMode.Mirrored);
            left.toX = padding;
            left.toY = 0.5 + kappa;
            left.fromX = padding;
            left.fromY = 0.5 - kappa;
            left.hasTo = true;
            left.hasFrom = true;

            return [right, bottom, left, top];
        }

        function getArcPointsBySweep(__sweep: number, radius: number) {
            const points = getQuarters(radius);
            const arcPoints: CurvePoint[] = [];
            const sweep = Math.abs(__sweep);
            if (sweep > 0 && sweep < 25) {
                const t = sweep / 25;
                const [right, bottom] = points;
                const fragment = cubicBezierFragment(right, bottom, t);
                arcPoints.push(fragment.start, fragment.end);
            } else if (sweep === 25) {
                const [right, bottom] = points;
                bottom.fromX = undefined;
                bottom.fromY = undefined;
                bottom.mode = CurveMode.Disconnected;
                bottom.hasFrom = undefined;
                arcPoints.push(right, bottom);
            } else if (sweep > 25 && sweep < 50) {
                const t = (sweep - 25) / 25;
                const [right, bottom, left] = points;
                const fragment = cubicBezierFragment(bottom, left, t);
                arcPoints.push(right, fragment.start, fragment.end);
            } else if (sweep === 50) {
                const [right, bottom, left] = points;
                left.fromX = undefined;
                left.fromY = undefined;
                left.mode = CurveMode.Disconnected;
                left.hasFrom = undefined;
                arcPoints.push(right, bottom, left);
            } else if (sweep > 50 && sweep < 75) {
                const t = (sweep - 50) / 25;
                const [right, bottom, left, top] = points;
                const fragment = cubicBezierFragment(left, top, t);
                arcPoints.push(right, bottom, fragment.start, fragment.end);
            } else if (sweep === 75) {
                const [right, bottom, left, top] = points;
                top.fromX = undefined;
                top.fromY = undefined;
                top.mode = CurveMode.Disconnected;
                top.hasFrom = undefined;
                arcPoints.push(right, bottom, left, top);
            } else if (sweep > 75 && sweep < 100) {
                const t = (sweep - 75) / 25;
                const [right, bottom, left, top] = points;
                const fragment = cubicBezierFragment(top, right, t);
                arcPoints.push(right, bottom, left, fragment.start, fragment.end);
            }

            // 往上翻一下
            if (__sweep < 0) {
                const matrix = new Matrix();
                matrix.flipVert(0.5);
                transform(arcPoints, matrix);
            }

            return arcPoints;
        }

        function transform(points: CurvePoint[], matrix: Matrix) {
            points.forEach(p => {
                const xy = matrix.computeCoord2(p.x, p.y);
                p.x = xy.x;
                p.y = xy.y;
                if (p.hasFrom) {
                    const from = matrix.computeCoord2(p.fromX!, p.fromY!);
                    p.fromX = from.x;
                    p.fromY = from.y;
                }
                if (p.hasTo) {
                    const to = matrix.computeCoord2(p.toX!, p.toY!);
                    p.toX = to.x;
                    p.toY = to.y;
                }
            });
            return points;
        }

        function cubicBezierFragment(start: CurvePoint, end: CurvePoint, t: number) {
            const c1 = { x: start.fromX!, y: start.fromY! };
            const c2 = { x: end.toX!, y: end.toY! };
            const A = l(start, c1);
            const B = l(c1, c2);
            const C = l(c2, end);
            const D = l(A, B);
            const E = l(B, C);

            const __start = new CurvePoint([0] as BasicArray<number>, v4(), start.x, start.y, CurveMode.Asymmetric);
            __start.toX = start.toX;
            __start.toY = start.toY;
            __start.fromX = A.x;
            __start.fromY = A.y;

            const __end = new CurvePoint([0] as BasicArray<number>, v4(), E.x, E.y, CurveMode.Disconnected);
            __end.toX = D.x;
            __end.toY = D.y;

            return { start: __start, end: __end };

            function l(p1: XY, p2: XY) {
                return {
                    x: p1.x + t * (p2.x - p1.x),
                    y: p1.y + t * (p2.y - p1.y)
                }
            }
        }
    }
}