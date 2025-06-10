/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Shape, ShapeType, GroupShape, ColVector3D, GroupShapeView, ArtboardView, SymbolView, adapt2Shape, Page, IO, ShapeView, SymbolRefShape, SymbolShape, Transform } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { Context } from "@/context";
import { SourceBundle } from "@/clipboard";
import { InsertAction, EnvLike } from "@/clipboard/bundleHandler/index";
import { BoundingLike } from "@/space";

export class ClipboardTransformHandler {
    private __source_origin_transform_bounding(source: Shape[], originTransform: { [key: string]: Transform }) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < source.length; i++) {
            const shape = source[i];
            const _t = originTransform[`${shape.id}`];
            if (!_t) continue;
            const __transform = Transform.from(_t);
            let width, height;
            if (shape.size) {
                width = shape.size.width;
                height = shape.size.height;
            } else {
                const children = (shape as GroupShape).childs;
                const __box = this.sourceBounding(children);
                width = __box.right - __box.left;
                height = __box.bottom - __box.top;
            }
            const box = XYsBounding(__transform.transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(0, height),
            ]));

            if (box.top < top) top = box.top;
            if (box.left < left) left = box.left;
            if (box.right > right) right = box.right;
            if (box.bottom > bottom) bottom = box.bottom;
        }

        return { left, top, right, bottom };
    }

    private __fit_to_env(source: Shape[], env: GroupShapeView, originTransform: { [key: string]: Transform }) {
        const { x: envX, y: envY, width: envWidth, height: envHeight } = env.frame;

        const env2root = env.matrix2Root();
        const envBound = XYsBounding(env2root.transform([
            ColVector3D.FromXY(envX, envY),
            ColVector3D.FromXY(envX + envWidth, envY),
            ColVector3D.FromXY(envX + envWidth, envY + envHeight),
            ColVector3D.FromXY(envX, envY + envHeight),
        ]));

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
            const t = new Transform(_t.m00, _t.m01, _t.m02, _t.m10, _t.m11, _t.m12);
            shape.transform = t.multiAtLeft(targetSelectionTransform);
        }
    }

    isOuterView(context: Context, source: Shape[]) {
        const box = this.sourceBounding(source);
        const workspace = context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const rootLT = matrix.inverseCoord(0, 0);
        const rootRB = matrix.inverseCoord(root.width, root.height);
        return box.left < rootLT.x || box.right > rootRB.x || box.top < rootLT.y || box.bottom > rootRB.y;
    }
    sourceBounding(source: Shape[]): BoundingLike {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < source.length; i++) {
            const shape = source[i];
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
            const box = XYsBounding(Transform.from(shape.transform).transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(0, height),
            ]));

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
    fitEnvs(context: Context, envs: (ArtboardView | SymbolView | GroupShapeView)[], data: SourceBundle): InsertAction[] {
        const page = adapt2Shape(context.selection.selectedPage!) as Page;
        const ids = new Set(data.originIds);
        for (const env of envs) {
            if (ids.has(env.id)) return this.fitOrigin(context, data);
            const parent = adapt2Shape(env) as GroupShape;
            for (const shape of data.shapes) {
                if ((shape as GroupShape).childs || shape.type === ShapeType.SymbolRef) {
                    let __p: Shape | undefined = parent;
                    while (__p) {
                        if (__p instanceof SymbolShape) return this.fitOrigin(context, data);
                        __p = __p.parent;
                    }
                }
            }
        }

        const actions: InsertAction[] = [];
        for (let i = 0; i < envs.length; i++) {
            const env = envs[i];

            const __source = i ? JSON.parse(JSON.stringify(data.shapes)) : data.shapes;

            this.__fit_to_env(__source, env, data.originTransform);

            const shapes = i
                ? IO.Clipboard.import_shape_from_clipboard(context.data, __source)
                : IO.Clipboard.import_shape_from_clipboard(context.data, __source, data.media);

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
        const shapes = IO.Clipboard.import_shape_from_clipboard(context.data, source.shapes)
        shapes[0].transform = transform;
        return [{ parent: adapt2Shape(view.parent!) as GroupShape, shape: shapes[0] }];
    }

    /**
     * @description 提供相对于屏幕居中的图层插入参数
     */
    center(context: Context, source: SourceBundle): InsertAction[] {
        const shapes = IO.Clipboard.import_shape_from_clipboard(context.data, source.shapes)
        const box = this.sourceBounding(shapes);
        const width = box.right - box.left;
        const height = box.bottom - box.top;
        const workspace = context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const center = matrix.inverseCoord(root.center);
        const start = { x: center.x - width / 2, y: center.y - height / 2 };
        const inverse = context.selection.selectedPage!.matrix2Root().getInverse();
        for (const shape of shapes) {
            const transform = (shape.transform).clone();
            transform.trans(start.x - box.left, start.y - box.top)
            transform.multi(inverse);
            shape.transform = transform
        }
        const parent = adapt2Shape(context.selection.selectedPage!) as GroupShape;
        return shapes.map(shape => ({ parent, shape }));
    }

    /**
     * @description 提供原适应于原本位置的图层插入参数
     */
    fitOrigin(context: Context, source: SourceBundle): InsertAction[] {
        const page = adapt2Shape(context.selection.selectedPage!) as Page;
        const shapes = IO.Clipboard.import_shape_from_clipboard(context.data, source.shapes);
        const ids = new Set<string>(source.originIds);
        const getParent = ((shape: Shape, layers: ShapeView[]) => {
            for (const l of layers) {
                if (shape instanceof GroupShape || shape instanceof SymbolRefShape) {
                    let __p: ShapeView | undefined = l;
                    while (__p) {
                        if (__p instanceof SymbolView) break;
                        __p = __p.parent;
                    }
                    if (__p instanceof SymbolView) continue;
                }
                if (ids.has(l.id)) continue;
                if (l instanceof GroupShapeView && !l.isVirtualShape) return l;
            }
            return context.selection.selectedPage!;
        })
        return shapes.map(shape => {
            const box = this.sourceBounding([shape]);
            const parent = getParent(shape, context.selection.getLayers({ x: box.left, y: box.top })) as GroupShapeView;
            shape.transform = shape.transform.clone().multiAtLeft(parent.matrix2Root().getInverse());
            return { shape, parent: adapt2Shape(parent) as GroupShape }
        });
    }

    plain(context: Context, source: SourceBundle, envs: EnvLike[]) {

    }
}