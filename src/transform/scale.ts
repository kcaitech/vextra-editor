import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import { CtrlElementType, Matrix, ScaleUnit, Scaler, ShapeView } from "@kcdesign/data";
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
    shapes: ShapeView[];

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

    // extra params for single action
    tMatrix: Matrix = new Matrix();
    parent2root: Matrix = new Matrix();
    toParent: Matrix = new Matrix();
    toRoot: Matrix = new Matrix();
    rotation: number = 0;

    constructor(context: Context, event: MouseEvent, selected: ShapeView[], ctrlElementType: CtrlElementType) {
        super(context, event);
        this.shapes = selected;

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

        const shape = this.shapes[0];
        const f = shape.frame;

        const __m = new Matrix();
        const cx = f.width / 2;
        const cy = f.height / 2;

        __m.trans(-cx, -cy);
        if (shape.rotation) {
            __m.rotate((shape.rotation || 0) / 180 * Math.PI);
        }
        if (shape.isFlippedHorizontal) {
            __m.flipHoriz();
        }
        if (shape.isFlippedVertical) {
            __m.flipVert();
        }
        __m.trans(cx, cy);
        __m.trans(f.x, f.y);
        __m.multiAtLeft(shape.parent!.matrix2Root());
        this.tMatrix = new Matrix(__m.inverse);

        this.toParent = shape.matrix2Parent();
        this.parent2root = shape.parent!.matrix2Root();

        this.toRoot = this.toParent;
        this.toRoot.multiAtLeft(this.parent2root);
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
            this.__execute4single();
        } else {
            this.__execute4multi();
        }
        this.updateCtrlView();
    }

    private __execute4single() {
        if (this.ctrlElementType === CtrlElementType.RectLeft) {
            this.__execute4singleLeft();
        } else if (this.ctrlElementType === CtrlElementType.RectRight) {
            this.__execute4singleRight();
        } else if (this.ctrlElementType === CtrlElementType.RectTop) {
            this.__execute4singleTop();
        } else if (this.ctrlElementType === CtrlElementType.RectBottom) {
            this.__execute4singleBottom();
        } else if (this.ctrlElementType === CtrlElementType.RectLT) {
            this.__execute4singleLT();
        } else if (this.ctrlElementType === CtrlElementType.RectRT) {
            this.__execute4singleRT();
        } else if (this.ctrlElementType === CtrlElementType.RectRB) {
            this.__execute4singleRB();
        } else if (this.ctrlElementType === CtrlElementType.RectLB) {
            this.__execute4singleLB();
        }
    }

    private __execute4singleLeft() {

    }

    private __execute4singleRight() {
    }

    private __execute4singleTop() {
    }

    private __execute4singleBottom() {
    }

    private __execute4singleLT() {
        const { x, y } = this.tMatrix.computeCoord3(this.livingPoint);
        const shape = this.shapes[0];
        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        const matrix_parent2page = this.parent2root;
        const matrix2parent = this.toParent;

        const target = matrix_parent2page.inverseCoord(x, y);
        const current = matrix2parent.computeCoord2(0, 0);

        const saverb = matrix2parent.computeCoord2(base.baseWidth, base.baseHeight);
        const matrixarr = matrix2parent.toArray();
        matrixarr[4] = target.x;
        matrixarr[5] = target.y;

        const m2 = new Matrix(matrixarr);

        const wh = m2.inverseCoord(saverb.x, saverb.y);
        let w = wh.x;
        let h = wh.y;

        const minimum_WH = 0.01; // 用户可设置最小宽高值。以防止宽高在缩放后为0

        let needFlipH = false;
        let needFlipV = false;
        let targetRotation = this.rotation;
        if (w < 0) {
            if (!this.relativeFlip.fh) {
                needFlipH = true;
                this.relativeFlip.fh = true;
            }
            w = -w;
        } else {
            if (this.relativeFlip.fh) {
                this.relativeFlip.fh = false;
                needFlipH = true;
            }
        }

        if (h < 0) {
            if (!this.relativeFlip.fv) {
                needFlipV = true;
                this.relativeFlip.fv = true;
            }
            h = -h;
        } else {
            if (this.relativeFlip.fv) {
                needFlipV = true;
                this.relativeFlip.fv = false;
            }
        }

        if (this.rotation) {
            if (needFlipH) {
                this.rotation = 360 - this.rotation;
            }
            if (needFlipV) {
                this.rotation = 360 - this.rotation;
            }
        }

        if (w < minimum_WH) {
            w = minimum_WH;
        }

        if (h < minimum_WH) {
            h = minimum_WH;
        }

        if (this.alignPixel) {
            w = Math.round(w);
            h = Math.round(h);
            if (w === 0) {
                w = 1;
            }
            if (h === 0) {
                h = 1;
            }
        }

        targetRotation = this.rotation;
        const targetFlipH = !!shape.isFlippedHorizontal || needFlipH;
        const targetFlipV = !!shape.isFlippedVertical || needFlipV;

        const cx1 = w / 2;
        const cy1 = h / 2;

        const m1 = new Matrix();
        m1.trans(-cx1, -cy1);
        if (targetRotation) {
            m1.rotate(targetRotation / 180 * Math.PI);
        }
        if (targetFlipH) {
            m1.flipHoriz();
        }
        if (targetFlipV) {
            m1.flipVert();
        }
        m1.trans(cx1, cy1);
        m1.trans(base.baseX, base.baseY);

        const xy1 = m1.computeCoord(w, h);
        const dx = target.x - xy1.x;
        const dy = target.y - xy1.y;
    }

    private __execute4singleRT() {

    }

    private __execute4singleRB() {

    }

    private __execute4singleLB() {
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);

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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute4multi(transformUnits);
    }
}