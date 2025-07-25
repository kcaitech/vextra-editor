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
import { ColorPicker, ShapeView } from "@kcaitech/vextra-core";

export class ColorHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller() {
        this.asyncApiCaller = new ColorPicker(this.context.repo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }
}