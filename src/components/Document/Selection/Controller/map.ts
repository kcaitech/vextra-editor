import CtrlRect from "./CtrlNormal.vue";
import CtrlRectMulti from "./CtrlForMulti.vue";
import CtrlText from "./CtrlText.vue";
import CtrlLine from "./CtrlLine.vue";
import Readonly from "./Readonly.vue";
import CtrlTable from "./CtrlTable.vue";
import CtrlContact from "./CtrlContact.vue";
import CtrlComponentVue from "./CtrlComponent.vue";
import CtrlVirtual from "./CtrlVirtual.vue";
import CtrlTextVirtual from "./CtrlTextVirtual.vue";
export enum ControllerType { // 控件类型
    Rect = 'rect',
    RectMulti = 'rect_multi',
    Line = 'line',
    Text = 'text',
    Readonly = 'Readonly',
    Table = 'table',
    Contact = 'contact',
    Symbol = 'symbol',
    Virtual = 'virtual',
    TextVirtual = 'text_virtual'
}
export const ctrlMap = new Map<ControllerType, any>([
    [ControllerType.Rect, CtrlRect],
    [ControllerType.RectMulti, CtrlRectMulti],
    [ControllerType.Line, CtrlLine],
    [ControllerType.Text, CtrlText],
    [ControllerType.Readonly, Readonly],
    [ControllerType.Table, CtrlTable],
    [ControllerType.Contact, CtrlContact],
    [ControllerType.Symbol, CtrlComponentVue],
    [ControllerType.Virtual, CtrlVirtual],
    [ControllerType.TextVirtual, CtrlTextVirtual],
]);