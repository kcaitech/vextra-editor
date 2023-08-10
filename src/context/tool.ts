import { ShapeType, Watchable } from "@kcdesign/data";
import { Context } from ".";
import { Comment } from "./comment";
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
    AddTable = 'add-table'
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
    [Action.AddTable, ShapeType.Table]
]);

export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型

export class Tool extends Watchable(Object) {
    static CHANGE_ACTION = 1;
    static GROUP = 2;
    static UNGROUP = 3;
    static COMPS = 4;
    static TITILE_VISIBLE = 5
    private m_current_action: Action = Action.AutoV;
    private m_context: Context;
    private m_show_title: boolean = true;
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
        }
    }
    setAction(action: Action) {
        this.m_current_action = action;
        if (action.startsWith('add')) {
            if (action === Action.AddComment) {
                if (this.m_context.workspace.documentPerm === 1) return;
                this.m_context.comment.commentInput(false);
                this.m_context.comment.notify(Comment.SELECT_LIST_TAB);
                this.m_context.cursor.setType('comment-0');
            } else this.m_context.cursor.setType('cross-0');
        } else this.m_context.cursor.setType('auto-0');
        this.notify(Tool.CHANGE_ACTION);
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
        if (shiftKey) return; // 暂时停止使用箭头图形
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
    get isShowTitle() {
        return this.m_show_title;
    }
    setTitleVisibale(val: boolean) {
        this.m_show_title = val;
        this.notify(Tool.TITILE_VISIBLE);
    }
}