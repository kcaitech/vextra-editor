import { GroupShape, ImageShape, PathShape, Shape, SymbolRefShape, TextShape, OverridesGetter } from "@kcdesign/data";
import { Artboard } from "@kcdesign/data";
import { renderArtboard as art } from "@kcdesign/data";
import { renderGroup as group } from "@kcdesign/data";
import { renderImage as image } from "@kcdesign/data";
import { renderPathShape as path } from "@kcdesign/data";
import { renderRecShape as rect } from "@kcdesign/data";
import { renderTextShape as text } from "@kcdesign/data";
import { renderSymbolRef as symref } from "@kcdesign/data";
import { ShapeType, BoolOp } from "@kcdesign/data";

type ComType = (data: Shape, overrides?: OverridesGetter) => string;
const comsMap: Map<ShapeType, ComType> = new Map();

function h(com: ComType, attrs?: any): string;
function h(tag: string, attrs?: any, childs?: Array<string>): string;
function h(...args: any[]): string {
    if (typeof args[0] === 'function') {
        if (args.length > 2) {
            throw new Error("function args err!");
        }
        const com = args[0];
        const attrs = args[1];
        return com(attrs.data, attrs.overrides); // todo
    }
    else if (typeof args[0] === 'string') {
        const tag = args[0];
        const attrs = args[1];
        const childs = args[2];
        let ret = '<' + tag;
        if (attrs) for (let a in attrs) {
            ret += ' ' + a + '=' + attrs[a];
        }
        ret += '>';
        if (childs) for (let i = 0, len = childs.length; i < len; i++) {
            ret += childs[i];
        }
        ret += '</' + tag + '>';
        return ret;
    }
    else {
        throw new Error("h function args err!");
    }
}

comsMap.set(ShapeType.Artboard, (data: Shape, overrides?: OverridesGetter) => {
    return art(h, data as Artboard, comsMap);
});
comsMap.set(ShapeType.Group, (data: Shape, overrides?: OverridesGetter) => {
    const override = overrides?.getOverrid(data.id);
    return group(h, data as GroupShape, comsMap, overrides, override);
});
// comsMap.set(ShapeType.FlattenShape, (data: Shape, overrides?: OverridesGetter) => {
//     return shapegroup(h, data as FlattenShape);
// });
comsMap.set(ShapeType.Image, (data: Shape, overrides?: OverridesGetter) => {
    const override = overrides?.getOverrid(data.id);
    const s = data as ImageShape;
    const url = s.peekImage() || "";
    return image(h, s, url, override);
});
comsMap.set(ShapeType.Page, (data: Shape, overrides?: OverridesGetter) => {
    return group(h, data as GroupShape, comsMap, undefined, undefined);
});
comsMap.set(ShapeType.Path, (data: Shape, overrides?: OverridesGetter) => {
    const override = overrides?.getOverrid(data.id);
    return path(h, data as PathShape, override);
});
comsMap.set(ShapeType.Rectangle, (data: Shape, overrides?: OverridesGetter) => {
    const override = overrides?.getOverrid(data.id);
    return rect(h, data, override);
});
comsMap.set(ShapeType.Text, (data: Shape, overrides?: OverridesGetter) => {
    const override = overrides?.getOverrid(data.id);
    return text(h, data as TextShape, override);
});
// comsMap.set(ShapeType.Boolean, (data: Shape, path: string) => { // todo
//     return bool(h, data, path);
// });
// comsMap.set(ShapeType.Symbol, (data: Shape, overrides?: OverridesGetter) => {
//     return group(h, data as GroupShape, comsMap, overrides);
// });
comsMap.set(ShapeType.SymbolRef, (data: Shape, overrides?: OverridesGetter) => {
    return symref(h, data as SymbolRefShape, comsMap);
});

export function exportSvg(shape: Shape): string {
    // todo svg head
    const com = comsMap.get(shape.type);
    if (!com) throw new Error("export svg, unknow shape type : " + shape.type)
    return h(com, { data: shape, boolop: BoolOp.None });
}