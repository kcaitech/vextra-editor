import { ISave4Restore, Watchable } from "@kcdesign/data/data/basic";
import { Document } from "@kcdesign/data/data/document";
import { Page } from "@kcdesign/data/data/page";
import { Shape, GroupShape } from "@kcdesign/data/data/shape";
import { cloneDeep } from "lodash";

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

export type ActionType = 'translate' | 'scale' | 'rotate';

export class Selection extends Watchable(Object) implements ISave4Restore {

    static CHANGE_PAGE = 1;
    static CHANGE_SHAPE = 2;
    static CHANGE_SHAPE_HOVER = 3;

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];
    private m_hoverShape?: Shape;

    // todo
    private m_cursorStart: number = -1;
    private m_cursorEnd: number = -1;

    constructor(document: Document) {
        super();
        this.m_document = document;
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

    get selectedPage(): Page | undefined {
        return this.m_selectPage;
    }
    getShapesByXY(position: XY): Shape[] {
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
                if (position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height) shapes.push(source[i]);
                const suppos = { x: position.x - x, y: position.y - y };
                if (source[i].childs?.length) deep(source[i].childs, suppos);
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
                    if (['group-shape', 'artboard'].includes(source[i].typeId)) {
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
        this.m_hoverShape = undefined;
        this.m_hoverShape = shape;
        this.notify(Selection.CHANGE_SHAPE_HOVER);
    }

    unHoverShape() {
        this.m_hoverShape = undefined;
        this.notify(Selection.CHANGE_SHAPE_HOVER);
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