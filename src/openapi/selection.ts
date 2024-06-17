import { PageView, ShapeView } from "@kcdesign/data";

export interface ITextSelection {
    get cursorStart(): number
    get cursorEnd(): number
    get cursorAtBefore(): boolean
}

export interface ISelection {
    get selectedShapes(): ShapeView[]
    get selectedPage(): PageView | undefined
}