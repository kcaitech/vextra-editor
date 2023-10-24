import {Context} from "@/context";
import {
    Artboard,
    GroupShape, OverrideType,
    Page,
    Shape,
    ShapeType,
    SymbolRefShape,
    SymbolShape,
    Variable,
    VariableType
} from "@kcdesign/data";
import {getName} from "./content";
import {sort_by_layer} from "./group_ungroup";
import {debounce} from "lodash";
import {v4} from "uuid";
import {get_name} from "@/utils/shapelist";
import e from "express";

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

/**
 * @description 给组件列表的项与项之间确定关系
 */
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

/**
 * @description 根据文件夹展开、闭合状态整理组件列表的展示布局
 */
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

/**
 * @description 初始化组件列表的文件夹展开、闭合状态
 */
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

/**
 * @description 设置需要定位到组件
 */
function _clear_scroll_target(context: Context) {
    context.component.set_scroll_target(undefined);
}

/**
 * @description 设置需要定位到组件，一段时间内只执行一次
 */
export const clear_scroll_target = debounce(_clear_scroll_target, 300);

// endregion
// region union属性列表相关
export interface AttriListItem {
    variable: Variable
    values: { key: string, value: string }[]
}

/**
 * @description 为组件整理变量列表
 * @param symbol
 */
export function variable_sort(symbol: SymbolShape) {
    const list: AttriListItem[] = [];
    if (!symbol.variables) return list;
    let status_index = 0;
    const resource = symbol.variables;
    resource.forEach(v => {
        const item: { variable: Variable, values: any[] } = {variable: v, values: []};
        if (v.type === VariableType.Status) {
            item.values = tag_values_sort(symbol, v);
            list.splice(status_index++, 0, item);
        } else {
            list.push(item);
        }
    })
    return list;
}

/**
 * @description 检查变量variable有哪些可选值并返回
 * @param symbol
 * @param variable
 */
export function tag_values_sort(symbol: SymbolShape, variable: Variable) {
    if (!symbol.isUnionSymbolShape) return [];
    const childs: SymbolShape[] = symbol.childs as unknown as SymbolShape[];
    const result_set: Set<string> = new Set();
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        const v = item.vartag?.get(variable.id) || variable.value;
        v && result_set.add(v);
    }
    return Array.from(result_set.values());
}

/**
 * @description 为组件删除一个变量
 */
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

/**
 * @description 为可变组件整理变量列表
 */
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

/**
 * @description 选区是否都为同一个组件下的可变组件
 * @param shapes
 */
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
 * @description 创建一个可变组件
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

/**
 * @description 为组件创建图层显示变量
 */
export function create_visible_var(context: Context, symbol: SymbolShape, name: string, values: string[]) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeVisibleVar(symbol, name, values);
}

/**
 * @description 为组件创建实例切换变量
 */
export function create_ref_var(context: Context, symbol: SymbolShape, name: string, values: any) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeSymbolRefVar(symbol, name, values);
}

/**
 * @description 为组件创建文本切换变量
 */
export function create_text_var(context: Context, symbol: SymbolShape, name: string, values: any) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeTextVar(symbol, name, values);
}

export function create_var_by_type(context: Context, type: VariableType, name: string, values: any) {
    const selection = context.selection;
    if (!selection.symbolshape) return;
    switch (type) {
        case VariableType.Visible:
            return create_visible_var(context, selection.symbolshape, name, values);
        case VariableType.SymbolRef:
            return create_ref_var(context, selection.symbolshape, name, '嘿嘿');
        case VariableType.Text:
            return create_text_var(context, selection.symbolshape, name, '嘿嘿');
        default:
            console.log('wrong action');
    }
}

/**
 * @description 给symbol生成一个与其他变量名称不会产生冲突并且有序的变量名称
 * @param symbol
 * @param dlt 默认名称
 */
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
        if (!number_set.has(index)) break;
        index++;
    }
    return `${dlt}${index}`;
}

/**
 * @description 检查组件的可变组件之间的各个变量值之间的组合是否有重复情况
 */
