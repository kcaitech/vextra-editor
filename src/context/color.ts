/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { GradientFrom } from "@/components/Document/Selection/Controller/ColorEdit/gradient_utils";
import { WatchableObject, Gradient, GradientType, ImageScaleMode } from "@kcdesign/data";

export class ColorCtx extends WatchableObject {
    static CHANGE_STOP = 1;
    static COLOR_EDITOR = 2;
    static STOP_DELETE = 3;
    static CHANGE_GRADIENT_TYPE = 4;
    static GRADIENT_UPDATE = 5;
    static TILE_CHANGE = 6;
    static CHANGE_IMAGE_MODE = 7;
    static IMAGE_ORIGIN_CHANGE = 8;
    static HIDDEN_SELECTED = 9;
    private m_selected_stop: string | undefined = undefined;
    private editor_mode: boolean = false;
    private m_gradient: undefined | Gradient = undefined;
    private m_gradient_type: GradientType | undefined = undefined;
    private m_locate: { index: number, type: GradientFrom } | undefined;
    private m_image_scale_mode: ImageScaleMode | undefined;
    private m_image_scale: number | undefined;
    private m_image_origin_frame: { width: number, height: number } | undefined;
    private m_color_index: number = -1;
    constructor() {
        super();
    }
    select_stop(id: string | undefined) {
        this.m_selected_stop = id;
        this.notify(ColorCtx.CHANGE_STOP)
    }
    get selected_stop() {
        return this.m_selected_stop;
    }
    switch_editor_mode(val: boolean, gradient?: Gradient) {
        this.editor_mode = val && !!gradient;
        this.m_gradient = gradient;
        this.notify(ColorCtx.COLOR_EDITOR);
    }
    set_gradient_type(type: GradientType | undefined) {
        this.m_gradient_type = type;
        this.notify(ColorCtx.CHANGE_GRADIENT_TYPE);
    }
    get gradient_type() {
        return this.m_gradient_type;
    }
    get mode() {
        return this.editor_mode;
    }
    get gradient() {
        return this.m_gradient
    }

    gradient_locate(locate: { index: number, type: GradientFrom } | undefined) {
        this.m_locate = locate;
    }

    get locate() {
        return this.m_locate;
    }

    clear_locate() {
        this.m_locate = undefined;
    }

    setImageScaleMode(mode?: ImageScaleMode) {
        this.m_image_scale_mode = mode;
        this.notify(ColorCtx.CHANGE_IMAGE_MODE);
    }
    get imageScaleMode() {
        return this.m_image_scale_mode;
    }
    setImageScale(scale?: number) {
        this.m_image_scale = scale;
        this.notify(ColorCtx.TILE_CHANGE);
    }
    get imageScale() {
        return this.m_image_scale;
    }

    setImageOriginFrame(frame?: { width: number, height: number }) {
        this.m_image_origin_frame = frame;
        this.notify(ColorCtx.IMAGE_ORIGIN_CHANGE);
    }
    get imageOriginFrame() {
        return this.m_image_origin_frame;
    }

    setColorIndex(index: number) {
        this.m_color_index = index;
    }

    get colorIndex() {
        return this.m_color_index;
    }
}