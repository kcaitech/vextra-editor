import { CtrlElementType, CurvePoint, LineHandleApiCaller, Matrix, PathShapeView } from "@kcdesign/data";
import { TransformHandler } from "./handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { Assist } from "@/context/assist";
import { getHorizontalAngle } from "@/utils/common";

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
            const end = this.lineShape.segments[0].points[1];
            if (!end) return;
            (this.asyncApiCaller as LineHandleApiCaller).execute(_xy, end);
        } else if (this.ctrlElement === CtrlElementType.LineEnd) {
            const start = this.lineShape.segments[0].points[0];
            if (!start) return;
            (this.asyncApiCaller as LineHandleApiCaller).execute(start, _xy);
        } else if (this.ctrlElement === CtrlElementType.LineStartR) {
            this.getAngle();
        } else if (this.ctrlElement === CtrlElementType.LineEndR) {
            this.getAngle();
        }

        this.updateCtrlView();
    }
}