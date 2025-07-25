/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { XY } from "@/context/selection";

/**
 * @description 主键拖拽集成工具
 */
export class DragKit {
    private readonly m_down: Function;
    private readonly m_move: Function;
    private readonly m_commit: Function;
    private readonly m_stop: boolean;

    constructor(options: {
        down?: Function, /* 注意这几个函数的this指向 */
        move?: Function,
        commit?: Function,
        stop?: boolean  /* 是否阻止事件冒泡，默认为true */
    }) {
        this.m_down = options.down ?? (() => {});
        this.m_move = options.move ?? (() => {});
        this.m_commit = options.commit ?? (() => {});
        this.m_stop = options.stop ?? true;
        this.m_origin_xy = {x: 0, y: 0};
        this.m_down_xy = {x: 0, y: 0};
        this.m_is_dragging = false;
    }

    private m_is_dragging: boolean;
    private _move(event: MouseEvent) {
        if (event.button) return;
        this.m_is_dragging = true;
        const dx = event.clientX - this.m_down_xy.x;
        const dy = event.clientY - this.m_down_xy.y;
        this.m_move(event, this.m_origin_xy.x + dx, this.m_origin_xy.y + dy);
    }

    private shut(event?: MouseEvent) {
        this.m_commit(event);
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.up);
        window.removeEventListener('blur', this.blur);
    }

    private _up(event: MouseEvent) {
        if (event.button === 0) this.shut(event);
    }

    private _blur() {
        this.shut();
    }

    private move = this._move.bind(this);
    private up = this._up.bind(this);
    private blur = this._blur.bind(this);

    private m_origin_xy: XY;
    private m_down_xy: XY;

    get isDragging() {
        return this.m_is_dragging;
    }

    // params 中的xy接收start执行时某一变量[refVal]在对应维度的值。这个值会在move中加上clientXY的delta值作为参数传递出去，可用来更新[refVal]。
    start(event: MouseEvent, params?: { x?: number, y?: number }) {
        if (event.button) return;
        this.m_origin_xy = {x: params?.x ?? event.clientX, y: params?.y ?? event.clientY};
        this.m_down_xy = {x: event.clientX, y: event.clientY};
        if (this.m_stop) event.stopPropagation();
        this.m_down(event);
        document.addEventListener('mousemove', this.move);
        document.addEventListener('mouseup', this.up);
        window.addEventListener('blur', this.blur);
    }
}