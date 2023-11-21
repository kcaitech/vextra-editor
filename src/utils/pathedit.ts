import {Context} from "@/context";
import {XY} from "@/context/selection";
import {Matrix} from "@kcdesign/data";

export function get_root_points(context: Context, indexes?: number[]) {
    const path_shape = context.selection.pathshape;
    if (!path_shape) return;
    const f = path_shape.frame;
    const m = new Matrix();
    m.preScale(f.width, f.height);
    m.multiAtLeft(path_shape.matrix2Root());
    const points = path_shape.points;
    const result: XY[] = [];
    if (indexes) {
        for (let i = 0, l = indexes.length; i < l; i++) {
            result.push(m.computeCoord3(points[indexes[i]].point));
        }
    } else {
        for (let i = 0, l = points.length; i < l; i++) {
            result.push(m.computeCoord3(points[i].point));
        }
    }
    return result;
}