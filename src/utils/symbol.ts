import { Context } from "@/context";
import { Shape, ShapeType, SymbolShape } from "@kcdesign/data";
import { get_component_state_name } from "./content";

export function make_union(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    if (selected.length !== 1) return;
    const shape = selected[0];
    const page = context.selection.selectedPage;
    if (shape && shape.type === ShapeType.Symbol && !shape.isUnionSymbolShape && page) {
        const editor = context.editor4Page(page);
        const make_result = editor.makeSymbolUnion(shape as SymbolShape, t('shape.default'));
        return make_result;
    }
}
export function make_default_state(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    if (selected.length !== 1) return;
    const shape = selected[0];
    const page = context.selection.selectedPage;
    if (shape && shape.type === ShapeType.Symbol && shape.isUnionSymbolShape && page) {
        const editor = context.editor4Page(page);
        const name = get_component_state_name(shape as SymbolShape, t);
        const make_result = editor.makeStateAt(shape as SymbolShape, name);
        return make_result;
    }
}
export function make_state(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    if (selected.length !== 1) return;
    const shape = selected[0];
    const page = context.selection.selectedPage;
    if (shape && shape.type === ShapeType.Symbol && !shape.isUnionSymbolShape && shape.parent && shape.parent.isUnionSymbolShape && page) {
        let index = -1;
        for (let i = 0, len = shape.parent.childs.length; i < len; i++) {
            if (shape.parent?.childs[i]?.id === shape.id) {
                index = i;
                break;
            }
        }
        if (index < 0) return;
        const editor = context.editor4Page(page);
        const name = get_component_state_name(shape.parent as SymbolShape, t);
        const make_result = editor.makeStateAt(shape.parent as SymbolShape, name, index);
        return make_result;
    }
}