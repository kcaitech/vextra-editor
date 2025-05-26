/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { events } from "@/context/events"

export function watchReadyonly(context: Context, cb?: (readonly: boolean) => void) {
    const _ro = ref<boolean>(context.readonly);
    let rm: (() => void) | undefined;

    onMounted(() => {
        if (_ro.value !== context.readonly) {
            _ro.value = context.readonly;
            if (cb) cb(_ro.value);
        }
        rm = context.watch((event: string, readonly: boolean) => {
            if (event !== events.context_readonly_change) return;
            _ro.value = readonly;
            if (cb) cb(readonly);
        })
    })
    onUnmounted(() => {
        if (rm) rm();
        rm = undefined;
    })
    return _ro;
}