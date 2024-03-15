import { flattenShapes } from "@/utils/cutout";
import { GroupShapeView, ShapeType, ShapeView } from "@kcdesign/data";

export function getShapesForStyle(shapes: ShapeView[]) {
    const __shapes: ShapeView[] = [];
    for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        if (s.type === ShapeType.Group) {
            const shapes = flattenShapes(s.childs).filter(s => s.type !== ShapeType.Group);
            __shapes.push(...shapes);
        } else {
            __shapes.push(s);
        }
    }
    return __shapes;
}