import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { PathShapeView, ImageShapeView, PathModifier, Matrix, ModifyUnits } from "@kcdesign/data";
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
type BaseData = Map<number, Base>;

export class PathEditor extends TransformHandler {
    shape: PathShapeView | ImageShapeView;
    path: Path;

    fixedPoint: XY;
    livingPoint: XY;

    baseData: BaseData = new Map();
    offsetMap: Map<number, { dx: number, dy: number }> = new Map();

    baseWidth: number;
    baseHeight: number;

    baseMatrix: Matrix;
    baseMatrixInverse: Matrix;

    constructor(context: Context, event: MouseEvent) {
        super(context, event);
        this.path = context.path;

        this.shape = context.selection.selectedShapes[0] as PathShapeView | ImageShapeView;

        this.fixedPoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.fixedPoint };

        const m = this.shape.matrix2Root();
        const frame = this.shape.frame;
        m.preScale(frame.width, frame.height);

        this.baseMatrix = m;
        this.baseMatrixInverse = new Matrix(m.inverse);

        this.baseWidth = frame.width;
        this.baseHeight = frame.height;
    }

    getBaseData() {
        this.baseData.clear();
        this.offsetMap.clear();

        const indexes = this.path.syntheticPoints;
        const points = this.shape.points;

        if (!indexes.length || !points.length) {
            return;
        }

        const m = this.shape.matrix2Root();
        const frame = this.shape.frame;
        m.preScale(frame.width, frame.height);


        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const point = points[index];

            if (!point) {
                continue;
            }

            const __p = m.computeCoord3(point);

            this.offsetMap.set(index, { dx: __p.x - this.fixedPoint.x, dy: __p.y - this.fixedPoint.y });

            this.baseData.set(index, {
                x: point.x,
                y: point.y,
                fromX: point.fromX,
                fromY: point.fromY,
                toX: point.toX,
                toY: point.toY
            })
        }
    }

    createApiCaller(index = -1) {
        this.asyncApiCaller = new PathModifier(this.context.coopRepo, this.context.data, this.page, this.shape);

        let addRes = false;
        if (index > -1) {
            addRes = (this.asyncApiCaller as PathModifier).addPoint(index);
            if (addRes) {
                this.path.select_point(index);
            }
        }

        this.getBaseData();

        this.path.editing(true);

        return addRes;
    }

    execute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);

        this.__execute();
    }

    private __execute() {
        const indexes = this.path.syntheticPoints;

        if (!indexes.length) {
            return;
        }

        // let m = this.shape.matrix2Root();
        // const frame = this.shape.frame;
        // m.preScale(frame.width, frame.height);
        // m = new Matrix(m.inverse);
        //
        // const firstIndex = indexes[0];
        // const offset = this.offsetMap.get(firstIndex)!;
        // const xy = this.baseData.get(firstIndex)!;

        // const __livingPoint = m.computeCoord2(this.livingPoint.x + offset.dx, this.livingPoint.y + offset.dy);

        const __fixed = this.baseMatrixInverse.computeCoord3(this.fixedPoint);
        const __living = this.baseMatrixInverse.computeCoord3(this.livingPoint);

        console.log('__living', __living);

        const dx = __living.x - __fixed.x;
        const dy = __living.y - __fixed.y;

        // const dx = __livingPoint.x - xy.x;
        // const dy = __livingPoint.y - xy.y;

        const units: ModifyUnits = [];
        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            const base = this.baseData.get(index);
            if (!base) {
                continue;
            }

            units.push({
                index,
                x: base.x + dx,
                y: base.y + dy,
                fromX: base.fromX! + dx,
                fromY: base.fromY! + dy,
                toX: base.toX! + dx,
                toY: base.toY! + dy,
            })
        }

        (this.asyncApiCaller as PathModifier).execute(units);
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
        this.path.editing(false);

        super.fulfil();
    }
}