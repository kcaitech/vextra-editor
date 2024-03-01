import { CtrlElementType, FrameLike, Matrix, RotateUnit, Rotator, ShapeType, ShapeView } from "@kcdesign/data";
import { TransformHandler } from "./handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { getHorizontalAngle } from "@/utils/common";

type Base4Rotation = {
    XYtoRoot: XY;

    x: number,
    y: number,
    width: number,
    height: number,

    rotate: number;
    flipH: boolean;
    flipV: boolean;

    root2parentMatrix: Matrix;
};

type BaseData4Rotate = Map<string, Base4Rotation>;

export class RotateHandler extends TransformHandler {
    ctrlElementType: CtrlElementType;
    referencePoint: XY;
    livingPoint: XY;
    centerXY: XY;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    baseData: BaseData4Rotate = new Map();

    constructor(context: Context, selected: ShapeView[], event: MouseEvent, ctrlElementType: CtrlElementType) {
        super(context, selected, event);
        this.ctrlElementType = ctrlElementType;
        this.referencePoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.referencePoint };

        this.getBaseData();

        this.centerXY = {
            x: (this.originSelectionBox.x + this.originSelectionBox.right) / 2,
            y: (this.originSelectionBox.y + this.originSelectionBox.bottom) / 2
        }
    }

    createApiCaller() {
        this.asyncApiCaller = new Rotator(this.context.coopRepo, this.context.data, 'rotate', this.page);

        this.workspace.rotating(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    fulfil() {
        this.__fulfil();

        this.workspace.rotating(false);
        this.workspace.setSelectionViewUpdater(true);

        return undefined;
    }

    // 执行主体
    excute(event: MouseEvent) {
        this.livingPoint = this.workspace.getRootXY(event);

        this.__excute();
    }

    passiveExcute() {
        this.__excute();
    }

    private getBaseData() {
        const matrixParent2rootCache: Map<string, Matrix> = new Map();
        const matrixRoot2ParentCache: Map<string, Matrix> = new Map();

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            const parent = shape.parent!;

            const m1 = shape.matrix2Parent();

            let m2 = matrixParent2rootCache.get(parent.id)!;
            if (!m2) {
                m2 = parent.matrix2Root();
                matrixParent2rootCache.set(parent.id, m2);
            }

            m1.multiAtLeft(m2);

            const baseXYtoRoot = m1.computeCoord2(0, 0);

            if (baseXYtoRoot.x < left) {
                left = baseXYtoRoot.x;
            }

            if (baseXYtoRoot.x > right) {
                right = baseXYtoRoot.x;
            }

            if (baseXYtoRoot.y < top) {
                top = baseXYtoRoot.y;
            }

            if (baseXYtoRoot.y > bottom) {
                bottom = baseXYtoRoot.y;
            }

            const frame = shape.frame;
            const points = [
                { x: frame.width, y: 0 },
                { x: frame.width, y: frame.height },
                { x: 0, y: frame.height }
            ];

            for (let i = 0; i < 3; i++) {
                const point = m1.computeCoord3(points[i]);
                if (point.x < left) {
                    left = point.x;
                }

                if (point.x > right) {
                    right = point.x;
                }

                if (point.y < top) {
                    top = point.y;
                }

                if (point.y > bottom) {
                    bottom = point.y;
                }

            }

            let m3 = matrixRoot2ParentCache.get(parent.id)!;
            if (!m3) {
                m3 = new Matrix(m2.inverse);
                matrixRoot2ParentCache.set(parent.id, m3);
            }

            this.baseData.set(shape.id, {
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,

                XYtoRoot: baseXYtoRoot,

                rotate: shape.rotation || 0,
                flipH: !!shape.isFlippedHorizontal,
                flipV: !!shape.isFlippedVertical,

                root2parentMatrix: m3
            });
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

    private __excute() {
        if (!this.shapes.length) {
            return;
        }

        if (this.shapes.length === 1) {

        }
        else {
            this.__excute4multi();
        }
    }

    private __excute4multi() {
        const center = this.centerXY;

        const d1 = getHorizontalAngle(center, this.referencePoint);
        const d2 = getHorizontalAngle(center, this.livingPoint);
        let deg = d2 - d1;
        if (deg < 0) {
            deg = deg + 360;
        }

        if (this.shiftStatus) {
            const d = deg % 15;
            if (d > 0) {
                deg += (15 - d);
            }
            else if (d < 0) {
                deg -= d;
            }
        }

        const rotateMatrix = new Matrix();
        rotateMatrix.rotate(deg * (Math.PI / 180), center.x, center.y);

        const rotateUnits: RotateUnit[] = [];

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];

            if (shape.isVirtualShape) {
                continue;
            }

            if (shape.type === ShapeType.Contact) {
                continue;
            }

            const base = this.baseData.get(shape.id);

            if (!base) {
                continue;
            }
            const targetXY = rotateMatrix.computeCoord3(base.XYtoRoot);

            const common = base.root2parentMatrix.computeCoord3(targetXY);

            if (base.flipH) {
                deg = -deg;
            }
            if (base.flipV) {
                deg = -deg;
            }

            const targetRotate = (base.rotate || 0) + deg;

            const m = new Matrix();
            const cx = base.width / 2;
            const cy = base.height / 2;
            m.trans(-cx, -cy);
            if (targetRotate) {
                m.rotate(targetRotate / 360 * 2 * Math.PI);
            }
            if (base.flipH) {
                m.flipHoriz();
            }
            if (base.flipV) {
                m.flipVert();
            }
            m.trans(cx, cy);
            m.trans(base.x, base.y);

            const self = m.computeCoord2(0, 0);

            const dx = common.x - self.x;
            const dy = common.y - self.y;

            rotateUnits.push({
                shape,
                x: base.x + dx,
                y: base.y + dy,
                targetRotate
            })
        }

        (this.asyncApiCaller as Rotator).excute4multi(rotateUnits);
    }
}