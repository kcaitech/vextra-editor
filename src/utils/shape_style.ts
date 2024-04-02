import {
    Color, Fill, Shape, Border, BorderEnableAction, BorderAddAction, BorderDeleteAction, BordersReplaceAction,
    BorderThicknessAction, BorderPositionAction, BorderStyleAction, BorderPosition, BorderStyle, Shadow,
    ShadowReplaceAction, ShadowAddAction, ShadowDeleteAction, ShadowEnableAction, ShadowPositionAction,
    ShadowPosition, ShadowColorAction, ShadowBlurRadiusAction, ShadowSpreadAction, ShadowOffsetXAction,
    ShadowOffsetYAction, ExportFormat, ExportFormatReplaceAction, ExportFormatAddAction, ExportFileFormat,
    ExportFormatNameingScheme, ExportVisibleScaleType, ExportFormatDeleteAction, ExportFormatScaleAction,
    ExportFormatNameAction, ExportFormatPerfixAction, ExportFormatFileFormatAction, ShapeType, ShapeView, adapt2Shape,
    BatchAction, BatchAction2, BatchAction3, BatchAction4, Stop, BatchAction5, GradientType, FillType, GroupShapeView, cloneGradient, Gradient, BasicArray, MarkerType, CornerType, SideType
} from "@kcdesign/data";
import { v4 } from "uuid";
import { flattenShapes } from "./cutout";
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
export function get_fills(shapes: ShapeView[] | Shape[]): FillItem[] | 'mixed' {
    const fills: FillItem[] = [];
    const shape = shapes[0];
    const stylefills = shape?.getFills() || [];
    const compare_str: string[] = [];
    const has_g_str: string[] = [];
    for (let i = 0, len = stylefills.length; i < len; i++) {
        const fill = stylefills[i];
        const f = { id: i, fill };
        fills.push(f);
        const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue, fill.fillType].join('-');
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
        if (len !== fills.length) return 'mixed';
        const s_fs = stylefills;
        for (let j = 0; j < len; j++) {
            const fill = s_fs[j];
            const str = [fill.isEnabled, fill.color.red, fill.color.green, fill.color.blue, fill.color.blue, fill.fillType].join('-');
            if (str !== compare_str[j]) return 'mixed';
            if (fill.fillType === FillType.SolidColor) continue;
            if (fill.gradient) {
                if (has_g_str[j] !== get_gradient_str(fill.gradient)) return 'mixed';
            } else {
                if (has_g_str[j] !== 'undefined') return 'mixed';
            }
        }
    }
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

export function get_actions_add_fill(shapes: ShapeView[], fill: Fill) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, fillType, color, contextSettings } = fill;
        const new_fill = new Fill(new BasicArray(), v4(), isEnabled, fillType, color);
        new_fill.contextSettings = contextSettings;
        actions.push({ target: (shapes[i]), value: new_fill });
    }
    return actions;
}
export function get_aciton_gradient(shapes: ShapeView[], index: number, type: 'fills' | 'borders') {
    const actions: BatchAction4[] = [];
    for (let i = 0, l = shapes.length; i < l; i++) {
        actions.push({ target: shapes[i], index, type });
    }
    return actions;
}
export function get_aciton_gradient_stop(shapes: ShapeView[], index: number, value: any, type: 'fills' | 'borders') {
    const actions: BatchAction5[] = [];
    for (let i = 0, l = shapes.length; i < l; i++) {
        actions.push({ target: shapes[i], index, value, type });
    }
    return actions;
}

