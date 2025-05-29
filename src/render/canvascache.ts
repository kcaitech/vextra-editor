/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */


const min_canvas_size = 100 // 考虑根据设备设置？
const max_usable_size_ratio = 4

function matchSize(canvas: OffscreenCanvas, width: number, height: number) {
    return canvas.width >= width &&
        canvas.height >= height &&
        canvas.width < width * max_usable_size_ratio &&
        canvas.height < height * max_usable_size_ratio
}

// 管理一批OffscreenCanvas
export class CanvasCache {
    // 自动清理掉超出capacity且空闲一段时间的canvas
    private maxidlecount: number
    private maxidletime: number

    private _idle: { canvas: OffscreenCanvas, lastuse: number }[] = []

    constructor(maxidlecount: number, maxidletime: number) {
        this.maxidlecount = maxidlecount
        this.maxidletime = maxidletime
    }

    get(width: number, height: number): OffscreenCanvas {
        // 有空闲的canvas时,找个最接近大小的
        // 无空闲时生成一个特定大小的
        if (width < min_canvas_size) width = min_canvas_size
        if (height < min_canvas_size) height = min_canvas_size
        let idx = -1
        for (let i = 0, len = this._idle.length; i < len; ++i) {
            const idle = this._idle[i]
            if (!matchSize(idle.canvas, width, height)) {
                continue
            }
            if (idx >= 0) {
                const idle2 = this._idle[idx]
                if (idle.canvas.width * idle.canvas.height < idle2.canvas.width * idle2.canvas.height) {
                    idx = i
                }
            } else {
                idx = i
            }
        }
        if (idx >= 0) {
            const idle = this._idle.splice(idx, 1)[0]
            return idle.canvas
        }

        const canvas = new OffscreenCanvas(width, height)
        return canvas
    }
    put(canvas: OffscreenCanvas) {
        this._idle.push({ canvas, lastuse: Date.now() })
        this._release()
    }

    private _release() {
        if (this._idle.length <= this.maxidlecount) return;
        const now = Date.now()
        for (let i = 0, len = this._idle.length; i < len && len > this.maxidlecount;) {
            const idle = this._idle[i]
            if (now - idle.lastuse > this.maxidletime) {
                this._idle.splice(i, 1)
                --len
            } else {
                ++i
            }
        }
    }
}