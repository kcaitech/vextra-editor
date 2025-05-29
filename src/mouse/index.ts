/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Hover } from "@/mouse/hover";
import { Marker } from "@/mouse/marker";

interface MouseEventLike {
    clientX: number;
    clientY: number;
}
export class Mouse {
    private readonly context: Context;
    private readonly hover: Hover;
    private readonly marker: Marker;

    private __event: MouseEventLike | undefined;
    private altStatus: boolean;
    private ctrlStatus: boolean;
    private shiftStatus: boolean;

    constructor(context: Context) {
        this.context = context;
        this.hover = new Hover(context);
        this.marker = new Marker(context);

        this.altStatus = false;
        this.ctrlStatus = false;
        this.shiftStatus = false;
    }

    private __keydown(event: KeyboardEvent) {
        if ((event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) return;
        if (event.repeat) return;

        if (event.altKey) {
            this.altStatus = true;
        }
        if (event.ctrlKey || event.metaKey) {
            this.ctrlStatus = true;
        }

    }

    private keydown = this.__keydown.bind(this);

    private __keyup(event: KeyboardEvent) {
        if ((event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) return;
        if (event.code === "AltLeft") {
            this.altStatus = false;
        }
        if (event.code === "ControlLeft" || event.code === "MetaLeft") {
            this.ctrlStatus = false;
        }
    }

    private keyup = this.__keyup.bind(this);

    private __blur() {
        this.reset();
    }

    private blur = this.__blur.bind(this);

    private reset() {
        this.altStatus = false;
        this.ctrlStatus = false;
        this.shiftStatus = false;
    }

    set event(e: MouseEventLike) {
        this.__event = e;
    }

    move() {

    }

    down() {

    }

    up() {

    }
    destroy() {
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
        window.removeEventListener('blur', this.blur);
    }
}