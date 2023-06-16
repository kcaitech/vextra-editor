
import { Shape } from '@kcdesign/data';
import { Border, Gradient } from '@kcdesign/data';
import { render as renderGradient } from "./gradient";
import { BorderPosition, FillType } from "@kcdesign/data"

const handler: { [key: string]: (h: Function, shape: Shape, border: Border, path: string, url: string) => any } = {};

handler[BorderPosition.Inner] = function (h: Function, shape: Shape, border: Border, path: string, url: string): any {
    const frame = shape.frame;
    const thickness = border.thickness;
    const border_props: any = {
        fill: "none",
        width: frame.width - thickness,
        height: frame.height - thickness,
        x: thickness / 2, y: thickness / 2
    };
    let g_;
    const color = border.color;
    const fillType = border.fillType;
    if (fillType == FillType.SolidColor) {
        border_props.stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
    } else {
        g_ = renderGradient(h, border.gradient as Gradient, frame);
        border_props.stroke = "url(#" + g_.id + ")";
    }
    const width = frame.width;
    const height = frame.height;
    const { length, gap } = border.borderStyle;
    if (length || gap) {
        border_props['stroke-dasharray'] = `${length}, ${gap}`;
    }
    border_props['stroke-width'] = thickness;
    const elArr = [];
    if (g_ && g_.node) {
        elArr.push(g_.node);
    }
    const body = h("image", { 'xlink:href': url, width, height, x: 0, y: 0, 'preserveAspectRatio': 'none meet' });
    const b_ = h('rect', border_props);
    elArr.push(body, b_);
    return (h("g", elArr));
}
handler[BorderPosition.Center] = function (h: Function, shape: Shape, border: Border, path: string, url: string): any {
    const frame = shape.frame;
    const thickness = border.thickness;
    const border_props: any = { d: path, fill: "none" };
    let g_;
    const color = border.color;
    const fillType = border.fillType;
    if (fillType == FillType.SolidColor) {
        border_props.stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
    } else {
        g_ = renderGradient(h, border.gradient as Gradient, frame);
        border_props.stroke = "url(#" + g_.id + ")";
    }
    const width = frame.width;
    const height = frame.height;
    const { length, gap } = border.borderStyle;
    if (length || gap) {
        border_props['stroke-dasharray'] = `${length}, ${gap}`;
    }
    border_props['stroke-width'] = thickness;
    const elArr = [];
    if (g_ && g_.node) {
        elArr.push(g_.node);
    }
    const body = h("image", { 'xlink:href': url, width, height, x: 0, y: 0, 'preserveAspectRatio': 'none meet' });
    const b_ = h('path', border_props);
    elArr.push(body, b_);
    return (h("g", elArr));
}
handler[BorderPosition.Outer] = function (h: Function, shape: Shape, border: Border, path: string, url: string): any {
    const frame = shape.frame;
    const thickness = border.thickness;
    const border_props: any = {
        fill: "none",
        width: frame.width + thickness,
        height: frame.height + thickness,
        x: -thickness / 2, y: -thickness / 2
    };
    let g_;
    const color = border.color;
    const fillType = border.fillType;
    if (fillType == FillType.SolidColor) {
        border_props.stroke = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
    } else {
        g_ = renderGradient(h, border.gradient as Gradient, frame);
        border_props.stroke = "url(#" + g_.id + ")";
    }
    const width = frame.width;
    const height = frame.height;
    const { length, gap } = border.borderStyle;
    if (length || gap) {
        border_props['stroke-dasharray'] = `${length}, ${gap}`;
    }
    border_props['stroke-width'] = thickness;
    const elArr = [];
    if (g_ && g_.node) {
        elArr.push(g_.node);
    }
    const body = h("image", { 'xlink:href': url, width, height, x: 0, y: 0, 'preserveAspectRatio': 'none meet' });
    const b_ = h('rect', border_props);
    elArr.push(body, b_);
    return (h("g", elArr));
}
export function render(h: Function, shape: Shape, path: string, url: string): Array<any> {
    const style = shape.style;
    const bc = style.borders.length;
    path = path || shape.getPath(true).toString();
    const elArr = new Array();
    for (let i = 0; i < bc; i++) {
        const border: Border = style.borders[i];
        if (!border.isEnabled) continue;
        const position = border.position;
        elArr.unshift(handler[position](h, shape, border, path, url));
    }
    return elArr;
}