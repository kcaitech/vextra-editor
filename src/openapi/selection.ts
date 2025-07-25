/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ImageRefShape } from "@/context/selection";
import { DocSelectionData } from "@/context/user";
import { IWatchable, PageView, Shape, ShapeView } from "@kcaitech/vextra-core";

export namespace SelectionEvents {
    export const text_change = 'text_change'
    export const page_change = 'page_change'
    export const shape_change = 'shape_change'
    export const shape_hover_change = 'shape_hover_change'
}

export interface ITextSelection {
    get cursorStart(): number
    get cursorEnd(): number
    get cursorAtBefore(): boolean
}

export interface ISelection extends IWatchable {
    get textSelection(): ITextSelection
    get selectedShapes(): ShapeView[]
    // get selectedPvShape(): Shape | undefined
    get selectedPage(): PageView | undefined
    get hoveredShape(): ShapeView | undefined

    selectPage(p: PageView | string): Promise<PageView | undefined>;
    selectShape(shape?: ShapeView): void;
    locateShape(shapes: ShapeView[]): void;
    userSelectionData(data: DocSelectionData[]): void;

    getViews(offsetX: number, offsetY: number): ShapeView[];

    getShapesUsingImage(imageRef: string): ImageRefShape[]
}