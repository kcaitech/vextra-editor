import { debounce, throttle } from "lodash";
import { Context } from "@/context";
import { ClientXY, PageXY } from "@/context/selection";
import {
    AsyncCreator,
    Color,
    ContactForm,
    GroupShape,
    GroupShapeView,
    ImageShape,
    Matrix,
    Page,
    PageView,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView,
    SymbolRefShape,
    SymbolRefView,
    SymbolShape,
    TableShape,
    TableView,
    TextShape,
    adapt2Shape
} from "@kcdesign/data";
import { Action, ResultByAction } from "@/context/tool";
import { Perm, WorkSpace } from '@/context/workspace';
import { is_mac, XYsBounding } from '@/utils/common';
import { searchCommentShape as finder } from '@/utils/comment'
import { paster_image } from "./clipboard";
import { landFinderOnPage, scrollToContentView } from './artboardFn'
import { fit_no_transform, is_parent_locked, is_parent_unvisible } from "./shapelist";
import { is_part_of_symbol, is_state, make_symbol, one_of_is_symbolref } from "@/utils/symbol";
import { Groups } from "aws-sdk/clients/budgets";
import { message } from "./message";
import { TableSelection } from "@/context/tableselection";

export interface Media {
    name: string
    frame: { width: number, height: number }
    buff: Uint8Array
    base64: string
}

interface SystemClipboardItem {
    type: ShapeType
    contentType: string
    content: Media | string
}

export interface Root {
    init: boolean
    x: number
    y: number
    bottom: number
    right: number
    width: number
    height: number
    element: any
    center: ClientXY
}

export type Area =
    'text-selection'
    | 'controller'
    | 'group'
    | 'artboard'
    | 'null'
    | 'normal'
    | 'table'
    | 'table_cell'
    | 'component'
    | 'instance';
const updateRootTime = 300;

export function _updateRoot(context: Context, element: HTMLElement) {
    const { x, y, right, bottom } = element.getBoundingClientRect();
    const root: Root = {
        init: true, x, y, right, bottom, element,
        width: right - x,
        height: bottom - y,
        center: { x: (right - x) / 2, y: (bottom - y) / 2 }
    }
    context.workspace.updateRoot(root);
}

export const updateRoot = debounce(_updateRoot, updateRootTime);

// 根据类型给图形命名
export function getName(type: ShapeType, brothers: (ShapeView | Shape)[], t: Function): string {
    const name = t(`shape.${type}`);
    const renamebrothers = brothers.filter((item) => item.type === type);
    const repeats: number = renamebrothers.length;
    return repeats ? `${name} ${repeats + 1}` : name;
}

export function get_image_name(brothers: ShapeView[], name: string) {
    name = name.trim();
    const renamebrothers = brothers.filter((item: ShapeView) => {
        const _n: any = item.name.split(' ');
        return item.type === ShapeType.Image && _n[0] === name;
    });
    const repeats: number = renamebrothers.length;
    return repeats ? `${name} ${repeats + 1}` : name;
}

export function get_symbol_ref_name(symbolname: string, symbolref: string, brothers: Shape[]) {
    let repeats = 1;
    for (let i = 0, len = brothers.length; i < len; i++) {
        const shape = brothers[i];
        if (shape.type !== ShapeType.SymbolRef) continue;
        if ((shape as SymbolRefShape).refId === symbolref) repeats++;
    }
    return repeats > 1 ? `Ref-${symbolname}-${repeats}` : `Ref-${symbolname}`;
}

export function get_component_state_name(union: SymbolShape, t: Function) {
    if (!union.isSymbolUnionShape) return '';
    if (union.childs.length === 0) return t('shape.default');
    return t('compos.state') + (union.childs.length + 1);
}

// 判断图形是否在可视区域内
export function isInner(context: Context, shape: ShapeView) {
    const pMatrix = context.workspace.matrix;
    const { x: rx, y: ry, bottom, right } = context.workspace.root;
    const s2pMatirx = shape.matrix2Root();
    const { width, height } = shape.frame;
    let point = [[0, 0], [width, 0], [width, height], [0, height]]
    point = point.map(p => {
        const _s = s2pMatirx.computeCoord(p[0], p[1]);
        const _p = pMatrix.computeCoord(_s.x, _s.y);
        return [_p.x, _p.y];
    })
    const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
    const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
    const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
    const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);

    if ((l + rx) > right - 20 || r < 0 + 20) {
        return false;
    } else if (b < 0 + 20 || (t + ry) > bottom - 20) {
        return false;
    } else {
        return true;
    }
}

