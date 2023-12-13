import {
    Color, Fill, Shape, FillColorAction, FillEnableAction, FillAddAction, FillDeleteAction, FillsReplaceAction,
    Border, BorderColorAction, BorderEnableAction, BorderAddAction, BorderDeleteAction, BordersReplaceAction,
    BorderThicknessAction, BorderPositionAction, BorderStyleAction, BorderPosition, BorderStyle, Shadow,
    ShadowReplaceAction, ShadowAddAction, ShadowDeleteAction, ShadowEnableAction, ShadowPositionAction,
    ShadowPosition, ShadowColorAction, ShadowBlurRadiusAction, ShadowSpreadAction, ShadowOffsetXAction,
    ShadowOffsetYAction, ExportFormat, ExportFormatReplaceAction, ExportFormatAddAction, ExportFileFormat,
    ExportFormatNameingScheme, ExportVisibleScaleType, ExportFormatDeleteAction, ExportFormatScaleAction,
    ExportFormatNameAction, ExportFormatPerfixAction, ExportFormatFileFormatAction, ShapeType
} from "@kcdesign/data";
import { v4 } from "uuid";
interface FillItem {
    id: number,
    fill: Fill
}
interface BorderItem {
    id: number,
    border: Border
}
interface ShadowItem {
    id: number,
    shadow: Shadow
}
interface FormatItems {
    id: number,
    format: ExportFormat
}
// fills
export function get_fills(shapes: Shape[]): FillItem[] | 'mixed' {
    const fills: FillItem[] = [];
    const shape = shapes[0];
    const style = shape.style;
    const compare_str: string[] = [];
    for (let i = 0, len = style.fills.length; i < len; i++) {
        const fill = style.fills[i];
        const f = { id: i, fill };
        fills.push(f);
        const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue].join('-');
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type === ShapeType.Cutout) continue;
        const len = shape.style.fills.length;
        if (len !== fills.length) return 'mixed';
        const s_fs = shape.style.fills;
        for (let j = 0; j < len; j++) {
            const fill = s_fs[j];
            const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }
    return fills;
}
export function get_actions_add_fill(shapes: Shape[], fill: Fill) {
    const actions: FillAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, fillType, color, contextSettings } = fill;
        const new_fill = new Fill(v4(), isEnabled, fillType, color);
        new_fill.contextSettings = contextSettings;
        actions.push({ target: shapes[i], value: new_fill });
    }
    return actions;
}
export function get_actions_fill_color(shapes: Shape[], index: number, color: Color) {
    const actions: FillColorAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}
export function get_actions_fill_unify(shapes: Shape[]) {
    const actions: FillsReplaceAction[] = [];
    const fills = shapes[0].style.fills;
    for (let i = 1; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const new_fills: Fill[] = [];
        for (let i = 0; i < fills.length; i++) {
            const fill = fills[i];
            const { isEnabled, fillType, color, contextSettings } = fill;
            const new_fill = new Fill(v4(), isEnabled, fillType, color);
            new_fill.contextSettings = contextSettings;
            new_fills.push(new_fill);
        }
        actions.push({ target: shapes[i], value: new_fills });
    }
    return actions;
}
export function get_actions_fill_enabled(shapes: Shape[], index: number, value: boolean) {
    const actions: FillEnableAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}
export function get_actions_fill_delete(shapes: Shape[], index: number) {
    const actions: FillDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index });
    }
    return actions;
}

// borders
export function get_borders(shapes: Shape[]): BorderItem[] | 'mixed' {
    const borders: BorderItem[] = [];
    const shape = shapes[0];
    const style = shape.style;
    const compare_str: string[] = [];
    for (let i = 0, len = style.borders.length; i < len; i++) {
        const border = style.borders[i];
        const b = { id: i, border };
        borders.push(b);
        const str = [
            border.isEnabled,
            border.color.red,
            border.color.green,
            border.color.blue,
            border.color.alpha,
            border.borderStyle.gap,
            border.borderStyle.length,
            border.thickness,
            border.position
        ].join('-');
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shapes[i].type === ShapeType.Cutout) continue;
        const len = shape.style.borders.length;
        if (len !== borders.length) return 'mixed';
        const s_bs = shape.style.borders;
        for (let j = 0; j < len; j++) {
            const border = s_bs[j];
            const str = [
                border.isEnabled,
                border.color.red,
                border.color.green,
                border.color.blue,
                border.color.alpha,
                border.borderStyle.gap,
                border.borderStyle.length,
                border.thickness,
                border.position
            ].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }
    return borders;
}
export function get_actions_add_boder(shapes: Shape[], border: Border) {
    const actions: BorderAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, fillType, color, position, thickness, borderStyle } = border;
        const new_border = new Border(v4(), isEnabled, fillType, color, position, thickness, borderStyle);
        actions.push({ target: shapes[i], value: new_border });
    }
    return actions;
}
export function get_actions_border_color(shapes: Shape[], index: number, color: Color) {
    const actions: BorderColorAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}
