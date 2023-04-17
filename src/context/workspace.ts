import { Watchable } from "@kcdesign/data/data/basic";
import { Repository } from "@kcdesign/data/data/transact";
import { ShapeType } from "@kcdesign/data/data/typesdefine";
import { Matrix } from '@kcdesign/data/basic/matrix';
export enum Action {
    Auto = 'auto',
    AutoV = 'cursor',
    AutoK = 'scale',
    AddRect = 'add-rect',
    AddLine = 'add-line',
    AddEllipse = 'add-ellipse',
    AddArrow = 'add-arrow',
    AddFrame = 'add-frame'
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
    F = 'KeyF'
}
export enum CursorType { // 光标类型
    Crosshair = '-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABClJREFUaEPtVztMFFEUvbuAgmJ0F+gQlGQmULCAEFDooGGmobGxIEKMITYqiRpBrfxGTVAbQ4whhsLGhoalgQ4UAll2KCAzCQrSgaBR8QO7a874Ho7IZ5Z54JLMS17e/Oee+znnPg/t8uHZ5faTC+B/R9CNgBsBhx5wU8ihAx2/7kbAsQsdfkB0BLxEpjjyFebFiChqWR2a/PfrIgHA6GQiSmEzif0qQkRLbC4zMMJAiAKA78Dw1NnZ2RuZmZmXrBbOzc09zMrKuklE3xkQREXIEAkglYjSp6amrufk5Jzv6OgIeTyeWENDw7Hp6eknubm5t4joCwORcACQPvuI6JCu662SJJ1TVXUSLu7u7s4zDOOpLMt3iOgjES2KTCNREUC+7yeiDE3TWgoLC8+qqvqOATgyNjb2LBAI3CWiD0T0lYhQF0KGSAAHACAcDrcEAoEzqqpOMwA5mqY9Lyoq4gA+7woAiqJMAUAwGMxNJACreR4RxEQKpRORPxQKXS4uLm60RmB0dLSjpKTkARHNs0JGCqGQ+dyyTsSTQqt5HpzPAQEAivjg4ODghfLy8norgKGhoc6KiorHRPSJFTEHAMOhDVvWCbsANuT5tapRUZT3LIUOb1atTnQiHgD/8Hw0GkUEMDyxWMzDzr1Yu7q6EBGqq6tb9Hq98HQUK7SBpQ7hvLGxscSJTtgFsCbPB4PBvM28u9F9RVEmnepEPADA877x8fHW/Pz8JsMw3loiQIiA2bmxtbm52Txva2szVZd5fmXFNURAkqSjExMT7QUFBRC6BaYTiJitEQ8As0h1Xb/m9/uPLy0tJcNYbnA0iuzwmOfZ2dn5tbW1M7Cgp6cne2ZmZuL3rVjM6/WuAMK1lJSU5fn5+TeyLN+2FLlwAACKGkAUIFigTADaw2gU93Gc1tvbW19dXX3SWsR9fX2vampqOonoGxH9tNAnjtFaoEeCwEGl0fDZ7pXsRgDPgTYBgs+9jP95/58GYP39/U2VlZWnrAAGBgZeVlVVtTNDAYLzPuj0BzMahmOCVoUDMFOWgQAQTHC/VcjMZm54ePhiaWnpaasOjIyMvCgrK3tkaeasQoZjGM2n7fQxa8tWpfx5iBts3XHhLgAhrTJCodCVdZT4PmvmkC4wlg/rjs225/nL8QJYDy+igdrIDIfDV9dp5u4R0RzL9YTsRhEBADC70XWaOQBABBISABjKr2laK/YDuq6b+wFZlvl+ADyPZi4h9wNcqQ8ahtHq8/lORCIRc1OflJQUWVhYeC1JEgDwZi6uQt2oTkXVwFo6AVrFAG1umec3IxmRAFbrBIQNA2LFOT5unt8pAGvpBO9Uec+/JZ7fSQBcV7gyW//NlTdunt9pAJv9T/h9UTUg3DC7H3QB2PXUdj3nRmC7PGv3u24E7Hpqu55zI7BdnrX73V/2V8NA1VQ9gwAAAABJRU5ErkJggg==)1.5x)13 13, crosshair',
    Auto = '-webkit-image-set(url(data:image/png;base64,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)1.5x)4 4, auto',
    Grab = 'grab',
    Grabbing = 'grabbing'
}
export enum CtrlElementType { // 控制元素类型
    RectL = 'rect-left',
    RectR = 'rect-top',
    RectB = 'rect-bottom',
    RectT = 'rect-top',
    RectLT = 'rect-left-top',
    RectRT = 'rect-right-top',
    RectRB = 'rect-right-bottom',
    RectLB = 'rect-left-bottom',
    RectLTR = 'rect-left-top-rotate',
    RectRTR = 'rect-right-top-rotate',
    RectRBR = 'rect-right-bottom-rotate',
    RectLBR = 'rect-left-bottom-rotate'
}

