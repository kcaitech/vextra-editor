import { PageXY } from "@/context/selection";
import { GroupShape, Shape, ShapeType } from "@kcdesign/data";
import { v4 as uuid } from "uuid";
interface Scout {
    path: SVGPathElement,
    remove: () => void;
    isPointInShape: (shape: Shape, point: PageXY) => boolean;
}
// Ver.SVGGeometryElement，基于SVGGeometryElement的图形检索
// 动态修改path路径对象的d属性。返回一个Scout对象， scout.isPointInShape(d, SVGPoint)用于判断一个点(SVGPoint)是否在一条闭合路径(d)上
function scout(): Scout {
    const scoutId = (uuid().split('-').at(-1)) || 'scout';
    const pathId = (uuid().split('-').at(-1)) || 'path';
    const ele: SVGElement = createSVGGeometryElement(scoutId);
    const path = createPath('M 0 0 l 2 0 l 2 2 l -2 0 z', pathId); // 任意初始化一条path
    ele.appendChild(path);
    document.body.appendChild(ele);

    const SVGPoint = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGPoint();

    function isPointInShape(shape: Shape, point: PageXY): boolean {
        const d = getPathOnPageString(shape);
        SVGPoint.x = point.x, SVGPoint.y = point.y;
        path.setAttributeNS(null, 'd', d);
        // console.log('path', path);
        // console.log('isPointInFill - path', (path as SVGGeometryElement).isPointInFill(SVGPoint));
        let result: boolean = false;
        if (shape.type === ShapeType.Line) {
            const thickness = Math.max((shape.style.borders[0]?.thickness || 1), 14);
            path.setAttributeNS(null, 'stroke-width', `${thickness}`);
            result = (path as SVGGeometryElement).isPointInStroke(SVGPoint);
        } else {
            result = (path as SVGGeometryElement).isPointInFill(SVGPoint);
        }
        console.log('--getTotalLength()--', (path as SVGGeometryElement).getTotalLength());

        return result;
    }

    function remove() { // 把用于比对的svg元素从Dom树中去除
        const s = document.querySelector(`[id="${scoutId}"]`);
        if (s) {
            document.body.removeChild(s)
        }
    }
    return { path, isPointInShape, remove }
}

function createSVGGeometryElement(id: string): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // 任意初始一个svg图形
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');
    svg.setAttribute('id', id);
    return svg;
}
function createPath(path: string, id: string): SVGPathElement {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttributeNS(null, 'd', path);
    p.setAttributeNS(null, 'fill', 'red');
    p.setAttribute('id', id);
    return p;
}
function getPathOnPageString(shape: Shape): string { // path坐标系：页面
    const path = shape.getPath(true);
    const m2page = shape.matrix2Page();
    path.transform(m2page);
    const d = path.toString();
    return d;
}

// 判定点是否在图形内
function isTarget(scout: Scout, shape: Shape, p: PageXY): boolean {
    return scout.isPointInShape(shape, p);
}

// 扁平化一个编组的树结构
function delayering(groupshape: Shape, flat?: Shape[]): Shape[] {
    let f: Shape[] = flat || [];
    for (let i = 0; i < groupshape.childs.length; i++) {
        const item = groupshape.childs[i];
        if (item.type === ShapeType.Group) {
            f = [...f, ...delayering(item, f)];
        } else {
            f.push(item);
        }
    }
    return f;
}

// 编组穿透
function groupPassthrough(scout: Scout, scope: Shape[], position: PageXY): Shape | undefined {
    // scope 编组子元素
    let shape: Shape | undefined;
    for (let i = 0; i < scope.length; i++) {
        if (scope[i].type === ShapeType.Group) {
            const items: Shape[] = delayering(scope[i]); // 扁平一个编组的树结构
            for (let j = 0; j < items.length; j++) {
                if (isTarget(scout, items[j], position)) {
                    shape = scope[i];
                    break;
                }
            }
            if (shape) break;
        } else {
            if (isTarget(scout, scope[i], position)) {
                shape = scope[i];
                break;
            }
        }
    }
    return shape;
}

