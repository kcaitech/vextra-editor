/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { TransformHandler } from "@/transform/handler";
import { Context } from "@/context";
import {
    ArtboardView,
    AutoLayoutModify,
    GroupShapeView,
    PaddingDir,
    ShapeView,
    Transporter
} from "@kcdesign/data";
import { XY } from "@/context/selection";

export class AutoLayoutHandler extends TransformHandler {
    readonly shapes: ShapeView[] = [];
    isTransApi: boolean = false;
    fixedPoint: XY = { x: 0, y: 0 };

    constructor(context: Context, event: MouseEvent) {
        super(context, event);

        this.shapes = context.selection.selectedShapes;
    }

    createApiCaller(downXY?: XY) {
        this.asyncApiCaller = new AutoLayoutModify(this.context.coopRepo, this.context.data, this.page);
        this.isTransApi = false;
        this.fixedPoint = downXY || { x: 0, y: 0 };
    }

    createTransApiCaller() {
        this.asyncApiCaller = new Transporter(this.context.coopRepo, this.context.data, this.page, this.shapes);
        this.isTransApi = true;
    }

    get transApi() {
        return this.isTransApi;
    }

    fulfil() {
        super.fulfil();
    }

    executePadding(padding: number, direction: PaddingDir, padding2 = 0) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0] as ArtboardView;
        if (!shape.autoLayout) return;
        if (direction === 'hor') {
            (this.asyncApiCaller as AutoLayoutModify).executeHorPadding(shape, padding, padding2);
        } else if (direction === 'ver') {
            (this.asyncApiCaller as AutoLayoutModify).executeVerPadding(shape, padding, padding2);
        } else {
            (this.asyncApiCaller as AutoLayoutModify).executePadding(shape, padding, direction);
        }
    }

    executeSpace(space: number, direction: PaddingDir) {
        if (this.shapes.length !== 1) return;
        const shape = this.shapes[0] as ArtboardView;
        if (!shape.autoLayout) return;
        (this.asyncApiCaller as AutoLayoutModify).executeSpace(shape, space, direction);
    }

    executeSwap(shape: ShapeView, target: ShapeView[], x: number, y: number) {
        if (!(shape as ArtboardView).autoLayout) return;
        (this.asyncApiCaller as AutoLayoutModify).swapShapeLayout(shape as ArtboardView, target, x, y);
    }
}