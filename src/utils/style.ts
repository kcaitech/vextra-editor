/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { flattenShapes } from "@/utils/cutout";
import { GroupShapeView, ShapeType, ShapeView } from "@kcdesign/data";

export function getShapesForStyle(shapes: ShapeView[]) {
    const __shapes: ShapeView[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        if (s.type === ShapeType.Group) {
            const shapes = flattenShapes(s.childs).filter(s => s.type !== ShapeType.Group);
            __shapes.push(...shapes);
        } else {
            __shapes.push(s);
        }
    }
    return __shapes;
}