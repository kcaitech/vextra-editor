import {VariableType} from "@kcdesign/data";
import Status from "./IACStatus.vue";
import SymbolRef from "./IACSymbolRef.vue";
import Text from "./IACText.vue";
import Visible from "./IACVisible.vue";
export const cardmap = new Map<VariableType, any>([
    [VariableType.Status, Status],
    [VariableType.SymbolRef, SymbolRef],
    [VariableType.Text, Text],
    [VariableType.Visible, Visible],
])
