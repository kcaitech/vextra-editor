/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { StackMode, StackSizing, StackWrap, StackAlign, StackSize, ShapeView, ArtboardView } from "@kcaitech/vextra-core";

export type AutolayoutCtx = {
    stackSpacing: number | string;
    stackCounterSpacing: number | string;
    stackHorizontalPadding: number | string;
    stackVerticalPadding: number | string;
    stackPaddingRight: number | string;
    stackPaddingBottom: number | string;
    stackPrimarySizing: StackSizing | string;
    stackMode?: StackMode | string;
    stackWrap?: StackWrap | string;
    stackHorizontalGapSizing?: StackSizing | string;
    stackVerticalGapSizing?: StackSizing | string;
    stackCounterSizing?: StackSizing | string;
    stackPrimaryAlignItems?: StackAlign | string;
    stackCounterAlignItems?: StackAlign | string;
    stackReverseZIndex?: boolean | string;
    bordersTakeSpace?: boolean | string;
    minSize?: StackSize | string;
    maxSize?: StackSize | string;
}
export const getAutoLayout = (shapes: ShapeView[], t: Function): AutolayoutCtx | undefined => {
    const shape = shapes[0] as ArtboardView;
    if (!shape) return;
    const isAutoLayout = shapes.some(s => !(s as ArtboardView).autoLayout);
    if (isAutoLayout) return;
    if (shapes.length === 1) {
        if (!shape.autoLayout) return;
        return shape.autoLayout;
    } else {
        return mergeAutoLayout(shapes, t);
    }
}

const mergeAutoLayout = (shapes: ShapeView[], t: Function) => {
    const f_shape = shapes[0] as ArtboardView;
    const autoLayout: Partial<AutolayoutCtx> = { ...f_shape.autoLayout! };
    // 定义所有可能undefined的属性及其默认值
    const defaultValues: Partial<AutolayoutCtx> = {
        stackMode: StackMode.Horizontal,
        stackWrap: StackWrap.Wrap,
        bordersTakeSpace: false,
        stackReverseZIndex: false,
        stackCounterAlignItems: StackAlign.Min,
        stackPrimaryAlignItems: StackAlign.Min,
        stackCounterSizing: StackSizing.Auto,
        stackHorizontalGapSizing: StackSizing.Fixed,
        stackVerticalGapSizing: StackSizing.Fixed,
        minSize: undefined,
        maxSize: undefined
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i] as ArtboardView;
        const autoLayout2: Partial<AutolayoutCtx> = { ...shape.autoLayout! };
        for (const key in autoLayout2) {
            const typedKey = key as keyof AutolayoutCtx;
            if (autoLayout2[typedKey] === undefined) autoLayout2[typedKey] = defaultValues[typedKey] as any;
            if (autoLayout[typedKey] === undefined) autoLayout[typedKey] = defaultValues[typedKey] as any;

            if (autoLayout2[typedKey] !== autoLayout[typedKey]) {
                autoLayout[typedKey] = t('attr.mixed');
            }
        }
    }
    return autoLayout as AutolayoutCtx;
}