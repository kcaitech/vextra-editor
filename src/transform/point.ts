/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { TransformHandler } from "./handler";
import { PointModifyHandler, ShapeView } from "@kcdesign/data";

export enum PointActionType {
    Count = 'count',
    Radius = 'radius',
    InnerAngle = 'innerAngle',
}

export class PointHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];
    constructor(context: Context, event: MouseEvent) {
        super(context, event);
        this.shapes = context.selection.selectedShapes;
    }
    createApiCaller() {
        this.asyncApiCaller = new PointModifyHandler(this.context.coopRepo, this.context.data, this.page);
    }

    fulfil() {
        super.fulfil();
    }
    executeCount(count: number) {
        (this.asyncApiCaller as PointModifyHandler).executeCounts(this.shapes, count);
    }

    executeInnerAngle(offset: number) {
        (this.asyncApiCaller as PointModifyHandler).executeInnerAngle(this.shapes, offset);
    }
    executeRadius(values: number[]) {
        (this.asyncApiCaller as PointModifyHandler).executeRadius(this.shapes, values);
    }
}