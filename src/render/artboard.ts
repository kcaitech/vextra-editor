import { Artboard } from "@kcdesign/data";
import { ShapeType } from "@kcdesign/data";
import { Color } from "@kcdesign/data";
import { renderGroupChilds as gR } from "@/render/group";

const defaultColor = new Color(1, 255, 255, 255);
// artboard单独一个svg节点，需要设置overflow
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
    /**
     * <svg>
     *   <svg></svg>
     * </svg>
     * 当一个<svg />里面嵌套一个<svg />(如上结构)时，会无法给里面的<svg />设置旋转属性，这里利用foreignObject隔离(如下结构)这种嵌套
     * <svg>
     *   <foreignObject>
     *      <div>
     *          <svg></svg>   <----真实展示的元素
     *      </div>
     *   </foreignObject>
     * </svg>
     */
    if (shape.rotation) {
        const foreign_object_props = {
            x: frame.x,
            y: frame.y,
            width: frame.width,
            height: frame.height,
            overflow: "visible",
        }
        ab_props.x = 0, ab_props.y = 0;
        ab_props.style = `transform-origin: center center; transform: rotate(${shape.rotation}deg)`;
        const div_props = {
            width: frame.width,
            height: frame.height,
            overflow: "visible",
        }
        return h('foreignObject', foreign_object_props, h('div', div_props, h('svg', ab_props, childs)));
    } else {
        return h('svg', ab_props, childs);
    }
}