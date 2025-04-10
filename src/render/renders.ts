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