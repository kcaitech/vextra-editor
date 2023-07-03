import { ISave4Restore, Watchable } from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape, TextShape } from "@kcdesign/data";
import { cloneDeep } from "lodash";
import { scout, Scout, finder, finder_layers, artboardFinder } from "@/utils/scout";
// import { CanvasKitScout, canvasKitScout } from "@/utils/scout_beta";
import { Artboard } from "@kcdesign/data";
import { Context } from ".";
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
export interface ClientXYRaw { // 视口坐标系的xy
    x: number,
    y: number
}
export interface ClientXY { // 视口坐标系的xy，相对root
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
    static CHANGE_TEXT = 5;
    static PAGE_RENAME = 6;
    static UPDATE_RENDER_ITEM = 7;
    static EXTEND = 8;

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];
    private m_hoverShape?: Shape;
    private m_document: Document;
    private m_search_keyword: string | undefined;
    // Scout、CanvasKitScout是两种实现方案不同的图形检索对象
    private m_scout: Scout | undefined;
    // private m_scout_beta: CanvasKitScout | undefined;
    // todo
    private m_cursorStart: number = -1;
    private m_cursorAtBefore: boolean = false;
    private m_cursorEnd: number = -1;

    constructor(document: Document) {
        super();
        this.m_document = document;
    }
    get scout(): Scout | undefined {
        return this.m_scout;
    }
    // get canvaskitScout(): CanvasKitScout | undefined {
    //     return this.m_scout_beta;
    // }
    scoutMount(context: Context) {
        this.m_scout = scout(context);
    }
    // async canvaskitScoutMount() {
    //     this.m_scout_beta = await canvasKitScout();
    // }
    get artboarts() {
        const abs = Array.from(this.m_artboart_list.values());
        return abs;
    }
    get cursorStart() {
        return this.m_cursorStart;
    }
    get cursorAtBefore() {
        return this.m_cursorAtBefore;
    }
    get cursorEnd() {
        return this.m_cursorEnd;
    }
    get isSelectText() {
        return this.selectedShapes.length === 1 && this.selectedShapes[0] instanceof TextShape;
    }

    selectPage(p: Page | undefined) {
        if (this.m_selectPage === p) {
            return;
        }
        this.m_selectPage = p;
        this.m_selectShapes.length = 0;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_PAGE);
    }
    async deletePage(id: string, index: number) {
        if (id === this.m_selectPage?.id) {
            index = index === this.m_document.pagesList.length ? index - 1 : index;
            await this.m_document.pagesMgr.get(this.m_document.pagesList[index].id).then(p => {
                this.selectPage(p);
            });
        }
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
    /**
     * 在page范围内获取一个点上的所有图层
     * @param position 点位置，坐标系时page
     * @returns 符合检索条件的图形
     */
    getLayers(position: PageXY): Shape[] {
        position = cloneDeep(position);
        const result: Shape[] = [];
        if (this.scout) {
            const page = this.m_selectPage;
            if (page && page.childs.length) {
                result.push(...finder_layers(this.scout, page.childs, position));
            }
        }
        return result;
    }
    /**
     * 基于SVGGeometryElement的图形检索，与getLayers相比，getShapesByXY返回的结果长度最多为1，而这里可以大于1
     * @param position 点位置，坐标系时page
     * @param isCtrl 是否取消编组、容器等图形的特殊处理
     * @param scope 在scope范围内进行检索
     * @returns 符合检索条件的图形
     */
    getShapesByXY(position: PageXY, isCtrl: boolean, scope?: Shape[]): Shape[] {
        // scope 检索范围限定，如果没有限定范围则在全域(page)下寻找
        const shapes: Shape[] = [];
        if (this.scout) {
            position = cloneDeep(position);
            const page = this.m_selectPage!;
            const childs: Shape[] = scope || page.childs;
            shapes.push(...finder(this.scout, childs, position, this.selectedShapes[0], isCtrl));
        }
        return shapes;
    }

    getClosetArtboard(position: PageXY, except?: Shape, scope?: Shape[]): Shape {
        let result: Shape = this.selectedPage!; // 任何一个元素,至少在一个容器内
        const range: Shape[] = scope || this.m_selectPage?.artboardList.filter((ab: Artboard) => !ab.isLocked && ab.isVisible) || [];
        const artboard = artboardFinder(this.scout!, range, position, except);
        if (artboard) {
            result = artboard;
        }
        return result;
    }

    selectShape(shape?: Shape, ctrl?: boolean, meta?: boolean) {
        if (!shape) { // 取消所有已经选择的图形
            this.resetSelectShapes();
        } else {
            if (shape.isLocked) return;
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

    }
    unSelectShape(shape: Shape) {
        const index = this.m_selectShapes.findIndex((s: Shape) => s === shape);
        if (index > -1) {
            this.m_selectShapes.splice(index, 1);
            this.notify(Selection.CHANGE_SHAPE);
        }
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
        const needNotify = this.m_hoverShape ? true : false; // 时机很重要
        this.m_hoverShape = undefined;
        if (needNotify) {
            this.notify(Selection.CHANGE_SHAPE_HOVER);
        }
    }
    // 通过id获取shape
    getShapeById(id: string): Shape | undefined {
        const page = this.m_selectPage;
        let shape: Shape | undefined;
        if (page) {
            shape = page.shapes.get(id);
        }
        return shape;
    }

    /**
     *
     * @param x page坐标系
     * @param y
     */
    locateText(x: number, y: number): { index: number, before: boolean } {
        if (!(this.m_selectShapes.length === 1 && this.m_selectShapes[0] instanceof TextShape)) {
            return { index: -1, before: false };
        }
        const shape = this.m_selectShapes[0] as TextShape;
        // translate x,y
        const matrix = shape.matrix2Page();
        const xy = matrix.inverseCoord(x, y);
        x = xy.x;
        y = xy.y;

        return shape.text.locateText(x, y);
    }

    setCursor(index: number, before: boolean) {
        if (!(this.m_selectShapes.length === 1 && this.m_selectShapes[0] instanceof TextShape)) {
            return;
        }
        if (index < 0) index = 0;
        const shape = this.m_selectShapes[0];
        const length = shape.text.length;
        if (index >= length) {
            index = length - 1;
            before = false;
        }
        if (index !== this.m_cursorStart || index !== this.m_cursorEnd || before !== this.m_cursorAtBefore) {
            this.m_cursorStart = index;
            this.m_cursorEnd = index;
            this.m_cursorAtBefore = before;
            this.notify(Selection.CHANGE_TEXT);
        }
    }

    selectText(start: number, end: number) {
        if (!(this.m_selectShapes.length === 1 && this.m_selectShapes[0] instanceof TextShape)) {
            return;
        }
        const shape = this.m_selectShapes[0];
        const length = shape.text.length;
        if (start < 0) start = 0;
        else if (start >= length) {
            start = length - 1;
        }
        if (end < 0) end = 0;
        else if (end >= length) {
            end = length - 1;
        }
        if (start !== this.m_cursorStart || end !== this.m_cursorEnd) {
            this.m_cursorStart = start;
            this.m_cursorEnd = end;
            this.m_cursorAtBefore = false;
            this.notify(Selection.CHANGE_TEXT);
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