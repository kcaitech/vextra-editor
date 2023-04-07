import { Watchable } from "@kcdesign/data/data/basic";
import { Context } from "./index"
import { Repository } from "@kcdesign/data/data/transact";
import { ShapeType } from "@kcdesign/data/data/typesdefine";
import { Matrix } from '@/basic/matrix';
export enum Action {
    Auto = 'auto',
    AddRect = 'add-rect',
    AddLine = 'add-line'
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
    [Action.AddRect, ShapeType.Rectangle]
]);
export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action);
export class WorkSpace extends Watchable(Object) {
    readonly r_context: Context
    private m_current_action: Action = Action.Auto;
    private m_scale: number = 1;
    private m_matrix: Matrix = new Matrix();
    private m_clip_board: any;
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

    // keyboard
    keydown_r() {
        this.m_current_action = Action.AddRect;
        this.notify();
    }
    keydown_v() {
        this.m_current_action = Action.Auto;
        this.notify();
    }
    keydown_l() {
        this.m_current_action = Action.AddLine;
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
}