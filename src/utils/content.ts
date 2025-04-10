/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { ClientXY, PageXY, Selection, XY } from "@/context/selection";
import {
    adapt2Shape, ArtboardView,
    BoolShapeView,
    Color,
    ColVector3D,
    getFormatFromBase64,
    GroupShape,
    GroupShapeView,
    Matrix,
    PathShapeView,
    PathType,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView,
    SymbolRefShape,
    SymbolRefView,
    SymbolShape, SymbolView,
    TableView,
} from "@kcdesign/data";
import { WorkSpace } from '@/context/workspace';
import { is_mac, XYsBounding } from '@/utils/common';
import { searchCommentShape as finder } from '@/utils/comment'
import { adjust_content_xy } from "./clipboard";
import { fit_no_transform, is_parent_locked, is_parent_unvisible } from "./shapelist";
import { is_circular_ref2, is_part_of_symbol, make_symbol, one_of_is_symbolref } from "@/utils/symbol";
import { message } from "./message";
import { TableSelection } from "@/context/tableselection";
import { svgParser as parse_svg } from "@kcdesign/data";
import { compare_layer_3, sort_by_layer } from "@/utils/group_ungroup";
import { Navi } from "@/context/navigate";
import { v4 } from "uuid";
import { ImageLoader } from "@/imageLoader";
import { UploadAssets } from "@kcdesign/data";
import { isTarget } from "@/utils/scout";

export interface Media {
    name: string
    frame: { width: number, height: number }
    buff: Uint8Array
    base64: string
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
    const s2pMatrix = shape.matrix2Root();
    const { width, height } = shape.frame;
    let point = [[0, 0], [width, 0], [width, height], [0, height]]
    point = point.map(p => {
        const _s = s2pMatrix.computeCoord(p[0], p[1]);
        const _p = pMatrix.computeCoord(_s.x, _s.y);
        return [_p.x, _p.y];
    })
    const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
    const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
    const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
    const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);

    if ((l + rx) > right - 20 || r < 20) {
        return false;
    } else return !(b < 20 || (t + ry) > bottom - 20);
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
}

export function drop(e: DragEvent, context: Context) {
    if (!permIsEdit(context) || context.tool.isLable) return;
    e.preventDefault();
    const data = e?.dataTransfer?.files as any;
    if (!data?.length || data[0]?.type.indexOf('image') < 0) return;
    const loader = new ImageLoader(context);
    loader.insertImageByPackages(data, true);
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
                const shape = editor.insert(adapt2Shape(page) as GroupShape, page.childs.length, parseResult.shape);
                if (parseResult.mediaResourceMgr && shape) {
                    const upload: UploadAssets[] = [];
                    parseResult.mediaResourceMgr.forEach((v, k) => {
                        upload.push({ ref: k, buff: v.buff });
                    })
                    const loader = new ImageLoader(context);
                    loader.upload([{ shape, upload }]);
                }
            }
        }
    }
    reader.readAsText(file);
}

/**
 * 使page全部内容都在可视区，并居中
 */
