/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { genPath, ReferUnit } from "@/components/Document/Rule/refer";
import { ArtboardView, GuideAxis, PageView, ShapeView } from "@kcdesign/data";
import { isShapeOut } from "@/utils/assist";
import { Context } from "@/context";
import { XY } from "@/context/selection";

/**
 * @description 容器内参考线渲染 V1.0
 */
export class ReferUnderContainerRenderer {
    private readonly m_context: Context;
    private readonly m_units: ReferUnit[];
    private m_page: PageView;

    constructor(context: Context, units: ReferUnit[], page: PageView) {
        this.m_context = context;
        this.m_units = units;
        this.m_page = page;
    }

    // 已监听的Container对象
    private underRootContainerMap = new Map<string, ShapeView>();
    // 对象监听卸载函数集合
    private watcherUninstallerMap = new Map<string, () => void>();

    /**
     * @description 更新指定Container的参考线绘制
     */
    private updateContainerLineRender(id: string, args: any) {
        // console.log('_update_', ...args);
        const ctx = this.m_context;
        const referSelection = ctx.tool.referSelection;

        if (referSelection && (args && args.includes('guides') && args.includes('length', -1))) {
            referSelection.updateSelectionForDelete(id);
            return;
        }

        if (!args || !((args.includes('layout') || args.includes('guides')))) {
            return;
        }

        // 寻找修改对象
        const units = this.m_units;
        let unit: ReferUnit | undefined = undefined;

        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            if (u.id === id) {
                unit = u as ReferUnit;
                break;
            }
        }

        if (!unit) {
            return;
        }

        // console.log('__units__', unit);

        this.updateReferUnit(unit);

        // if ((args && args.includes('guides') && args.includes('offset', -1))) {
        //     referSelection.updateSelectedSelection(id);
        //     return;
        // }

        referSelection?.updateSelectedSelection(id);
    }

    /**
     * @description 为指定Container生成参考线
     */
    private generateUnit(shape: ShapeView) {
        const unit: ReferUnit = { shape: shape, id: shape.id, lines: [] };

        this.m_units.push(unit);

        this.updateReferUnit(unit);
    }

    private updateReferUnit(unit: ReferUnit) {
        const shape = unit.shape;

        // 清空当前容器下的线
        unit.lines.length = 0;

        const ctx = this.m_context;

        // 如果当前容器不在客户端可视范围内或者当前容器存在角度则不进行绘制
        if (isShapeOut(ctx, shape) || !shape.isVisible || (shape.rotation || 0) % 180) return;

        const matrix = shape.matrix2Root();
        matrix.multiAtLeft(ctx.workspace.matrix);

        const frame = shape.frame;
        const root = ctx.workspace.root;

        const guides = (shape as ArtboardView).guides || [];
        for (let i = 0; i < guides.length; i++) {
            const guide = guides[i];

            let start: XY;
            let end: XY;

            const axis = guide.axis;
            const offset = guide.offset;

            if (axis === GuideAxis.X) {
                if (offset < 0 || offset > frame.width) continue;

                start = matrix.computeCoord2(offset, 0);
                end = matrix.computeCoord2(offset, frame.height);

                if (start.x <= 20 || start.x >= root.width) continue; // 超出可视范围不绘制
            } else {
                if (offset < 0 || offset > frame.height) continue;

                start = matrix.computeCoord2(0, offset);
                end = matrix.computeCoord2(frame.width, offset);

                if (start.y <= 20 || start.y >= root.height) continue; // 超出可视范围不绘制
            }

            unit.lines.push({ index: i, id: `${shape.id}/${i}`, axis, offset, start, end, path: genPath(start, end) });
        }
    }

    /**
     * @description 全量更新
     */
    updateByMatrix() {
        const URU = this.updateReferUnit.bind(this);
        for (let i = 0; i < this.m_units.length; i++) {
            URU(this.m_units[i]);
        }
    }

    /**
     * @description 更新监听目标
     */
    updateUnderRootContainerMap() {
        const page = this.m_page;
        const children = page.childs;
        const URCM = this.underRootContainerMap;
        const WUM = this.watcherUninstallerMap;
        const UCLR = this.updateContainerLineRender.bind(this);

        URCM.clear();

        for (let i = children.length - 1; i > -1; i--) {
            const c = children[i];
            if (!c.isContainer || (c.rotation || 0) % 180) {
                continue;
            }
            URCM.set(c.id, c);
            if (!WUM.has(c.id)) {
                WUM.set(c.id, c.watch((...args) => {
                    UCLR(c.id, args)
                }));
            }
        }

        WUM.forEach((stopFunc, key) => {
            if (!URCM.has(key)) {
                stopFunc();
                WUM.delete(key);
            }
        })

        const units = this.m_units;
        const temp = [...units];
        const added = new Set<string>();

        units.length = 0;

        // 在这个过程中，把更新监听对象前有的Unit直接push回去
        for (let i = 0; i < temp.length; i++) {
            const c = temp[i];
            if (URCM.has(c.id)) {
                units.push(c);
                added.add(c.id);
            }
        }

        // 更新后如果有新的Unit，则需要额外生成
        URCM.forEach((shape) => {
            if (!added.has(shape.id)) {
                this.generateUnit(shape);
            }
        })

        // todo 若需要保证参考线的优先顺序，需要对URCM进行层级排序，但正常场景下几乎不会存在顺序问题，所以出于性能考虑先不排

        // 更新了渲染容器对象
        // console.log('RENDER TARGET CHANGE:', page.name, URCM.size, WUM.size, this.m_units.length, this.m_units);
    }

    /**
     * @description 卸载所有Container中已经安装的监听函数
     */
    clearContainerWatcher() {
        this.watcherUninstallerMap.forEach((stopFunc) => {
            stopFunc();
        })
        this.watcherUninstallerMap.clear();
    }

    pageChange(page: PageView) {
        this.m_page = page;
    }
}