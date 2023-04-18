import { BoolOp, GroupShape, Shape } from "@kcdesign/data/data/shape";
import { difference, intersection, subtract, union } from "./boolop";
import { render as fillR } from "@/render/fill";
import { render as borderR } from "@/render/border"
import * as types from "@kcdesign/data/data/classes"

function opPath(bop: BoolOp, path0: string, path1: string): string {
    let path = "";
    switch (bop) {
        case types.BoolOp.Diff:
            path = difference(path0, path1);
            break;
        case types.BoolOp.Intersect:
            path = intersection(path0, path1);
            break;
        case types.BoolOp.Subtract:
            path = subtract(path0, path1);
            break;
        case types.BoolOp.Union:
            path = union(path0, path1);
            break;
        // case BoolOp.SimpleUnion:
        //     path = path0 + path1;
        //     break;
    }
    return path;
}

export function render2path(shape: Shape, offsetX?: number, offsetY?: number, consumed?: Array<Shape>): string {

    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    if (!(shape instanceof GroupShape) || shape.childs.length === 0) {
        return shape.getPath(offsetX, offsetY).toString();
    }

    const cc = shape.childs.length;
    const child0 = shape.childs[0];
    const frame0 = child0.frame;
    const path0 = render2path(child0, offsetX + frame0.x, offsetY + frame0.y, consumed);
    consumed?.push(child0);

    let joinPath = path0;
    for (let i = 1; i < cc; i++) {
        const child1 = shape.childs[i];
        const frame1 = child1.frame;
        const path1 = render2path(child1, offsetX + frame1.x, offsetY + frame1.y, consumed);
        const pathop = child1.boolOp;
        if (pathop === types.BoolOp.None) {
            joinPath = joinPath + path1;
        } else {
            joinPath = joinPath.length === 0 ? path1 : opPath(pathop, joinPath, path1)
        }
        if (consumed) consumed.push(child1);
    }

    return joinPath;
}

export function render(h: Function, shape: GroupShape, reflush?: number, consumed?: Array<Shape>): any {
    const path = render2path(shape, 0, 0, consumed);

    const frame = shape.frame;
    const childs = [];

    // fill
    childs.push(...fillR(h, shape, path));

    // border
    childs.push(...borderR(h, shape, path));

    // ----------------------------------------------------------
    // shadows todo

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

    if (childs.length == 0) {
        props["fill-opacity"] = 1;
        props.d = path;
        props.fill = 'none';
        props.stroke = 'none';
        props["stroke-width"] = 0;
        return h('path', props);
    }
    else {
        return h("g", props, childs);
    }
}