export function get_actions_fill_color(shapes: ShapeView[], index: number, color: Color) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: color });
    }
    return actions;
}
export function get_actions_fill_unify(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let fills: Fill[] = [];
    let s = 0;
    while (fills.length < 1 && s < shapes.length) {
        fills = shapes[s]?.getFills();
        s++;
    }
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout || i === s - 1) continue;
        const new_fills: Fill[] = [];
        for (let i = 0; i < fills.length; i++) {
            const fill = fills[i];
            const { isEnabled, fillType, color, contextSettings } = fill;
            const new_fill = new Fill(new BasicArray(), v4(), isEnabled, fillType, color);
            if (fill.gradient) {
                const _g = cloneGradient(fill.gradient);
                new_fill.gradient = _g;
            }
            new_fill.contextSettings = contextSettings;
            new_fills.push(new_fill);
        }
        actions.push({ target: (shapes[i]), value: new_fills });
    }
    return actions;
}
export function get_actions_fill_enabled(shapes: ShapeView[], index: number, value: boolean) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}
export function get_actions_filltype(shapes: ShapeView[], index: number, value: FillType) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value });
    }
    return actions;
}
export function get_actions_fill_delete(shapes: ShapeView[], index: number) {
    const actions: BatchAction3[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index });
    }
    return actions;
}

// borders
export function get_borders(shapes: (ShapeView[] | Shape[])): BorderItem[] | 'mixed' {
    if (shapes.length === 0) return [];
    const borders: BorderItem[] = [];
    const shape = shapes[0];
    const styleborders = shape.getBorders() || [];
    const compare_str: string[] = [];
    const has_g_str: string[] = [];
    for (let i = 0, len = styleborders.length; i < len; i++) {
        const border = styleborders[i];
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
            border.position,
            border.fillType
        ].join('-');
        if (border.gradient) {
            const g_str = get_gradient_str(border.gradient);
            has_g_str.push(g_str);
        } else {
            has_g_str.push('undefined');
        }
        compare_str.push(str);
    }
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shapes[i].type === ShapeType.Cutout) continue;
        const styleborders = shape.getBorders();
        const len = styleborders.length;
        if (len !== borders.length) return 'mixed';
        const s_bs = styleborders;
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
                border.position,
                border.fillType
            ].join('-');
            if (str !== compare_str[j]) return 'mixed';
            if (border.fillType === FillType.SolidColor) continue;
            if (border.gradient) {
                if (has_g_str[j] !== get_gradient_str(border.gradient)) return 'mixed';
            } else {
                if (has_g_str[j] !== 'undefined') return 'mixed';
            }
        }
    }
    return borders;
}
export function get_actions_add_boder(shapes: ShapeView[], border: Border) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, fillType, color, position, thickness, borderStyle, cornerType, sideSetting } = border;
        const new_border = new Border(new BasicArray(), v4(), isEnabled, fillType, color, position, thickness, borderStyle, cornerType, sideSetting);
        actions.push({ target: (shapes[i]), value: new_border });
    }
    return actions;
}
export function get_actions_border_color(shapes: ShapeView[], index: number, color: Color) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: color });
    }
    return actions;
}
export function get_actions_border_unify(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let borders: Border[] = [];
    let s = 0;
    while (borders.length < 1 && s < shapes.length) {
        borders = shapes[s]?.getBorders();
        s++;
    }
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout || i === s - 1) continue;
        const new_borders: Border[] = [];
        for (let i = 0; i < borders.length; i++) {
            const border = borders[i];
            const { isEnabled, fillType, color, position, thickness, borderStyle, cornerType, sideSetting } = border;
            const new_border = new Border(new BasicArray(), v4(), isEnabled, fillType, color, position, thickness, borderStyle, cornerType, sideSetting);
            if (border.gradient) {
                const _g = cloneGradient(border.gradient);
                new_border.gradient = _g;
            }
            new_borders.push(new_border);
        }
        actions.push({ target: (shapes[i]), value: new_borders });
    }
    return actions;
}
export function get_actions_border_enabled(shapes: ShapeView[], index: number, value: boolean) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value });
    }
    return actions;
}
export function get_actions_border_delete(shapes: ShapeView[], index: number) {
    const actions: BatchAction3[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index });
    }
    return actions;
}
export function get_actions_border_thickness(shapes: ShapeView[], index: number, thickness: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: thickness });
    }
    return actions;
}
export function get_actions_border_position(shapes: ShapeView[], index: number, position: BorderPosition) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: position });
    }
    return actions;
}
export function get_actions_border_style(shapes: ShapeView[], index: number, style: 'dash' | 'solid') {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const bs = new BorderStyle(0, 0);
        if (style === 'dash') {
            bs.gap = 10, bs.length = 10;
        }
        actions.push({ target: (shapes[i]), index, value: bs });
    }
    return actions;
}

