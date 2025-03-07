/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { IStorage } from "@kcdesign/data";

export default class LCStorage implements IStorage {
    private scriptMap: Map<string, Uint8Array> = new Map();

    public get(uri: string): Promise<Uint8Array> {
        if (uri.startsWith('medias')) {
            uri = './static/images/' + uri.slice('medias/'.length);
            const encoder = new TextEncoder();
            return Promise.resolve(encoder.encode(uri));
        } else {
            const target = this.scriptMap.get(uri);
            if (!target) {
                return new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = './static/' + uri + '.js';
                    document.head.append(script);
                    script.onload = () => {
                        const __moss_content = JSON.stringify((window as any).__moss_content_string);
                        (window as any).__moss_content_string = undefined;
                        script.remove();
                        const encoder = new TextEncoder();
                        const u8a = encoder.encode(__moss_content)
                        this.scriptMap.set(uri, u8a);
                        resolve(u8a);
                    }
                })
            } else {
                return Promise.resolve(target);
            }
        }
    }

    public put(uri: string, data: Uint8Array, contentType?: string): Promise<void> {
        throw new Error('not implements yet');
    }
}