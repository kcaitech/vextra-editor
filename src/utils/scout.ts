import { Context } from "@/context";
import { PageXY, XY } from "@/context/selection";
import { GroupShape, Matrix, Shape, ShapeType } from "@kcdesign/data";
import { v4 as uuid } from "uuid";

interface Scout {
    path: SVGPathElement
    remove: () => void
    isPointInShape: (shape: Shape, point: PageXY) => boolean
    isPointInPath: (d: string, point: PageXY) => boolean
    isPointInStroke: (d: string, point: PageXY) => boolean
    isPointInShape2: (shape: Shape, point: PageXY) => boolean
}

// Ver.SVGGeometryElement，基于SVGGeometryElement的图形检索
// 动态修改path路径对象的d属性。返回一个Scout对象， scout.isPointInShape(d, SVGPoint)用于判断一个点(SVGPoint)是否在一条路径(d)上
function scout(context: Context): Scout {
    const scoutId = (uuid().split('-').at(-1)) || 'scout';
    const pathId = (uuid().split('-').at(-1)) || 'path';
    const ele: SVGElement = createSVGGeometryElement(scoutId);
    const path = createPath('M 0 0 l 2 0 l 2 2 l -2 0 z', pathId); // 任意初始化一条path
    ele.appendChild(path);
    document.body.appendChild(ele);

    // 任意初始化一个point
    const SVGPoint = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGPoint();

    function isPointInShape(shape: Shape, point: PageXY): boolean {
        const d = getPathOnPageString(shape);
        SVGPoint.x = point.x;
        SVGPoint.y = point.y; // 根据鼠标位置确定point所处位置
        path.setAttributeNS(null, 'd', d);
        let result: boolean = false;
        if (shape.type === ShapeType.Line || shape.type === ShapeType.Contact || shape.type === ShapeType.Cutout) {
            // 线条元素(不管是否闭合，都当不闭合)额外处理point是否在边框上
            const thickness = Math.max((shape.style.borders[0]?.thickness || 1), 14 / context.workspace.matrix.m00);
            path.setAttributeNS(null, 'stroke-width', `${thickness}`);
            result = (path as SVGGeometryElement).isPointInStroke(SVGPoint);
        } else {
            // 判断point是否在闭合路径的填充中
            result = (path as SVGGeometryElement).isPointInFill(SVGPoint);
        }
        return result;
    }

    function isPointInShape2(shape: Shape, point: PageXY): boolean {
        const d = getPathOnPageStringCustomOffset(shape, 1 / context.workspace.matrix.m00);
        SVGPoint.x = point.x;
        SVGPoint.y = point.y; // 根据鼠标位置确定point所处位置
        path.setAttributeNS(null, 'd', d);
        return (path as SVGGeometryElement).isPointInFill(SVGPoint);
    }

    function isPointInPath(d: string, point: XY): boolean {
        SVGPoint.x = point.x, SVGPoint.y = point.y; // 根据鼠标位置确定point所处位置
        path.setAttributeNS(null, 'd', d);
        return (path as SVGGeometryElement).isPointInFill(SVGPoint);
    }

    function isPointInStroke(d: string, point: XY): boolean {
        SVGPoint.x = point.x, SVGPoint.y = point.y;
        path.setAttributeNS(null, 'd', d);
        path.setAttributeNS(null, 'stroke-width', '14');
        return (path as SVGGeometryElement).isPointInStroke(SVGPoint);
    }

    function remove() { // 把用于比对的svg元素从Dom树中去除
        const s = document.querySelector(`[id="${scoutId}"]`);
        if (s) document.body.removeChild(s);
    }

    return { path, isPointInShape, isPointInShape2, remove, isPointInPath, isPointInStroke }
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
    return p;
}

function getPathOnPageString(shape: Shape): string { // path坐标系：页面
    const path = shape.getPath();
    const m2page = shape.matrix2Root();
    path.transform(m2page);
    return path.toString();
}

function getPathOnPageStringCustomOffset(shape: Shape, s: number): string { // path坐标系：页面
    const f = shape.frame;
    const offset = 20 * s;
    const scalex = (f.width + offset) / f.width, scaley = (f.height + offset) / f.height;
    const m = new Matrix();
    m.preScale(scalex * f.width, scaley * f.height);
    m.trans(-offset / 2, -offset / 2);
    m.multiAtLeft(shape.matrix2Root());
    return getBoxPath(m);
}

