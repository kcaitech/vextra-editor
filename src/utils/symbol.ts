import { Context } from "@/context";
import { Artboard, GroupShape, Page, Shape, ShapeType, SymbolShape } from "@kcdesign/data";
import { getName, get_component_state_name } from "./content";
import { sort_by_layer } from "./group_ungroup";
import { v4 } from "uuid";

export function make_symbol(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    const page = context.selection.selectedPage;
    if (!page || !selected.length) return false;
    const editor = context.editor4Page(page);
    const name = getName(ShapeType.Symbol, context.data.symbolsMgr.resource, t);
    const shapes: Shape[] = sort_by_layer(context, selected);
    return editor.makeSymbol(context.data, shapes, name);
}

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
export interface SymbolListItem {
    id: string
    title: string
    isFolder: boolean
    extend: boolean
    symbols: SymbolShape[]
    childs: SymbolListItem[]
    parent: SymbolListItem | undefined
}
export function classification_level_page(pages: Page[]) { // 页面这一层比较特殊
    const result: SymbolListItem[] = [];
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.__symbolshapes.size) {
            const item = {
                id: page.id,
                title: page.name,
                isFolder: true,
                extend: false,
                symbols: [],
                childs: classification_level_artboard(page),
                parent: undefined
            }
            result.push(item);
        }
    }
    // return result.length > 1 ? result : result.length === 1 ? result[0].childs : [];
    return result;
}
function get_symbol_level_under(group: GroupShape) {
    const symbols: SymbolShape[] = [];
    const childs = group.childs;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        if (item.isUnionSymbolShape) {
            symbols.push(item.childs[0]);
        } else if (item.type === ShapeType.Symbol) {
            symbols.push(item as SymbolShape);
        }
    }
    return symbols;
}
export function classification_level_artboard(page: Page) {
    const artboards = page.artboardList;
    const result: SymbolListItem[] = [];
    const symbols_under_page = get_symbol_level_under(page);
    if (symbols_under_page.length) {
        const item: SymbolListItem = {
            id: symbols_under_page[0].id,
            title: '',
            isFolder: false,
            extend: false,
            symbols: symbols_under_page,
            childs: [],
            parent: undefined
        }
        result.push(item);
    }
    const artboard_map: Map<string, SymbolListItem> = new Map();
    for (let i = 0, len = artboards.length; i < len; i++) {
        const artboard = artboards[i];
        if (artboard.parent?.type !== ShapeType.Page) continue;
        const symbols = check_symbol_level_artboard(artboard);
        if (!symbols.length) continue;
        const already = artboard_map.get(artboard.name);
        if (already) {
            already.childs[0].symbols.push(...symbols);
            continue;
        }
        const item: SymbolListItem = {
            id: artboard.name,
            title: artboard.name,
            isFolder: true,
            extend: false,
            symbols: [],
            childs: [],
            parent: undefined
        }
        const child: SymbolListItem = {
            id: symbols[0].id,
            title: '',
            isFolder: false,
            extend: false,
            symbols: symbols,
            childs: [],
            parent: undefined
        }
        item.childs.push(child);
        result.push(item);
        artboard_map.set(item.id, item);
    }
    return result;
}
function check_symbol_level_artboard(artboard: GroupShape, init?: SymbolShape[]) {
    const symbols: SymbolShape[] = init || [];
    const childs = artboard.childs;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        if (item.isUnionSymbolShape) {
            symbols.push(item.childs[0]);
        } else if (item.type === ShapeType.Symbol) {
            symbols.push(item as SymbolShape);
        }
        if (item.type === ShapeType.Artboard) check_symbol_level_artboard(item as Artboard, symbols);
    }
    return symbols;
}
export function modify_parent(list: SymbolListItem[]) {
    for (let i = 0, len = list.length; i < len; i++) modify(list[i]);
    function modify(item: SymbolListItem) {
        if (!item.childs.length) return;
        for (let i = 0, len = item.childs.length; i < len; i++) {
            const child = item.childs[i];
            child.parent = item;
            if (!child.childs.length) continue;
            modify(child);
        }
    }
}
export function list_layout(list: SymbolListItem[], extend_set: Set<string>, init?: SymbolListItem[]) {
    const result: SymbolListItem[] = init || [];
    for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i];
        result.push(item);
        if (extend_set.has(item.id)) {
            list_layout(item.childs, extend_set, result);
        }
    }
    return result;
}