export function init_shape(context: Context, frame: ShapeFrame, mousedownOnPageXY: PageXY, t: Function) {
    const selection = context.selection;
    const workspace = context.workspace;

    const action = context.tool.action;
    const type = ResultByAction(action);

    const page = selection.selectedPage;
    const parent = selection.getClosestContainer(mousedownOnPageXY);

    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;

    if (page && parent && type) {
        const editor = context.editor.controller();
        const name = getName(type, (parent).childs, t);

        asyncCreator = editor.asyncCreator(mousedownOnPageXY);

        if (action === Action.AddArrow) {
            new_shape = asyncCreator.init_arrow(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else if (action === Action.AddCutout) {
            new_shape = asyncCreator.init_cutout(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else {
            new_shape = asyncCreator.init(page.data, (adapt2Shape(parent) as GroupShape), type, name, frame);
        }
    }

    if (asyncCreator && new_shape) {
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
        })
        workspace.creating(true);
        return { asyncCreator, new_shape };
    }
}

export function init_contact_shape(context: Context, frame: ShapeFrame, mousedownOnPageXY: PageXY, t: Function, apex?: ContactForm, p2?: PageXY) {
    const selection = context.selection, workspace = context.workspace;
    const page = selection.selectedPage;
    let asyncCreator: AsyncCreator | undefined, new_shape: Shape | undefined;
    if (page) {
        const editor = context.editor.controller();
        const name = getName(ShapeType.Contact, page.childs, t);
        if (apex && p2) {
            frame.x = p2.x, frame.y = p2.y;
            mousedownOnPageXY.x = p2.x, mousedownOnPageXY.y = p2.y;
        }
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        new_shape = asyncCreator.init_contact(page.data, page.data, frame, name, apex);
    }
    if (asyncCreator && new_shape) {
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
        })
        workspace.creating(true);
        return { asyncCreator, new_shape };
    }
}

// 图形从init到insert
export function init_insert_shape(context: Context, mousedownOnPageXY: PageXY, t: Function, land?: ShapeView, _t?: ShapeType) {
    const tool = context.tool;
    const action = tool.action;
    if (action === Action.AddText) {
        return init_insert_textshape(context, mousedownOnPageXY, t('shape.input_text'));
    }
    const selection = context.selection;
    const workspace = context.workspace;
    const type = _t || ResultByAction(action);
    const page = selection.selectedPage;
    const parent = land || selection.getClosestContainer(mousedownOnPageXY);
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent && type) {
        const editor = context.editor.controller();
        const name = getName(type, (parent).childs, t);
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        if (action === Action.AddArrow) {
            new_shape = asyncCreator.init_arrow(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else if (action === Action.AddCutout) {
            new_shape = asyncCreator.init_cutout(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else {
            new_shape = asyncCreator.init(page.data, (adapt2Shape(parent) as GroupShape), type, name, frame);
        }
    }
    if (asyncCreator && new_shape) {
        asyncCreator.close();
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
        })
    }
    workspace.creating(false);
    tool.setAction(Action.AutoV);
    context.cursor.reset();
}

// 图形从init到insert
export function init_insert_shape2(context: Context, mousedownOnPageXY: PageXY, t: Function, land?: ShapeView, _t?: ShapeType) {
    const tool = context.tool;
    const action = tool.action;
    if (action === Action.AddText) return init_insert_textshape(context, mousedownOnPageXY, t('shape.input_text'));
    const selection = context.selection;
    const type = _t || ResultByAction(action);
    const page = selection.selectedPage;
    const parent = land || selection.getClosestContainer(mousedownOnPageXY);
    let new_shape: Shape | undefined | false;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent && type) {
        const editor = context.editor4Page(page);
        const name = getName(type, (parent).childs, t);
        if (action === Action.AddArrow || action === Action.AddLine) {
            const r = 0.25 * Math.PI;
            frame.width = 100 * Math.cos(r), frame.height = 100 * Math.sin(r);
            new_shape = editor.create2(page.data, adapt2Shape(parent) as GroupShape, type, name, frame, {
                rotation: -45,
                is_arrow: Boolean(action === Action.AddArrow),
                target_xy: mousedownOnPageXY
            });
        }
    }
    if (new_shape) {
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
        })
    }
    tool.setAction(Action.AutoV);
    context.cursor.reset();
}

//插入表格
export function init_insert_table(context: Context, t: Function, land?: ShapeView, _t?: ShapeType) {
    const tool = context.tool;
    const action = tool.action;
    const table = context.tool.tableSize;
    const matrix = context.workspace.matrix;
    const frame = new ShapeFrame(0, 0, table.col * 80, table.row * 30);
    const { x, y } = landFinderOnPage(matrix, context, frame)
    frame.x = x;
    frame.y = y;
    const PageXY = { x: x, y: y };
    const selection = context.selection;
    const workspace = context.workspace;
    const type = _t || ResultByAction(action);
    const page = selection.selectedPage;
    const parent = land || selection.getClosestContainer(PageXY);
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    if (page && parent && type) {
        const editor = context.editor.controller();
        const name = getName(type, (parent).childs, t);
        asyncCreator = editor.asyncCreator(PageXY);
        new_shape = asyncCreator.init_table(page.data, adapt2Shape(parent) as GroupShape, name, frame, table.row, table.col);
        if (new_shape) {
            page && context.nextTick(page, () => {
                const s = new_shape && page.shapes.get(new_shape.id);
                s && scrollToContentView(s, context);
            })
            // const timer = setTimeout(() => {
            //     new_shape && scrollToContentView(new_shape, context);
            //     clearTimeout(timer);
            // }, 100)
        }
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
        })
    }
    workspace.creating(false);
    tool.setAction(Action.AutoV);
    context.cursor.reset();
}