function getBoxPath(transformMatrix: Matrix) {
    const p1 = transformMatrix.computeCoord2(0, 0);
    const p2 = transformMatrix.computeCoord2(1, 0);
    const p3 = transformMatrix.computeCoord2(1, 1);
    const p4 = transformMatrix.computeCoord2(0, 1);
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} z`;
}

// 判定点是否在图形内
function isTarget(scout: Scout, shape: Shape, p: PageXY): boolean {
    return scout.isPointInShape(shape, p);
}

function isTarget2(scout: Scout, shape: Shape, p: PageXY): boolean {
    return scout.isPointInShape2(shape, p);
}

// 扁平化一个编组的树结构
function delayering(groupshape: Shape, flat?: Shape[]): Shape[] {
    let f: Shape[] = flat || [];
    for (let i = 0; i < groupshape.childs.length; i++) {
        const item = groupshape.childs[i];
        if (item.type === ShapeType.Group) {
            f = f.concat(delayering(item, f));
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
    for (let i = scope.length - 1; i > -1; i--) {
        if ([ShapeType.Group, ShapeType.FlattenShape].includes(scope[i].type)) {
            const items: Shape[] = delayering(scope[i]); // 扁平一个编组的树结构
            for (let j = items.length - 1; j > -1; j--) {
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

/**
 * 图形检索规则以及实现
 * @param { Scout } scout 图形检索器，负责判定一个点(position)是否在一条path路径上(或路径的填充中)
 * @param { Shape[] } g 检索的范围，只会在该范围内进行上述匹配
 * @param { PageXY } position 一个点，在页面坐标系上的点
 * @param { boolean } isCtrl 是否把容器、编组元素当作普通图形判定，不为真的时候会有特殊判定，比如编组子元素会冒泡的编组、存在子元素容器无法被判定为目标...
 * @param { Shape[] } init 在下次一递归开始时需要继承的结果
 * @returns { Shape[] } 返回符合检索条件的图形
 */
function finder(scout: Scout, g: Shape[], position: PageXY, selected: Shape, isCtrl: boolean, init?: Shape[]): Shape[] {
    // 找到点上的所有图形，否则找到一个就不再寻找
    // O(n + dk)
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) { // 从最上层开始往下找(z-index：大 -> 小)
        if (!canBeTarget(g[i])) continue;
        const item = g[i];
        // 特殊处理的三类图形：容器、编组、flatten
        if ([ShapeType.Group, ShapeType.FlattenShape, ShapeType.Artboard].includes(item.type)) { // 如果是容器或者编组
            const isItemIsTarget = isTarget(scout, item, position);
            if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
            const c = item.childs as Shape[];
            if (item.type === ShapeType.Artboard) { // 如果是容器，有子元素时不可以被hover    
                if (c.length) {
                    result.push(...finder(scout, c, position, selected, isCtrl, result));
                    if (result.length) {
                        return result;
                    } else { // 在一个容器拥有子元素的情况下，需要isCtrl才可以被hover
                        if (isCtrl) {
                            result.push(item);
                            return result;
                        }
                    }
                } else {
                    result.push(item);
                    return result;
                }
            } else if ([ShapeType.Group, ShapeType.FlattenShape].includes(item.type)) { // 如果是编组，不用向下走了，让子元素往上走
                const g = forGroupHover(scout, item.childs, position, selected, isCtrl);
                if (g) {
                    result.push(g);
                    return result;
                }
            }
        } else {
            if (isTarget(scout, item, position)) {
                result.push(item);
                return result;
            }
        }
    }
    return result;
}

export function finder_contact(scout: Scout, g: Shape[], position: PageXY, selected: Shape, init?: Shape[]): Shape[] {
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) {
        if (!canBeTarget(g[i]) || g[i].type === ShapeType.Contact) continue;
        const item = g[i];
        if ([ShapeType.Group, ShapeType.FlattenShape, ShapeType.Artboard].includes(item.type)) {
            const isItemIsTarget = isTarget2(scout, item, position);
            if (!isItemIsTarget) continue;
            const c = item.childs as Shape[];
            if (item.type === ShapeType.Artboard) {
                if (c.length) {
                    result.push(...finder_contact(scout, c, position, selected, result));
                    if (result.length) {
                        return result;
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
            if (isTarget2(scout, item, position)) {
                result.push(item);
                return result;
            }
        }
    }
    return result;
}

/**
 * 与finder相比，finder结果通常不会大于1，而这里通常可以大于1，代码上减少了逻辑判断，增大了遍历更多条目的概率
 * @param { Scout } scout 图形检索器，负责判定一个点(position)是否在一条path路径上(或路径的填充中)
 * @param { Shape[] } g 检索的范围，只会在该范围内进行上述匹配
 * @param { PageXY } position 一个点，在页面坐标系上的点
 */
function finder_layers(scout: Scout, g: Shape[], position: PageXY): Shape[] {
    const result = [];
    for (let i = g.length - 1; i > -1; i--) { // 从最上层开始往下找(z-index：大 -> 小)
        if (canBeTarget(g[i])) { // 只要是!isVisible，force与否都不可以选中
            const item = g[i];
            // 特殊处理的三类图形：容器、编组、flatten
            if ([ShapeType.Group, ShapeType.FlattenShape, ShapeType.Artboard].includes(item.type)) {
                const isItemIsTarget = isTarget(scout, item, position);
                if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                const c = item.childs as Shape[];
                if (c.length) {
                    result.push(...finder_layers(scout, c, position));
                }
                result.push(item);
            } else {
                if (isTarget(scout, item, position)) {
                    result.push(item);
                }
            }
        }
    }
    return result;
}

// 编组：如果光标在一个编组A内，当光标在子元素(包括所有后代元素)上时，有且只有编组A被认为是target。
// 注：在没有任何元素选中的情况下，子元素如果也是编组(编组B(编组C(编组D...)))的话都要冒泡到编组A上，如果已经有元素被选中，则只冒泡到同一层级兄弟元素
function forGroupHover(scout: Scout, g: Shape[], position: PageXY, selected: Shape, isCtrl: boolean): Shape | undefined {
    let result: Shape | undefined;
    for (let j = g.length - 1; j > -1; j--) { // 从最子集往父级冒泡
        const shape = g[j];
        if (!shape.isVisible || !isTarget(scout, shape, position)) continue;
        if ([ShapeType.Group, ShapeType.FlattenShape].includes(shape.type)) {
            const c: Shape[] = (shape as GroupShape).childs;
            const res = forGroupHover(scout, c, position, selected, isCtrl);
            if (res) return res;
        } else {
            //如果Ctrl键被按下，不冒泡
            if (isCtrl) return shape;
            let target = shape;
            while (target.parent && [ShapeType.Group, ShapeType.FlattenShape].includes(target.parent?.type)) {
                if (selected) {
                    const isBroSelected: boolean = isPartSelect(target.parent, selected);
                    if (isBroSelected) break;
                }
                target = target.parent;
            }
            result = target!;
            break;
        }
    }
    return result;
}

// 判断一个编组中是否已经有子元素被选中
function isPartSelect(shape: Shape, selected: Shape): boolean {
    let result: boolean = false;
    const c = shape instanceof GroupShape ? shape.childs : undefined;
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

// 寻找到最近的层级较高的那个容器
function artboardFinder(scout: Scout, g: Shape[], position: PageXY, except?: Map<string, Shape>): Shape | undefined {
    let result: Shape | undefined = undefined;
    for (let i = g.length - 1; i > -1; i--) {
        const item = g[i];
        if (except && except.get(item.id)) continue;
        if (item.type === ShapeType.Artboard) {
            if (isTarget(scout, item, position)) {
                const c = (item as GroupShape)?.childs || [], length = c.length;
                if (length) {
                    result = artboardFinder(scout, c, position, except);
                    if (result) break;
                }
                result = item;
                if (result) break;
            }
        }
    }
    return result
}

function canBeTarget(shape: Shape): boolean { // 可以被判定为检索结果的前提是没有被锁定和isVisible可视
    if (shape.isVisible != undefined && shape.isLocked != undefined) {
        return shape.isVisible && !shape.isLocked;
    } else {
        return false;
    }
}

export {
    Scout,
    scout,
    isTarget,
    getPathOnPageString,
    delayering,
    groupPassthrough,
    forGroupHover,
    finder,
    finder_layers,
    artboardFinder,
    canBeTarget
}
