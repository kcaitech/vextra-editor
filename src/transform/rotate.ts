import {
    adapt2Shape,
    ColVector3D,
    Matrix, Matrix2,
    RotateUnit,
    Rotator,
    ShapeType,
    ShapeView,
    Transform,
    TransformMode,
} from "@kcdesign/data";
import {FrameLike, TransformHandler} from "./handler";
import {XY} from "@/context/selection";
import {Context} from "@/context";
import {getHorizontalAngle} from "@/utils/common";

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
    readonly shapes: ShapeView[];
    readonly referencePoint: XY;
    readonly centerXY: XY;

    private livingPoint: XY;

    private initDeg: number = 0;

    originSelectionBox: FrameLike = {x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0};
    baseData: BaseData4Rotate = new Map();

    beginTransform2List: Transform[] = [];
    beginTransform2ForSelection: Transform = new Transform();

    constructor(context: Context, event: MouseEvent, selected: ShapeView[]) {
        super(context, event);
        this.referencePoint = this.workspace.getRootXY(event);
        this.livingPoint = {...this.referencePoint};

        this.shapes = selected;

        this.getBaseData();

        this.centerXY = {
            x: (this.originSelectionBox.x + this.originSelectionBox.right) / 2,
            y: (this.originSelectionBox.y + this.originSelectionBox.bottom) / 2
        }

        if (this.shapes.length === 1) {
            this.initDeg = getHorizontalAngle(this.centerXY, this.livingPoint);
        }
    }

    createApiCaller() {
        this.asyncApiCaller = new Rotator(this.context.coopRepo, this.context.data, this.page);

        this.workspace.rotating(true);
        this.workspace.setSelectionViewUpdater(false);
    }

    fulfil() {
        this.workspace.rotating(false);
        this.workspace.setSelectionViewUpdater(true);

        super.fulfil();
    }

    // 执行主体
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
                {x: frame.width, y: 0},
                {x: frame.width, y: frame.height},
                {x: 0, y: frame.height}
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

        // 开始旋转时选区的transform2
        this.beginTransform2ForSelection = new Transform({
            matrix: new Matrix2([4, 4], [
                1, 0, 0, this.originSelectionBox.x,
                0, 1, 0, this.originSelectionBox.y,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ])
        });

        // 开始旋转时所有shape的transform2列表
        this.beginTransform2List = this.shapes.map(shape => shape.transform2.clone().translate({
            vector: new ColVector3D([-this.originSelectionBox.x, -this.originSelectionBox.y, 0]),
            mode: TransformMode.Local,
        }));
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
    }

    /**
     * todo 这个函数可优化，必要性小
     * @private
     */
    private __execute4single() {
        let d = getHorizontalAngle(this.centerXY, this.livingPoint);

        if (this.shiftStatus) {
            const exD = d % 15;
            if (exD) {
                if (exD < 7.5) {
                    d -= exD;
                } else {
                    d += 15 - exD;
                }
            }
            const exInit = this.initDeg % 15;
            if (exInit) {
                if (exInit < 7.5) {
                    this.initDeg -= exInit;
                } else {
                    this.initDeg += 15 - exInit;
                }
            }

        }

        let deg = d - this.initDeg;

        this.initDeg = d;

        const shape = this.shapes[0];

        if (shape.isFlippedHorizontal) {
            deg = -deg;
        }
        if (shape.isFlippedVertical) {
            deg = -deg;
        }

        const base = this.baseData.get(shape.id);
        if (!base) {
            return;
        }

        const currentRotate = (adapt2Shape(shape).rotation || 0);
        const targetRotate = currentRotate + deg;

        const beginTransform2 = this.beginTransform2List[0];
        beginTransform2.setRotateZ(targetRotate * Math.PI / 180);
        const translate = beginTransform2.clone().preTranslate(
            new ColVector3D([-base.width / 2, -base.height / 2, 0])
        ).translate({
            vector: new ColVector3D([
                base.width / 2 + this.originSelectionBox.x,
                base.height / 2 + this.originSelectionBox.y,
                0,
            ]),
            mode: TransformMode.Local,
        }).decomposeTranslate();

        (this.asyncApiCaller as Rotator).execute4multi([{
            shape,
            x: translate.x,
            y: translate.y,
            targetRotate: targetRotate,
        }]);
    }

    private __execute4multi() {
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
            } else if (d < 0) {
                deg -= d;
            }
        }

        const beginTransform2ForSelection = this.beginTransform2ForSelection.clone();
        beginTransform2ForSelection.setRotateZ(deg * Math.PI / 180).preTranslate(
            new ColVector3D([-this.originSelectionBox.width / 2, -this.originSelectionBox.height / 2, 0])
        ).translate({
            vector: new ColVector3D([this.originSelectionBox.width / 2, this.originSelectionBox.height / 2, 0]),
            mode: TransformMode.Local,
        });

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
                m.rotate(targetRotate / 180 * Math.PI);
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

            const beginTransform2 = this.beginTransform2List[i];
            const transform2 = beginTransform2.clone();
            transform2.addTransform(beginTransform2ForSelection);
            const translate = transform2.decomposeTranslate();

            rotateUnits.push({
                shape,
                x: translate.x,
                y: translate.y,
                targetRotate,
            })
        }

        (this.asyncApiCaller as Rotator).execute4multi(rotateUnits);
    }
}