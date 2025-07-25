/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcaitech/vextra-core";

export class RenderContext extends WatchableObject {
    private m_ctx: CanvasRenderingContext2D | null = null;

    get renderCtx(): CanvasRenderingContext2D {
        return this.m_ctx!;
    }

    registerRenderCtx(ctx: CanvasRenderingContext2D): void {
        this.m_ctx = ctx;
    }
}