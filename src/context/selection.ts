import { ISave4Restore, TableShape, Watchable } from "@kcdesign/data";
import { Document } from "@kcdesign/data";
import { Page } from "@kcdesign/data";
import { Shape, Text } from "@kcdesign/data";
import { cloneDeep } from "lodash";
import { scout, Scout, finder, finder_layers, artboardFinder } from "@/utils/scout";
import { Artboard } from "@kcdesign/data";
import { Context } from ".";
import { TextSelection } from "./textselection";
import { TableSelection } from "./tableselection";
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
type TextShapeLike = Shape & { text: Text }
export type ActionType = 'translate' | 'scale' | 'rotate';
export class Selection extends Watchable(Object) implements ISave4Restore {

    static CHANGE_PAGE = 1;
    static CHANGE_SHAPE = 2;
    static CHANGE_SHAPE_HOVER = 3;
    static CHANGE_RENAME = 4;
    static CHANGE_TEXT = 5;
    static PAGE_RENAME = 6;
    static UPDATE_RENDER_ITEM = 7;
    static CHANGE_COMMENT = 8;
    static SOLVE_MENU_STATUS = 9;
    static COMMENT_CHANGE_PAGE = 10;
    static SKIP_COMMENT = 11;
    static PAGE_SORT = 12;
    static ABOUT_ME = 13;
    static EXTEND = 14;
    static CHANGE_TABLE_CELL = 15;

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];
    private m_hoverShape?: Shape;
    private m_document: Document;
    private m_scout: Scout | undefined;

    private m_comment_id: string = '';
    private m_comment_status: boolean = false;
    private m_comment_page_id: string | undefined;
    private m_select_comment: boolean = false;
    private m_comment_page_sort: boolean = false;
    private m_comment_about_me: boolean = false;

    constructor(document: Document) {
        super();
        this.m_document = document;
    }

    get scout(): Scout | undefined {
        return this.m_scout;
    }
    scoutMount(context: Context) {
        this.m_scout = scout(context);
    }
    get artboarts() {
        const abs = Array.from(this.m_artboart_list.values());
        return abs;
    }

    get commentId() {
        return this.m_comment_id;
    }
    get commentStatus() { //评论列表是否显示解决
        return this.m_comment_status;
    }
    get commentPageId() {
        return this.m_comment_page_id;
    }
    get isSelectComment() {
        return this.m_select_comment;
    }
    get commentPageSort() { //评论是否按页面排序
        return this.m_comment_page_sort;
    }
    get commentAboutMe() { //评论显示关于我的
        return this.m_comment_about_me;
    }

    selectCommentPage(id: string) {
        this.m_comment_page_id = id
        this.notify(Selection.COMMENT_CHANGE_PAGE)
    }

    setCommentSelect(s: boolean) {
        this.m_select_comment = s
        if (!s) {
            this.notify(Selection.SKIP_COMMENT)
        }
    }

    commentSolveMenuStatus(status: boolean) { //设置列表评论菜单解决状态
        this.m_comment_status = status
        this.notify(Selection.SOLVE_MENU_STATUS)
    }
    setPageSort(status: boolean) {
        this.m_comment_page_sort = status
        this.notify(Selection.PAGE_SORT)
    }
    setCommentAboutMe(status: boolean) {
        this.m_comment_about_me = status
        this.notify(Selection.ABOUT_ME)
    }

    selectPage(p: Page | undefined) {
        if (this.m_selectPage === p) {
            return;
        }
        this.m_selectPage = p;
        this.m_selectShapes.length = 0;
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
    selectComment(id: string) {
        this.m_comment_id = id
        this.notify(Selection.CHANGE_COMMENT);
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
     * @description 基于SVGGeometryElement的图形检索，与getLayers相比，getShapesByXY返回的结果长度最多为1，而这里可以大于1
     * @param position 点位置，坐标系时page
     * @param isCtrl 是否取消编组、容器等图形的特殊处理
     * @param scope 在scope范围内进行检索，如果没有限定范围则在全域(page)下寻找
     * @returns 符合检索条件的图形
     */
    getShapesByXY(position: PageXY, isCtrl: boolean, scope?: Shape[]): Shape[] {
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

    selectShape(shape?: Shape) {
        if (!shape) { // 取消所有已经选择的图形
            this.resetSelectShapes();
        } else {
            if (shape.isLocked) return;
            this.m_selectShapes.length = 0;
            this.m_selectShapes.push(shape);
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE);
        }
    }
    unSelectShape(shape: Shape) {
        const index = this.m_selectShapes.findIndex((s: Shape) => s.id === shape.id);
        if (index > -1) {
            this.m_selectShapes.splice(index, 1);
            this.notify(Selection.CHANGE_SHAPE);
        }
    }

    rangeSelectShape(shapes: Shape[]) {
        this.m_selectShapes.length = 0;
        this.m_selectShapes.push(...shapes);
        this.m_hoverShape = undefined;
        this.notify(Selection.CHANGE_SHAPE);
    }

    addSelectShape(shape: Shape) {
        // check?
        if (this.isSelectedShape(shape)) {
            return;
        }
        this.m_selectShapes.push(shape);
        this.notify(Selection.CHANGE_SHAPE);
    }

    resetSelectShapes() {
        this.m_selectShapes.length = 0;
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

    // text
    private m_textSelection?: TextSelection;
    getTextSelection(shape: TextShapeLike) {
        if (!this.m_textSelection || this.m_textSelection.shape.id !== shape.id) {
            this.m_textSelection = new TextSelection(shape, this);
        }
        return this.m_textSelection;
    }

    // table
    private m_tableSelection?: TableSelection;
    getTableSelection(shape: TableShape) {
        if (!this.m_tableSelection || this.m_tableSelection.shape.id !== shape.id) {
            this.m_tableSelection = new TableSelection(shape, this);
        }
        return this.m_tableSelection;
    }

    save() {
        throw new Error("Method not implemented.");
    }
    restore(saved: any): void {
        throw new Error("Method not implemented.");
    }
}