export function is_wrong_bind_sym(symbol: SymbolShape) {
    if (symbol.childs.length < 2) return false;
    if (!symbol.variables) return false;
    const variables = symbol.variables;
    const values_set: Set<string> = new Set();
    const childs = symbol.childs as unknown as SymbolShape[];
    const p = v4();
    let _no_status = true;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        let slices = '';
        variables.forEach(v => {
            if (v.type !== VariableType.Status) return;
            _no_status = false;
            const dlt = item.vartag?.get(v.id);
            slices += (!dlt || dlt === v.value) ? p : dlt;
        })
        if (_no_status) return false;
        if (values_set.has(slices)) return true;
        values_set.add(slices);
    }
    return false;
}

/**
 * @description 检测可变组件之间的各个变量值之间的组合是否有重复情况
 */
export function is_wrong_bind(states: SymbolShape[]) {
    if (states.length === 1) { // 单选
        return is_wrong_bind_sym(states[0].parent as SymbolShape);
    } else { // 多选
        // todo
        return false;
    }
}

/**
 * @description 获取冲突的可变组件
 */
export function is_conflict_comp(symbol: SymbolShape) {
    if (!symbol.variables) return;
    const variables = symbol.variables;
    let conflict_arr = [];
    const childs = symbol.childs as unknown as SymbolShape[];
    const p = v4();
    let _no_status = true;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        let slices = '';
        variables.forEach(v => {
            if (v.type !== VariableType.Status) return;
            _no_status = false;
            const dlt = item.vartag?.get(v.id);
            slices += (!dlt || dlt === v.value) ? p : dlt;
        })
        if (_no_status) return;
        conflict_arr.push({id: item.id, equal: slices});
    }
    let obj: any = {}, newArr: any[] = [];
    conflict_arr.forEach(function (item, suffix) {
        if (!obj[item.equal]) {
            let arr = [];
            arr.push(item);
            newArr.push(arr);
            obj[item.equal] = item;
        } else {
            newArr.forEach(function (value, index) {
                if (value[0].equal == item.equal) {
                    value.push(item)
                }
            })
        }
    })
    let arr: any = [];
    newArr = newArr.filter(item => item.length > 1);

    return newArr;
}

// endregion
export interface LayerCollectItem {
    state: string
    data: Shape[]
}

/**
 * @description 获取组件或者可变组件身上的可变图层
 * @param symbol
 */
export function get_layer_from_symbol(symbol: Shape) {
    const result: LayerCollectItem[] = [];
    if (symbol.type !== ShapeType.Symbol) return result;
    if (symbol.isUnionSymbolShape) { // 存在可变组件
        const childs = symbol.childs;
        for (let i = 0, len = childs.length; i < len; i++) {
            const item = childs[i];
            const lci = {
                state: get_name(item),
                data: get_layer_i(childs[i])
            }
            result.push(lci);
        }
        return result;
    } else { // 不存在可变组件
        return [{state: symbol.name, data: get_layer_i(symbol)}];
    }
}

function get_layer_i(symbol: Shape) {
    let shapes: Shape[] = [];
    let slow_index = 0;
    const childs = symbol.childs;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        if (item.childs && item.childs.length) {
            shapes.push(item, ...get_layer_i(item));
        } else {
            shapes.splice(slow_index++, 0, item);
        }
    }
    return shapes;
}

export interface RefAttriListItem {
    variable: Variable
    values: any[]
}

/**
 * @description 整理实例身上的变量列表
 * @param context
 * @param symref
 */
export function get_var_for_ref(context: Context, symref: SymbolRefShape) {
    let result: RefAttriListItem[] = [];
    const sym = context.data.symbolsMgr.getSync(symref.refId);
    if (!sym) return result;
    const variables = sym.variables;
    if (!variables) return result;
    variables.forEach(v => {
        const item: RefAttriListItem = {variable: v, values: []};
        if (v.type !== VariableType.Status) return;
        item.values = tag_values_sort(sym, v);
        result.push(item);
    })
    return result;
}

/**
 * @description 获取实例symref身上的某个变量variable的值
 */
export function get_status_value_for_ref(symref: SymbolRefShape, variable: Variable) {
    const overrides = symref.findOverride(variable.id, OverrideType.Variable);
    return overrides ? overrides[overrides.length - 1].value : variable.value;
}

/**
 * @description 修改实例身上某个变量vari的值
 */
export function modify_status_value_for_ref(context: Context, vari: Variable, value: any) {
    const symref = context.selection.symbolrefshape;
    if (!symref) return;
    const editor = context.editor4Shape(symref);
    editor.modifySymbolRefStatus(vari, value);
}
