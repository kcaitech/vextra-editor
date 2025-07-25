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
import {
    ColVector3D,
    ShapeView, SymbolView,
    Transform
} from "@kcaitech/vextra-core";
import { isShapeOut } from "@/utils/assist";
import { cursorAngle } from "@/components/Document/Selection/common";
import { markRaw } from "vue";
import { debounce } from "lodash";

export interface TitleAttri {
    id: string;

    shape: ShapeView;

    name: string;
    width: number;
    active: boolean;
    transform: string;
    isSymbol: boolean;

    hidden?: boolean;
}

export class TitleRenderer {
    private readonly m_context: Context;
    private readonly m_title_list: TitleAttri[];
    private active_set: Set<string>;

    constructor(context: Context, titleList: TitleAttri[]) {
        this.m_context = context;
        this.m_title_list = titleList;
        this.active_set = new Set();
    }

    // 已监听的Container对象
    private underRootContainerMap = new Map<string, ShapeView>();
    // 对象监听卸载函数集合
    private watcherUninstallerMap = new Map<string, () => void>();

    private generate(shape: ShapeView) {
        if (isShapeOut(this.m_context, shape)) return;
        if (!shape.isVisible) return;
        const titleCtx: TitleAttri = {
            id: shape.id,
            name: shape.name,
            width: 56,
            shape,
            active: this.active_set.has(shape.id),
            transform: '',
            isSymbol: shape instanceof SymbolView
        };
        this.modifyTransformStr(titleCtx);
        this.m_title_list.push(titleCtx);
    }

