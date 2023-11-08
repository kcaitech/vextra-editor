type OffsetType = 'middle' | 'top' | 'bottom';

/**
 * @description 拖动列表元素时，判断鼠标与列表的相对位置OffsetType
 * todo 考虑水平列表
 */
export function check_orientation_during_movement(listview_element: Element, e: MouseEvent): OffsetType {
    const box = listview_element.getBoundingClientRect(); // 可以由外部传入，避免拖动时不断计算这个固定不变的box
    const top = box.y, bottom = box.bottom;
    if (e.clientY < top) return 'top';
    if (e.clientY > top && e.clientY < bottom) return 'middle';
    return 'bottom'
}

export function get_part_of_target1(element: Element, e: MouseEvent) {
    const right_element = element.querySelector('.text');
    if (!right_element) return;
    const box = element.getBoundingClientRect();
    const box2 = right_element.getBoundingClientRect();
    const v_divide = (box.y + box.bottom) / 2;
    const h_divide = box2.x;
    let v = 'upper';
    let h = 'right';
    if (e.clientY > v_divide) v = 'lower';
    if (e.clientX < h_divide) h = 'left';
    return h + ' ' + v;
}