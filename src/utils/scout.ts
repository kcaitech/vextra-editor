import { Context } from "@/context";
import { PageXY, XY } from "@/context/selection";
import { GroupShapeView, Matrix, PathShapeView, Shape, ShapeType, ShapeView, SymbolRefView } from "@kcdesign/data";
import { v4 as uuid } from "uuid";
import { isShapeOut } from "./assist";
import { IScout as Scout } from "@/openapi";
import { getVisibleBoundingByMatrix } from "@/space";
import { EnvChain } from "@/mouse/envchain";

export { IScout as Scout } from "@/openapi";

// Ver.SVGGeometryElement，基于SVGGeometryElement的图形检索
// 动态修改path路径对象的d属性。返回一个Scout对象， scout.isPointInShape(d, SVGPoint)用于判断一个点(SVGPoint)是否在一条路径(d)上
export function scout(context: Context): Scout {
    let temp = uuid().split('-');
    const scoutId = temp[temp.length - 1] || 'scout';
    temp = uuid().split('-');
    const pathId = temp[temp.length - 1] || 'path';
    const ele: SVGElement = createSVGGeometryElement(scoutId);
    const path: SVGGeometryElement = createPath('M 0 0 l 2 0 l 2 2 l -2 0 z', pathId); // 任意初始化一条path
    ele.appendChild(path);
    path.setAttributeNS(null, "fill-rule", "evenodd");
    document.body.appendChild(ele);

    // 任意初始化一个point
    const SVGPoint = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGPoint();

    function isPointInShape(shape: ShapeView, point: PageXY): boolean {
        const matrix = shape.matrix2Root();

        // 先判断包围盒
        const box = getVisibleBoundingByMatrix(shape, matrix);
        if (point.x < box.left || point.x > box.right || point.y < box.top || point.y > box.bottom) return false;

        // 再判断路径
        const d = getPathOnPageString(shape, matrix);
        path.setAttributeNS(null, 'd', d);

        const scale = context.workspace.curScale;
        SVGPoint.x = point.x;
        SVGPoint.y = point.y;
        if (shape.borderPath) {
            if (path.isPointInFill(SVGPoint)) return true;
        }
        let onlyStroke = shape instanceof PathShapeView && !shape.getFills().length;
        if (onlyStroke) {
            path.setAttributeNS(null, 'stroke-width', `${8 / scale}`);
            return path.isPointInStroke(SVGPoint);
        } else {
            if (path.isPointInFill(SVGPoint)) return true;
            path.setAttributeNS(null, 'stroke-width', `${4 / scale}`);
            return path.isPointInStroke(SVGPoint);
        }
    }

    function isPointInShapeForPreview(shape: ShapeView, point: XY, d: string, matrix: Matrix): boolean {
        SVGPoint.x = point.x;
        SVGPoint.y = point.y;

        path.setAttributeNS(null, 'd', d);

        const scale = matrix.m00;

        let stroke = 14 / scale;

        let isClosed = true;

        if ((shape as PathShapeView)?.segments?.length) {
            const segments = (shape as PathShapeView).segments;
            for (let i = 0; i < segments.length; i++) {
                if (!segments[i].isClosed) {
                    isClosed = false;
                    break;
                }
            }
        }

        path.setAttributeNS(null, 'stroke-width', `${stroke}`);

        if (isClosed) {
            return (path as SVGGeometryElement).isPointInFill(SVGPoint);
        } else {
            return (path as SVGGeometryElement).isPointInFill(SVGPoint) || (path as SVGGeometryElement).isPointInStroke(SVGPoint);
        }
    }

    function isPointInShape2(shape: ShapeView, point: PageXY): boolean {
        const d = getPathOnPageStringCustomOffset(shape, 1 / context.workspace.matrix.m00);
        SVGPoint.x = point.x;
        SVGPoint.y = point.y;
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

    function isPointInStrokeByWidth(d: string, point: XY, width: number): boolean {
        SVGPoint.x = point.x, SVGPoint.y = point.y;
        path.setAttributeNS(null, 'd', d);
        path.setAttributeNS(null, 'stroke-width', `${width}`);
        return (path as SVGGeometryElement).isPointInStroke(SVGPoint);
    }

    function remove() { // 把用于比对的svg元素从Dom树中去除
        const s = document.querySelector(`[id="${scoutId}"]`);
        if (s) document.body.removeChild(s);
    }

    return { path, isPointInShape, isPointInShape2, remove, isPointInPath, isPointInStroke, isPointInStrokeByWidth, isPointInShapeForPreview }
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

function getPathOnPageString(shape: ShapeView, matrix: Matrix): string {
    const path = shape.borderPath ? shape.borderPath.clone() : shape.getPath().clone();
    path.transform(matrix);
    return path.toString();
}

function getPathOnPageStringCustomOffset(shape: ShapeView, s: number): string { // path坐标系：页面
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
export function isTarget(scout: Scout, shape: ShapeView, p: PageXY): boolean {
    return scout.isPointInShape(shape, p);
}

// 胖一圈的判定
function isTarget2(scout: Scout, shape: ShapeView, p: PageXY): boolean {
    return scout.isPointInShape2(shape, p);
}

/**
 * @description 扁平化一个图层树 tree -> list
 * @param groupshape
 * @param flat
 * @returns
 */
export function delayering2(groupshape: ShapeView, flat?: ShapeView[]): ShapeView[] {
    let f: ShapeView[] = flat || [];

    const children: ShapeView[] = groupshape.type === ShapeType.SymbolRef
        ? (groupshape.naviChilds || [])
        : (groupshape.childs || []);

    for (let i = 0, len = children.length; i < len; i++) {
        const item = children[i];

        if (is_layers_tree_unit(item)) {
            f = delayering2(item, f);

            if (!is_hollow(item)) {
                f.push(item);
            }
        } else {
            f.push(item);
        }
    }

    return f;
}

export function is_layers_tree_unit(shape: ShapeView) {
    return ShapeType.Group === shape.type
        || ShapeType.Artboard === shape.type
        || ShapeType.SymbolUnion === shape.type
        || ShapeType.Symbol === shape.type
        || ShapeType.SymbolRef === shape.type
        || ShapeType.BoolShape === shape.type
}

/**
 * @description 点击穿透，穿透父级选区对子元素选区的覆盖
 */
export function selection_penetrate(scout: Scout, g: ShapeView, position: PageXY): ShapeView | undefined {
    const flat = delayering2(g);

    if (!flat.length) {
        return;
    }

    let target: ShapeView | undefined = undefined;

    for (let j = flat.length - 1; j > -1; j--) {
        const item = flat[j];
        if (canBeTarget(item) && isTarget(scout, item, position)) {
            target = item;
            break;
        }
    }

    if (!target) {
        return;
    }

    while (target && target.parent && target.parent.id !== g.id) {
        target = target.parent;
    }

    return target;
}

// 判断一个编组中是否已经有子元素被选中
function isPartSelect(shape: ShapeView, selected: ShapeView): boolean {
    let result: boolean = false;
    const c = shape instanceof GroupShapeView ? shape.childs : undefined;
    if (c && c.length) {
        for (let i = 0, len = c.length; i < len; i++) {
            const cur = c[i];
            if (cur.id === selected.id) return true;
            if ((cur)?.childs?.length) result = isPartSelect(c[i], selected);
            if (result) return true;
        }
    }
    return false;
}

// 编组：如果光标在一个编组A内，当光标在子元素(包括所有后代元素)上时，有且只有编组A被认为是target。
// 注：在没有任何元素选中的情况下，子元素如果也是编组(编组B(编组C(编组D...)))的话都要冒泡到编组A上，如果已经有元素被选中，则只冒泡到同一层级兄弟元素
export function finder_group(scout: Scout, g: ShapeView[], position: PageXY, selected: ShapeView, isCtrl: boolean): ShapeView | undefined {
    let result: ShapeView | undefined;
    for (let j = g.length - 1; j > -1; j--) { // 从最子集往父级冒泡
        const shape = g[j];
        if (!shape.isVisible || shape.isLocked || !isTarget(scout, shape, position)) continue;
        if (ShapeType.Group === shape.type) {
            const c: ShapeView[] = (shape).childs;
            result = finder_group(scout, c, position, selected, isCtrl);
            if (result) return result;
        } else {
            //如果Ctrl键被按下，不冒泡
            if (isCtrl) return shape;
            let target = shape;
            while (target.parent && ShapeType.Group === target.parent.type) {
                if (selected && isPartSelect(target.parent, selected)) break;
                target = target.parent;
            }
            result = target!;
            return result;
        }
    }
    return result;
}

export function canNotBeApex(shape: ShapeView): boolean { // 可以被判定为检索结果的前提是没有被锁定和isVisible可视
    return shape.isVirtualShape || !shape.isVisible || shape.isLocked || shape.type === ShapeType.Contact;
}

export function finder_contact(scout: Scout, g: ShapeView[], position: PageXY, selected: ShapeView, init?: ShapeView[]): ShapeView[] {
    const result = init || [];
    for (let i = g.length - 1; i > -1; i--) {
        const item = g[i];
        if (canNotBeApex(item)) {
            continue;
        }
        if ([ShapeType.Group, ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolUnion, ShapeType.SymbolRef].includes(item.type)) {
            const isItemIsTarget = isTarget2(scout, item, position);
            if (!isItemIsTarget) {
                continue;
            }
            const c = item instanceof SymbolRefView ? (item.naviChilds || []) : (item).childs as ShapeView[];
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
 * @param { Scout2 } scout 图形检索器，负责判定一个点(position)是否在一条path路径上(或路径的填充中)
 * @param { Shape[] } g 检索的范围，只会在该范围内进行上述匹配
 * @param { PageXY } position 一个点，在页面坐标系上的点
 */
export function finder_layers(scout: Scout, g: ShapeView[], position: PageXY): ShapeView[] {
    const result = [];
    for (let i = g.length - 1; i > -1; i--) {
        const item = g[i];

        if (!canBeTarget(g[i])) {
            continue;
        }

        if (!isTarget(scout, item, position)) {
            continue;
        }

        if ([ShapeType.Group, ShapeType.Artboard, ShapeType.SymbolUnion, ShapeType.Symbol, ShapeType.SymbolRef].includes(item.type)) {
            const c: ShapeView[] | undefined = item.type === ShapeType.SymbolRef ? item.naviChilds : (item).childs;
            if (c?.length) {
                result.push(...finder_layers(scout, c, position));
            }
        }

        result.push(item);
    }
    return result;
}

/**
 * @description 寻找到最近的层级较高的那个环境
 */
export function finder_container(scout: Scout, g: ShapeView[], position: PageXY, except?: Map<string, ShapeView>) {
    const layers = finder_layers(scout, g, position);

    for (let i = 0, len = layers.length; i < len; i++) {
        const item = layers[i];
        if (item.isVirtualShape) continue;
        if ([ShapeType.Artboard, ShapeType.Symbol].includes(item.type) && (!except?.get(item.id))) {
            return item;
        }
    }
}

/**
 * @description 寻找到最近的层级较高的那个环境
 */
export function finder_env_for_migrate(scout: Scout, g: ShapeView[], position: PageXY, shape4migrate: Set<string>) {
    const layers = finder_layers(scout, g, position);

    for (let i = 0, len = layers.length; i < len; i++) {
        const item = layers[i];
        if (item.isVirtualShape) {
            continue;
        }
        let p: ShapeView | undefined = item;
        let c = false;
        while (p) {
            if (shape4migrate.has(p.id)) {
                c = true;
                break;
            }
            p = p.parent;
        }
        if (c) {
            continue;
        }
        if (item.isContainer) {
            return item;
        }
    }
}

export function canBeTarget(shape: ShapeView): boolean { // 可以被判定为检索结果的前提是没有被锁定和isVisible可视
    return shape.isVisible && !shape.isLocked;
}

export function is_shape_in_selected(selected: ShapeView[], shape: ShapeView) {
    for (let i = 0, len = selected.length; i < len; i++) {
        if (selected[i].id === shape.id) return true;
    }
    return false;
}

function get_max_thickness_border(shape: ShapeView) {
    let max_thickness = 0;
    const borders = shape.getBorders();
    if (borders.length) {
        for (let i = 0, l = borders.length; i < l; i++) {
            const t = borders[i].thickness;
            if (t > max_thickness) {
                max_thickness = t;
            }
        }
    }
    return max_thickness;
}

/**
 * @description 图形检索规则以及实现 2
 * @param { Context } context
 * @param { IScout } scout 图形检索器，负责判定一个点(position)是否在一条path路径上(或闭合路径的填充中)
 * @param { ShapeView[] } scope 检索的范围，只会在该范围内进行上述匹配
 * @param { PageXY } hot 一个点，在root坐标系上的点
 * @param { boolean } pen 穿透侦测
 * @returns { ShapeView | undefined } 返回符合检索条件的层级最优先的图形
 */
export function finder2(context: Context, scout: Scout, scope: ShapeView[], hot: PageXY, pen: boolean): ShapeView | undefined {
    return pen ? for_pen(context, scout, scope, hot) : for_standard(context, scout, scope, hot);
}

/**
 * @description 穿透模式，优先级最高
 */
function for_pen(context: Context, scout: Scout, scope: ShapeView[], hot: PageXY): ShapeView | undefined {
    let result: ShapeView | undefined = undefined;
    for (let i = scope.length - 1; i > -1; i--) {
        const item = scope[i];

        if (!canBeTarget(item)) continue;

        if (item.type !== ShapeType.Contact && isShapeOut(context, item)) continue;

        if (!isTarget(scout, item, hot)) continue;

        if (item.type === ShapeType.Table) return item;

        const children = item.type === ShapeType.SymbolRef ? (item.naviChilds || []) : (item.childs || []);
        if (!children.length) return item; else {
            result = for_pen(context, scout, children, hot);
            const background = item.type === ShapeType.Artboard
                || item.type == ShapeType.Symbol
                || item.type === ShapeType.SymbolUnion
                || item.type === ShapeType.SymbolRef;

            if (!result && background) return item;
        }

        if (result) return result;
    }
}

/**
 * @description 标准模式
 */
function for_standard(context: Context, scout: Scout, scope: ShapeView[], hot: PageXY): ShapeView | undefined {
    const chains = context.selection.chainGenerator.chains;

    let result: ShapeView | undefined = undefined;

    for (let i = scope.length - 1; i > -1; i--) {
        const item = scope[i];

        if (!canBeTarget(item)              // 隐藏图层或已锁定
            || isShapeOut(context, item)    // 屏幕外图形，判断图形(除连接线以外)是否在屏幕内，本身消耗较小，另外可以避免后面的部分不必要的更大消耗
            || !isTarget(scout, item, hot)  // 不被鼠标hover
        ) continue;

        const chain = chains.get(item.id);
        if (chain) {
            result = from_chain(context, scout, hot, chain);
            if (result) return result;
        }

        if (is_fixed(item)) {
            result = for_fixed(context, scout, item, hot);
            if (result) return result;
            if (!item.childs.length) return item;
            break;
        } else if (is_hollow(item)) {
            result = for_hollow(context, scout, item, hot);
        } else {
            result = item;
        }
        if (result) return result;
    }
    return result;
}

/**
 * @description 链式穿透，当选区不为空时，有可能触发链式穿透
 */
function from_chain(context: Context, scout: Scout, hot: PageXY, chain: EnvChain): ShapeView | undefined {
    for (const child of chain.children) {
        let result: ShapeView | undefined;
        if (child.children.length) {
            result = from_chain(context, scout, hot, child);
            if (result) return result;
        }
        if (!child.base) continue;
        if (is_hollow(child.base)) {
            if (for_hollow(context, scout, child.base, hot)) return child.base;
        } else if (isTarget(scout, child.base, hot)) {
            return child.base;
        }
    }
    return chain.base;
}

/**
 * @description 固定对象，必须是页面的直接子对象，存在frame实体，存在子对象时，实体在特定情况下隐藏，包括页面下的Artboard、Union；
 * 开放式固定实体树：实体以外仍然需要侦测
 * 封闭式固定实体树：实体外部会被裁剪，不需要侦测
 */
function for_fixed(context: Context, scout: Scout, fixed: ShapeView, hot: PageXY): ShapeView | undefined {
    const sub = fixed.childs || [];
    const chains = context.selection.chainGenerator.chains;

    for (let i = sub.length - 1; i > -1; i--) {
        const item = sub[i];
        if (!canBeTarget(item) || isShapeOut(context, item)) continue;
        const chain = chains.get(item.id);
        if (chain) {
            const result = from_chain(context, scout, hot, chain);
            if (result) return result;
        }
        if (is_hollow(item)) {
            if (for_hollow(context, scout, item, hot)) return item;
        } else if (isTarget(scout, item, hot)) {
            return item;
        }
    }
}

/**
 * @description 虚体侦测，不存在frame实体，区域由子对象撑开，包括页面下的GroupShape；
 */
function for_hollow(context: Context, scout: Scout, hollow: ShapeView, hot: PageXY): ShapeView | undefined {
    const children = hollow.type === ShapeType.SymbolRef
        ? (hollow.naviChilds || [])
        : (hollow.childs || []);

    for (let i = children.length - 1; i > -1; i--) {
        const item = children[i];

        if (!canBeTarget(item) || isShapeOut(context, item) || !isTarget(scout, item, hot)) continue;

        if (is_hollow(item)) {
            if (for_hollow(context, scout, item, hot)) {
                return hollow;
            }
        } else {
            return hollow;
        }
    }
}

function is_hollow(shape: ShapeView) {
    return shape.type === ShapeType.Group;
}

function is_fixed(shape: ShapeView) {
    return (shape.type === ShapeType.Artboard || shape.type === ShapeType.SymbolUnion) && shape.parent?.type === ShapeType.Page;
}