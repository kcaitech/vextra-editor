import { Context } from "@/context";
import { ClientXY, PageXY, Selection, XY } from "@/context/selection";
import {
    adapt2Shape,
    AsyncCreator,
    Color,
    ColVector3D,
    ContactForm,
    getFormatFromBase64,
    GroupShape,
    GroupShapeView,
    makeShapeTransform2By1,
    Matrix,
    PathShapeView,
    PathType,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView,
    SymbolRefShape,
    SymbolRefView,
    SymbolShape,
    TableView,
    TextAttr,
    TextShape
} from "@kcdesign/data";
import { Action, ResultByAction } from "@/context/tool";
import { WorkSpace } from '@/context/workspace';
import { is_mac, XYsBounding } from '@/utils/common';
import { searchCommentShape as finder } from '@/utils/comment'
import { adjust_content_xy, after_import, paster_image } from "./clipboard";
import { landFinderOnPage, scrollToContentView } from './artboardFn'
import { fit_no_transform, is_parent_locked, is_parent_unvisible } from "./shapelist";
import { is_part_of_symbol, make_symbol, one_of_is_symbolref } from "@/utils/symbol";
import { message } from "./message";
import { TableSelection } from "@/context/tableselection";
import * as parse_svg from "@/svg_parser";
import { sort_by_layer } from "@/utils/group_ungroup";
import { Navi } from "@/context/navigate";
import { v4 } from "uuid";

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

