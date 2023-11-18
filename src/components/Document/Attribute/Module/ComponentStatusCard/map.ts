import {VariableType} from "@kcdesign/data";
import Status from "./SCStatus.vue";
import SymbolRef from "./SCSymbolRef.vue";
import Text from "./SCText.vue";
import Visible from "./SCVisible.vue";
export const cardmap = new Map<VariableType, any>([
    [VariableType.Status, Status],
    [VariableType.SymbolRef, SymbolRef],
    [VariableType.Text, Text],
    [VariableType.Visible, Visible],
])
