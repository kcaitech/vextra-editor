import { Context } from "@/context";
import { Matrix, ShapeView, ArtboradView, SymbolView, GroupShapeView } from "@kcdesign/data";
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

    fit() {

    }
}