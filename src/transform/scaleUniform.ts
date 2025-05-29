/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { FrameLike, TransformHandler } from "./handler";
import { ColVector3D, Matrix, Scaler, ShapeSize, ShapeView, Transform, UniformScaleUnit } from "@kcdesign/data";
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

/**
 * @description 涉及到等比缩放的属性
 * transform
 * size
 * 圆角
 * 文字：字号、行高、字间距、段落间距
 * 描边粗细
 * 阴影offsetX、offsetY、blur、spread
 * 高斯模糊半径
 * 背景模糊半径
 */
export class ScaleUniformer extends TransformHandler {
    private readonly shapes: ShapeView[];
    private readonly anchorType: AnchorType;
    private originSelectionBox: FrameLike = { x: 0, y: 0, right: 0, bottom: 0, height: 0, width: 0 };
    private baseFrames: BaseFrames = new Map();


    selectionTransform: Transform = new Transform();
    selectionTransformInverse: Transform = new Transform();
    selectionSize = { width: 0, height: 0 };

    transformCache: Map<ShapeView, Transform> = new Map();
    transformInverseCache: Map<ShapeView, Transform> = new Map();

    shapeTransformListInSelection: Transform[] = [];

    shapeSizeList: {
        width: number,
        height: number
    }[] = [];

    constructor(context: Context, anchorType: AnchorType) {
        super(context);
        this.shapes = context.selection.selectedShapes;
        this.anchorType = anchorType;
        this.getBaseFrames();
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

    execute(ratio: number) {
        if (!this.shapes.length) return;

        const { width: selectionWidth, height: selectionHeight } = this.selectionSize;

        const ltPointForSelection = ColVector3D.FromXY(0, 0);
        const rbPointForSelection = ColVector3D.FromXY(selectionWidth, selectionHeight);

        const fixWidth = (ratio - 1) * selectionWidth;
        const fixHeight = (ratio - 1) * selectionHeight;

        const ANCHOR = this.anchorType;

        if (ANCHOR === AnchorType.LeftTop) {
            rbPointForSelection.x += fixWidth;
            rbPointForSelection.y += fixHeight;
        } else if (ANCHOR === AnchorType.Top) {
            ltPointForSelection.x -= fixWidth / 2;
            rbPointForSelection.x += fixWidth / 2;
            rbPointForSelection.y += fixHeight;
        } else if (ANCHOR === AnchorType.RightTop) {
            ltPointForSelection.x -= fixWidth;
            rbPointForSelection.y += fixHeight;
        } else if (ANCHOR === AnchorType.Left) {
            ltPointForSelection.y -= fixHeight / 2;
            rbPointForSelection.x += fixWidth;
            rbPointForSelection.y += fixHeight / 2;
        } else if (ANCHOR === AnchorType.Center) {
            ltPointForSelection.x -= fixWidth / 2;
            ltPointForSelection.y -= fixHeight / 2;
            rbPointForSelection.x += fixWidth / 2;
            rbPointForSelection.y += fixHeight / 2;
        } else if (ANCHOR === AnchorType.Right) {
            ltPointForSelection.x -= fixWidth;
            ltPointForSelection.y -= fixHeight / 2;
            rbPointForSelection.y += fixHeight / 2;
        } else if (ANCHOR === AnchorType.BottomLeft) {
            ltPointForSelection.y -= fixHeight;
            rbPointForSelection.x += fixWidth;
        } else if (ANCHOR === AnchorType.Bottom) {
            ltPointForSelection.x -= fixWidth / 2;
            ltPointForSelection.y -= fixHeight;
            rbPointForSelection.x += fixWidth / 2;
        } else {
            ltPointForSelection.x -= fixWidth;
            ltPointForSelection.y -= fixHeight;
        }

        const sizeForSelection = {
            width: rbPointForSelection.x - ltPointForSelection.x,
            height: rbPointForSelection.y - ltPointForSelection.y
        }

        const transformForSelection = this.selectionTransform.clone();
        const __scale = transformForSelection.decomposeScale();

        transformForSelection.setTranslate(transformForSelection.transform(ltPointForSelection));
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

            const __scale = { x: Math.abs(scale.x), y: Math.abs(scale.y) };

            units.push({ shape, size, transform: t, decomposeScale: __scale });
        });

        (this.asyncApiCaller as Scaler).executeUniform(units, sizeForSelection.width / this.selectionSize.width * Math.abs(__scale.x));

        this.updateCtrlView(1);
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
            _m = (parent.matrix2Root().toMatrix());
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
                const transform = shape.parent!.matrix2Root();
                cache.set(shape.parent!, (transform));
                inverseCache.set(shape.parent!, (transform.getInverse()));
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

        this.selectionTransform = multi
            ? new Transform().setTranslate(ColVector3D.FromXY(this.originSelectionBox.x, this.originSelectionBox.y))
            : new Transform().setTranslate(ColVector3D.FromXY(alphaFrame.x, alphaFrame.y)).addTransform((alpha.matrix2Root()));

        const selectionInverse = this.selectionTransform.getInverse();
        this.selectionTransformInverse = selectionInverse;

        this.shapeTransformListInSelection = shapes.map((shape, i) => (shape.transform.clone())
            .addTransform(cache.get(shape.parent!)!)
            .addTransform(selectionInverse))

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
}