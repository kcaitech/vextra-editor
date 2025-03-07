/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcdesign/data";

export class Arrange extends WatchableObject {
    static FLEX_START = 1;
    static SPACE_AROUND_HOR = 2;
    static ITEMS_ALIGN = 3;
    static FLEX_END = 4;
    static FLEX_START_COL = 5;
    static SPACE_AROUND_VER = 6;
    static ITEMS_ALIGN_VER = 7;
    static FLEX_END_COL = 8;
}