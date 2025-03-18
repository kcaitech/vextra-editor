/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Fill, ImageScaleMode } from "@kcdesign/data";
import { DEFAULT_IMAGE } from "@/context/atrribute";

export type PatternFilter = {
    exposure: number;
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
    shadow: number;
    hue: number;
}

export type PatternCatch = {
    objectFit: ImageScaleMode;
    media: string;
    filter: PatternFilter;
    scale: number;
}

export function getPatternCatch(fill: Fill): PatternCatch {
    const media = fill.peekImage(true) || DEFAULT_IMAGE;
    const objectFit = fill.imageScaleMode!;
    const __f = fill.paintFilter;
    const filter = {
        exposure: __f?.exposure ?? 0,
        contrast: __f?.contrast ?? 0,
        saturation: __f?.saturation ?? 0,
        temperature: __f?.temperature ?? 0,
        tint: __f?.tint ?? 0,
        shadow: __f?.shadow ?? 0,
        hue: __f?.hue ?? 0
    }
    const scale = fill.scale ?? 1;

    return {objectFit, media, filter, scale};
}