// 插入文本框
export function init_insert_textshape(context: Context, mousedownOnPageXY: PageXY, content: string, land?: ShapeView) {
    const selection = context.selection;
    const workspace = context.workspace;
    const page = selection.selectedPage;
    const parent = land || selection.getClosestContainer(mousedownOnPageXY);
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent) {
        const editor = context.editor.controller();
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        new_shape = asyncCreator.init_text(page.data, adapt2Shape(parent) as GroupShape, frame, content);
    }
    if (asyncCreator && new_shape) {
        asyncCreator.close();
        page && context.nextTick(page, () => {
            const s = new_shape && page.shapes.get(new_shape.id);
            s && selection.selectShape(s);
            context.textSelection.selectText(0, (new_shape as TextShape).text.length);
        })
    }
    context.selection.setSelectionNewShapeStatus(true);
    context.workspace.notify(WorkSpace.INIT_EDITOR);
    workspace.creating(false);
    context.tool.setAction(Action.AutoV);
    context.cursor.reset();
}

// 图片从init到insert
export function init_insert_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
    const selection = context.selection;
    const page = selection.selectedPage;
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page) {
        const editor = context.editor.controller();
        const name = getName(ShapeType.Image, page.childs, t);
        asyncCreator = editor.asyncCreator(mousedownOnPageXY);
        const _m = media;
        let _name: any = _m.name.split('.');
        if (_name.length > 1) {
            _name.pop();
            if (_name[0]) {
                _name = get_image_name(page.childs, _name[0]);
            } else {
                _name = name;
            }
        }
        frame.height = _m.frame.height;
        frame.width = _m.frame.width;
        new_shape = asyncCreator.init_media(page.data, (page.data as GroupShape), _name as string, frame, _m);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        new_shape = page!.data.getShape(new_shape.id)
        return new_shape;
    }
}

export function insert_imgs(context: Context, t: Function, media: Media[], upload_container?: any) {
    const selection = context.selection;
    const new_shapes: Shape[] = [];
    if (media && media.length) {
        const xy = adjust_content_xy(context, media[0]);
        for (let i = 0; i < media.length; i++) {
            if (i > 0) xy.x = xy.x + media[i - 1].frame.width + 10;
            const img = init_insert_image(context, xy, t, media[i]);
            if (img) {
                new_shapes.push(img);
            }

            if (!upload_container) {
                continue;
            }

            upload_container[(img as ImageShape).imageRef] = media[i];
        }
    }
    if (new_shapes.length) {
        const page = selection.selectedPage;
        page && context.nextTick(page, () => {
            const selects: ShapeView[] = [];
            new_shapes.forEach((s) => {
                const v = page.shapes.get(s.id);
                if (v) selects.push(v);
            })
            context.selection.rangeSelectShape(selects);
        })
    }
    context.workspace.setFreezeStatus(false);
}

export function is_drag(context: Context, e: MouseEvent, start: ClientXY, threshold?: number) {
    const root = context.workspace.root;
    const dragActiveDis = threshold || 4;
    const diff = Math.hypot(e.clientX - root.x - start.x, e.clientY - root.y - start.y);
    return Boolean(diff > dragActiveDis);
}

export function adjust_content_xy(context: Context, m: Media) {
    const workspace = context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const ratio_wh = m.frame.width / m.frame.height;
    const page_height = root.height / matrix.m00;
    const page_width = root.width / matrix.m00;
    if (m.frame.height >= m.frame.width) {
        if (m.frame.height > page_height * 0.95) {
            m.frame.height = page_height * 0.95;
            m.frame.width = m.frame.height * ratio_wh;
        }
    } else {
        if (m.frame.width > page_width * 0.95) {
            m.frame.width = page_width * 0.95;
            m.frame.height = m.frame.width / ratio_wh;
        }
    }
    const page_center = matrix.inverseCoord(root.center);
    return { x: page_center.x - m.frame.width / 2, y: page_center.y - m.frame.height / 2 };
}

