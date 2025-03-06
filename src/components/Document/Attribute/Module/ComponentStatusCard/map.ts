/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
