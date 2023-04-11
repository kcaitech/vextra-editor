import { Artboard } from "@kcdesign/data/data/artboard";
import { ShapeType } from "@kcdesign/data/data/shape";
import { Color } from "@kcdesign/data/data/style";
import { renderGroupChilds as gR } from "@/render/group";

const defaultColor = new Color(0, 255, 255, 255)

export function render(h: Function, shape: Artboard, comsMap: Map<ShapeType, any>, reflush?: number) {
    const childs = [];
    const frame = shape.frame;
    // background
    if (shape.hasBackgroundColor) {
        const color = shape.backgroundColor || defaultColor;
        childs.push(h("rect", {
            x: 0, y: 0, width: frame.width, height: frame.height,
            fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")",
            "fill-opacity": color ? color.alpha : 1
        }))
    }
    childs.push(...gR(h, shape, comsMap));
    // artboard单独一个svg节点，需要设置overflow
    return h('svg', {
        version:"1.1", 
        xmlns:"http://www.w3.org/2000/svg", 
        "xmlns:xlink":"http://www.w3.org/1999/xlink", 
        "xmlns:xhtml":"http://www.w3.org/1999/xhtml",
        preserveAspectRatio:"xMinYMin meet",
        width: frame.width,
        height: frame.height,
        viewBox: "0 0 " + frame.width + " " + frame.height,
        x: frame.x,
        y: frame.y,
        overflow: "hidden"
    }, childs);
}