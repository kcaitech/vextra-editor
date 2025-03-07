/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { map_from_shapes, permIsEdit } from "./content";
import { Action } from "@/context/tool";
import { AsyncTransfer, GroupShape, Shape, ShapeType, ShapeView, adapt2Shape } from "@kcdesign/data";
import { PageXY } from "@/context/selection";
import { debounce } from "lodash";
import { WorkSpace } from "@/context/workspace";
import { compare_layer_3 } from "./group_ungroup";
import { get_symbolref_by_layer } from "./symbol";

export function keyboardHandle(e: KeyboardEvent, context: Context) {
    if (!permIsEdit(context) || context.tool.isLable) {
        return;
    }
    const { target, shiftKey } = e;
    if (target instanceof HTMLInputElement) {
        return;
    }
    const shapes = context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }
    const step = shiftKey ? 10 : 1;
    let dx: number = 0, dy: number = 0, transform: boolean = false;
    if (e.code === 'ArrowRight') {
        dx = step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowLeft') {
        dx = -step;
        dy = 0;
        transform = true;
    } else if (e.code === 'ArrowUp') {
        dx = 0;
        dy = -step;
        transform = true;
    } else if (e.code === 'ArrowDown') {
        dx = 0;
        dy = step;
        transform = true;
    }

    if (transform) {
        for (let i = 0; i < shapes.length; i++) {
            const editor = context.editor4Shape((shapes[i]));
            editor.translate(dx, dy);
        }
    }
}

export function d(s: { x: number, y: number }, e: { x: number, y: number }): number {
    const is2r = e.x - s.x;
    const is2b = e.y - s.y;
    let d = 0;
    if (is2r > 0) {
        d = d ^ 2;
    } else if (is2r < 0) {
        d = d ^ 1;
    }
    if (is2b > 0) {
        d = d ^ 8
    } else if (is2b < 0) {
        d = d ^ 4;
    }
    return d;
}

// export function getDelta(s: ShapeView, p: PageXY) {
//     const f2r = s.frame2Root();
//     return { dx: p.x - f2r.x, dy: p.y - f2r.y };
// }

export function get_speed(e1: MouseEvent, e2: MouseEvent) {
    return Math.hypot(Math.abs(e2.clientX - e1.clientX), Math.abs(e2.clientY - e1.clientY));
}

export function get_range(index1: { row: number, col: number }, index2: { row: number, col: number }) {
    const t1 = index1.row > index2.row;
    const t2 = index1.col > index2.col;
    return {
        rows: t1 ? index2.row : index1.row,
        rowe: t1 ? index1.row : index2.row,
        cols: t2 ? index2.col : index1.col,
        cole: t2 ? index1.col : index2.col,
    }
}

/**
 *          7
 *      6        8
 *  5       .        1
 *      4        2
 *          3
 */
export type ActionDirection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function get_direction(rotation: number) {
    if (rotation >= 0 && rotation < 22) return 0;
    else if (rotation >= 22 && rotation < 77) return 45;
    else if (rotation >= 77 && rotation < 113) return 90;
    else if (rotation >= 113 && rotation < 157) return 135;
    else if (rotation >= 157 && rotation < 200) return 180;
    else if (rotation >= 200 && rotation < 245) return 225;
    else if (rotation >= 245 && rotation < 293) return 270;
    else if (rotation >= 293 && rotation < 338) return 315;
    else if (rotation >= 338 && rotation <= 360) return 0;
    else return 0;
}

export function gen_offset_map(shape: ShapeView, down: PageXY) {
    const m = shape.matrix2Root()
    const f = shape.frame;
    const lt = m.computeCoord2(0, 0);
    const rb = m.computeCoord2(f.width, f.height);
    const pivot = m.computeCoord2(f.width / 2, f.height / 2);
    const rt = m.computeCoord2(f.width, 0);
    const lb = m.computeCoord2(0, f.height);
    return {
        lt: { x: lt.x - down.x, y: lt.y - down.y },
        rb: { x: rb.x - down.x, y: rb.y - down.y },
        pivot: { x: pivot.x - down.x, y: pivot.y - down.y },
        rt: { x: rt.x - down.x, y: rt.y - down.y },
        lb: { x: lb.x - down.x, y: lb.y - down.y }
    }
}

export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: ShapeView[], shape: ShapeView) {
    if (!shapes.length) return;
    const p = shape.matrix2Root().computeCoord2(4, 4);
    const map = map_from_shapes(shapes);
    const targetParent = context.selection.getClosestContainer(p, map);
    if (targetParent.id === shape.id) return;
    const m = getCloesetContainer(context, shape).id !== targetParent.id;
    if (m && asyncTransfer) {
        asyncTransfer.migrate(adapt2Shape(targetParent) as GroupShape, compare_layer_3(shapes).map(s => adapt2Shape(s)), context.workspace.t('compos.dlt'));
    }
}

// 判断当前所处的wrap
function getCloesetContainer(context: Context, shape: ShapeView): ShapeView {
    let result = context.selection.selectedPage!
    let p = shape.parent;
    while (p) {
        if (p.type == ShapeType.Artboard) return p;
        p = p.parent;
    }
    return result
}

// 迁移
export const migrate = debounce(migrate_immediate, 100);

export function end_transalte(context: Context) {
    context.workspace.translating(false);
    context.workspace.setSelectionViewUpdater(true);
    context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    context.assist.reset();
    context.workspace.setCtrl('page');
    context.cursor.cursor_freeze(false);
}

export function check_status(context: Context) {
    context.menu.menuMount(); // 关闭可能已经打开的右键菜单
    const action = context.tool.action;
    return action === Action.AutoV || action === Action.AutoK;
}

export function is_symbol_class(shape: Shape | ShapeView) {
    return shape.isVirtualShape
        || [ShapeType.Symbol, ShapeType.SymbolRef, ShapeType.SymbolUnion].includes(shape.type)
        || (function (shape: Shape | ShapeView) {
            let p: Shape | ShapeView | undefined = shape;
            while (p) {
                if (ShapeType.Symbol === p.type) {
                    return true;
                }
                p = p.parent;
            }
            return false;
        }(shape));
}