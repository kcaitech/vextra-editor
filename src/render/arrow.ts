import { Shape } from '@kcdesign/data/data/shape';
import { Border } from '@kcdesign/data/data/style';
import { MarkerType } from '@kcdesign/data/data/classes'
import { toHex } from "@/utils/color"
import { Color } from "@kcdesign/data/data/baseclasses";
const handler: { [key: string]: (h: Function, shape: Shape, fill: string, stroke: string, fillColor: Color, path: string, border?: Border) => any } = {};

handler[MarkerType.FilledArrow] = function (h: Function, shape: Shape, fill: string, stroke: string, fillColor: Color, path: string, border?: Border): any {
    const frame = shape.frame
    const x = frame.x
    const y = frame.y
    const arrowPoint1X = x + 5
    const arrowPoint1Y = y + 5
    const arrowPoint2X = x + 5
    const arrowPoint2Y = y - 5
   
    return h("path", {
        d: `M${x} ${y} L${arrowPoint1X} ${arrowPoint1Y} L${arrowPoint2X} ${arrowPoint2Y} Z`,
        fill: fill,
        stroke: stroke,
        "stroke-width": border?.thickness || 1,
        "fill-opacity": fillColor.alpha,
    });
}

export function render(h: Function, shape: Shape, path?: string): Array<any> {
    const startMarker = shape.style.borders[0].startMarkerType

    const border = shape.style.borders.at(-1);
    const borderColor = shape.style.borders.at(-1)?.color || new Color(1, 0, 0, 0);
    const stroke = toHex({ red: borderColor.red, green: borderColor.green, blue: borderColor.blue, alpha: borderColor.alpha });
    const fillColor = shape.style.fills.at(-1)?.color || new Color(1, 0, 0, 0);
    const fill = toHex({ red: fillColor.red, green: fillColor.green, blue: fillColor.blue, alpha: fillColor.alpha });
    const elArr = new Array(); 
    path = path || shape.getPath(true).toString();
    elArr.push(handler[MarkerType.FilledArrow](h, shape, fill, stroke, fillColor, path, border));
    return elArr;
}