import { Watchable } from "@/data/basic";
import { Page } from "@/data/page";
import { Shape } from "@/data/shape";

export class Selection extends Watchable {

    static CHANGE_PAGE = Watchable.genWId();
    static CHANGE_SHAPE = Watchable.genWId();

    private m_selectPage?: Page;
    private m_selectShapes: Shape[] = [];

    private m_hoverShape?: Shape;

    // todo
    private m_cursorStart: number = -1;
    private m_cursorEnd: number = -1;

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
            return;
        }
        this.m_selectShapes.push(shape);
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_SHAPE);
        shape.notify(Selection.CHANGE_SHAPE);
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
        return this.m_selectShapes.indexOf(shape) >= 0;
    }

    get selectedShapes() {
        return this.m_selectShapes;
    }
}