import { Artboard } from "@kcdesign/data/data/artboard";
import { BoolOp, ShapeType } from "@kcdesign/data/data/shape";
import { Color } from "@kcdesign/data/data/style";
import { renderGroupChilds as gR } from "@/render/group";

const defaultColor = new Color(0, 0, 0, 0)

export function render(h: Function, shape: Artboard, comsMap: Map<ShapeType, any>, reflush?: number) {
    // name
    // border
    // background

    const childs = [];
    // childs.push(h("text", {y: -5}, this.data.name));
    const frame = shape.frame;
    // background
    if (shape.hasBackgroundColor) {
        const color = shape.backgroundColor || defaultColor;
        childs.push(h("rect", {
            x: 0, y: 0, width: frame.width, height: frame.height,
            fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")",
            "fill-opacity": color ? color.alpha : 1,
            filter: "url(#artboard-shadow)"
        }))
    } else {
        childs.push(h("rect", { x: 0, y: 0, width: frame.width, height: frame.height, filter: "url(#artboard-shadow)" }))
    }
    childs.push(...gR(h, shape, comsMap));
    return h('g', { transform: 'translate(' + frame.x + ',' + frame.y + ')', class: "artboard", reflush }, childs);
}