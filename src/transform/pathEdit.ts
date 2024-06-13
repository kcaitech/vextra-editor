import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import {
    CurveMode,
    CurvePoint,
    GroupShapeView,
    Matrix,
    ModifyUnits,
    PathModifier,
    PathShapeView,
    PathType,
    ShapeFrame,
    ShapeType,
    ShapeView
} from "@kcdesign/data";
import { XY } from "@/context/selection";
import { Path } from "@/context/path";
import { Assist } from "@/context/assist";
import { is_layers_tree_unit } from "@/utils/scout";
import { forbidden_to_modify_frame } from "@/utils/common";
import { permIsEdit } from "@/utils/permission";

type Base = {
    x: number;
    y: number;

    fromX: number | undefined;
    fromY: number | undefined;
    toX: number | undefined;
    toY: number | undefined;
}
type BaseData = Map<string, Base>;

enum SegmentType {
    Straight = 'line',
    Curve3rd = '3rd',
    Curve2nd = '2nd'
}

type Line = { start: XY, end: XY };
type Curve3rd = { start: XY, c1: XY, c2: XY, end: XY };

/**
 * 点到折线的距离
 */
function point2line(point: XY, start: XY, end: XY) {
    const px = point.x;
    const py = point.y;
    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    const lengthSquared = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

    if (!lengthSquared) {
        return {
            point: { x: x1, y: y1 },
            distance: Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1))
        };
    }

    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSquared;
    if (t >= 1 || t <= 0) {
        return;
    }

    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);

    const distance = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));

    return { point: { x, y }, distance };
}

/**
 * @description 点到二阶贝塞尔曲线的距离 todo 目前为止项目内的二阶贝塞尔曲线用的时三阶拟合而成，后续需要改正
 */
function point2curve2nd(point: XY, start: XY, c1: XY, end: XY) {

}

/**
 * @description 计算三次贝塞尔曲线上的点
 */
function cubicBezier(t: number, start: XY, c1: XY, c2: XY, end: XY) {
    const x = Math.pow(1 - t, 3) * start.x + 3 * Math.pow(1 - t, 2) * t * c1.x + 3 * (1 - t) * Math.pow(t, 2) * c2.x + Math.pow(t, 3) * end.x;
    const y = Math.pow(1 - t, 3) * start.y + 3 * Math.pow(1 - t, 2) * t * c1.y + 3 * (1 - t) * Math.pow(t, 2) * c2.y + Math.pow(t, 3) * end.y;
    return { x, y };
}

/**
 * @description 计算三次贝塞尔曲线上的导数
 */
function cubicBezierDerivative(t: number, start: XY, c1: XY, c2: XY, end: XY) {
    const x = 3 * Math.pow(1 - t, 2) * (c1.x - start.x) + 6 * (1 - t) * t * (c2.x - c1.x) + 3 * Math.pow(t, 2) * (end.x - c2.x);
    const y = 3 * Math.pow(1 - t, 2) * (c1.y - start.y) + 6 * (1 - t) * t * (c2.y - c1.y) + 3 * Math.pow(t, 2) * (end.y - c2.y);
    return { x, y };
}

/**
 * @description 点到三阶贝塞尔曲线的距离
 */
function point2curve3rd(point: XY, start: XY, c1: XY, c2: XY, end: XY) {
    const epsilon = 1e-6;
    let t = 0.5;
    let i = 0;

    while (i < 50) {
        const _xy = cubicBezier(t, start, c1, c2, end);
        const _der = cubicBezierDerivative(t, start, c1, c2, end);

        const dxToPoint = _xy.x - point.x;
        const dyToPoint = _xy.y - point.y;

        const derivativeDotProduct = dxToPoint * _der.x + dyToPoint * _der.y;

        if (Math.abs(derivativeDotProduct) < epsilon) {
            break;
        }

        t -= (derivativeDotProduct / (_der.x * _der.x + _der.y * _der.y));

        i++;
    }

    if (t < 0 || t > 1) {
        return;
    }

    const xy = cubicBezier(t, start, c1, c2, end);
    const distance = Math.sqrt((point.x - xy.x) ** 2 + (point.y - xy.y) ** 2);

    return { distance, point: xy };
}

