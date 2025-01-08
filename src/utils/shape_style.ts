import {
    Color,
    Fill,
    Shape,
    Border,
    BorderPosition,
    BorderStyle,
    Shadow,
    ShadowPosition,
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
    BatchAction3,
    BatchAction4,
    BatchAction5,
    FillType,
    cloneGradient,
    Gradient,
    BasicArray,
    MarkerType,
    CornerType,
    SideType,
    Blur,
    BlurType,
    Point2D,
    ImageScaleMode,
    PaintFilter,
    PatternTransform,
    FillMask,
    ShadowMask,
    BlurMask,
    StrokePaint,
    BorderSideSetting
} from "@kcdesign/data";
import { v4 } from "uuid";

interface FillItem {
    id: number,
    fill: Fill
}

interface StrokePaintItem {
    id: number
    strokePaint: StrokePaint
}
export interface BorderData {
    position: BorderPosition | string
    cornerType: CornerType | string
    borderStyle: BorderStyle | string
    sideSetting: BorderSideSetting | string
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
export function get_fills(shapes: ShapeView[] | Shape[]): FillItem[] | 'mixed' | 'mask' {
    const fills: FillItem[] = [];
    const shape = shapes[0];
    const stylefills = shape?.getFills() || [];
    const compare_str: string[] = [];
    const has_g_str: string[] = [];
    const image_str: string[] = [];
    const mask = shape.style.fillsMask ?? 'undefined';
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
        if (shape.style.fillsMask) {
            fill_mask.push(shape.style.fillsMask)
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

export function get_actions_add_mask(shapes: ShapeView[], id: string) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), value: id });
    }
    return actions;
}

// export function get_actions_add_shadowmask(shapes: ShapeView[], id: string) {
//     const actions: BatchAction2[] = [];
//     for (let i = 0; i < shapes.length; i++) {
//         if (shapes[i].type === ShapeType.Cutout) continue;
//         actions.push({ target: (shapes[i]), value: id });
//     }
//     return actions;
// }

export function get_actions_del_mask(shapes: ShapeView[], value: undefined) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), value });
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
export function get_actions_fill_opacity(shapes: ShapeView[], index: number, opacity: number) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value: opacity });
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
            const { isEnabled, fillType, color, contextSettings, imageRef, imageScaleMode, rotation, scale, originalImageWidth, originalImageHeight, paintFilter, transform } = fill;
            const new_fill = new Fill(new BasicArray(), v4(), isEnabled, fillType, color);
            if (fill.gradient) {
                const _g = cloneGradient(fill.gradient);
                new_fill.gradient = _g;
            }
            new_fill.imageRef = imageRef;
            new_fill.imageScaleMode = imageScaleMode;
            new_fill.rotation = rotation;
            new_fill.scale = scale;
            new_fill.originalImageWidth = originalImageWidth;
            new_fill.originalImageHeight = originalImageHeight;
            new_fill.originalImageHeight = originalImageHeight;
            if (paintFilter) {
                new_fill.paintFilter = new PaintFilter(paintFilter.exposure, paintFilter.contrast, paintFilter.saturation, paintFilter.temperature, paintFilter.tint, paintFilter.shadow, paintFilter.hue);
            }
            if (transform) {
                new_fill.transform = new PatternTransform(transform.m00, transform.m01, transform.m02, transform.m10, transform.m11, transform.m12);
            }
            const imageMgr = fill.getImageMgr();
            imageMgr && new_fill.setImageMgr(imageMgr);
            new_fill.contextSettings = contextSettings;
            new_fills.push(new_fill);
        }
        actions.push({ target: (shapes[i]), value: new_fills });
    }
    return actions;
}

