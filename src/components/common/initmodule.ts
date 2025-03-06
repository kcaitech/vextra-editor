/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { measure } from "@/layout/text/measure";
import { initModule } from "@kcdesign/data";
import { text2path } from "@kcdesign/text2path";

let __inited: boolean = false;

export async function initDataModule() {
    if (__inited) return;

    initModule(measure, text2path)

    __inited = true;
}
