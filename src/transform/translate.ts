import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { FrameLike, Matrix, ShapeView, TranslateUnit, Transporter } from "@kcdesign/data";
import { XY } from "@/context/selection";

type OriginEnv = {
    env: ShapeView;
    index: number;
}

type OriginEnvs = Map<string, OriginEnv>;

type BaseFrame4Trans = {
    rootXY: XY;
    x: number;
    y: number;
    width: number;
    height: number;
    rotate: number;
    flipH: boolean;
    flipV: boolean;
    parentId: string;
    rotationMatrix: Matrix;
    offsetLivingPointX: number;
    offsetLivingPointY: number;
}

export class TranslateHandler extends TransformHandler {
    livingPoint: XY;
    fixedPoint: XY;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    boxOffsetLivingPointX: number = 0;
    boxOffsetLivingPointY: number = 0;

    livingBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };

    baseFrames4trans: Map<string, BaseFrame4Trans> = new Map();

    horFixedStatus: boolean = false;
    horFixedValue: number = 0;
    verFixedStatus: boolean = false;
    verFixedValue: number = 0;

    currentEnvId: string = '';
    exceptEnvs: ShapeView[] = [];
    originEnvs: OriginEnvs = new Map();

    shapesCopy: ShapeView[] = [];

    constructor(context: Context, shapes: ShapeView[], event: MouseEvent) {
        super(context, shapes, event);

        this.livingPoint = this.workspace.getRootXY(event);

        this.fixedPoint = { ...this.livingPoint };

        this.context.assist.set_collect_target(shapes);
        this.context.assist.set_trans_target(shapes);

        this.getFrames();
    }

    beforeTransform() {
        this.context.selection.unHoverShape();
        this.context.cursor.cursor_freeze(true);
        this.workspace.setCtrl('controller');
    }

    createApiCaller() {
        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page);

        this.workspace.translating(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    private getFrames() {
        const matrixParent2rootCache = new Map<string, Matrix>();
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const frame = shape.frame;

            const cx = frame.width / 2;
            const cy = frame.height / 2;

            const rotationMatrix = new Matrix();
            rotationMatrix.trans(-cx, -cy);
            if (shape.rotation) {
                rotationMatrix.rotate(shape.rotation / 180 * Math.PI);
            }
            if (shape.isFlippedHorizontal) {
                rotationMatrix.flipHoriz();
            }
            if (shape.isFlippedVertical) {
                rotationMatrix.flipVert();
            }
            rotationMatrix.trans(cx, cy);

            const m = new Matrix(rotationMatrix);
            m.trans(frame.x, frame.y);

            const parent = shape.parent!;

            let parent2rootMatrix = matrixParent2rootCache.get(parent.id)!;
            if (!parent2rootMatrix) {
                parent2rootMatrix = parent.matrix2Root();
                matrixParent2rootCache.set(parent.id, parent2rootMatrix);
            }

            m.multiAtLeft(parent2rootMatrix);

            const rootXY = m.computeCoord2(0, 0);

            this.baseFrames4trans.set(shape.id, {
                rootXY,
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                rotate: shape.rotation || 0,
                flipH: !!shape.isFlippedHorizontal,
                flipV: !!shape.isFlippedVertical,
                parentId: parent.id,
                rotationMatrix,
                offsetLivingPointX: 0,
                offsetLivingPointY: 0
            });

            if (rootXY.x < left) {
                left = rootXY.x;
            }
            if (rootXY.x > right) {
                right = rootXY.x;
            }
            if (rootXY.y < top) {
                top = rootXY.y;
            }
            if (rootXY.y > bottom) {
                bottom = rootXY.y;
            }

            const points = [{ x: frame.width, y: 0 }, { x: frame.width, y: frame.height }, { x: 0, y: frame.height }];
            for (let i = 0; i < 3; i++) {
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
        }

        this.originSelectionBox = {
            x: left,
            y: top,
            right,
            bottom,
            width: right - left,
            height: bottom - top,
        };

        this.baseFrames4trans.forEach(base => {
            base.offsetLivingPointX = base.rootXY.x - left;
            base.offsetLivingPointY = base.rootXY.y - top;
        })

        this.boxOffsetLivingPointX = this.livingPoint.x - left;
        this.boxOffsetLivingPointY = this.livingPoint.y - top;
    }

    excute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);

        this.updateBoxByAssist();

        this.__excute();

    }
    private updateBoxByAssist() {
        if (this.shiftStatus) {
            const dx = Math.abs(this.livingPoint.x - this.fixedPoint.x);
            const dy = Math.abs(this.livingPoint.y - this.fixedPoint.y);

            if (dx > dy) {
                this.livingBox.x = this.livingPoint.x - this.boxOffsetLivingPointX;
                this.livingBox.y = this.originSelectionBox.y;
            }
            else {
                this.livingBox.x = this.originSelectionBox.x;
                this.livingBox.y = this.livingPoint.y - this.boxOffsetLivingPointY;
            }
        }
        else {
            this.livingBox.x = this.livingPoint.x - this.boxOffsetLivingPointX;
            this.livingBox.y = this.livingPoint.y - this.boxOffsetLivingPointY;
        }
    }

    passiveExcute() {
        if (!this.asyncApiCaller) {
            return;
        }
        this.updateBoxByAssist();

        this.__excute();
    }

    private __excute() {
        const livingX = this.livingBox.x;
        const livingY = this.livingBox.y;

        const __root2parentMatrixCache = new Map<string, Matrix>();

        const isAlign = this.alignPixel;

        const transformUnits: TranslateUnit[] = [];
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const base = this.baseFrames4trans.get(shape.id);

            if (!base) {
                continue;
            }

            const frame = shape.frame;

            const __m = new Matrix();
            const cx = frame.width / 2;
            const cy = frame.height / 2;
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
            __m.trans(shape.frame.x, shape.frame.y);

            const _targetXY = __m.computeCoord2(0, 0);

            const parent = shape.parent!;
            let m = __root2parentMatrixCache.get(parent.id)!;
            if (!m) {
                m = new Matrix(parent.matrix2Root().inverse);
                __root2parentMatrixCache.set(parent.id, m);
            }

            const tx = isAlign ? Math.round(base.offsetLivingPointX + livingX) : base.offsetLivingPointX + livingX;
            const ty = isAlign ? Math.round(base.offsetLivingPointY + livingY) : base.offsetLivingPointY + livingY;

            const targetXY = m.computeCoord2(tx, ty);

            const x = shape.frame.x + (targetXY.x - _targetXY.x);
            const y = shape.frame.y + (targetXY.y - _targetXY.y);

            transformUnits.push({ shape, x, y });
        }

        (this.asyncApiCaller as Transporter).excute(transformUnits);
    }
}