import {Context} from "@/context";
import {
    AsyncTransfer,
    GroupShape,
    Matrix,
    Shape,
    ShapeType,
    SymbolRefShape,
    SymbolShape
} from "@kcdesign/data";
import {ClientXY, PageXY} from "@/context/selection";
import {debounce} from "lodash";
import {map_from_shapes} from "@/utils/content";
import {compare_layer_3} from "@/utils/group_ungroup";
import {get_closest_container} from "@/utils/mouse";
import {is_circular_ref2, is_part_of_symbolref, is_symbol_but_not_union} from "@/utils/symbol";

/**
 * @description 检查是否满足迁移条件
 * @param target 计划迁移到的目标
 * @param wonder 迁移对象
 * @returns 0 满足迁移条件
 *          1 不满足：只有组件可以迁移到union里
 *          2 target、wonder都为组件且target不为union
 *          3 无法通过循环引用检查
 *          4 目标在实例里面
 *          999 其他
 */
export function unable_to_migrate(target: Shape, wonder: Shape): number {
    if (target.type === ShapeType.Symbol) {
        if (wonder.type === ShapeType.SymbolRef) {
            const wonder_from = (wonder as SymbolRefShape).getRootData();
            if (!wonder_from) return 999;
            if (is_circular_ref2(wonder_from, target.id)) return 3;
        }
        if ((target as SymbolShape).isUnionSymbolShape && !is_symbol_but_not_union(wonder)) return 1;
        if (wonder.type === ShapeType.Symbol) return 2;
    } else {
        let p = target.parent;
        while (p) {
            if (p.type === ShapeType.Symbol) return 1;
            p = p.parent;
        }
    }
    return 0;
}

/**
 * @description 立刻把一组图形从一个容器移动到另一个容器
 */
export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: Shape[], end: ClientXY) {
    if (!shapes.length) return;
    const matrix = new Matrix(context.workspace.matrix.inverse);
    const pe: PageXY = matrix.computeCoord3(end);
    const map = map_from_shapes(shapes);
    const target_parent = context.selection.getClosestContainer(pe, map);
    if (is_part_of_symbolref(target_parent)) return console.log('migrate error:', 4);
    const emit_migrate = get_closest_container(context, shapes[0]).id !== target_parent.id;
    if (emit_migrate) {
        asyncTransfer.migrate(target_parent as GroupShape, compare_layer_3(shapes, -1));
        context.assist.set_collect_target([target_parent as GroupShape], true);
    }
}

/**
 * @description 一组图形在另一个容器上方停留一段时间后，把这组图形从其原本的容器移动到该容器
 */
export const migrate_once = debounce(migrate_immediate, 160);