import { Align } from "@/context/assist";
import { Shape } from "@kcdesign/data";

const get_pos: { [key: string]: (shape: Shape) => number } = {};
get_pos[Align.LT_X] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(0, 0).x;
}
get_pos[Align.RT_X] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(shape.frame.width, 0).x;
}
get_pos[Align.C_X] = function (shape: Shape) {
    const m = shape.matrix2Root();
    const f = shape.frame;
    return m.computeCoord2(f.width / 2, f.height / 2).x;
}
get_pos[Align.RB_X] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(shape.frame.width, shape.frame.height).x;
}
get_pos[Align.LB_X] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(0, shape.frame.height).x;
}
get_pos[Align.LT_Y] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(0, 0).y;
}
get_pos[Align.RT_Y] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(shape.frame.width, 0).y;
}
get_pos[Align.C_Y] = function (shape: Shape) {
    const m = shape.matrix2Root();
    const f = shape.frame;
    return m.computeCoord2(f.width / 2, f.height / 2).y;
}
get_pos[Align.RB_Y] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(shape.frame.width, shape.frame.height).y;
}
get_pos[Align.LB_Y] = function (shape: Shape) {
    const m = shape.matrix2Root();
    return m.computeCoord2(0, shape.frame.height).y;
}

export function apex(shape: Shape, align: Align): number {
    return get_pos[align](shape);
}