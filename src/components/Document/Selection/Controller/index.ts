import RectangleCtrl from "./RectangleCtrl.vue";
import CtrlLine from "./CtrlLine.vue";
export enum ControllerType {
    Rect = 'rect',
    Line = 'line'
}
export const ctrlMap: Map<ControllerType, any> = new Map([
    [ControllerType.Rect, RectangleCtrl],
    [ControllerType.Line, CtrlLine]
]);