export function drop(e: DragEvent, context: Context, t: Function) {
    e.preventDefault();
    const data = e?.dataTransfer?.files;
    if (!data?.length || data[0]?.type.indexOf('image') < 0) {
        return;
    }
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
    const file = data[0];
    item.contentType = file.type;
    const frame = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
        frame.width = img.width;
        frame.height = img.height;
        const ratio = frame.width / frame.height;
        // if (frame.width >= frame.height) {
        //     if (frame.width > 600) {
        //         frame.width = 600;
        //         frame.height = frame.width / ratio;
        //     }
        // } else {
        //     if (frame.height > 600) {
        //         frame.height = 600;
        //         frame.width = 600 * ratio;
        //     }
        // }
        const fr = new FileReader();
        fr.onload = function (event) {
            const base64: any = event.target?.result;
            if (base64) {
                fr.onload = function (event) {
                    const buff = event.target?.result;
                    if (base64 && buff) {
                        item.content = { name: file.name, frame, buff: new Uint8Array(buff as any), base64 };
                        const content = item!.content as Media;
                        const root = context.workspace.root;
                        const { clientX, clientY } = e;
                        const xy: PageXY = context.workspace.matrix.inverseCoord({
                            x: clientX - root.x,
                            y: clientY - root.y
                        });
                        xy.x = xy.x - frame.width / 2;
                        xy.y = xy.y - frame.height / 2;
                        paster_image(context, xy, t, content);
                    }
                }
                fr.readAsArrayBuffer(file);
            }
        }
        fr.readAsDataURL(file);
    }
    img.src = URL.createObjectURL(file);
}

/**
 * 使page全部内容都在可视区，并居中
 * @param context
 */
export function adapt_page(context: Context, initPage = false) {
    const childs = context.selection.selectedPage?.childs || [];
    if (!childs.length) return new Matrix();
    const matrix = context.workspace.matrix;
    const points: ClientXY[] = [];
    for (let i = 0; i < childs.length; i++) {
        const item = childs[i];
        const frame = item.frame;
        const m = item.matrix2Root();
        m.multiAtLeft(matrix);
        points.push(...[[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => m.computeCoord(p[0], p[1])));
    }
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const root = context.workspace.root;
    const w_max = root.width;
    const h_max = root.height;
    const ratio_w = width / w_max * 1.06; // 两边留点空白
    const ratio_h = height / h_max * 1.12; // 留点位置给容器标题
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2); // 先去中心点
        const max = initPage ? 1 : 256;
        if (matrix.m00 / ratio > 0.02 && matrix.m00 / ratio < max) { // 不能小于2%,不能大于25600%
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            } else if (matrix.m00 / ratio >= max) {
                matrix.scale(max / matrix.m00);
            }
        }
        matrix.trans(root.width / 2, root.height / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
    return matrix;
}

// 列表转树
export const list2Tree = (list: any, rootValue: string) => {
    const arr: any = []
    list.forEach((item: any) => {
        if (item.parent_id === rootValue) {
            const children = list2Tree(list, item.id)
            if (children.length) {
                item.children = children
            }
            arr.push(item)
        }
    })
    return arr
}

export function flattenShapes(shapes: ShapeView[]) {
    return shapes.reduce((result: ShapeView[], item: ShapeView) => {
        if (Array.isArray((item as GroupShapeView).childs)) {
            // 如果当前项有子级数组，则递归调用flattenArray函数处理子级数组
            result = result.concat(flattenShapes((item as GroupShapeView).childs));
        }
        return result.concat(item);
    }, []);
}