const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard]
]);
export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型
export class WorkSpace extends Watchable(Object) {
    static ESC_EVENT_POINTER: any = undefined; // 用于存储esc事件的指针
    static INSERT_FRAME = 1; // notify类型：插入容器模版、更新光标、重置光标、矩阵变换
    static CURSOR_CHANGE = 2;
    static RESET_CURSOR = 3;
    static MATRIX_TRANSFORMATION = 4;
    private m_current_action: Action = Action.AutoV; // 当前编辑器状态，将影响新增图形的类型、编辑器光标的类型
    private m_matrix: Matrix = new Matrix();
    private m_clip_board: any; // 剪切板
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 }; // 容器模版frame
    private m_scaling: boolean = false; // 编辑器是否正在缩放图形
    private m_rotating: boolean = false; // 编辑器是否正在旋转图形
    private m_translating: boolean = false; // 编辑器是否正在移动图形
    constructor() {
        super();
    }
    get root() { //return contentView HTMLElement
        const root = { x: 332, y: 30, bottom: 0, right: 0, element: undefined };
        let content: any = document.querySelectorAll('#content');
        content = Array.from(content).find(i => (i as HTMLElement)?.dataset?.area === 'content');
        if (content) {
            const { x, y, bottom, right } = content.getBoundingClientRect();
            root.x = x;
            root.y = y;
            root.bottom = bottom;
            root.right = right;
            root.element = content;
        }
        return root;
    }
    get action() {
        return this.m_current_action;
    }
    get matrix() {
        return this.m_matrix;
    }
    get clipBoard() {
        return this.m_clip_board;
    }
    get frameSize() {
        return this.m_frame_size;
    }
    get transforming() {
        return this.m_scaling || this.m_rotating || this.m_translating;
    }
    matrixTransformation() { // 矩阵发生变换
        this.notify(WorkSpace.MATRIX_TRANSFORMATION)
    }
    setAction(action: Action) {
        if (action === Action.AutoV && WorkSpace.ESC_EVENT_POINTER) {
            document.removeEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
        } else this.escSetup();
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
    scaling(v: boolean) {
        this.m_scaling = v;
    }
    rotating(v: boolean) {
        this.m_rotating = v;
    }
    translating(v: boolean) {
        this.m_translating = v;
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
    keydown_z(repo: Repository, ctrl?: boolean, shift?: boolean, meta?: boolean) {
        if ((ctrl || meta) && !shift) {
            repo.canUndo() && repo.undo();
        } else if ((ctrl || meta) && shift) {
            repo.canRedo() && repo.redo();
        }
    }
    keydown_K() {
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
    escSetup() { // 安装取消当前状态的键盘事件(Esc)，在开启一个状态的时候应该考虑关闭状态的处理！
        if (WorkSpace.ESC_EVENT_POINTER) {
            document.removeEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
        }
        WorkSpace.ESC_EVENT_POINTER = this.esc.bind(this);
        document.addEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
    }
    esc(e: KeyboardEvent) {
        if (e.code === 'Escape') {
            this.setAction(Action.AutoV);
            document.removeEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
            WorkSpace.ESC_EVENT_POINTER = undefined;
        }
    }
    setCursor(type: CtrlElementType, deg: number) {
        this.notify(WorkSpace.CURSOR_CHANGE, type, deg);
    }
    resetCursor() {
        !this.transforming && this.notify(WorkSpace.RESET_CURSOR);
    }
}