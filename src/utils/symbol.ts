import {Context} from "@/context";
import {
    Artboard,
    GroupShape,
    OverrideType,
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
import {XY} from "@/context/selection";
import {isTarget} from "@/utils/common";
import {message} from "@/utils/message";

export enum SymbolType {
    Symbol = 'symbol',
    Union = 'union',
    State = 'state',
    Ref = 'ref'
}

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

export function classification_level_page(pages: { page: Page, desc: string }[]) {
    const result: SymbolListItem[] = [];
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.page.__symbolshapes.size) {
            const item = {
                id: page.page.id,
                title: page.desc,
                isFolder: true,
                extend: false,
                symbols: [],
                childs: classification_level_artboard(page.page),
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
    for (let i = childs.length - 1; i > -1; i--) {
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
    for (let i = childs.length - 1; i > -1; i--) {
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

export function search_symbol_by_keywords(context: Context, keywords: string, symbols: SymbolShape[]) {
    const reg = new RegExp(keywords.toLocaleLowerCase(), 'img');
    const result: SymbolShape[] = [];
    for (let i = 0, len = symbols.length; i < len; i++) {
        const item = symbols[i];
        if (item.name.search(reg) > -1) result.push(item as SymbolShape);
    }
    return result;
}

export function get_search_symbol_list(pages: Page[]) {
    const result: SymbolShape[] = [];
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.__symbolshapes.size) {
            const artboards = page.artboardList;
            const symbols_under_page = get_symbol_level_under(page);
            if (symbols_under_page.length) result.push(...symbols_under_page);
            if (artboards.length) {
                for (let index = 0; index < artboards.length; index++) {
                    const artboard = artboards[index];
                    if (artboard.parent?.type !== ShapeType.Page) continue;
                    const symbols = check_symbol_level_artboard(artboard);
                    if (!symbols.length) continue;
                    result.push(...symbols);
                }
            }
        }
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
    const sym = context.selection.symbolshape;
    if (!sym) return;
    const editor = context.editor4Shape(sym);
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
    // if (is_exist_symbol_layer(selected)) {
    //     message('info', '新的组件不能包含已有组件或已有组件图层');
    //     return false;
    // }
    if (is_exsit_contact_shape(selected)) {
        message('info', '组件内部不能包含连接线');
        return false;
    }
    const editor = context.editor4Page(page);
    const name = getName(ShapeType.Symbol, context.data.symbolsMgr.resource, t);
    const shapes: Shape[] = sort_by_layer(context, selected);
    return editor.makeSymbol(context.data, shapes, name);
}

export function is_exsit_contact_shape(selected: Shape[]) {
    for (let i = 0, len = selected.length; i < len; i++) {
        if (selected[i].type === ShapeType.Contact) return true;
    }
    return false;
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
export function make_state(context: Context, t: Function, hor?: number) {
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
        return editor.makeStateAt(shape.parent as SymbolShape, t('compos.state'), index, hor);
    }
}

/**
 * @description 为组件创建图层显示变量
 */
export function create_visible_var(context: Context, symbol: SymbolShape, name: string, value: boolean, shapes: Shape[]) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeVisibleVar(symbol, name, value, shapes);
}

/**
 * @description 为组件创建实例切换变量
 */
export function create_ref_var(context: Context, symbol: SymbolShape, name: string, shapes: Shape[]) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeSymbolRefVar(symbol, name, shapes);
}

/**
 * @description 为组件创建文本切换变量
 */
export function create_text_var(context: Context, symbol: SymbolShape, name: string, dlt: string, shapes: Shape[]) {
    const editor = context.editor4Page(context.selection.selectedPage!);
    editor.makeTextVar(symbol, name, dlt, shapes);
}

export function create_var_by_type(context: Context, type: VariableType, name: string, value: any, values: any[], symbol: SymbolShape) {
    const selection = context.selection;
    const shapes: Shape[] = [];
    const page = selection.selectedPage!;
    for (let i = 0, len = values.length; i < len; i++) {
        const s = page.getShape(values[i]);
        if (s) shapes.push(s);
    }
    switch (type) {
        case VariableType.Visible:
            return create_visible_var(context, symbol, name, value, shapes);
        case VariableType.SymbolRef:
            return create_ref_var(context, symbol, name, shapes);
        case VariableType.Text:
            return create_text_var(context, symbol, name, value, shapes);
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
export interface LCOption {
    state: string
    data: Shape[]
}

export function get_options_from_symbol(symbol: SymbolShape, type: VariableType, vari?: Variable, container?: Shape[]) {
    const result: LCOption[] = [];
    if (symbol.type !== ShapeType.Symbol) return result;
    if (symbol.isUnionSymbolShape) { // 存在可变组件
        const childs = symbol.childs;
        for (let i = 0, len = childs.length; i < len; i++) {
            const item = childs[i];
            const lci = {state: get_name(item), data: get_x_type_option(symbol, item, type, vari, container)};
            result.push(lci);
        }
        return result;
    } else { // 不存在可变组件
        return [{state: symbol.name, data: get_x_type_option(symbol, symbol, type, vari, container)}];
    }
}

function de_check(item: Shape) {
    return !item.childs || !item.childs.length || item.type === ShapeType.Table || item.type === ShapeType.SymbolRef
}

/**
 * @description 检查是否绑定过 x类型 的变量
 */
function is_bind_x_type_var(symbol: SymbolShape, shape: Shape, type: OverrideType, vari?: Variable, container?: Shape[]) {
    if (!shape.varbinds) return false;
    let result = false;
    shape.varbinds.forEach((v, k) => {
        if (!symbol.variables?.get(v)) return;
        if (vari?.id === v && container) {
            container.push(shape);
            return;
        }
        if (result) return;
        result = k === type;
    })
    return result;
}


function get_target_type_by_vt(vt: VariableType) {
    if (vt === VariableType.SymbolRef) return ShapeType.SymbolRef;
    if (vt === VariableType.Text) return ShapeType.Text;
}

function get_ot_by_vt(vt: VariableType) {
    if (vt === VariableType.SymbolRef) return OverrideType.SymbolID;
    if (vt === VariableType.Text) return OverrideType.Text;
}

function get_x_type_option(symbol: Shape, group: Shape, type: VariableType, vari?: Variable, container?: Shape[]) {
    let shapes: Shape[] = [];
    const childs = group.childs;
    if (!childs?.length) return shapes;
    if (type === VariableType.Visible) {
        let slow_index = 0;
        for (let i = 0, len = childs.length; i < len; i++) {
            const item = childs[i];
            const canbe = !is_bind_x_type_var(symbol as SymbolShape, item, OverrideType.Visible, vari, container);
            if (item.childs && item.childs.length && item.type !== ShapeType.Table) {
                if (canbe) shapes.push(item);
                shapes.push(...get_x_type_option(symbol, item, type, vari, container));
            } else {
                if (!canbe) continue;
                shapes.splice(slow_index++, 0, item);
            }
        }
    } else {
        if (de_check(group)) return shapes;
        for (let i = 0, len = childs.length; i < len; i++) {
            const item = childs[i];
            if (item.type === get_target_type_by_vt(type)) {
                if (!is_bind_x_type_var(symbol as SymbolShape, item, get_ot_by_vt(type)!, vari, container)) shapes.push(item);
            } else if (item.childs && item.childs.length && item.type !== ShapeType.Table) {
                shapes.push(...get_x_type_option(symbol, item, type, vari, container));
            }
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
    let result2: RefAttriListItem[] = [];
    const sym = context.data.symbolsMgr.getSync(symref.refId);
    if (!sym) return false;
    const variables = sym.variables;
    if (!variables) return false;
    let status_index: number = 0;
    let instance_index: number = 0;
    let text_index: number = 0;
    variables.forEach((v: Variable) => {
        const item: RefAttriListItem = {variable: v, values: []};
        if (v.type === VariableType.Visible) {
            result2.push(item);
        } else if (v.type === VariableType.Status) {
            item.values = tag_values_sort(sym, v);
            result.splice(status_index++, 0, item);
        } else if (v.type === VariableType.SymbolRef) {
            result.splice(status_index + instance_index++, 0, item);
        } else if (v.type === VariableType.Text) {
            result.splice(status_index + instance_index + text_index++, 0, item);
        }
    })
    return {variables: result, visible_variables: result2};
}

/**
 * @description 获取实例symref身上的某个变量variable的值
 */
export function get_vari_value_for_ref(symref: SymbolRefShape, variable: Variable) {
    const overrides = symref.findOverride(variable.id, OverrideType.Variable);
    return overrides ? overrides[overrides.length - 1].value : variable.value;
}

/**
 * @description 修改实例身上某个变量vari的值
 */
export function modify_vari_value_for_ref(context: Context, vari: Variable, value: any) {
    const symref = context.selection.symbolrefshape;
    if (!symref) return;
    const editor = context.editor4Shape(symref);
    editor.modifySymbolRefVariable(vari, value);
}

/**
 * @description 以shape为根的所有父子对
 * @param shape
 */
function get_topology_map(shape: Shape) {
    const deps: { shape: string, ref: string }[] = [];
    const childs = shape.type === ShapeType.SymbolRef ? shape.naviChilds : shape.childs;
    if (!childs?.length) return [];
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        const is_ref = item.type === ShapeType.SymbolRef
        const c_childs = is_ref ? item.naviChilds : item.childs;
        if (c_childs?.length || is_ref) {
            deps.push({
                shape: get_id(shape.type === ShapeType.SymbolRef ? shape.refId : shape.id),
                ref: get_id(is_ref ? item.refId : item.id)
            });
        }
        if (!c_childs?.length) continue;
        deps.push(...get_topology_map(item));
    }
    return deps;
}

type Sides = 'shape' | 'ref';

function filter_deps(deps: { shape: string, ref: string }[], key1: Sides, key2: Sides) {
    const result: { shape: string, ref: string }[] = [];
    const _checked: Set<string> = new Set();
    const _checked_invalid: Set<string> = new Set();
    for (let i = 0, len = deps.length; i < len; i++) {
        const d = deps[i];
        if (_checked.has(d[key1])) {
            result.push(d);
            continue;
        }
        if (_checked_invalid.has(d[key1])) continue;
        let invalid: boolean = true;
        for (let j = 0, len = deps.length; j < len; j++) {
            if (deps[j][key2] === d[key1]) {
                result.push(d);
                _checked.add(d[key1]);
                invalid = false;
                break;
            }
        }
        if (invalid) _checked_invalid.add(d[key1]);
    }
    return result;
}

/**
 * @description 检查是否存在入度为0的枝
 * @param deps
 */
function is_exist_single_stick(deps: { shape: string, ref: string }[]) {
    const set1 = new Set<string>();
    const set2 = new Set<string>();
    let is_single = false;
    for (let i = 0, len = deps.length; i < len; i++) {
        const dep = deps[i];
        set1.add(dep.shape);
        set2.add(dep.ref);
    }
    set1.forEach(v => {
        if (!set2.has(v)) is_single = true;
    })
    if (is_single) return true;
    set2.forEach(v => {
        if (!set1.has(v)) is_single = true;
    })
    return is_single;
}

function get_id(raw_id: string) {
    return raw_id;
    // const index = raw_id.lastIndexOf('/');
    // if (index > -1) {
    //     return raw_id.slice(index + 1);
    // } else {
    //     return raw_id;
    // }
}

/**
 * @description 检查symbol与ref之间是否存在循环引用
 */
export function is_circular_ref2(symbol: Shape, refId: string): boolean {
    let deps: { shape: string, ref: string }[] = [...get_topology_map(symbol), {
        shape: get_id(refId),
        ref: get_id(symbol.id)
    }];
    if (deps.length < 2) return false;
    while (deps.length && is_exist_single_stick(deps)) {
        deps = filter_deps(deps, 'shape', 'ref');
        deps = filter_deps(deps, 'ref', 'shape');
    }
    return !!deps.length;
}

/**
 * @description 检查属性名称是否有效，有效则返回true  --8yyg9986i7g
 */
export function is_valid_name(symbol: SymbolShape, name: string, type: VariableType) {
    let valid: boolean = true;
    const variables = symbol.variables
    if (!variables) return valid;
    variables.forEach((v, k) => {
        if (v.type !== type) return;
        if (name === v.name) valid = false;
    })
    return valid;
}

/**
 * @description 判断选中图形是否支持创建组件 ---js34hgws8033jh238
 * @param shapes
 */
export function is_allow_to_create_sym(shapes: Shape[]) {
    let vaild = true;
    for (let i = 0, len = shapes.length; i < len; i++) {
        if (shapes[i].type === ShapeType.Symbol) return false;
    }
    return true;
}

/**
 * @description 判断组件状态是否允许删除 --82shdf82kj
 */
export function is_status_allow_to_delete(symbol: SymbolShape) {
    let valid = -1;
    if (!symbol.variables) return false;
    symbol.variables.forEach(v => {
        if (v.type === VariableType.Status) valid++;
    })
    return valid > 0;
}

/**
 * @description 是否为可变组件
 * @param shape
 */
export function is_state(shape: Shape) {
    return shape.type === ShapeType.Symbol && shape?.parent?.isUnionSymbolShape;
}

function is_sym(shape: Shape) {
    return shape.type === ShapeType.Symbol;
}

/**
 * @description 给一个图层，返回这个图层所在的组件，如果不是组件内的图层，则return undefined;
 */
export function get_symbol_by_layer(layer: Shape): SymbolShape | undefined {
    let s: Shape | undefined = layer;
    while (s && !is_sym(s)) {
        s = s.parent;
    }
    if (s) return is_state(s) ? s.parent as SymbolShape : s as SymbolShape;
}

/**
 * @description 根据类型x查看图层是否绑定了某一个变量，如果绑定了变量，则返回该变量
 * @param shape
 * @param type
 */
export function is_bind_x_vari(shape: Shape, type: OverrideType) {
    const symbol = get_symbol_by_layer(shape);
    if (!symbol) return;
    const variables = symbol.variables;
    if (!variables) return;
    const binds = shape.varbinds;
    if (!binds) return;
    let vk = '';
    binds.forEach((v, k) => {
        if (k === type) vk = v;
    })
    if (!vk) return;
    return variables.get(vk);
}

/**
 * @description 重置所有属性
 */
export function reset_all_attr_for_ref(context: Context) {
    const shape = context.selection.symbolrefshape;
    if (!shape) return;
    const editor = context.editor4Shape(shape);
    editor.resetSymbolRefVariable();
}

export function find_space_for_state(symbol: SymbolShape, state: SymbolShape) {
    if (!(symbol as SymbolShape).isUnionSymbolShape) return;
    const targets = symbol.childs;
    if (!targets.length) return;
    const init_frame = {
        x: state.frame.x + state.frame.width + 20,
        y: state.frame.y,
        width: state.frame.width,
        height: state.frame.height
    }
    const p2r = symbol.matrix2Root();
    let pure: boolean = false;
    while (!pure) {
        pure = true
        let selectorPoints: XY[] = [
            {x: init_frame.x, y: init_frame.y},
            {x: init_frame.x + init_frame.width, y: init_frame.y},
            {x: init_frame.x + init_frame.width, y: init_frame.y + init_frame.height},
            {x: init_frame.x, y: init_frame.y + init_frame.height},
            {x: init_frame.x, y: init_frame.y},
        ];
        selectorPoints = selectorPoints.map(p => p2r.computeCoord3(p));
        for (let i = 0; i < targets.length; i++) {
            const m = targets[i].matrix2Root();
            const {width: w, height: h} = targets[i].frame;
            const ps: XY[] = [
                {x: 0, y: 0},
                {x: w, y: 0},
                {x: w, y: h},
                {x: 0, y: h},
                {x: 0, y: 0},
            ].map(p => m.computeCoord3(p));
            if (isTarget(selectorPoints as any, ps) || isTarget(ps as any, selectorPoints)) {
                pure = false; // 存在🍌
                break;
            }
        }
        !pure && (init_frame.x += 20);
    }
    return init_frame;
}

/**
 * @description shapes中是否存在symbol或组成symbol的图层
 */
export function is_exist_symbol_layer(shapes: Shape[]) {
    for (let i = 0, len = shapes.length; i < len; i++) {
        let s: Shape | undefined = shapes[i];
        while (s) {
            if (s.type === ShapeType.Symbol) return true;
            s = s.parent;
        }
    }
    return false;
}

export function switch_symref_state(context: Context, variable: Variable, state: string) {
    const symbolref = context.selection.symbolrefshape;
    if (!symbolref) return;
    const editor = context.editor4Shape(symbolref);
    editor.switchSymState(variable.id, state);
}

export function get_status_vari_for_symbolref(symbolref: SymbolRefShape, variable: Variable) {
    const overrides = symbolref.findOverride(variable.id, OverrideType.Variable);
    return overrides ? overrides[overrides.length - 1] : variable;
}

/**
 * @description 判断图层是否为组件的组成部分
 */
export function is_part_of_symbol(shape: Shape) {
    let s: Shape | undefined = shape;
    while (s) {
        if (s.type === ShapeType.Symbol) return true;
        s = s.parent;
    }
    return false;
}

/**
 * @description 判断选中的图层是否都是实例
 */
export function is_shapes_if_symbolref(shapes: Shape[]) {
    let is_all_ref = true;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.type !== ShapeType.SymbolRef) {
            is_all_ref = false;
            break;
        }
    }
    return is_all_ref;
}

/**
 * @description 判断选中的实例是否是同一个组件
 */
export function is_symbolref_disa(shapes: SymbolRefShape[]) {
    let result = true;
    const firstId = shapes[0].refId;
    for (let i = 1; i < shapes.length; i++) {
        const symbolref = shapes[i];
        if (symbolref.refId !== firstId) {
            result = false;
            break;
        }
    }
    return result;
}