export function get_actions_border_unify(shapes: Shape[]) {
    const actions: BordersReplaceAction[] = [];
    const borders = shapes[0].style.borders;
    for (let i = 1; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const new_borders: Border[] = [];
        for (let i = 0; i < borders.length; i++) {
            const border = borders[i];
            const { isEnabled, fillType, color, position, thickness, borderStyle } = border;
            const new_border = new Border(v4(), isEnabled, fillType, color, position, thickness, borderStyle);
            new_borders.push(new_border);
        }
        actions.push({ target: shapes[i], value: new_borders });
    }
    return actions;
}
export function get_actions_border_enabled(shapes: Shape[], index: number, value: boolean) {
    const actions: BorderEnableAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}
export function get_actions_border_delete(shapes: Shape[], index: number) {
    const actions: BorderDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index });
    }
    return actions;
}
export function get_actions_border_thickness(shapes: Shape[], index: number, thickness: number) {
    const actions: BorderThicknessAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: thickness });
    }
    return actions;
}
export function get_actions_border_position(shapes: Shape[], index: number, position: BorderPosition) {
    const actions: BorderPositionAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: position });
    }
    return actions;
}
export function get_actions_border_style(shapes: Shape[], index: number, style: 'dash' | 'solid') {
    const actions: BorderStyleAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const bs = new BorderStyle(0, 0);
        if (style === 'dash') {
            bs.gap = 10, bs.length = 10;
        }
        actions.push({ target: shapes[i], index, value: bs });
    }
    return actions;
}

// shadows
export function get_shadows(shapes: Shape[]): ShadowItem[] | 'mixed' {
    const shadows: ShadowItem[] = [];
    const shape = shapes[0];
    const style = shape.style;
    const compare_str: string[] = [];
    for (let i = 0, len = style.shadows.length; i < len; i++) {
        const shadow = style.shadows[i];
        const s = { id: i, shadow };
        shadows.push(s);
        const str = [
            shadow.isEnabled,
            shadow.blurRadius,
            shadow.spread,
            shadow.offsetX,
            shadow.offsetY,
            shadow.position,
            shadow.color.red,
            shadow.color.green,
            shadow.color.blue,
            shadow.color.alpha,].join('-');
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shapes[i].type === ShapeType.Cutout) continue;
        const len = shape.style.shadows.length;
        if (len !== shadows.length) return 'mixed';
        const s_bs = shape.style.shadows;
        for (let j = 0; j < len; j++) {
            const shadow = s_bs[j];
            const str = [
                shadow.isEnabled,
                shadow.blurRadius,
                shadow.spread,
                shadow.offsetX,
                shadow.offsetY,
                shadow.position,
                shadow.color.red,
                shadow.color.green,
                shadow.color.blue,
                shadow.color.alpha,].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }
    return shadows;
}

export function get_actions_shadow_unify(shapes: Shape[]) {
    const actions: ShadowReplaceAction[] = [];
    const shadows = shapes[0].style.shadows;
    for (let i = 1; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const new_shadows: Shadow[] = [];
        for (let i = 0; i < shadows.length; i++) {
            const shadow = shadows[i];
            const { isEnabled, blurRadius, color, position, spread, offsetX, offsetY } = shadow;
            const new_shadow = new Shadow(v4(), isEnabled, blurRadius, color, offsetX, offsetY, spread, position);
            new_shadows.push(new_shadow);
        }
        actions.push({ target: shapes[i], value: new_shadows });
    }
    return actions;
}

