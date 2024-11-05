import {
    Shape, makeShapeTransform2By1, ShapeType, GroupShape, ColVector3D, GroupShapeView, makeShapeTransform1By2,
    TransformRaw, Transform, ArtboradView, SymbolView, adapt2Shape, Page, import_shape_from_clipboard
} from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { Context } from "@/context";
import { SourceBundle } from "@/clipboard";
import { InsertAction } from "@/clipboard/bundleHandler/index";

export class ClipboardTransformHandler {
    private __source_origin_transform_bounding(source: Shape[], originTransform: any) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < source.length; i++) {
            const shape = source[i];
            const _t = originTransform[`${shape.id}`];
            if (!_t) continue;
            const __transform = makeShapeTransform2By1(_t);
            let width, height;
            if (shape.type === ShapeType.Group) {
                const children = (shape as GroupShape).childs;
                const __box = this.sourceBounding(children);
                width = __box.right - __box.left;
                height = __box.bottom - __box.top;
            } else {
                width = shape.size.width;
                height = shape.size.height;
            }
            const { col0, col1, col2, col3 } = __transform.transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(0, height),
            ]);
            const box = XYsBounding([col0, col1, col2, col3]);

            if (box.top < top) top = box.top;
            if (box.left < left) left = box.left;
            if (box.right > right) right = box.right;
            if (box.bottom > bottom) bottom = box.bottom;
        }

        return { left, top, right, bottom };
    }

    private __fit_to_env(source: Shape[], env: GroupShapeView, originTransform: any) {
        const { x: envX, y: envY, width: envWidth, height: envHeight } = env.frame;

        const env2root = env.transform2FromRoot;
        const {
            col0: envLT,
            col1: envRT,
            col2: envRB,
            col3: envLB
        } = env2root.transform([
            ColVector3D.FromXY(envX, envY),
            ColVector3D.FromXY(envX + envWidth, envY),
            ColVector3D.FromXY(envX + envWidth, envY + envHeight),
            ColVector3D.FromXY(envX, envY + envHeight),
        ]);

        const envBound = XYsBounding([envLT, envRT, envRB, envLB]);
        const envBoundWidth = envBound.right - envBound.left;
        const envBoundHeight = envBound.bottom - envBound.top;

        const sourceOriginBound = this.__source_origin_transform_bounding(source, originTransform);

        const targetSelectionTransform = new Transform();

        if (sourceOriginBound.left > envBoundWidth || sourceOriginBound.right < 0) {
            const shapeCX = (sourceOriginBound.left + sourceOriginBound.right) / 2;
            targetSelectionTransform.translate(ColVector3D.FromXY(envBoundWidth / 2 - shapeCX, 0));
        }
        if (sourceOriginBound.top > envBoundHeight || sourceOriginBound.bottom < 0) {
            const shapeCY = (sourceOriginBound.top + sourceOriginBound.bottom) / 2;
            targetSelectionTransform.translate(ColVector3D.FromXY(0, envBoundHeight / 2 - shapeCY));
        }

        for (const shape of source) {
            const _t = originTransform[`${shape.id}`];
            if (!_t) continue;

            const __transform = makeShapeTransform2By1(_t)
                .addTransform(targetSelectionTransform);

            shape.transform = makeShapeTransform1By2(__transform) as TransformRaw;
        }
    }

    sourceBounding(source: Shape[]) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < source.length; i++) {
            const shape = source[i];
            const __transform = makeShapeTransform2By1(shape.transform);
            let width, height;
            if (shape.type === ShapeType.Group || shape.type === ShapeType.BoolShape) {
                const children = (shape as GroupShape).childs;
                const __box = this.sourceBounding(children);
                width = __box.right - __box.left;
                height = __box.bottom - __box.top;
            } else {
                width = shape.size.width;
                height = shape.size.height;
            }
            const { col0, col1, col2, col3 } = __transform.transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(0, height),
            ]);
            const box = XYsBounding([col0, col1, col2, col3]);

            if (box.top < top) top = box.top;
            if (box.left < left) left = box.left;
            if (box.right > right) right = box.right;
            if (box.bottom > bottom) bottom = box.bottom;
        }

        return { left, top, right, bottom };
    }

    /**
     * @description 提供适应指定容器的图层插入参数
     */
    fitEnvs(context: Context, envs: (ArtboradView | SymbolView | GroupShapeView)[], data: SourceBundle): InsertAction[] {
        const actions: { parent: GroupShape; shape: Shape; index?: number }[] = [];
        const page = adapt2Shape(context.selection.selectedPage!) as Page;
        for (let i = 0; i < envs.length; i++) {
            const env = envs[i];

            const __source = i ? JSON.parse(JSON.stringify(data.shapes)) : data.shapes;

            this.__fit_to_env(__source, env, data.originTransform);

            const shapes = i
                ? import_shape_from_clipboard(context.data, page, __source)
                : import_shape_from_clipboard(context.data, page, __source, data.media);

            const parent = adapt2Shape(env) as GroupShape;
            for (const shape of shapes) actions.push({ parent, shape });
        }
        return actions;
    }

    /**
     * @description 提供相对某个图层向右偏移的图层插入参数
     */
    rightBy(context: Context, source: SourceBundle, view: GroupShapeView): InsertAction[] {
        const box = view.boundingBox();
        const transform = view.transform.clone();
        transform.translateX += box.width + 12;
        const shapes = import_shape_from_clipboard(context.data, adapt2Shape(context.selection.selectedPage!) as Page, source.shapes)
        shapes[0].transform = transform;
        return [{ parent: adapt2Shape(view.parent!) as GroupShape, shape: shapes[0] }];
    }

    /**
     * @description 提供相对于屏幕居中的图层插入参数
     */
    center(context: Context, source: SourceBundle): InsertAction[] {
        const shapes = import_shape_from_clipboard(context.data, adapt2Shape(context.selection.selectedPage!) as Page, source.shapes)
        const box = this.sourceBounding(shapes);
        const width = box.right - box.left;
        const height = box.bottom - box.top;
        const workspace = context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const center = matrix.inverseCoord(root.center);
        const start = { x: center.x - width / 2, y: center.y - height / 2 };
        const inverse1 = new Transform().setTranslate(ColVector3D.FromXY(start.x - box.left, start.y - box.top));
        const inverse2 = context.selection.selectedPage!.transform2FromRoot.getInverse();
        for (const shape of shapes) {
            const transform = makeShapeTransform2By1(shape.transform);
            transform.addTransform(inverse1);
            transform.addTransform(inverse2);
            shape.transform = makeShapeTransform1By2(transform);
        }
        const parent = adapt2Shape(context.selection.selectedPage!) as GroupShape;
        return shapes.map(shape => ({ parent, shape }));
    }
}