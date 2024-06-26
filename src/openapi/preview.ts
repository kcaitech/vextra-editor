import { IWatchable, PageView, Shape } from "@kcdesign/data";

export namespace PreviewEvents {
    export const page_change = 'page_change'
    export const shape_change = 'shape_change'
}

export interface IPreview extends IWatchable {
    selectPage(p: PageView | undefined): void;
    selectShape(p: Shape | undefined): void;

    get selectedPage(): PageView | undefined;
    get selectedShape(): Shape | undefined;
}