import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import { CtrlElementType, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";

export type ScaleStatus = { flipHorizontal: boolean, flipVertical: boolean, scaleX: number, scaleY: number };

export class ScaleHandler extends TransformHandler {
    ctrlElementType: CtrlElementType;
    livingPoint: XY;
    currentSelectionBox: FrameLike;
    relativeTransform: ScaleStatus;

    constructor(context: Context, selected: ShapeView[], event: MouseEvent, ctrlElementType: CtrlElementType) {
        super(context, selected, event);
        this.ctrlElementType = ctrlElementType;
        this.livingPoint = { ...this.referencePoint };
        this.currentSelectionBox = { ...this.originSelectionBox };
        this.relativeTransform = { flipHorizontal: false, flipVertical: false, scaleX: 1, scaleY: 1 };

        this.context.assist.set_trans_target(selected);
    }

    excute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);

        this.livingPointAlignByAssist();

        this.__excute();
    }

    livingPointAlignByAssist() {
        if (!this.shapes.length) {
            return;
        }

        if (!(this.shapes.length === 1 && this.shapes[0].rotation)) {
            if (this.ctrlElementType === CtrlElementType.RectRight) {
                this.fixToAlignWhileModifyRightOrLeft();
            }
            else if (this.ctrlElementType === CtrlElementType.RectLeft) {
                this.fixToAlignWhileModifyRightOrLeft();
            }
            else if (this.ctrlElementType === CtrlElementType.RectTop) {
                this.fixToAlignWhileMofdifyTopOrBottom();
            }
            else if (this.ctrlElementType === CtrlElementType.RectBottom) {
                this.fixToAlignWhileMofdifyTopOrBottom();
            }
        }

        if (this.ctrlElementType === CtrlElementType.RectLT) {

        }
        else if (this.ctrlElementType === CtrlElementType.RectRT) {

        }
        else if (this.ctrlElementType === CtrlElementType.RectRB) {

        }
        else if (this.ctrlElementType === CtrlElementType.RectLB) {

        }

        if (this.horFixedStatus) {
            this.livingPoint.x = this.horFixedValue;
        }
        if (this.verFixedStatus) {
            this.livingPoint.y = this.verFixedValue;
        }
    }

    updateHorFixedStatus(livingX: number, assistResult: { x: number, sticked_by_x: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.horFixedStatus) {
            if (Math.abs(livingX - this.horFixedValue) >= stickness) {
                this.horFixedStatus = false;
            }
            else {
                if (this.horFixedValue !== assistResult.x) {
                    this.horFixedValue = assistResult.x;
                }
            }
        }
        else if (assistResult.sticked_by_x) {
            this.horFixedStatus = true;
            this.horFixedValue = assistResult.x;
        }
    }

    fixToAlignWhileModifyRightOrLeft() {
        const x = this.livingPoint.x;
        const y1 = this.originSelectionBox.y;
        const y2 = y1 + this.originSelectionBox.height;

        const target = this.context.assist.alignX(this.livingPoint, [{ x, y: y1 }, { x, y: y2 }]);
        if (!target) {
            return;
        }

        this.updateHorFixedStatus(x, target);
    }

    updateVerFixedStatus(livingY: number, assistResult: { y: number, sticked_by_y: boolean }) {
        const stickness = this.context.assist.stickness;
        if (this.verFixedStatus) {
            if (Math.abs(livingY - this.verFixedValue) >= stickness) {
                this.verFixedStatus = false;
            }
            else {
                if (this.verFixedValue !== assistResult.y) {
                    this.verFixedValue = assistResult.y;
                }
            }
        }
        else if (assistResult.sticked_by_y) {
            this.verFixedStatus = true;
            this.verFixedValue = assistResult.y;
        }
    }

    fixToAlignWhileMofdifyTopOrBottom() {
        const y = this.livingPoint.y;
        const x1 = this.originSelectionBox.x;
        const x2 = x1 + this.originSelectionBox.width;

        const assistResult = this.context.assist.alignY(this.livingPoint, [{ x: x1, y }, { x: x2, y }]);
        if (!assistResult) {
            return;
        }

        this.updateVerFixedStatus(y, assistResult);
    }

    __excute() {
        if (!this.shapes.length) {
            return;
        }

        if (this.shapes.length === 1) {

        }
        else {
            this.__excute4multi();
        }
    }

    __excute4multi() {
        if (this.ctrlElementType === CtrlElementType.RectLeft) {
        }
        else if (this.ctrlElementType === CtrlElementType.RectRight) {
            this.__excuteSide4Right();
        }
        else if (this.ctrlElementType === CtrlElementType.RectTop) {

        }
        else if (this.ctrlElementType === CtrlElementType.RectBottom) {

        }
    }

    __excuteSide4Right() {
        const originWidth = this.originSelectionBox.width;
        const originLeft = this.originSelectionBox.x;
        const scale = (this.livingPoint.x - originLeft) / originWidth;
        const flip = scale < 0;
        // console.log('__excuteSide4Right:', scale);
    }
    __excuteSide4Vertical() {

    }

    passiveExcute() {

    }

    updateCurrentTransform() {
        const width = this.livingPoint.x - this.originSelectionBox.x;
        const height = this.livingPoint.y - this.originSelectionBox.y;

        this.relativeTransform.scaleX = width / this.originSelectionBox.width;
        this.relativeTransform.scaleY = height / this.originSelectionBox.height;

        this.relativeTransform.flipHorizontal = !!(this.relativeTransform.scaleX < 0);
        this.relativeTransform.flipVertical = !!(this.relativeTransform.scaleY < 0);
    }
}