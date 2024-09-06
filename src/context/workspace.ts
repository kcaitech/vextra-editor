import { Matrix, WatchableObject } from "@kcdesign/data";
import { Context } from "./index";
import { Clipboard } from "@/utils/clipboard";
import { PageXY, XY } from "./selection";
import { Action } from "@/context/tool";
import { IWorkspace, WorkspaceEvents } from "@/openapi/workspace";
import { is_mac } from "@/utils/common";

export interface Root {
    init: boolean
    x: number
    y: number
    bottom: number
    right: number
    width: number
    height: number
    element: any
    center: { x: number, y: number }
}

export class WorkSpace extends WatchableObject implements IWorkspace {
    readonly m_clipboard: Clipboard;
    readonly context: Context;

    static MATRIX_TRANSFORMATION = WorkspaceEvents.transform_change;
    static SELECTING = 2;
    static TEXT_FORMAT = 3;
    static TRANSLATING = 4;
    static CHECKSTATUS = 5;
    static SELECTION_VIEW_UPDATE = 6;
    static PASTE_RIGHT = 7;
    static CLAC_ATTRI = 10;
    static HIDDEN_UI = 11;
    static INIT_DOC_NAME = 12;
    static ONARBOARD__TITLE_MENU = 13;
    static BOLD = 14;
    static UNDER_LINE = 15;
    static ITALIC = 16;
    static DELETE_LINE = 17;
    static INIT_EDITOR = 18;
    static CHANGE_NAVI = 19;
    static PRE_EDIT = 20;
    static PATH_EDIT_MODE = 21;
    static NEW_ENV_MATRIX_CHANGE = 22;
    static TABLE_TEXT_GRADIENT_UPDATE = 23;
    static ROOT_UPDATE = 24;

    private m_matrix: Matrix = new Matrix();
    private m_scaling: boolean = false; // 编辑器是否正在缩放图形
    private m_rotating: boolean = false; // 编辑器是否正在旋转图形
    private m_translating: boolean = false; // 编辑器是否正在移动图形
    private m_creating: boolean = false; // 编辑器是否正在创建图形
    private m_selecting: boolean = false; // 编辑器是否正在选择图形
    private m_setting: boolean = false; // 是否正在设置属性
    private m_page_dragging: boolean = false; // 编辑器正在拖动页面
    private m_content_editing: boolean = false; // 编辑器正在内容编辑
    private m_path_edit_mode: boolean = false;
    private m_rootId: string = 'content';
    private m_pageViewId: string = 'pageview';
    private m_pre_to_translating: boolean = false;
    private m_mousedown_on_page: MouseEvent | undefined;
    private m_controller: 'page' | 'controller' = 'page';
    private m_font_name_list: { zh: Set<string>, en: Set<string>, local: Set<string>, failure_local: Set<string> } = { zh: new Set(), en: new Set(), local: new Set(), failure_local: new Set()};
    private m_should_selection_view_update: boolean = true;
    private m_controller_path: string = '';
    private m_root: Root = {
        init: false,
        x: 250,
        y: 46,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        element: undefined,
        center: { x: 0, y: 0 }
    };
    private m_client_sys: 'mac' | 'windows';

    constructor(context: Context) {
        super();
        this.context = context;
        this.m_clipboard = new Clipboard(context);
        this.m_client_sys = is_mac() ? 'mac' : 'windows';
    }

    get curScale(): number {
        return this.matrix.m00;
    }

    translate(x: number, y: number): void {
        this.m_matrix.trans(x, y);
        this.notify(WorkSpace.MATRIX_TRANSFORMATION)
    }

    scale(ratio: number): void {
        this.m_matrix.scale(ratio, ratio);
        this.notify(WorkSpace.MATRIX_TRANSFORMATION)
    }

    doc2view(point: { x: number; y: number; }): { x: number; y: number; };
    doc2view(x: number, y: number): { x: number; y: number; };
    doc2view(x: number | { x: number, y: number }, y?: number): { x: number; y: number; } {
        if (typeof x === 'number') return this.m_matrix.computeCoord(x, y!);
        return this.m_matrix.computeCoord(x)
    }

    view2doc(point: { x: number; y: number; }): { x: number; y: number; };
    view2doc(x: number, y: number): { x: number; y: number; };
    view2doc(x: number | { x: number, y: number }, y?: number): { x: number; y: number; } {
        if (typeof x === 'number') return this.m_matrix.inverseCoord(x, y!);
        return this.m_matrix.inverseCoord(x)
    }

    private m_element: HTMLElement | undefined;

    get element(): HTMLElement | undefined {
        if (this.m_element) return this.m_element;
        const content: NodeListOf<HTMLElement> = document.querySelectorAll('#content');
        this.m_element = Array.from(content).find(i => (i as HTMLElement)?.dataset?.area === this.m_rootId);
        return this.m_element;
    }

    get is_path_edit_mode() {
        return this.m_path_edit_mode;
    }

