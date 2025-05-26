/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    ColVector3D,
    Matrix, PathShapeView,
    Rotator,
    ShapeView,
    Transform,
} from "@kcdesign/data";
import { BoundHandler, FrameLike } from "./handler";
import { XY } from "@/context/selection";
import { Context } from "@/context";
import { is_straight } from "@/utils/attri_setting";

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
    const transformList: { shape: ShapeView, transform: Transform }[] = [];

    for (const shape of shapes) {
        const t = (shape.transform.clone());
        const { x, y, width, height } = shape.frame;
        const oa = deg % 360 * Math.PI / 180;
        const os = t.decomposeRotate();
        let angle = oa - os;

        if (is_straight(shape)) {
            const points = (shape as PathShapeView).segments[0].points;
            const p1 = points[0];
            const p2 = points[1];
            const m = new Matrix();
            m.preScale(shape.size.width, shape.size.height);
            const lt = m.computeCoord3(p1);
            const rb = m.computeCoord3(p2);
            let os2 = Math.atan2(rb.y - lt.y, rb.x - lt.x);
            if (os2 < 0) os2 = Math.PI * 2 + os2;
            angle -= os2;
        }

        t.rotateInLocal(angle, x + width / 2, y + height / 2);

        transformList.push({
            shape,
            transform: (t)
        });
    }

    return transformList;
}

export class RotateHandler extends BoundHandler {
    readonly shapes: ShapeView[];
    readonly referencePoint: XY;
    readonly centerXY: XY;

    private livingPoint: XY;

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

        const shapes = this.shapes;

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const parent = shape.parent!;
            const m1 = shape.matrix2Parent();

            let m2 = matrixParent2rootCache.get(parent.id)!;
            if (!m2) {
                m2 = (parent.matrix2Root()).toMatrix();
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

        const alpha = shapes[0];
        const alphaFrame = alpha.frame;
        const multi = shapes.length > 1;

        // 只选一个元素时，选区的Transform为元素自身的transform2FromRoot，选区大小为元素的size
        this.selectionTransform = multi
            ? new Transform().setTranslate(ColVector3D.FromXY(this.originSelectionBox.x, this.originSelectionBox.y))
            : new Transform().setTranslate(ColVector3D.FromXY(alphaFrame.x, alphaFrame.y)).addTransform((alpha.matrix2Root())); // todo 考虑让 transform2FromRoot 为问题因素

        this.selectionTransformInverse = this.selectionTransform.getInverse();
        this.selectionSize = multi ? {
            width: this.originSelectionBox.width,
            height: this.originSelectionBox.height
        } : {
            width: alphaFrame.width,
            height: alphaFrame.height
        };
        const center = this.selectionTransform.transform(ColVector3D.FromXY(this.selectionSize.width / 2, this.selectionSize.height / 2));
        this.selectionCenter.x = center.x
        this.selectionCenter.y = center.y
        for (const shape of shapes) {
            if (!this.transformCache.has(shape.parent!)) {
                this.transformCache.set(shape.parent!, (shape.parent!.matrix2Root()));
            }
        }
        // this.shapeTransformListInSelection = multi ? shapes.map((shape, i) => shape.transform2.clone() // 在Parent坐标系下
        //     .addTransform(this.transformCache.get(shape.parent!)!)  // 在Root坐标系下
        //     .addTransform(this.selectionTransform.getInverse())     // 在选区坐标系下
        // ) : [new Transform()];
        this.shapeTransformListInSelection = shapes.map((shape, i) => (shape.transform.clone())
            .addTransform(this.transformCache.get(shape.parent!)!)
            .addTransform(this.selectionTransform.getInverse())
        );

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
        if (!this.shapes.length) return;

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
        // const transformForSelection = this.selectionTransform.clone().rotateAt({
        //     axis: Line.FromParallelZ(ColVector3D.FromXYZ(this.selectionSize.width / 2, this.selectionSize.height / 2, 0)), // 选区的旋转轴（Z轴）（选区的中心点）
        //     angle: deltaAngle,
        //     mode: TransformMode.Local,
        // });
        const transformForSelection = this.selectionTransform.clone().rotateInLocal(deltaAngle, this.selectionSize.width / 2, this.selectionSize.height / 2);

        const units: { shape: ShapeView, transform2: Transform }[] = [];
        const __is_locked = this.isLocked.bind(this);
        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            if (__is_locked(shape)) continue;
            const transform = this.shapeTransformListInSelection[i].clone();
            transform.addTransform(transformForSelection)
                .addTransform(this.transformCache.get(shape.parent!)!.getInverse());
            units.push({ shape, transform2: transform });
        }

        // 更新shape
        (this.asyncApiCaller as Rotator).execute(units);

        this.updateCtrlView(1);
    }
}