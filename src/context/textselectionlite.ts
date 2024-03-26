import { Text, SpanAttr, WatchableObject, TextShape, TextShapeView, TableCellView, TextAttr } from "@kcdesign/data";
import { Selection } from "./selection"

export interface TextLocate {
    index: number
    before: boolean
    placeholder: boolean
    attr: SpanAttr | undefined
}

export class TextSelectionLite extends WatchableObject {
    private m_cursorStart: number = -1;
    private m_cursorAtBefore: boolean = false;
    private m_cursorEnd: number = -1;
    private m_selection: Selection;
    private m_textAttr: TextAttr | undefined;

    constructor(selection: Selection) {
        super();
        // this.m_shape = textShape;
        this.m_selection = selection;
    }

    notify(...args: any[]): void {
        this.m_selection.notify(...args);
    }

    reset(shape?: TextShapeView | TableCellView) {
        this.m_cursorStart = -1;
        this.m_cursorEnd = -1;
        this.m_cursorAtBefore = false;
        this.notify(Selection.CHANGE_TEXT);
    }

    get shape() {
        return this.m_selection.focusTextShape;
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

    /**
     * @param x page坐标系
     * @param y
     */
    locateText(x: number, y: number): TextLocate {
        const shape = this.shape;

        if (shape) {
            // translate x,y
            const matrix = shape.matrix2Root();
            const xy = matrix.inverseCoord(x, y);
            x = xy.x;
            y = xy.y;
            return shape.locateText(x, y);
        }
        return { index: -1, before: false, placeholder: false, attr: undefined };
    }

    setCursor(index: number, before: boolean) {
        const shape = this.shape;
        if (!shape) return;
        if (index < 0) index = 0;
        const text = shape.getText();
        const span = text.spanAt(index);
        if (span?.placeholder && span.length === 1) index++;
        const length = text.length;
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
        const shape = this.shape;
        if (!shape) return;
        // 不只选择'\n'
        const text = shape.getText() as Text
        if (Math.abs(start - end) === 1 && text.charAt(Math.min(start, end)) === '\n') {
            if (end > start) {
                start++;
                end++;
            } else {
                start--;
                end--;
            }
        }
        const length = text.length;
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

    setTextAttr(attr: TextAttr) {
        this.m_textAttr = attr;
    }

    get getTextAttr () {
        return this.m_textAttr || new TextAttr();
    }
}