export function init_shape(context: Context, frame: ShapeFrame, mousedownOnPageXY: PageXY, t: Function, isLockRatio: boolean) {
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

        asyncCreator = editor.asyncCreator(mousedownOnPageXY, isLockRatio);
        if (action === Action.AddArrow) {
            new_shape = asyncCreator.init_arrow(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else if (action === Action.AddCutout) {
            new_shape = asyncCreator.init_cutout(page.data, (adapt2Shape(parent) as GroupShape), name, frame);
        } else {
            const text_attr = action === Action.AddText ? context.textSelection.getTextAttr || new TextAttr() : undefined;
            new_shape = asyncCreator.init(page.data, (adapt2Shape(parent) as GroupShape), type, name, frame, text_attr);
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
export function init_insert_shape(context: Context, mousedownOnPageXY: PageXY, t: Function, isLockRatio: boolean, land?: ShapeView, _t?: ShapeType) {
    const tool = context.tool;
    const action = tool.action;
    if (action === Action.AddText) {
        return init_insert_textshape(context, mousedownOnPageXY, t('shape.input_text'), isLockRatio);
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
        asyncCreator = editor.asyncCreator(mousedownOnPageXY, isLockRatio);
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
export function init_insert_shape2(context: Context, mousedownOnPageXY: PageXY, t: Function, isLockRatio: boolean, land?: ShapeView, _t?: ShapeType) {
    const tool = context.tool;
    const action = tool.action;
    if (action === Action.AddText) return init_insert_textshape(context, mousedownOnPageXY, t('shape.input_text'), isLockRatio);
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
export function init_insert_textshape(context: Context, mousedownOnPageXY: PageXY, content: string, isLockRatio: boolean, land?: ShapeView) {
    const selection = context.selection;
    const workspace = context.workspace;
    const page = selection.selectedPage;
    const parent = land || selection.getClosestContainer(mousedownOnPageXY);
    let asyncCreator: AsyncCreator | undefined;
    let new_shape: Shape | undefined;
    const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
    if (page && parent) {
        const editor = context.editor.controller();
        asyncCreator = editor.asyncCreator(mousedownOnPageXY, isLockRatio);
        const text_attr = context.textSelection.getTextAttr || new TextAttr();
        new_shape = asyncCreator.init_text(page.data, adapt2Shape(parent) as GroupShape, frame, content, text_attr);
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
export function init_insert_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media, origin: { width: number, height: number }) {
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
        new_shape = asyncCreator.init_media(page.data, (page.data as GroupShape), _name as string, frame, _m, origin);
    }
    if (asyncCreator && new_shape) {
        asyncCreator = asyncCreator.close();
        new_shape = page!.data.getShape(new_shape.id)
        return new_shape;
    }
}

export function insert_imgs(context: Context, t: Function, media: Media[], origin: { width: number, height: number }, upload_container?: any) {
    const selection = context.selection;
    const new_shapes: Shape[] = [];
    if (media && media.length) {
        const xy = adjust_content_xy(context, media[0].frame as any);
        for (let i = 0; i < media.length; i++) {
            if (i > 0) xy.x = xy.x + media[i - 1].frame.width + 10;
            const img = init_insert_image(context, xy, t, media[i], origin);
            if (img) {
                new_shapes.push(img);
            }

            if (!upload_container) {
                continue;
            }
            if (img) {
                upload_container[img.style.fills[0].imageRef || ''] = media[i];
            }
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
    // context.workspace.setFreezeStatus(false);
}

export function modify_imgs(context: Context, media: Media[], upload_container?: any) {
    if (media && media.length) {
        for (let i = 0; i < media.length; i++) {
            if (!upload_container) {
                continue;
            }
            const format = getFormatFromBase64(media[i].base64);
            const ref = `${v4()}.${format}`;
            upload_container[ref] = media[i];
        }
    }
    // context.workspace.setFreezeStatus(false);
}

export function is_drag(context: Context, e: MouseEvent, start: ClientXY, threshold?: number) {
    const root = context.workspace.root;
    const dragActiveDis = threshold || 4;
    const diff = Math.hypot(e.clientX - root.x - start.x, e.clientY - root.y - start.y);
    return Boolean(diff > dragActiveDis);
}

export function drop(e: DragEvent, context: Context, t: Function) {
    if (!permIsEdit(context) || context.tool.isLable) {
        return;
    }

    e.preventDefault();
    const data = e?.dataTransfer?.files;
    if (!data?.length || data[0]?.type.indexOf('image') < 0) {
        return;
    }
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
    const file = data[0];
    if (file.type === "image/svg+xml") {
        SVGReader(context, file, context.workspace.getRootXY(e as MouseEvent));
        return;
    }

    item.contentType = file.type;
    const frame = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
        frame.width = img.width;
        frame.height = img.height;
        const origin = { width: img.width, height: img.height }

        const fr = new FileReader();
        fr.onload = function (event) {
            const base64: any = event.target?.result;
            if (!base64) {
                return;
            }

            fr.onload = function (event) {
                const buff = event.target?.result;
                if (!(base64 && buff)) {
                    return;
                }

                item.content = { name: file.name, frame, buff: new Uint8Array(buff as any), base64 };
                const content = item!.content as Media;
                const xy: PageXY = context.workspace.getRootXY(e as MouseEvent)
                xy.x = xy.x - frame.width / 2;
                xy.y = xy.y - frame.height / 2;
                paster_image(context, xy, t, content, origin);
            }
            fr.readAsArrayBuffer(file);
        }
        fr.readAsDataURL(file);
    }
    img.src = URL.createObjectURL(file);
}

export function SVGReader(context: Context, file: File, xy?: XY) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const svg = event.target?.result;
        if (svg) {
            const parseResult = parse_svg.parse(svg as string);

            if (parseResult.shape) {
                parseResult.shape.name = file.name.replace(".svg", "");

                if (xy) {
                    parseResult.shape.x = xy.x - parseResult.shape.frame.width / 2;
                    parseResult.shape.y = xy.y - parseResult.shape.frame.height / 2;
                } else {
                    const __xy = adjust_content_xy(context, parseResult.shape.frame as any, false);
                    parseResult.shape.x = __xy.x;
                    parseResult.shape.y = __xy.y;
                }
                const page = context.selection.selectedPage!;
                const editor = context.editor4Page(page);
                editor.insert(adapt2Shape(page) as GroupShape, page.childs.length, parseResult.shape);

                if (parseResult.mediaResourceMgr) {
                    const container: any = {};
                    parseResult.mediaResourceMgr.forEach((v: any, k: string) => {
                        container[k] = v;
                    });
                    after_import(context, container);
                }
            }
        }
    }
    reader.readAsText(file);
}

/**
 * 使page全部内容都在可视区，并居中
 * @param context
 */
export function adapt_page(context: Context, initPage = false, is_select = false) {
    const selectedShapes = context.selection.selectedShapes || [];
    const childs = is_select ? selectedShapes : context.selection.selectedPage?.childs || [];
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

export function adapt_page2(context: Context, containerWidth: number, containerHeight: number) {
    const page = context.selection.selectedPage!;
    const children = page.childs || [];
    if (!children.length) {
        return new Matrix();
    }
    const matrix = context.workspace.matrix;
    matrix.reset();
    const points: ClientXY[] = [];
    const frame = page.frame;
    points.push(...[[frame.x, frame.y], [frame.x + frame.width, frame.y], [frame.x + frame.width, frame.y + frame.height], [frame.x, frame.y + frame.height]].map(p => matrix.computeCoord2(p[0], p[1])));
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const root = {
        x: 0,
        y: 0,
        width: containerWidth,
        height: containerHeight,
        center: { x: containerWidth / 2, y: containerHeight / 2 }
    };
    const w_max = containerWidth;
    const h_max = containerHeight;

    const ratio_w = width / w_max * 1.06; // 两边留点空白
    const ratio_h = height / h_max * 1.12; // 留点位置给容器标题
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        const p_center = { x: page.frame.x + page.frame.width / 2, y: page.frame.y + page.frame.height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y }; // 这里直接算del是不对的

        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2); // 先去中心点
        const max = 1;
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
    // if ((window as any).__context.workspace.transforming && (window as any).__context.selection.selectedShapes.length > 50) return shapes; @@@
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
    // const area_0 = finder(context, p);
    const area_0 = context.selection.getLayers(p);
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
        if (area_1.type === ShapeType.Group || area_1.type === ShapeType.BoolShape) {
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
        } else if (type === ShapeType.Group || type === ShapeType.BoolShape) {
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
    const BASE_ITEM = ['all', 'copy', 'copyAs'];
    let contextMenuItems: string[] = []
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
            contextMenuItems = [...BASE_ITEM, 'paste-here', 'replace', 'component', 'visible', 'lock', 'groups', 'container', 'forward', 'back', 'top', 'bottom'];
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
        if (shapes.length <= 1) {
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
            contextMenuItems = ['all', 'paste-here', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor', 'title', "cutout"];
        } else {
            contextMenuItems = ['all', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor', 'title', "cutout"];
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
    return Boolean(!context.readonly);
}

export function skipUserSelectShapes(context: Context, shapes: ShapeView[]) {
    if (!shapes.length) return new Matrix();
    const matrix = context.workspace.matrix;
    const points: ClientXY[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const item = shapes[i];
        const { x, y, width, height } = item.frame;
        const m = item.transform2FromRoot; // 图层到Root；
        const clientTransform = makeShapeTransform2By1(matrix);
        m.addTransform(clientTransform); // root 到 client
        const { col0: lt, col1: rt, col2: rb, col3: lb } = m.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(x + width, y),
            ColVector3D.FromXY(x + width, y + height),
            ColVector3D.FromXY(x, y + height),
        ]);
        points.push(lt, rt, rb, lb);
    }
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const root = context.workspace.root;
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    if (del.x || del.y) {
        matrix.trans(del.x, del.y);
    }
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
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
    let point: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, {
        x: 0,
        y: height
    }];
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
export function shape_track(context: Context, shape: Shape | ShapeView) {
    const page = shape.getPage();
    if (!page) return;
    const selection = context.selection;
    const selectedPage = selection.selectedPage!;

    if (selectedPage.id === page.id) {
        const target = selectedPage.getShape(shape.id);
        if (target) {
            fit_no_transform(context, target);
            selection.selectShape(target);
        }
    } else {
        context.selection.selectPage(page.id).then(p => {
            if (!p) return;
            const target = p.getShape(shape.id);
            if (target) {
                fit_no_transform(context, target);
                selection.selectShape(target);
            }
        })
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
        frame.x = position.x - state.frame.width / 2 - page.frame.x;
        frame.y = position.y - state.frame.height / 2 - page.frame.y;
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
        ref = editor.insert(page.data, shapes.length, ref, true);

        if (ref) {
            context.nextTick(page, () => {
                const s = ref && page.getShape(ref.id);
                s && selection.selectShape(s);
            })
        }
    }
}

const MAX = 25600;
const MIN = 2;

export function root_scale(context: Context, e: WheelEvent) {
    let scale_delta = 1.2;

    if (Math.abs(e.deltaY) < 16 && Math.abs(e.deltaX) < 16) {
        scale_delta = 1.02;
    }

    let scale_delta_ = 1 / scale_delta;
    const scale = Number((context.workspace.matrix.toArray()[0] * 100).toFixed(0));
    if (scale <= MIN) {
        scale_delta_ = 1
    } else if (scale >= MAX) {
        scale_delta = MAX / scale;
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
    // todo flip
    // if (shape.isFlippedHorizontal) rotate = rotate + 270;
    // if (shape.isFlippedVertical) {
    //     rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    // }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    return rotate;
}

/**
 *
 * 容器标题的最大视图宽度
 */
export function shape_title_width(shape: ShapeView, matrix: Matrix) {
    let rotate = pre_modify_anchor(shape);
    // todo flip
    // if (shape.isFlippedHorizontal) rotate = rotate + 270;
    // if (shape.isFlippedVertical) {
    //     rotate = shape.isFlippedHorizontal ? rotate -= 90 : rotate += 90;
    // }
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    const f = shape.frame;
    let width = 0;
    const lt = matrix.computeCoord2(0, 0);
    const rt = matrix.computeCoord2(f.width, 0);
    const lb = matrix.computeCoord2(0, f.height);
    if (rotate >= 0 && rotate < 45) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    } else if (rotate >= 45 && rotate < 135) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 135 && rotate < 225) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    } else if (rotate >= 225 && rotate < 315) {
        width = Math.hypot(lb.x - lt.x, lb.y - lt.y);
    } else if (rotate >= 315 && rotate <= 360) {
        width = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    }
    return width;
}

/**
 * @description 全选操作，ps:文本的全选操作不在这里处理
 */
export function select_all(context: Context, reverse?: boolean) {
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
        if (page && !reverse) selection.rangeSelectShape(page.childs);
    } else {
        if (reverse) {
            const s_id = selected.map(s => s.id)
            const r_shape = Array.from(p_map.values())[0].childs.filter((item: any) => !s_id.includes(item.id))
            selection.rangeSelectShape(r_shape);
        } else {
            selection.rangeSelectShape(Array.from(p_map.values())[0].childs);
        }
    }
}

function select_all_for_path_edit(context: Context) {
    const path_shape = context.selection.pathshape;
    if (!path_shape || path_shape.pathType !== PathType.Editable) return;

    const __p = new Map<number, Set<number>>();
    const __s = new Map<number, Set<number>>();

    (path_shape as PathShapeView).segments.forEach((segment, index) => {
        const indexes = segment.points.map((_, idx) => idx);
        __p.set(index, new Set<number>(indexes));
        __s.set(index, new Set<number>(indexes));
    })
    context.path.select(__p, __s);
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
    editor.toggleShapesVisible(shapes);
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
    editor.toggleShapesLock(shapes);
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
        context.navi.notify(Navi.COMP_LIST_CHANGED);
    }
}

export function lower_layer(context: Context, layer?: number) {
    const selection = context.selection;
    const page = selection.selectedPage!;

    const editor = context.editor4Page(page);

    const result = editor.lowerLayer(sort_by_layer(context, selection.selectedShapes, -1), layer);

    if (!result) {
        message('info', context.workspace.t('homerightmenu.unable_lower'));
    }

    return result;
}

export function upper_layer(context: Context, layer?: number) {
    const selection = context.selection;
    const page = selection.selectedPage!;

    const editor = context.editor4Page(page);

    const result = editor.upperLayer(sort_by_layer(context, selection.selectedShapes), layer);

    if (!result) {
        message('info', context.workspace.t('homerightmenu.unable_upper'));
    }

    return result;
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
    if (!context.net) return false;
    try {
        const __buff = new Uint8Array(buff);
        let count = 0;
        while (count < 3 && !(await context.net.upload(ref, __buff.buffer))) {
            count++;
        }
        if (count >= 3) {
            throw new Error('fail');
        }
        return true;
    } catch (error) {
        message('danger', '上传失败');
        console.log('upload_image:', error);
        return false;
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

export function hidden_selection(context: Context) {
    if (context.workspace.is_path_edit_mode) {
        return;
    }

    context.selection.notify(Selection.SELECTION_HIDDEN);
}

export function copyAsPNG(context: Context) {
    // 注意：base64 url需要把类型前缀去除
    const url = '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';
    // todo getPNGUrl @Kc_tjs
    // const url = getPNGUrl();

    if (context.workspace.clipboard.write_png(url)) {
        message('info', '复制成功');
    } else {
        message('info', '复制失败');
    }
}

/**
 * @description 以字符串的格式传入运算表达式，返回运算结果,用于替代高危函数eval,eval可以用于任意的代码注入到程序内，并拥有开发者的权限
 * @param str
 */
export function computeString(str: string) {
    try {
        return Function('"use strict";return (' + str + ")")();
    } catch (e) {
        return NaN;
    }
}

/**
 *
 * @description 放大
 * @param context
 * @returns
 */
export const magnify = (context: Context) => {
    const scale_sizes = [0.02, 0.04, 0.08, 0.14, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
    const cur_scale = context.workspace.matrix.toArray()[0];
    const closestIndex = scale_sizes.findIndex((size) => size > cur_scale || size === 256);
    if (closestIndex === -1) return cur_scale;
    const scale = scale_sizes[closestIndex];
    page_scale(context, scale)
}

/**
 *
 * @description 缩小
 * @param context
 * @returns
 */
export const lessen = (context: Context) => {
    const scale_sizes = [0.02, 0.04, 0.08, 0.14, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
    const cur_scale = context.workspace.matrix.toArray()[0];
    const closestIndex = scale_sizes.reverse().findIndex((size) => size < cur_scale || size === 0.02);
    if (closestIndex === -1) return cur_scale;
    const scale = scale_sizes[closestIndex];
    page_scale(context, scale)
}

// 图形到页面的坐标
export const getTransformCol = (context: Context, shape: ShapeView, x: number, y: number) => {
    const matrix = new Matrix(context.workspace.matrix);
    const shape_root_m = shape.matrix2Root();
    let m = makeShapeTransform2By1(shape_root_m).clone();
    const clientTransform = makeShapeTransform2By1(matrix);
    m.addTransform(clientTransform); //root到视图
    const { col0 } = m.transform([ColVector3D.FromXY(x, y)]);
    return { x: col0.x, y: col0.y };
}


export function outlineSelection(context: Context) {
    const page = context.selection.selectedPage!;
    const shapes = context.selection.selectedShapes;
    const editor = context.editor4Page(page);
    editor.outlineShapes(shapes);
}