    setPathEditMode(v: boolean) {
        this.m_path_edit_mode = v;
        this.notify(WorkSpace.PATH_EDIT_MODE);
    }

    get matrix() {
        return this.m_matrix;
    }

    get root(): Root {
        const root = this.m_root;
        if (!root.init && this.element) {
            const { x, y, bottom, right } = this.element.getBoundingClientRect();
            root.center = { x: (right - x) / 2, y: (bottom - y) / 2 };
            root.x = x;
            root.y = y;
            root.bottom = bottom;
            root.right = right;
            root.element = this.element;
            root.init = true;
        }
        return root;
    }

    get center_on_page(): PageXY {
        const { x, right, y, bottom } = this.root;
        return this.matrix.inverseCoord({ x: (right - x) / 2, y: (bottom - y) / 2 });
    }

    get pageView() {
        const pageView: any = document.querySelector(`[data-area="${this.m_pageViewId}"]`);
        if (pageView) return pageView as Element;
    }

    get isPreToTranslating() {
        return this.m_pre_to_translating;
    }

    get startPoint() {
        return this.m_mousedown_on_page;
    }

    get transforming() {
        return this.m_scaling || this.m_rotating || this.m_translating || this.m_creating || this.m_setting;
    }

    get select() {
        return this.m_selecting;
    }

    get isTranslating() {
        return this.m_translating;
    }

    get controller() {
        return this.m_controller;
    }

    get isPageDragging() {
        return this.m_page_dragging;
    }

    get isEditing() {
        return this.m_content_editing || this.m_path_edit_mode;
    }

    get shouldSelectionViewUpdate() {
        return this.m_should_selection_view_update;
    }

    get ctrlPath() {
        return this.m_controller_path;
    }

    setCtrlPath(val: string) {
        this.m_controller_path = val;
    }

    focusText() {
        this.notify(WorkSpace.TEXT_FORMAT)
    }

    downArtboardTitle(ev: MouseEvent) {
        this.notify(WorkSpace.ONARBOARD__TITLE_MENU, ev)
    }

    get clipboard() {
        return this.m_clipboard;
    }

    private m_t: Function = () => {
    };

    t(content: string) {
        return this.m_t.call(this, content);
    }

    init(t: Function) {
        this.m_t = t;
    }

    setSelectionViewUpdater(isWork: boolean) {
        this.m_should_selection_view_update = isWork;
        if (isWork) {
            this.notify(WorkSpace.SELECTION_VIEW_UPDATE);
        }
    }

    updateRoot(root: Root) {
        this.m_root = root;
        this.notify(WorkSpace.ROOT_UPDATE);
    }

    contentEdit(v: boolean) {
        this.m_content_editing = v;
        this.notify(WorkSpace.PRE_EDIT);
    }

    pageDragging(v: boolean) {
        this.m_page_dragging = v;
        this.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }

    setCtrl(v: 'page' | 'controller') {
        this.m_controller = v;
    }

    preToTranslating(from: MouseEvent | false) {
        if (from) {
            this.m_pre_to_translating = true;
            this.m_mousedown_on_page = from;
            this.notify(WorkSpace.CHECKSTATUS);
        } else {
            this.m_pre_to_translating = false;
            this.m_mousedown_on_page = undefined;
        }
    }

    setRootId(id: string) {
        this.m_rootId = id;
    }

    setPageViewId(id: string) {
        this.m_pageViewId = id
    }

    scaling(v: boolean) {
        this.m_scaling = v;
    }

    rotating(v: boolean) {
        this.m_rotating = v;
    }

    translating(v: boolean) {
        this.m_translating = v;
        this.notify(WorkSpace.TRANSLATING)
    }

    creating(v: boolean) {
        this.m_creating = v;
    }

    selecting(v: boolean) {
        this.m_selecting = v;
        this.notify(WorkSpace.SELECTING);
    }

    setting(v: boolean) {
        this.m_setting = v;
    }

    can_translate(e: MouseEvent) {
        const shapes = this.context.selection.selectedShapes;
        const action = this.context.tool.action;
        return e.button === 0
            && shapes.length > 0
            && (action === Action.AutoV || action === Action.AutoK)
            && !this.context.tool.isLable
            && !this.isEditing;
    }

    getContentXY(e: MouseEvent): XY {
        return { x: e.clientX - this.root.x, y: e.clientY - this.root.y };
    }

    getRootXY(e: MouseEvent): XY {
        const m = new Matrix(this.m_matrix.inverse);
        return m.computeCoord2(e.clientX - this.root.x, e.clientY - this.root.y);
    }

    setFontNameListZh(zh: string) {
        this.m_font_name_list.zh.add(zh);
    }

    setFontNameListEn(en: string) {
        this.m_font_name_list.en.add(en);
    }

    setFontNameListLocal(local: string[]) {
        local.forEach(v => this.m_font_name_list.local.add(v));
    }
    setFontNameListFailureLocal(local: string[]) {
        local.forEach(v => this.m_font_name_list.failure_local.add(v));
    }

    get fontNameList() {
        return this.m_font_name_list;
    }
}