export function page_scale(context: Context, scale: number) {
    const workspace = context.workspace;
    const root = workspace.root;
    const matrix = workspace.matrix;
    const offsetX = root.center.x - root.x;
    const offsetY = root.center.y - root.y;
    matrix.trans(-offsetX, -offsetY);
    matrix.scale(scale / matrix.m00);
    matrix.trans(offsetX, offsetY);
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

/**
 * 右键选择图形的规则
 * @param p 点击位置在页面中所处的位置
 * @param context
 */
export function right_select(e: MouseEvent, p: PageXY, context: Context): Area {
    const is_edting = context.workspace.isEditing;
    const area_0 = finder(context, p);
    if (area_0.length && area_0[0].type === ShapeType.Table) {
        const table = context.tableSelection;
        if (table.editingCell) {
            return 'table';
        } else if (table.tableRowEnd > -1) {
            return 'table_cell';
        }
    }
    if ((e.target as Element).closest('#text-selection') && is_edting) {
        return 'text-selection';
    }
    if ((e.target as Element).closest('[data-area="controller"]')) { // 点在了控件上
        return 'controller';
    }
    const selection = context.selection;
    const area_1 = context.selection.getShapesByXY(p, false);
    if (area_1) {
        if (area_1.type === ShapeType.Group) {
            selection.selectShape(area_1);
            return 'group';
        } else if (area_1.type === ShapeType.Symbol) {
            selection.selectShape(area_1);
            return 'component';
        } else if (area_1.type === ShapeType.SymbolRef) {
            selection.selectShape(area_1);
            return 'instance';
        }
    }
    const area_2 = finder(context, p);
    if (area_2.length) {
        if (area_2[0].type === ShapeType.Artboard) {
            selection.selectShape(area_2[0]);
            return 'artboard';
        } else {
            selection.selectShape(area_2[0]);
            return 'normal';
        }
    }
    return 'null';
}

/**
 * 判断选区存在的类型
 * @param context
 */
export function get_selected_types(context: Context): number {
    let result = 0;
    const shapes = context.selection.selectedShapes;
    for (let i = shapes.length - 1; i > -1; i--) {
        const shape = shapes[i];
        const type = shape.type;
        if (type === ShapeType.Artboard) {
            result = result | 1;
        } else if (type === ShapeType.Group) {
            result = result | 2;
        } else if (type === ShapeType.SymbolRef) {
            result = result | 4;
        }
        if (is_part_of_symbol(shape)) {
            result = result | 8;
        }
        if (result >= 15) return result; // 已经得到了最多类型，不可能再有新的类型，不需要继续判断
    }
    return result;
}

/**
 * 右键菜单打开之前根据点击的区域整理应该显示的菜单项
 * @param { "controller" | "text-selection" | "group" | "artboard" | "component" | "null" | "normal" | "table" | "table_cell" | "instance" } area 点击的区域
 * @returns
 */

export function get_menu_items(context: Context, area: "controller" | "text-selection" | "group" | "artboard" | "component" | "null" | "normal" | "table" | "table_cell" | "instance", e: MouseEvent): string[] {
    const BASE_ITEM = ['all', 'copy'];

    let contextMenuItems = []
    if (area === 'artboard') { // 点击在容器上
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'visible', 'component', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'dissolution'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'group') { // 点击在编组上
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'visible', 'component', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'un_group'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'component') {
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'instance') {
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'visible', 'component', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'instance'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'controller') { // 点击在选区上
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'component', 'visible', 'lock', 'groups', 'container'];
        } else {
            contextMenuItems = BASE_ITEM;
        }

        let types = get_selected_types(context); // 点击在选区上时，需要判定选区内存在图形的类型
        if (types & 1) { // 存在容器
            if (permIsEdit(context) && !context.tool.isLable) {
                contextMenuItems.push('dissolution');
            }
        }
        if (types & 2) { // 存在编组
            if (permIsEdit(context) && !context.tool.isLable) {
                contextMenuItems.push('un_group');
            }
        }
        if (types & 4) { // 存在实例
            const shapes = context.selection.selectedShapes;
            if (permIsEdit(context) && one_of_is_symbolref(shapes) && !context.tool.isLable) {
                contextMenuItems.push('instance');
            }
        }
        if (types & 8) { // 存在组件
            if (permIsEdit(context) && !context.tool.isLable) {
                const index = contextMenuItems.findIndex((item) => item === 'component');
                if (index > -1) contextMenuItems.splice(index, 1);
            }
        }
        const shapes = context.selection.selectedShapes;
        if (shapes.length <= 1) { // 当选区长度为1时，提供移动图层选项
            if (permIsEdit(context) && !context.tool.isLable) {
                contextMenuItems.push('forward', 'back', 'top', 'bottom');
            }
            if ((e.target as Element).closest('[data-title="symbol-title"]') || shapes[0].type === ShapeType.Symbol || shapes[0].type === ShapeType.SymbolUnion) { // 点在了组件上
                const index = contextMenuItems.findIndex((item) => item === 'component');
                if (index > -1) contextMenuItems.splice(index, 1);
            }
        }
    } else if (area === 'normal') { // 点击除了容器、编组以外的其他图形
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'visible', 'lock', 'component', 'forward', 'back', 'top', 'bottom', 'groups', 'container'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'text-selection') {
        if (permIsEdit(context) && !context.tool.isLable) {
            const selection = context.textSelection;
            if (selection.cursorStart === selection.cursorEnd) {
                contextMenuItems = ['all', 'paste', 'only_text'];
            } else {
                contextMenuItems = [...BASE_ITEM, 'cut', 'paste', 'only_text'];
            }
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'table') {
        if (permIsEdit(context) && !context.tool.isLable) {
            const selection = context.textSelection;
            if (selection.cursorStart === selection.cursorEnd) {
                contextMenuItems = ['all', 'paste', 'only_text', 'insert_column', 'delete_column', 'split_cell'];
            } else {
                contextMenuItems = [...BASE_ITEM, 'cut', 'paste', 'only_text', 'insert_column', 'delete_column', 'split_cell'];
            }
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else if (area === 'table_cell') {
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = ['insert_column', 'delete_column', 'merge_cell'];
        } else {
            contextMenuItems = BASE_ITEM;
        }
    } else {
        if (permIsEdit(context) && !context.tool.isLable) {
            contextMenuItems = ['all', 'paste-here', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor', 'title'];
        } else {
            contextMenuItems = ['all', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor', 'title'];
        }
    }
    return contextMenuItems;
}

export function color2string(color: Color, t?: number) {
    const { red, green, blue, alpha } = color;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function selectShapes(context: Context, shapes: ShapeView | undefined) {
    const hoveredShape = shapes, selection = context.selection;
    if (hoveredShape) {
        const selected = selection.selectedShapes;
        if (selected.length) {
            const isSelected = selected.find((s: ShapeView) => s.id == hoveredShape.id);
            if (!isSelected) {
                selection.hoverShape(hoveredShape);
            } else {
                selection.unHoverShape();
            }
        } else {
            selection.hoverShape(hoveredShape);
        }
    } else {
        selection.unHoverShape();
    }
}

export const permIsEdit = (context: Context) => {
    return Boolean(context.workspace.documentPerm === Perm.isEdit);
}

export const hasRadiusShape = (shape: ShapeView, type: ShapeType[]) => {
    const shapeType = shape.type
    if (shapeType === ShapeType.Group) {
        if (!(shape as GroupShapeView).data.isBoolOpShape) return false;
    }
    if (!type.includes(shapeType)) return false;
    return true;
}

export function skipUserSelectShapes(context: Context, shapes: ShapeView[]) {
    if (!shapes.length) return new Matrix();
    const matrix = context.workspace.matrix;
    const points: ClientXY[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const item = shapes[i];
        const frame = item.frame;
        const m = item.matrix2Root();
        m.multiAtLeft(matrix);
        points.push(...[[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => m.computeCoord(p[0], p[1])));
    }
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const root = context.workspace.root;
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    if (del.x || del.y) {
        matrix.trans(del.x, del.y);
        // context.workspace.matrixTransformation();
    }
}

export function map_from_shapes(shapes: ShapeView[], init?: Map<string, ShapeView>) {
    const map: Map<string, ShapeView> = init || new Map();
    for (let i = 0, len = shapes.length; i < len; i++) {
        const shape = shapes[i];
        map.set(shape.id, shape);
        if (shape.type === ShapeType.Table) continue;
        const children = shape.type === ShapeType.SymbolRef ? (shape.naviChilds || []) : (shape).childs;
        if (!children?.length) {
            continue;
        }
        map_from_shapes(children, map);
    }
    return map;
}

export function is_shape_out(context: Context, shape: ShapeView, matrix: Matrix) {
    const { x, y, bottom, right } = context.workspace.root;
    const { width, height } = shape.frame;
    let point: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
    for (let i = 0; i < 4; i++) point[i] = matrix.computeCoord3(point[i]);
    return Math.min(point[0].x, point[1].x, point[2].x, point[3].x) > right ||
        Math.max(point[0].x, point[1].x, point[2].x, point[3].x) < 0 ||
        Math.max(point[0].y, point[1].y, point[2].y, point[3].y) < 0 ||
        Math.min(point[0].y, point[1].y, point[2].y, point[3].y) > bottom;
}

export function is_need_skip_to_render(shape: Shape, matrix: Matrix) { // 不是准确的方法，但是综合效果最好
    const f = shape.frame;
    const lt = matrix.computeCoord2(0, 0);
    const rt = matrix.computeCoord2(f.width, f.height);
    return Math.hypot(rt.x - lt.x, rt.y - lt.y) < 72;
}

/**
 * @description 图形追踪，可跨页面
 * @param context
 * @param shape
 */
export function shape_track(context: Context, shape: ShapeView) {
    const page = shape.getPage() as PageView;
    if (!page) return;
    const target = page.getShape(shape.id);
    if (!target) return;
    const selection = context.selection;
    const selectedPage = selection.selectedPage;
    if (!selectedPage) return;
    let need_change_page = selectedPage.id !== page.id;
    if (need_change_page) selection.selectPage(page);
    selection.selectShape(target);

    need_change_page ? setTimeout(track, 10) : track();

    function track() {
        target && fit_no_transform(context, target);
    }
}

/**
 * @description 文档范围内通过id读取shape
 */
export function get_shape_within_document(context: Context, id: string): ShapeView | undefined {
    const pages = context.data.pagesMgr.resource;
    for (let i = 0, len = pages.length; i < len; i++) {
        const t = pages[i].getShape(id);
        if (t) {
            return context.getPageDom(pages[i]).dom.getShape(t.id);
        }
    }
}

export function is_content(context: Context, e: MouseEvent) {
    const root = context.workspace.root;
    return e.clientX > root.x && e.clientX < root.right && e.clientY > root.y && e.clientY < root.bottom;
}

export function ref_symbol(context: Context, position: PageXY, symbol: ShapeView | Shape) {
    const state = symbol;
    const selection = context.selection, workspace = context.workspace;
    const shapes: ShapeView[] = selection.selectedPage?.childs || [];
    const page = selection.selectedPage;
    if (page) {
        const editor = context.editor4Page(page);
        // const matrix = workspace.matrix;
        const frame = new ShapeFrame(0, 0, state.frame.width, state.frame.height);
        frame.x = position.x - state.frame.width / 2;
        frame.y = position.y - state.frame.height / 2;
        const childs = (page).childs;
        let id = symbol.id;
        let name = symbol.name;
        // if (is_state(symbol)) {
        //     id = symbol.parent!.id;
        //     name = symbol.parent!.name;
        // }
        let count = 1;
        for (let i = 0, len = childs.length; i < len; i++) {
            const item = childs[i];
            if ((item as SymbolRefView)?.refId === id) count++;
        }
        let ref: Shape | false = editor.refSymbol(context.data, `${name} ${count}`, frame, id);
        ref = editor.insert(page.data, shapes.length, ref);

        if (ref) {
            context.nextTick(page, () => {
                const s = ref && page.getShape(ref.id);
                s && selection.selectShape(s);
            })
        }
    }
}

let scale_delta = 1.06;
let scale_delta_ = 1 / scale_delta;

export function root_scale(context: Context, e: WheelEvent) {
    if (Number((context.workspace.matrix.toArray()[0] * 100).toFixed(0)) <= 2) {
        scale_delta_ = 1
    } else {
        scale_delta_ = 1 / scale_delta;
    }
    const matrix = context.workspace.matrix;
    const root = context.workspace.root;
    const offsetX = e.x - root.x;
    const offsetY = e.y - root.y;
    matrix.trans(-offsetX, -offsetY);
    matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
    matrix.trans(offsetX, offsetY);
}
export function root_trans(context: Context, e: WheelEvent) {
    const MAX_STEP = 120;

    let stepx = Math.abs(e.deltaX) > MAX_STEP ? (MAX_STEP * (e.deltaX / Math.abs(e.deltaX))) : e.deltaX;
    let stepy = Math.abs(e.deltaY) > MAX_STEP ? (MAX_STEP * (e.deltaY / Math.abs(e.deltaY))) : e.deltaY;

    if (e.shiftKey && !is_mac() && e.deltaX < 1) {
        stepx = stepy;
        stepy = 0;
    }

    context.workspace.matrix.trans(-stepx, -stepy);
}

export function root_trans_direction(context: Context, e: WheelEvent, step: number) {
    if (e.shiftKey) {
        const _d = is_mac() ? e.deltaX : e.deltaY; // window的deltaX竟然有问题
        const delta = _d > 0 ? -step : step;
        context.workspace.matrix.trans(delta, 0);
    } else {
        const delta = e.deltaY > 0 ? -step : step;
        context.workspace.matrix.trans(0, delta);
    }
}

export function pre_modify_anchor(shape: ShapeView) {
    let rotate = shape.rotation || 0;
    if (shape.isFlippedHorizontal) rotate = rotate + 270;
    if (shape.isFlippedVertical) {
        rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    return rotate;
}

/**
 * 
 * 容器标题的最大视图宽度
*/
export function shape_title_width(shape: ShapeView, matrix: Matrix) {
    const rotate = pre_modify_anchor(shape);
    const f = shape.frame;
    let width = 0;
    const lt = matrix.computeCoord2(0, 0);
    const rt = matrix.computeCoord2(f.width, 0);
    const lb = matrix.computeCoord2(0, f.height);
    if (rotate >= 0 && rotate < 45) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 45 && rotate < 135) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y)
    } else if (rotate >= 135 && rotate < 225) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 225 && rotate < 315) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y)
    } else if (rotate >= 315 && rotate <= 360) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    }
    return width;
}

