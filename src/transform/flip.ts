import { Context } from "@/context";
import {
    ColVector3D,
    ShapeView,
    Transform,
    Point3D,
} from "@kcdesign/data"
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

        const t = shape.transform2.clone();

        let parent2root = TC.get(parent.id);
        if (!parent2root) {
            parent2root = parent.transform2FromRoot.clone();
            TC.set(parent.id, parent2root);
        }

        t.addTransform(parent2root);
        const { width, height } = shape.size;

        const { col0, col1, col2, col3 } = t.transform([
            Point3D.FromXY(0, 0),
            Point3D.FromXY(width, height),
            Point3D.FromXY(width, 0),
            Point3D.FromXY(0, height),
        ]);

        const box = XYsBounding([col0, col1, col2, col3]);

        if (box.left < left) {
            left = box.left;
        }
        if (box.top < top) {
            top = box.top;
        }
        if (box.right > right) {
            right = box.right;
        }
        if (box.bottom > bottom) {
            bottom = box.bottom;
        }
    }

    const shape1th = shapes[0];
    const multi = shapes.length > 1;

    const selectionTransform = multi
        ? new Transform().setTranslate(ColVector3D.FromXY(left, top))
        : shape1th.transform2FromRoot.clone();

    const selectionTransformInverse = selectionTransform.getInverse();

    const STLIS: { shape: ShapeView, transform: Transform }[] = []; // shapeTransformListInSelection 图层相对选区坐标系的transform集合
    if (multi) {
        for (const shape of shapes) {
            STLIS.push({
                shape,
                transform: shape.transform2
                    .clone()
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
        flipedSelectionTransform = selectionTransform.clone().flipH2D(left + size.width / 2);
    } else {
        flipedSelectionTransform = selectionTransform.clone().flipV2D(top + size.height / 2);
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