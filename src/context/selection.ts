import { Watchable } from "@/data/data/basic";
import { Document } from "@/data/data/document";
import { Page } from "@/data/data/page";
import { Shape } from "@/data/data/shape";
import { ISave4Restore } from "@/data/data/transact";

interface Saved {
    page: Page | undefined,
    shapes: Shape[],
    cursorStart: number,
    cursorEnd: number
}

export class Selection extends Watchable implements ISave4Restore {

    static CHANGE_PAGE = Watchable.genWId();
    static CHANGE_SHAPE = Watchable.genWId();
    static CHANGE_SHAPE_HOVER = Watchable.genWId();

    private m_document: Document;

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];

    private m_hoverShape?: Shape;

    // todo
    private m_cursorStart: number = -1;
    private m_cursorEnd: number = -1;

    private m_keyboard_oncontrol: boolean = false;
    private m_keyboard_onshift: boolean = false;

    constructor(document: Document) {
        super();
        this.m_document = document;
    }

    setControlStatus(status: boolean) {
        this.m_keyboard_oncontrol !== status && (this.m_keyboard_oncontrol = status);
    }

    get onControl(): Boolean {
        return this.m_keyboard_oncontrol
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

    get selectedPage(): Page | undefined {
        return this.m_selectPage;
    }

    selectShape(shape: Shape) {
        // check?
        if (this.isSelectedShape(shape)) {
            this.m_selectShapes.splice(this.m_selectShapes.findIndex((s: Shape) => s === shape), 1)
            this.notify(Selection.CHANGE_SHAPE);
            return;
        }
        if (this.m_keyboard_oncontrol) {
            this.addSelectShape(shape);
            this.notify(Selection.CHANGE_SHAPE);
            return;
        }
        this.m_selectShapes.length = 0;
        this.m_selectShapes.push(shape);
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.m_hoverShape = undefined
        this.notify(Selection.CHANGE_SHAPE);
        // shape.notify(Selection.CHANGE_SHAPE);
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
        // shape.notify(Selection.CHANGE_SHAPE);
    }

    unselectShape(shape: Shape) {
        // todo
    }

    // selectRangeShape(start: Shape, end: Shape) {
    //     // todo
    // }
    // selectRangeShapeByIndex(start: number, end: number) {
    //     // todo
    // }

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
        if (this.isSelectedShape(shape)) {
            return;
        }
        this.m_hoverShape = shape;
        this.notify(Selection.CHANGE_SHAPE_HOVER);
    }

    unHoverShape(shape: Shape) {
        if (shape === this.m_hoverShape) {
            this.m_hoverShape = undefined;
            this.notify(Selection.CHANGE_SHAPE_HOVER);
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