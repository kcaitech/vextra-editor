import { Watchable } from "@kcdesign/data/data/basic";
import { Context } from "./index"
import { Repository } from "@kcdesign/data/data/transact";
import { ShapeType } from "@kcdesign/data/data/typesdefine";
import { Matrix } from '@/basic/matrix';
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
export enum KeyboardKeys {
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
export enum CursorType {
    Crosshair = 'crosshair',
    Auto = 'auto',
    Grab = 'grab',
    Grabbing = 'grabbing'
}
export enum CtrlElementType {
    RectL = 'rect-left',
    RectR = 'rect-top',
    RectB = 'rect-bottom',
    RectT = 'rect-top',
    RectLT = 'rect-left-top',
    RectRT = 'rect-right-top',
    RectRB = 'rect-right-bottom',
    RectLB = 'rect-left-bottom'
}

const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle],
    [Action.AddEllipse, ShapeType.Oval],
    [Action.AddLine, ShapeType.Line],
    [Action.AddFrame, ShapeType.Artboard]
]);
export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action);
export class WorkSpace extends Watchable(Object) {
    readonly r_context: Context
    static ESC_EVENT_POINTER: any = undefined;
    static INSERT_FRAME = 1;
    static RELAY = 2;
    private m_any: number = 0;
    private m_current_action: Action = Action.AutoV;
    private m_scale: number = 1;
    private m_matrix: Matrix = new Matrix();
    private m_clip_board: any;
    private m_frame_size: { width: number, height: number } = { width: 100, height: 100 };
    constructor(context: Context) {
        super();
        this.r_context = context
    }
    get root() {
        const root = { x: 332, y: 30 };
        // 保证全局id唯一
        const content = document.querySelector('#content');
        if (content) {
            const { x, y } = content.getBoundingClientRect();
            root.x = x;
            root.y = y;
        }
        return root;
    }
    get action() {
        return this.m_current_action;
    }
    get scale() {
        return this.m_scale;
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

    setAction(action: Action) {
        this.m_current_action = action;
        this.notify();
    }
    setScale(s: number) {
        this.m_scale = s;
        this.notify();
    }
    setClipBoard(v: any) {
        this.m_clip_board = v;
    }
    setFrameSize(size: { width: number, height: number }) {
        this.m_frame_size = size
        this.notify(WorkSpace.INSERT_FRAME);
    }

    relay(params: any) {
        console.log('emit');
        this.m_any++;
        this.notify(WorkSpace.RELAY, params);
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
    keydown_arrow(type: KeyboardKeys, shift?: boolean) {
        return this.r_context;
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
    escSetup() {
        WorkSpace.ESC_EVENT_POINTER = this.esc.bind(this)
        document.addEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
    }
    esc(e: KeyboardEvent) {
        const { code } = e;
        if (code === 'Escape') {
            this.setAction(Action.AutoV);
            document.removeEventListener('keydown', WorkSpace.ESC_EVENT_POINTER);
            WorkSpace.ESC_EVENT_POINTER = undefined;
        }
    }
}