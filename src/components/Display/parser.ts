/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { CoopRepository, importLocal, TransactDataGuard } from "@kcdesign/data";
import LCStorage from "./local";
import { Context } from "@/context";

export async function parserDocument() {
    const storage = new LCStorage();
    const repo = new TransactDataGuard();
    const { document, loader } = await importLocal(storage, '', '', '', repo);
    const cooprepo = new CoopRepository(document, repo)
    const context = new Context(document, cooprepo, { source: 'storage', storage } as any);
    (window as any).__context = context;
    return context;
}

interface Config {
    pageId: string;
    boardId: string;
    backgroundColor: string;
}

export async function fetchConfig(): Promise<Config> {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = './static/.config.js';
        document.head.append(script);
        script.onload = () => {
            const __moss_config = JSON.parse(JSON.stringify((window as any).__moss_config));
            script.remove();
            resolve(__moss_config)
        }
    })
}