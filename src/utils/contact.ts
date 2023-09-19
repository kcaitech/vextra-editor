import { CurvePoint, Shape } from "@kcdesign/data";
import { get_artboard_list_by_point, get_common_environment } from "./artboardFn";
import { Context } from "@/context";

export function get_contact_environment(context: Context, shape: Shape, points: CurvePoint[]) {
    let m = shape.matrix2Root(), f = shape.frame;
    m.preScale(f.width, f.height);
    const p1 = points[0];
    const p2 = points[points.length - 1];
    const page = context.selection.selectedPage!;
    const l1 = get_artboard_list_by_point(context, page.childs, m.computeCoord3(p1.point));
    const l2 = get_artboard_list_by_point(context, page.childs, m.computeCoord3(p2.point));
    return get_common_environment(l1, l2) || page;
}
//   const get_contact_environment = debounce(_get_contact_environment, 100);