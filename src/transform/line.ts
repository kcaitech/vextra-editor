/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
    readonly center: XY; // root 空间
    readonly baseStart: CurvePoint;
    readonly baseEnd: CurvePoint;
    readonly matrix: Matrix;
    readonly inverse: Matrix;
    readonly assist: Assist;

    private livingPoint: XY;

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = Infinity;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = Infinity;

    constructor(context: Context, event: MouseEvent, ctrlElementType: CtrlElementType) {
        super(context, event);
        this.referencePoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.referencePoint };

        this.lineShape = context.selection.selectedShapes[0] as PathShapeView;
        this.assist = context.assist;

        this.assist.set_collect_target([this.lineShape]);
        this.assist.set_trans_target([this.lineShape]);

        const frame = this.lineShape.frame;
        this.matrix = (this.lineShape.matrix2Root()).toMatrix();
        this.matrix.preScale(frame.width, frame.height);

        this.inverse = new Matrix(this.matrix.inverse);

        this.ctrlElement = ctrlElementType;

        const [start, end] = this.lineShape?.segments[0]?.points;

        this.baseStart = start as CurvePoint;
        this.baseEnd = end as CurvePoint;

        if (!start || !end) {
            this.center = { x: 0, y: 0 };
        } else {
            const _start = this.matrix.computeCoord3(start);
            const _end = this.matrix.computeCoord3(end);

            this.center = { x: (_start.x + _end.x) / 2, y: (_start.y + _end.y) / 2 };
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
        const at = { ...this.livingPoint };
        if (this.alignPixel) {
            at.x = round2half(at.x);
            at.y = round2half(at.y);
        }
        const assist = this.context.assist.alignXY(at);

        if (assist) {
            this.updateHorFixedStatus(at.x, assist);
            this.updateVerFixedStatus(at.y, assist);
        }

        if (this.horFixedStatus) {
            this.livingPoint.x = this.horFixedValue;
        }
        if (this.verFixedStatus) {
            this.livingPoint.y = this.verFixedValue;
        }
    }

    private updateHorFixedStatus(livingX: number, assistResult: { x: number, sticked_by_x: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.horFixedStatus) {
            if (Math.abs(livingX - this.horFixedValue) >= stickness) {
                this.horFixedStatus = false;
            } else {
                if (this.horFixedValue !== assistResult.x) {
                    this.horFixedValue = assistResult.x;
                }
            }
        } else if (assistResult.sticked_by_x) {
            this.horFixedStatus = true;
            this.horFixedValue = assistResult.x;
        }
    }

    private updateVerFixedStatus(livingY: number, assistResult: { y: number, sticked_by_y: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.verFixedStatus) {
            if (Math.abs(livingY - this.verFixedValue) >= stickness) {
                this.verFixedStatus = false;
            } else {
                if (this.verFixedValue !== assistResult.y) {
                    this.verFixedValue = assistResult.y;
                }
            }
        } else if (assistResult.sticked_by_y) {
            this.verFixedStatus = true;
            this.verFixedValue = assistResult.y;
        }
    }

    createApiCaller() {
        this.asyncApiCaller = new LineHandleApiCaller(this.context.coopRepo, this.context.data, this.page, this.lineShape);

        if (this.ctrlElement.endsWith('rotate')) {
            this.workspace.rotating(true);
        } else {
            this.workspace.scaling(true);
        }

        this.workspace.setSelectionViewUpdater(false);
    }

    fulfil() {
        if (this.ctrlElement.endsWith('rotate')) {
            this.workspace.rotating(false);
        } else {
            this.workspace.scaling(false);
        }

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
        this.updateCtrlView(1);
    }

    private __execute() {
        this.fixByAssist();

        if (this.ctrlElement === CtrlElementType.LineStart) {
            this.execute4lineStart();
        } else if (this.ctrlElement === CtrlElementType.LineEnd) {
            this.execute4lineEnd();
        } else if (this.ctrlElement === CtrlElementType.LineStartR) {
            this.execute4lineStartRotate();
        } else if (this.ctrlElement === CtrlElementType.LineEndR) {
            this.execute4lineEndRotate();
        }

        this.updateCtrlView(1);
    }

    private execute4lineStart() {
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

    private execute4lineEnd() {
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

    private execute4lineStartRotate() {
        const center = this.center;
        let angle = getHorizontalAngle(center, this.livingPoint);

        if (this.shiftStatus) {
            const ex = angle % 15;

            if (ex < 7.5) {
                angle -= ex;
            } else {
                angle = angle - ex + 15;
            }
        }

        const arc = (angle / 180) * Math.PI;

        let start = this.matrix.computeCoord3(this.baseStart);
        let end = this.matrix.computeCoord3(this.baseEnd);

        const arcS = (getHorizontalAngle(center, start) / 180) * Math.PI;
        const arcE = (getHorizontalAngle(center, end) / 180) * Math.PI;

        const m1 = new Matrix();
        m1.rotate(arc - arcS, center.x, center.y);
        m1.multiAtLeft(this.inverse);
        start = m1.computeCoord3(start);

        const m2 = new Matrix();
        m2.rotate(arc - arcE + Math.PI, center.x, center.y);
        m2.multiAtLeft(this.inverse);
        end = m2.computeCoord3(end);

        (this.asyncApiCaller as LineHandleApiCaller).execute(start, end);
    }

    private execute4lineEndRotate() {
        const center = this.center;
        let angle = getHorizontalAngle(center, this.livingPoint);

        if (this.shiftStatus) {
            const ex = angle % 15;

            if (ex < 7.5) {
                angle -= ex;
            } else {
                angle = angle - ex + 15;
            }
        }

        const arc = (angle / 180) * Math.PI;

        let start = this.matrix.computeCoord3(this.baseStart);
        let end = this.matrix.computeCoord3(this.baseEnd);

        const arcS = (getHorizontalAngle(center, start) / 180) * Math.PI;
        const arcE = (getHorizontalAngle(center, end) / 180) * Math.PI;

        const m1 = new Matrix();
        m1.rotate(arc - arcS + Math.PI, center.x, center.y);
        m1.multiAtLeft(this.inverse);
        start = m1.computeCoord3(start);

        const m2 = new Matrix();
        m2.rotate(arc - arcE, center.x, center.y);
        m2.multiAtLeft(this.inverse);
        end = m2.computeCoord3(end);

        (this.asyncApiCaller as LineHandleApiCaller).execute(start, end);
    }
}