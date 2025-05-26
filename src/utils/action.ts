/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

let dbl_timer: any = null;
/**
 * @description 判断一定间隔内(interval)是否二次操作。可用于双击判定
 * @param interval 时间，单位为ms
 * @returns boolean
 */
export function is_dbl_action(interval?: number): boolean {
    if (dbl_timer) {
        clearTimeout(dbl_timer);
        dbl_timer = setTimeout(call, interval || 250);
        return true;
    } else {
        dbl_timer = setTimeout(call, interval || 250);
        return false;
    }

    function call() {
        clearTimeout(dbl_timer);
        dbl_timer = null;
    }
}