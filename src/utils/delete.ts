import { Context } from "@/context";
import { ColorCtx } from "@/context/color";
import { PathShapeView, ShapeView, TableCellType, TableView } from "@kcdesign/data";
import { ReferLineHandler } from "@/components/Document/Rule/refer";
import { PathClipper } from "@/path/clipper";

export function deleteUnits(context: Context) {
    // 删除参考线
    if (context.user.isRuleVisible && context.tool.referSelection?.selected?.valid) {
        const { env, index, axis } = context.tool.referSelection.selected;
        new ReferLineHandler(context, axis, env, index).delete(env, index);
        return;
    }
    // 删除颜色控点
    if (context.color.selected_stop !== undefined) {
        context.color.notify(ColorCtx.STOP_DELETE);
        return
    }
    // 删除路径节点
    const path_edit_mode = context.workspace.is_path_edit_mode;
    if (path_edit_mode) {
        delete_for_path_edit(context);
        return;
    }

    const selected = context.selection.selectedShapes;
    if (selected.length === 0) {
        return;
    }

    // 批量删除图层
    if (selected.length > 1) {
        delete_shapes(context, selected);
        return;
    }

    // 删除单元格
    const table = context.selection.tableshape;
    if (table) {
        delete_for_table(context, table);
        return;
    }

    // 删除单个图层
    delete_shapes(context, selected);
}

function delete_for_path_edit(context: Context) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;

    const result = new PathClipper(context, path_shape as PathShapeView).clip();
    if (result === 0) {
        context.workspace.setPathEditMode(false);
        context.path._reset();
        context.selection.resetSelectShapes();
    } else if (result > 0) {
        context.path.reset();
    }
}

function delete_shapes(context: Context, shapes: ShapeView[]) {
    const page = context.selection.selectedPage;
    if (page) {
        const editor = context.editor4Page(page);
        editor.delete_batch(shapes);
    }
    context.selection.resetSelectShapes();
}

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