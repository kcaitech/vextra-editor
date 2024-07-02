import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import {
    ColVector3D,
    CtrlElementType,
    Scaler, ShapeSize,
    ShapeView,
    Transform
} from "@kcdesign/data";
import { XY } from "@/context/selection";
import { boundingBox2Root } from "@/utils/common";

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

    // cache
    private __baseFramesCache: BaseFrames = new Map();

    selectionTransform: Transform = new Transform();  // 选区的Transform
    selectionTransformInverse: Transform = new Transform();  // 选区Transform的逆
    selectionSize = { width: 0, height: 0 }; // 选区的size
    transformCache: Map<ShapeView, Transform> = new Map(); // transform缓存
    shapeTransformListInSelection: Transform[] = []; // shape在选区坐标系下的Transform
    shapeSizeList: { width: number, height: number }[] = []; // shape的size列表

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

    private getBaseFrames() {
        const matrixParent2rootCache = new Map();

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            const cache = this.__baseFramesCache.get(shape.id);

            if (cache) continue;

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

        this.shapeSizeList = this.shapes.map(shape => {
            return { width: shape.size.width, height: shape.size.height }
        });

        // 只选一个元素时，选区的Transform为元素自身的transform2FromRoot，选区大小为元素的size
        this.selectionTransform = this.shapes.length > 1
            ? new Transform().setTranslate(ColVector3D.FromXY(this.originSelectionBox.x, this.originSelectionBox.y))
            : this.shapes[0].transform2FromRoot.clone();

        this.selectionTransformInverse = this.selectionTransform.getInverse();

        this.selectionSize = this.shapes.length > 1 ? {
            width: this.originSelectionBox.width,
            height: this.originSelectionBox.height
        } : {
            width: this.shapes[0].size.width,
            height: this.shapes[0].size.height
        };

        for (const shape of this.shapes) {
            if (!this.transformCache.has(shape.parent!)) {
                this.transformCache.set(shape.parent!, shape.parent!.transform2FromRoot.clone());
            }
        }
        this.shapeTransformListInSelection = this.shapes.length > 1
            ? this.shapes.map((shape, i) => shape.transform2.clone()  // 在Parent坐标系下
                .addTransform(this.transformCache.get(shape.parent!)!)  // 在Root坐标系下
                .addTransform(this.selectionTransform.getInverse()))  // 在选区坐标系下
            : [new Transform()];
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

        const assist = { ...this.livingPoint };
        if (this.alignPixel) {
            assist.x = Math.round(assist.x);
            assist.y = Math.round(assist.y);
        }

        const target = this.context.assist.alignX(assist, [{ x, y: y1 }, { x, y: y2 }]);
        if (!target) {
            return;
        }

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
        if (!assistResult) {
            return;
        }

        this.updateVerFixedStatus(assist.y, assistResult);
    }

    private fixToAlignWhileModifyPoint() {
        let assist = { ...this.livingPoint };
        if (this.alignPixel) {
            assist.x = Math.round(assist.x);
            assist.y = Math.round(assist.y);
        }
        const assistResult = this.context.assist.alignXY(assist);
        if (!assistResult) {
            return;
        }

        this.updateHorFixedStatus(assist.x, assistResult);
        this.updateVerFixedStatus(assist.y, assistResult);
    }

    private __execute() {
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
        const SHIFT = this.shiftStatus;

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
            if (SHIFT) {
                const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                const dy = (selectionHeight - afterHeight) / 2;

                ltPointForSelection.y += dy;
                rbPointForSelection.y -= dy;
            }
        }

        // 上
        if (CET === CtrlElementType.RectLT         // 左上
            || CET === CtrlElementType.RectRT      // 右上
            || CET === CtrlElementType.RectTop     // 上
        ) {
            const delta = cursorPointFromSelection.y - ltPointForSelection.y;
            ltPointForSelection.y = cursorPointFromSelection.y;

            if (ALT) {
                rbPointForSelection.y -= delta;
            }
            if (SHIFT) {
                const afterWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;
                const dx = (selectionWidth - afterWidth) / 2;

                ltPointForSelection.x += dx;
                rbPointForSelection.x -= dx;
            }
        }

        // 右
        if (CET === CtrlElementType.RectRT         // 右上
            || CET === CtrlElementType.RectRB      // 右下
            || CET === CtrlElementType.RectRight   // 右
        ) {
            const delta = cursorPointFromSelection.x - rbPointForSelection.x;
            rbPointForSelection.x = cursorPointFromSelection.x;

            if (ALT) {
                ltPointForSelection.x -= delta;
            }
            if (SHIFT) {
                if (CET === CtrlElementType.RectRight) {
                    const afterHeight = Math.abs(ltPointForSelection.x - rbPointForSelection.x) / ratio;
                    const dy = (selectionHeight - afterHeight) / 2;

                    ltPointForSelection.y += dy;
                    rbPointForSelection.y -= dy;
                }
            }
        }

        // 下
        if (CET === CtrlElementType.RectLB         // 左下
            || CET === CtrlElementType.RectRB      // 右下
            || CET === CtrlElementType.RectBottom  // 下
        ) {
            const delta = cursorPointFromSelection.y - rbPointForSelection.y;
            rbPointForSelection.y = cursorPointFromSelection.y;

            if (ALT) {
                ltPointForSelection.y -= delta;
            }

            if (SHIFT) {
                if (CET === CtrlElementType.RectBottom) {
                    const afterWidth = Math.abs(ltPointForSelection.y - rbPointForSelection.y) * ratio;

                    const dx = (selectionWidth - afterWidth) / 2;

                    ltPointForSelection.x += dx;
                    rbPointForSelection.x -= dx;
                }
            }
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
        transformForSelection.setTranslate(this.selectionTransform.transform(ltPointForSelection).col0);
        transformForSelection.setScale(new ColVector3D([
            sizeForSelection.width / this.selectionSize.width * (this.selectionTransform.decomposeScale().x > 0 ? 1 : -1),
            sizeForSelection.height / this.selectionSize.height * (this.selectionTransform.decomposeScale().y > 0 ? 1 : -1),
            1,
        ]));

        const units: {
            shape: ShapeView,
            size: ShapeSize,
            transform2: Transform,
            scale: { x: number, y: number }
        }[] = [];

        const shapes = this.shapes;
        const cache = this.transformCache;
        const sizes = this.shapeSizeList;

        this.shapeTransformListInSelection.forEach((transform, i) => {
            const shape = shapes[i];

            const t = transform.clone()
                .addTransform(transformForSelection)
                .addTransform(cache.get(shape.parent!)!.getInverse());

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
            for (const unit of units) {
                const { shape, size, transform2 } = unit;

                const decompose = transform2.clone().decomposeTranslate();
                const intX = Math.round(decompose.x);
                const intY = Math.round(decompose.y);
                const offsetX = intX - decompose.x;
                const offsetY = intY - decompose.y;

                if (offsetX || offsetY) {
                    transform2.translate(ColVector3D.FromXY(offsetX, offsetY));
                }
            }
        }

        // 更新shape
        (this.asyncApiCaller as Scaler).execute(units);

        this.updateCtrlView(1);
    }
}