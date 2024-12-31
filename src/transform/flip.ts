import { Context } from "@/context";
import {
    ColVector3D,
    makeShapeTransform2By1,
    ShapeView,
    Transform,
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

        const t = makeShapeTransform2By1(shape.transform);

        let parent2root = TC.get(parent.id);
        if (!parent2root) {
            parent2root = makeShapeTransform2By1(parent.matrix2Root());
            TC.set(parent.id, parent2root);
        }

        t.addTransform(parent2root);
        const { x, y, width, height } = shape.frame;
        const r = x + width;
        const b = y + height;

        const { col0, col1, col2, col3 } = t.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(r, y),
            ColVector3D.FromXY(r, b),
            ColVector3D.FromXY(x, b),
        ]);

        const box = XYsBounding([col0, col1, col2, col3]);

        if (box.left < left) left = box.left;
        if (box.top < top) top = box.top;
        if (box.right > right) right = box.right;
        if (box.bottom > bottom) bottom = box.bottom;
    }

    const shape1th = shapes[0];
    const multi = shapes.length > 1;

    const selectionTransform = multi
        ? new Transform().setTranslate(ColVector3D.FromXY(left, top))
        : makeShapeTransform2By1(shape1th.matrix2Root());

    const selectionTransformInverse = selectionTransform.getInverse();

    const STLIS: { shape: ShapeView, transform: Transform }[] = []; // shapeTransformListInSelection 图层相对选区坐标系的transform集合
    if (multi) {
        for (const shape of shapes) {
            STLIS.push({
                shape,
                transform: makeShapeTransform2By1(shape.transform)
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
        flipedSelectionTransform = selectionTransform.clone().flipH(left + size.width / 2);
    } else {
        flipedSelectionTransform = selectionTransform.clone().flipV(top + size.height / 2);
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