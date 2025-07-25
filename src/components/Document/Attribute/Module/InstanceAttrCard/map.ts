/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {VariableType} from "@kcaitech/vextra-core";
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