function finder(scout: Scout, g: Shape[], position: PageXY, force: boolean, selected: Shape, init?: Shape[]): Shape[] {
    // force：找到点上的所有图形，否则找到一个就不再寻找
    // O(n + dk)
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) { // 从最上层开始往下找(z-index：大 -> 小)
        if (canBeTarget(g[i])) { // 只要是!isVisible，force与否都不可以选中
            const item = g[i];
            if ([ShapeType.Group, ShapeType.Artboard].includes(item.type)) { // 如果是容器或者编组
                const isItemIsTarget = isTarget(scout, item, position);
                if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                const c = item.childs as Shape[];
                if (item.type === ShapeType.Artboard) { // 如果是容器，有子元素时不可以被hover    
                    if (c.length) {
                        result.push(...finder(scout, c, position, false, selected, result));
                        if (!force && result.length) return result;
                    } else {
                        result.push(item);
                        if (!force && result.length) return result;
                    }
                } else if (item.type === ShapeType.Group) { // 如果是编组，不用向下走了，让子元素往上走
                    const g = forGroupHover(scout, item.childs, position, selected);
                    if (g) {
                        result.push(g);
                        if (!force) return result;
                    }
                }
            } else {
                if (isTarget(scout, item, position)) {
                    result.push(item);
                    if (!force && result.length) return result;
                }
            }
        }
    }
    return result;
}

// 编组：如果光标在一个编组A内，当光标在子元素(包括所有后代元素)上时，有且只有编组A被认为是target。
// 注：在没有任何元素选中的情况下，子元素如果也是编组(编组B(编组C(编组D...)))的话都要冒泡到编组A上，如果已经有元素被选中，则只冒泡到同一层级兄弟元素
function forGroupHover(scout: Scout, g: Shape[], position: PageXY, selected: Shape): Shape | undefined {
    let result: Shape | undefined;
    for (let j = 0; j < g.length; j++) {
        if (g[j].isVisible) {
            const childIsTarget = isTarget(scout, g[j], position);
            if (childIsTarget) {
                if (g[j].type === ShapeType.Group) {
                    const c: Shape[] = (g[j] as GroupShape).childs;
                    return forGroupHover(scout, c, position, selected);
                } else {
                    let target = g[j]; // c[j]必定会存在至少一个parent是Group
                    while (target?.parent && target?.parent?.type == ShapeType.Group) {
                        if (selected) {
                            const isBroSelected: boolean = isPartSelect(target?.parent, selected);
                            if (isBroSelected) break;
                        }
                        target = target.parent;
                    }
                    result = target!;
                    break;
                }
            }
        }
    }
    return result;
}
// 判断一个编组中是否已经有子元素被选中
function isPartSelect(shape: Shape, selected: Shape): boolean {
    let result: boolean = false;
    const c = (shape as GroupShape).childs;
    if (c) {
        for (let i = 0; i < c.length; i++) {
            if (c[i].id == selected.id) {
                return result = true;
            }
            if (c[i]?.childs?.length) {
                result = isPartSelect(c[i], selected);
            }
        }
    }
    return result;
}
function artboardFinder(scout: Scout, g: Shape[], position: PageXY, except?: Shape): Shape | undefined {
    let result: Shape | undefined = undefined;
    for (let i = g.length - 1; i > -1; i--) {
        const item = g[i];
        if (item.type === ShapeType.Artboard) {
            const isItemIsTarget = isTarget(scout, item, position);
            if (isItemIsTarget) {
                if (except) {
                    if (item.id != except.id) {
                        result = item;
                        break;
                    }
                } else {
                    result = item;
                    break;
                }
                const c = (item as GroupShape)?.childs || [], length = c.length;
                if (length) {
                    result = artboardFinder(scout, c, position, except);
                    if (result) break;
                }
            }
        }
    }
    return result
}

function canBeTarget(shape: Shape): boolean { // 可以被选择的前提是没有被锁定和isVisible可视
    if (shape.isVisible != undefined && shape.isLocked != undefined) {
        return shape.isVisible && !shape.isLocked;
    } else {
        return false;
    }
}
export { Scout, scout, isTarget, getPathOnPageString, delayering, groupPassthrough, forGroupHover, finder, artboardFinder }