/**
 * @description 全选操作，ps:文本的全选操作不在这里处理
 */
export function select_all(context: Context) {
    // todo 编辑模式
    if (context.workspace.is_path_edit_mode) {
        select_all_for_path_edit(context);
        return;
    }

    const selection = context.selection;
    const selected = selection.selectedShapes;
    if (!selected.length) {
        selection.rangeSelectShape(selection.selectedPage!.childs);
        return;
    }

    // 表格内全选操作
    if (selected.length === 1 && selected[0].type === ShapeType.Table) {
        const table: TableView = selected[0] as TableView;
        const ts = context.tableSelection;
        const grid = table.getLayout().grid;
        ts.selectTableCellRange(0, grid.rowCount - 1, 0, grid.colCount - 1, true);
        return;
    }

    const p_map = new Map();
    selected.forEach(s => {
        if (s.parent) p_map.set(s.parent.id, s.parent)
    });
    if (p_map.size > 1) {
        const page = selection.selectedPage;
        if (page) selection.rangeSelectShape(page.childs);
    } else {
        selection.rangeSelectShape(Array.from(p_map.values())[0].childs);
    }
}

function select_all_for_path_edit(context: Context) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) {
        console.log('select_all_for_path_edit: !path_shape');
        return;
    }
    const indexes = path_shape.points.map((_, idx) => idx);
    context.path.select_points(indexes);
    context.path.select_sides(indexes);
}

