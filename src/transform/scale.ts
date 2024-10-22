import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import {
    ColVector3D, CtrlElementType, Matrix, Scaler, ShapeSize, ShapeView, SymbolView, Transform, UniformScaleUnit,
    ArtboradView, GroupShapeView
} from "@kcdesign/data";
import { XY } from "@/context/selection";
import { Action } from "@/context/tool";
import { Attribute } from "@/context/atrribute";
import { AnchorType } from "@/components/Document/Attribute/Scale/index";

type Box = {
    baseWidth: number;
    baseHeight: number;

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

    // base frame
    private originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    private baseFrames: BaseFrames = new Map();

    // align
    private horFixedStatus: boolean = false;
    private horFixedValue: number = 0;
    private verFixedStatus: boolean = false;
    private verFixedValue: number = 0;

    private readonly uniformScaleMode: boolean;

    selectionTransform: Transform = new Transform();  // 选区的Transform
    selectionTransformInverse: Transform = new Transform();  // 选区Transform的逆
    selectionSize = { width: 0, height: 0 }; // 选区的size

    transformCache: Map<ShapeView, Transform> = new Map(); // transform缓存
    transformInverseCache: Map<ShapeView, Transform> = new Map();

    shapeTransformListInSelection: Transform[] = []; // shape在选区坐标系下的Transform

    shapeSizeList: {
        width: number,
        height: number
    }[] = []; // shape的size列表

    constructor(context: Context, event: MouseEvent, selected: ShapeView[], ctrlElementType: CtrlElementType) {
        super(context, event);

        this.shapes = selected;

        this.ctrlElementType = ctrlElementType;
        this.livingPoint = this.workspace.getRootXY(event);
        this.getBaseFrames();

        context.assist.set_collect_target(selected);
        context.assist.set_trans_target(selected);

        this.uniformScaleMode = context.tool.action === Action.AutoK;
        if (selected.length === 1
            && (selected[0] instanceof ArtboradView || selected[0] instanceof SymbolView)
            && !!selected[0].childs.length
        ) this.collectSpark(selected[0]);
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
        if (!this.asyncApiCaller) return;
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
        if (event.altKey) {
            this.altStatus = true;
            this.passiveExecute();
        }
    }

    protected keyup(event: KeyboardEvent) {
        if (event.code === "ShiftLeft") {
            this.shiftStatus = false;
            this.passiveExecute();
        }
        if (event.code === "AltLeft") {
            this.altStatus = false;
            this.passiveExecute();
        }
    }

    private box2root(shape: ShapeView, parent2rootMatrixCache: Map<string, Matrix>) {
        const parent = shape.parent!;

        const frame = shape.frame;
        const baseWidth = frame.width;
        const baseHeight = frame.height;
        const _right = frame.x + baseWidth;
        const _bottom = frame.y + baseHeight;

        const points = [
            { x: frame.x, y: frame.y },
            { x: _right, y: frame.y },
            { x: _right, y: _bottom },
            { x: frame.x, y: _bottom }
        ];

        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        let m = shape.matrix2Parent();
        let _m = parent2rootMatrixCache.get(parent.id)!;
        if (!_m) {
            _m = parent.matrix2Root();
            parent2rootMatrixCache.set(parent.id, _m);
        }

        m.multiAtLeft(_m);

        for (let i = 0; i < 4; i++) {
            const p = m.computeCoord3(points[i]);

            if (p.x < left) {
                left = p.x;
            }
            if (p.x > right) {
                right = p.x;
            }
            if (p.y < top) {
                top = p.y;
            }
            if (p.y > bottom) {
                bottom = p.y;
            }
        }

        return {
            baseWidth,
            baseHeight,

            boxX: left,
            boxY: top,

            boxWidth: right - left,
            boxHeight: bottom - top
        };
    }

    private getBaseFrames() {
        const shapes = this.shapes;

        if (!shapes.length) return;

        const matrixParent2rootCache = new Map();

        const boundingBox2Root = this.box2root

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        const cache = this.transformCache;
        const inverseCache = this.transformInverseCache;
        const bases = this.baseFrames;

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const f = boundingBox2Root(shape, matrixParent2rootCache);

            if (f.boxX < left) left = f.boxX;
            if (f.boxY < top) top = f.boxY;

            const _right = f.boxX + f.boxWidth
            if (_right > right) right = _right;
            const _bottom = f.boxY + f.boxHeight;
            if (_bottom > bottom) bottom = _bottom;

            bases.set(shape.id, f);

            if (!cache.has(shape.parent!)) {
                const transform = shape.parent!.transform2FromRoot.clone();
                cache.set(shape.parent!, transform);
                inverseCache.set(shape.parent!, transform.getInverse());
            }
        }

        this.originSelectionBox = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };

        this.shapeSizeList = shapes.map(shape => ({ width: shape.frame.width, height: shape.frame.height }));

        const alpha = shapes[0];
        const alphaFrame = alpha.frame;
        const multi = shapes.length > 1;

        // 只选一个元素时，选区的Transform为元素自身的transform2FromRoot，选区大小为元素的size
        this.selectionTransform = multi
            ? new Transform().setTranslate(ColVector3D.FromXY(this.originSelectionBox.x, this.originSelectionBox.y))
            : new Transform().setTranslate(ColVector3D.FromXY(alphaFrame.x, alphaFrame.y)).addTransform(alpha.transform2FromRoot);

        const selectionInverse = this.selectionTransform.getInverse();
        this.selectionTransformInverse = selectionInverse;

        this.shapeTransformListInSelection = shapes.map((shape) => shape.transform2.clone()  // 在Parent坐标系下
            .addTransform(cache.get(shape.parent!)!)  // 在Root坐标系下
            .addTransform(selectionInverse))  // 在选区坐标系下

        this.selectionSize = multi
            ? {
                width: this.originSelectionBox.width,
                height: this.originSelectionBox.height
            }
            : {
                width: alpha.frame.width,
                height: alpha.frame.height
            };
    }

    private livingPointAlignByAssist() {
        const len = this.shapes.length;

        if (!len) return;

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

    private updateHorFixedStatus(livingX: number, assistResult: {
        x: number,
        sticked_by_x: boolean
    }) {
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

    private updateVerFixedStatus(livingY: number, assistResult: {
        y: number,
        sticked_by_y: boolean
    }) {
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
        if (!base) return;

        if (base.baseWidth === base.boxWidth) {
            this.fixToAlignWhileModifyRightOrLeft();
        } else if (base.baseWidth === base.boxHeight) {
            this.fixToAlignWhileModifyTopOrBottom();
        }
    }

    private fixToAlignWhileModifySingleTopOrBottom() {
        const shape = this.shapes[0];
        const base = this.baseFrames.get(shape.id);
        if (!base) return;

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

        const assist = { ...this.livingPoint };
        if (this.alignPixel) {
            assist.x = Math.round(assist.x);
            assist.y = Math.round(assist.y);
        }

        const target = this.context.assist.alignX(assist, [{ x, y: y1 }, { x, y: y2 }]);
        if (!target) return;

        this.updateHorFixedStatus(assist.x, target);
    }

    private fixToAlignWhileModifyTopOrBottom() {
        const y = this.livingPoint.y;
        const x1 = this.originSelectionBox.x;
        const x2 = this.originSelectionBox.right;

        const assist = { ...this.livingPoint };
        if (this.alignPixel) {
            assist.x = Math.round(assist.x);
            assist.y = Math.round(assist.y);
        }

        const assistResult = this.context.assist.alignY(assist, [{ x: x1, y }, { x: x2, y }]);
        if (!assistResult) return;

        this.updateVerFixedStatus(assist.y, assistResult);
    }

    private fixToAlignWhileModifyPoint() {
        let assist = { ...this.livingPoint };
        if (this.alignPixel) {
            assist.x = Math.round(assist.x);
            assist.y = Math.round(assist.y);
        }
        const assistResult = this.context.assist.alignXY(assist);
        if (!assistResult) return;

        this.updateHorFixedStatus(assist.x, assistResult);
        this.updateVerFixedStatus(assist.y, assistResult);
    }

    private collectSpark(env: GroupShapeView) {
        this.context.assist.collectSpark(env.childs);
    }

    private __execute() {
        if (this.context.tool.action === Action.AutoV) this.__execute_normal();
        else if (this.context.tool.action === Action.AutoK) this.__execute_uniform();
    }

    private __execute_normal() {
        if (!this.shapes.length) return;

        // 光标在选区坐标系下的坐标
        const cursorPointFromRoot = ColVector3D.FromXY(this.livingPoint.x, this.livingPoint.y);
        const cursorPointFromSelection = ColVector3D.FromMatrix(this.selectionTransformInverse.transform(cursorPointFromRoot));

        const { width: selectionWidth, height: selectionHeight } = this.selectionSize;

        // 选区的左上角和右下角（在原选区坐标系下）
        const ltPointForSelection = ColVector3D.FromXY(0, 0);
        const rbPointForSelection = ColVector3D.FromXY(selectionWidth, selectionHeight);

        const ratio = selectionWidth / selectionHeight;

        const CET = this.ctrlElementType;
        const ALT = this.altStatus;
        const SHIFT = this.shiftStatus || this.uniformScaleMode;

        switch (CET) {
            case CtrlElementType.RectLT: {
                const ox = ltPointForSelection.x;
                const oy = ltPointForSelection.y;
                const dx = Math.abs(cursorPointFromSelection.x - ltPointForSelection.x);
                const dy = Math.abs(cursorPointFromSelection.y - ltPointForSelection.y);
                ltPointForSelection.x = cursorPointFromSelection.x;
                ltPointForSelection.y = cursorPointFromSelection.y;
                if (SHIFT) {
                    if (dx > dy) {
                        const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                        const diffY = targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y);
                        ltPointForSelection.y -= diffY;
                    } else {
                        const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                        const diffX = targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x);
                        ltPointForSelection.x -= diffX;
                    }
                }
                if (ALT) {
                    const diffX = ltPointForSelection.x - ox;
                    const diffY = ltPointForSelection.y - oy;
                    rbPointForSelection.x -= diffX;
                    rbPointForSelection.y -= diffY;
                }
            }
                break;
            case CtrlElementType.RectTop: {
                const oy = ltPointForSelection.y;
                ltPointForSelection.y = cursorPointFromSelection.y;
                if (ALT) rbPointForSelection.y -= ltPointForSelection.y - oy;
                if (SHIFT) {
                    const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                    const diffX = (targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x)) / 2;
                    ltPointForSelection.x -= diffX;
                    rbPointForSelection.x += diffX;
                }
            }
                break;
            case CtrlElementType.RectRT: {
                const dx = Math.abs(cursorPointFromSelection.x - rbPointForSelection.x);
                const dy = Math.abs(cursorPointFromSelection.y - ltPointForSelection.y);
                const oy = ltPointForSelection.y;
                const ox = rbPointForSelection.x;
                ltPointForSelection.y = cursorPointFromSelection.y;
                rbPointForSelection.x = cursorPointFromSelection.x;
                if (SHIFT) {
                    if (dx > dy) {
                        const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                        const diffY = targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y);
                        ltPointForSelection.y -= diffY;
                    } else {
                        const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                        const diffX = targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x);
                        rbPointForSelection.x += diffX;
                    }
                }
                if (ALT) {
                    const diffX = rbPointForSelection.x - ox;
                    const diffY = ltPointForSelection.y - oy;
                    ltPointForSelection.x -= diffX;
                    rbPointForSelection.y -= diffY;
                }
            }
                break;
            case CtrlElementType.RectRight: {
                const ox = rbPointForSelection.x;
                rbPointForSelection.x = cursorPointFromSelection.x;
                if (ALT) ltPointForSelection.x -= rbPointForSelection.x - ox;
                if (SHIFT) {
                    const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                    const diffY = (targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y)) / 2;
                    ltPointForSelection.y -= diffY;
                    rbPointForSelection.y += diffY;
                }
            }
                break;
            case CtrlElementType.RectRB: {
                const ox = rbPointForSelection.x;
                const oy = rbPointForSelection.y;
                const dx = Math.abs(cursorPointFromSelection.x - rbPointForSelection.x);
                const dy = Math.abs(cursorPointFromSelection.y - rbPointForSelection.y);
                rbPointForSelection.x = cursorPointFromSelection.x;
                rbPointForSelection.y = cursorPointFromSelection.y;
                if (SHIFT) {
                    if (dx > dy) {
                        const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                        const diffY = targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y);
                        rbPointForSelection.y += diffY;
                    } else {
                        const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                        const diffX = targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x);
                        rbPointForSelection.x += diffX;
                    }
                }
                if (ALT) {
                    const diffX = rbPointForSelection.x - ox;
                    const diffY = rbPointForSelection.y - oy;
                    ltPointForSelection.x -= diffX;
                    ltPointForSelection.y -= diffY;
                }

            }
                break;
            case CtrlElementType.RectBottom: {
                const oy = rbPointForSelection.y;
                rbPointForSelection.y = cursorPointFromSelection.y;
                if (ALT) ltPointForSelection.y -= rbPointForSelection.y - oy;
                if (SHIFT) {
                    const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                    const diffX = (targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x)) / 2;
                    ltPointForSelection.x -= diffX;
                    rbPointForSelection.x += diffX;
                }
            }
                break;
            case CtrlElementType.RectLB:
                const dx = Math.abs(cursorPointFromSelection.x - ltPointForSelection.x);
                const dy = Math.abs(cursorPointFromSelection.y - rbPointForSelection.y);
                const ox = ltPointForSelection.x;
                const oy = rbPointForSelection.y;
                ltPointForSelection.x = cursorPointFromSelection.x;
                rbPointForSelection.y = cursorPointFromSelection.y;
                if (SHIFT) {
                    if (dx > dy) {
                        const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                        const diffY = targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y);
                        rbPointForSelection.y += diffY;
                    } else {
                        const targetWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                        const diffX = targetWidth - Math.abs(ltPointForSelection.x - rbPointForSelection.x);
                        ltPointForSelection.x -= diffX;
                    }
                }
                if (ALT) {
                    const diffX = ltPointForSelection.x - ox;
                    const diffY = rbPointForSelection.y - oy;
                    rbPointForSelection.x -= diffX;
                    ltPointForSelection.y -= diffY;
                }
                break;
            case CtrlElementType.RectLeft: {
                const ox = ltPointForSelection.x;
                ltPointForSelection.x = cursorPointFromSelection.x;
                if (ALT) rbPointForSelection.x -= ltPointForSelection.x - ox;
                if (SHIFT) {
                    const targetHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                    const diffY = (targetHeight - Math.abs(ltPointForSelection.y - rbPointForSelection.y)) / 2;
                    ltPointForSelection.y -= diffY;
                    rbPointForSelection.y += diffY;
                }
            }
                break;
        }

        // 选区变换后的大小
        const sizeForSelection = {
            width: rbPointForSelection.x - ltPointForSelection.x,
            height: rbPointForSelection.y - ltPointForSelection.y
        }
        // 选区变换后的Transform
        // Transform = T·R·K·S
        // 不修改旋转和斜切，只修改平移和缩放
        const transformForSelection = this.selectionTransform.clone();
        const __scale = transformForSelection.decomposeScale();

        transformForSelection.setTranslate(transformForSelection.transform(ltPointForSelection).col0);
        transformForSelection.setScale(new ColVector3D([
            sizeForSelection.width / this.selectionSize.width * (__scale.x > 0 ? 1 : -1),
            sizeForSelection.height / this.selectionSize.height * (__scale.y > 0 ? 1 : -1),
            1,
        ]));

        const units: {
            shape: ShapeView,
            size: ShapeSize,
            transform2: Transform,
            scale: {
                x: number,
                y: number
            }
        }[] = [];

        const shapes = this.shapes;
        const inverseCache = this.transformInverseCache;
        const sizes = this.shapeSizeList;

        this.shapeTransformListInSelection.forEach((transform, i) => {
            const shape = shapes[i];

            const t = transform.clone()
                .addTransform(transformForSelection)
                .addTransform(inverseCache.get(shape.parent!)!);

            const scale = t.decomposeScale();

            const oSize = sizes[i] as ShapeSize;
            const size = {
                width: oSize.width * Math.abs(scale.x),
                height: oSize.height * Math.abs(scale.y)
            } as ShapeSize;

            t.clearScaleSize();

            const __scale = {
                x: Math.abs(scale.x),
                y: Math.abs(scale.y)
            };

            units.push({ shape, size, transform2: t, scale: __scale });
        });

        if (this.alignPixel) {
            const bases = this.baseFrames;

            for (const unit of units) {
                const { shape, size, transform2, scale } = unit;

                const box = bases.get(shape.id);
                if (!box) continue;

                const decompose = transform2.clone()
                    .decomposeTranslate();

                const intX = Math.round(decompose.x);
                const intY = Math.round(decompose.y);
                const offsetX = intX - decompose.x;
                const offsetY = intY - decompose.y;

                if (offsetX || offsetY) {
                    transform2.translate(ColVector3D.FromXY(offsetX, offsetY));
                }

                if (size.width > 0 && size.width < 1) {
                    size.width = 1;
                } else {
                    const ow = size.width / scale.x;
                    size.width = Math.round(size.width);
                    scale.x = size.width / ow;
                }

                if (size.height > 0 && size.height < 1) {
                    size.height = 1;
                } else {
                    const oh = size.height / scale.y;
                    size.height = Math.round(size.height);
                    scale.y = size.height / oh;
                }
            }
        }

        // 更新shape
        (this.asyncApiCaller as Scaler).execute(units);

        this.updateCtrlView(1);
    }

    private __execute_uniform() {
        if (!this.shapes.length) return;

        const cursorPointFromRoot = ColVector3D.FromXY(this.livingPoint.x, this.livingPoint.y);
        const cursorPointFromSelection = ColVector3D.FromMatrix(this.selectionTransformInverse.transform(cursorPointFromRoot));

        const { width: selectionWidth, height: selectionHeight } = this.selectionSize;

        const ltPointForSelection = ColVector3D.FromXY(0, 0);
        const rbPointForSelection = ColVector3D.FromXY(selectionWidth, selectionHeight);

        const ratio = selectionWidth / selectionHeight;

        const CET = this.ctrlElementType;
        const ALT = this.altStatus;
        const attri = this.context.attr;
        // 左
        if (CET === CtrlElementType.RectLT         // 左上
            || CET === CtrlElementType.RectLB      // 左下
            || CET === CtrlElementType.RectLeft    // 左
        ) {
            const delta = cursorPointFromSelection.x - ltPointForSelection.x;
            ltPointForSelection.x = cursorPointFromSelection.x;

            if (ALT) {
                rbPointForSelection.x -= delta;
            }
            if (CET === CtrlElementType.RectLeft) {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                const dy = (selectionHeight - afterHeight) / 2;
                ltPointForSelection.y += dy;
                rbPointForSelection.y -= dy;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.Right);
            }
        }

        // 上
        if (CET === CtrlElementType.RectLT
            || CET === CtrlElementType.RectRT
            || CET === CtrlElementType.RectTop
        ) {
            const delta = cursorPointFromSelection.y - ltPointForSelection.y;
            ltPointForSelection.y = cursorPointFromSelection.y;

            if (ALT) rbPointForSelection.y -= delta;

            if (CET === CtrlElementType.RectTop) {
                const afterWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                const dx = (selectionWidth - afterWidth) / 2;
                ltPointForSelection.x += dx;
                rbPointForSelection.x -= dx;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.Bottom);
            } else if (CET === CtrlElementType.RectLT) {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                ltPointForSelection.y = selectionHeight - afterHeight;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.RightBottom);
            }
        }

        // 右
        if (CET === CtrlElementType.RectRT
            || CET === CtrlElementType.RectRB
            || CET === CtrlElementType.RectRight
        ) {
            const delta = cursorPointFromSelection.x - rbPointForSelection.x;
            rbPointForSelection.x = cursorPointFromSelection.x;

            if (ALT) ltPointForSelection.x -= delta;

            if (CET === CtrlElementType.RectRight) {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                const dy = (selectionHeight - afterHeight) / 2;
                ltPointForSelection.y += dy;
                rbPointForSelection.y -= dy;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.Left);
            } else if (CET === CtrlElementType.RectRT) {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                ltPointForSelection.y = selectionHeight - afterHeight;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.BottomLeft);
            }
        }

        // 下
        if (CET === CtrlElementType.RectLB
            || CET === CtrlElementType.RectRB
            || CET === CtrlElementType.RectBottom
        ) {
            const delta = cursorPointFromSelection.y - rbPointForSelection.y;
            rbPointForSelection.y = cursorPointFromSelection.y;

            if (ALT) ltPointForSelection.y -= delta;

            if (CET === CtrlElementType.RectBottom) {
                const afterWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                const dx = (selectionWidth - afterWidth) / 2;
                ltPointForSelection.x += dx;
                rbPointForSelection.x -= dx;
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.Top);
            } else {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                const dy = selectionHeight - afterHeight;
                rbPointForSelection.y = selectionHeight - dy;
            }
            if (CET === CtrlElementType.RectLB) {
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.RightTop);
            } else if (CET === CtrlElementType.RectRB) {
                attri.notify(Attribute.ANCHOR_CHANGE, AnchorType.LeftTop);
            }
        }

        const sizeForSelection = {
            width: rbPointForSelection.x - ltPointForSelection.x,
            height: rbPointForSelection.y - ltPointForSelection.y
        }

        const transformForSelection = this.selectionTransform.clone();
        const __scale = transformForSelection.decomposeScale();

        if (__scale.x < 0.02 || __scale.y < 0.02) return;

        transformForSelection.setTranslate(transformForSelection.transform(ltPointForSelection).col0);
        transformForSelection.setScale(new ColVector3D([
            sizeForSelection.width / this.selectionSize.width * (__scale.x > 0 ? 1 : -1),
            sizeForSelection.height / this.selectionSize.height * (__scale.y > 0 ? 1 : -1),
            1,
        ]));

        const units: UniformScaleUnit[] = [];

        const shapes = this.shapes;
        const inverseCache = this.transformInverseCache;
        const sizes = this.shapeSizeList;

        this.shapeTransformListInSelection.forEach((transform, i) => {
            const shape = shapes[i];

            const t = transform.clone()
                .addTransform(transformForSelection)
                .addTransform(inverseCache.get(shape.parent!)!);

            const scale = t.decomposeScale();
            const oSize = sizes[i] as ShapeSize;
            const size = {
                width: oSize.width * Math.abs(scale.x),
                height: oSize.height * Math.abs(scale.y)
            } as ShapeSize;

            t.clearScaleSize();

            const __scale = {
                x: Math.abs(scale.x),
                y: Math.abs(scale.y)
            };

            units.push({ shape, size, transform: t, decomposeScale: __scale });
        });

        (this.asyncApiCaller as Scaler).executeUniform(units, sizeForSelection.width / this.selectionSize.width * (__scale.x > 0 ? 1 : -1));

        this.updateCtrlView(1);
    }
}