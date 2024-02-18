import { Context } from "@/context";
import { flattenShapes } from "@/utils/cutout";
import { Color, Stop, ShapeView, ShapeType, GroupShapeView, Gradient, GradientType, BasicArray, Point2D } from "@kcdesign/data";
import { importGradient } from "@kcdesign/data/dist/data/baseimport";
import { v4 } from "uuid";

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
            const c = i === 0 ? stop.color : stops[i - 1].color;
            const { red, green, blue, alpha } = c;
            const n_alpha = i === 0 ? (alpha + 1) / 2 : (alpha + stop.color.alpha) / 2;
            const color = new Color(n_alpha, red, green, blue);
            return { color, index: i, id: v4() };
        } else if (position > stops[i].position && i === stops.length - 1) {
            const { red, green, blue, alpha } = stop.color;
            const n_alpha = (alpha + 1) / 2;
            const color = new Color(n_alpha, red, green, blue);
            return { color, index: i + 1, id: v4() };
        }
    }
}

export const get_gradient = (context: Context, shape: ShapeView) => {
    const locat = context.color.locat;
    if (!locat || !shape || !shape.style) return;
    if (locat.type !== 'text') {
        let gradient_type = shape.style[locat.type];
        if (shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
            const shapes = flattenShapes(shape.childs).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
            gradient_type = shapes[0].style[locat.type];
        }
        const gradient = gradient_type[locat.index].gradient;
        return gradient;
    } else {
        return context.color.gradient;
    }
}

export const get_temporary_stop = (position: number, dot1: { x: number, y: number }, dot2: { x: number, y: number }, shape: ShapeView, context: Context) => {
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
        let elipseLength = undefined;
        if (grad_type === GradientType.Radial) {
            elipseLength = 1;
        }
        new_gradient = new Gradient(from as Point2D, to as Point2D, grad_type, stops, elipseLength);
    }
    return new_gradient;
}

export const getTextIndexAndLen = (context: Context) => {
    const selection = context.selection.textSelection;
    const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
    const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
    return { textIndex, selectLength }
}

export const isSelectText = (context: Context) => {
    const selection = context.selection.textSelection;
    if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
        return false
    } else {
        return true
    }
}