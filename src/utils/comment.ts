import { Context } from "@/context";
import { canBeTarget, isTarget, finder_group } from "./scout";
import { PageXY } from "@/context/selection";
import { GroupShape, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import { IScout } from "@/openapi";
export function searchCommentShape(context: Context, position: PageXY) {
    const scout = context.selection.scout;
    const selected = context.selection.selectedShapes[0];
    const scoped = context.selection.selectedPage?.childs;
    return finder(scout!, scoped || [], position, selected);
}
export function finder(scout: IScout, g: ShapeView[], position: PageXY, selected: ShapeView, init?: ShapeView[]): ShapeView[] {
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) { 
        if (canBeTarget(g[i])) {
            const item = g[i];
            if ([ShapeType.Group, ShapeType.Artboard].includes(item.type)) {
                const isItemIsTarget = isTarget(scout, item, position);
                if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                const c = (item).childs;
                if (item.type === ShapeType.Artboard) {
                    if (c.length) {
                        result.push(...finder(scout, c, position, selected, result));
                        if (result.length) {
                            return result
                        } else {
                            result.push(item);
                            return result;
                        }
                    } else {
                        result.push(item);
                        return result;
                    }
                } else if ([ShapeType.Group].includes(item.type)) {
                    const g = finder_group(scout, (item).childs, position, selected, true);
                    if (g) {
                        result.push(g);
                        return result;
                    }
                }
            } else {
                if (isTarget(scout, item, position)) {
                    result.push(item);
                    if (result.length) return result;
                }
            }
        }
    }
    return result;
}