/**
 * @description 图层隐藏与显示
 * @param context 
 * @returns 
 */
export function set_visible_for_shapes(context: Context) {
    let shapes = context.selection.selectedShapes;
    const page = context.selection.selectedPage;
    shapes = shapes.filter(s => !is_parent_unvisible(s));
    if (!page) {
        return;
    }
    const editor = context.editor4Page(page);
    editor.toggleShapesVisible(shapes.map(s => adapt2Shape(s)));
    context.selection.resetSelectShapes();
}

/**
 * @description 设置图层锁
 * @param context 
 * @returns 
 */
export function set_lock_for_shapes(context: Context) {
    let shapes = context.selection.selectedShapes;
    const page = context.selection.selectedPage;
    shapes = shapes.filter(s => !is_parent_locked(s));
    if (!page) {
        return;
    }
    const editor = context.editor4Page(page);
    editor.toggleShapesLock(shapes.map(s => adapt2Shape(s)));
    context.selection.resetSelectShapes();
}

/**
 * @description 创建编组
 * @param context 
 */
export function component(context: Context) {
    const symbol = make_symbol(context, context.workspace.t.bind(context.workspace));
    if (symbol) {
        // context.selection.selectShape(symbol as unknown as Shape);
        const page = context.selection.selectedPage;
        page && context.nextTick(page, () => {
            const s = symbol && page.getShape(symbol.id);
            s && context.selection.selectShape(s);
        })
    }
}

