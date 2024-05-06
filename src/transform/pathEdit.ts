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

type Base = {
    x: number;
    y: number;

    fromX: number | undefined;
    fromY: number | undefined;
    toX: number | undefined;
    toY: number | undefined;
}
type BaseData = Map<string, Base>;

export class PathEditor extends TransformHandler {
    static BORDER_MAP = 1; // 建立动作点之外的点形成的地图
    static FULL_MAP = 2; // 建立完整的图层地图
    private shape: ShapeView;
    private path: Path;

    private fixedPoint: XY;
    private livingPoint: XY;

    private baseData: BaseData = new Map();

    private baseWidth: number = 0;
    private baseHeight: number = 0;

    private baseMatrix: Matrix = new Matrix();
    private baseMatrixInverse: Matrix = new Matrix();

    private handleInfo: { index: number, segment: number, side: 'from' | 'to' } | undefined = undefined;

    private isInitMatrix: boolean = false;

    private actionType: 'handle' | 'penHandle' | 'point' = 'handle';


    constructor(context: Context, event: MouseEvent, needBuildMap = 0, flattenPoint = false) {
        super(context, event);
        this.path = context.path;

        this.fixedPoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.fixedPoint };

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

    private buildMap(buildType: number) {
        this.initMatrix();

        const shape = this.shape as PathShapeView;

        if (!shape) {
            return;
        }

        const clientMatrix = new Matrix(this.baseMatrix);
        clientMatrix.multiAtLeft(this.context.workspace.matrix);

        const activeTarget = new Set<string>();

        if (buildType === 1) {
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

                if (buildType === 1 && activeTarget.has(point.id)) continue;

                const xy = clientMatrix.computeCoord3(point);

                let xContainer = this.mapX.get(xy.x);
                if (!xContainer) {
                    xContainer = [xy];
                    this.mapX.set(xy.x, xContainer);
                } else {
                    xContainer.push(xy);
                }
                let yContainer = this.mapY.get(xy.y);
                if (!yContainer) {
                    yContainer = [xy];
                    this.mapY.set(xy.y, yContainer);
                } else {
                    yContainer.push(xy);
                }
            }
        }

        console.log('mapX:', this.mapX);
        console.log('mapY:', this.mapY);
    }

    private initMatrix() {
        this.shape = this.context.selection.selectedShapes[0];

        const m = this.shape.matrix2Root();
        const frame = this.shape.frame;
        m.preScale(frame.width, frame.height);

        this.baseMatrix = m;
        this.baseMatrixInverse = new Matrix(m.inverse);

        this.baseWidth = frame.width;
        this.baseHeight = frame.height;

        this.getBaseData();

        this.isInitMatrix = true;
    }

    private getBaseData() {
        this.baseData.clear();
        const selected = this.path.syntheticPoints;

        if (this.shape.pathType === PathType.Editable) {
            selected.forEach((indexes, segment) => {
                const points = (this.shape as PathShapeView).segments[segment].points;

                this.__getData(points as CurvePoint[], indexes);
            })
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

                const __xyStr = `${point.x}?${point.y}`;

                console.log('__xyStr', __xyStr, point.id);

                if (!__xy_string.has(__xyStr)) {
                    this.uniquePosition!.add(point.id);
                    __xy_string.add(__xyStr);
                }
            }
        });

        console.log('uniquePositionID:', this.uniquePosition);
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

        // todo 1.拿这些点去和其他的点做距离比对；2.拿这些点去和其他的线段做距离比对；

        console.log('points:', points);
    }

    private modifyByPoints(activePoints: XY[]) {
        // todo 比对、吸附、挣脱
        // continue
    }

    private modifyBySegment() {

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

        this.modifyDelta(dx, dy);

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
            this.initMatrix();
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
    }

    private recovery() {
        if (!this.curveModeBefore) { // 没有进行过折断，不需要恢复
            return;
        }

        if (!this.handleInfo) {
            return;
        }

        if (!this.isInitMatrix) {
            this.initMatrix();
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
            }
        }

        this.path.editing(true);

        return addRes;
    }

    addPointForPen(segment: number, index: number, point?: CurvePoint) {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        const xy = point ?? this.baseMatrixInverse.computeCoord3(this.livingPoint);

        let addRes = false;
        if (index > -1 && segment > -1) {
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

    addSegmentForPen(point?: CurvePoint) {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        const xy = point ?? this.baseMatrixInverse.computeCoord3(this.livingPoint);

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

        const previousPathStyle = this.path.previousPathStyle;

        const _vec = (this.asyncApiCaller as PathModifier).createVec(name, frame, env as GroupShapeView, previousPathStyle);

        if (_vec) {
            this.path.setPreviousPathId(_vec.id);
        }

        this.updateCtrlView();

        return _vec;
    }

    execute(event: MouseEvent) {
        if (!this.isInitMatrix) {
            this.initMatrix();
        }
        this.livingPoint = this.workspace.getRootXY(event);

        this.__execute();

        this.actionType = 'point';
    }

    execute4handlePre(index: number, segment = -1) {
        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        const order = this.altStatus ? 2 : 3;

        (this.asyncApiCaller as PathModifier).preCurve(order, this.shape, index, segment);

        this.actionType = 'handle';
    }

    execute4handlePreForPen(index: number, segment = -1) {
        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        if (!this.handleInfo) {
            this.handleInfo = { index, segment, side: 'from' };
        }

        const lowOrder = this.altStatus;

        (this.asyncApiCaller as PathModifier).preCurve2(lowOrder ? 2 : 3, this.shape, index, segment);

        this.actionType = 'penHandle';
    }

    execute4handle(index: number, side: 'from' | 'to', from: XY, to: XY, segment = -1) {
        if (!this.isInitMatrix) {
            this.initMatrix();
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

        caller.execute4handle(this.shape, index, side, from, to, segment);

        this.updateCtrlView();
    }

    closeSegmentAt(segmentIndex: number) {
        if (!this.isInitMatrix) {
            this.initMatrix();
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
            this.initMatrix();
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
            this.initMatrix();
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
}