export function get_actions_border(shapes: ShapeView[], index: number, value: any) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: value });
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
export function get_actions_border_exchange(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        actions.push({ target: (shapes[i]), value: undefined });
    }
    return actions;
}

// shadows
export function get_shadows(shapes: ShapeView[]): ShadowItem[] | 'mixed' {
    const shadows: ShadowItem[] = [];
    const shape = shapes[0];
    const styleshadows = shape?.getShadows();
    const compare_str: string[] = [];
    for (let i = 0, len = styleshadows.length; i < len; i++) {
        const shadow = styleshadows[i];
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
        const styleshadows = shape.getShadows();
        const len = styleshadows.length;
        if (len !== shadows.length) return 'mixed';
        const s_bs = styleshadows;
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

export function get_actions_shadow_unify(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let shadows: Shadow[] = [];
    let s = 0;
    while (shadows.length < 1 && s < shapes.length) {
        shadows = shapes[s]?.getShadows();
        s++;
    }
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout || i === s - 1) continue;
        const new_shadows: Shadow[] = [];
        for (let i = 0; i < shadows.length; i++) {
            const shadow = shadows[i];
            const { isEnabled, blurRadius, color, position, spread, offsetX, offsetY } = shadow;
            const new_shadow = new Shadow(new BasicArray(), v4(), isEnabled, blurRadius, color, offsetX, offsetY, spread, position);
            new_shadows.push(new_shadow);
        }
        actions.push({ target: shapes[i], value: new_shadows });
    }
    return actions;
}

export function get_actions_add_shadow(shapes: ShapeView[], shadow: Shadow) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, blurRadius, color, position, spread, offsetX, offsetY } = shadow;
        const new_shadow = new Shadow(new BasicArray(), v4(), isEnabled, blurRadius, color, offsetX, offsetY, spread, position);
        actions.push({ target: shapes[i], value: new_shadow });
    }
    return actions;
}

export function get_actions_shadow_delete(shapes: ShapeView[], index: number) {
    const actions: BatchAction3[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index });
    }
    return actions;
}

export function get_actions_shadow_enabled(shapes: ShapeView[], index: number, value: boolean) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value });
    }
    return actions;
}

export function get_actions_shadow_position(shapes: ShapeView[], index: number, position: ShadowPosition) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: position });
    }
    return actions;
}

export function get_actions_shadow_color(shapes: ShapeView[], index: number, color: Color) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], index, value: color });
    }
    return actions;
}

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
    const actions: ExportFormatPerfixAction[] = [];
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



export function get_borders_corner(shapes: ShapeView[], index: number): false | CornerType {
    const shape = shapes[0];
    const styleborders = shape.getBorders() || [];
    const corner = styleborders[index].cornerType;
    const mixed = shapes.every(shape => {
        const borders = shape.getBorders() || [];
        return borders[index].cornerType === corner;
    });
    if (mixed) {
        return corner;
    } else {
        return false;
    }
}

export function get_borders_side(shapes: ShapeView[], index: number): false | SideType {
    const shape = shapes[0];
    const styleborders = shape.getBorders() || [];
    const side = styleborders[index].sideSetting.sideType;
    const mixed = shapes.every(shape => {
        const borders = shape.getBorders() || [];
        return borders[index].sideSetting.sideType === side;
    });
    if (mixed) {
        return side;
    } else {
        return false;
    }
}