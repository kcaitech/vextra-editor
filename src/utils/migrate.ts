import {Context} from "@/context";
import {AsyncTransfer, GroupShape, Matrix, Shape} from "@kcdesign/data";
import {ClientXY, PageXY} from "@/context/selection";
import {debounce} from "lodash";
import {map_from_shapes} from "@/utils/content";
import {sort_by_layer} from "@/utils/group_ungroup";
import {get_closest_container} from "@/utils/mouse";

function is_need_migrate() {

    return true;
}

/**
 * @description 立刻把一组图形从一个容器移动到另一个容器
 */
export function _migrate(context: Context, asyncTransfer: AsyncTransfer, shapes: Shape[], start: ClientXY, end: ClientXY) {
    if (!shapes.length) return;
    const matrix = new Matrix(context.workspace.matrix.inverse);
    const point_end: PageXY = matrix.computeCoord3(end);
    const map = map_from_shapes(shapes);
    const target_parent = context.selection.getClosestContainer(point_end, map);
}

/**
 * @description 一组图形在另一个容器上方停留一段时间后，把这组图形从其原本的容器移动到该容器
 */
export const migrate = debounce(_migrate, 100);

/**
 * @description 立刻把一组图形从一个容器移动到另一个容器
 */
export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: Shape[], end: ClientXY) {
    if (!shapes.length) return;
    const matrix = new Matrix(context.workspace.matrix.inverse);
    const pe: PageXY = matrix.computeCoord3(end);
    const map = map_from_shapes(shapes);
    const target_parent = context.selection.getClosestContainer(pe, map);
    const emit_migrate = get_closest_container(context, shapes[0]).id !== target_parent.id;
    console.log('target parent:', target_parent.name, 'current parent', get_closest_container(context, shapes[0]).name);
    if (emit_migrate) {
        asyncTransfer.migrate(target_parent as GroupShape, sort_by_layer(context, shapes, -1));
        context.assist.set_collect_target([target_parent as GroupShape], true);
    }
}

/**
 * @description 一组图形在另一个容器上方停留一段时间后，把这组图形从其原本的容器移动到该容器
 */
export const migrate_once = debounce(migrate_immediate, 160);