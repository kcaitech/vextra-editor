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
    for (let i = g.length - 1; i > -1; i--) { // 从最上层开始往下找(z-index：大 -> 小)
        if (canBeTarget(g[i])) { // 只要是!isVisible，force与否都不可以选中
            const item = g[i];
            if ([ShapeType.Group, ShapeType.FlattenShape, ShapeType.Artboard].includes(item.type)) { // 如果是容器或者编组
                const isItemIsTarget = isTarget(scout, item, position);
                if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                const c = item.childs as Shape[];
                if (item.type === ShapeType.Artboard) { // 如果是容器，有子元素时不可以被hover    
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
                } else if ([ShapeType.Group, ShapeType.FlattenShape].includes(item.type)) { // 如果是编组，不用向下走了，让子元素往上走
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