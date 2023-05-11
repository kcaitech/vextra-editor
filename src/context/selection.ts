import { ISave4Restore, Watchable } from "@kcdesign/data/data/basic";
import { Document } from "@kcdesign/data/data/document";
import { Page } from "@kcdesign/data/data/page";
import { Shape, GroupShape, ShapeType } from "@kcdesign/data/data/shape";
import { cloneDeep } from "lodash";
import { scout, Scout } from "@/utils/scout";
import { CanvasKitScout, canvasKitScout } from "@/utils/scout_beta";
interface Saved {
    page: Page | undefined,
    shapes: Shape[],
    cursorStart: number,
    cursorEnd: number
}
export interface XY {
    x: number,
    y: number
}
export interface ClientXY { // 视口坐标系的xy
    x: number,
    y: number
}
export interface PageXY { // 页面坐标系的xy
    x: number,
    y: number
}
export interface ParentXY { // 父级元素坐标系的xy
    x: number,
    y: number
}
export interface ShapeXY { // 图形自身坐标系的xy
    x: number,
    y: number
}

export type ActionType = 'translate' | 'scale' | 'rotate';

export class Selection extends Watchable(Object) implements ISave4Restore {

    static CHANGE_PAGE = 1;
    static CHANGE_SHAPE = 2;
    static CHANGE_SHAPE_HOVER = 3;
    static CHANGE_RENAME = 4;
    static PAGE_RENAME = 5;

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];
    private m_hoverShape?: Shape;
    private m_document: Document;
    private m_search_keyword: string | undefined;
    // Scout、CanvasKitScout是两种实现方案不同的图形检索对象
    private m_scout: Scout | undefined;
    private m_scout_beta: CanvasKitScout | undefined;

    // todo
    private m_cursorStart: number = -1;
    private m_cursorEnd: number = -1;

    constructor(document: Document) {
        super();
        this.m_document = document;
    }
    get scout(): Scout | undefined {
        return this.m_scout;
    }
    get canvaskitScout(): CanvasKitScout | undefined {
        return this.m_scout_beta;
    }
    scoutMount() {
        this.m_scout = scout();
    }
    async canvaskitScoutMount() {
        this.m_scout_beta = await canvasKitScout();
    }

    selectPage(p: Page | undefined) {
        if (this.m_selectPage === p) {
            return;
        }
        // reset others
        this.m_selectPage = p;
        this.m_selectShapes.length = 0;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;

        this.notify(Selection.CHANGE_PAGE);
    }
    insertPage(p: Page | undefined) {
        this.m_selectPage = p;
        this.m_selectShapes.length = 0;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_PAGE);
    }
    async deletePage(id: string, index: number) {
        if (id === this.m_selectPage?.id) {
            index = index === this.m_document.pagesList.length ? 0 : index;
            await this.m_document.pagesMgr.get(this.m_document.pagesList[index].id).then(p => {
                this.m_selectPage = p;
            });
        }
        this.m_selectShapes.length = 0;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_PAGE);
    }
    reName(id?: string) {
        if (id) {
            this.notify(Selection.CHANGE_RENAME, id);
        } else {
            this.notify(Selection.CHANGE_RENAME, this.selectedPage?.id);
        }
    }
    rename() {
        this.notify(Selection.PAGE_RENAME);
    }

    get selectedPage(): Page | undefined {
        return this.m_selectPage;
    }
    getShapesByXY(position: XY, force?: boolean): Shape[] { // force 暴力矿工，深度搜索。
        // 在项目中，有三种检索需求：hover、左键、右键
        // hover：检索窗口可视图形，被裁剪的、unVisiable不检索。检索过程中，在遇见编组、容器的时候有额外处理
        // 遇见编组：
        // 遇见容器：
        // click left：类似hover，额外有双击操作，双击操作只检索当前hover对象的子对象
        // click right：检索窗口可视、被裁减的图形，unVisiable不检索
        position = cloneDeep(position);
        const shapes: Shape[] = [];
        const page = this.m_selectPage!;
        const childs = page.childs;
        position.x -= page.frame.x;
        position.y -= page.frame.y;

        if (childs?.length) deep(childs, position);
        return shapes;

        function deep(source: Shape[], position: XY) {
            for (let i = 0; i < source.length; i++) {
                const { x, y, width, height } = source[i].frame;
                if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height && source[i].isVisible) shapes.push(source[i]);
                const suppos = { x: position.x - x, y: position.y - y };
                if (source[i].childs?.length) deep(source[i].childs, suppos);
            }
        }
    }
    _getShapesByXY(position: PageXY): Shape[] { // Scout方案 position: PageXY
        const page = this.m_selectPage!;
        const childs = page.childs;
        const shapes: Shape[] = [];
        for (let i = 0; i < childs.length; i++) {
            const item = childs[i];
            const path = item.getPath(true);
            const m2page = item.matrix2Page();
            path.transform(m2page);
            const d = path.toString();
            if (this.scout) {
                if (this.scout.isPointInShape(d, position)) {
                    shapes.push(item);
                }
            }
        }
        return shapes;
    }
    getShapesByXY_beta(position: PageXY, force?: boolean): Shape[] { // 基于SVGGeometryElement的图形检索
        // force 深度检索。检索在某一位置的所有visible图形，返回的shape[]长度可以大于1
        // !force：只检索可见图形，被裁剪的、unVisible的不检索，返回的shape[]长度等于1或0，更适用于hover判定、左键点击。
        const shapes: Shape[] = [];
        if (this.scout) {
            position = cloneDeep(position);
            const page = this.m_selectPage!;
            const childs: Shape[] = page.childs;
            deep(this.scout, childs);
        }
        return shapes;

        // 获取图形在页面坐标系上的path
        function getPathOnPagString(shape: Shape): string {
            const path = shape.getPath(true);
            const m2page = shape.matrix2Page();
            path.transform(m2page);
            const d = path.toString();
            return d;
        }
        function isTarget(scout: Scout | undefined, shape: Shape, p: PageXY): boolean {
            const d = getPathOnPagString(shape);
            if (scout) {
                return scout.isPointInShape(d, p);
            } else {
                return false;
            }
        }
        function deep(scout: Scout, g: Shape[]) {
            for (let i = 0; i < g.length; i++) {
                if (g[i].isVisible) { // 只要是!isVisible，force与否都不可以选中
                    const item = g[i];
                    if ([ShapeType.Group, ShapeType.Artboard].includes(item.type)) { // 如果是容器或者编组
                        const isItemIsTarget = isTarget(scout, item, position);
                        if (!isItemIsTarget) continue; // 如果整个容器和编组都不是目标元素，则不需要向下遍历
                        const c = item.childs as Shape[];
                        if (item.type === ShapeType.Artboard) { // 如果是容器，有子元素时不可以被hover    
                            if (c.length) {
                                deep(scout, c);
                            } else {
                                shapes.push(item);
                            }
                        } else if (item.type === ShapeType.Group) { // 如果是编组，不用向下走了，让子元素往上走
                            forGroup(scout, item.childs);
                        }
                    } else {
                        if (isTarget(scout, item, position)) shapes.push(item);
                    }
                }
            }
        }
        // 编组：如果光标在一个编组A内，当光标在子元素(包括所有后代元素)上时，有且只有编组A被认为是target。
        // 注：子元素如果也是编组(编组B(编组C(编组D...)))的话都要冒泡到编组A上
        function forGroup(scout: Scout, g: Shape[]) {
            for (let j = 0; j < g.length; j++) {
                if (g[j].isVisible) {
                    const childIsTarget = isTarget(scout, g[j], position);
                    if (childIsTarget) {
                        if (g[j].type === ShapeType.Group) {
                            const c: Shape[] = (g[j] as GroupShape).childs;
                            forGroup(scout, c)
                        } else {
                            let target = g[j].parent; // c[j]必定会存在至少一个parent是Group
                            while (target?.parent && target?.parent?.type === ShapeType.Group) {
                                target = target.parent;
                            }
                            shapes.push(target!);
                            break;
                        }
                    }
                }
            }
        }
    }
    getClosetContainer(position: XY): GroupShape {
        position = cloneDeep(position);
        const page = this.m_selectPage!;
        const groups: GroupShape[] = [page];
        const childs = page.childs;
        position.x -= page.frame.x;
        position.y -= page.frame.y;
        if (childs?.length) deep(childs, position);
        return groups[0];

        function deep(source: Shape[], position: XY) {
            for (let i = 0; i < source.length; i++) {
                const { x, y, width, height } = source[i].frame;
                if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) {
                    if ([ShapeType.Artboard].includes(source[i].type)) {
                        groups.unshift(source[i] as GroupShape);
                    }
                }
                const suppos = { x: position.x - x, y: position.y - y }
                if (source[i].childs?.length) deep(source[i].childs, suppos);
            }
        }
    }

    selectShape(shape?: Shape, ctrl?: boolean, meta?: boolean) {
        if (!shape) {
            this.m_selectShapes.length = 0;
            this.m_cursorStart = -1;
            this.m_cursorEnd = -1;
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE);
            return;
        }
        if (ctrl || meta) {
            if (this.isSelectedShape(shape)) {
                this.m_selectShapes.splice(this.m_selectShapes.findIndex((s: Shape) => s === shape), 1);
            } else {
                this.m_selectShapes.push(shape);
            }
            this.notify(Selection.CHANGE_SHAPE);
            return;
        }
        this.m_selectShapes.length = 0;
        this.m_selectShapes.push(shape);
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.m_hoverShape = undefined;
        this.notify(Selection.CHANGE_SHAPE);
    }
    unSelectShape(shape: Shape) {
        if (!this.isSelectedShape(shape)) return;
        this.m_selectShapes.splice(this.m_selectShapes.findIndex((s: Shape) => s === shape), 1);
        this.notify(Selection.CHANGE_SHAPE);
    }

    rangeSelectShape(shapes: Shape[]) {
        this.m_selectShapes.length = 0;
        this.m_selectShapes.push(...shapes);
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.m_hoverShape = undefined;
        this.notify(Selection.CHANGE_SHAPE);
    }

    addSelectShape(shape: Shape) {
        // check?
        if (this.isSelectedShape(shape)) {
            return;
        }
        this.m_selectShapes.push(shape);
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_SHAPE);
    }

    resetSelectShapes() {
        this.m_selectShapes.length = 0;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_SHAPE);
        // todo
        // shape.notify(Selection.CHANGE_SHAPE);
    }

    isSelectedShape(shape: Shape) {
        const ret = this.m_selectShapes.find((value) => {
            return shape.id == value.id;
        })
        return ret !== undefined;
    }

    get selectedShapes(): Shape[] {
        return this.m_selectShapes;
    }

    get hoveredShape() {
        return this.m_hoverShape;
    }

    hoverShape(shape: Shape) {
        if (shape.id !== this.hoveredShape?.id) {
            this.m_hoverShape = undefined;
            this.m_hoverShape = shape;
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
    }

    unHoverShape() {
        if (this.m_hoverShape) {
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
        this.m_hoverShape = undefined;
    }
    // 通过id获取shape
    getShapeById(id: string): Shape | undefined {
        const page = this.m_selectPage;
        let shape: Shape | undefined;
        if (page) {
            const childs = page.childs;
            deep(childs);
        }
        return shape;

        function deep(cs: Shape[]) {
            for (let i = 0; i < cs.length; i++) {
                if (cs[i].id === id) shape = cs[i];
                if (shape) return;
                if ((cs[i] as GroupShape)?.childs?.length) {
                    deep((cs[i] as GroupShape).childs);
                }
            }
        }
    }
    save(): Saved {
        const saved = {
            page: this.m_selectPage,
            shapes: this.m_selectShapes.slice(0),
            cursorStart: this.m_cursorStart,
            cursorEnd: this.m_cursorEnd,
        }
        return saved;
    }
    restore(saved: Saved) {
        if (this.m_selectPage !== saved.page) {
            this.m_selectPage = saved.page;
            this.m_selectShapes = saved.shapes;
            this.m_cursorStart = saved.cursorStart;
            this.m_cursorEnd = saved.cursorEnd;
            // todo
            this.notify(Selection.CHANGE_PAGE);
            this.notify(Selection.CHANGE_SHAPE);
        }
        else {
            const diff = (lhs: Shape[], rhs: Shape[]): boolean => {
                if (lhs.length !== rhs.length) {
                    return true;
                }
                for (let i = 0, len = lhs.length; i < len; i++) {
                    if (lhs[i] !== rhs[i]) {
                        return true;
                    }
                }
                return false;
            }
            if (diff(this.m_selectShapes, saved.shapes)) {
                this.m_selectShapes = saved.shapes;
                this.m_cursorStart = saved.cursorStart;
                this.m_cursorEnd = saved.cursorEnd;
                this.notify(Selection.CHANGE_SHAPE);
            }
            else if (this.m_cursorStart !== saved.cursorStart ||
                this.m_cursorEnd !== saved.cursorEnd) {
                this.m_cursorStart = saved.cursorStart;
                this.m_cursorEnd = saved.cursorEnd;
                // todo notify
            }
        }
        if (this.m_hoverShape !== undefined) {
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
    }
}