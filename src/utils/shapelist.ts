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
import { Navi } from "@/context/navigate";
import { Shape, ShapeType, ShapeView, SymbolShape, SymbolUnionShape, SymbolView, VariableType } from "@kcdesign/data";
import { XYsBounding } from "./common";
import { WorkSpace } from "@/context/workspace";
import { is_part_of_symbol } from "./symbol";

export type Area = number | 'artboard' | 'group' | 'normal';

export function is_shape_in_selection(shapes: ShapeView[], shape: ShapeView): boolean {
    const map: Map<string, ShapeView> = new Map();
    for (let i = 0; i < shapes.length; i++) {
        if (shape.id === shapes[i].id) return true;
        map.set(shapes[i].id, shapes[i])
    }

    let p = shape.parent;

    while (p && p.type !== ShapeType.Page) {
        if (map.get(p.id)) {
            return true;
        }
        p = p.parent;
    }
    return false;
}

export function selection_types(shapes: ShapeView[]): number {
    let types = 0;
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Group || shapes[i].type === ShapeType.BoolShape) {
            types = types | 1;
        } else if (shapes[i].type === ShapeType.Artboard) {
            types = types | 2;
        }else if (shapes[i].type === ShapeType.SymbolRef) {
            types = types | 4;
        }
        if (is_part_of_symbol(shapes[i])) {
            types = types | 8;
        }
        if (types >= 15) return types;
    }
    return types;
    
}

export function is_parent_unvisible(shape: ShapeView): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (!p.isVisible) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}

export function is_parent_locked(shape: ShapeView): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (p.isLocked) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}

export function is_valid_data(context: Context, shape: ShapeView) {
    const page = context.selection.selectedPage;
    if (!page) return false;
    if (!page.shapes.get(shape.id)) {
        context.navi.notify(Navi.SEARCHING);
        return false;
    }
    return true;
}

export function fit(context: Context, shape: ShapeView) {
    const m = shape.matrix2Root(), f = shape.frame, matrix = context.workspace.matrix, root = context.workspace.root;
    m.multiAtLeft(matrix);
    const points: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, {
        x: 0,
        y: f.height
    }];
    const box = XYsBounding(points.map(p => m.computeCoord2(p.x, p.y)));
    const width = box.right - box.left, height = box.bottom - box.top;
    const w_max = root.width, h_max = root.height;
    const ratio_w = width / w_max * 1.06, ratio_h = height / h_max * 1.12;
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2);
        if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 7.2) {
            matrix.scale(1 / ratio);
        } else {
            if (matrix.m00 * 1 / ratio <= 0.02) {
                matrix.scale(0.02 / matrix.m00);
            }
            else if (matrix.m00 * 1 / ratio >= 7.2) {
                matrix.scale(7.2 / matrix.m00);
            }
        }
        matrix.trans(root.width / 2, root.height / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}

export function fit_no_transform(context: Context, shape: ShapeView) {
    const m = shape.matrix2Root(), f = shape.frame, matrix = context.workspace.matrix, root = context.workspace.root;
    m.multiAtLeft(matrix);
    const points: { x: number, y: number }[] = [{ x: 0, y: 0 }, { x: f.width, y: 0 }, { x: f.width, y: f.height }, {
        x: 0,
        y: f.height
    }];
    const box = XYsBounding(points.map(p => m.computeCoord2(p.x, p.y)));
    const width = box.right - box.left, height = box.bottom - box.top;
    const w_max = root.width, h_max = root.height;
    const ratio_w = width / w_max * 1.06, ratio_h = height / h_max * 1.12;
    const ratio = Math.max(ratio_h, ratio_w);
    if (ratio !== 1) {
        context.selection.selectShape(shape);
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        matrix.trans(del.x, del.y);
        matrix.trans(-root.width / 2, -root.height / 2);
        if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 7.2) matrix.scale(1 / ratio);
        else {
            if (matrix.m00 * 1 / ratio <= 0.02) matrix.scale(0.02 / matrix.m00);
            else if (matrix.m00 * 1 / ratio >= 7.2) matrix.scale(7.2 / matrix.m00);
        }
        matrix.trans(root.width / 2, root.height / 2);
        context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
    } else {
        context.selection.selectShape(shape);
        const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
        const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
        if (del.x || del.y) {
            matrix.trans(del.x, del.y);
            context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
}

export function get_state_name(state: SymbolView, dlt: string) {
    if ((state.parent?.type !== ShapeType.SymbolUnion)) {
        return state.name;
    }
    const variables = (state.parent as unknown as SymbolShape)?.variables;
    if (!variables) {
        return state.name;
    }
    let name_slice: string[] = [];
    variables.forEach((v, k) => {
        if (v.type !== VariableType.Status) {
            return;
        }

        let slice = state.symtags?.get(k) || v.value;

        if (slice === SymbolShape.Default_State) {
            slice = dlt;
        }

        slice && name_slice.push(slice);
    })
    return name_slice.toString();
}

export function get_name(shape: ShapeView | Shape, dlt: string) {
    if (shape.type !== ShapeType.Symbol) {
        return shape.name;
    } else {
        return get_state_name(shape as SymbolView, dlt);
    }
}