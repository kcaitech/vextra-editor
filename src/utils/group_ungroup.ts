import { Context } from "@/context";
import { Shape } from "@kcdesign/data";

export function sort_by_layer(context: Context, selectedShapes: Shape[]) {
    const origin_map = new Map();
    for (let i = 0; i < selectedShapes.length; i++) {
        origin_map.set(selectedShapes[i].id, selectedShapes[i]);
    }
    const sort_shapes: Shape[] = [];
    const page = context.selection.selectedPage;
    if (page) {
        deep(page.childs);
    }
    return sort_shapes;

    function deep(childs: Shape[]) {
        for (let i = childs.length - 1; i > -1; i--) {
            const shape = childs[i];
            if (origin_map.get(shape.id)) {
                sort_shapes.push(shape);
                if (sort_shapes.length === origin_map.size) return;
            }
            if (shape.childs && shape.childs.length) {
                deep(shape.childs);
            }
        }
    }
}