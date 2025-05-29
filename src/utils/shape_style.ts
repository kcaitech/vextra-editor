/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    Fill,
    BorderPosition,
    BorderStyle,
    ExportFormat,
    ExportFormatReplaceAction,
    ExportFormatAddAction,
    ExportFileFormat,
    ExportFormatNameingScheme,
    ExportFormatDeleteAction,
    ExportFormatScaleAction,
    ExportFormatNameAction,
    ExportFormatPrefixAction,
    ExportFormatFileFormatAction,
    ShapeType,
    ShapeView,
    adapt2Shape,
    BatchAction,
    BatchAction2,
    FillType,
    Gradient,
    BasicArray,
    MarkerType,
    CornerType,
    BorderSideSetting
} from "@kcdesign/data";
import { v4 } from "uuid";

interface FillItem {
    id: number
    fill: Fill
}
export interface BorderData {
    position: BorderPosition | string
    cornerType: CornerType | string
    borderStyle: BorderStyle | string
    sideSetting: BorderSideSetting | string
}

interface FormatItems {
    id: number,
    format: ExportFormat
}

// fills
export function get_fills(shapes: ShapeView[]): FillItem[] | 'mixed' | 'mask' {
    const fills: FillItem[] = [];
    const shape = shapes[0];
    const stylefills = shape?.getFills() || [];
    const compare_str: string[] = [];
    const has_g_str: string[] = [];
    const image_str: string[] = [];
    const mask = shape.fillsMask ?? 'undefined';
    const fill_mask: string[] = [];
    fill_mask.push(mask)

    for (let i = 0, len = stylefills.length; i < len; i++) {
        const fill = stylefills[i];
        const f = { id: i, fill };
        fills.push(f);
        const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue, fill.fillType].join('-');
        if (fill.fillType === FillType.Pattern) {
            image_str.push(get_image_str(fill));
        } else {
            image_str.push('undefined');
        }
        if (fill.gradient) {
            const g_str = get_gradient_str(fill.gradient);
            has_g_str.push(g_str);
        } else {
            has_g_str.push('undefined');
        }
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type === ShapeType.Cutout) continue;
        const stylefills = shape.getFills();
        const len = stylefills.length;
        if (shape.fillsMask) {
            fill_mask.push(shape.fillsMask)
        } else {
            fill_mask.push('undefined')
        }
        if (len !== fills.length) return 'mixed';
        const s_fs = stylefills;
        for (let j = 0; j < len; j++) {
            const fill = s_fs[j];
            const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue, fill.fillType].join('-');
            if (str !== compare_str[j]) return 'mixed';
            if (fill.fillType === FillType.SolidColor) continue;
            if (fill.fillType === FillType.Pattern) {
                if (image_str[j] !== get_image_str(fill)) return 'mixed';
                continue;
            }
            if (fill.gradient) {
                if (has_g_str[j] !== get_gradient_str(fill.gradient)) return 'mixed';
            } else {
                if (has_g_str[j] !== 'undefined') return 'mixed';
            }
        }
    }
    const mask_b = fill_mask.every(i => mask !== 'undefined' && i === mask)
    const mask_s = fill_mask.some(i => i !== 'undefined')

    if (mask_b) return 'mask'
    if (mask_s) return 'mixed'

    return fills;
}

function get_gradient_str(g: Gradient) {
    const str = [g.elipseLength, g.gradientType, g.gradientOpacity, g.from.x, g.from.y, g.to.x, g.to.y];
    for (let i = 0; i < g.stops.length; i++) {
        const stop = g.stops[i];
        str.push(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha, stop.position);
    }
    return str.join('-');
}

function get_image_str(fill: Fill) {
    const str = [fill.imageRef, fill.scale, fill.rotation, fill.originalImageWidth, fill.originalImageHeight, fill.transform, fill.imageScaleMode];
    if (fill.paintFilter) {
        const filter = fill.paintFilter;
        str.push(filter.contrast, filter.exposure, filter.hue, filter.saturation, filter.shadow, filter.temperature, filter.tint);
    }
    if (fill.transform) {
        const trans = fill.transform;
        str.push(trans.m00, trans.m01, trans.m02, trans.m10, trans.m11, trans.m12);
    }
    return str.join('-');
}

// borders

export const getDideStr = (side: BorderSideSetting, v: BorderSideSetting | string) => {
    if (typeof v === 'string') return false;
    const str = [
        // side.sideType,
        side.thicknessTop,
        side.thicknessRight,
        side.thicknessBottom,
        side.thicknessLeft
    ].join('-');
    const str2 = [
        // v.sideType,
        v.thicknessTop,
        v.thicknessRight,
        v.thicknessBottom,
        v.thicknessLeft
    ].join('-');
    return str === str2;
}

export function get_actions_border_style(shapes: ShapeView[], style: 'dash' | 'solid') {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const bs = new BorderStyle(0, 0);
        if (style === 'dash') {
            bs.gap = 10;
            bs.length = 10;
        }
        actions.push({ target: (shapes[i]), value: bs });
    }
    return actions;
}

export function get_actions_border(shapes: ShapeView[], value: any) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), value: value });
    }
    return actions;
}

