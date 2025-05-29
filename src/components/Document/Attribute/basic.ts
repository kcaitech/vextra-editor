/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Reg_HEX } from "@/utils/RegExp";

export type MaskInfo = {
    name: string;
    desc: string;
    disabled?: boolean;
}
export function selectAllOnFocus(event: FocusEvent) {
    event.target instanceof HTMLInputElement && event.target.value && event.target.select();
}

export function getRGBFromInputEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace('#', '');
    const hexColorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexColorRegex.test(value)) return null;
    if (value.length === 3) value = value.split('').map(i => '' + i + i).join('');
    const res = value.match(Reg_HEX);
    if (!res) return res;

    return [
        Number.parseInt(res[1], 16),
        Number.parseInt(res[2], 16),
        Number.parseInt(res[3], 16)
    ]
}

export function getNumberFromInputEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    const regex = /\d+(\.\d+)?/g;
    return Number((target.value.match(regex) || [])[0]);
}