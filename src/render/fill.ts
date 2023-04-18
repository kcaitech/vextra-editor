import { Shape } from "@kcdesign/data/data/shape";
import { Fill, FillType, Gradient } from "@kcdesign/data/data/style";
// import { ELArray, EL, h } from "./basic";
import { render as renderGradient } from "./gradient";
import { render as clippathR } from "./clippath"
import { objectId } from "@kcdesign/data/basic/objectid";
import * as types from "@kcdesign/data/data/classes"

const handler: { [key: string]: (h: Function, shape: Shape, fill: Fill, path: string) => any } = {};
handler[types.FillType.SolidColor] = function (h: Function, shape: Shape, fill: Fill, path: string): any {
    const color = fill.color;
    const frame = shape.frame;
    return h("path", {
        d: path,
        fill: "rgb(" + color.red + "," + color.green + "," + color.blue + ")",
        "fill-opacity": color ? color.alpha : 1,
        stroke: 'none',
        'stroke-width': 0
    });
}

handler[types.FillType.Gradient] = function (h: Function, shape: Shape, fill: Fill, path: string): any {
    const color = fill.color;
    const frame = shape.frame;
    const elArr = new Array();
    const g_ = renderGradient(h, fill.gradient as Gradient, frame);
    if (g_.node) {
        elArr.push(g_.node);
    }
    const gid = g_.id;
    const gStyle = g_.style;
    if (gStyle) {
        const id = "clippath-fill-" + objectId(fill);
        const cp = clippathR(h, shape, id, path);
        elArr.push(cp);
        elArr.push(h("foreignObject", {
            width: frame.width, height: frame.height, x: 0, y: 0,
            "clip-path": "url(#" + id + ")"
        },
            h("div", { width: "100%", height: "100%", style: gStyle })));
    }
    else {
        elArr.push(h('path', {
            d: path,
            fill: "url(#" + gid + ")",
            "fill-opacity": color ? color.alpha : 1,
            stroke: 'none',
            'stroke-width': 0,
        }));
    }
    // if (elArr.length == 1) {
    //     return elArr[0];
    // }
    return h("g", elArr);
}

export function render(h: Function, shape: Shape, path?: string): Array<any> {
    const style = shape.style;
    const fillsCount = style.fills.length;
    const elArr = new Array();
    path = path || shape.getPath(true).toString();

    for (let i = 0; i < fillsCount; i++) {
        const fill = style.fills[i];
        if (!fill.isEnabled) {
            continue;
        }
        const fillType = fill.fillType;
        elArr.push(handler[fillType](h, shape, fill, path));
    }
    return elArr;
}