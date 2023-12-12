import { Context } from "@/context";
import { Shape, TableShape } from "@kcdesign/data";

export function deleteUnits(context: Context) {
    const mode = context.workspace.is_path_edit_mode;
    if (mode) {
        delete_for_path_edit();
        return;
    }

    const selected = context.selection.selectedShapes;

    if (selected.length === 0) {
        return;
    }

    if (selected.length > 1) {
        delete_shapes(context, selected);
        return;
    }

    const table = context.selection.tableshape;
    if (table) {
        delete_for_table(context, table);
        return;
    }

    delete_shapes(context, selected);

}

function delete_for_path_edit() {
    // todo
    console.log('keyboard units to delete for path edit mode');

}

function delete_shapes(context: Context, shapes: Shape[]) {
    const page = context.selection.selectedPage;
    if (page) {
        const editor = context.editor4Page(page);
        editor.delete_batch(shapes);
    }
    context.selection.resetSelectShapes();
}

function delete_for_table(context: Context, table: TableShape) {
    const ts = context.tableSelection;
    const editor = context.editor4Table(table as TableShape);
    if (ts.tableRowStart > -1 || ts.tableColStart > -1) {
        editor.resetCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
        ts.resetSelection();
    } else {
        const editor = context.editor4Shape(table);
        editor.delete();
        context.selection.resetSelectShapes();
    }
}