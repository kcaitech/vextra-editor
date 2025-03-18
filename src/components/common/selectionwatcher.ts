/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Selection } from "@/context/selection";
import { ShapeType, ShapeView } from "@kcdesign/data";

export class SelectedShapesWatcher {
    private readonly watchedShapes: Map<string, ShapeView> = new Map();

    constructor(private selection: Selection) {
    }

    get selected(): ShapeView[] {
        return this.selection.selectedShapes;
    }

    watch(cb: any) {
        const WDS = this.watchedShapes;
        const selection = this.selection;
        const needWatchShapes = new Map();

        if (selection.hoveredShape) needWatchShapes.set(selection.hoveredShape.id, selection.hoveredShape);

        selection.selectedShapes.forEach(v => {
            if (v.isVirtualShape) {
                let p = v.parent;
                while (p) {
                    if (p.type === ShapeType.SymbolRef) {
                        needWatchShapes.set(p.id, p);
                        break;
                    }
                    p = p.parent;
                }
            }
            needWatchShapes.set(v.id, v);
        });

        WDS.forEach((v, k) => {
            if (!needWatchShapes.delete(k)) {
                v.unwatch(cb);
                WDS.delete(k);
            }
        });

        needWatchShapes.forEach((v, k) => {
            v.watch(cb);
            WDS.set(k, v);
        });
    }

    unwatch(cb: any) {
        this.watchedShapes.forEach(v=> v.unwatch(cb));
    }
}