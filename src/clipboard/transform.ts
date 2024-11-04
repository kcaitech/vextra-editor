import { Context } from "@/context";
import { Transform, Matrix, ShapeView, ArtboradView, SymbolView, GroupShapeView } from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { XY } from "@/context/selection";

export class SpaceHandler {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
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

            if (!(view instanceof ArtboradView || view instanceof SymbolView)) continue;

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

    byArea(area: { width: number, height: number }, suspend = false): GroupShapeView {
        const workspace = this.context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const scale = matrix.m00;

        const ratio = Math.min(root.width / scale / area.width, root.height / scale / area.height);

        if (ratio < 1.12) {
            const __scale = ratio / 1.12;
            matrix.trans(-root.center.x, -root.center.y);
            matrix.scale(__scale);
            matrix.trans(root.center.x, root.center.y);

            workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }

        const page = this.context.selection.selectedPage!

        if (suspend) return page;

        const inverse = new Matrix(matrix.inverse);
        // 区域在页面上的位置
        const lt = inverse.computeCoord2(root.center.x - area.width / 2, root.center.y - area.height / 2);
        const rb = inverse.computeCoord2(root.center.x + area.width / 2, root.center.y + area.height / 2);

        return this.__get_env_by_area(page.childs, lt, rb) || page;
    }

    byTransform(transforms: Transform[], suspend = false) {

    }

    fit() {

    }
}