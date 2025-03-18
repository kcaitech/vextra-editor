/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Color } from "@kcdesign/data";

const t1 = new Color(1, 255, 255, 255);
const t2 = new Color(1, 245, 245, 245);
const t3 = new Color(1, 217, 217, 217);
const t4 = new Color(1, 191, 191, 191);
const t5 = new Color(1, 140, 140, 140);
const t6 = new Color(1, 89, 89, 89);
const t7 = new Color(1, 38, 38, 38);
const t8 = new Color(1, 0, 0, 0);
const t9 = new Color(1, 255, 235, 59);
const t10 = new Color(1, 255, 195, 0);
const t11 = new Color(1, 255, 141, 26);
const t12 = new Color(1, 255, 87, 51);
const t13 = new Color(1, 212, 48, 48);
const t14 = new Color(1, 227, 60, 100);
const t15 = new Color(1, 172, 51, 193);
const t16 = new Color(1, 121, 72, 234);
const t17 = new Color(1, 42, 130, 228);
const t18 = new Color(1, 0, 186, 173);
const t19 = new Color(1, 67, 207, 124);
const t20 = new Color(1, 165, 214, 63);

export const typical = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20];

export const LABEL_RGB = ['R', 'G', 'B', 'A'];
export const LABEL_HSL = ['H', 'S', 'L', 'A'];
export const LABEL_HSB = ['H', 'S', 'B', 'A'];
export const LABEL_HEX = ['Hex', 'A']

export const model2label = new Map([
    ['RGB', LABEL_RGB],
    ['HSL', LABEL_HSL],
    ['HSB', LABEL_HSB],
    ['Hex', LABEL_HEX],
]);