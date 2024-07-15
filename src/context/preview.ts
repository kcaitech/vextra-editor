import { Matrix, PageView, Shape, ShapeType, ShapeView, WatchableObject } from "@kcdesign/data";
import { Context } from ".";
// import { router } from "@/router";
import { getFrameList } from "@/utils/preview";

export enum ScaleType {
    Actual = 'Actual',
    FitScreen = 'fit_screen',
    FitWidth  = 'fit_width',
    FillScreen = 'fill_screen'
}

export class Preview extends WatchableObject {
    static MATRIX_SCALE = 3;
    static MENU_CHANGE = 4;
    static NAVI_VISIBLE = 5;
    static UI_CHANGE = 6;
    static MENU_VISIBLE = 7;
    static NEXT_PAGE = 8;
    static BEFORE_PAGE = 9;
    static NAVI_CHANGE = 10;
    static SCALE_CHANGE = 11;

    private m_context: Context;
    private m_preview_window: Window | undefined;
    private m_doc_id: string = '';
    private m_scale: number = 1;
    private m_navi_visible: boolean = true;
    private m_menu_options: ScaleType | undefined = ScaleType.Actual;
    private m_visible_ui: boolean = true;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    setPreviewWindow(window: Window | undefined) {
        this.m_preview_window = window;
    }

    get scale() {
        return this.m_scale;
    }

    setScale(scale: number) {
        this.m_scale = scale;
        this.notify(Preview.MATRIX_SCALE);
    }

    get previewWindow() {
        return this.m_preview_window;
    }

    setDocInfoId(id: string) {
        this.m_doc_id = id;
    }

    get pageIndex() {
        const page = this.m_context.selection.selectedPage;
        const index = this.m_context.data.pagesList.findIndex(item => item.id === page?.id);
        return index;
    }
    get shapeIndex() {
        const page = this.m_context.selection.selectedPage;
        const shape = this.m_context.selection.selectedShapes[0];
        return getFrameList(page!).findIndex(item => item.id === shape?.id);

    }

    isSelectedShape(shape: ShapeView | Shape | string) {
        const shapeId = typeof shape === 'string' ? shape : shape.id;
        return shapeId === this.m_context.selection.selectedShapes[0]?.id
    }

    setScaleMenu(type: ScaleType | undefined) {
        this.m_menu_options = type;
        this.notify(Preview.MENU_CHANGE);
    }

    get scaleType() {
        return this.m_menu_options;
    }

    showNavi(visible: boolean) {
        this.m_navi_visible = visible;
        this.notify(Preview.NAVI_VISIBLE);
    }

    get naviState() {
        return this.m_navi_visible;
    }

    showUiVisible(visible: boolean) {
        this.m_visible_ui = visible;
        this.notify(Preview.UI_CHANGE);
    }

    get uiState() {
        return this.m_visible_ui;
    }
}