export function get_actions_fill_mask(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let fills: Fill[] = [];
    const id = shapes[0].style.fillsMask!
    fills = (shapes[0].style.getStylesMgr()?.getSync(id) as FillMask).fills
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const new_fills: Fill[] = [];
        for (let i = 0; i < fills.length; i++) {
            const fill = fills[i];
            const { isEnabled, fillType, color, contextSettings, imageRef, imageScaleMode, rotation, scale, originalImageWidth, originalImageHeight, paintFilter, transform } = fill;
            const new_fill = new Fill(new BasicArray(), v4(), isEnabled, fillType, color);
            if (fill.gradient) {
                const _g = cloneGradient(fill.gradient);
                new_fill.gradient = _g;
            }
            new_fill.imageRef = imageRef;
            new_fill.imageScaleMode = imageScaleMode;
            new_fill.rotation = rotation;
            new_fill.scale = scale;
            new_fill.originalImageWidth = originalImageWidth;
            new_fill.originalImageHeight = originalImageHeight;
            new_fill.originalImageHeight = originalImageHeight;
            if (paintFilter) {
                new_fill.paintFilter = new PaintFilter(paintFilter.exposure, paintFilter.contrast, paintFilter.saturation, paintFilter.temperature, paintFilter.tint, paintFilter.shadow, paintFilter.hue);
            }
            if (transform) {
                new_fill.transform = new PatternTransform(transform.m00, transform.m01, transform.m02, transform.m10, transform.m11, transform.m12);
            }
            const imageMgr = fill.getImageMgr();
            imageMgr && new_fill.setImageMgr(imageMgr);
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

export function get_actions_image_scale_mode(shapes: ShapeView[], index: number, value: ImageScaleMode) {
    const actions: BatchAction[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), index, value });
    }
    return actions;
}

export function get_actions_image_ref(shapes: ShapeView[], index: number, value: any) {
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
const initBorder = {
    position: BorderPosition.Center,
    cornerType: CornerType.Miter,
    borderStyle: new BorderStyle(0, 0),
    sideSetting: new BorderSideSetting(SideType.Normal, 1, 1, 1, 1)
}
export function get_borders(shapes: (ShapeView[] | Shape[])): { border: BorderData, stroke_paints: StrokePaintItem[] | 'mixed' } {
    if (shapes.length === 0) return { border: initBorder, stroke_paints: [] };
    const strokePaints: StrokePaintItem[] = [];

    const shape = shapes[0];
    let styleborders1 = shape.getBorders();
    let s = 0;
    while (!styleborders1.strokePaints && s < shapes.length) {
        styleborders1 = shapes[s].getBorders();
        s++;
    }
    const compare_str: string[] = [];
    const has_g_str: string[] = [];
    const border: BorderData = {
        position: styleborders1.position,
        cornerType: styleborders1.cornerType,
        borderStyle: styleborders1.borderStyle,
        sideSetting: styleborders1.sideSetting
    }
    for (let i = 0, len = styleborders1.strokePaints.length; i < len; i++) {
        const strokePaint = styleborders1.strokePaints[i];
        const b = { id: i, strokePaint };
        strokePaints.push(b);
        const str = [
            strokePaint.isEnabled,
            strokePaint.color.red,
            strokePaint.color.green,
            strokePaint.color.blue,
            strokePaint.color.alpha,
            strokePaint.fillType
        ].join('-');
        if (strokePaint.gradient) {
            const g_str = get_gradient_str(strokePaint.gradient);
            has_g_str.push(g_str);
        } else {
            has_g_str.push('undefined');
        }
        compare_str.push(str);
    }
    const result: any = { border, stroke_paints: strokePaints };
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shapes[i].type === ShapeType.Cutout) continue;
        const styleborders = shape.getBorders();
        const len = styleborders.strokePaints.length;
        const s_bs = styleborders.strokePaints;

        if (len > 0 && styleborders.position !== border.position) {
            border.position = 'mixed';
        }
        if (len > 0 && styleborders.cornerType !== border.cornerType) {
            border.cornerType = 'mixed';
        }
        if (len > 0 && typeof border.borderStyle !== 'string' &&
            styleborders.borderStyle.gap !== border.borderStyle.gap &&
            styleborders.borderStyle.length !== border.borderStyle.length) {
            border.borderStyle = 'mixed'; 
        }
        const sideStr = getDideStr(styleborders.sideSetting, border.sideSetting);
        if (len > 0 && !sideStr) {
            border.sideSetting = 'mixed';
        }
        if (len !== strokePaints.length) {
            result.stroke_paints = 'mixed';
            continue;
        };
        for (let j = 0; j < len; j++) {
            const styleborder = s_bs[j];
            const str = [
                styleborder.isEnabled,
                styleborder.color.red,
                styleborder.color.green,
                styleborder.color.blue,
                styleborder.color.alpha,
                styleborder.fillType
            ].join('-');
            if (str !== compare_str[j]) return { border, stroke_paints: 'mixed' };
            if (styleborder.fillType === FillType.SolidColor) continue;
            if (styleborder.gradient) {
                if (has_g_str[j] !== get_gradient_str(styleborder.gradient)) return { border, stroke_paints: 'mixed' };
            } else {
                if (has_g_str[j] !== 'undefined') return { border, stroke_paints: 'mixed' };
            }
        }
    }
    result.border = border;
    return result;
}

