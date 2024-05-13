import { Matrix, ShapeView, WatchableObject } from "@kcdesign/data";
import { Context } from "./index";
import { Root } from "@/utils/content";
import { Clipboard } from "@/utils/clipboard";
import { PageXY, XY } from "./selection";
import { Action } from "@/context/tool";
import { PointsOffset } from "@/utils/assist";

interface Point {
    x: number
    y: number
}

export enum CtrlElementType { // 控制元素类型
    RectLeft = 'rect-left',
    RectRight = 'rect-right',
    RectBottom = 'rect-bottom',
    RectTop = 'rect-top',
    RectLT = 'rect-left-top',
    RectRT = 'rect-right-top',
    RectRB = 'rect-right-bottom',
    RectLB = 'rect-left-bottom',
    RectLTR = 'rect-left-top-rotate',
    RectRTR = 'rect-right-top-rotate',
    RectRBR = 'rect-right-bottom-rotate',
    RectLBR = 'rect-left-bottom-rotate',
    LineStart = 'line-start',
    LineEnd = 'line-end',
    LineStartR = 'line-start-rotate',
    LineEndR = 'line-end-rotate',
    Text = 'text'
}

export enum Perm {
    isRead = 1, // 仅阅读
    isComment = 2, // 可评论
    isEdit = 3 // 可编辑
}

export class WorkSpace extends WatchableObject {
    static MATRIX_TRANSFORMATION = 1;
    static SELECTING = 2;
    static TEXT_FORMAT = 3;
    static TRANSLATING = 4;
    static CHECKSTATUS = 5;
    static SELECTION_VIEW_UPDATE = 6;
    static CTRL_DISAPPEAR = 7;
    static CTRL_APPEAR_IMMEDIATELY = 8;
    static CTRL_APPEAR = 9;
    static PASTE = 10;
    static PASTE_RIGHT = 11;
    static FREEZE = 12;
    static THAW = 13;
    static CLAC_ATTRI = 14;
    static COPY = 15;
    static HIDDEN_UI = 16;
    static INIT_DOC_NAME = 17;
    static ONARBOARD__TITLE_MENU = 18;
    static BOLD = 19;
    static UNDER_LINE = 20;
    static ITALIC = 21;
    static DELETE_LINE = 22;
    static INIT_EDITOR = 23;
    static CHANGE_NAVI = 24;
    static PRE_EDIT = 25;
    static PATH_EDIT_MODE = 26;
    static NEW_ENV_MATRIX_CHANGE = 27;
    static TABLE_TEXT_GRADIENT_UPDATE = 28;
    static ROOT_UPDATE = 29;

    private context: Context;
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
    private m_round: boolean = false;
    private m_font_name_list: { zh: string[], en: string[] } = { zh: [], en: [] };
    private m_page_svg_img: Map<string, any> = new Map();

    private m_root: Root = {
        init: false,
        x: 332,
        y: 30,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        element: undefined,
        center: { x: 0, y: 0 }
    };
    private m_document_perm: number = 3;
    private m_should_selection_view_update: boolean = true;
    private m_freeze: boolean = false;
    private m_clipboard: Clipboard;
    private m_t: Function = () => {
    };
    private m_controller_path: string = '';
    private m_controller_frame: Point[] = [];