export function startEdit(context: Context) {
    const selection = context.selection;
    const workspace = context.workspace;

    const selected = selection.selectedShapes;
    if (selected.length !== 1) {
        return;
    }

    const shape = selected[0];

    if (is_layers_tree_unit(shape)) {
        return;
    }

    if (context.tool.isLable) {
        return;
    }

    if (shape.pathType) {
        if (forbidden_to_modify_frame(shape) || !permIsEdit(context)) {
            return;
        }

        workspace.setPathEditMode(true); // --开启对象编辑
        context.esctask.save('path-edit', () => {
            const al = workspace.is_path_edit_mode;
            workspace.setPathEditMode(false);
            return al;
        });
    }
}

export class PathEditor extends TransformHandler {
    static DELTA = 5;

    static BORDER_MAP = 'border-map'; // 建立动作点之外的点形成的地图
    static FULL_MAP = 'full-map'; // 建立完整的图层地图
    private shape: ShapeView;
    private path: Path;

    readonly fixedPoint: XY = { x: 0, y: 0 };
    private livingPoint: XY = { x: 0, y: 0 };

    private baseData: BaseData = new Map();

    private baseMatrix: Matrix = new Matrix();
    private baseMatrixInverse: Matrix = new Matrix();

    private handleInfo: { index: number, segment: number, side: 'from' | 'to' } | undefined = undefined;

    private isInitMatrix: boolean = false;

    private actionType: 'handle' | 'penHandle' | 'point' = 'handle';


    constructor(context: Context, event?: MouseEvent, needBuildMap = '', flattenPoint = false) {
        super(context, event);
        this.path = context.path;

        if (event) {
            this.fixedPoint = this.workspace.getRootXY(event);
            this.livingPoint = { ...this.fixedPoint };
        }

        this.shape = this.context.selection.selectedShapes[0];

        this.workspace.setSelectionViewUpdater(false);

        if (needBuildMap) {
            this.buildMap(needBuildMap);
        }

        if (flattenPoint) { // 用于减去重合的点
            this.getUniquePosition();
        }
    }

    private mapX = new Map<number, XY[]>();
    private mapY = new Map<number, XY[]>();

