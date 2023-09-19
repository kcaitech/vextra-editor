import { Shape, ShapeType, Watchable } from "@kcdesign/data";
import { Context } from ".";
import { Comment } from "./comment";
import { TaskType } from "./escstack";
export enum Action {
    Auto = 'auto',
    AutoV = 'drag',
    AutoK = 'scale',
    AddRect = 'add-rect',
    AddLine = 'add-line',
    AddEllipse = 'add-ellipse',
    AddArrow = 'add-arrow',
    AddFrame = 'add-frame',
    AddText = 'add-text',
    AddComment = 'add-comment',
    AddImage = 'add-image',
    AddTable = 'add-table',
    AddContact = 'add-contact'
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
    B = 'KeyB',
    I = 'KeyI',
    X = 'KeyX',
    U = 'KeyU',
    Digit1 = 'Digit1',
    Backspace = 'Backspace',
}
const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard],
    [Action.AddText, ShapeType.Text],
    [Action.AddImage, ShapeType.Image],
    [Action.AddArrow, ShapeType.Line],
    [Action.AddTable, ShapeType.Table],
    [Action.AddContact, ShapeType.Contact],
]);

export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型

export class Tool extends Watchable(Object) {
    static CHANGE_ACTION = 1;
    static GROUP = 2;
    static UNGROUP = 3;
    static COMPS = 4;
    static TITILE_VISIBLE = 5;
    static INSERT_FRAME = 6;
    static INSERT_TABLE = 7;
    static CHANGE_CONTACT_APEX = 8;
    private m_current_action: Action = Action.AutoV;
    private m_context: Context;
    private m_show_title: boolean = true;
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 }; // 容器模版frame
    private m_frame_name: string = ''; // 容器模版名称
    private m_table_size: { row: number, col: number } = { row: 3, col: 3 };
    private m_contact_apex: Shape | undefined;
    private m_contact_from: boolean = false;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }
    get action() {
        return this.m_current_action;
    }
    keyhandle(e: KeyboardEvent) {
        const { target, code, shiftKey, ctrlKey, metaKey, altKey } = e;
        if (target instanceof HTMLInputElement) return;
        if (code === 'KeyR') {
            if (!(ctrlKey || shiftKey)) e.preventDefault();
            this.keydown_r(ctrlKey, shiftKey, metaKey);
        } else if (code === 'KeyV') {
            e.preventDefault();
            this.keydown_v(ctrlKey, metaKey);
        } else if (code === 'KeyL') {
            this.keydown_l(shiftKey);
        } else if (code === 'KeyK') {
            this.keydown_k(ctrlKey, shiftKey, metaKey);
        } else if (code === 'KeyO') {
            e.preventDefault();
            this.keydown_o(ctrlKey, shiftKey, metaKey);
        } else if (code === 'KeyC') {
            e.preventDefault();
            this.keydown_c(ctrlKey, metaKey, shiftKey)
        } else if (code === 'KeyG') {
            e.preventDefault();
            this.keydown_g(ctrlKey, metaKey, shiftKey, altKey);
        } else if (code === 'KeyT') {
            e.preventDefault();
            this.keydown_t(ctrlKey, shiftKey, metaKey);
        } else if (code === 'KeyF') {
            e.preventDefault();
            this.keydown_f(ctrlKey, shiftKey, metaKey);
        } else if (code === 'KeyX') {
            e.preventDefault();
            this.keydown_x(ctrlKey, shiftKey, metaKey);
        }
    }
    setAction(action: Action) {
        this.m_current_action = action;
        if (action.startsWith('add')) {
            this.m_context.menu.menuMount();
            this.m_context.esctask.save(TaskType.TOOL, this.reset.bind(this));
            if (action === Action.AddComment) {
                if (this.m_context.workspace.documentPerm === 1) return;
                this.m_context.comment.commentInput(false);
                this.m_context.comment.notify(Comment.SELECT_LIST_TAB);
                this.m_context.cursor.setType('comment-0');
            } else this.m_context.cursor.setType('cross-0');

        } else this.m_context.cursor.setType('auto-0');
        this.notify(Tool.CHANGE_ACTION);
    }
    reset() {
        let exe_result: boolean = false;
        if (this.m_current_action.startsWith('add')) {
            exe_result = true;
        }
        this.m_current_action = Action.AutoV;
        this.m_context.cursor.setType('auto-0');
        this.notify(Tool.CHANGE_ACTION);
        return exe_result;
    }
    keydown_r(ctrl: boolean, shift: boolean, meta: boolean) {
        if (ctrl || shift || meta) return;
        this.setAction(Action.AddRect);
    }
    keydown_v(ctrlKey: boolean, metaKey: boolean) {
        if (ctrlKey || metaKey) return;
        this.setAction(Action.AutoV);
    }
    keydown_l(shiftKey: boolean) {
        this.setAction(shiftKey ? Action.AddArrow : Action.AddLine);
    }
    keydown_k(ctrl: boolean, shift: boolean, meta: boolean) {
        if (!(ctrl || meta || shift)) {
            this.setAction(Action.AutoK);
        }
    }
    keydown_o(ctrl: boolean, shift: boolean, meta: boolean) {
        if (ctrl || shift || meta) return;
        this.setAction(Action.AddEllipse);
    }
    keydown_f(ctrl: boolean, shift: boolean, meta: boolean) {
        if (ctrl || shift || meta) return;
        this.setAction(Action.AddFrame);
    }
    keydown_t(ctrl: boolean, shift: boolean, meta: boolean) {
        if (ctrl || shift || meta) return;
        this.setAction(Action.AddText);
    }
    keydown_c(ctrl: boolean, meta: boolean, shift: boolean) {
        if (ctrl || meta || shift) return;
        this.setAction(Action.AddComment);
    }
    keydown_g(ctrl: boolean, meta: boolean, shift: boolean, alt: boolean) {
        if ((ctrl || meta) && !shift) { // 编组
            if (alt) {
                this.notify(Tool.GROUP, alt);
            } else {
                this.notify(Tool.GROUP);
            }
        } else if ((ctrl || meta) && shift) {
            this.notify(Tool.UNGROUP);
        }
    }
    keydown_i(ctrl: boolean, meta: boolean, shift: boolean) {
        // todo
    }
    keydown_x(ctrl: boolean, meta: boolean, shift: boolean) {
        if (ctrl || meta || shift) return;
        this.setAction(Action.AddContact);
    }
    get isShowTitle() {
        return this.m_show_title;
    }
    setTitleVisibale(val: boolean) {
        this.m_show_title = val;
        this.notify(Tool.TITILE_VISIBLE);
    }
    get frameSize(): { size: { width: number, height: number }, name: string } {
        return { size: this.m_frame_size, name: this.m_frame_name };
    }
    setArtboardTemp(width: number, height: number, name: string) {
        this.m_frame_size = { width, height };
        this.m_frame_name = name;
        this.notify(Tool.INSERT_FRAME);
    }
    get tableSize() {
        return this.m_table_size;
    }
    insertTable(size: { row: number, col: number }) {
        this.m_table_size = size
        this.notify(Tool.INSERT_TABLE);
    }
    get contactApex() {
        return this.m_contact_apex;
    }
    setContactApex(shape: Shape) {
        if (shape.id !== this.m_contact_apex?.id) {
            this.m_contact_apex = shape;
            this.notify(Tool.CHANGE_CONTACT_APEX);
        }
    }
    resetContactApex() {
        const needNotify = this.m_contact_apex ? true : false;
        this.m_contact_apex = undefined;
        if (needNotify) {
            this.notify(Tool.CHANGE_CONTACT_APEX);
        }
    }
    get contactFrom() {
        return this.m_contact_from;
    }
    setContactFrom(v: boolean) {
        this.m_contact_from = v;
    }
}