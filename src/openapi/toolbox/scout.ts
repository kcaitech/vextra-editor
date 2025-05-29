/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    Matrix,
    ShapeView,
} from "@kcdesign/data";

interface XY {
    x: number,
    y: number
}
export interface IScout {
    path: SVGPathElement
    remove: () => void
    isPointInShape: (shape: ShapeView, point: {x: number, y: number}) => boolean
    isPointInPath: (d: string, point: {x: number, y: number}) => boolean
    isPointInStroke: (d: string, point: { x: number, y: number }, stroke?: number) => boolean
    isPointInShape2: (shape: ShapeView, point: {x: number, y: number}) => boolean
    isPointInStrokeByWidth: (d: string, point: {x: number, y: number}, width: number) => boolean
    isPointInShapeForPreview(shape: ShapeView, point: XY, d: string, matrix: Matrix): boolean
}

