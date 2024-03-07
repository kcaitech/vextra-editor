import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { CtrlElementType, FrameLike, Matrix, ScaleUnit, Scaler, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { Action } from "@/context/tool";
import { boundingBox2Root } from "@/utils/common";

type Box = {
    origin: XY;

    baseX: number;
    baseY: number;
    baseWidth: number;
    baseHeight: number;

    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
};

type BaseFrames = Map<string, Box>;

export class ScaleHandler extends TransformHandler {
    ctrlElementType: CtrlElementType;
    livingPoint: XY;
    relativeFlip: { fh: boolean, fv: boolean } = { fh: false, fv: false };
    fixedRatioWhileScaling: boolean = false;

    // base frame
    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    baseFrames: BaseFrames = new Map();

    // align
    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    // cache
    __baseFramesCache: BaseFrames = new Map();

    constructor(context: Context, selected: ShapeView[], event: MouseEvent, ctrlElementType: CtrlElementType) {
        super(context, selected, event);
        this.ctrlElementType = ctrlElementType;
        this.livingPoint = this.workspace.getRootXY(event);

        this.getBaseFrames();

        this.context.assist.set_collect_target(selected);
        this.context.assist.set_trans_target(selected);
    }

    createApiCaller() {
        this.asyncApiCaller = new Scaler(this.context.coopRepo, this.context.data, this.page);

        this.workspace.scaling(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    fulfil() {
        this.workspace.scaling(false);
        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }

    // 执行主体
    execute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);

        this.livingPointAlignByAssist();

        this.__execute();
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

    private getBaseFrames() {
        const matrixParent2rootCache = new Map();

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const cache = this.__baseFramesCache.get(shape.id);

            if (cache) {
                continue;
            }

            if (shape.frameType > 1 && shape.rotation) {
                this.fixedRatioWhileScaling = true;
            }

            const f = boundingBox2Root(shape, matrixParent2rootCache);

            if (f.boxX < left) {
                left = f.boxX;
            }

            if (f.boxY < top) {
                top = f.boxY;
            }

            const _right = f.boxX + f.boxWidth
            if (_right > right) {
                right = _right;
            }

            const _bottom = f.boxY + f.boxHeight;
            if (_bottom > bottom) {
                bottom = _bottom;
            }

            this.baseFrames.set(shape.id, f);
            this.__baseFramesCache.set(shape.id, f);
        }

        this.originSelectionBox = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };
    }

    private isFixedRatio() {
        return this.fixedRatioWhileScaling || this.shiftStatus || this.context.tool.action === Action.AutoK;
    }

    private livingPointAlignByAssist() {
        if (!this.shapes.length) {
            return;
        }

        if (!(this.shapes.length === 1 && this.shapes[0].rotation)) {
            if (this.ctrlElementType === CtrlElementType.RectRight) {
                this.fixToAlignWhileModifyRightOrLeft();
            } else if (this.ctrlElementType === CtrlElementType.RectLeft) {
                this.fixToAlignWhileModifyRightOrLeft();
            } else if (this.ctrlElementType === CtrlElementType.RectTop) {
                this.fixToAlignWhileModifyTopOrBottom();
            } else if (this.ctrlElementType === CtrlElementType.RectBottom) {
                this.fixToAlignWhileModifyTopOrBottom();
            }
        }

        if (this.ctrlElementType === CtrlElementType.RectLT) {
            this.fixToAlignWhileModifyPoint();
        } else if (this.ctrlElementType === CtrlElementType.RectRT) {
            this.fixToAlignWhileModifyPoint();
        } else if (this.ctrlElementType === CtrlElementType.RectRB) {
            this.fixToAlignWhileModifyPoint();
        } else if (this.ctrlElementType === CtrlElementType.RectLB) {
            this.fixToAlignWhileModifyPoint();
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

    private fixToAlignWhileModifyRightOrLeft() {
        const x = this.livingPoint.x;
        const y1 = this.originSelectionBox.y;
        const y2 = this.originSelectionBox.bottom;

        const target = this.context.assist.alignX(this.livingPoint, [{ x, y: y1 }, { x, y: y2 }]);
        if (!target) {
            return;
        }

        this.updateHorFixedStatus(x, target);
    }

    private fixToAlignWhileModifyTopOrBottom() {
        const y = this.livingPoint.y;
        const x1 = this.originSelectionBox.x;
        const x2 = this.originSelectionBox.right;

        const assistResult = this.context.assist.alignY(this.livingPoint, [{ x: x1, y }, { x: x2, y }]);
        if (!assistResult) {
            return;
        }

        this.updateVerFixedStatus(y, assistResult);
    }

    private fixToAlignWhileModifyPoint() {
        const assistResult = this.context.assist.alignXY(this.livingPoint);
        if (!assistResult) {
            return;
        }

        this.updateHorFixedStatus(this.livingPoint.x, assistResult);
        this.updateVerFixedStatus(this.livingPoint.y, assistResult);
    }

    private __execute() {
        if (!this.shapes.length) {
            return;
        }

        if (this.shapes.length === 1) {

        } else {
            this.__execute4multi();
            this.updateCtrlView();
        }
    }

    private __execute4multi() {
        if (this.ctrlElementType === CtrlElementType.RectLeft) {
            this.__executeSide4Left();
        } else if (this.ctrlElementType === CtrlElementType.RectRight) {
            this.__executeSide4Right();
        } else if (this.ctrlElementType === CtrlElementType.RectTop) {
            this.__executeSide4Top();
        } else if (this.ctrlElementType === CtrlElementType.RectBottom) {
            this.__executeSide4Bottom();
        } else if (this.ctrlElementType === CtrlElementType.RectLT) {
            this.__executeSide4LeftTop();
        } else if (this.ctrlElementType === CtrlElementType.RectRT) {
            this.__executeSide4RightTop();
        } else if (this.ctrlElementType === CtrlElementType.RectRB) {
            this.__executeSide4RightBottom();
        } else if (this.ctrlElementType === CtrlElementType.RectLB) {
            this.__executeSide4LeftBottom();
        }
    }

    private generateTransformUnits(
        referencePoint1: XY,
        referencePoint2: XY,
        scaleX: number,
        scaleY: number,
        needFlipH: boolean,
        needFlipV: boolean
    ) {
        const matrixCache: Map<string, Matrix> = new Map();
        const transformUnits: ScaleUnit[] = [];
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const baseFrame = this.baseFrames.get(shape.id);
            if (!baseFrame) {
                continue;
            }

            const origin = baseFrame.origin;

            const disX = origin.x - referencePoint1.x;
            const disY = origin.y - referencePoint1.y;

            let targetXY = {
                x: referencePoint2.x + scaleX * disX,
                y: referencePoint2.y + scaleY * disY
            };

            const parent = shape.parent!;

            let m = matrixCache.get(parent.id)!;
            if (!m) {
                m = new Matrix(parent.matrix2Root().inverse);
                matrixCache.set(parent.id, m);
            }

            let width = Math.abs(baseFrame.baseWidth * scaleX);
            let height = Math.abs(baseFrame.baseHeight * scaleY);

            const alignPixel = this.alignPixel;

            width = Math.max(alignPixel ? Math.round(width) : width, 1);
            height = Math.max(alignPixel ? Math.round(height) : height, 1);

            const __m = new Matrix();
            const cx = width / 2;
            const cy = height / 2;
            __m.trans(-cx, -cy);
            if (shape.rotation) {
                __m.rotate((shape.rotation || 0) / 180 * Math.PI);
            }
            const targetFlipH = needFlipH ? !shape.isFlippedHorizontal : shape.isFlippedHorizontal;
            if (targetFlipH) {
                __m.flipHoriz();
            }
            const targetFlipV = needFlipV ? !shape.isFlippedVertical : shape.isFlippedVertical;
            if (targetFlipV) {
                __m.flipVert();
            }
            __m.trans(cx, cy);
            __m.trans(baseFrame.baseX, baseFrame.baseY);

            const _targetXY = __m.computeCoord2(0, 0);
            targetXY = m.computeCoord3(targetXY);

            _targetXY.x = baseFrame.baseX + (targetXY.x - _targetXY.x);
            _targetXY.y = baseFrame.baseY + (targetXY.y - _targetXY.y);

            _targetXY.x = alignPixel ? Math.round(_targetXY.x) : _targetXY.x;
            _targetXY.y = alignPixel ? Math.round(_targetXY.y) : _targetXY.y;

            transformUnits.push({
                shape,
                targetXY: _targetXY,
                targetWidth: width,
                targetHeight: height,
                baseWidth: baseFrame.baseWidth,
                baseHeight: baseFrame.baseHeight,
                needFlipH: needFlipH,
                needFlipV: needFlipV
            });
        }

        return transformUnits;
    }

    private __executeSide4Left() {
        const box = this.originSelectionBox;

        const scaleX = (box.right - this.livingPoint.x) / box.width;
        const isFixedRatio = this.isFixedRatio();
        const scaleY = isFixedRatio ? scaleX : 1;

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }

        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: this.livingPoint.x, y: box.y };

        if (isFixedRatio) {
            const _height = box.height * scaleY - box.height;
            referencePoint2.y -= _height / 2;
        }

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, false);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4Right() {
        const box = this.originSelectionBox;

        const scaleX = (this.livingPoint.x - box.x) / box.width;
        const isFixedRatio = this.isFixedRatio();
        const scaleY = isFixedRatio ? scaleX : 1;

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }

        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: box.x, y: box.y };
        if (isFixedRatio) {
            const _height = Math.abs(box.height * scaleY) - box.height;
            referencePoint2.y -= _height / 2;
        }

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, false);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4Top() {
        const box = this.originSelectionBox;

        const scaleY = (box.bottom - this.livingPoint.y) / box.height;
        const isFixedRatio = this.isFixedRatio();
        const scaleX = isFixedRatio ? scaleY : 1;

        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: box.x, y: this.livingPoint.y };

        if (isFixedRatio) {
            const _width = box.width * scaleX - box.width;
            referencePoint2.x -= _width / 2;
        }

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, false, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4Bottom() {
        const box = this.originSelectionBox;

        const scaleY = (this.livingPoint.y - box.y) / box.height;
        const isFixedRatio = this.isFixedRatio();
        const scaleX = isFixedRatio ? scaleY : 1;

        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: box.x, y: box.y };

        if (isFixedRatio) {
            const _width = (scaleX - 1) * box.width;
            referencePoint2.x -= _width / 2;
        }

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, false, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4LeftTop() {
        const box = this.originSelectionBox;

        let scaleX = (box.right - this.livingPoint.x) / box.width;
        let scaleY = (box.bottom - this.livingPoint.y) / box.height;

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }
        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const isFixedRatio = this.isFixedRatio();
        const referencePoint1 = { x: this.originSelectionBox.x, y: this.originSelectionBox.y };
        const referencePoint2 = { x: this.livingPoint.x, y: this.livingPoint.y };

        if (isFixedRatio) {
            if (scaleX > scaleY) {
                referencePoint2.y -= (scaleX - scaleY) * box.height;
                scaleY = scaleX;
            } else {
                referencePoint2.x -= (scaleY - scaleX) * box.width;
                scaleX = scaleY;
            }
        }
        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4RightTop() {
        const box = this.originSelectionBox;

        let scaleX = (this.livingPoint.x - box.x) / box.width;
        let scaleY = (box.bottom - this.livingPoint.y) / box.height;

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }
        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const isFixedRatio = this.isFixedRatio();
        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: box.x, y: this.livingPoint.y };

        if (isFixedRatio) {
            if (scaleX > scaleY) {
                referencePoint2.y -= (scaleX - scaleY) * box.height;
                scaleY = scaleX;
            } else {
                scaleX = scaleY;
            }
        }
        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);

    }

    private __executeSide4RightBottom() {
        const box = this.originSelectionBox;

        let scaleX = (this.livingPoint.x - box.x) / box.width;
        let scaleY = (this.livingPoint.y - box.y) / box.height;

        const isFixedRatio = this.isFixedRatio();

        if (isFixedRatio) {
            if (scaleX > scaleY) {
                scaleY = scaleX;
            } else {
                scaleX = scaleY;
            }
        }

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }
        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const referencePoint1 = { x: this.originSelectionBox.x, y: this.originSelectionBox.y };
        const referencePoint2 = { x: box.x, y: box.y };

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }

    private __executeSide4LeftBottom() {
        const box = this.originSelectionBox;

        let scaleX = (box.right - this.livingPoint.x) / box.width;
        let scaleY = (this.livingPoint.y - box.y) / box.height;

        const needFlipH = (scaleX < 0) !== this.relativeFlip.fh
        if (needFlipH) {
            this.relativeFlip.fh = !this.relativeFlip.fh;
        }
        const needFlipV = (scaleY < 0) !== this.relativeFlip.fv;
        if (needFlipV) {
            this.relativeFlip.fv = !this.relativeFlip.fv;
        }

        const isFixedRatio = this.isFixedRatio();
        const referencePoint1 = { x: box.x, y: box.y };
        const referencePoint2 = { x: this.livingPoint.x, y: box.y };

        if (isFixedRatio) {
            if (scaleX > scaleY) {
                scaleY = scaleX;
            } else {
                referencePoint2.x -= (scaleY - scaleX) * box.width;
                scaleX = scaleY;
            }
        }
        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, needFlipV);

        (this.asyncApiCaller as Scaler).execute4multi(scaleX, scaleY, transformUnits);
    }
}