export function fitView(context: Context, initPage = false, is_select = false) {
    const selectedShapes = context.selection.selectedShapes || [];
    const children = is_select ? selectedShapes : context.selection.selectedPage?.childs || [];
    if (!children.length) return new Matrix();
    const matrix = context.workspace.matrix;
    const points: ClientXY[] = [];
    for (const child of children) {
        const f = child.frame;
        const m = child.matrix2Root();
        m.multiAtLeft(matrix);
        points.push(...[
            [f.x, f.y],
            [f.x + f.width, f.y],
            [f.x + f.width, f.y + f.height],
            [f.x, f.y + f.height]
        ].map(p => m.computeCoord(p[0], p[1])));
    }
    const box = XYsBounding(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    let root = context.workspace.root;
    // if (context.user.isRuleVisible) {
    //     root = { ...root };
    //     root.center = { ...root.center };
    //     root.center.x += 10;
    //     root.center.y += 10;
    //     root.width -= 20;
    //     root.height -= 20;
    // }
    const w_max = root.width;
    const h_max = root.height;
    const ratio_w = width / w_max * 1.06;
    const ratio_h = height / h_max * 1.12;
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        const center = { x: box.left + width / 2, y: box.top + height / 2 };
        const delta = { x: root.center.x - center.x, y: root.center.y - center.y };
        matrix.trans(delta.x, delta.y);
        matrix.trans(-w_max / 2, -h_max / 2);
        const max = initPage ? 1 : 256;
        if (matrix.m00 / ratio > 0.02 && matrix.m00 / ratio < max) {
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            } else if (matrix.m00 / ratio >= max) {
                matrix.scale(max / matrix.m00);
            }
        }
        matrix.trans(w_max / 2, h_max / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        const center = { x: box.left + width / 2, y: box.top + height / 2 };
        const delta = { x: root.center.x - center.x, y: root.center.y - center.y };

        if (delta.x || delta.y) {
            matrix.trans(delta.x, delta.y);
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
    return shapes.reduce((result: ShapeView[], item: ShapeView) => {
        if (Array.isArray((item as GroupShapeView).childs)) {
            // 如果当前项有子级数组，则递归调用flattenArray函数处理子级数组
            result = result.concat(flattenShapes((item as GroupShapeView).childs));
        }
        return result.concat(item);
    }, []);
}

export function noGroupShapesFrom(shapes: ShapeView[]) {
    const result: ShapeView[] = [];
    for (const shape of shapes) {
        if (shape.type === ShapeType.Group) {
            result.push(...noGroupShapesFrom(shape.childs));
            continue;
        }
        result.push(shape);
    }
    return result;
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
    const is_editing = context.workspace.isEditing;
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
    if ((e.target as Element).closest('#text-selection') && is_editing) {
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
        const m = item.matrix2Root(); // 图层到Root；
        const clientTransform = (matrix);
        m.multi(clientTransform); // root 到 client
        points.push(...m.transform([
            ColVector3D.FromXY(x, y),
            ColVector3D.FromXY(x + width, y),
            ColVector3D.FromXY(x + width, y + height),
            ColVector3D.FromXY(x, y + height),
        ]));
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
    const selection = context.selection;
    const shapes: ShapeView[] = selection.selectedPage?.childs || [];
    const page = selection.selectedPage!;

    const scout = context.selection.scout;
    const container = (() => {
        for (const shape of shapes) {
            if (shape.isVirtualShape || !shape.isVisible || !(shape instanceof ArtboardView || shape instanceof SymbolView)) continue;
            if ((shape instanceof SymbolView && (is_circular_ref2((symbol instanceof ShapeView) ? adapt2Shape(symbol) : symbol, shape.id) || shape.isSymbolUnionShape))) continue;
            if (isTarget(scout, shape, position)) return shape;
        }
        return page;
    })();
    const m = (container.matrix2Root().inverse);
    position = m.computeCoord3(position);
    const editor = context.editor4Page(page);
    const frame = new ShapeFrame(0, 0, state.frame.width, state.frame.height);
    frame.x = position.x - state.frame.width / 2;
    frame.y = position.y - state.frame.height / 2;
    const childs = container.childs;
    let id = symbol.id;
    let name = symbol.name;
    let count = 1;
    for (let i = 0, len = childs.length; i < len; i++) {
        const item = childs[i];
        if ((item as SymbolRefView)?.refId === id) count++;
    }
    let ref: Shape | false = editor.refSymbol(context.data, `${name} ${count}`, frame, id);
    editor.insert(adapt2Shape(container) as GroupShape, childs.length, ref, true);
}

const MAX = 25600;
const MIN = 2;

export function root_scale(context: Context, e: WheelEvent) {
    let scale_delta = 1.2;

    if (Math.abs(e.deltaY) < 16 && Math.abs(e.deltaX) < 16) {
        scale_delta = 1.016;
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

export function pre_modify_anchor(shape: ShapeView) {
    let rotate = shape.rotation || 0;
    rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
    return rotate;
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
    const page = selection.selectedPage!;
    const selected = selection.selectedShapes;
    if (!selected.length) {
        selection.rangeSelectShape(page.childs.filter((s: ShapeView) => !s.isLocked));
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

        if (page && !reverse) selection.rangeSelectShape(page.childs.filter((s: ShapeView) => !s.isLocked));
    } else {
        if (reverse) {
            const s_id = selected.map(s => s.id)
            const r_shape = Array.from(p_map.values())[0].childs.filter((item: any) => !s_id.includes(item.id) && !item.isLocked);
            selection.rangeSelectShape(r_shape);
        } else {
            selection.rangeSelectShape(Array.from(p_map.values())[0].childs.filter((s: ShapeView) => !s.isLocked));
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
    const page = context.selection.selectedPage!;
    shapes = shapes.filter(s => !is_parent_unvisible(s));
    const editor = context.editor4Page(page);
    editor.toggleShapesVisible(shapes);
    if (shapes.every(s => !s.isVisible)) hidden_selection(context);
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

export async function upload_image(context: Context, ref: string, buff: Uint8Array) {
    if (!context.net) return true;
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
    if (context.workspace.is_path_edit_mode) return;
    context.selection.notify(Selection.SELECTION_HIDDEN);
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
    let m = (shape_root_m).clone();
    const clientTransform = (matrix);
    m.addTransform(clientTransform); //root到视图
    const { [0]: col0 } = m.transform([ColVector3D.FromXY(x, y)]);
    return { x: col0.x, y: col0.y };
}

export function outlineSelection(context: Context) {
    const page = context.selection.selectedPage!;
    const shapes = context.selection.selectedShapes;
    const editor = context.editor4Page(page);
    editor.outlineShapes(shapes, context.workspace.t('attr.outlineNameSuffix'));
}

export function flattenSelection(context: Context) {
    const page = context.selection.selectedPage!;
    const editor = context.editor4Page(page);
    const selection = context.selection;
    const shapes = compare_layer_3(selection.selectedShapes);
    if (shapes.length) {
        if (shapes.length === 1 && (shapes[0] instanceof BoolShapeView || shapes[0].type === ShapeType.Group)) {
            if (shapes[0].type === ShapeType.Group) {
                const pathshape = editor.flattenGroup((shapes[0]), shapes[0].name);
                if (pathshape) {
                    context.nextTick(page, () => {
                        const s = page.getShape(pathshape.id);
                        context.selection.selectShape(s);
                    });
                }
            } else {
                const flatten = editor.flattenBoolShape((shapes[0]) as BoolShapeView)
                if (flatten) {
                    context.nextTick(page, () => {
                        const s = page.getShape(flatten.id);
                        context.selection.selectShape(s)
                    })
                }
            }
        } else {
            const shapessorted = compare_layer_3(shapes);
            const flatten = editor.flattenShapes(shapessorted)
            if (flatten) {
                context.nextTick(page, () => {
                    const s = page.getShape(flatten.id);
                    context.selection.selectShape(s)
                })
            }
        }
    }
}

export const getShapeFrame = (shape: ShapeView) => {
    if (shape.type !== ShapeType.Group) {
        const { x, y, height, width } = shape.frame;
        return new ShapeFrame(x, y, width, height);
    }
    const childframes = (shape as GroupShapeView).childs.map((c) => c.boundingBox());
    const reducer = (p: { minx: number, miny: number, maxx: number, maxy: number }, c: ShapeFrame, i: number) => {
        if (i === 0) {
            p.minx = c.x;
            p.maxx = c.x + c.width;
            p.miny = c.y;
            p.maxy = c.y + c.height;
        } else {
            p.minx = Math.min(p.minx, c.x);
            p.maxx = Math.max(p.maxx, c.x + c.width);
            p.miny = Math.min(p.miny, c.y);
            p.maxy = Math.max(p.maxy, c.y + c.height);
        }
        return p;
    }
    const bounds = childframes.reduce(reducer, { minx: 0, miny: 0, maxx: 0, maxy: 0 });
    const { minx, miny, maxx, maxy } = bounds;
    return new ShapeFrame(minx, miny, maxx - minx, maxy - miny);
}
