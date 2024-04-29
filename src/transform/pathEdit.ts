import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import {
    PathShapeView,
    PathModifier,
    Matrix,
    ModifyUnits,
    ShapeView,
    PathType,
    CurvePoint, ShapeFrame, GroupShapeView
} from "@kcdesign/data";
import { XY } from "@/context/selection";
import { Path } from "@/context/path";
import { ShapeType } from "@kcdesign/data";

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
    shape: ShapeView;
    path: Path;

    fixedPoint: XY;
    livingPoint: XY;

    baseData: BaseData = new Map();

    baseWidth: number = 0;
    baseHeight: number = 0;

    baseMatrix: Matrix = new Matrix();
    baseMatrixInverse: Matrix = new Matrix();

    isHandleAction: boolean = false;
    handleInfo: { index: number, segment: number, side: 'from' | 'to' } | undefined = undefined;

    isInitMatrix: boolean = false;

    constructor(context: Context, event: MouseEvent) {
        super(context, event);
        this.path = context.path;

        this.fixedPoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.fixedPoint };

        this.shape = this.context.selection.selectedShapes[0];

        this.workspace.setSelectionViewUpdater(false);
    }

    initMatrix() {
        this.shape = this.context.selection.selectedShapes[0];

        const m = this.shape.matrix2Root();
        const frame = this.shape.frame;
        m.preScale(frame.width, frame.height);

        this.baseMatrix = m;
        this.baseMatrixInverse = new Matrix(m.inverse);

        this.baseWidth = frame.width;
        this.baseHeight = frame.height;

        this.getBaseData();
    }

    getBaseData() {
        this.baseData.clear();
        const selected = this.path.syntheticPoints;

        if (this.shape.pathType === PathType.Editable) {
            selected.forEach((indexes, segment) => {
                const points = (this.shape as PathShapeView).segments[segment].points;

                this.__getData(points as CurvePoint[], indexes);
            })
        }
    }

    __getData(points: CurvePoint[], indexes: number[]) {
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
            this.isInitMatrix = true;
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
            this.isInitMatrix = true;
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
            this.isInitMatrix = true;
        }
        this.livingPoint = this.workspace.getRootXY(event);

        this.__execute();
    }

    execute4handlePre(index: number, segment = -1) {
        if (!this.isInitMatrix) {
            this.initMatrix();
            this.isInitMatrix = true;
        }

        const order = this.altStatus ? 2 : 3;

        (this.asyncApiCaller as PathModifier).preCurve(order, this.shape, index, segment);
    }

    execute4handlePreForPen(index: number, segment = -1) {
        if (!this.isInitMatrix) {
            this.initMatrix();
            this.isInitMatrix = true;
        }

        const lowOrder = this.altStatus;

        (this.asyncApiCaller as PathModifier).preCurve2(lowOrder ? 2 : 3, this.shape, index, segment);
    }

    execute4handle(index: number, side: 'from' | 'to', from: XY, to: XY, segment = -1) {
        this.isHandleAction = true;
        if (!this.handleInfo) {
            this.handleInfo = { index, segment, side };
        }
        (this.asyncApiCaller as PathModifier).execute4handle(this.shape, index, side, from, to, segment);
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

    passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }

        this.__execute();
    }

    protected keydown(event: KeyboardEvent) {
        if (event.repeat) {
            return;
        }
        if (event.shiftKey) {
            this.shiftStatus = true;
            this.passiveExecute();
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === "ShiftLeft") {
            this.shiftStatus = false;
            this.passiveExecute();
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