export function get_actions_add_shadow(shapes: Shape[], shadow: Shadow) {
    const actions: ShadowAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, blurRadius, color, position, spread, offsetX, offsetY } = shadow;
        const new_shadow = new Shadow(v4(), isEnabled, blurRadius, color, offsetX, offsetY, spread, position);
        actions.push({ target: shapes[i], value: new_shadow });
    }
    return actions;
}

export function get_actions_shadow_delete(shapes: Shape[], index: number) {
    const actions: ShadowDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index });
    }
    return actions;
}

export function get_actions_shadow_enabled(shapes: Shape[], index: number, value: boolean) {
    const actions: ShadowEnableAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}

export function get_actions_shadow_position(shapes: Shape[], index: number, position: ShadowPosition) {
    const actions: ShadowPositionAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: position });
    }
    return actions;
}

export function get_actions_shadow_color(shapes: Shape[], index: number, color: Color) {
    const actions: ShadowColorAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}

export function get_actions_shadow_blur(shapes: Shape[], index: number, blur: number) {
    const actions: ShadowBlurRadiusAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: blur });
    }
    return actions;
}

export function get_actions_shadow_spread(shapes: Shape[], index: number, spread: number) {
    const actions: ShadowSpreadAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: spread });
    }
    return actions;
}
export function get_actions_shadow_offsetx(shapes: Shape[], index: number, offsetx: number) {
    const actions: ShadowOffsetXAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: offsetx });
    }
    return actions;
}
export function get_actions_shadow_offsety(shapes: Shape[], index: number, offsety: number) {
    const actions: ShadowOffsetYAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: offsety });
    }
    return actions;
}

//export cutout
export function get_export_formats(shapes: Shape[]): FormatItems[] | 'mixed' {
    const formats: FormatItems[] = [];
    const shape = shapes[0];
    const options = shape.exportOptions;
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

export function get_actions_export_format_unify(shapes: Shape[], formats: ExportFormat[], option?: boolean): ExportFormatReplaceAction[] {
    const actions: ExportFormatReplaceAction[] = [];
    const options = shapes[0].exportOptions;
    if (options && !option) {
        for (let i = 1; i < shapes.length; i++) {
            const new_formats: ExportFormat[] = [];
            for (let i = 0; i < options.exportFormats.length; i++) {
                const format = options.exportFormats[i];
                const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
                const new_format = new ExportFormat(v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
                new_formats.push(new_format);
            }
            actions.push({ target: shapes[i], value: new_formats });
        }
    } else {
        for (let i = 0; i < shapes.length; i++) {
            const new_formats: ExportFormat[] = [];
            for (let i = 0; i < formats.length; i++) {
                const format = formats[i];
                const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
                const new_format = new ExportFormat(v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
                new_formats.push(new_format);
            }
            actions.push({ target: shapes[i], value: new_formats });
        }
    }

    return actions;
}

export function get_actions_add_export_format(shapes: Shape[], formats: ExportFormat[]) {
    const actions: ExportFormatAddAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const new_formats: ExportFormat[] = [];
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            const { scale, name, namingScheme, fileFormat, absoluteSize, visibleScaleType } = format;
            const new_format = new ExportFormat(v4(), absoluteSize, fileFormat, name, namingScheme, scale, visibleScaleType);
            new_formats.push(new_format);
        }
        actions.push({ target: shapes[i], value: new_formats });
    }
    return actions;
}

export function get_actions_export_format_delete(shapes: Shape[], index: number) {
    const actions: ExportFormatDeleteAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index });
    }
    return actions;
}

export function get_actions_export_format_scale(shapes: Shape[], index: number, scale: number) {
    const actions: ExportFormatScaleAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: scale });
    }
    return actions;
}

export function get_actions_export_format_name(shapes: Shape[], index: number, name: string) {
    const actions: ExportFormatNameAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: name });
    }
    return actions;
}
export function get_actions_export_format_perfix(shapes: Shape[], index: number, perfix: ExportFormatNameingScheme) {
    const actions: ExportFormatPerfixAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: perfix });
    }
    return actions;
}
export function get_actions_export_format_file_format(shapes: Shape[], index: number, fileFormat: ExportFileFormat) {
    const actions: ExportFormatFileFormatAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: shapes[i], index, value: fileFormat });
    }
    return actions;
}