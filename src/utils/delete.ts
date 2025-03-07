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
import { ColorCtx } from "@/context/color";
import { PathShapeView, ShapeView, TableCellType, TableView } from "@kcdesign/data";
import { ReferLineHandler } from "@/components/Document/Rule/refer";
import { PathClipper } from "@/path/clipper";

export function deleteUnits(context: Context, shift = false) {
    // 删除参考线
    if (context.user.isRuleVisible && context.tool.referSelection?.selected?.valid) {
        const { env, index, axis } = context.tool.referSelection.selected;
        return new ReferLineHandler(context, axis, env, index).delete(env, index);
    }

    // 删除渐变色控点
    if (context.color.selected_stop !== undefined) {
        console.log('进入删除节点');
        
        return context.color.notify(ColorCtx.STOP_DELETE);
    }

    // 删除路径片段
    const path_edit_mode = context.workspace.is_path_edit_mode;
    if (path_edit_mode) return delete_for_path_edit(context, shift);

    const selected = context.selection.selectedShapes;
    if (selected.length === 0) return;

    // 批量删除图层
    if (selected.length > 1) return delete_shapes(context, selected);

    // 删除单元格
    const table = context.selection.tableshape;
    if (table) return delete_for_table(context, table);

    // 删除单个图层
    delete_shapes(context, selected);
}

/* 删除路径片段 */
function delete_for_path_edit(context: Context, keepClosed = false) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;

    const result = new PathClipper(context, path_shape as PathShapeView).clip(keepClosed);
    if (result === 0) {
        context.workspace.setPathEditMode(false);
        context.path._reset();
        context.selection.resetSelectShapes();
    } else if (result > 0) {
        context.path.reset();
    }
}

/* 删除图层 */
function delete_shapes(context: Context, shapes: ShapeView[]) {
    const page = context.selection.selectedPage;
    if (page) {
        const editor = context.editor4Page(page);
        editor.delete_batch(shapes);
    }
    context.selection.resetSelectShapes();
}

/* 删除单元格 */
function delete_for_table(context: Context, table: TableView) {
    const ts = context.tableSelection;
    const editor = context.editor4Table(table);
    const rs = ts.tableRowStart;
    const cs = ts.tableColStart;
    if (rs > -1 || cs > -1) {
        editor.resetCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
        ts.resetSelection();

        context.nextTick(context.selection.selectedPage!, () => {
            const ec = table.getCellAt(rs, cs);
            if (!ec || ec.cellType === TableCellType.None) {
                return;
            }

            // const cell = table.cells.get(ec.id);

            ts.setEditingCell(ec);

            context.textSelection.setCursor(0, false);
        })
    } else {
        const editor = context.editor4Shape(table);
        editor.delete();
        context.selection.resetSelectShapes();
    }
}