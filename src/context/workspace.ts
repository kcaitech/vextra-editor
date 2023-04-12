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
    static INSERT_FRAME = 1;
    private m_current_action: Action = Action.AutoV;
    private m_scale: number = 1;
    private m_matrix: Matrix = new Matrix();
    private m_clip_board: any;
    private m_frame_size: {width: number, height: number} = {width: 100, height: 100};
    constructor(context: Context) {
        super();
        this.r_context = context
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
    setFrameSize(size: {width: number, height: number}) {
        this.m_frame_size = size        
        this.notify(WorkSpace.INSERT_FRAME);
    }

    // keyboard
    keydown_r() {
        this.m_current_action = Action.AddRect;
        this.notify();
    }
    keydown_v() {
        this.m_current_action = Action.AutoV;
        this.notify();
    }
    keydown_l(shiftKey: boolean) {        
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
        this.m_current_action = Action.AutoK;
        this.notify();
    }
    keydown_o() {
        this.m_current_action = Action.AddEllipse;
        this.notify();
    }
    keydown_f() {
        this.m_current_action = Action.AddFrame;
        this.notify();
    }
}