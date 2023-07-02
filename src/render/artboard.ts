import { Artboard } from "@kcdesign/data";
import { ShapeType } from "@kcdesign/data";
import { Color } from "@kcdesign/data";
import { renderGroupChilds as gR } from "@/render/group";

const defaultColor = new Color(1, 255, 255, 255);

export function render(h: Function, shape: Artboard, comsMap: Map<ShapeType, any>, reflush?: number) {
    if (!shape.isVisible) return;
    const ab_props: any = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
        preserveAspectRatio: "xMinYMin meet",
        reflush,
        overflow: "hidden",
    }
    const childs = [];
    const frame = shape.frame;
    ab_props.x = frame.x, ab_props.y = frame.y, ab_props.width = frame.width, ab_props.height = frame.height;
    ab_props.viewBox = `0 0 ${frame.width} ${frame.height}`;

    // background
    if (shape.hasBackgroundColor) {
        const color = shape.backgroundColor || defaultColor;
        childs.push(h("rect", {
            x: 0, y: 0, width: frame.width, height: frame.height,
            fill: "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")"
        }))
    }
    childs.push(...gR(h, shape, comsMap));

    // artboard单独一个svg节点，需要设置overflow
    return h('svg', ab_props, childs);
}