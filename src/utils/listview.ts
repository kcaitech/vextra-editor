/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Shape, ShapeDirList2 as ShapeDirList, ShapeType, ShapeView, adapt2Shape } from "@kcaitech/vextra-core";
import { fit } from "@/utils/shapelist";
import { isInner } from "./content";
import { WorkSpace } from "@/context/workspace";
import { compare_layer_3 } from "./group_ungroup";

type OffsetType = 'middle' | 'top' | 'bottom';

/**
 * @description 拖动列表元素时，判断鼠标与列表的相对位置OffsetType
 * todo 考虑水平列表
 */
export function check_orientation_during_movement(element: Element, e: MouseEvent): { speed: 'slow' | 'fast', offset: OffsetType } {
    const box = element.getBoundingClientRect(); // 可以由外部传入，避免拖动时不断计算这个固定不变的box
    const top = box.y, bottom = box.bottom;
    let speed: 'slow' | 'fast' = 'fast'
    if (e.clientY < top) {
        if (e.clientY > top - 40) speed = "slow";
        return { speed, offset: 'top' };
    } else if (e.clientY >= top && e.clientY < bottom) {
        return { speed, offset: 'middle' };
    } else {
        if (e.clientY < bottom + 40) speed = "slow";
        return { speed, offset: 'bottom' };
    }
}

type Ver = 'upper' | 'inner' | 'lower';

interface ItemDragEvent {
    position: Ver
    layer: number
    zero: number
    is_group: boolean
    off: boolean;
}

export interface DragDetail {
    descend: string,
    layer: number,
    type: 'aside' | 'insert',
    position: 'upper' | 'inner' | 'lower'
}

export function get_part_of_target1(element: Element, e: MouseEvent) {
    let v: Ver = 'upper'; // 先计算上下
    const box = element.getBoundingClientRect();
    const trigger = element.querySelector('.is-group');
    const drag_event: ItemDragEvent = { position: "upper", layer: 0, zero: 0, is_group: !!trigger, off: true };
    if (trigger) { // 三层结构
        const y = box.y;
        const l = box.height / 3;
        if (e.clientY >= y && e.clientY <= y + l) {
            v = 'upper';
        } else if (e.clientY > (y + l) && e.clientY <= (y + (2 * l))) {
            v = 'inner';
        } else if (e.clientY > (y + (2 * l))) {
            v = 'lower';
        }
    } else { // 两层结构
        const y = box.y;
        const l = box.height / 2;
        if (e.clientY >= y + l) {
            v = 'lower';
        }
    }
    drag_event.position = v;
    // 计算左右
    const right_element = element.querySelector('.container-svg');

    if (!right_element) {
        const symbol = element.querySelector('.zero-symbol');
        if (symbol) {
            const box_symbol = symbol.getBoundingClientRect();
            drag_event.zero = box_symbol.x;
        }
        return drag_event;
    }

    let h = 0;
    const box2 = right_element.getBoundingClientRect();
    const zero_divide = box2.x;
    drag_event.zero = zero_divide - 4;
    if (trigger) {
        if (v === "upper") {
            h = __get_h(zero_divide - 21, e.clientX);
        } else if (v === "inner") {
            h = 1;
        } else {
            const off = !!trigger.querySelector('#right');
            drag_event.off = off;
            if (off) {
                h = __get_h(zero_divide - 21, e.clientX);
            } else {
                h = 1;
                drag_event.position = 'inner';
            }
        }
    } else {
        h = __get_h(zero_divide - 21, e.clientX);
    }
    const max = -Math.floor((zero_divide - 20) / 18);
    drag_event.layer = Math.max(h, max);
    return drag_event;
}

function __get_h(zero: number, v: number) {
    const distance = zero - v;
    if (distance < 0) {
        return 0;
    } else {
        return -Math.ceil(distance / 18);
    }
}

export function get_destination_by_drag_event(event: ItemDragEvent, start_y: number, unit_height: number) {
    const { zero, position, layer } = event;
    const result: { x: number, y: number, type: 'aside' | 'insert' } = { x: zero, y: start_y, type: 'aside' };
    if (position === 'inner') {
        result.type = 'insert';
        return result;
    }
    if (position === 'lower') {
        result.y += unit_height;
        if (event.is_group && !event.off) result.type = 'insert';
    }
    if (layer === 1) {
        result.x += 18;
    } else if (layer < 0) {
        result.x -= (-18 * layer);
    }
    return result;
}

export function get_drag_detail(descend: string, position: ItemDragEvent, destin: {
    x: number,
    y: number,
    type: 'aside' | 'insert'
}): DragDetail {
    return {
        type: destin.type,
        layer: position.layer,
        position: position.position,
        descend
    }
}

export function adjust_layer(shape: ShapeView, layer: number) {
    let s: ShapeView | undefined = shape;
    while (layer < 0 && s?.parent && s?.parent.type !== ShapeType.Page) {
        layer++;
        s = s.parent;
    }
    return s;
}

export function hover(context: Context, shape: ShapeView) {
    if (context.workspace.transforming) {
        return;
    }
    context.selection.hoverShape(shape);
}

