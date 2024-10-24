import { Context } from "@/context";
import { Matrix, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";

/**
 * @description 判定一个点是否在指定图层内
 */
export class Finder {
    private readonly context: Context;
    private readonly SVG: SVGElement;
    private readonly path: SVGPathElement;

    private m_env: ShapeView;
    private m_transform: Matrix;
    private m_point: XY | undefined;

    constructor(context: Context) {
        this.context = context;
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '10');
        svg.setAttribute('height', '10');
        svg.appendChild(this.path);
        this.SVG = svg;

        document.body.appendChild(svg);

        this.m_env = context.selection.selectedPage!;
        this.m_transform = context.workspace.rootMatrix;
    }

    set env(env: ShapeView) {
        this.m_env = env;

        const root = this.context.workspace.root;
        const m = env.matrix2Root();
        m.multiAtLeft(this.context.workspace.matrix);
        m.trans(-root.x, -root.y);
        this.transform = new Matrix(m.inverse);
    }

    set transform(transform: Matrix) {
        this.m_transform = transform;
        this.m_point = undefined;
    }

    isPointInView(view: ShapeView, point: XY) {
        const box = view._p_outerFrame;
        const xy = this.m_point ?? this.transform.computeCoord3(point);

    }

    clear() {
        this.m_point = undefined;
    }
    destroy() {
        document.body.removeChild(this.SVG);
    }
}