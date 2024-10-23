import { Context } from "@/context";
import { Matrix, ShapeView } from "@kcdesign/data";

/**
 * @description 判定一个点是否在指定图层内
 */
export class Decider {
    private readonly context: Context;
    private readonly SVG: SVGElement;
    private readonly path: SVGPathElement;

    private m_env: ShapeView;
    private m_transform: Matrix;

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
        this.m_transform = new Matrix();
    }

    set env(env: ShapeView) {
        this.m_env = env;
    }

    set transform(transform: Matrix) {
        this.m_transform = transform;
    }

    destroy() {
        document.body.removeChild(this.SVG);
    }
}