    /**
     * @description 修改容器标题的transform以及内容
     * @param titleCtx
     * @private
     */
    private modifyTransformStr(titleCtx: TitleAttri) {
        const { shape } = titleCtx;

        {
            // reset
            titleCtx.name = shape.name;
            titleCtx.width = 32;
            titleCtx.transform = '';
            delete titleCtx.hidden;
        }

        const { x, y, width, height } = shape.frame;

        const fromRoot = (shape.matrix2Root());
        const clientMatrix = (this.m_context.workspace.matrix);

        const fromClient = fromRoot.clone()
            .addTransform(clientMatrix);

        const points = fromClient.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(x + width, y),
            ColVector3D.FromXY(x + width, y + height),
            ColVector3D.FromXY(x, y + height)
        ]);

        const lt = ColVector3D.FromXY(points[0])
        const rt = ColVector3D.FromXY(points[1])
        const rb = ColVector3D.FromXY(points[2])
        const lb = ColVector3D.FromXY(points[3])
        // const {
        //     [0]: lt,
        //     [1]: rt,
        //     [2]: rb,
        //     [3]: lb
        // } = points;

        const s1 = [lt, rt];
        const s2 = [rt, rb];
        const s3 = [rb, lb];
        const s4 = [lb, lt];

        let top;
        let topValue = Infinity;

        const t1 = (s1[0].y + s1[1].y) / 2;
        if (t1 < topValue) {
            topValue = t1;
            top = s1;
        }

        const t2 = (s2[0].y + s2[1].y) / 2;
        if (t2 < topValue) {
            topValue = t2;
            top = s2;
        }

        const t3 = (s3[0].y + s3[1].y) / 2;
        if (t3 < topValue) {
            topValue = t3;
            top = s3;
        }

        const t4 = (s4[0].y + s4[1].y) / 2;
        if (t4 < topValue) {
            top = s4;
        }

        let xAxis: [ColVector3D, ColVector3D];
        let yAxis: [ColVector3D, ColVector3D];
        let O: ColVector3D;

        // Top 边在上面
        if (top === s1) {
            let start = lt;
            if (rt.x < lt.x) {
                start = rt;
            }

            if (start === lt) {
                xAxis = [lt, rt];
                yAxis = [lt, lb];
                O = lt;
            } else {
                xAxis = [rt, lt];
                yAxis = [rt, rb];
                O = rt;
            }
        } else if (top === s2) {
            let start = rt;
            if (rb.x < rt.x) {
                start = rb;
            }

            if (start === rt) {
                xAxis = [rt, rb];
                yAxis = [rt, lt];
                O = rt;
            } else {
                xAxis = [rb, rt];
                yAxis = [rb, lb];
                O = rb;
            }
        } else if (top === s3) {
            let start = rb;
            if (lb.x < rb.x) {
                start = lb;
            }

            if (start === rb) {
                xAxis = [rb, lb];
                yAxis = [rb, rt];
                O = rb;
            } else {
                xAxis = [lb, rb];
                yAxis = [lb, lt];
                O = lb;
            }
        } else {
            let start = lb;
            if (lt.x < lb.x) {
                start = lt;
            }

            if (start === lb) {
                xAxis = [lb, lt];
                yAxis = [lb, rb];
                O = lb;
            } else {
                xAxis = [lt, lb];
                yAxis = [lt, rt];
                O = lt;
            }
        }

        const X = xAxis[1].clone().subtract(xAxis[0]);
        const Y = yAxis[1].clone().subtract(yAxis[0]);

        const t = new Transform(X.x, Y.x, 0, 
                X.y, Y.y, 0
        )
        // ({
        //     matrix: new Matrix2(new NumberArray2D([4, 4], [
        //         X.x, Y.x, 0, 0,
        //         X.y, Y.y, 0, 0,
        //         X.z, Y.z, 1, 0,
        //         0, 0, 0, 1,
        //     ]))
        // })
        t.clearSkew()
        const tDirection = t.transform(ColVector3D.FromXY(0, -1));

        const OT = new Transform()
            .setRotateZ(cursorAngle(ColVector3D.FromXY(1, 0), X))
            .setTranslate(O)
            .translateAt({
                axis: tDirection,
                distance: 20,
            });

        titleCtx.width = Math.hypot(xAxis[1].x - xAxis[0].x, xAxis[1].y - xAxis[0].y);

        if (titleCtx.width < 24) {
            titleCtx.hidden = true;
        } else if (titleCtx.width < 32) {
            titleCtx.width = 32;
            titleCtx.name = '...';
        }

        titleCtx.transform = (OT).toString();
    }

    private updateContainerTitle(id: string, args: any[]) {
        if (!args?.includes('layout')) return;

        const titleCtx = this.m_title_list.find(t => t.id === id);
        if (!titleCtx) return;

        this.modifyTransformStr(titleCtx);
    }

    private __updateActive() {
        this.active_set.clear();
        const selected = [...this.m_context.selection.selectedShapes];
        if (this.m_context.selection.hoveredShape) selected.push(this.m_context.selection.hoveredShape);
        const set = new Set(selected.map(i => i.id));
        const title = new Map<string, TitleAttri>();
        this.m_title_list.forEach(t => title.set(t.shape.id, t));
        this.underRootContainerMap.forEach(t => {
            const __t = title.get(t.id);
            if (!__t) return;
            __t.active = set.has(t.id);
            __t.active && this.active_set.add(t.id);
        })
    }

    updateActive = debounce(this.__updateActive, 60);

    fullUpdate() {
        this.m_title_list.length = 0;
        this.underRootContainerMap.forEach((shape) => {
            this.generate(shape);
        });
    }

    updateUnderRootContainerMap() {
        const ctx = this.m_context;
        const page = ctx.selection.selectedPage!;
        const children = page.childs;

        const URCM = this.underRootContainerMap;
        const WUM = this.watcherUninstallerMap;
        const UCT = this.updateContainerTitle.bind(this);

        URCM.clear();

        for (let i = children.length - 1; i > -1; i--) {
            const c = markRaw(children[i]);

            if (!c.isContainer) continue;

            URCM.set(c.id, c);

            if (!WUM.has(c.id)) {
                WUM.set(c.id, c.watch((...args) => {
                    UCT(c.id, args);
                }));
            }
        }

        WUM.forEach((stopFunc, key) => {
            if (!URCM.has(key)) {
                stopFunc();
                WUM.delete(key);
            }
        });

        const added = new Set<string>();

        const list = this.m_title_list;

        const temp = [...list];

        list.length = 0;

        for (let i = 0; i < temp.length; i++) {
            const c = temp[i];

            if (URCM.has(c.id)) {
                list.push(c);
                added.add(c.id);
            }
        }

        URCM.forEach((shape) => {
            if (!added.has(shape.id)) this.generate(shape);
        });
    }

    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })
        this.watcherUninstallerMap.clear();
    }
}