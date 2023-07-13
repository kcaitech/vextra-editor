import { Shape, ShapeType } from "@kcdesign/data";
export type Area = number | 'artboard' | 'group' | 'normal'; // number 说明在选区内
export function is_shape_in_selection(shapes: Shape[], shape: Shape): boolean {
    const map: Map<string, Shape> = new Map();
    for (let i = 0; i < shapes.length; i++) {
        if (shape.id === shapes[i].id) return true;
        map.set(shapes[i].id, shapes[i])
    }

    let p = shape.parent;

    while (p && p.type !== ShapeType.Page) {
        if (map.get(p.id)) {
            return true;
        }
        p = p.parent;
    }
    return false;
}
export function selection_types(shapes: Shape[]): number {
    let types = 0;
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].type === ShapeType.Artboard) {
            types = types | 2;
        } else if (shapes[i].type === ShapeType.Group) {
            types = types | 1;
        }
        if (types === 3) return types;
    }
    return types;
}
export function is_parent_unvisible(shape: Shape): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (!p.isVisible) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}
export function is_parent_locked(shape: Shape): boolean {
    let is_pu = false;
    let p = shape.parent;
    while (p && p.type !== ShapeType.Page) {
        if (p.isLocked) {
            is_pu = true;
            break;
        }
        p = p.parent;
    }
    return is_pu;
}