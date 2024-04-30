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
    private shape: ShapeView;
    private path: Path;

    private fixedPoint: XY;
    private livingPoint: XY;

    private baseData: BaseData = new Map();

    private baseWidth: number = 0;
    private baseHeight: number = 0;

    private baseMatrix: Matrix = new Matrix();
    private baseMatrixInverse: Matrix = new Matrix();

    private isHandleAction: boolean = false;
    private handleInfo: { index: number, segment: number, side: 'from' | 'to' } | undefined = undefined;

    private isInitMatrix: boolean = false;

    private actionType: 'handle' | 'penHandle' | 'point' = 'handle';

    constructor(context: Context, event: MouseEvent) {
        super(context, event);
        this.path = context.path;

        this.fixedPoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.fixedPoint };

        this.shape = this.context.selection.selectedShapes[0];

        this.workspace.setSelectionViewUpdater(false);
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

    private __execute() {
        const __fixed = this.baseMatrixInverse.computeCoord3(this.fixedPoint);
        const __living = this.baseMatrixInverse.computeCoord3(this.livingPoint);

        const dx = __living.x - __fixed.x;
        const dy = __living.y - __fixed.y;

        const selected = this.path.syntheticPoints;
        const units: ModifyUnits = new Map();

        if (this.shape.pathType === PathType.Editable) {
            selected.forEach((indexes, segment) => {
                const points = (this.shape as PathShapeView).segments[segment].points as CurvePoint[];
                this.__gen(units, points, segment, indexes, dx, dy);
            })
        }

        (this.asyncApiCaller as PathModifier).execute(this.shape, units);
    }

    private __gen(actions: ModifyUnits, points: CurvePoint[], segment: number, indexes: number[], dx: number, dy: number) {
        const __units: any[] = [];
        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const point = points[index];

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
        // if (event.shiftKey) {
        //     this.shiftStatus = true;
        //     this.passiveExecute();
        // }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === 'AltLeft') {
            this.altStatus = false;
            this.passiveExecute();
        }
        // if (event.code === "ShiftLeft") {
        //     this.shiftStatus = false;
        //     this.passiveExecute();
        // }
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

    addPointForPen(segment: number, index: number) {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        const xy = this.baseMatrixInverse.computeCoord3(this.livingPoint);

        let addRes = false;
        if (index > -1 && segment > -1) {
            addRes = (this.asyncApiCaller as PathModifier)
                .addPointForPen(this.shape, segment, index, xy);

            if (addRes) {
                this.path.select_point(segment, index);
                const point = (this.shape as PathShapeView).segments[segment].points[index] as CurvePoint;

                this.context.path.setLastPoint({ point, index, segment })
            }
        }

        this.path.editing(true);

        return addRes;
    }

    addSegmentForPen() {
        if (!this.asyncApiCaller || !this.shape) {
            return false;
        }

        if (!this.isInitMatrix) {
            this.initMatrix();
        }

        const xy = this.baseMatrixInverse.computeCoord3(this.livingPoint);

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

        this.isHandleAction = true;

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
            // this.path.reset_points(); // todo 重新选点
            this.path.setContactStatus(false);
        }
    }

    fulfil() {
        if (this.isHandleAction && this.handleInfo) {
            // 矫正
        }

        this.workspace.setSelectionViewUpdater(true);
        this.path.editing(false);

        super.fulfil();
    }
}