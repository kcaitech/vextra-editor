import { PageView, Shape, ShapeType, ShapeView, WatchableObject } from "@kcdesign/data";
import { Context } from ".";
import { router } from "@/router";

export class Preview extends WatchableObject {
    static CHANGE_PAGE = 1;
    static CHANGE_SHAPE = 2;

    private m_context: Context;
    private m_preview_window: Window | undefined;
    private m_selectPage?: PageView;
    private m_selectShape?: ShapeView;
    private m_doc_id: string = '';
    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    setPreviewWindow(window: Window | undefined) {
        this.m_preview_window = window;
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
        this.notify(Preview.CHANGE_PAGE);
        this.updateUrl();
    }
    selectShape(s: ShapeView | undefined) {
        if (this.m_selectShape === s) {
            return;
        }
        this.m_selectShape = s;
        this.notify(Preview.CHANGE_SHAPE);
        this.updateUrl();
    }

    get selectedPage(): PageView | undefined {
        return this.m_selectPage;
    }

    get selectedShape(): ShapeView | undefined {
        return this.m_selectShape;
    }

    isSelectedShape(shape: ShapeView | Shape | string) {
        const shapeId = typeof shape === 'string' ? shape : shape.id;
        const ret = shapeId === this.m_selectShape?.id
        return ret;
    }
    updateUrl() {
        if (!this.selectedPage || !this.selectedShape) return;
        const page_id = this.selectedPage.id;
        const shape_id = this.selectedShape.id;

        router.replace({
            path: '/prototype',
            query: { id: this.m_doc_id, page_id: page_id.slice(0, 8), frame_id: shape_id.slice(0, 8) },
        });
    }
}