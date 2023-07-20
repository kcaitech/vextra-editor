import { Color, Watchable } from "@kcdesign/data";
import { Matrix } from '@kcdesign/data';
import { Context } from "./index";
import { Root } from "@/utils/content";
import { Clipboard } from "@/utils/clipaboard";
import { adapt_page } from "@/utils/content";
export enum KeyboardKeys {
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
    B = 'KeyB',
    I = 'KeyI',
    X = 'KeyX',
    U = 'KeyU',
    Digit1 = 'Digit1',
    Backspace = 'Backspace',
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
export class WorkSpace extends Watchable(Object) {
    static P_ESC_EVENT: any = null; // 用于存储esc事件的指针
    static INSERT_FRAME = 1; // notify类型：插入容器模版、更新光标、重置光标、矩阵变换
    static MATRIX_TRANSFORMATION = 4;
    static SELECTING = 5;
    static TEXT_FORMAT = 6;
    static SHUTDOWN_POPOVER = 7;
    static TRANSLATING = 8;
    static CHECKSTATUS = 9;
    static SELECTION_VIEW_UPDATE = 12;
    static CTRL_DISAPPEAR = 14;
    static CTRL_APPEAR_IMMEDIATELY = 15;
    static CTRL_APPEAR = 16;
    static PASTE = 17;
    static PASTE_RIGHT = 18;
    static INSERT_IMGS = 19;
    static FREEZE = 20;
    static THAW = 21;
    static CLAC_ATTRI = 22;
    static COPY = 23;
    static HIDDEN_UI = 24;
    static INIT_DOC_NAME = 25;
    static ONARBOARD__TITLE_MENU = 27;
    static BOLD = 28;
    static UNDER_LINE = 29;
    static ITALIC = 30;
    static DELETE_LINE = 31;
    static INIT_EDITOR = 32;
    static CHANGE_BACKGROUND = 33;
    private context: Context;
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
    private m_popover: boolean = false;
    private m_rootId: string = 'content';
    private m_pageViewId: string = 'pageview';
    private m_pre_to_translating: boolean = false;
    private m_mousedown_on_page: MouseEvent | undefined;
    private m_controller: 'page' | 'controller' = 'page';
    private m_root: Root = { init: false, x: 332, y: 30, bottom: 0, right: 0, width: 0, height: 0, element: undefined, center: { x: 0, y: 0 } };
    private m_document_perm: number = 3;
    private m_tool_group: SVGAElement | undefined;
    private m_should_selection_view_update: boolean = true;
    private m_image: Media[] | undefined = undefined;
    private m_freeze: boolean = false;
    private m_clipboard: Clipboard;
    private m_t: Function = () => { };
    private m_bgc: Color = new Color(1, 239, 239, 239);
    constructor(context: Context) {
        super();
        this.context = context;
        this.m_clipboard = new Clipboard(context);
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
    get ispopover() { //xxx
        return this.m_popover;
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
        return this.m_content_editing;
    }
    get toolGroup() {
        return this.m_tool_group;
    }
    get shouldSelectionViewUpdate() {
        return this.m_should_selection_view_update;
    }
    get isFreeze() {
        return this.m_freeze;
    }
    get background() {
        return this.m_bgc;
    }
    setBackground(color: Color) {
        this.m_bgc = color;
        this.notify(WorkSpace.CHANGE_BACKGROUND, color);
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
    selectionViewUpdate() {
        this.notify(WorkSpace.SELECTION_VIEW_UPDATE);
    }
    setSelectionViewUpdater(isWork: boolean) {
        this.m_should_selection_view_update = isWork;
    }
    toolGroupMount(toolGroupMount: SVGAElement) {
        this.m_tool_group = toolGroupMount;
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
    keyboardHandle(event: KeyboardEvent) {
        const { ctrlKey, shiftKey, metaKey, target } = event;
        if (target instanceof HTMLInputElement) return; // 在输入框中输入时避免触发编辑器的键盘事件
        if (this.isFreeze) return;
        if (event.code === KeyboardKeys.A) {
            this.keydown_a(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.V) {
            event.preventDefault();
            this.keydown_v(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.Z) {
            event.preventDefault();
            this.keydown_z(this.context, ctrlKey, shiftKey, metaKey);
        } else if (event.code === KeyboardKeys.Digit0) {
            event.preventDefault();
            this.keydown_0(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.C) {
            event.preventDefault();
            this.keydown_c(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.B) {
            event.preventDefault();
            this.keydown_b(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.I) {
            event.preventDefault();
            this.keydown_i(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.U) {
            event.preventDefault();
            this.keydown_u(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.X) {
            event.preventDefault();
            this.keydown_x(ctrlKey, metaKey, shiftKey);
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
    keydown_v(ctrlKey: boolean, metaKey: boolean) {
        if (ctrlKey || metaKey) {
            this.notify(WorkSpace.PASTE);
        }
    }
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
    keydown_i(ctrl: boolean, meta: boolean) {
        if (ctrl || meta) {
            this.notify(WorkSpace.ITALIC);
        }
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

    keydown_c(ctrlKey?: boolean, metaKey?: boolean, shift?: boolean) {
        if ((ctrlKey || metaKey) && !shift) {
            this.notify(WorkSpace.COPY)
        } else if (!(ctrlKey || metaKey) && shift) {
            this.context.comment.setVisibleComment(!this.context.comment.isVisibleComment);
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
    keydown_b(ctrl: boolean, meta: boolean) {
        if (ctrl || meta) {
            this.notify(WorkSpace.BOLD);
        }
    }
    keydown_u(ctrl: boolean, meta: boolean) {
        if (ctrl || meta) {
            this.notify(WorkSpace.UNDER_LINE);
        }
    }
    keydown_x(ctrl: boolean, meta: boolean, shift: boolean) {
        if ((ctrl || meta) && shift) {
            this.notify(WorkSpace.DELETE_LINE)
        }
    }
}