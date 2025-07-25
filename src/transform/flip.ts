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
import {
    ColVector3D,
    ShapeView,
    Transform,
} from "@kcaitech/vextra-core"
import { XYsBounding } from "@/utils/common";

/**
 * @description 使图层绕axis轴翻转
 */
export function flip(context: Context, axis: 'X' | 'Y') {
    const __shapes = context.selection.selectedShapes;

    if (!__shapes.length) return;

    const TC = new Map<string, Transform>(); // transformCache for parent reflect to root

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    const shapes: ShapeView[] = []; // valid shapes;

    for (const shape of __shapes) {
        const parent = shape.parent;

        if (!parent || shape.isVirtualShape) continue;

        shapes.push(shape);

        const t = (shape.transform.clone());

        let parent2root = TC.get(parent.id);
        if (!parent2root) {
            parent2root = (parent.matrix2Root());
            TC.set(parent.id, parent2root);
        }

        t.addTransform(parent2root);
        const { x, y, width, height } = shape.frame;
        const r = x + width;
        const b = y + height;

        const box = XYsBounding(t.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(r, y),
            ColVector3D.FromXY(r, b),
            ColVector3D.FromXY(x, b),
        ]));

        if (box.left < left) left = box.left;
        if (box.top < top) top = box.top;
        if (box.right > right) right = box.right;
        if (box.bottom > bottom) bottom = box.bottom;
    }

    const shape1th = shapes[0];
    const multi = shapes.length > 1;

    const selectionTransform = multi
        ? new Transform().setTranslate(ColVector3D.FromXY(left, top))
        : (shape1th.matrix2Root());

    const selectionTransformInverse = selectionTransform.getInverse();

    const STLIS: { shape: ShapeView, transform: Transform }[] = []; // shapeTransformListInSelection 图层相对选区坐标系的transform集合
    if (multi) {
        for (const shape of shapes) {
            STLIS.push({
                shape,
                transform: (shape.transform.clone())
                    .addTransform(TC.get(shape.parent!.id)!)
                    .addTransform(selectionTransformInverse)
            });
        }
    } else {
        STLIS.push({
            shape: shape1th,
            transform: new Transform()
        });
    }

    const size: { width: number, height: number } = { width: right - left, height: bottom - top };

    let flipedSelectionTransform;
    if (axis === "Y") {
        flipedSelectionTransform = selectionTransform.clone().flipHoriz(left + size.width / 2);
    } else {
        flipedSelectionTransform = selectionTransform.clone().flipVert(top + size.height / 2);
    }

    const params: { shape: ShapeView, transform2: Transform }[] = [];

    for (const { shape, transform } of STLIS) {
        params.push({
            shape,
            transform2: transform.clone()
                .addTransform(flipedSelectionTransform)
                .addTransform(TC.get(shape.parent!.id)!.getInverse())
        });
    }

    context.editor4Page(context.selection.selectedPage!).shapesFlip(params);
}