import { Context } from "@/context";
import {
    AsyncTransfer,
    GroupShape,
    Matrix,
    ShapeView,
    adapt2Shape
} from "@kcdesign/data";
import { ClientXY, PageXY, XY } from "@/context/selection";
import { debounce } from "lodash";
import { compare_layer_3 } from "@/utils/group_ungroup";

/**
 * @description 立刻把一组图形从一个容器移动到另一个容器
 */
export function migrate_immediate(context: Context, asyncTransfer: AsyncTransfer, shapes: ShapeView[], end: ClientXY) {
    if (!shapes.length) {
        return;
    }
    const pe: PageXY = context.workspace.matrix.inverseCoord(end);

    const target_parent = context.selection.getEnvForMigrate(pe);

    const except = asyncTransfer.getExceptEnvs();

    const o_env = except.find(v => v.id === target_parent.id);

    if (o_env) {
        asyncTransfer.backToStartEnv(o_env.data, context.workspace.t('compos.dlt'));
    } else {
        const tp = adapt2Shape(target_parent) as GroupShape;
        const _shapes = compare_layer_3(shapes, -1).map((s) => adapt2Shape(s));
        asyncTransfer.migrate(tp, _shapes, context.workspace.t('compos.dlt'));
    }

    context.assist.set_collect_target(shapes, true);
}

/**
 * @description 一组图形在另一个容器上方停留一段时间后，把这组图形从其原本的容器移动到该容器
 */
export const migrate_once = debounce(migrate_immediate, 160);

export function record_origin_env(shapes: ShapeView[]) {
    const envs = new Map<string, { index: number, shape: ShapeView }[]>();
    for (let i = 0, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        const parent = shape.parent;

        if (!parent) {
            continue;
        }

        const data = adapt2Shape(parent);

        const item = {
            index: (data as GroupShape).indexOfChild(adapt2Shape(shape)),
            shape
        }

        const arr = envs.get(data.id);
        if (arr) {
            arr.push(item);
        }
        else {
            envs.set(data.id, [item]);
        }
    }
    envs.forEach(v => {
        v.sort((a, b) => {
            if (a.index < b.index) {
                return -1;
            } else {
                return 1;
            }
        })
    })
    return envs;
}

export function find_except_envs(context: Context, shapes: ShapeView[], p: XY) {
    const except: ShapeView[] = [];

    const env1 = context.selection.getEnvForMigrate(p);
    except.push(env1);

    if (shapes.length !== 1) {
        return except;
    }

    const first_shape = shapes[0];
    const parent = first_shape.parent;

    if (!parent) {
        return except;
    }

    if (except[0]?.id !== parent.id) {
        except.push(parent);
    }

    return except;
}