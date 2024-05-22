import { CtrlElementType, CurvePoint, LineHandleApiCaller, Matrix, PathShapeView } from "@kcdesign/data";
import { TransformHandler } from "./handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Assist } from "@/context/assist";
import { getHorizontalAngle } from "@/utils/common";
import { fixed } from "@/textpath/utils";

export function round2half(f: number) {
    if (f === 0) return 0;


    if (f > 0) {
        let int = Math.floor(f);
        let float = f - int;

        if (float < 0.25) {
            return int;
        } else if (float >= 0.25 && float < 0.75) {
            return int + 0.5;
        } else {
            return int + 1;
        }
    } else {
        let int = Math.ceil(f);

        let float = f - int;
        if (float < -0.75) {
            return int - 1;
        } else if (float >= -0.75 && float < -0.25) {
            return int - 0.5;
        } else {
            return int;
        }
    }
}

export class LineHandler extends TransformHandler {
    readonly lineShape: PathShapeView;
    readonly referencePoint: XY;
    readonly ctrlElement: CtrlElementType;
    readonly center: XY;
    readonly baseStart: CurvePoint;
    readonly baseEnd: CurvePoint;

    private livingPoint: XY;
    private assist: Assist;
    private matrix: Matrix;
    private inverse: Matrix;

    constructor(context: Context, event: MouseEvent, ctrlElementType: CtrlElementType) {
        super(context, event);
        this.referencePoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.referencePoint };

        this.lineShape = context.selection.selectedShapes[0] as PathShapeView;
        this.assist = context.assist;

        this.assist.set_collect_target([this.lineShape]);
        this.assist.set_trans_target([this.lineShape]);

        const frame = this.lineShape.frame;
        this.matrix = new Matrix(this.lineShape.matrix2Root());
        this.matrix.preScale(frame.width, frame.height);

        this.inverse = new Matrix(this.matrix.inverse);

        this.ctrlElement = ctrlElementType;

        const [start, end] = this.lineShape?.segments[0]?.points;

        this.baseStart = start as CurvePoint;
        this.baseEnd = end as CurvePoint;

        if (!start || !end) {
            this.center = { x: 0, y: 0 };
        } else {
            this.center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        }
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

    private fixByAssist() {
        // const assist = this.assist.alignXY(this.livingPoint);

    }

    private getAngle() {
        const living = this.inverse.computeCoord3(this.livingPoint);

        let angle = getHorizontalAngle(this.center, living);

        if (this.shiftStatus) {
            const ex = angle % 15;

            if (ex < 7.5) {
                angle -= ex;
            } else {
                angle = angle - ex + 15;
            }
        }

        console.log('angle:', angle);
        // continue
    }

    createApiCaller() {
        this.asyncApiCaller = new LineHandleApiCaller(this.context.coopRepo, this.context.data, this.page, this.lineShape);

        this.workspace.rotating(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    fulfil() {
        this.workspace.rotating(false);
        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }

    execute(event: MouseEvent) {
        if (!this.asyncApiCaller) {
            console.error('!asyncApiCaller');
            return;
        }

        this.livingPoint = this.workspace.getRootXY(event);

        this.__execute();
    }

    passiveExecute() {
        if (!this.asyncApiCaller) {
            return;
        }
        this.__execute();
        this.updateCtrlView();
    }

    private __execute() {
        this.fixByAssist();

        const x = round2half(this.livingPoint.x);
        const y = round2half(this.livingPoint.y);

        const _xy = this.inverse.computeCoord2(x, y);

        if (this.ctrlElement === CtrlElementType.LineStart) {
            this.__execute4lineStart();
        } else if (this.ctrlElement === CtrlElementType.LineEnd) {
            this.__execute4lineEnd();
        } else if (this.ctrlElement === CtrlElementType.LineStartR) {
            this.getAngle();
        } else if (this.ctrlElement === CtrlElementType.LineEndR) {
            this.getAngle();
        }

        this.updateCtrlView();
    }

    private __execute4lineStart() {
        const __end = this.lineShape.segments[0].points[1];
        if (!__end) return;

        const end = { x: __end.x, y: __end.y };

        let x, y;

        if (this.alignPixel) {
            x = round2half(this.livingPoint.x);
            y = round2half(this.livingPoint.y);
        } else {
            x = this.livingPoint.x;
            y = this.livingPoint.y;
        }

        const start = this.inverse.computeCoord2(x, y);

        if (this.shiftStatus) {
            this.fixTargetPointFromFixedRotation(end, start);
        }

        (this.asyncApiCaller as LineHandleApiCaller).execute(start, end);
    }

    private __execute4lineEnd() {
        const __start = this.lineShape.segments[0].points[0];
        if (!__start) return;

        const start = { x: __start.x, y: __start.y };

        let x, y;

        if (this.alignPixel) {
            x = round2half(this.livingPoint.x);
            y = round2half(this.livingPoint.y);
        } else {
            x = this.livingPoint.x;
            y = this.livingPoint.y;
        }

        const end = this.inverse.computeCoord2(x, y);

        if (this.shiftStatus) {
            this.fixTargetPointFromFixedRotation(start, end);
        }

        (this.asyncApiCaller as LineHandleApiCaller).execute(start, end);
    }

    private fixTargetPointFromFixedRotation(_fixed: XY, _living: XY) {
        const fixed = this.matrix.computeCoord3(_fixed);
        const living = this.matrix.computeCoord3(_living);

        const angle = getHorizontalAngle(fixed, living);

        if (angle >= 0 && angle < 22.5) {
            living.y = fixed.y;
        } else if (angle >= 22.5 && angle < 67.5) {
            const a = angle / 180;
            const __m = new Matrix();
            __m.rotate((0.25 - a) * Math.PI, fixed.x, fixed.y);
            const __living = __m.computeCoord3(living);

            living.x = __living.x;
            living.y = __living.y;
        } else if (angle >= 67.5 && angle < 112.5) {
            living.x = fixed.x;
        } else if (angle >= 112.5 && angle < 157.5) {
            const a = angle / 180;
            const __m = new Matrix();
            __m.rotate((0.75 - a) * Math.PI, fixed.x, fixed.y);
            const __living = __m.computeCoord3(living);

            living.x = __living.x;
            living.y = __living.y;
        } else if (angle >= 157.5 && angle < 202.5) {
            living.y = fixed.y;
        } else if (angle >= 202.5 && angle < 247.5) {
            const a = angle / 180;
            const __m = new Matrix();
            __m.rotate((1.25 - a) * Math.PI, fixed.x, fixed.y);
            const __living = __m.computeCoord3(living);

            living.x = __living.x;
            living.y = __living.y;
        } else if (angle >= 247.5 && angle < 292.5) {
            const a = angle / 180;
            const __m = new Matrix();
            __m.rotate((1.5 - a) * Math.PI, fixed.x, fixed.y);
            const __living = __m.computeCoord3(living);

            living.x = __living.x;
            living.y = __living.y;
        } else if (angle >= 292.5 && angle < 337.5) {
            const a = angle / 180;
            const __m = new Matrix();
            __m.rotate((1.75 - a) * Math.PI, fixed.x, fixed.y);
            const __living = __m.computeCoord3(living);

            living.x = __living.x;
            living.y = __living.y;
        } else {
            living.y = fixed.y;
        }

        const __f = this.inverse.computeCoord3(fixed);
        const __l = this.inverse.computeCoord3(living);

        _fixed.x = __f.x;
        _fixed.y = __f.y;
        _living.x = __l.x;
        _living.y = __l.y;
    }
}