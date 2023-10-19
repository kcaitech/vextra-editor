import {Context} from "@/context";
import {Artboard, GroupShape, Page, Shape, ShapeType, SymbolShape, Variable, VariableType} from "@kcdesign/data";
import {getName} from "./content";
import {sort_by_layer} from "./group_ungroup";
import {debounce} from "lodash";

// region 组件列表相关
/**
 * @description 组件列表项
 */
export interface SymbolListItem {
    id: string
    title: string
    isFolder: boolean
    extend: boolean
    symbols: SymbolShape[]
    childs: SymbolListItem[]
    parent: SymbolListItem | undefined
}

export function classification_level_page(pages: Page[]) {
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

export function search_symbol_by_keywords(context: Context, keywords: string) {
    const symbol_resource = context.data.symbolsMgr.resource;
    const reg = new RegExp(keywords.toLocaleLowerCase(), 'img');
    const result: SymbolShape[] = [];
    for (let i = 0, len = symbol_resource.length; i < len; i++) {
        const item = symbol_resource[i];
        if (item.name.search(reg) > -1) result.push(item as SymbolShape);
    }
    return result;
}

export function init_status_set_by_symbol(data: SymbolListItem[], status_set: Set<string>, id: string) {
    const item = locate(data, id);
    if (!item) return false;
    let p = item.parent;
    while (p) {
        status_set.add(p.id);
        p = p.parent;
    }

    function locate(items: SymbolListItem[], id: string) {
        let result: SymbolListItem | undefined;
        for (let i = 0, len = items.length; i < len; i++) {
            const item = items[i];
            if (item.symbols.length && is_target_set(id, item.symbols)) return item;
            if (item.childs.length) result = locate(item.childs, id);
            if (result) break;
        }
        return result;
    }

    function is_target_set(id: string, symbols: SymbolShape[]) {
        for (let i = 0, len = symbols.length; i < len; i++) {
            if (id === symbols[i].id) return true;
        }
        return false;
    }
}

function _clear_scroll_target(context: Context) {
    context.component.set_scroll_target(undefined);
}

export const clear_scroll_target = debounce(_clear_scroll_target, 300);

// endregion
// region union属性列表相关
export interface AttriListItem {
    variable: Variable
    values: { key: string, value: string }[]
}

export function variable_sort(symbol: SymbolShape) {
    const list: AttriListItem[] = [];
    if (!symbol.isUnionSymbolShape || !symbol.variables) return list;
    let status_index = 0;
    const resource = symbol.variables;
    resource.forEach((v) => {
        const item: { variable: Variable, values: any[] } = {
            variable: v,
            values: []
        }
        if (v.type === VariableType.Status) {
            item.values = tag_values_sort(symbol, v);
            list.splice(status_index++, 0, item);
        } else {
            list.push(item);
        }
    })
    return list;
}

export function tag_values_sort(symbol: SymbolShape, variable: Variable) {
    const childs: SymbolShape[] = symbol.childs as unknown as SymbolShape[];
    const result_set: Set<string> = new Set();
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        const v = item.vartag?.get(variable.id) || variable.value;
        v && result_set.add(v);
    }
    return Array.from(result_set.values());
}

export function delete_variable(context: Context, variable: Variable) {
    const union = context.selection.unionshape;
    if (!union) return;
    const editor = context.editor4Shape(union);
    editor.removeVar(variable.id);
}

// endregion
// region 可变组件属性列表相关
export interface StatusValueItem {
    variable: Variable
    values: any[]
}

export function states_tag_values_sort(shapes: SymbolShape[]) {
    const result: StatusValueItem[] = [];
    if (shapes.length === 1) {
        const par = shapes[0].parent as SymbolShape;
        const bros: SymbolShape[] = par.childs as unknown as SymbolShape[];
        const variables = par.variables;
        if (!variables) return result;
        variables.forEach((v, k) => {
            if (v.type !== VariableType.Status) return;
            const item: StatusValueItem = {
                variable: v,
                values: tag_values_sort(par, v)
            }
            result.push(item);
        })
    } else {
        // todo
    }
    return result;
}