export function modify_shape_lock_status(context: Context, shape: ShapeView) {
    const editor = context.editor4Shape(shape);
    editor.toggleLock();
}

export function modify_shape_visible_status(context: Context, shape: ShapeView) {
    const editor = context.editor4Shape(shape);
    editor.toggleVisible();
}

export function modify_after_drag(context: Context, detail: DragDetail) {
    context.navi.set_dragging_status(false);

    let descend = context.selection.getShapeById(detail.descend);
    if (!descend) {
        return;
    }

    descend = adjust_layer(descend, detail.layer);

    if (detail.layer < 0) {
        detail.position = "lower";
    }

    const page = context.selection.selectedPage!;
    const editor = context.editor4Page(page);
    const shapes = compare_layer_3(context.selection.selectedShapes, -1);

    editor.afterShapeListDrag(shapes.map((s) => adapt2Shape(s)), adapt2Shape(descend), detail.position);

    const map = new Map<string, ShapeView>();
    for (let i = 0, l = shapes.length; i < l; i++) {
        const item = shapes[i];
        map.set(item.id, item);
    }

    let need_adjust = false;

    for (let i = 0, l = shapes.length; i < l; i++) {
        const item = shapes[i];
        let p = item.parent;
        while (p) {
            if (map.get(p.id)) {
                map.delete(item.id);
                need_adjust = true;
                break;
            }
            p = p.parent;
        }
    }

    if (need_adjust) {
        context.selection.rangeSelectShape(Array.from(map.values()));
    }
}

function getSelectShapesIndex(shapeDirList: ShapeDirList, shapes: ShapeView[]): number[] {
    return shapes.map(s => shapeDirList.indexOf(s.id));
}

function getShapeRange(listviewSource: IDataSource<ItemData>, start: number, end: number): ShapeView[] {
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const range: Map<string, ShapeView> = new Map();
    const it = listviewSource.iterAt(from);
    for (let i = from; i <= to && it.hasNext(); i++) {
        const shape: ShapeView = it.next().view();
        const childs = shape.childs;
        if (childs && childs.length) {
            for (let c_i = 0; c_i < childs.length; c_i++) {
                range.delete(childs[c_i].id);
            }
        }
        let need_set = true;
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (range.get(p.id)) {
                need_set = false;
                break;
            }
            p = p.parent;
        }
        if (need_set) {
            range.set(shape.id, shape);
        }
    }
    return Array.from(range.values());
}

export interface IDataIter<T extends { id: string }> {
    hasNext(): boolean;
    next(): T;
}

export interface IDataSource<T extends { id: string }> {
    length(): number;
    iterAt(index: number): IDataIter<T>;
}

export interface ItemData {
    id: string
    shape: () => Shape // 作用function，防止vue对shape内部数据进行proxy
    view: () => ShapeView
}

export function range_select_shape(context: Context, shapeDirList: ShapeDirList, listviewSource: IDataSource<ItemData>, shape: ShapeView) {
    const to = shapeDirList.indexOf(shape.id);
    const selectedShapes = context.selection.selectedShapes;
    if (selectedShapes.length) {
        const selectShapesIndex = getSelectShapesIndex(shapeDirList, selectedShapes);
        const from = selectShapesIndex.reduce((pre, cur) => {
            return Math.abs(to - cur) > Math.abs(to - pre) ? cur : pre;
        }, selectShapesIndex[0]);
        const shapes = getShapeRange(listviewSource, from, to);
        context.selection.rangeSelectShape(shapes);
    } else {
        context.selection.selectShape(shape);
    }
}

export function multi_select_shape(context: Context, shape: ShapeView) {
    const selected_map: Map<string, ShapeView> = new Map();
    const selected = context.selection.selectedShapes;
    for (let i = 0; i < selected.length; i++) selected_map.set(selected[i].id, selected[i]);

    if (selected_map.has(shape.id)) {
        selected_map.delete(shape.id);
        context.selection.unSelectShape(shape);
        return;
    }

    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) { // 元素有父级被选中就不需要在选中了
        if (selected_map.get(p.id)) return;
        p = p.parent;
    }

    selected.push(shape);
    selected_map.set(shape.id, shape);

    for (let i = 0; i < selected.length; i++) {
        const s = selected[i];
        let need_remove = false;
        let p = s.parent;
        while (p && p.type !== ShapeType.Page) {
            if (selected_map.get(p.id)) {
                need_remove = true;
                break;
            }
            p = p.parent;
        }
        if (need_remove) selected_map.delete(s.id);
    }

    context.selection.rangeSelectShape(Array.from(selected_map.values()));
}

export function is_component_class(shape: ShapeView) {
    let s: any = shape;
    while (s) {
        if (s.type === ShapeType.Page) return false;
        if (s.isVirtualShape ||
            s.type === ShapeType.SymbolRef ||
            s.type === ShapeType.Symbol ||
            s.type === ShapeType.SymbolUnion
        ) return true;
        s = s.parent;
    }
    return false;
}