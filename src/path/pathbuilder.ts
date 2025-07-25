/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { PathShapeView } from "@kcaitech/vextra-core";

/**
 * @description todo 路径编辑的控件绘制
 */
export class PathStructBuilder {
    command: (string | number)[] = [];
    view: PathShapeView;

    constructor(view: PathShapeView) {
        this.view = view;
    }

    build() {
        const command: (string | number)[] = [];
    }
}