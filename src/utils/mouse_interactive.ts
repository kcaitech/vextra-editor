/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {Context} from "@/context";

/**
 * @description 给document对象挂载鼠标移动、抬起的监听
 */
export function add_move_and_up_for_document(move: (e: MouseEvent) => any, up: (e: MouseEvent) => any) {
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}

/**
 * @description 移除document对象上挂载的鼠标移动、抬起的监听
 */
export function remove_move_and_up_from_document(move: (e: MouseEvent) => any, up: (e: MouseEvent) => any) {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}

/**
 * @description 给window对象挂载失焦监听
 */
export function add_blur_for_window(blur: () => any) {
    window.addEventListener('blur', blur);
}

/**
 * @description 移除window对象上的失焦监听
 */
export function remove_blur_from_window(blur: () => any) {
    window.removeEventListener('blur', blur);
}

/**
 * @description 更新鼠标在client坐标系上的位置
 */
export function modify_down_position_client(context: Context, e: MouseEvent, position: { x: number, y: number }) {
    const root = context.workspace.root;
    position.x = e.clientX - root.x;
    position.y = e.clientY - root.y;
}

/**
 * @description 获取鼠标在client坐标系上的当前位置
 */
export function get_current_position_client(context: Context, e: MouseEvent) {
    const root = context.workspace.root;
    return {x: e.clientX - root.x, y: e.clientY - root.y};
}

/**
 * @description 检查同一坐标系上的两个点之间的直线距离是否超过阈值dis。通常用于检查拖动动作判定
 * @param dis 默认4个单位
 */
export function check_drag_action(start: { x: number, y: number }, current: { x: number, y: number }, dis = 4) {
    return Math.hypot(current.x - start.x, current.y - start.y) > dis;
}

let current_state = 1;
let reset_state_timer: any = null;

function reset_state() {
    current_state = 1;
    clearTimeout(reset_state_timer);
    reset_state_timer = null;
}

function reset_timer() {
    clearTimeout(reset_state_timer);
    reset_state_timer = null;
}

/**
 * @description DANGER function
 */
export function dbl_action() {
    reset_state_timer && reset_timer();
    reset_state_timer = setTimeout(() => {
        reset_state();
    }, 300)
    return (current_state++) === 2;
}

/**
 * @description DANGER function
 */
export function thr_action() {
    reset_state_timer && reset_timer();
    reset_state_timer = setTimeout(() => {
        reset_state();
    }, 300)
    return (current_state++) === 3;
}