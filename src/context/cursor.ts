/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcdesign/data";
import { CursorPicker, CursorType } from "@/utils/cursor2";

export class Cursor extends WatchableObject {
    static CHANGE_CURSOR = 1;
    static RESET = 2;
    private m_current_cursor_type: string = '';
    private m_styler: CursorPicker;
    private m_freeze: boolean = false;
    private m_auto: string = '';
    private m_stash: string = '';

    constructor() {
        super();
        this.m_styler = new CursorPicker();
    }

    init() {
        const auto = this.m_styler.getClass(CursorType.Auto, 0);
        if (!auto) {
            return;
        }

        this.m_auto = auto;

        this.notify(Cursor.CHANGE_CURSOR, auto);
    }

    get type() {
        return this.m_current_cursor_type;
    }

    get is_freeze() {
        return this.m_freeze;
    }

    cursor_freeze(val: boolean) {
        this.m_freeze = val;
    }

    setType(type: CursorType, rotate: number) {
        if (this.m_freeze) return;
        let res = this.m_styler.getClass(type, rotate) || this.m_auto;
        this.m_current_cursor_type = res;
        this.notify(Cursor.CHANGE_CURSOR, res);
    }

    setTypeForce(type: CursorType, deg: number) {
        let res = this.m_styler.getClass(type, deg) || this.m_auto;

        this.m_current_cursor_type = res;
        this.notify(Cursor.CHANGE_CURSOR, res);
    }

    stash() {
        this.m_stash = this.m_current_cursor_type;
    }

    rollback() {
        if (this.m_stash) {
            this.m_current_cursor_type = this.m_stash;
            this.notify(Cursor.CHANGE_CURSOR, this.m_current_cursor_type);
        } else {
            this.reset();
        }
    }

    reset() {
        if (this.m_freeze) return;
        this.m_current_cursor_type = this.m_auto;
        this.notify(Cursor.CHANGE_CURSOR, this.m_auto);
    }

    resetForce() {
        this.m_current_cursor_type = this.m_auto;
        this.notify(Cursor.CHANGE_CURSOR, this.m_auto);
    }

    remove() {
        this.m_styler.remove();
    }
}