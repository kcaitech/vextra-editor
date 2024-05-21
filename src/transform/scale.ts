import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import { adapt2Shape, CtrlElementType, Matrix, Scaler, ScaleUnit, ShapeType, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { boundingBox2Root } from "@/utils/common";

type Box = {
    origin: XY;

    baseX: number;
    baseY: number;
    baseWidth: number;
    baseHeight: number;
    baseRotation: number;

    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
};

type BaseFrames = Map<string, Box>;

export class ScaleHandler extends TransformHandler {
    readonly shapes: ShapeView[];
    readonly ctrlElementType: CtrlElementType;

    private livingPoint: XY;
    private relativeFlip: { fh: boolean, fv: boolean } = { fh: false, fv: false };
    private fixedRatioWhileScaling: boolean = false;

    // base frame
    private originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    private baseFrames: BaseFrames = new Map();

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = 0;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = 0;

    // cache
    private __baseFramesCache: BaseFrames = new Map();

    // extra params for single action
    private tMatrix: Matrix = new Matrix();
    private parent2root: Matrix = new Matrix();
    private toParent: Matrix = new Matrix();
    private toRoot: Matrix = new Matrix();
    private rotation: number = 0;

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

        this.toRoot = new Matrix(this.toParent);
        this.toRoot.multiAtLeft(this.parent2root);

        this.rotation = shape.rotation || 0;

        this.fixedRatioWhileScaling = false;
    }

    /**
     * @description 锁定宽高比例
     */
    private isFixedRatio() {
        return this.fixedRatioWhileScaling || this.shiftStatus;
    }

    private livingPointAlignByAssist() {
        const len = this.shapes.length;

        if (!len) {
            return;
        }

        const cet = this.ctrlElementType;

        if (cet === CtrlElementType.RectRight || cet === CtrlElementType.RectLeft) {
            if (len === 1) {
                this.fixToAlignWhileModifySingleRightOrLeft();
            } else {
                this.fixToAlignWhileModifyRightOrLeft();
            }
        } else if (cet === CtrlElementType.RectTop || cet === CtrlElementType.RectBottom) {
            if (len === 1) {
                this.fixToAlignWhileModifySingleTopOrBottom();
            } else {
                this.fixToAlignWhileModifyTopOrBottom();
            }
        } else {
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

    private fixToAlignWhileModifySingleRightOrLeft() {
        const shape = this.shapes[0];
        const base = this.baseFrames.get(shape.id);
        if (!base) {
            return;
        }

        if (base.baseWidth === base.boxWidth) {
            this.fixToAlignWhileModifyRightOrLeft();
        } else if (base.baseWidth === base.boxHeight) {
            this.fixToAlignWhileModifyTopOrBottom();
        }
    }

    private fixToAlignWhileModifySingleTopOrBottom() {
        const shape = this.shapes[0];
        const base = this.baseFrames.get(shape.id);
        if (!base) {
            return;
        }

        if (base.baseHeight === base.boxHeight) {
            this.fixToAlignWhileModifyTopOrBottom();
        } else if (base.baseHeight === base.boxWidth) {
            this.fixToAlignWhileModifyRightOrLeft();
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

    private __modifyOffset(targetXY: XY, transformedXY: XY, baseX: number, baseY: number) {
        const alignPixel = this.alignPixel;
        targetXY.x = alignPixel ? Math.round(targetXY.x) : targetXY.x;
        targetXY.y = alignPixel ? Math.round(targetXY.y) : targetXY.y;

        transformedXY.x = baseX + (targetXY.x - transformedXY.x);
        transformedXY.y = baseY + (targetXY.y - transformedXY.y);
    }

    /**
     * @description 修正根部浮点数导致的上梁不正下梁歪
     * todo 临时方案，还需要优化
     */
    private fixRefer(shape: ShapeView, refer: XY) {
        if (!this.alignPixel) {
            return;
        }
        const parent = shape.parent!;
        if (parent.type !== ShapeType.Page) {
            return;
        }
        const floatX = parent.frame.x % 1;
        if (floatX) {
            refer.x += floatX;
        }
        const floatY = parent.frame.y % 1;
        if (floatY) {
            refer.y += floatY;
        }
    }

    private __execute4singleLeft() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseX, baseY, baseWidth, baseHeight } = base;

        const pointOnShape = this.tMatrix.computeCoord3(__livingPoint);
        let w = baseWidth - pointOnShape.x;
        let h = baseHeight;
        if (this.isFixedRatio()) {
            const scale = Math.abs(w / baseWidth); // 等比缩放不会使另一个轴上的数变成复数
            h = baseHeight * scale;
            pointOnShape.y = -baseHeight * (scale - 1) / 2;
        } else {
            pointOnShape.y = 0;
        }

        let target = this.toRoot.computeCoord3(pointOnShape);

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isWidthFromZero,
            targetFlipH
        } = this.__modifyTransform(shape, { x: baseX, y: baseY }, w, h);

        const _targetXY = transformedMatrix.computeCoord2(0, 0);
        const targetXY = this.parent2root.inverseCoord(target);

        this.fixRefer(shape, _targetXY);

        if (isWidthFromZero) {
            if (targetFlipH) {
                _targetXY.x--;
            } else {
                _targetXY.x++;
            }
        }

        this.__modifyOffset(targetXY, _targetXY, baseX, baseY);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY: _targetXY,
            baseWidth,
            baseHeight,
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __execute4singleRight() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseX, baseY, baseWidth, baseHeight } = base;

        const pointOnShape = this.tMatrix.computeCoord3(__livingPoint);

        let w = pointOnShape.x;
        let h = baseHeight;

        if (this.isFixedRatio()) {
            const scale = Math.abs(w / baseWidth);
            h = baseHeight * scale;
            pointOnShape.y = -baseHeight * (scale - 1) / 2;
        } else {
            pointOnShape.y = 0;
        }

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix
        } = this.__modifyTransform(shape, { x: baseX, y: baseY }, w, h);

        const _targetXY = transformedMatrix.computeCoord2(0, 0);
        const targetXY = this.parent2root.inverseCoord(this.toRoot.computeCoord2(0, pointOnShape.y));

        this.fixRefer(shape, _targetXY);

        this.__modifyOffset(targetXY, _targetXY, baseX, baseY);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY: _targetXY,
            baseWidth,
            baseHeight,
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __execute4singleTop() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        const pointOnShape = this.tMatrix.computeCoord3(this.livingPoint);

        const { baseX, baseY, baseWidth, baseHeight } = base;

        let w = baseWidth;
        let h = baseHeight - pointOnShape.y;

        if (this.isFixedRatio()) {
            const scale = Math.abs(h / baseHeight);
            w = baseWidth * scale;
            pointOnShape.x = -baseWidth * (scale - 1) / 2;
        } else {
            pointOnShape.x = 0;
        }

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isHeightFromZero,
            targetFlipV
        } = this.__modifyTransform(shape, { x: baseX, y: baseY }, w, h);

        const _targetXY = transformedMatrix.computeCoord2(0, 0);
        const targetXY = this.parent2root.inverseCoord(this.toRoot.computeCoord3(pointOnShape));

        this.fixRefer(shape, _targetXY);

        if (isHeightFromZero) {
            if (targetFlipV) {
                _targetXY.y--;
            } else {
                _targetXY.y++;
            }
        }

        this.__modifyOffset(targetXY, _targetXY, baseX, baseY);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY: _targetXY,
            baseWidth,
            baseHeight,
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __execute4singleBottom() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        const pointOnShape = this.tMatrix.computeCoord3(this.livingPoint);

        const { baseX, baseY, baseWidth, baseHeight } = base;

        let w = baseWidth;
        let h = pointOnShape.y;

        if (this.isFixedRatio()) {
            const scale = Math.abs(h / baseHeight);
            w = baseWidth * scale;
            pointOnShape.x = -baseWidth * (scale - 1) / 2;
        } else {
            pointOnShape.x = 0;
        }

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix
        } = this.__modifyTransform(shape, { x: baseX, y: baseY }, w, h);

        const _targetXY = transformedMatrix.computeCoord2(0, 0);
        const targetXY = this.parent2root.inverseCoord(this.toRoot.computeCoord2(pointOnShape.x, 0));

        this.fixRefer(shape, _targetXY);

        this.__modifyOffset(targetXY, _targetXY, baseX, baseY);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY: _targetXY,
            baseWidth,
            baseHeight,
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __modifyTransform(shape: ShapeView, baseXY: XY, width: number, height: number) {
        const minimum_WH = 0.01;

        let needFlipH = false;
        let needFlipV = false;

        if (width < 0) {
            if (!this.relativeFlip.fh) {
                needFlipH = true;
                this.relativeFlip.fh = true;
            }
            width = -width;
        } else {
            if (this.relativeFlip.fh) {
                this.relativeFlip.fh = false;
                needFlipH = true;
            }
        }

        if (height < 0) {
            if (!this.relativeFlip.fv) {
                needFlipV = true;
                this.relativeFlip.fv = true;
            }
            height = -height;
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

        if (width < minimum_WH) {
            width = minimum_WH;
        }

        if (height < minimum_WH) {
            height = minimum_WH;
        }

        const alignPixel = this.alignPixel && !this.rotation; // 暂定有角度的时候就不进行对齐像素

        let isWidthFromZero = false;
        let isHeightFromZero = false;
        if (alignPixel) {
            width = Math.round(width);
            height = Math.round(height);
            if (width === 0) {
                width = 1;
                isWidthFromZero = true;
            }
            if (height === 0) {
                height = 1;
                isHeightFromZero = true;
            }
        }
        let targetRotation = this.rotation;
        const __shape = adapt2Shape(shape); // 可优化
        const targetFlipH = needFlipH ? !__shape.isFlippedHorizontal : !!__shape.isFlippedHorizontal;
        const targetFlipV = needFlipV ? !__shape.isFlippedVertical : !!__shape.isFlippedVertical;

        const cx1 = width / 2;
        const cy1 = height / 2;

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
        m1.trans(baseXY.x, baseXY.y);

        return {
            targetWidth: width,
            targetHeight: height,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix: m1,
            isWidthFromZero,
            isHeightFromZero,
            targetFlipH,
            targetFlipV
        };
    }

    private __getTargetXY(target: XY, refer: XY, base: Box) {
        const alignPixel = this.alignPixel && !this.rotation;
        if (alignPixel) {
            target.x = Math.round(target.x);
            target.y = Math.round(target.y);
        }

        const dx = target.x - refer.x;
        const dy = target.y - refer.y;

        return {
            x: base.baseX + dx,
            y: base.baseY + dy
        };
    }

    private __execute4singleLT() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseWidth, baseHeight } = base;

        if (this.isFixedRatio()) {
            const toRootInverse = new Matrix(this.toRoot.inverse);
            const pointOnShape = toRootInverse.computeCoord3(__livingPoint);

            let __tw = baseWidth - pointOnShape.x;
            let __th = baseHeight - pointOnShape.y;

            const __scaleX = __tw / baseWidth;
            const __scaleY = __th / baseHeight;

            if (__scaleX > __scaleY) {
                pointOnShape.y -= (__scaleX - __scaleY) * baseHeight;
            } else {
                pointOnShape.x -= (__scaleY - __scaleX) * baseWidth;
            }

            __livingPoint = this.toRoot.computeCoord3(pointOnShape);
        }

        const { x, y } = __livingPoint;

        const parent2root = this.parent2root;
        const toParent = this.toParent;

        const target = parent2root.inverseCoord(x, y);
        const saverb = toParent.computeCoord2(baseWidth, baseHeight);

        const matrixarr = toParent.toArray();
        matrixarr[4] = target.x;
        matrixarr[5] = target.y;

        const m2 = new Matrix(matrixarr);

        const wh = m2.inverseCoord(saverb.x, saverb.y);
        let w = wh.x;
        let h = wh.y;

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isWidthFromZero,
            isHeightFromZero,
            targetFlipV,
            targetFlipH
        } = this.__modifyTransform(shape, { x: base.baseX, y: base.baseY }, w, h);

        const xy1 = transformedMatrix.computeCoord(0, 0);

        this.fixRefer(shape, xy1);

        if (isWidthFromZero) {
            if (targetFlipH) {
                xy1.x--;
            } else {
                xy1.x++;
            }
        }

        if (isHeightFromZero) {
            if (targetFlipV) {
                xy1.y--;
            } else {
                xy1.y++;
            }
        }

        const targetXY = this.__getTargetXY(target, xy1, base);

        const transformUnits: ScaleUnit[] = [];
        transformUnits.push({
            shape,
            targetXY,
            targetWidth,
            targetHeight,
            baseWidth,
            baseHeight,
            needFlipH,
            needFlipV,
            targetRotation
        });

        (this.asyncApiCaller as Scaler).execute(transformUnits);
    }

    private __execute4singleRT() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseWidth, baseHeight } = base;

        if (this.isFixedRatio()) {
            const toRootInverse = new Matrix(this.toRoot.inverse);
            const pointOnShape = toRootInverse.computeCoord3(__livingPoint);

            let __tw = pointOnShape.x;
            let __th = baseHeight - pointOnShape.y;

            const __scaleX = __tw / baseWidth;
            const __scaleY = __th / baseHeight;

            if (__scaleX > __scaleY) {
                pointOnShape.y -= (__scaleX - __scaleY) * baseHeight;
            } else {
                pointOnShape.x += (__scaleY - __scaleX) * baseWidth;
            }

            __livingPoint = this.toRoot.computeCoord3(pointOnShape);
        }

        const { x, y } = __livingPoint;

        const parent2root = this.parent2root;
        const toParent = this.toParent;

        const target = parent2root.inverseCoord(x, y);
        const xy2 = toParent.inverseCoord(target.x, target.y);
        const savelb = toParent.computeCoord2(0, baseHeight);

        const __m = toParent;
        let w = xy2.x;
        let h = (__m.m00 * (savelb.y - target.y) - __m.m10 * (savelb.x - target.x)) / (__m.m00 * __m.m11 - __m.m10 * __m.m01);

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isWidthFromZero,
            isHeightFromZero,
            targetFlipH,
            targetFlipV
        } = this.__modifyTransform(shape, { x: base.baseX, y: base.baseY }, w, h);

        const xy1 = transformedMatrix.computeCoord(isWidthFromZero ? 0 : targetWidth, 0);

        this.fixRefer(shape, xy1);

        if (isHeightFromZero) {
            if (targetFlipV) {
                xy1.y--;
            } else {
                xy1.y++;
            }
        }

        const targetXY = this.__getTargetXY(target, xy1, base);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY,
            targetWidth,
            targetHeight,
            baseWidth,
            baseHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __execute4singleRB() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseWidth, baseHeight } = base;


        if (this.isFixedRatio()) {
            const toRootInverse = new Matrix(this.toRoot.inverse);
            const pointOnShape = toRootInverse.computeCoord3(__livingPoint);

            let __tw = pointOnShape.x;
            let __th = pointOnShape.y;

            const __scaleX = __tw / baseWidth;
            const __scaleY = __th / baseHeight;

            if (__scaleX > __scaleY) {
                pointOnShape.y += (__scaleX - __scaleY) * baseHeight;
            } else {
                pointOnShape.x += (__scaleY - __scaleX) * baseWidth;
            }

            __livingPoint = this.toRoot.computeCoord3(pointOnShape);
        }

        const __xy = this.tMatrix.computeCoord3(__livingPoint);

        let w = __xy.x;
        let h = __xy.y;

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isWidthFromZero,
            isHeightFromZero
        } = this.__modifyTransform(shape, { x: base.baseX, y: base.baseY }, w, h);

        const xy1 = transformedMatrix.computeCoord2(isWidthFromZero ? 0 : targetWidth, isHeightFromZero ? 0 : targetHeight);

        this.fixRefer(shape, xy1);

        const target = this.parent2root.inverseCoord(__livingPoint.x, __livingPoint.y);


        const targetXY = this.__getTargetXY(target, xy1, base);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY,
            targetWidth,
            targetHeight,
            baseWidth,
            baseHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
    }

    private __execute4singleLB() {
        const shape = this.shapes[0];

        const base = this.baseFrames.get(shape.id);
        if (!base) {
            console.error('!base');
            return;
        }

        let __livingPoint = { ...this.livingPoint };

        const { baseWidth, baseHeight } = base;

        if (this.isFixedRatio()) {
            const toRootInverse = new Matrix(this.toRoot.inverse);
            const pointOnShape = toRootInverse.computeCoord3(__livingPoint);

            let __tw = baseWidth - pointOnShape.x;
            let __th = pointOnShape.y;

            const __scaleX = __tw / baseWidth;
            const __scaleY = __th / baseHeight;

            if (__scaleX > __scaleY) {
                pointOnShape.y += (__scaleX - __scaleY) * baseHeight;
            } else {
                pointOnShape.x -= (__scaleY - __scaleX) * baseWidth;
            }

            __livingPoint = this.toRoot.computeCoord3(pointOnShape);
        }

        const { x, y } = __livingPoint;
        const parent2root = this.parent2root;
        const toParent = this.toParent;
        const target = parent2root.inverseCoord(x, y);
        const xy2 = toParent.inverseCoord(target.x, target.y);
        const savert = toParent.computeCoord(baseWidth, 0);
        let w = baseWidth - xy2.x;
        let h = (toParent.m00 * (savert.y - target.y) - toParent.m10 * (savert.x - target.x)) / (toParent.m10 * toParent.m01 - toParent.m00 * toParent.m11);

        const {
            targetWidth,
            targetHeight,
            needFlipH,
            needFlipV,
            targetRotation,
            transformedMatrix,
            isHeightFromZero,
            isWidthFromZero,
            targetFlipH
        } = this.__modifyTransform(shape, { x: base.baseX, y: base.baseY }, w, h);

        const xy1 = transformedMatrix.computeCoord(0, isHeightFromZero ? 0 : targetHeight);

        if (isWidthFromZero) {
            if (targetFlipH) {
                xy1.x--;
            } else {
                xy1.x++;
            }
        }

        this.fixRefer(shape, xy1);

        const targetXY = this.__getTargetXY(target, xy1, base);

        (this.asyncApiCaller as Scaler).execute([{
            shape,
            targetXY,
            targetWidth,
            targetHeight,
            baseWidth,
            baseHeight,
            needFlipH,
            needFlipV,
            targetRotation
        }]);
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

            if (needFlipH) {
                baseFrame.baseRotation = 360 - baseFrame.baseRotation;
            }
            if (needFlipV) {
                baseFrame.baseRotation = 360 - baseFrame.baseRotation;
            }

            const __m = new Matrix();
            const cx = width / 2;
            const cy = height / 2;
            __m.trans(-cx, -cy);
            if (baseFrame.baseRotation) {
                __m.rotate(baseFrame.baseRotation / 180 * Math.PI);
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

            targetXY.x = alignPixel ? Math.round(targetXY.x) : targetXY.x;
            targetXY.y = alignPixel ? Math.round(targetXY.y) : targetXY.y;

            _targetXY.x = baseFrame.baseX + (targetXY.x - _targetXY.x);
            _targetXY.y = baseFrame.baseY + (targetXY.y - _targetXY.y);

            transformUnits.push({
                shape,
                targetXY: _targetXY,
                targetWidth: width,
                targetHeight: height,
                baseWidth: baseFrame.baseWidth,
                baseHeight: baseFrame.baseHeight,
                needFlipH: needFlipH,
                needFlipV: needFlipV,
                targetRotation: baseFrame.baseRotation
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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
            const _height = box.height * (Math.abs(scaleY) - 1);
            referencePoint2.y -= _height / 2;
        }

        const transformUnits = this.generateTransformUnits(referencePoint1, referencePoint2, scaleX, scaleY, needFlipH, false);

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);

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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
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

        (this.asyncApiCaller as Scaler).execute(transformUnits);
    }
}