const getDideStr = (side: BorderSideSetting, v: BorderSideSetting | string) => {
    if (typeof v === 'string') return false;
    const str = [
        side.sideType,
        side.thicknessTop,
        side.thicknessRight,
        side.thicknessBottom,
        side.thicknessLeft
    ].join('-');
    const str2 = [
        v.sideType,
        v.thicknessTop,
        v.thicknessRight,
        v.thicknessBottom,
        v.thicknessLeft
    ].join('-');
    return str === str2;
}

export function get_actions_add_boder(shapes: ShapeView[], strokePaint: StrokePaint) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, fillType, color } = strokePaint;
        const newStrokePaint = new StrokePaint(new BasicArray(0), v4(), isEnabled, fillType, color);
        actions.push({ target: (shapes[i]), value: newStrokePaint });
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
    let borders: Border | undefined;
    let s = 0;
    while (!borders && s < shapes.length) {
        borders = shapes[s]?.getBorders();
        s++;
    }
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout || i === s - 1) continue;
        const newStrokePaints: StrokePaint[] = [];
        for (let i = 0; i < borders!.strokePaints.length; i++) {
            const strokePaint = borders!.strokePaints[i];
            const { isEnabled, fillType, color } = strokePaint;
            const newStrokePaint = new StrokePaint(new BasicArray(0), v4(), isEnabled, fillType, color);
            if (strokePaint.gradient) {
                const _g = cloneGradient(strokePaint.gradient);
                newStrokePaint.gradient = _g;
            }
            newStrokePaints.push(newStrokePaint);
        }
        actions.push({ target: (shapes[i]), value: newStrokePaints });
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

export function get_actions_border_thickness(shapes: ShapeView[], thickness: number) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: (shapes[i]), value: thickness });
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

