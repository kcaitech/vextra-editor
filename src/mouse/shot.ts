/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Matrix, ShapeView } from "@kcdesign/data";
import { XY } from "@/context/selection";

export class Shot {
    private readonly context: Context;
    private readonly SVG: SVGElement;
    private readonly path: SVGPathElement;
    private readonly SVGPoint: DOMPoint;

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

        this.SVGPoint = svg.createSVGPoint();

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
        this.transform = (m.inverse.toMatrix());
    }

    get env() {
        return this.m_env;
    }

    set transform(transform: Matrix) {
        this.m_transform = transform;
        this.m_point = undefined;
    }

    get transform() {
        return this.m_transform;
    }

    isPointInView(view: ShapeView, point: XY) {
        const box = view.relativeOuterFrame;
        const xy = this.m_point ?? this.transform.computeCoord3(point);
        if (xy.x < box.x || xy.y < box.y || xy.y > box.x + box.width || xy.y > box.y + box.height) return false;
        const d = view.getPath().clone();
        d.transform(view.matrix2Parent());
        this.path.setAttributeNS(null, 'd', d.toString());
        this.SVGPoint.x = xy.x;
        this.SVGPoint.y = xy.y;
        return this.path.isPointInFill(this.SVGPoint);
    }

    clear() {
        this.m_point = undefined;
    }
    destroy() {
        document.body.removeChild(this.SVG);
    }
}