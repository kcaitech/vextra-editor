// import CtrlRect from "./CtrlRect.vue";
import CtrlLine from "./CtrlLine.vue";
import CtrlRect from "./CtrlRect.SVG.vue";
import CtrlRectMulti from "./CtrlRect.SVG.Multi.vue";
import CtrlText from "./CtrlText.vue"
import Readonly from "./Readonly.vue"
import CtrlTable from "./CtrlTable.vue"
export enum ControllerType { // 控件类型
    Rect = 'rect',
    RectMulti = 'rect_multi',
    Line = 'line',
    Text = 'text',
    Readonly = 'Readonly',
    Table = 'table',
}
export const ctrlMap = new Map<ControllerType, any>([
    [ControllerType.Rect, CtrlRect],
    [ControllerType.RectMulti, CtrlRectMulti],
    [ControllerType.Line, CtrlLine],
    [ControllerType.Text, CtrlText],
    [ControllerType.Readonly, Readonly],
    [ControllerType.Table, CtrlTable],
]);