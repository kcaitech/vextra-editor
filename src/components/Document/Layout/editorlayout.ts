/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";

export type EditorGUI = {
    top: boolean;
    left: boolean;
    right: boolean;
    leftTrigger: boolean;
    rightTrigger: boolean;
};

export class EditorLayout {
    private m_context: Context;
    private m_layout: EditorGUI | undefined;
    private m_next: string = '';

    constructor(context: Context) {
        this.m_context = context;
    }

    set gui(gui: EditorGUI) {
        this.m_layout = gui;
    }

    private modifyNext() {
        if (!this.m_layout) return;
        if (this.m_layout.left && this.m_layout.right && this.m_layout.top) {
            this.m_next = this.m_context.workspace.t('layout.hideUI');
        } else {
            this.m_next = this.m_context.workspace.t('layout.showUI');
        }
    }

    right(t?: boolean) {
        if (!this.m_layout) return;
        this.m_layout.right = t ?? !this.m_layout.right;
        this.modifyNext();
    }

    left(t?: boolean) {
        if (!this.m_layout) return;
        this.m_layout.left = t ?? !this.m_layout.left;
        this.modifyNext();
    }

    side() {
        if (!this.m_layout) return;
        if (this.m_layout.left !== this.m_layout.right) {
            this.m_layout.left = this.m_layout.right = true;
        } else if (this.m_layout.left) {
            this.m_layout.left = this.m_layout.right = false;
        } else {
            this.m_layout.left = this.m_layout.right = true;
        }
        this.modifyNext();
    }

    all() {
        if (!this.m_layout) return;
        if (!this.m_layout.left || !this.m_layout.right || !this.m_layout.top) {
            this.m_layout.left = this.m_layout.right = this.m_layout.top = true;
        } else {
            this.m_layout.left = this.m_layout.right = this.m_layout.top = false;
        }
        this.modifyNext();
    }

    set next(v: string) {
        this.m_next = v;
    }

    get next() {
        return this.m_next;
    }
}