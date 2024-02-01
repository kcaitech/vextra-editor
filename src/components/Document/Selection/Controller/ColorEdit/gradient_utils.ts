import { Context } from "@/context";
import { flattenShapes } from "@/utils/cutout";
import { Color, Stop, ShapeView, ShapeType, GroupShapeView } from "@kcdesign/data";
import { v4 } from "uuid";

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
    let gradient_type = shape.style[locat.type];
    if(shape.type === ShapeType.Group && !(shape as GroupShapeView).data.isBoolOpShape) {
        const shapes = flattenShapes(shape.childs).filter(s => s.type !== ShapeType.Group || (s as GroupShapeView).data.isBoolOpShape);
        gradient_type = shapes[0].style[locat.type];
    }
    const index = gradient_type.length - locat.index - 1;
    const gradient = gradient_type[index].gradient;
    return gradient;
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
