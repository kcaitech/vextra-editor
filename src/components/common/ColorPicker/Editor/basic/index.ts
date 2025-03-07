/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";


export class SelectionCtx {
    protected selected: ShapeView[];
    protected flat: ShapeView[];

    constructor(public context: Context) {
        this.selected = [];
        this.flat = [];
    }

    updateSelection() {
        this.selected = this.context.selection.selectedShapes;
        this.flat = this.context.selection.flat;
    }

    get page() {
        return this.context.selection.selectedPage!;
    }
}