export function get_actions_border_style(shapes: ShapeView[], style: 'dash' | 'solid') {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const bs = new BorderStyle(0, 0);
        if (style === 'dash') {
            bs.gap = 10, bs.length = 10;
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
export function get_shadows(shapes: ShapeView[]): ShadowItem[] | 'mixed' | 'mask' {
    const shadows: ShadowItem[] = [];
    const shape = shapes[0];
    const styleshadows = shape?.getShadows();
    const compare_str: string[] = [];
    const mask = shape.style.shadowsMask ?? 'undefined';
    const shadow_mask: string[] = [];
    shadow_mask.push(mask)
    for (let i = 0, len = styleshadows.length; i < len; i++) {
        const shadow = styleshadows[i];
        const s = { id: i, shadow };
        shadows.push(s);
        const str = [
            shadow.isEnabled,
            extend(shadow.blurRadius, shape),
            extend(shadow.spread, shape),
            extend(shadow.offsetX, shape),
            extend(shadow.offsetY, shape),
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
        if (shape.style.shadowsMask) {
            shadow_mask.push(shape.style.shadowsMask)
        } else {
            shadow_mask.push('undefined')
        }
        if (len !== shadows.length) return 'mixed';
        const s_bs = styleshadows;
        for (let j = 0; j < len; j++) {
            const shadow = s_bs[j];
            const str = [
                shadow.isEnabled,
                extend(shadow.blurRadius, shape),
                extend(shadow.spread, shape),
                extend(shadow.offsetX, shape),
                extend(shadow.offsetY, shape),
                shadow.position,
                shadow.color.red,
                shadow.color.green,
                shadow.color.blue,
                shadow.color.alpha,].join('-');
            if (str !== compare_str[j]) return 'mixed';
        }
    }

    const mask_b = shadow_mask.every(i => mask !== 'undefined' && i === mask)
    const mask_s = shadow_mask.some(i => i !== 'undefined')

    if (mask_b) return 'mask'
    if (mask_s) return 'mixed'

    return shadows;

    function extend(base: number, view: ShapeView) {
        // if (view.isVirtualShape) {
        //     let parent = view.parent;
        //     while (parent) {
        //         if (parent.uniformScale) base *= parent.uniformScale;
        //         parent = parent.parent;
        //     }
        // }
        return base;
    }
}

export function get_actions_shadow_mask(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let shadows: Shadow[] = [];
    let s = 0;
    const id = shapes[0].style.shadowsMask!
    shadows = (shapes[0].style.getStylesMgr()?.getSync(id) as ShadowMask).shadows

    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout || i === s - 1) continue;
        const new_shadows: Shadow[] = [];
        for (let i = 0; i < shadows.length; i++) {
            const shadow = shadows[i];
            const { isEnabled, blurRadius, color, position, spread, offsetX, offsetY, contextSettings } = shadow;
            const new_shadow = new Shadow(new BasicArray(), v4(), isEnabled, blurRadius, color, offsetX, offsetY, spread, position);
            new_shadow.contextSettings = contextSettings;
            new_shadows.push(new_shadow);
        }
        actions.push({ target: shapes[i], value: new_shadows });
    }
    return actions;
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
    const styleborders = shape.getBorders();
    if (!styleborders.strokePaints.length) return false;
    const corner = styleborders.cornerType;
    const mixed = shapes.every(shape => {
        const borders = shape.getBorders();
        return borders.cornerType === corner;
    });
    if (mixed) {
        return corner;
    } else {
        return false;
    }
}

export function get_borders_side(shapes: ShapeView[]): false | SideType {
    const shape = shapes[0];
    const styleborders = shape.getBorders();
    if (!styleborders.strokePaints.length) return false;
    const side = styleborders.sideSetting.sideType;
    const mixed = shapes.every(shape => {
        const borders = shape.getBorders();
        return borders.sideSetting.sideType === side;
    });
    if (mixed) {
        return side;
    } else {
        return false;
    }
}

export function get_blur(shapes: ShapeView[]): Blur | undefined | 'mixed' | 'mask' {
    const has_blur_shapes = shapes.filter(shape => shape.blur);

    if (has_blur_shapes.length === 0) return undefined;
    if (has_blur_shapes.length !== shapes.length) return 'mixed';
    const shape = has_blur_shapes[0];

    const mask = shape.style.blursMask ?? 'undefined';
    const blur_mask: string[] = [];
    blur_mask.push(mask)

    const firstBlur = shape.blur!;

    const blurs: (Blur | undefined)[] = [];

    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.style.blursMask) {
            blur_mask.push(shape.style.blursMask)
        } else {
            blur_mask.push('undefined')
        }
        blurs.push(shape.blur);
    }

    const b = blurs.every(blur => blur !== undefined && blur.type === firstBlur.type && blur.saturation === firstBlur.saturation)

    const mask_b = blur_mask.every(i => mask !== 'undefined' && i === mask)
    const mask_s = blur_mask.some(i => i !== 'undefined')

    if (mask_b) return 'mask';
    if (mask_s) return 'mixed';

    if (!b) return 'mixed';
    return firstBlur;
}

export function get_actions_add_blur(shapes: ShapeView[], blur: Blur) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, saturation, type, center } = blur;
        const new_blur = new Blur(new BasicArray(), isEnabled, new Point2D(center.x, center.y), saturation, type);
        actions.push({ target: (shapes[i]), value: new_blur });
    }
    return actions;
}

export function get_actions_blur_mask(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    const id = shapes[0].style.blursMask!;
    const blur = (shapes[0].style.getStylesMgr()?.getSync(id) as BlurMask).blur
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, saturation, type, center } = blur;
        const new_blur = new Blur(new BasicArray(), isEnabled, new Point2D(center.x, center.y), saturation, type);
        actions.push({ target: (shapes[i]), value: new_blur });
    }
    return actions;
}

export function get_actions_blur_unify(shapes: ShapeView[]) {
    const actions: BatchAction2[] = [];
    let blur: Blur;
    blur = shapes.findLast(shape => shape.style.blur !== undefined)?.style.blur as Blur;
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        const { isEnabled, saturation, type, center, motionAngle, radius } = blur;
        const new_blur = new Blur(new BasicArray(), isEnabled, new Point2D(center.x, center.y), saturation, type, motionAngle, radius);
        actions.push({ target: shapes[i], value: new_blur });
    }
    return actions;
}

export function get_actions_blur_enabled(shapes: ShapeView[], value: boolean) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], value });
    }
    return actions;
}

export function get_actions_blur_delete(shapes: ShapeView[]) {
    const actions: ShapeView[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push(shapes[i]);
    }
    return actions;
}

export function get_actions_blur_modify(shapes: ShapeView[], value: any) {
    const actions: BatchAction2[] = [];
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Cutout) continue;
        actions.push({ target: shapes[i], value });
    }
    return actions;
}