import { Context } from "@/context";
import { Shape, ShapeType } from "@kcdesign/data";
export type Area = number | 'artboard' | 'group' | 'normal'; // number 说明在选区内
export function right_area(context: Context, shape: Shape): Area {
    let area: Area = 'normal';
    const selection = context.selection;
    if (shape.type === ShapeType.Artboard) {
        area = 'artboard';
    }
    if (shape.type === ShapeType.Group) {
        area = 'group';
    }
    const selected = selection.selectedShapes;
    const selected_map = new Map();
    for (let i = 0; i < selected.length; i++) {
        selected_map.set(selected[i].id, selected[i]);
    }

    let p = shape;

    while(p) {
        
    }

    return area;
}