import { Shape } from "@kcdesign/data";
import { Fill, FillType, Gradient } from "@kcdesign/data";
// import { ELArray, EL, h } from "./basic";
import { render as renderGradient } from "./gradient";
import { render as clippathR } from "./clippath"
import { objectId } from "@kcdesign/data";

const handler: { [key: string]: (h: Function, shape: Shape, fill: Fill, path: string) => any } = {};
handler[FillType.SolidColor] = function (h: Function, shape: Shape, fill: Fill, path: string): any {
    const color = fill.color;
    const opacity = shape.style.contextSettings.opacity;
    return h("path", {
        d: path,
        fill: "rgb(" + color.red + "," + color.green + "," + color.blue + ")",
        "fill-opacity": (color ? color.alpha : 1) * opacity,
        stroke: 'none',
        'stroke-width': 0
    });
}

handler[FillType.Gradient] = function (h: Function, shape: Shape, fill: Fill, path: string): any {
    const color = fill.color;
    const frame = shape.frame;
    const opacity = shape.style.contextSettings.opacity;
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
            "fill-opacity": (color ? color.alpha : 1) * opacity,
            stroke: 'none',
            'stroke-width': 0,
        }));
    }
    // if (elArr.length == 1) {
    //     return elArr[0];
    // }
    return h("g", elArr);
}

handler[FillType.Pattern] = function (h: Function, shape: Shape, fill: Fill, path: string): any {
    const id = "clippath-fill-" + objectId(fill);
    const cp = clippathR(h, shape, id, path);

    const url = fill.peekImage();
    const props: any = {}
    const frame = shape.frame;
    props.width = frame.width;
    props.height = frame.height;
    props['xlink:href'] = url;
    props['preserveAspectRatio'] = "none meet";
    props["clip-path"] = "url(#" + id + ")"
    const img = h("image", props);

    return h("g", [cp, img]);
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