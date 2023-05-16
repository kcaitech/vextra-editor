import CtrlRect from "./CtrlRect.vue";
import CtrlLine from "./CtrlLine.vue";
export enum ControllerType { // 控件类型
    Rect = 'rect',
    Line = 'line'
}
export const ctrlMap: Map<ControllerType, any> = new Map([
    [ControllerType.Rect, CtrlRect],
    [ControllerType.Line, CtrlLine]
]);