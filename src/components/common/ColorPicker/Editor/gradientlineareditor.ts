/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { Gradient, GradientType } from "@kcaitech/vextra-core";
import { XY } from "@/context/selection";

export type GradientCatch = {
    type: GradientType;
    from: XY;
    to: XY;
    stopIds: string[];
    RGBAs: RGBACatch[];
}

export function getGradientCatch(g: Gradient): GradientCatch {
    const type = g.gradientType;
    const from = g.from;
    const to = g.to;
    const stopIds = g.stops.map(stop => stop.id);
    const RGBAs: RGBACatch[] = g.stops.map(stop => ({
        R: stop.color.red,
        G: stop.color.green,
        B: stop.color.blue,
        A: stop.color.alpha,
        position: stop.position
    }));
    return { type, from, to, stopIds, RGBAs };
}