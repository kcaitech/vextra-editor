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
import { Matrix, ShapeView, ArtboardView, SymbolView, GroupShapeView, Shape, ShapeType, GroupShape, ColVector3D, utils } from "@kcaitech/vextra-core";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";

export type BoundingLike = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function getVisibleBoundingByMatrix(shape: ShapeView, matrix: Matrix): BoundingLike {
    const frame = shape.isBorderShape ? shape.borderPathBox : shape.visibleFrame;
    return utils.XYsBounding([
        { x: frame.x, y: frame.y },
        { x: frame.x + frame.width, y: frame.y },
        { x: frame.x + frame.width, y: frame.y + frame.height },
        { x: frame.x, y: frame.y + frame.height }
    ].map(p => matrix.computeCoord3(p)));
}

export class SpaceHandler {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    private __shapes_bounding(source: Shape[]): BoundingLike {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (let i = 0; i < source.length; i++) {
            const shape = source[i];
            let width, height;
            if (shape.type === ShapeType.Group || shape.type === ShapeType.BoolShape) {
                const children = (shape as GroupShape).childs;
                const __box = this.__shapes_bounding(children);
                width = __box.right - __box.left;
                height = __box.bottom - __box.top;
            } else {
                width = shape.size.width;
                height = shape.size.height;
            }
            const __transform = (shape.transform);
            const box = utils.XYsBounding(__transform.transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height),
                ColVector3D.FromXY(width, 0),
                ColVector3D.FromXY(0, height),
            ]));
            // const box = XYsBounding([col0, col1, col2, col3]);

            if (box.top < top) top = box.top;
            if (box.left < left) left = box.left;
            if (box.right > right) right = box.right;
            if (box.bottom > bottom) bottom = box.bottom;
        }

        return { left, top, right, bottom };
    }

    private __views_bounding(source: ShapeView[]): BoundingLike {
        const points: XY[] = [];
        for (const view of source) {
            const matrix = view.matrix2Root();
            const frame = view.frame;
            points.push(...[
                { x: frame.x, y: frame.y },
                { x: frame.x + frame.width, y: frame.y },
                { x: frame.x + frame.width, y: frame.y + frame.height },
                { x: frame.x, y: frame.y + frame.height },
            ].map(i => matrix.computeCoord3(i)));
        }
        return utils.XYsBounding(points);
    }

    private __include(view: ShapeView, lt: XY, rb: XY) {
        const box = view.boundingBox();
        const toRoot = view.parent!.matrix2Root();
        const LT = toRoot.computeCoord2(box.x, box.y);
        const RB = toRoot.computeCoord2(box.x + box.width, box.y + box.height);
        return lt.x > LT.x && rb.x < RB.x && lt.y > LT.y && rb.y < RB.y;
    }

    private __get_env_by_area(scope: ShapeView[], lt: XY, rb: XY): GroupShapeView | undefined {
        let result: GroupShapeView | undefined;
        for (let i = scope.length - 1; i > -1; i--) {
            const view = scope[i];

            if (!(view instanceof ArtboardView || view instanceof SymbolView)) continue;

            if (!view.childs.length) {
                if (this.__include(view, lt, rb)) return view;
                continue;
            }

            if (this.__include(view, lt, rb)) {
                result = this.__get_env_by_area(view.childs, lt, rb);
                return result ?? view;
            } else if (view.frameMaskDisabled) {
                result = this.__get_env_by_area(view.childs, lt, rb);
                if (result) return result;
            }
        }
        return result;
    }

    /**
     * @description 寻找可以容纳目标选区区域大小的Container
     */
    getEnvByArea(area: { width: number, height: number }, suspend = false): GroupShapeView {
        const page = this.context.selection.selectedPage!

        if (suspend) return page;

        const workspace = this.context.workspace;
        const root = workspace.root;

        const inverse = new Matrix(workspace.matrix.inverse);

        const center = inverse.computeCoord3(root.center);
        // 区域在页面上的位置
        const lt = { x: center.x - area.width / 2, y: center.y - area.height / 2 };
        const rb = { x: lt.x + area.width, y: lt.y + area.height };

        return this.__get_env_by_area(page.childs, lt, rb) || page;
    }

    /**
     * @description 调整视图，使选区完全可见（过程中不改变任何图层数据）
     */
    fit(target = 1.12) {
        const selected = this.context.selection.selectedShapes;
        if (!selected.length) return;

        const box = this.__views_bounding(selected);
        const width = box.right - box.left;
        const height = box.bottom - box.top;
        const workspace = this.context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const scale = matrix.m00;
        const ratio = Math.min(root.width / scale / width, root.height / scale / height);
        if (ratio < target) {
            let __scale = ratio / target;
            if (__scale * scale < 0.02) __scale = 0.02 / scale; // 视图比例的最小值为0.02(2%);
            matrix.trans(-root.center.x, -root.center.y);
            matrix.scale(__scale);
            matrix.trans(root.center.x, root.center.y);
        }
        const rootLT = matrix.inverseCoord(0, 0);
        const rootRB = matrix.inverseCoord(root.width, root.height);
        let dx: number = 0;
        let dy: number = 0;
        const offset = 36 / workspace.curScale;
        if (box.left - rootLT.x < offset) {
            dx = rootLT.x + offset - box.left;
        }
        if (box.right + offset > rootRB.x) {
            dx = rootRB.x - offset - box.right;
        }
        if (box.top - rootLT.y < offset) {
            dy = rootLT.y + offset - box.top;
        }
        if (box.bottom + offset > rootRB.y) {
            dy = rootRB.y - offset - box.bottom;
        }
        if (dx || dy) matrix.trans(dx * matrix.m00, dy * matrix.m00);

        if (ratio < target || dx || dy) workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }

    scrollToView() {

    }

    zoomIn(left: number, top: number, width: number, height: number, space = 36) {
        const workspace = this.context.workspace;
        const {root, matrix, curScale} = workspace;

        const ratioW = (root.width - space * 2) / width;
        const ratioH = (root.height - space * 2) / height;

        let ratio: number = Math.min(ratioW, ratioH);
        if (curScale * ratio < 0.02) ratio = 0.02 / curScale;
        if (curScale * ratio > 256) ratio = 256 / curScale;
        matrix.trans(-left, -top);
        matrix.scale(ratio);
        matrix.trans(left, top);

        let offsetX: number;
        let offsetY: number;
        if (ratioW > ratioH) {
            offsetX = ((root.width - space * 2) - width * ratio) / 2 - left;
            offsetY = 36 - top;
        } else {
            offsetX = 36 - left;
            offsetY = ((root.height - space * 2) - height * ratio) / 2 - top;
        }
        matrix.trans(offsetX, offsetY);

        workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }

    static ViewsRootBounding(views: ShapeView[]) {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        for (const view of views) {
            const transform = view.matrix2Root();
            const frame = view.frame;
            const box = utils.XYsBounding([
                { x: frame.x, y: frame.y },
                { x: frame.x + frame.width, y: frame.y },
                { x: frame.x + frame.width, y: frame.y + frame.height },
                { x: frame.x, y: frame.y + frame.height },
            ].map(p => transform.transform(p)));
            if (box.left < left) left = box.left;
            if (box.top < top) top = box.top;
            if (box.bottom > bottom) bottom = box.bottom;
            if (box.right > right) right = box.right;
        }
        return { left, top, right, bottom };
    }
}