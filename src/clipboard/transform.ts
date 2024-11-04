import { Context } from "@/context";
import { Matrix, ShapeView, ArtboradView, SymbolView, GroupShapeView, XYsBounding } from "@kcdesign/data";
import { XY } from "@/context/selection";
import { WorkSpace } from "@/context/workspace";

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

        const points: XY[] = [];
        for (const view of selected) {
            const matrix = view.matrix2Root();
            const frame = view.frame;
            points.push(...[
                { x: frame.x, y: frame.y },
                { x: frame.x + frame.width, y: frame.y },
                { x: frame.x + frame.width, y: frame.y + frame.height },
                { x: frame.x, y: frame.y + frame.height },
            ].map(i => matrix.computeCoord3(i)));
        }
        const box = XYsBounding(points);
        const width = box.right - box.left;
        const height = box.bottom - box.top;
        const workspace = this.context.workspace;
        const root = workspace.root;
        const matrix = workspace.matrix;
        const scale = matrix.m00;
        const ratio = Math.min(root.width / scale / width, root.height / scale / height);
        if (ratio < target) {
            let __scale = ratio / target;
            if (__scale * scale < 0.02) __scale = 0.02 / scale; // 最小值的视图比例为0.02(2%);
            matrix.trans(-root.center.x, -root.center.y);
            matrix.scale(__scale);
            matrix.trans(root.center.x, root.center.y);
            workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}