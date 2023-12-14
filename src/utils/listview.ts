import {Shape, ShapeType} from "@kcdesign/data";

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
        return {speed, offset: 'top'};
    } else if (e.clientY >= top && e.clientY < bottom) {
        return {speed, offset: 'middle'};
    } else {
        if (e.clientY < bottom + 40) speed = "slow";
        return {speed, offset: 'bottom'};
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
    const drag_event: ItemDragEvent = {position: "upper", layer: 0, zero: 0, is_group: !!trigger, off: true};
    if (trigger) { // 三层结构
        const y = box.y;
        const l = box.height / 3;
        if (e.clientY >= y && e.clientY <= y + 10) {
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
    drag_event.zero = zero_divide + 6;
    if (trigger) {
        if (v === "upper") {
            h = __get_h(zero_divide - 10, e.clientX);
        } else if (v === "inner") {
            h = 1;
        } else {
            const off = !!trigger.querySelector('.triangle-right');
            drag_event.off = off;
            if (off) {
                h = __get_h(zero_divide - 10, e.clientX);
            } else {
                h = 1;
            }
        }
    } else {
        h = __get_h(zero_divide - 10, e.clientX);
    }
    const max = -Math.floor((zero_divide - 16) / 12);
    drag_event.layer = Math.max(h, max);
    return drag_event;
}

function __get_h(zero: number, v: number) {
    const distance = zero - v;
    if (distance < 0) {
        return 0;
    } else {
        return -Math.ceil(distance / 12);
    }
}

export function get_destination_by_drag_event(event: ItemDragEvent, start_y: number, unit_height: number) {
    const {zero, position, layer} = event;
    const result: { x: number, y: number, type: 'aside' | 'insert' } = {x: zero, y: start_y, type: 'aside'};
    if (position === 'inner') {
        result.type = 'insert';
        return result;
    }
    if (position === 'lower') {
        result.y += unit_height;
        if (event.is_group && !event.off) result.type = 'insert';
    }
    if (layer === 1) {
        result.x += 12;
    } else if (layer < 0) {
        result.x -= (-12 * layer);
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

export function adjust_layer(shape: Shape, layer: number) {
    let s: Shape | undefined = shape;
    while (layer < 0 && s?.parent && s?.parent.type !== ShapeType.Page) {
        layer++;
        s = s.parent;
    }
    return s;
}