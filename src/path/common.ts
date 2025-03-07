/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from "@/context/selection";

export function convertQuadratic2Cubic(p0: XY, p1: XY, p2: XY) {
    const p3 = {x: p0.x / 3 + 2 * p1.x / 3, y: p0.y / 3 + 2 * p1.y / 3}
    const p4 = {x: p2.x / 3 + 2 * p1.x / 3, y: p2.y / 3 + 2 * p1.y / 3}
    return [p0, p3, p4, p2];
}

export function roundBy(val: number, round = 0.5) {
    return Math.round(val / round) * round;
}