export function is_state_selection(shapes: Shape[]) {
    if (!shapes.length) return false;
    const p = shapes[0].parent;
    if (!p) return false;
    for (let i = 0, len = shapes.length; i < len; i++) {
        const shape = shapes[i];
        if (shape.type !== ShapeType.Symbol || !shape.parent || shape.parent !== p || !shape.parent.isUnionSymbolShape) return false;
    }
    return true;
}

export function setup_watch(shapes: Shape[], f: (...args: any[]) => void) {
    for (let i = 0, len = shapes.length; i < len; i++) shapes[i].watch(f);
}

export function remove_watch(shapes: Shape[], f: (...args: any[]) => void) {
    for (let i = 0, len = shapes.length; i < len; i++) shapes[i].unwatch(f);
}

/**
 * @description 读取可变组件属性值
 * @param state 可变组件
 * @param variable 属性对象
 */
export function get_tag_value(state: SymbolShape, variable: Variable) {
    return state.vartag?.get(variable.id) || variable.value || '';
}

// endregion

// region 其他
/**
 * @description 创建一个组件
 * @return symbolshape
 */
export function make_symbol(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    const page = context.selection.selectedPage;
    if (!page || !selected.length) return false;
    const editor = context.editor4Page(page);
    const name = getName(ShapeType.Symbol, context.data.symbolsMgr.resource, t);
    const shapes: Shape[] = sort_by_layer(context, selected);
    return editor.makeSymbol(context.data, shapes, name);
}

/**
 * @description 创建组件状态集合union
 * return union
 */
export function make_status(context: Context, t: Function) {
    const shape = context.selection.symbolshape;
    const page = context.selection.selectedPage;
    if (shape && page) {
        const editor = context.editor4Page(page);
        const name = gen_special_name_for_status(shape, t('compos.attri'));
        if (!name) return;
        return editor.makeStatus(shape as SymbolShape, name, t('compos.dlt'));
    }
}

/**
 * @description 创建一个默认状态
 * @return state
 */
export function make_default_state(context: Context, t: Function) {
    const selected = context.selection.selectedShapes;
    if (selected.length !== 1) return;
    const shape = selected[0];
    const page = context.selection.selectedPage;
    if (shape && shape.type === ShapeType.Symbol && shape.isUnionSymbolShape && page) {
        const editor = context.editor4Page(page);
        return editor.makeStateAt(shape as SymbolShape, t('compos.state'));
    }
}

/**
 * @description 创建一个状态
 * @return state
 */
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
        return editor.makeStateAt(shape.parent as SymbolShape, t('compos.state'), index);
    }
}

export function gen_special_name_for_status(symbol: SymbolShape, dlt: string) {
    let index = 1
    if (!symbol.variables) return `${dlt}${index}`;
    const variables = symbol.variables;
    const number_set: Set<number> = new Set();
    const reg = new RegExp(`^${dlt}[0-9]*$`);
    let max = 1;
    variables.forEach((v, k) => {
        if (v.type !== VariableType.Status) return;
        if (reg.test(v.name)) {
            const n = Number(v.name.split(dlt)[1]);
            number_set.add(n);
            if (n > max) max = n;
        }
    })
    while (index <= max) {
        index++;
        if (!number_set.has(index)) break;
    }
    return `${dlt}${index}`;
}

/**
 * @description 检测组件状态值是否有冲突
 * @return Boolean
 */
export function detects_comp_status_val_is_clash(symbol: SymbolShape) {
    if (!symbol.variables) return false;
    const variables = symbol.variables;
    const d = '默认';
    if(symbol.childs.length > 1) {
        let clashs: any = {}
        variables.forEach((v, k) => {
            symbol.childs.forEach((item, i) => {
                const id = item.id;
                 if(!clashs[id]) {
                     clashs[id] = [];
                 }
                clashs[id].push(item.vartag.get(k) || d);
            })
        })
        let result = false;
        for (const key in clashs) {
            if (Object.prototype.hasOwnProperty.call(clashs, key)) {
                if(key !== symbol.childs[0].id) {
                    const v = JSON.stringify(clashs[key]);
                    const first = JSON.stringify(clashs[symbol.childs[0].id]);
                    console.log(v, first,'dddddddddd');
                    if(first === v) result = true; 
                }
            }
        }
        return result;
    }else {
        return false;
    }
}

// endregion