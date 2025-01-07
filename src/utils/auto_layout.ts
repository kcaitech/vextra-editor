import { Context } from "@/context";
import { ArtboardView, ShapeType } from "@kcdesign/data";
import { compare_layer_3, filter_for_group1 } from "./group_ungroup";
import { getName } from "./content";


export const autoLayoutFn = (context: Context, t: Function) => {
    const selectShapes = context.selection.selectedShapes;
    if (selectShapes.length === 1 && (selectShapes[0] as ArtboardView).autoLayout) return;
    let shapes
    const page = context.selection.selectedPage;
    if (!page) return;
    const bro = Array.from(page.shapes.values());
    const editor = context.editor4Page(page);
    const name = getName(ShapeType.Artboard, bro || [], t);
    if (selectShapes.length > 1) {
        shapes = filter_for_group1(selectShapes);
        shapes = compare_layer_3(shapes);
    } else {
        shapes = selectShapes[0].childs;
    }
    if (selectShapes.length > 1) {
        editor.create_autolayout_artboard(shapes, name);
    } else {
        const editor = context.editor4Shape(selectShapes[0]);
        editor.addAutoLayout();
    }
}

export const unAutoLayoutFn = (context: Context) => {
    const selectShapes = context.selection.selectedShapes;
    const editor = context.editor4Shape(selectShapes[0]);
    editor.deleteAutoLayout();
}