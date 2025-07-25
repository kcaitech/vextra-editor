/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { EL, GraphicsLibrary, BoolShapeView } from "@kcaitech/vextra-core";
import { NodeType, optiRender, optiSetDirty, OptiType } from "./optinode";

export class BoolShapeDom extends (BoolShapeView) {
    el?: HTMLElement | SVGElement; // 不要改名，patch用到
    m_save_version: number = -1;
    m_save_render: EL & { el?: HTMLElement | SVGElement } = EL.make("");

    canOptiNode = true;
    optiel?: HTMLElement | SVGElement; // 绘制优化，不可见的节点暂存不显示
    set optiel_dirty(dirty: boolean) {
        const _this = this as NodeType
        optiSetDirty(_this);
    }
    protected onChildChange(...args: any[]) {
        super.onChildChange(...args);
        this.optiel_dirty = true;
    }

    render(gl: GraphicsLibrary): number {
        const version: number = super.render(gl);
        optiRender(this, version);
        return version;
    }
    asyncRender(gl: GraphicsLibrary): number {
        // if (!this.el && this.parent) this.m_ctx.setDirty(this.parent); // 子对象更新后，parent也要更新
        const version: number = super.asyncRender(gl);
        optiRender(this, version);
        return version;
    }

    // protected checkAndResetDirty(): boolean {
    //     if (super.checkAndResetDirty()) return true;
    //     return !this.el;
    // }
}