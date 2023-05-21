import CtrlRect from "./CtrlRect.vue";
import CtrlLine from "./CtrlLine.vue";
// import CtrlRect from "./CtrlRect.SVG.vue";
import CtrlText from "./CtrlText.vue"
export enum ControllerType { // 控件类型
    Rect = 'rect',
    Line = 'line',
    Text = 'text'
}
export const ctrlMap: Map<ControllerType, any> = new Map([
    [ControllerType.Rect, CtrlRect],
    [ControllerType.Line, CtrlLine],
    [ControllerType.Text, CtrlText]
]);