export function lower_layer(context: Context, layer?: number) {
    const selection = context.selection;
    if (selection.selectedShapes.length !== 1) {
        return;
    }

    const page = selection.selectedPage;

    if (!page) {
        return;
    }

    const editor = context.editor4Page(page);
    const result = editor.lower_layer(adapt2Shape(selection.selectedShapes[0]), layer);

    if (!result) {
        message('info', context.workspace.t('homerightmenu.unable_lower'));
    }
}

export function uppper_layer(context: Context, layer?: number) {
    const selection = context.selection;

    if (selection.selectedShapes.length !== 1) {
        return;
    }

    const page = selection.selectedPage;

    if (!page) {
        return;
    }

    const editor = context.editor4Page(page);
    const result = editor.uppper_layer(adapt2Shape(selection.selectedShapes[0]), layer);

    if (!result) {
        message('info', context.workspace.t('homerightmenu.unable_upper'));
    }
}

export function scale_0(context: Context) {
    const workspace = context.workspace;
    const { center } = workspace.root;
    workspace.matrix.trans(-center.x, -center.y);
    const _s = 1 / workspace.matrix.m00;
    workspace.matrix.scale(_s);
    workspace.matrix.trans(center.x, center.y);
    workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}

function modify_selection(context: Context) {
    const selection = context.selection;
    const shapes = context.selection.selectedShapes;
    const page = context.selection.selectedPage!;
    const new_selected: ShapeView[] = [];
    context.nextTick(
        page,
        () => {
            if (!shapes.length) {
                return;
            }
            let changed = false;

            for (let i = 0; i < shapes.length; i++) {
                const item = shapes[i];
                if (!page.shapes.get(item.id)) {
                    changed = true;
                    continue;
                }
                new_selected.push(item);
            }

            if (changed) {
                selection.rangeSelectShape(new_selected);
                context.workspace.notify(WorkSpace.CLAC_ATTRI);
            }
        }
    )
}

export function undo(context: Context) {
    const repo = context.repo;
    repo.canUndo() && repo.undo();

    modify_selection(context);
}

export function redo(context: Context) {
    const repo = context.repo;
    repo.canRedo() && repo.redo();

    modify_selection(context);
}

export async function upload_image(context: Context, ref: string, buff: ArrayBufferLike) {
    try {
        const __buff = new Uint8Array(buff);
        return await context.communication.docResourceUpload.upload(ref, __buff.buffer);
    } catch (error) {
        console.log('upload_image:', error);
        return false;
    }
}

export function detectZoom() {
    let ratio = 0,
        screen = window.screen as any,
        ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
        ratio = Math.round(ratio * 100);
    }
}


export const get_table_range = (table: TableSelection) => {
    const is_edting = table.editingCell;
    let range
    if (is_edting) {
        range = {
            rowStart: is_edting.index.row,
            rowEnd: is_edting.index.row,
            colStart: is_edting.index.col,
            colEnd: is_edting.index.col
        };
    } else {
        range = {
            rowStart: table.tableRowStart,
            rowEnd: table.tableRowEnd,
            colStart: table.tableColStart,
            colEnd: table.tableColEnd
        };
    }
    return range;
}

export const is_editing = (table: TableSelection) => {
    return table.editingCell || table.tableRowStart > -1 || table.tableColStart > -1;
}