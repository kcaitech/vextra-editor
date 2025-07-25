/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { SelectionCtx } from "@/components/common/ColorPicker/Editor/basic";
import { Context } from "@/context";
import { IColorPicker, IGradientModifier, IPatternModifier } from "@/components/common/ColorPicker/Editor/basic/icolorpicker";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { AsyncApiCaller, Color, PageEditor } from "@kcaitech/vextra-core";
import { hidden_selection } from "@/utils/content";
import { updateRecently } from "@/components/common/ColorPicker/utils";

export class ColorPickerEditor extends SelectionCtx implements IColorPicker, IGradientModifier, IPatternModifier {
    private m_fill_type: string;
    protected m_api: AsyncApiCaller | undefined;
    protected m_page_editor: PageEditor | undefined;

    constructor(public context: Context, type: string) {
        super(context);
        this.m_fill_type = type;
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
    }

    protected get pageEditor() {
        return this.m_page_editor ?? (this.m_page_editor = this.context.editor4Page(this.page));
    }

    protected get type() {
        return this.m_fill_type;
    }

    protected set type(v) {
        this.m_fill_type = v;
    }

    /* 隐藏控件一段时间 */
    protected hiddenCtrl(event?: Event) {
        hidden_selection(this.context);
        if (event?.target instanceof HTMLInputElement) event.target.blur();
    }

    modifyFillType(type: string): void {
        this.m_fill_type = type;
    }

    setSolidColor(c: RGBACatch): void {
        this.onUnmounted = () => updateRecently(new Color(c.A, c.R, c.G, c.B)); // 在色板关闭时更新“最近使用”
    }

    dragSolidBegin(): void {
        this.updateSelection();
    }

    solidDragging(c: RGBACatch): void {
        this.onUnmounted = () => updateRecently(new Color(c.A, c.R, c.G, c.B));
    }

    dragSolidEnd(): void {}

    createStop(c: RGBACatch): string {
        return '';
    }

    setStopColor(c: RGBACatch, stopAt: number) {}

    dragFromBegin(): void {}

    dragFromEnd(): void {}

    dragStopBegin(): void {}

    draggingStop(c: RGBACatch, stopAt: number): void {}

    dragStopEnd(): void {}

    dragStopPositionBegin() {}

    draggingStopPosition(position: number, stopAt: number) {}

    dragStopPositionEnd() {}

    dragToBegin(): void {}

    dragToEnd(): void {}

    draggingFrom(): void {}

    draggingTo(): void {}

    removeStop(stopAt: number): void {}

    reverseStops(): void {}

    rotateStops(): void {}

    filterDragBegin(): void {}

    filterDragging(type: string, val: number): void {}

    filterDragEnd(): void {}

    modifyObjectFit(type: string): void {}

    modifyRef(event: Event): void {}

    modifyTileScale(event: Event): void {}

    rotateImg(): void {}

    onUnmounted() {
    };
}