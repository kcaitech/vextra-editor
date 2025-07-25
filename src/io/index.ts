/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { IO } from "@kcaitech/vextra-core";

export function downloadByLink(content: Blob, name: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

export async function exportDocument(context: Context) {
    const content = await IO.exportVext(context.data, 'blob') as Blob;
    const name = context.data.name;
    const reg = new RegExp('(.sketch|.fig|.vext)$', 'img');
    downloadByLink(content, name.replace(reg, '') + '.vext');
}
