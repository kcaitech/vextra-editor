/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Task, TaskMgr, TaskPriority } from "@/basic/taskmgr";
import { Document } from "@kcdesign/data";

export function startLoadTask(data: Document, taskMgr: TaskMgr) {
    const pagelist = data.pagesList.slice(0);
        const pageloadTask = new class implements Task { // page auto loader
            isValid(): boolean {
                return !this.isDone();
            }

            isDone(): boolean {
                return pagelist.length <= 0;
            }

            async run(): Promise<void> {
                let id;
                while (pagelist.length > 0) {
                    const i = pagelist[0];
                    if (data.pagesMgr.getSync(i.id)) {
                        pagelist.splice(0, 1);
                    } else {
                        id = i.id;
                        break;
                    }
                }
                if (id) {
                    await data.pagesMgr.get(id);
                    pagelist.splice(0, 1);
                }
            }
        }

        taskMgr.add(pageloadTask, TaskPriority.normal);

        // let hasLoadFreeSymbols = false;
        // const freesymbolTask = new class implements Task {
        //
        //     isValid(): boolean {
        //         return true;
        //     }
        //     isDone(): boolean {
        //         return hasLoadFreeSymbols;
        //     }
        //     async run(): Promise<void> {
        //         const loader = data.__freesymbolsLoader;
        //         loader && await loader();
        //         hasLoadFreeSymbols = true;
        //     }
        // }
        // taskMgr.add(freesymbolTask, TaskPriority.normal);

        taskMgr.startLoop();
}