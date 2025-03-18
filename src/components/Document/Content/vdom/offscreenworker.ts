/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { objectId } from "@kcdesign/data";
import { WorkerArgs, WorkerResult } from "./offscreenrender";
// const workerURL = new URL('./offscreenrender', import.meta.url);
// console.log("workerURL", workerURL)

// 暂时不能用

export interface Task {
    cancled?: boolean,
    canvas: OffscreenCanvas,
    scale: number,
    version: number,
    id: number,
    svg: string,
    ondone: (task: Task, image: ImageBitmap) => void
}

type TaskList = Task[]

const worker_number = 4;
export class OffscreenWorker {
    private tasks: TaskList = [];
    private workers: Worker[] = [];
    private idleworkers: Worker[] = [];
    private workingtask: Map<number, Task> = new Map();

    post(task: Task) {
        this.tasks.push(task);
        this._prepare();
        this._continue();
    }

    private _prepare() {
        if (this.idleworkers.length > 0 || this.workers.length >= worker_number) return;
        const worker = new Worker(new URL('./offscreenrender', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
            console.log("onmessage", e);
            this.onmessage(worker, e.data as WorkerResult);
        }
        worker.onerror = (e: ErrorEvent) => {
            // todo
            console.error(e);
        }
        worker.onmessageerror = (e: MessageEvent) => {
            console.error(e);
        }
        this.workers.push(worker);
        this.idleworkers.push(worker);
    }

    private _continue() {
        while (this.idleworkers.length > 0) {
            let task = this.tasks.pop(); // 后来先执行了
            while (task && task.cancled) task = this.tasks.pop();
            if (!task) break;
            const worker = this.idleworkers.pop()!;
            this.workingtask.set(objectId(task), task);
            this.postMessage(worker, { canvas: task.canvas, svg: task.svg, taskId: objectId(task) });
        }
    }

    private postMessage(worker: Worker, args: WorkerArgs) {
        // console.log("postMessage", worker, args)
        worker.postMessage(args, [args.canvas]);
    }

    private onmessage(worker: Worker, result: WorkerResult) {
        this.idleworkers.push(worker);
        this._continue();
        // const result = e.data as WorkerResult;
        const task = this.workingtask.get(result.args.taskId);
        if (task && !task.cancled) task.ondone(task, result.image);
    }
}