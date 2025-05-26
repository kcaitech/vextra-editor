/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Matrix, ShapeView } from "@kcdesign/data";
import { XYsBounding } from "@/utils/common";
import { WorkSpace } from "@/context/workspace";

export enum LocateType {
    Center = 'center',
    Fit = 'fit'
}

export interface LocateRoot {
    x: number;
    y: number;
    right: number;
    bottom: number;
}

export function locateShape(context: Context, shape: ShapeView, locateRoot?: LocateRoot, clientMatrix?: Matrix) {
    const root = locateRoot ?? context.workspace.root;
    const centerClient = {
        x: (root.right - root.x) / 2,
        y: (root.bottom - root.y) / 2
    };

    const { x, y, width, height } = shape.frame;
    const client = clientMatrix ?? context.workspace.matrix;
    const m = shape.matrix2Root().multiAtLeft(client);
    const box = XYsBounding([
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ].map(i => m.computeCoord3(i)));

    const centerShape = {
        x: (box.right + box.left) / 2,
        y: (box.bottom + box.top) / 2
    }

    const dx = centerClient.x - centerShape.x;
    const dy = centerClient.y - centerShape.y;

    client.trans(dx, dy);
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}