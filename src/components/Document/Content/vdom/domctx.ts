/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { DViewCtx, ShapeView, GraphicsLibrary } from "@kcaitech/vextra-core";
import { markRaw } from "vue";

export class DomCtx extends DViewCtx {
    constructor() {
        super()
        this.setMarkRawFun(markRaw)
    }
    private idleCallback?: () => boolean;
    private beforeRender?: () => void;
    getFocusShape(): ShapeView | undefined {
        return this.focusshape as ShapeView;
    }

    updateFocusShape(shape: ShapeView | undefined) {
        this.focusshape = shape;
    }

    setBeforeRenderCallback(cb: () => void) {
        this.beforeRender = cb;
    }

    setIdleCallback(cb: () => boolean) {
        this.idleCallback = cb;
    }

    protected onIdle(): boolean {
        const ret = super.onIdle();
        return this.idleCallback?.() ?? ret;
    }

    protected aloop(gl: GraphicsLibrary): boolean {
        if (this.beforeRender) this.beforeRender();
        return super.aloop(gl);
    }
}