    private buildMap(buildType: string) {
        this.init();

        const shape = this.shape as PathShapeView;

        if (!shape) {
            return;
        }

        const clientMatrix = new Matrix(this.baseMatrix);
        clientMatrix.multiAtLeft(this.context.workspace.matrix);

        const activeTarget = new Set<string>();

        if (buildType === PathEditor.BORDER_MAP) {
            this.path.syntheticPoints.forEach((points, segmentIndex) => {
                if (!points.length) return;
                points.forEach(index => {
                    const point = shape?.segments[segmentIndex]?.points[index];
                    if (!point) return;
                    activeTarget.add(point.id);
                })
            })
        }


        const segments = shape.segments;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (!segment) continue;

            const points = segment.points;

            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                if (!point) continue;

                if (buildType === PathEditor.BORDER_MAP && activeTarget.has(point.id)) continue;

                const xy = clientMatrix.computeCoord3(point);

                const xKey = Number(xy.x.toFixed(2));
                let xContainer = this.mapX.get(xKey);
                if (!xContainer) {
                    xContainer = [xy];
                    this.mapX.set(xKey, xContainer);
                } else {
                    xContainer.push(xy);
                }
                const yKey = Number(xy.y.toFixed(2));
                let yContainer = this.mapY.get(yKey);
                if (!yContainer) {
                    yContainer = [xy];
                    this.mapY.set(yKey, yContainer);
                } else {
                    yContainer.push(xy);
                }
            }
        }

        // console.log('mapX:', this.mapX);
        // console.log('mapY:', this.mapY);
    }

    private init() {
        this.shape = this.context.selection.selectedShapes[0];

        if (!this.shape || !(this.shape instanceof PathShapeView)) {
            return;
        }

        const m = this.shape.matrix2Root();
        const frame = this.shape.frame;
        m.preScale(frame.width, frame.height);

        this.baseMatrix = m;
        this.baseMatrixInverse = new Matrix(m.inverse);

        this.getBaseData();

        this.isInitMatrix = true;
    }

    private getBaseData() {
        this.baseData.clear();
        const selected = this.path.syntheticPoints;

        if (this.shape.pathType === PathType.Editable) {
            let wrongSelection = false;
            selected.forEach((indexes, segment) => {
                const points = (this.shape as PathShapeView)?.segments[segment]?.points;

                if (!points?.length) {
                    wrongSelection = true;
                    return;
                }

                this.__getData(points as CurvePoint[], indexes);
            })

            if (wrongSelection || !this.baseData.size) { // 选区出错，重置选区
                this.path.reset();
            }
        }
    }

    private __getData(points: CurvePoint[], indexes: number[]) {
        if (!indexes) {
            return;
        }
        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const point = points[index];

            if (!point) {
                continue;
            }

            this.baseData.set(point.id, {
                x: point.x,
                y: point.y,
                fromX: point.fromX,
                fromY: point.fromY,
                toX: point.toX,
                toY: point.toY
            })
        }
    }

    private uniquePosition: Set<string> = new Set();
    private selected: Map<number, number[]> | undefined = undefined;
    private fullPosition: Set<string> = new Set();

    private getUniquePosition() {
        const selected = this.selected || this.path.syntheticPoints;
        if (!this.selected) {
            this.selected = selected;
        }
        const shape = this.shape as PathShapeView;
        const __xy_string = new Set<string>();
        selected.forEach((indexes, segmentIndex) => {
            const points = shape.segments[segmentIndex]?.points;

            if (!points) return;

            for (let i = 0; i < indexes.length; i++) {
                const point = points[indexes[i]];
                if (!point) continue;

                this.fullPosition.add(point.id);

                const __xyStr = `${point.x}?${point.y}`;

                if (!__xy_string.has(__xyStr)) {
                    this.uniquePosition.add(point.id);
                    __xy_string.add(__xyStr);
                }
            }
        });
    }

    private modifyDelta(dx: number, dy: number) {
        const points: XY[] = [];
        const baseData = this.baseData;

        const clientMatrix = new Matrix(this.baseMatrix);
        clientMatrix.multiAtLeft(this.context.workspace.matrix);

        this.uniquePosition.forEach(id => {
            const base = baseData.get(id);
            if (!base) return;

            points.push(clientMatrix.computeCoord2(base.x + dx, base.y + dy));
        })

        const modified = this.modifyByPoints(points);

        if (modified) {
            let fulfil = false;
            const __xy = clientMatrix.inverseCoord(points[0]);
            this.uniquePosition.forEach(id => {
                if (fulfil) return;
                const base = baseData.get(id);
                if (!base) return;
                fulfil = true;

                dx = __xy.x - base.x;
                dy = __xy.y - base.y;
            });

            return { dx, dy }; // 点矫正之后，将不再进行线矫正
        }

        const modified2 = this.modifyBySegment(points);
        if (modified2) {
            let fulfil = false;
            const __xy = clientMatrix.inverseCoord(points[0]);
            this.uniquePosition.forEach(id => {
                if (fulfil) return;
                const base = baseData.get(id);
                if (!base) return;
                fulfil = true;

                dx = __xy.x - base.x;
                dy = __xy.y - base.y;
            });

        }
        return { dx, dy };
    }

    private modifyByPoints(activePoints: XY[]) {
        //  点与点之间 比对、吸附、挣脱
        let delX = Infinity;
        let delY = Infinity;

        let DX = 0;
        let DY = 0;
        let TX = 0;
        let TY = 0;

        const xs = Array.from(this.mapX.keys());
        const ys = Array.from(this.mapY.keys());

        const aLen = activePoints.length;

        for (let i = 0; i < aLen; i++) {
            const { x, y } = activePoints[i];

            for (let j = 0; j < xs.length; j++) {
                const dx = xs[j] - x;
                const __dx = Math.abs(dx);

                if (__dx < delX) {
                    delX = __dx;
                    DX = dx;
                    TX = xs[j];
                }
            }

            for (let k = 0; k < ys.length; k++) {
                const dy = ys[k] - y;
                const __dy = Math.abs(dy);

                if (__dy < delY) {
                    delY = __dy;
                    DY = dy;
                    TY = ys[k];
                }
            }
        }

        let modified = false;
        const assist = this.context.assist;

        if (delX < PathEditor.DELTA) {
            const ap: XY[] = [];
            for (let i = 0; i < aLen; i++) {
                const __ap = activePoints[i];
                __ap.x += DX;
                if (Number(__ap.x.toFixed(2)) === TX) {
                    ap.push(__ap);
                }
            }

            assist.setNodesX2([...(this.mapX.get(TX) || []), ...ap]);
            modified = true;
        } else {
            assist.setNodesX2([]);
        }

        if (delY < PathEditor.DELTA) {
            const ap: XY[] = [];
            for (let i = 0; i < aLen; i++) {
                const __ap = activePoints[i];
                __ap.y += DY;
                if (Number(__ap.y.toFixed(2)) === TY) {
                    ap.push(__ap);
                }
            }
            assist.setNodesY2([...(this.mapY.get(TY) || []), ...ap]);
            modified = true;
        } else {
            assist.setNodesY2([]);
        }

        if (modified) {
            assist.notify(Assist.UPDATE_ASSIST_PATH);
        } else {
            assist.notify(Assist.CLEAR);
        }

        return modified;
    }

    private fixedSegments: Set<{ type: SegmentType, seg: Line | Curve3rd }> = new Set();
    private initFixedSegments = false;

    private __initFS() {
        const segments = (this.shape as PathShapeView)?.segments;

        if (!segments) {
            return;
        }

        const full = this.fullPosition;
        const fixed = this.fixedSegments;

        const clientMatrix = new Matrix(this.baseMatrix);
        clientMatrix.multiAtLeft(this.context.workspace.matrix);

        for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
            const segment = segments[segmentIndex];
            const points = segment?.points;

            const len = points?.length;
            if (!len) continue;

            for (let i = 0; i < len; i++) {
                const point = points[i];
                let nextPoint;

                if (i === len - 1) {
                    if (!segment.isClosed) break;
                    nextPoint = points[0];
                } else {
                    nextPoint = points[i + 1];
                }

                if (!nextPoint || !point) continue;

                if (full.has(point.id) || full.has(nextPoint.id)) continue;

                if (point.hasFrom || nextPoint.hasTo) {
                    const seg = {
                        start: { x: point.x, y: point.y },
                        c1: { x: (point.fromX || point.x || 0), y: (point.fromY || point.y || 0) },
                        c2: { x: (nextPoint.toX || nextPoint.x || 0), y: (nextPoint.toY || nextPoint.y || 0) },
                        end: { x: nextPoint.x, y: nextPoint.y }
                    }

                    seg.start = clientMatrix.computeCoord3(seg.start);
                    seg.c1 = clientMatrix.computeCoord3(seg.c1);
                    seg.c2 = clientMatrix.computeCoord3(seg.c2);
                    seg.end = clientMatrix.computeCoord3(seg.end);

                    fixed.add({ type: SegmentType.Curve3rd, seg });
                } else {
                    const seg = {
                        start: { x: point.x, y: point.y },
                        end: { x: nextPoint.x, y: nextPoint.y }
                    }

                    seg.start = clientMatrix.computeCoord3(seg.start);
                    seg.end = clientMatrix.computeCoord3(seg.end);

                    fixed.add({ type: SegmentType.Straight, seg });
                }
            }
        }

        this.initFixedSegments = true;
    }

    private modifyBySegment(activePoints: XY[]) {
        // 点与线之间 比对、吸附、挣脱
        if (!this.initFixedSegments) {
            this.__initFS();
        }

        if (!this.initFixedSegments) {
            return;
        }

        let distance = Infinity;
        let dx = 0;
        let dy = 0;

        for (let i = 0; i < activePoints.length; i++) {
            const point = activePoints[i];

            this.fixedSegments.forEach(segment => {
                let d: { point: { x: number, y: number }, distance: number } | undefined;

                if (segment.type === SegmentType.Straight) {
                    const seg = segment.seg as Line;
                    d = point2line(point, seg.start, seg.end)
                } else {
                    const seg = segment.seg as Curve3rd;
                    d = point2curve3rd(point, seg.start, seg.c1, seg.c2, seg.end);
                }

                if (d === undefined) return;

                const D = Math.abs(d.distance);

                if (D < distance) {
                    const targetPoint = d.point;

                    dx = targetPoint.x - point.x;
                    dy = targetPoint.y - point.y;
                    distance = D;
                }
            })
        }

        let modified = false;

        if (distance < PathEditor.DELTA) {
            activePoints[0].x += dx;
            activePoints[0].y += dy;
            modified = true;
        }

        return modified;
    }

    private __execute() {
        const __fixed = this.baseMatrixInverse.computeCoord3(this.fixedPoint);
        const __living = this.baseMatrixInverse.computeCoord3(this.livingPoint);

        let dx = __living.x - __fixed.x;
        let dy = __living.y - __fixed.y;

        if (this.shiftStatus) {
            if (Math.abs(dx) > Math.abs(dy)) {
                dy = 0;
            } else {
                dx = 0;
            }
        }

        const modified = this.modifyDelta(dx, dy);

        dx = modified.dx;
        dy = modified.dy;

        const selected = this.selected || this.path.syntheticPoints;
        if (!this.selected) {
            this.selected = selected;
        }

        const units: ModifyUnits = new Map();

        if (this.shape.pathType === PathType.Editable) {
            selected.forEach((indexes, segment) => {
                const points = (this.shape as PathShapeView).segments[segment].points as CurvePoint[];
                this.__gen(units, points, segment, indexes, dx, dy);
            })
        }

        (this.asyncApiCaller as PathModifier).execute(this.shape, units);

        this.updateCtrlView();
    }

    private __gen(actions: ModifyUnits, points: CurvePoint[], segment: number, indexes: number[], dx: number, dy: number) {
        const __units: any[] = [];
        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const point = points[index];

            if (!point) continue;

            const base = this.baseData.get(point.id);
            if (!base) {
                continue;
            }

            __units.push({
                index,
                x: base.x + dx,
                y: base.y + dy,
                fromX: (base.fromX || 0) + dx,
                fromY: (base.fromY || 0) + dy,
                toX: (base.toX || 0) + dx,
                toY: (base.toY || 0) + dy,
            })
        }

        actions.set(segment, __units);
    }

    private passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        if (this.actionType === 'point') {
            this.__execute();
        } else {
            if (this.altStatus) {
                this.breakOff();
            } else {
                this.recovery();
            }
        }
    }

    // handle折断之前的CurveMode；
    private curveModeBefore: CurveMode | undefined;

    // 拖动之后通过键盘事件控制折断状态
    private breakOff() {
        if (!this.isInitMatrix) {
            this.init();
        }

        if (!this.handleInfo) {
            return;
        }

        const { index, segment } = this.handleInfo;

        const point = (this.shape as PathShapeView)?.segments[segment]?.points[index];

        if (!point) {
            return;
        }

        if (point.mode === CurveMode.Disconnected) { // 已经是折断状态
            return;
        }

        this.curveModeBefore = point.mode;

        (this.asyncApiCaller as PathModifier).breakOffHandle(this.shape, segment, index);

        this.updateCtrlView();
    }

    private recovery() {
        if (!this.curveModeBefore) { // 没有进行过折断，不需要恢复
            return;
        }

        if (!this.handleInfo) {
            return;
        }

        if (!this.isInitMatrix) {
            this.init();
        }

        const { index, segment, side } = this.handleInfo;

        const point = (this.shape as PathShapeView)?.segments[segment]?.points[index];

        if (!point) {
            return;
        }

        if (point.mode !== CurveMode.Disconnected) { // 不需要恢复
            return;
        }

        (this.asyncApiCaller as PathModifier).recoveryHandle(this.shape, segment, index, this.curveModeBefore, side);

        this.curveModeBefore = undefined;

        this.updateCtrlView();
    }

    protected keydown(event: KeyboardEvent) {
        if (event.repeat) {
            return;
        }
        if (event.altKey) {
            this.altStatus = true;
            this.passiveExecute();
        }
        if (event.shiftKey) {
            this.shiftStatus = true;
            this.passiveExecute();
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'AltLeft') {
            this.altStatus = false;
            this.passiveExecute();
        }
        if (event.code === "ShiftLeft") {
            this.shiftStatus = false;
            this.passiveExecute();
        }
    }

    createApiCaller(segment = -1, index = -1, needStore = false) {
        this.asyncApiCaller = new PathModifier(this.context.coopRepo, this.context.data, this.page, needStore);

        let addRes = false;
        if (index > -1 && segment > -1) {
            addRes = (this.asyncApiCaller as PathModifier).addPoint(this.shape, segment, index);

            if (addRes) {
                this.path.select_point(segment, index);
                this.buildMap(PathEditor.BORDER_MAP);
                this.getUniquePosition();
            }
        }

        this.path.editing(true);

        return addRes;
    }

    addPointForPen(segment: number, index: number, down: XY, point?: XY) {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.init();
        }

        let xy;

        if (point) {
            xy = { x: point.x, y: point.y };
        } else {
            const m = new Matrix(this.baseMatrix);
            m.multiAtLeft(this.context.workspace.matrix);
            const inverse = new Matrix(m.inverse);
            xy = inverse.computeCoord3(down);
        }

        let addRes = false;
        if (index > -1 && segment > -1) {
            const __segment = (this.shape as PathShapeView).segments[segment];
            if (!__segment) {
                return this.addSegmentForPen(down);
            }

            index = __segment.points.length;

            addRes = (this.asyncApiCaller as PathModifier)
                .addPointForPen(this.shape, segment, index, xy);

            if (addRes) {
                this.path.select_point(segment, index);
                const point = (this.shape as PathShapeView).segments[segment].points[index] as CurvePoint;

                this.context.path.setLastPoint({ point, index, segment });

                this.path.editing(true);

                this.updateCtrlView();
            }
        }

        return addRes;
    }

    addSegmentForPen(down: XY, point?: CurvePoint) {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.init();
        }

        let xy;

        if (point) {
            xy = point;
        } else {
            const m = new Matrix(this.baseMatrix);
            m.multiAtLeft(this.context.workspace.matrix);
            const inverse = new Matrix(m.inverse);
            xy = inverse.computeCoord3(down);
        }

        let addRes = false;

        addRes = (this.asyncApiCaller as PathModifier)
            .addSegmentForPen(this.shape, xy);


        if (addRes) {
            const segment = (this.shape as PathShapeView).segments.length - 1;
            const point = (this.shape as PathShapeView).segments[segment].points[0] as CurvePoint;
            this.path.select_point(segment, 0);
            this.context.path.setLastPoint({ point, index: 0, segment })
        }

        this.path.editing(true);

        return addRes;
    }

    createVec() {
        const env = this.context.selection.getClosestContainer(this.livingPoint);
        const frame = new ShapeFrame(0, 0, 1, 1);

        const m = new Matrix(env.matrix2Root().inverse);

        const __xy = m.computeCoord3(this.livingPoint);
        frame.x = __xy.x;
        frame.y = __xy.y;

        let count = 1;

        this.context.selection.selectedPage!.shapes.forEach(s => {
            if (s.type === ShapeType.Path) count++;
        })

        const name = `${this.context.workspace.t('shape.path')} ${count}`;

        const previousPathStyle = this.path.previousPathStyle?.borders.length ? this.path.previousPathStyle : undefined;

        const _vec = (this.asyncApiCaller as PathModifier).createVec(name, frame, env as GroupShapeView, previousPathStyle);

        if (_vec) {
            this.path.setPreviousPathId(_vec.id);
        }

        this.updateCtrlView();

        return _vec;
    }

    execute(event: MouseEvent) {
        if (!this.isInitMatrix) {
            this.init();
        }
        this.livingPoint = this.workspace.getRootXY(event);

        this.__execute();

        this.actionType = 'point';
    }

    execute4handlePre(index: number, segmentIndex: number) {
        if (!this.isInitMatrix) {
            this.init();
        }

        this.buildMap(PathEditor.FULL_MAP);

        const order = this.altStatus ? 2 : 3;

        (this.asyncApiCaller as PathModifier).preCurve(order, this.shape, index, segmentIndex);

        this.actionType = 'handle';
    }

    execute4handlePreForPen(index: number, segment = -1) {
        if (!this.isInitMatrix) {
            this.init();
        }

        this.buildMap(PathEditor.FULL_MAP);

        if (!this.handleInfo) {
            this.handleInfo = { index, segment, side: 'from' };
        }

        const lowOrder = this.altStatus;

        (this.asyncApiCaller as PathModifier).preCurve2(lowOrder ? 2 : 3, this.shape, index, segment);

        this.actionType = 'penHandle';
    }

    execute4handle(index: number, side: 'from' | 'to', from: XY, to: XY, segment = -1) {
        if (!this.isInitMatrix) {
            this.init();
        }

        if (!this.handleInfo) {
            this.handleInfo = { index, segment, side };
        }

        const point = (this.shape as PathShapeView)?.segments[segment]?.points[index];

        if (!point) {
            return;
        }

        const caller = this.asyncApiCaller as PathModifier;

        // 让控制棒进入折断状态
        if (this.altStatus && point.mode !== CurveMode.Disconnected) {
            this.curveModeBefore = point.mode;
            caller.breakOffHandle(this.shape, segment, index);
        }

        const m = new Matrix(this.baseMatrix);
        m.multiAtLeft(this.context.workspace.matrix);

        const xs = Array.from(this.mapX.keys());
        const ys = Array.from(this.mapY.keys());

        const isFrom = side === 'from';

        const activePoint = isFrom ? m.computeCoord3(from) : m.computeCoord3(to);

        let deltaX = Infinity;
        let dx = 0;
        let TX = 0;
        let deltaY = Infinity;
        let dy = 0;
        let TY = 0;

        for (let i = 0; i < xs.length; i++) {
            const __x = xs[i];
            const __d = __x - activePoint.x;
            const D = Math.abs(__d);
            if (D < deltaX) {
                deltaX = D;
                dx = __d;
                TX = __x;
            }
        }
        for (let i = 0; i < ys.length; i++) {
            const __y = ys[i];
            const __d = __y - activePoint.y;
            const D = Math.abs(__d);
            if (D < deltaY) {
                deltaY = D;
                dy = __d;
                TY = __y;
            }
        }

        const assist = this.context.assist;
        let modified = false;
        if (deltaX < PathEditor.DELTA) {
            activePoint.x += dx;
            const xNodes = [...this.mapX.get(TX) || []];
            xNodes.push(activePoint);
            modified = true;
            assist.setNodesX2(xNodes);
        } else {
            assist.setNodesX2([]);
        }
        if (deltaY < PathEditor.DELTA) {
            activePoint.y += dy;
            const yNodes = [...this.mapY.get(TY) || []];
            yNodes.push(activePoint);
            modified = true;
            assist.setNodesY2(yNodes);
        } else {
            assist.setNodesY2([]);
        }

        if (modified) {
            const mInverse = new Matrix(m.inverse);
            const mode = point.mode;

            if (isFrom) {
                from = mInverse.computeCoord3(activePoint);
                if (mode === CurveMode.Asymmetric) {
                    to.x = point.toX || 0;
                    to.y = point.toY || 0;
                    const l = Math.hypot(to.x - point.x, to.y - point.y);
                    const __angle = Math.atan2(from.x - point.x, from.y - point.y);
                    const _l_x = Math.abs(Math.sin(__angle) * l);
                    const _l_y = Math.abs(Math.cos(__angle) * l);
                    const _delta_x = from.x - point.x;
                    const _delta_y = from.y - point.y;
                    to.x = point.x - (_delta_x / Math.abs(_delta_x)) * _l_x;
                    to.y = point.y - (_delta_y / Math.abs(_delta_y)) * _l_y;
                } else if (mode === CurveMode.Mirrored) {
                    to.x = 2 * point.x - from.x;
                    to.y = 2 * point.y - from.y;
                }
            } else {
                to = mInverse.computeCoord3(activePoint);
                if (mode === CurveMode.Asymmetric) {
                    from.x = point.fromX || 0;
                    from.y = point.fromY || 0;
                    const l = Math.hypot(from.x - point.x, from.y - point.y);
                    const __angle = Math.atan2(to.x - point.x, to.y - point.y);
                    const _l_x = Math.abs(Math.sin(__angle) * l);
                    const _l_y = Math.abs(Math.cos(__angle) * l);
                    const _delta_x = to.x - point.x;
                    const _delta_y = to.y - point.y;
                    from.x = point.x - (_delta_x / Math.abs(_delta_x)) * _l_x;
                    from.y = point.y - (_delta_y / Math.abs(_delta_y)) * _l_y;
                } else if (mode === CurveMode.Mirrored) {
                    from.x = 2 * point.x - to.x;
                    from.y = 2 * point.y - to.y;
                }
            }

            assist.notify(Assist.UPDATE_ASSIST_PATH);
        } else {
            assist.notify(Assist.CLEAR);
        }

        caller.execute4handle(this.shape, index, side, from, to, segment);

        this.updateCtrlView();
    }

    closeSegmentAt(segmentIndex: number) {
        if (!this.isInitMatrix) {
            this.init();
        }

        const segment = (this.shape as PathShapeView).segments[segmentIndex];

        if (!segment) {
            return false;
        }

        if (!this.asyncApiCaller) {
            this.createApiCaller();
        }

        const caller = this.asyncApiCaller as PathModifier;

        const res = caller.closeSegmentAt(this.shape, segmentIndex);

        if (res) {
            this.path.select_point(segmentIndex, 0);
            this.path.setContactStatus(false);
        }

        return res;
    }

    mergeSegment(segmentIndex: number, toSegmentIndex: number, at: 'start' | 'end') {
        if (!this.isInitMatrix) {
            this.init();
        }

        const segment = (this.shape as PathShapeView).segments[segmentIndex];

        if (!segment) {
            return false;
        }

        if (!this.asyncApiCaller) {
            this.createApiCaller();
        }

        const caller = this.asyncApiCaller as PathModifier;

        const res = caller.mergeSegment(this.shape, segmentIndex, toSegmentIndex, at);

        if (res) {
            this.path.select_point(res.segment, res.activeIndex);
            this.path.setContactStatus(false);
        }
    }

    reverseSegment(segmentIndex: number) {
        if (!this.isInitMatrix) {
            this.init();
        }

        const segment = (this.shape as PathShapeView).segments[segmentIndex];

        if (!segment) {
            return false;
        }

        if (!this.asyncApiCaller) {
            this.createApiCaller();
        }

        const caller = this.asyncApiCaller as PathModifier;

        const res = caller.reversePointsAt(this.shape, segmentIndex);

        if (res) {
            this.path.select_point(res.segment, res.activeIndex);
            this.path.setContactStatus(true);

            return res;
        }

        return false;
    }

    fulfil() {
        this.workspace.setSelectionViewUpdater(true);
        this.path.editing(false);

        super.fulfil();
    }

    // 以下是自闭合函数，函数内执行fulfil
    clip(segmentIndex: number, index: number) {
        try {
            if (!this.isInitMatrix) {
                this.init();
            }

            if (!this.asyncApiCaller) {
                this.createApiCaller();
            }

            if (!this.asyncApiCaller || !this.isInitMatrix) {
                return;
            }

            (this.asyncApiCaller as PathModifier).clip(this.shape, segmentIndex, index);
        } finally {
            this.fulfil();
        }
    }

    sortSegment() {
        try {
            if (this.context.coopRepo.isInTransact()) {
                return;
            }

            if (!this.isInitMatrix) {
                this.init();
            }

            if (!this.asyncApiCaller) {
                this.createApiCaller();
            }

            if (!this.asyncApiCaller || !this.isInitMatrix) {
                return;
            }

            (this.asyncApiCaller as PathModifier).sortSegment(this.shape);
        } finally {
            this.fulfil();
        }
    }

    modifyClosedStatus(val: boolean) {
        try {
            if (!this.isInitMatrix) {
                this.init();
            }

            if (!this.asyncApiCaller) {
                this.createApiCaller();
            }

            if (!this.asyncApiCaller || !this.isInitMatrix) {
                return;
            }

            (this.asyncApiCaller as PathModifier).modifyClosedStatus(this.shape, val);
        } finally {
            this.fulfil();
        }
    }
}