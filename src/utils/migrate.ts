import { Context } from "@/context";
import {
    AsyncTransfer,
    GroupShape,
    Matrix,
    Shape,
    ShapeView,
    adapt2Shape
} from "@kcdesign/data";
import { ClientXY, PageXY } from "@/context/selection";
import { debounce } from "lodash";
import { map_from_shapes } from "@/utils/content";
import { compare_layer_3 } from "@/utils/group_ungroup";
import { get_closest_container } from "@/utils/mouse";
import { is_part_of_symbolref } from "@/utils/symbol";
import { get_state_name } from "./shapelist";

/**
 * @description 立刻把一组图形从一个容器移动到另一个容器
 */
export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: ShapeView[], end: ClientXY) {
    if (!shapes.length) return;
    const matrix = new Matrix(context.workspace.matrix.inverse);
    const pe: PageXY = matrix.computeCoord3(end);
    const map = map_from_shapes(shapes);
    const target_parent = context.selection.getClosestContainer(pe, map);
    if (is_part_of_symbolref(target_parent)) {
        return console.log('migrate error:', 4);
    }
    const emit_migrate = (get_closest_container(context, shapes[0]).id !== target_parent.id);
    if (emit_migrate) {
        const tg = (target_parent);
        asyncTransfer.migrate(adapt2Shape(tg) as GroupShape, compare_layer_3(shapes, -1).map((s) => adapt2Shape(s)), context.workspace.t('compos.dlt'));
        context.assist.set_collect_target([tg], true);
    }
}

/**
 * @description 一组图形在另一个容器上方停留一段时间后，把这组图形从其原本的容器移动到该容器
 */
export const migrate_once = debounce(migrate_immediate, 160);