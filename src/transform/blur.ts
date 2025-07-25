/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import { Blur, BlurMask, blurModifyHandler, ShapeView } from "@kcaitech/vextra-core";
import { getShapesForStyle } from "@/utils/style";

export class BlurHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = getShapesForStyle(context.selection.selectedShapes);
    }

    createApiCaller() {
        this.asyncApiCaller = new blurModifyHandler(this.context.repo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }

    executeSaturation(blur: Blur, value: number) {
        const actions: { blur: Blur, value: number }[] = [];
        if (blur!.parent instanceof BlurMask) {
            actions.push({ blur: blur!, value });
        } else {
            for (let i = 0; i < this.shapes.length; i++) {
                const shape = this.shapes[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value });
            }
        }
        (this.asyncApiCaller as blurModifyHandler).executeSaturation(actions);
    }

    executeBlurMaskSaturation(sheetid: string, maskid: string, s: number) {
    }
}