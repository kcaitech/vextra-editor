/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import {
    Color,
    Stop,
    ShapeView,
    ShapeType,
    Gradient,
    GradientType,
    BasicArray,
    Point2D,
    TextShapeView,
    AttrGetter,
    Fill,
    FillMask
} from "@kcdesign/data";
import { importGradient } from "@kcdesign/data";
import { v4 } from "uuid";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

export type GradientFrom = 'fills' | 'borders' | 'text';

export function to_rgba(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgba(" + options.red + "," + options.green + "," + options.blue + "," + options.alpha + ")";
}

export const get_add_gradient_color = (stops: Stop[], position: number) => {
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (position < stop.position) {
            let n_alpha;
            const c = i === 0 ? stop.color : stops[i - 1].color;
            const { red, green, blue, alpha } = c;
            if (i > 0) {
                const f_posi = stops[i - 1].position;
                const a_len = alpha - stop.color.alpha;
                const proportion = ((position - f_posi) * a_len) / (stop.position - f_posi);
                if (a_len === 0) {
                    n_alpha = alpha;
                } else {
                    n_alpha = a_len > 0 ? alpha - proportion : alpha + proportion;
                }
            } else {
                n_alpha = alpha;
            }
            const color = new Color(n_alpha, red, green, blue);
            return { color, index: i, id: v4() };
        } else if (position > stops[i].position && i === stops.length - 1) {
            const { red, green, blue, alpha } = stop.color;
            const color = new Color(alpha, red, green, blue);
            return { color, index: i + 1, id: v4() };
        }
    }
}
export const get_add_gradient_color2 = (stops: RGBACatch[], position: number) => {
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (position < stop.position) {
            let n_alpha;
            const c = i === 0 ? stop : stops[i - 1];
            const { R: red, G: green, B: blue, A: alpha } = c;
            if (i > 0) {
                const after_position = stops[i - 1].position;
                const a_len = alpha - stop.A;
                const proportion = ((position - after_position) * a_len) / (stop.position - after_position);
                if (a_len === 0) {
                    n_alpha = alpha;
                } else {
                    n_alpha = a_len > 0 ? alpha - proportion : alpha + proportion;
                }
            } else {
                n_alpha = alpha;
            }
            return { R: red, G: green, B: blue, A: n_alpha, position } as RGBACatch;
        } else if (position > stops[i].position && i === stops.length - 1) {
            const { R: red, G: green, B: blue, A: alpha } = stop;
            return { R: red, G: green, B: blue, A: alpha, position } as RGBACatch;;
        }
    }
}
export const get_gradient = (context: Context, shape: ShapeView) => {
    const locate = context.color.locate;
    if (!locate || !shape || !shape.style) return;
    if (locate.type !== 'text') {
        let fills: Fill[] = [];
        let maskId = locate.type === 'fills' ? shape.fillsMask : shape.borderFillsMask;
        if (maskId) {
            const mask = context.data.stylesMgr.getSync(maskId) as FillMask;
            fills = mask.fills;
        } else {
            fills = locate.type === 'fills' ? shape.getFills() : shape.getBorder().strokePaints;
        }
        if (!fills[locate.index]) return;
        return fills[locate.index].gradient;
    } else {
        if (shape.type !== ShapeType.Text) return;
        const { textIndex, selectLength } = getTextIndexAndLen(context);
        const editor = context.editor4TextShape(shape as TextShapeView)
        let format: AttrGetter
        const __text = (shape as TextShapeView).getText();
        format = __text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr())
        return format.gradient;
    }
}

export const get_temporary_stop = (position: number, dot1: { x: number, y: number }, dot2: {
    x: number,
    y: number
}, shape: ShapeView, context: Context) => {
    const x1 = dot1.x + ((dot2.x - dot1.x) * position);
    const y1 = dot1.y + ((dot2.y - dot1.y) * position);
    const gradient = get_gradient(context, shape);
    if (!gradient) return;
    const stop = get_add_gradient_color(gradient.stops, position);
    if (!stop) return
    return { x: x1, y: y1, color: stop.color };
}

/**
 * 计算椭圆弧的长度
 * @param a 圆弧的长轴
 * @param b 圆弧的短轴
 * @param theta 圆弧的弧度
 */
export function calculateArcLengthAtAngle(a: number, b: number, theta: number) {
    const stepSize = 0.01; // 分段大小
    let arcLength = 0;
    for (let t = 0; t < theta; t += stepSize) {
        const x = a * Math.cos(t);
        const y = b * Math.sin(t);
        const derivativeX = -a * Math.sin(t);
        const derivativeY = b * Math.cos(t);
        const segmentLength = Math.hypot(derivativeX, derivativeY) * stepSize;
        arcLength += segmentLength;
    }
    return arcLength;
}

export function getGradient(gradient: Gradient | undefined, grad_type: GradientType, color: Color) {
    let new_gradient: Gradient | undefined;
    if (gradient) {
        new_gradient = importGradient(gradient);
        new_gradient.gradientType = grad_type;
        if (grad_type === GradientType.Linear && gradient.gradientType !== GradientType.Linear) {
            new_gradient.from.y = new_gradient.from.y - (new_gradient.to.y - new_gradient.from.y);
            new_gradient.from.x = new_gradient.from.x - (new_gradient.to.x - new_gradient.from.x);
        } else if (gradient.gradientType === GradientType.Linear && grad_type !== GradientType.Linear) {
            new_gradient.from.y = new_gradient.from.y + (new_gradient.to.y - new_gradient.from.y) / 2;
            new_gradient.from.x = new_gradient.from.x + (new_gradient.to.x - new_gradient.from.x) / 2;
        }
        if (grad_type === GradientType.Radial && new_gradient.elipseLength === undefined) {
            new_gradient.elipseLength = 1;
        }
        new_gradient.stops[0].color = color;
    } else {
        const stops = new BasicArray<Stop>();
        const { alpha, red, green, blue } = color;
        stops.push(new Stop(new BasicArray(0), v4(), 0, new Color(alpha, red, green, blue)), new Stop(new BasicArray(1), v4(), 1, new Color(0, red, green, blue)))
        const from = grad_type === GradientType.Linear ? { x: 0.5, y: 0 } : { x: 0.5, y: 0.5 };
        const to = { x: 0.5, y: 1 };
        let ellipseLength = undefined;
        if (grad_type === GradientType.Radial) {
            ellipseLength = 1;
        }
        new_gradient = new Gradient(from as Point2D, to as Point2D, grad_type, stops, ellipseLength);
    }
    return new_gradient;
}

export const getTextIndexAndLen = (context: Context) => {
    const selection = context.selection.textSelection;
    const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
    const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
    if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
        return { textIndex, selectLength }
    } else {
        return { textIndex: 0, selectLength: Infinity }
    }
}

export const gradient_equals = (a: Gradient, b: Gradient) => {
    if (a.gradientType !== b.gradientType || a.elipseLength !== b.elipseLength || a.gradientOpacity !== b.gradientOpacity) {
        return false;
    }
    if (a.from.x !== b.from.x || a.from.y !== b.from.y || a.to.x !== b.to.x || a.to.y !== b.to.y) {
        return false;
    }
    if (a.stops.length !== b.stops.length) {
        return false;
    }
    for (let i = 0; i < a.stops.length; i++) {
        const stop1 = a.stops[i];
        const stop2 = b.stops[i];
        if (stop1.position !== stop2.position || !(stop1.color as Color).equals(stop2.color as Color)) {
            return false;
        }
    }
    return true;
}