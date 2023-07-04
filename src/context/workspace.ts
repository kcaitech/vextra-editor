import { Shape, Watchable } from "@kcdesign/data";
import { ShapeType } from "@kcdesign/data";
import { Matrix } from '@kcdesign/data';
import { Context } from "./index";
import { Root } from "@/utils/content";
import { UserInfo, DocInfo } from '@/context/user'
import { Clipboard } from "@/utils/clipaboard";
import { adapt_page } from "@/utils/content";
export enum Action {
    Auto = 'auto',
    AutoV = 'cursor',
    AutoK = 'scale',
    AddRect = 'add-rect',
    AddLine = 'add-line',
    AddEllipse = 'add-ellipse',
    AddArrow = 'add-arrow',
    AddFrame = 'add-frame',
    AddText = 'add-text',
    AddComment = 'add-comment',
    AddImage = 'add-image'
}
export enum KeyboardKeys { // 键盘按键类型
    Space = 'Space',
    A = 'KeyA',
    R = 'KeyR',
    V = 'KeyV',
    L = 'KeyL',
    Z = 'KeyZ',
    Up = 'ArrowUp',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Right = 'ArrowRight',
    K = 'KeyK',
    O = 'KeyO',
    F = 'KeyF',
    Digit0 = 'Digit0',
    G = 'KeyG',
    T = 'KeyT',
    C = 'KeyC',
    Digit1 = 'Digit1',
    Backspace = 'Backspace'
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
export interface Media {
    name: string
    frame: { width: number, height: number }
    buff: Uint8Array
    base64: string
}
const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard],
    [Action.AddText, ShapeType.Text],
    [Action.AddImage, ShapeType.Image]
]);
export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型
export class WorkSpace extends Watchable(Object) {
    static P_ESC_EVENT: any = null; // 用于存储esc事件的指针
    static INSERT_FRAME = 1; // notify类型：插入容器模版、更新光标、重置光标、矩阵变换
    static CURSOR_CHANGE = 2;
    static RESET_CURSOR = 3;
    static MATRIX_TRANSFORMATION = 4;
    static SELECTING = 5;
    static SHUTDOWN_MENU = 6;
    static SHUTDOWN_POPOVER = 7;
    static TRANSLATING = 8;
    static CHECKSTATUS = 9;
    static GROUP = 10;
    static UNGROUP = 11;
    static SELECTION_VIEW_UPDATE = 12;
    static REMOVE_COLOR_PICKER = 13;
    static START_SAVE = 14;
    static END_SAVE = 15;
    static DOCUMENT_SAVE = 16;
    static SHUTDOWN_COMMENT = 17;
    static SELECT_LIST_TAB = 18;
    static SEND_COMMENT = 19;
    static EDIT_COMMENT = 20;
    static HOVER_COMMENT = 21;
    static COMMENT_POPUP = 22;
    static UPDATE_COMMENT = 23;
    static OPACITY_COMMENT = 24;
    static CURRENT_COMMENT = 25;
    static SELECTE_COMMENT = 26;
    static CTRL_DISAPPEAR = 27;
    static CTRL_APPEAR_IMMEDIATELY = 28;
    static CTRL_APPEAR = 29;
    static PASTE = 30;
    static PASTE_RIGHT = 31;
    static INSERT_IMGS = 32;
    static FREEZE = 33;
    static THAW = 34;
    static UPDATE_PAGE_COMMENT = 35;
    static CLAC_ATTRI = 37;
    static COPY = 38;
    static COMMENT_ALL = 39;
    static UPDATE_COMMENT_POS = 40;
    static SHOW_COMMENT_POPUP = 41;
    static COMMENT_HANDLE_INPUT = 42;
    static VISIBLE_COMMENT = 43;
    static TOGGLE_COMMENT_PAGE = 44;
    static HOVER_SHOW_COMMENT = 45;
    static UPDATE_COMMENT_CHILD = 46;
    static HIDDEN_UI = 47;
    static INIT_DOC_NAME = 48;
    private context: Context;
    private m_current_action: Action = Action.AutoV; // 当前编辑器状态，将影响新增图形的类型、编辑器光标的类型
    private m_matrix: Matrix = new Matrix();
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 }; // 容器模版frame
    private m_scaling: boolean = false; // 编辑器是否正在缩放图形
    private m_rotating: boolean = false; // 编辑器是否正在旋转图形
    private m_translating: boolean = false; // 编辑器是否正在移动图形
    private m_creating: boolean = false; // 编辑器是否正在创建图形
    private m_selecting: boolean = false; // 编辑器是否正在选择图形
    private m_setting: boolean = false; // 是否正在设置属性
    private m_page_dragging: boolean = false; // 编辑器正在拖动页面
    private m_content_editing: boolean = false; // 编辑器正在内容编辑
    private m_menu_mount: boolean = false;
    private m_popover: boolean = false;
    private m_rootId: string = 'content';
    private m_pageViewId: string = 'pageview';
    private m_pre_to_translating: boolean = false;
    private m_mousedown_on_page: MouseEvent | undefined;
    private m_controller: 'page' | 'controller' = 'page';
    private m_root: Root = { init: false, x: 332, y: 30, bottom: 0, right: 0, width: 0, height: 0, element: undefined, center: { x: 0, y: 0 } };
    private m_user_info: UserInfo | undefined;
    private m_document_perm: number = 3;
    private m_comment_input: boolean = false;
    private m_tool_group: SVGAElement | undefined;
    private m_should_selection_view_update: boolean = true;
    private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
    private m_document_info: DocInfo | undefined;
    private m_comment_list: any[] = []; // 当前文档评论
    private m_page_comment_list: any[] = []; // 当前页面评论
    private m_comment_move: boolean = false; //是否拖动评论，解决hove评论拖动时的闪烁问题
    private m_hove_commetn: boolean = false; //是否hover评论
    private m_comment_mount: boolean = false;//评论弹层的显示
    private m_comment_opacity: boolean = false;//评论弹层显示时其他评论置灰
    private m_hover_comment_id: string | undefined; //hover中的评论id
    private m_select_comment_id: string | undefined; //选中的评论id
    private m_image: Media[] | undefined = undefined;
    private m_freeze: boolean = false;
    private m_shape_comment: boolean = false; //是否在编辑shape上的评论（移动shape修改评论位置）
    private m_comment_shape: Shape[] = [] //保存移动shape上有评论的shape
    private m_not2tree_comment: any = [] //没有转树的评论列表
    private m_clipboard: Clipboard;
    private m_comment_visible: boolean = true; //是否显示评论
    private m_t: Function = () => { };
    constructor(context: Context) {
        super();
        this.context = context;
        this.m_clipboard = new Clipboard(context);
    }
    get matrix() {
        return this.m_matrix;
    }
    get root(): Root { //return contentView HTMLElement info
        const root = this.m_root; // 如果已经更新到最新状态就不用再去查找Dom了(在改变contentview的Dom结构0.6s后会进行root数据更新)；
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
    get pageView() {//return pageView HTMLElement
        const pageView: any = document.querySelector(`[data-area="${this.m_pageViewId}"]`);
        if (pageView) {
            return pageView as Element;
        }
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
    get action() {
        return this.m_current_action;
    }
    get frameSize() {
        return this.m_frame_size;
    }
    get transforming() {
        return this.m_scaling || this.m_rotating || this.m_translating || this.m_creating || this.m_setting;
    }
    get select() {
        return this.m_selecting;
    }
    get isMenuMount() {
        return this.m_menu_mount;
    }
    get ispopover() {
        return this.m_popover;
    }
    get isColorPickerMount() {
        return this.m_color_picker;
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
    get isUserInfo() {
        return this.m_user_info;
    }
    get isEditing() {
        return this.m_content_editing;
    }
    get isCommentInput() {
        return this.m_comment_input;
    }
    get toolGroup() {
        return this.m_tool_group;
    }
    get shouldSelectionViewUpdate() {
        return this.m_should_selection_view_update;
    }
    get commentList() {
        return this.m_comment_list;
    }
    get isCommentMove() {
        return this.m_comment_move;
    }
    get isHoverComment() {
        return this.m_hove_commetn;
    }
    get isCommentMount() {
        return this.m_comment_mount;
    }
    get pageCommentList() {
        return this.m_page_comment_list;
    }
    get isCommentOpacity() {
        return this.m_comment_opacity;
    }
    get isHoverCommentId() {
        return this.m_hover_comment_id;
    }
    get isSelectCommentId() {
        return this.m_select_comment_id;
    }
    get isFreeze() {
        return this.m_freeze;
    }
    get isEditShapeComment() {
        return this.m_shape_comment;
    }
    get commentShape() {
        return this.m_comment_shape;
    }
    get not2treeComment() {
        return this.m_not2tree_comment;
    }
    get isDocumentInfo() {
        return this.m_document_info;
    }
    get isVisibleComment() {
        return this.m_comment_visible;
    }
    setDocumentPerm(perm: number) {
        this.m_document_perm = perm;
    }
    showCommentPopup(index: number, e: MouseEvent) {
        this.notify(WorkSpace.SHOW_COMMENT_POPUP, index, e);
    }
    get clipboard() {
        return this.m_clipboard;
    }
    t(content: string) {
        return this.m_t(content);
    }
    init(t: Function) {
        this.m_t = t;
    }
    setFreezeStatus(isFreeze: boolean) {
        this.m_freeze = isFreeze;
        this.notify(isFreeze ? WorkSpace.FREEZE : WorkSpace.THAW);
    }
    setImage(files: Media[]) {
        this.m_image = [...files];
        this.notify(WorkSpace.INSERT_IMGS);
    }
    getImageFromDoc() {
        return this.m_image;
    }
    setDocumentInfo(info: DocInfo) {
        this.m_document_info = info
    }
    setUserInfo(info: UserInfo) {
        this.m_user_info = info
    }
    colorPickerSetup(id: string) {
        this.m_color_picker = id;
    }
    removeColorPicker() {
        if (this.m_color_picker) {
            this.notify(WorkSpace.REMOVE_COLOR_PICKER);
            this.m_color_picker = undefined;
        }
    }
    selectionViewUpdate() {
        this.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    }
    setSelectionViewUpdater(isWork: boolean) {
        this.m_should_selection_view_update = isWork;
    }
    toolGroupMount(toolGroupMount: SVGAElement) {
        this.m_tool_group = toolGroupMount;
    }
    toolGroupUnmount() {
        this.m_tool_group = undefined;
    }
    updateRoot(root: Root) {
        this.m_root = root;
    }
    contentEdit(v: boolean) {
        this.m_content_editing = v;
    }
    pageDragging(v: boolean) {
        this.m_page_dragging = v;
    }
    commentMove(v: boolean) {
        this.m_comment_move = v
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
    menuMount(mount: boolean) {
        this.m_menu_mount = mount;
        if (!mount) {
            this.notify(WorkSpace.SHUTDOWN_MENU);
        }
    }
    setVisibleComment(visible: boolean) {
        this.m_comment_visible = visible;
        this.notify(WorkSpace.VISIBLE_COMMENT)
    }
    setCommentList(list: any[]) {
        this.m_comment_list = list;
        this.notify(WorkSpace.UPDATE_COMMENT);
    }
    updateCommentList(pageId: string) {
        const list = this.m_comment_list;
        this.m_page_comment_list = list.filter(item => item.page_id === pageId)
    }
    setPageCommentList(list: any[], pageId: string) {
        this.m_page_comment_list = list.filter(item => item.page_id === pageId)
        this.notify(WorkSpace.UPDATE_PAGE_COMMENT);
    }
    commentInput(visible: boolean) {
        this.m_comment_input = visible;
        if (!visible) {
            this.notify(WorkSpace.SHUTDOWN_COMMENT)
        }
    }
    commentMount(visible: boolean) {
        this.m_comment_mount = visible;
        if (!visible) {
            this.notify(WorkSpace.COMMENT_POPUP)
        }
    }
    commentOpacity(status: boolean) { //点击后改变其他评论的透明度
        this.m_comment_opacity = status
        this.notify(WorkSpace.OPACITY_COMMENT)
    }
    saveCommentId(id: string) { //保存点击的评论id
        this.m_select_comment_id = id
        this.notify(WorkSpace.SELECTE_COMMENT)
    }
    editShapeComment(state: boolean, shapes?: Shape[]) {
        this.m_shape_comment = state
        if (state) {
            this.m_comment_shape.push(...shapes!)
            this.m_comment_shape = Array.from(new Set(this.m_comment_shape));
        } else {
            this.m_comment_shape = []
        }
    }
    setNot2TreeComment(list: any[]) {
        this.m_not2tree_comment = list
        this.notify(WorkSpace.COMMENT_ALL)
    }
    popoverVisible(visible: boolean) {
        this.m_popover = visible;
        if (!visible) {
            this.notify(WorkSpace.SHUTDOWN_POPOVER);
        }
    }
    setRootId(id: string) {
        this.m_rootId = id;
    }
    setPageViewId(id: string) {
        this.m_pageViewId = id
    }
    /**
     * 编辑器键盘事件，支持工具快捷键、视图快捷键、选区快捷键 的实现
     * @param {KeyboardEvent} event 
     */
    keyboardHandle(event: KeyboardEvent) {
        const { ctrlKey, shiftKey, metaKey, altKey, target } = event;
        if (this.isFreeze) return;
        if (event.code === KeyboardKeys.A) {
            this.keydown_a(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.R) {
            if (!metaKey && !ctrlKey) {
                event.preventDefault();
                this.keydown_r();
            }
        } else if (event.code === KeyboardKeys.V) {
            event.preventDefault();
            this.keydown_v(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.L) {
            event.preventDefault();
            this.keydown_l(shiftKey);
        } else if (event.code === KeyboardKeys.Z) {
            event.preventDefault();
            this.keydown_z(this.context, ctrlKey, shiftKey, metaKey);
        } else if (event.code === KeyboardKeys.K) {
            event.preventDefault();
            this.keydown_k(ctrlKey, shiftKey);
        } else if (event.code === KeyboardKeys.O) {
            event.preventDefault();
            this.keydown_o(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.F) {
            event.preventDefault();
            this.keydown_f();
        } else if (event.code === KeyboardKeys.Digit0) {
            event.preventDefault();
            this.keydown_0(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.G) {
            event.preventDefault();
            this.keydown_g(ctrlKey, metaKey, shiftKey, altKey);
        } else if (event.code === KeyboardKeys.T) {
            event.preventDefault();
            this.keydown_t();
        } else if (event.code === KeyboardKeys.C) {
            event.preventDefault();
            this.keydown_c(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.Digit1) {
            event.preventDefault();
            if (ctrlKey || metaKey) {
                adapt_page(this.context);
            }
        }
    }
    matrixTransformation() { // 页面坐标系发生变化
        this.notify(WorkSpace.MATRIX_TRANSFORMATION);
    }
    setAction(action: Action) {
        if (action === Action.AutoV && WorkSpace.P_ESC_EVENT) {
            document.removeEventListener('keydown', WorkSpace.P_ESC_EVENT);
        } else {
            this.escSetup()
        }
        this.m_current_action = action;
        this.notify();
    }
    // 存入剪切板
    setClipBoard(v: ClipboardItem[]) {
        this.m_clip_board = v;
    }
    setFrameSize(size: { width: number, height: number }) {
        this.m_frame_size = size
        this.notify(WorkSpace.INSERT_FRAME);
    }
    setFrame(size: { width: number, height: number }) {
        this.m_frame_size = size
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
    // keyboard
    keydown_a(ctrlKey: boolean, metaKey: boolean) {
        if (ctrlKey || metaKey) {
            const selection = this.context.selection;
            if (selection.selectedShapes.length) {
                const p_map = new Map();
                selection.selectedShapes.forEach(s => {
                    if (s.parent) {
                        p_map.set(s.parent.id, s.parent);
                    }
                })
                if (p_map.size > 1) {
                    const page = selection.selectedPage;
                    if (page) {
                        selection.rangeSelectShape(page.childs);
                    }
                } else {
                    const childs = Array.from(p_map.values())[0].childs;
                    selection.rangeSelectShape(childs);
                }
            } else {
                const page = selection.selectedPage;
                if (page) {
                    selection.rangeSelectShape(page.childs);
                }
            }
        }
    }
    keydown_r() {
        this.escSetup();
        this.m_current_action = Action.AddRect;
        this.notify();
    }
    keydown_v(ctrlKey: boolean, metaKey: boolean) {
        if (ctrlKey || metaKey) {
            this.notify(WorkSpace.PASTE);
        } else {
            this.m_current_action = Action.AutoV;
            this.notify();
        }
    }
    keydown_l(shiftKey: boolean) {
        if (shiftKey) return; // 暂时停止使用箭头图形
        this.escSetup();
        this.m_current_action = shiftKey ? Action.AddArrow : Action.AddLine;
        this.notify();
    }
    keydown_z(context: Context, ctrl?: boolean, shift?: boolean, meta?: boolean) {
        const repo = context.repo;
        if ((ctrl || meta) && !shift) {
            repo.canUndo() && repo.undo();
            const selection = context.selection;
            const shapes = context.selection.selectedShapes;
            const page = context.selection.selectedPage;
            if (page) {
                const flat = page.shapes;
                if (shapes.length) {
                    for (let i = 0; i < shapes.length; i++) {
                        const item = shapes[i];
                        if (!flat.get(item.id)) {
                            selection.unSelectShape(item);
                        }
                    }
                }
            }
            if (this.context.selection.selectedShapes.length > 1) {
                this.notify(WorkSpace.CLAC_ATTRI);
            }
        } else if ((ctrl || meta) && shift) {
            repo.canRedo() && repo.redo();
            if (this.context.selection.selectedShapes.length > 1) {
                this.notify(WorkSpace.CLAC_ATTRI);
            }
        }
    }
    keydown_k(ctrl: boolean, shift: boolean) {
        if (!ctrl && !shift) {
            this.escSetup();
            this.m_current_action = Action.AutoK;
            this.notify();
        }
    }
    keydown_o(ctrl: boolean, meta: boolean) {
        if (!ctrl && !meta) {
            this.escSetup();
            this.m_current_action = Action.AddEllipse;
            this.notify();
        }
    }
    keydown_f() {
        this.escSetup();
        this.m_current_action = Action.AddFrame;
        this.notify();
    }
    keydown_t() {
        this.escSetup();
        this.m_current_action = Action.AddText;
        this.notify();
    }
    keydown_c(ctrlKey?: boolean, metaKey?: boolean) {
        if (ctrlKey || metaKey) {
            this.notify(WorkSpace.COPY)
        } else {
            if (this.documentPerm === 1) return
            this.escSetup();
            this.m_current_action = Action.AddComment;
            this.commentInput(false);
            this.notify(WorkSpace.SELECT_LIST_TAB);
        }
    }
    keydown_0(ctrl: boolean, meta: boolean) {
        if (ctrl || meta) {
            const { center } = this.root;
            this.m_matrix.trans(-center.x, -center.y);
            const _s = 1 / this.m_matrix.m00;
            this.m_matrix.scale(_s);
            this.m_matrix.trans(center.x, center.y);
            this.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
    keydown_g(ctrl: boolean, meta: boolean, shift: boolean, alt: boolean) {
        if ((ctrl || meta) && !shift) { // 编组
            if (alt) {
                this.notify(WorkSpace.GROUP, alt);
            } else {
                this.notify(WorkSpace.GROUP);
            }
        } else if ((ctrl || meta) && shift) {
            this.notify(WorkSpace.UNGROUP);
        }
    }

    escSetup() { // 安装取消当前状态的键盘事件(Esc)，在开启一个状态的时候应该考虑关闭状态的处理！
        if (WorkSpace.P_ESC_EVENT) {
            document.removeEventListener('keydown', WorkSpace.P_ESC_EVENT);
        }
        WorkSpace.P_ESC_EVENT = this.esc.bind(this);
        document.addEventListener('keydown', WorkSpace.P_ESC_EVENT);
    }
    esc(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.setAction(Action.AutoV);
            document.removeEventListener('keydown', WorkSpace.P_ESC_EVENT);
            WorkSpace.P_ESC_EVENT = null;
        }
    }
    setCursorStyle(type: CtrlElementType | string, deg: number) {
        if (this.m_creating || this.m_selecting || this.m_scaling) {
            // todo
        } else {
            let name = 'auto-0';
            if (type == CtrlElementType.RectRBR) {
                name = `rotate-${0 + deg}`;
            } else if (type == CtrlElementType.RectLBR) {
                name = `rotate-${90 + deg}`;
            } else if (type == CtrlElementType.RectLTR) {
                name = `rotate-${180 + deg}`;
            } else if (type == CtrlElementType.RectRTR) {
                name = `rotate-${270 + deg}`;
            } else if (type == CtrlElementType.RectLT || type === CtrlElementType.RectRB) {
                name = `scale-${45 + deg}`;
            } else if (type == CtrlElementType.RectRT || type === CtrlElementType.RectLB) {
                name = `scale-${135 + deg}`;
            } else if (type == CtrlElementType.LineStart || type === CtrlElementType.LineEnd) {
                name = 'extend-0';
            } else if (type == CtrlElementType.LineStartR) {
                name = `rotate-${135 + deg}`;
            } else if (type == CtrlElementType.LineEndR) {
                name = `rotate-${315 + deg}`;
            } else if (type == CtrlElementType.RectTop || type === CtrlElementType.RectBottom) {
                name = `scale-${90 + deg}`
            } else if (type == CtrlElementType.RectLeft || type === CtrlElementType.RectRight) {
                name = `scale-${0 + deg}`;
            } else if (type == CtrlElementType.Text) {
                name = `scan-0`;
            }
            this.notify(WorkSpace.CURSOR_CHANGE, name);
        }
    }
    resetCursor() {
        !this.transforming && this.notify(WorkSpace.RESET_CURSOR);
    }
    sendComment() {
        this.notify(WorkSpace.SEND_COMMENT);// listTab栏和content组件之间的通信
    }
    editTabComment() {
        this.notify(WorkSpace.EDIT_COMMENT); // listTab栏和content组件之间的通信
    }
    hoverComment(v: boolean, id?: string) {
        this.m_hove_commetn = v
        this.m_hover_comment_id = id
        if (!v) {
            this.notify(WorkSpace.HOVER_COMMENT);
        } else {
            this.notify(WorkSpace.HOVER_SHOW_COMMENT)
        }
        if (id) {
            this.notify(WorkSpace.CURRENT_COMMENT);
        }
    }
    toggleCommentPage() {
        this.m_comment_list = [];
        this.m_page_comment_list = [];
        this.notify(WorkSpace.TOGGLE_COMMENT_PAGE);//点击评论跳转页面
    }
}