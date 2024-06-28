import { IWatchable, PageView, Shape, ShapeView } from "@kcdesign/data";

export namespace SelectionEvents {
    export const text_change = 'text_change'
    export const page_change = 'page_change'
    export const shape_change = 'shape_change'
    export const shape_hover_change = 'shape_hover_change'
}

export interface ITextSelection {
    get cursorStart(): number
    get cursorEnd(): number
    get cursorAtBefore(): boolean
}

export interface ISelection extends IWatchable {
    get textSelection(): ITextSelection
    get selectedShapes(): ShapeView[]
    get selectedPvShape(): Shape | undefined
    get selectedPage(): PageView | undefined
    get hoveredShape(): ShapeView | undefined

    selectPage(p: PageView | string): Promise<PageView | undefined>;
    selectShape(shape?: ShapeView | Shape): void;
}