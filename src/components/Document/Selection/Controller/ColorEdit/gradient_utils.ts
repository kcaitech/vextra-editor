import { Context } from "@/context";
import { Color, Stop, ShapeView } from "@kcdesign/data";

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
            return { color, index: i };
        } else if (position > stops[i].position && i === stops.length - 1) {
            const { red, green, blue, alpha } = stop.color;
            const n_alpha = (alpha + 1) / 2;
            const color = new Color(n_alpha, red, green, blue);
            return { color, index: i + 1 };
        }
    }
}

export const get_gradient = (context: Context, shape: ShapeView) => {
    const locat = context.color.locat;
    if (!locat) return;
    const gradient_type = shape.style[locat.type];
    const gradient = gradient_type[locat.index].gradient;
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
