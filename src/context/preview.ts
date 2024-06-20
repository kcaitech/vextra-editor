import { Matrix, PageView, Shape, ShapeType, ShapeView, WatchableObject } from "@kcdesign/data";
import { Context } from ".";
// import { router } from "@/router";
import { getFrameList } from "@/utils/preview";

export enum ScaleType {
    Actual = 0,
    FitScreen = 1,
    FitWidth  = 2,
    FillScreen = 3
}

export class Preview extends WatchableObject {
    static CHANGE_PAGE = 1;
    static CHANGE_SHAPE = 2;
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
    private m_selectPage?: PageView;
    private m_selectShape?: Shape;
    private m_doc_id: string = '';
    private m_scale: number = 1;
    private m_navi_visible: boolean = true;
    private m_menu_options: ScaleType | undefined = ScaleType.Actual;
    private m_visible_ui: boolean = true;
    private m_page_index: number = 0;
    private m_shape_index: number = 0;
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

    selectPage(p: PageView | undefined) {
        if (this.m_selectPage === p) {
            return;
        }
        this.m_selectPage = p;
        this.m_page_index = this.m_context.data.pagesList.findIndex(item => item.id === p?.id);
        this.notify(Preview.CHANGE_PAGE);
    }

    get pageIndex() {
        return this.m_page_index;
    }
    selectShape(s: Shape | undefined) {
        if (this.m_selectShape === s) {
            return;
        }
        this.m_selectShape = s;
        this.m_shape_index = getFrameList(this.selectedPage!).findIndex(item => item.id === s?.id);
        this.notify(Preview.CHANGE_SHAPE);
        // this.updateUrl();
    }
    get shapeIndex() {
        return this.m_shape_index;
    }

    get selectedPage(): PageView | undefined {
        return this.m_selectPage;
    }

    get selectedShape(): Shape | undefined {
        return this.m_selectShape;
    }

    isSelectedShape(shape: ShapeView | Shape | string) {
        const shapeId = typeof shape === 'string' ? shape : shape.id;
        const ret = shapeId === this.m_selectShape?.id
        return ret;
    }
    // updateUrl() {
    //     if (!this.selectedPage) return;
    //     const page_id = this.selectedPage.id;
    //     const query: any = {id: this.m_doc_id, page_id: page_id.slice(0, 8) }
    //     if(this.selectedShape) query.frame_id = this.selectedShape.id.slice(0, 8);
    //     router.replace({
    //         path: '/prototype',
    //         query: query,
    //     });
    // }

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