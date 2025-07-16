/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import PointsContainerForPolygon from "./PointsContainerForPolygon.vue";
import PointContainerForStar from "./PointContainerForStar.vue";
import PointContainerForRect from "./PointContainerForRect.vue";
import PointContainerForOval from "./PointContainerForOval.vue";
import { ShapeType } from "@kcdesign/data";

export const point_map = new Map<ShapeType, any>([
    [ShapeType.Polygon, PointsContainerForPolygon],
    [ShapeType.Star, PointContainerForStar],
    [ShapeType.Rectangle, PointContainerForRect],
    [ShapeType.Oval, PointContainerForOval],
])