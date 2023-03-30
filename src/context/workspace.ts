import { Watchable } from "@kcdesign/data/data/basic";
export enum Action {
    Auto = 'auto',
    AddRect = 'add-rect',
    AddLine = 'add-line'
}
export enum KeyboardKeys {
    Space = 'Space',
    R = 'KeyR',
    V = 'KeyV',
    L = 'KeyL'
}
export enum CursorType {
    Crosshair = 'crosshair',
    Auto = 'auto',
    Grab = 'grab',
    Grabbing = 'grabbing'
}
export class WorkSpace extends Watchable(Object) {
    private m_current_action: Action = Action.Auto;
    constructor() {
        super();
    }
    get action() {
        return this.m_current_action;
    }
    setAction(action: Action) {
        this.m_current_action = action;
        this.notify();
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
}