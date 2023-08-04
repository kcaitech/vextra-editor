import { Align } from "@/context/assist";
import { Shape } from "@kcdesign/data";

const get_pos: { [key: string]: (shape: Shape) => number } = {};
get_pos[Align.LT_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, 0).x;
}
get_pos[Align.RT_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).x;
}
get_pos[Align.C_X] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).x;
}
get_pos[Align.RB_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, shape.frame.height).x;
}
get_pos[Align.LB_X] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).x;
}
get_pos[Align.LT_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, 0).y;
}
get_pos[Align.RT_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, 0).y;
}
get_pos[Align.C_Y] = function (shape: Shape) {
    const f = shape.frame;
    return shape.matrix2Root().computeCoord2(f.width / 2, f.height / 2).y;
}
get_pos[Align.RB_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(shape.frame.width, shape.frame.height).y;
}
get_pos[Align.LB_Y] = function (shape: Shape) {
    return shape.matrix2Root().computeCoord2(0, shape.frame.height).y;
}

export function delta2apex(shape: Shape, align: Align): number {
    return get_pos[align](shape);
} 