    constructor(context: Context) {
        super();
        this.context = context;
        this.m_clipboard = new Clipboard(context);
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

    get root(): Root { //return contentView HTMLElement info
        const root = this.m_root; // 如果已经更新到最新状态就不用再去查找Dom了(在改变contentview的Dom结构后会进行root数据更新)；
        if (root.init) {
            return root;
        } else { // 如果未初始化，则查找一次，在contentView的一个生命周期内，只查找一次或零次Dom；
            let content: any = document.querySelectorAll('#content');
            content = Array.from(content).find(i => (i as HTMLElement)?.dataset?.area === this.m_rootId);
            if (content) {
                const { x, y, bottom, right } = content.getBoundingClientRect();
                root.center = { x: (right - x) / 2, y: (bottom - y) / 2 };
                root.x = x;
                root.y = y;
                root.bottom = bottom;
                root.right = right;
                root.element = content;
                root.init = true;
            }
            return root;
        }
    }

    get center_on_page(): PageXY {
        const { x, right, y, bottom } = this.root;
        return this.matrix.inverseCoord({ x: (right - x) / 2, y: (bottom - y) / 2 });
    }

    get pageView() {//return pageView HTMLElement
        const pageView: any = document.querySelector(`[data-area="${this.m_pageViewId}"]`);
        if (pageView) return pageView as Element;
    }

    get documentPerm() {
        return this.m_document_perm;
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

    private __cache_map: PointsOffset | undefined;

    get cache_map() {
        return this.__cache_map;
    }

    clear_cache_map() {
        this.__cache_map = undefined;
    }

    gen_chahe_map_by_shape_one(shape: ShapeView, frame: Point[]) {
        const anchor = shape.matrix2Root().computeCoord2(0, 0);
        const lt = frame[0];
        const rt = frame[1];
        const rb = frame[2];
        const lb = frame[3];
        const pivot = { x: (lt.x + rb.x) / 2, y: (lt.y + rb.y) / 2 };
        this.__cache_map = {
            lt: { x: lt.x - anchor.x, y: lt.y - anchor.y },
            rb: { x: rb.x - anchor.x, y: rb.y - anchor.y },
            pivot: { x: pivot.x - anchor.x, y: pivot.y - anchor.y },
            rt: { x: rt.x - anchor.x, y: rt.y - anchor.y },
            lb: { x: lb.x - anchor.x, y: lb.y - anchor.y }
        }
    }

    revert_frame_by_map(shape: ShapeView) {
        const achor = shape.matrix2Root().computeCoord2(0, 0);
        if (!this.__cache_map) return [];
        const map = this.__cache_map;
        this.m_controller_frame = [
            { x: map.lt.x + achor.x, y: map.lt.y + achor.y },
            { x: map.rt.x + achor.x, y: map.rt.y + achor.y },
            { x: map.rb.x + achor.x, y: map.rb.y + achor.y },
            { x: map.lb.x + achor.x, y: map.lb.y + achor.y },
        ]
    }

    get controllerFrame() {
        return this.m_controller_frame;
    }

    setCFrame(v: Point[]) {
        this.m_controller_frame = v;
    }

    focusText() {
        this.notify(WorkSpace.TEXT_FORMAT)
    }

    downArboardTitle(ev: MouseEvent) {
        this.notify(WorkSpace.ONARBOARD__TITLE_MENU, ev)
    }

    setDocumentPerm(perm: number) {
        this.m_document_perm = perm;
    }

    get clipboard() {
        return this.m_clipboard;
    }

    t(content: string) {
        return this.m_t.call(this, content);
    }

    init(t: Function) {
        this.m_t = t;
    }

    setFreezeStatus(isFreeze: boolean) {
        this.m_freeze = isFreeze;
        this.notify(isFreeze ? WorkSpace.FREEZE : WorkSpace.THAW);
    }

    selectionViewUpdate() {
        this.notify(WorkSpace.SELECTION_VIEW_UPDATE);
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
            && this.m_document_perm === Perm.isEdit
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

    get isRoundMode() {
        return this.m_round;
    }

    setRoundMode(v: boolean) {
        this.m_round = v;
    }

    setFontNameListZh(zh: string[]) {
        this.m_font_name_list.zh = zh;
    }

    setFontNameListEn(en: string[]) {
        this.m_font_name_list.en = en;
    }

    get fontNameList() {
        return this.m_font_name_list;
    }

    setPageImg(id: string, value: any) {
        this.m_page_svg_img.set(id, value);
    }

    getSvgImgInfo(id: string) {
        return this.m_page_svg_img.get(id);
    }
}