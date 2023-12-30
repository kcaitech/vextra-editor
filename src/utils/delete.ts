import { Context } from "@/context";
import { Shape, ShapeView, TableShape, adapt2Shape } from "@kcdesign/data";

export function deleteUnits(context: Context) {
    const path_edit_mode = context.workspace.is_path_edit_mode;
    if (path_edit_mode) {
        delete_for_path_edit(context);
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

function delete_for_path_edit(context: Context) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) {
        console.log('!path_shape');
        return;
    }

    const points = context.path.get_synthetic_points(path_shape.points.length - 1);
    if (!points.length) {
        console.log('!points.length');
        return;
    }

    const editor = context.editor4Shape(path_shape);

    const result = editor.removePoints(points);

    if (result === 1) {
        context.path.reset();
    } else if (result === 0) {
        context.workspace.setPathEditMode(false);
        context.path._reset();
        context.selection.resetSelectShapes();
    }
}

function delete_shapes(context: Context, shapes: ShapeView[]) {
    const page = context.selection.selectedPage;
    if (page) {
        const editor = context.editor4Page(page);
        editor.delete_batch(shapes.map((s => adapt2Shape(s))));
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