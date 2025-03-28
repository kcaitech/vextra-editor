/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Artboard, ArtboardView, GroupShapeView, Shape, ShapeType, SymbolRefView } from "@kcdesign/data";
import { compare_layer_3, filter_for_group1 } from "./group_ungroup";
import { getName } from "./content";
import { Selection } from "@/context/selection";


export const autoLayoutFn = (context: Context, t: Function) => {
    const selectShapes = context.selection.selectedShapes;
    if (selectShapes.length === 1 && (selectShapes[0] as ArtboardView).autoLayout) return;
    let shapes
    const page = context.selection.selectedPage;
    if (!page) return;
    const bro = Array.from(page.shapes.values());
    const editor = context.editor4Page(page);
    const name = getName(ShapeType.Artboard, bro || [], t);
    let isCreate = false;
    if (selectShapes.length === 1 && selectShapes[0] instanceof GroupShapeView && !(selectShapes[0] instanceof SymbolRefView)) {
        isCreate = true;
    }
    if (selectShapes.length > 1 || !isCreate) {
        shapes = filter_for_group1(selectShapes);
        shapes = compare_layer_3(shapes);
    } else {
        shapes = selectShapes[0].childs;
    }
    let newshape: Artboard | undefined;
    if (selectShapes.length > 1 || !isCreate) {
        editor.create_autolayout_artboard(shapes, name);
    } else {
        const editor = context.editor4Shape(selectShapes[0]);
        newshape = editor.addAutoLayout();
    }
    if (newshape) {
        context.nextTick(page, () => {
            const group = newshape && page.getShape(newshape.id);
            group && context.selection.selectShape(group);
            group && context.selection.notify(Selection.EXTEND, group);
        })
    }
}

export const unAutoLayoutFn = (context: Context) => {
    const shapes = context.selection.selectedShapes;
    const page = context.selection.selectedPage!;
    const editor = context.editor4Page(page);
    editor.deleteAutoLayout(shapes);
}