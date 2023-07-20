import { ShapeType, Watchable } from "@kcdesign/data";
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
    AddComment = 'add-comment',
    AddImage = 'add-image'
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
    [Action.AddText, ShapeType.Text],
    [Action.AddImage, ShapeType.Image]
]);

export const ResultByAction = (action: Action): ShapeType | undefined => A2R.get(action); // 参数action状态下新增图形会得到的图形类型

export class Tool extends Watchable(Object) {
    get action() {
        return this.m_current_action;
    }
}