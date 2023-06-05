import { Watchable } from "@kcdesign/data";
import { ShapeType } from "@kcdesign/data";
import { Matrix } from '@kcdesign/data';
import { Context } from "./index";
import { Root } from "@/utils/content";
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
    AddComment = 'add-comment'
}
export enum KeyboardKeys { // 键盘按键类型
    Space = 'Space',
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
    C = 'KeyC'
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

const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard],
    [Action.AddText, ShapeType.Text]
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
    private context: Context;
    private m_current_action: Action = Action.AutoV; // 当前编辑器状态，将影响新增图形的类型、编辑器光标的类型
    private m_matrix: Matrix = new Matrix();
    private m_clip_board: any; // 剪切板
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
    private m_root: Root = { init: false, x: 332, y: 30, bottom: 0, right: 0, element: undefined, center: { x: 0, y: 0 } };
    private m_tool_group: SVGAElement | undefined;
    private m_should_selection_view_update: boolean = true;
    private m_color_picker: string | undefined; // 编辑器是否已经有调色板🎨
    private m_saving: boolean = false;
    constructor(context: Context) {
        super();
        this.context = context
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
    get isPreToTranslating() {
        return this.m_pre_to_translating;
    }
    get startPoint() {
        return this.m_mousedown_on_page;
    }
    get action() {
        return this.m_current_action;
    }
    get clipBoard() {
        return this.m_clip_board;
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
    get isEditing() {
        return this.m_content_editing;
    }
    get toolGroup() {
        return this.m_tool_group;
    }
    get shouldSelectionViewUpdate() {
        return this.m_should_selection_view_update;
    }
    startSave() {
        this.m_saving = true;
        this.notify(WorkSpace.START_SAVE);
    }
    endSave() {
        this.m_saving = false;
        this.notify(WorkSpace.END_SAVE);
    }
    documentSave() {
        if (!this.m_saving) {
            this.notify(WorkSpace.DOCUMENT_SAVE);
        }
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
        const { ctrlKey, shiftKey, metaKey, altKey, target } = event;
        if (event.code === KeyboardKeys.R) {
            if (!metaKey && !ctrlKey) {
                event.preventDefault();
                this.keydown_r();
            }
        } else if (event.code === KeyboardKeys.V) {
            event.preventDefault();
            this.keydown_v();
        } else if (event.code === KeyboardKeys.L) {
            event.preventDefault();
            this.keydown_l(shiftKey);
        } else if (event.code === KeyboardKeys.Z) {
            event.preventDefault();
            this.keydown_z(this.context, ctrlKey, shiftKey, metaKey);
        } else if (event.code === KeyboardKeys.K) {
            event.preventDefault();
            this.keydown_k();
        } else if (event.code === KeyboardKeys.O) {
            event.preventDefault();
            this.keydown_o();
        } else if (event.code === KeyboardKeys.F) {
            event.preventDefault();
            this.keydown_f();
        } else if (event.code === KeyboardKeys.Digit0) {
            event.preventDefault();
            this.keydown_0(ctrlKey, metaKey);
        } else if (event.code === KeyboardKeys.G) {
            event.preventDefault();
            this.keydown_g(ctrlKey, metaKey, shiftKey);
        } else if (event.code === KeyboardKeys.T) {
            event.preventDefault();
            this.keydown_t();
        } else if (event.code === KeyboardKeys.C) {
            event.preventDefault();
            this.keydown_c();
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
    setClipBoard(v: any) {
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
    keydown_r() {
        this.escSetup();
        this.m_current_action = Action.AddRect;
        this.notify();
    }
    keydown_v() {
        this.m_current_action = Action.AutoV;
        this.notify();
    }
    keydown_l(shiftKey: boolean) {
        this.escSetup();
        this.m_current_action = shiftKey ? Action.AddArrow : Action.AddLine;
        this.notify();
    }
    keydown_z(context: Context, ctrl?: boolean, shift?: boolean, meta?: boolean) {
        const repo = context.repo;
        const page = context.selection.selectedPage;
        if (!page) return;
        if ((ctrl || meta) && !shift) {
            repo.canUndo() && repo.undo();
            const selection = context.selection;
            const shapes = context.selection.selectedShapes;
            // const flat = context.selection.selectedPage!.flatShapes;
            if (shapes.length) {
                // if (flat.length) {
                for (let i = 0; i < shapes.length; i++) {
                    const item = shapes[i];
                    const shape = page.getShape(item.id)
                    if (!shape) {
                        selection.unSelectShape(item);
                    }
                }
                // } else {
                //     selection.resetSelectShapes();
                // }
            }
        } else if ((ctrl || meta) && shift) {
            repo.canRedo() && repo.redo();
        }
    }
    keydown_k() {
        this.escSetup();
        this.m_current_action = Action.AutoK;
        this.notify();
    }
    keydown_o() {
        this.escSetup();
        this.m_current_action = Action.AddEllipse;
        this.notify();
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
    keydown_c() {
        this.escSetup();
        this.m_current_action = Action.AddComment;
        this.notify();
    }
    keydown_0(ctrl: boolean, meta: boolean) {
        if (ctrl || meta) {
            const { center } = this.root;
            this.m_matrix.trans(-center.x, -center.y);
            const _s = 1 / this.m_matrix.toArray()[0];
            this.m_matrix.scale(_s);
            this.m_matrix.trans(center.x, center.y);
            this.notify(WorkSpace.MATRIX_TRANSFORMATION);
        }
    }
    keydown_g(ctrl: boolean, meta: boolean, shift: boolean) {
        if ((ctrl || meta) && !shift) { // 编组
            this.notify(WorkSpace.GROUP);
        } else if ((ctrl || meta) && shift) { // 解组
            this.notify(WorkSpace.UNGROUP)
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
}