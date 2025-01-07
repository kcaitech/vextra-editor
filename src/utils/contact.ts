import { CurvePoint, Shape, ShapeView } from "@kcdesign/data";
import { get_artboard_list_by_point, get_common_environment } from "./artboardFn";
import { Context } from "@/context";

export function get_contact_environment(context: Context, shape: ShapeView, points: CurvePoint[]) {
    let m = shape.matrix2Root(), f = shape.frame;
    m.preScale(f.width, f.height);
    const p1 = points[0];
    const p2 = points[points.length - 1];
    const page = context.selection.selectedPage!;
    const l1 = get_artboard_list_by_point(context, page.childs, m.computeCoord(p1.x, p1.y));
    const l2 = get_artboard_list_by_point(context, page.childs, m.computeCoord(p2.x, p2.y));
    return get_common_environment(l1, l2);
}
//   const get_contact_environment = debounce(_get_contact_environment, 100);