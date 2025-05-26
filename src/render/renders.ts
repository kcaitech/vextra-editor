/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

// 多线程绘制

import { CanvasCache } from "./canvascache"
import { Memory } from "./memory"
import { ThreadPool } from "./threadpool"

const thread_count = Math.min(4, Math.max(navigator.hardwareConcurrency, 2))
export class Render {
    private canvas: CanvasCache = new CanvasCache(thread_count * 2, 15000/* 15s */)
    private threads: ThreadPool = new ThreadPool(thread_count)
    private memory: Memory = new Memory()



}