import RectangleCtrl from "./RectangleCtrl.vue";
import CtrlLine from "./CtrlLine.vue";
export enum ControllerType { // 控件类型
    Rect = 'rect',
    Line = 'line'
}
export const ctrlMap: Map<ControllerType, any> = new Map([
    [ControllerType.Rect, RectangleCtrl],
    [ControllerType.Line, CtrlLine]
]);