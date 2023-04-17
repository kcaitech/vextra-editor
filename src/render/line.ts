import { Color } from "@kcdesign/data/data/baseclasses";
import { Shape } from "@kcdesign/data/data/shape";
import { toHex } from "@/utils/color"
export function render(h: Function, shape: Shape, reflush?: number) {
    const frame = shape.frame;
    const path = shape.getPath(true);
    const border = shape.style.borders.at(-1);
    const borderColor = shape.style.borders.at(-1)?.color || new Color(1, 0, 0, 0);
    const stroke = toHex({ red: borderColor.red, green: borderColor.green, blue: borderColor.blue, alpha: borderColor.alpha });
    const fillColor = shape.style.fills.at(-1)?.color || new Color(1, 0, 0, 0);
    const fill = toHex({ red: fillColor.red, green: fillColor.green, blue: fillColor.blue, alpha: fillColor.alpha });
    return h('path', {
        reflush,
        d: path,
        "fill-opacity": fillColor.alpha,
        fill,
        stroke,
        'stroke-width': border?.thickness || 1,
        transform: "translate(" + frame.x + " " + frame.y + ")",
    });
}