/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { IWatchable, Matrix } from "@kcdesign/data";

export namespace WorkspaceEvents {
    export const transform_change = 'transform_change'
    export const add_local_font = 'add_local_font'
}

export interface IWorkspace extends IWatchable {
    /**
     * 文档内容映射到element坐标系的转换矩阵
     */
    // get matrix(): Matrix;
    /**
     * 文档内容所在dom元素
     */
    get element(): HTMLElement | undefined;

    get curScale(): number;

    get matrix(): Matrix;

    translate(x: number, y: number): void;
    scale(ratio: number): void;
    doc2view(point: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    doc2view(x: number, y: number): {
        x: number;
        y: number;
    };
    view2doc(point: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    view2doc(x: number, y: number): {
        x: number;
        y: number;
    };
    setUserLocalFontList(list: string[]): void;
}