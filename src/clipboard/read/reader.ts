/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Shape, ResourceMgr } from "@kcaitech/vextra-core";
import { IO } from "@kcaitech/vextra-core";
import { Context } from "@/context";

export class Reader {
    protected context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    protected async SVGFileReader(file: File): Promise<{
        shape: Shape | undefined,
        mediaResourceMgr: ResourceMgr<{ buff: Uint8Array, base64: string }>
    }> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(IO.SvgParser.parse(event.target!.result as string));
            reader.readAsText(file);
        });
    }

    protected maySvgText(content: string) {
        return content.length > 10 && (content.search(/<svg|<?xml/img) > -1) && (new RegExp('</svg>', "img").test(content.slice(content.length - 10).toLowerCase()));
    }

}