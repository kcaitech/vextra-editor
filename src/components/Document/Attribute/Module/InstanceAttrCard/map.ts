import {VariableType} from "@kcdesign/data";
import Status from "./Status.vue";
import SymbolRef from "./SymbolRef.vue";
import Text from "./Text.vue";
import Visible from "./Visible.vue";
export const cardmap = new Map<VariableType, any>([
    [VariableType.Status, Status],
    [VariableType.SymbolRef, SymbolRef],
    [VariableType.Text, Text],
    [VariableType.Visible, Visible],
])
