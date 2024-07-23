import {
    ColVector3D,
    Line,
    makeShapeTransform1By2,
    makeShapeTransform2By1,
    Matrix,
    Rotator,
    ShapeView,
    Transform,
    TransformMode,
    TransformRaw,
} from "@kcdesign/data";
import { FrameLike, TransformHandler } from "./handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { getHorizontalAngle } from "@/utils/common";
import { Tool } from "@/context/tool";

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

export function rotate(shapes: ShapeView[], deg: number) {
    const transformList: { shape: ShapeView, transform: TransformRaw }[] = [];

    for (const shape of shapes) {
        const t = makeShapeTransform2By1(shape.transform);
        const { x, y, width, height } = shape.frame;

        const angle = deg % 360 * Math.PI / 180;
        const os = t.decomposeEuler().z;

        t.rotateAt({
            axis: Line.FromParallelZ(ColVector3D.FromXYZ(x + width / 2, y + height / 2, 0)),
            angle: angle - os,
            mode: TransformMode.Local,
        });

        transformList.push({
            shape,
            transform: makeShapeTransform1By2(t) as TransformRaw
        });
    }

    return transformList;
}

export class RotateHandler extends TransformHandler {
    readonly shapes: ShapeView[];
    readonly referencePoint: XY;
    readonly centerXY: XY;

    private livingPoint: XY;

    private initDeg: number = 0;

    originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    baseData: BaseData4Rotate = new Map();

    selectionTransform: Transform = new Transform();  // 选区的Transform
    selectionTransformInverse: Transform = new Transform();  // 选区Transform的逆
    selectionSize = { width: 0, height: 0 }; // 选区的size
    selectionCenter: ColVector3D = ColVector3D.FromXY(0, 0); // 选区的中点
    transformCache: Map<ShapeView, Transform> = new Map(); // transform缓存
    shapeTransformListInSelection: Transform[] = []; // shape在选区坐标系下的Transform
    cursorBeginAngle: number = 0; // 光标向量的初始角度（从选区的中点指向光标的向量，其与X轴的夹角）

    constructor(context: Context, event: MouseEvent, selected: ShapeView[]) {
        super(context, event);
        this.referencePoint = this.workspace.getRootXY(event);
        this.livingPoint = { ...this.referencePoint };

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
        this.updateCtrlView(1);
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

            const frame = shape.frame;
            const baseXYtoRoot = m1.computeCoord2(frame.x, frame.y);

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

            const points = [
                { x: frame.x + frame.width, y: frame.y },
                { x: frame.x + frame.width, y: frame.y + frame.height },
                { x: frame.x, y: frame.y + frame.height }
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
                // todo flip
                // flipH: !!shape.isFlippedHorizontal,
                // flipV: !!shape.isFlippedVertical,
                flipH: false,
                flipV: false,

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

        // 只选一个元素时，选区的Transform为元素自身的transform2FromRoot，选区大小为元素的size
        this.selectionTransform = this.shapes.length > 1
            ? new Transform().setTranslate(ColVector3D.FromXY(this.originSelectionBox.x, this.originSelectionBox.y))
            : this.shapes[0].transform2FromRoot.clone();
        this.selectionTransformInverse = this.selectionTransform.getInverse();
        this.selectionSize = this.shapes.length > 1 ? {
            width: this.originSelectionBox.width,
            height: this.originSelectionBox.height
        } : {
            width: this.shapes[0].frame.width,
            height: this.shapes[0].frame.height
        };
        this.selectionCenter = this.selectionTransform.transform(ColVector3D.FromXY(
            this.selectionSize.width / 2,
            this.selectionSize.height / 2
        )).col0;

        for (const shape of this.shapes) {
            if (!this.transformCache.has(shape.parent!)) {
                this.transformCache.set(shape.parent!, shape.parent!.transform2FromRoot.clone());
            }
        }
        this.shapeTransformListInSelection = this.shapes.length > 1 ? this.shapes.map((shape, i) => shape.transform2.clone() // 在Parent坐标系下
            .addTransform(this.transformCache.get(shape.parent!)!)  // 在Root坐标系下
            .addTransform(this.selectionTransform.getInverse())     // 在选区坐标系下
        ) : [new Transform()];

        this.cursorBeginAngle = this.cursorAngle; // 光标向量的初始角度
    }

    get cursorAngle() { // 获取光标向量（选区中点到光标的向量）相对x轴的夹角（-π ~ π）
        const cursorPoint = ColVector3D.FromXY(this.livingPoint.x, this.livingPoint.y); // 光标在Root坐标系下的坐标
        const cursorVector = cursorPoint.subtract(this.selectionCenter); // 光标向量
        const xVector = ColVector3D.FromXY(1, 0); // X轴方向向量
        let angle = xVector.angleTo(cursorVector); // 光标向量与x轴的夹角（0 ~ π）
        if ((xVector.cross(cursorVector) as ColVector3D).z < 0) angle = -angle; // 顺时针方向为负
        return angle
    }

    private __execute() {
        if (!this.shapes.length) {
            return;
        }

        const cursorAngle = this.cursorAngle; // 光标向量的角度
        let deltaAngle = cursorAngle - this.cursorBeginAngle; // 角度变化量

        const Q = (15 / 180 * Math.PI);

        if (this.shiftStatus) {
            let ex = deltaAngle % Q;
            if (ex < Q / 2) {
                deltaAngle = deltaAngle - ex;
            } else {
                deltaAngle = deltaAngle + (Q - ex);
            }
        }

        // 选区变换后的Transform
        const transformForSelection = this.selectionTransform.clone().rotateAt({
            axis: Line.FromParallelZ(ColVector3D.FromXYZ(this.selectionSize.width / 2, this.selectionSize.height / 2, 0)), // 选区的旋转轴（Z轴）（选区的中心点）
            angle: deltaAngle,
            mode: TransformMode.Local,
        });

        // shape最终的Transform
        const transformList = this.shapeTransformListInSelection.map((transform, i) => transform.clone() // 在选区坐标系下
            .addTransform(transformForSelection) // 在Root坐标系下
            .addTransform(this.transformCache.get(this.shapes[i].parent!)!.getInverse()) // 在Parent坐标系下
        );

        // 更新shape
        (this.asyncApiCaller as Rotator).execute(transformList.map((transform, i) => {
            return {
                shape: this.shapes[i],
                transform2: transform,
            }
        }));

        this.updateCtrlView(1);
    }
}