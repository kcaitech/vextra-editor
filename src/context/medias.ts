/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcdesign/data";
import { Context } from ".";

export class PdMedia extends WatchableObject {
    // private m_stack: 
    static SHOW_TIPS: 1;
    private m_last_time: number = 0;
    private m_re_upload: Map<string, number> = new Map<string, number>();
    private m_context: Context;
    constructor(context: Context) {
        super();
        this.m_context = context;
    }

    show_tips() {
        const now = Date.now();
        if (now - this.m_last_time > 60000) {
            this.notify(PdMedia.SHOW_TIPS);
            this.m_last_time = now;
        }
    }

    re_upload(ref: string, buff: ArrayBufferLike) {
        if ((this.m_re_upload.get(ref) || 0) > 0) {
            return;
        }
        const ov = this.m_re_upload.get(ref);
        this.m_re_upload.set(ref, ov ? ov + 1 : 1);

        const timer = setTimeout(() => {
            const __buff = new Uint8Array(buff);
            this.m_context.net?.upload(ref, __buff.buffer)
            clearTimeout(timer);
        }, 60000)
    }
}