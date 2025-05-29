/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export const Reg_HEX = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

export function toRGBA(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgba(" + options.red + "," + options.green + "," + options.blue + "," + options.alpha + ")";
}

export function toRGB(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgb(" + options.red + "," + options.green + "," + options.blue + ")";
}

export function toHex(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    const toHex = (n: number) => {
        n = Math.round(n);
        return n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    }
    return "#" + toHex(options.red) + toHex(options.green) + toHex(options.blue);
}

export function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }