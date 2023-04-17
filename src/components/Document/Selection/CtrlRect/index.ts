import RectangleCtrl from "./RectangleCtrl.vue";
import LineCtrl from "./LineCtrl.vue";
export enum CtrlGroupType {
    Rect = 'rect',
    Line = 'line'
}
export const ctrlMap: Map<CtrlGroupType, any> = new Map([
    [CtrlGroupType.Rect, RectangleCtrl],
    [CtrlGroupType.Line, LineCtrl]
]);