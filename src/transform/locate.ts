import { Context } from "@/context";
import {
    ColVector3D,
    makeShapeTransform2By1,
    Matrix,
    ShapeView
} from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";

export enum LocateType {
    Center = 'center',
    Fit = 'fit'
}

export interface LocateRoot {
    x: number;
    y: number;
    right: number;
    bottom: number;
}

export function locateShape(context: Context, shape: ShapeView, __root?: LocateRoot, __clientMatrix?: Matrix) {
    const root = __root ?? context.workspace.root; // 定位场景；
    const client = __clientMatrix ?? context.workspace.matrix;

    const m = shape.transform2FromRoot; // 图层到Root；
    const clientTransform = makeShapeTransform2By1(client);
    m.addTransform(clientTransform); // root 到 client

    const { x, y, width, height } = shape.frame;
    const { col0: lt, col1: rt, col2: rb, col3: lb } = m.transform([
        ColVector3D.FromXY(x, y),
        ColVector3D.FromXY(x + width, y),
        ColVector3D.FromXY(x + width, y + height),
        ColVector3D.FromXY(x, y + height),
    ]);

    const box = XYsBounding([lt, rt, rb, lb]);

    const centerClient = { // 场景中点
        x: (root.right - root.x) / 2,
        y: (root.bottom - root.y) / 2
    };

    const centerShape = {
        x: (box.right + box.left) / 2,
        y: (box.bottom + box.top) / 2
    }

    const dx = centerClient.x - centerShape.x;
    const dy = centerClient.y - centerShape.y;
    client.trans(dx, dy);
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}