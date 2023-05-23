import { Color } from "@kcdesign/data";
import { Shape } from "@kcdesign/data";
import { toHex } from "@/utils/color"
export function render(h: Function, shape: Shape, reflush?: number) {
    if (!shape.isVisible) return;
    const frame = shape.frame;
    const path = shape.getPath(true);
    const border = shape.style.borders.at(-1);
    const borderColor = shape.style.borders.at(-1)?.color || new Color(1, 0, 0, 0);
    const stroke = toHex({ red: borderColor.red, green: borderColor.green, blue: borderColor.blue, alpha: borderColor.alpha });
    const fillColor = shape.style.fills.at(-1)?.color || new Color(1, 0, 0, 0);
    const fill = toHex({ red: fillColor.red, green: fillColor.green, blue: fillColor.blue, alpha: fillColor.alpha });

    const props: any = {}
    if (reflush) props.reflush = reflush;

    if (shape.isFlippedHorizontal || shape.isFlippedVertical || shape.rotation) {
        const cx = frame.x + frame.width / 2;
        const cy = frame.y + frame.height / 2;
        const style: any = {}
        style.transform = "translate(" + cx + "px," + cy + "px) "
        if (shape.isFlippedHorizontal) style.transform += "rotateY(180deg) "
        if (shape.isFlippedVertical) style.transform += "rotateX(180deg) "
        if (shape.rotation) style.transform += "rotate(" + shape.rotation + "deg) "
        style.transform += "translate(" + (-cx + frame.x) + "px," + (-cy + frame.y) + "px)"
        props.style = style;
    }
    else {
        props.transform = `translate(${frame.x},${frame.y})`
    }
    props.d = path;
    props["fill-opacity"] = fillColor.alpha;
    props.fill = fill;
    props.stroke = stroke;
    props["stroke-width"] = border?.thickness || 1;
    return h('path', props);
}