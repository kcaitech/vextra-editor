import { Watchable } from "@kcdesign/data/data/basic";
import { ShapeFrame } from "@kcdesign/data/data/typesdefine";
import { ShapeType } from "@kcdesign/data/data/typesdefine";
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
const A2R = new Map([
    [Action.Auto, undefined],
    [Action.AddRect, ShapeType.Rectangle]
]);
export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action);
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

    addShape(frame: ShapeFrame) {

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