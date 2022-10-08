import { Watchable } from "@/data/basic";
import { Page } from "@/data/page";
import { Shape } from "@/data/shape";

export class Selection extends Watchable {

    static CHANGE_PAGE = Watchable.genWId();
    static CHANGE_SHAPE = Watchable.genWId();

    private m_selectPage?: Page;
    private m_selectShape?: Shape;

    // todo
    private m_cursorStart: number = -1;
    private m_cursorEnd: number = -1;

    selectPage(p: Page | undefined) {
        if (this.m_selectPage === p) {
            return;
        }
        // reset others
        this.m_selectPage = p;
        this.m_selectShape = undefined;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_PAGE);
    }

    get selectedPage(): Page | undefined {
        return this.m_selectPage;
    }

    selectShape(shape: Shape | undefined) {
        // check?
        if (this.m_selectShape === shape) {
            return;
        }
        this.m_selectShape = shape;
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.notify(Selection.CHANGE_SHAPE);
        if (shape !== undefined) {
            shape.notify(Selection.CHANGE_SHAPE);
        }
    }

    get selectedShape() {
        return this.m_selectShape;
    }
}