export function get_actions_border_Apex(shapes: ShapeView[], type: MarkerType, end: boolean) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: (shapes[i]), value: { isEnd: end, mt: type } });
    }
    return actions;
}

export function get_actions_border_endpoint(shapes: ShapeView[], type: MarkerType) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: (shapes[i]), value: type });
    }
    return actions;
}

export function get_actions_border_exchange(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: (shapes[i]), value: undefined });
    }
    return actions;
}

// shadows
export function get_actions_shadow_blur(shapes: ShapeView[], index: number, blur: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: blur });
    }
    return actions;
}

export function get_actions_shadow_spread(shapes: ShapeView[], index: number, spread: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: spread });
    }
    return actions;
}

export function get_actions_shadow_offsetx(shapes: ShapeView[], index: number, offsetx: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: offsetx });
    }
    return actions;
}

export function get_actions_shadow_offsety(shapes: ShapeView[], index: number, offsety: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: offsety });
    }
    return actions;
}

//export cutout
export function get_export_formats(shapes: ShapeView[]): FormatItems[] | 'mixed' {
    const formats: FormatItems[] = [];
    const shape = shapes[0];
    const options = shape?.exportOptions;
    const compare_str: string[] = [];
    if (options) {
        for (let i = 0, len = options.exportFormats.length; i < len; i++) {
            const format = options.exportFormats[i];
            const s = { id: i, format };
            formats.push(s);
            const str = [
                format.scale,
                format.name,
                format.namingScheme,
                format.fileFormat
            ].join('-');
            compare_str.push(str);
        }
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        const options = shape.exportOptions;
        if (options) {
            const len = options.exportFormats.length;
            if (len !== formats.length) return 'mixed';
            const s_bs = options.exportFormats;
            for (let j = 0; j < len; j++) {
                const format = s_bs[j];
                const str = [
                    format.scale,
                    format.name,
                    format.namingScheme,
                    format.fileFormat].join('-');
                if (str !== compare_str[j]) return 'mixed';
            }
        } else {
            if (formats.length > 0) return 'mixed';
        }
    }
    return formats;
}

export function get_actions_export_format_unify(shapes: ShapeView[], formats: ExportFormat[], option?: boolean): ExportFormatReplaceAction[] {
    const actions: ExportFormatReplaceAction[] = [];
    const options = shapes[0]?.exportOptions;
    if (options && !option) {
        for (let i = 1; i < shapes.length; i++) {
            const new_formats: ExportFormat[] = [];
            for (let i = 0; i < options.exportFormats.length; i++) {
                const format = options.exportFormats[i];
                const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
                const new_format = new ExportFormat(new BasicArray(), v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
                new_formats.push(new_format);
            }
            actions.push({ target: adapt2Shape(shapes[i]), value: new_formats });
        }
    } else {
        for (let i = 0; i < shapes.length; i++) {
            const new_formats: ExportFormat[] = [];
            for (let i = 0; i < formats.length; i++) {
                const format = formats[i];
                const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
                const new_format = new ExportFormat(new BasicArray(), v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
                new_formats.push(new_format);
            }
            actions.push({ target: adapt2Shape(shapes[i]), value: new_formats });
        }
    }

    return actions;
}

export function get_actions_add_export_format(shapes: ShapeView[], formats: ExportFormat[]) {
    const actions: ExportFormatAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const new_formats: ExportFormat[] = [];
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
            const new_format = new ExportFormat(new BasicArray(), v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
            new_formats.push(new_format);
        }
        actions.push({ target: adapt2Shape(shapes[i]), value: new_formats });
    }
    return actions;
}

export function get_actions_export_format_delete(shapes: ShapeView[], index: number) {
    const actions: ExportFormatDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: adapt2Shape(shapes[i]), index });
    }
    return actions;
}

export function get_actions_export_format_scale(shapes: ShapeView[], index: number, scale: number) {
    const actions: ExportFormatScaleAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: adapt2Shape(shapes[i]), index, value: scale });
    }
    return actions;
}

export function get_actions_export_format_name(shapes: ShapeView[], index: number, name: string) {
    const actions: ExportFormatNameAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: adapt2Shape(shapes[i]), index, value: name });
    }
    return actions;
}

export function get_actions_export_format_perfix(shapes: ShapeView[], index: number, perfix: ExportFormatNameingScheme) {
    const actions: ExportFormatPrefixAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: adapt2Shape(shapes[i]), index, value: perfix });
    }
    return actions;
}

export function get_actions_export_format_file_format(shapes: ShapeView[], index: number, fileFormat: ExportFileFormat) {
    const actions: ExportFormatFileFormatAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: adapt2Shape(shapes[i]), index, value: fileFormat });
    }
    return actions;
}

export function get_borders_corner(shapes: ShapeView[]): false | CornerType {
    const shape = shapes[0];
    const styleborders = shape.getBorder();
    if (!styleborders.strokePaints.length) return false;
    const corner = styleborders.cornerType;
    const mixed = shapes.every(shape => {
        const borders = shape.getBorder();
        return borders.cornerType === corner;
    });
    if (mixed) {
        return corner;
    } else {
        return false;
    }
}
