import { Context } from "@/context";
import { canBeTarget, isTarget, forGroupHover, Scout } from "./scout";
import { PageXY } from "@/context/selection";
import { Shape, ShapeType } from "@kcdesign/data";
export function searchCommentShape(context: Context, position: PageXY) {
    const scout = context.selection.scout;
    const selected = context.selection.selectedShapes[0];
    const scoped = context.selection.selectedPage?.childs;
    return finder(scout!, scoped || [], position, selected);
}
export function finder(scout: Scout, g: Shape[], position: PageXY, selected: Shape, init?: Shape[]): Shape[] {
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) { 
        if (canBeTarget(g[i])) {
            const item = g[i];
            if ([ShapeType.Group, ShapeType.FlattenShape, ShapeType.Artboard].includes(item.type)) {
                const isItemIsTarget = isTarget(scout, item, position);
                if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                const c = item.childs as Shape[];
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
                } else if ([ShapeType.Group, ShapeType.FlattenShape].includes(item.type)) {
                    const g = forGroupHover(scout, item.childs, position, selected, true);
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