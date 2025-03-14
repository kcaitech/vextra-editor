/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export class FilePicker {
    private _onpick: (v: File) => void;
    private _accept: string;
    private _el: HTMLInputElement | undefined;

    constructor(accept: string, onpick: (v: File) => void) {
        this._onpick = onpick;
        this._accept = accept;
    }

    private getEl() {
        if (!this._el) {
            this._el = document.createElement('input');
            this._el.style.display = 'none';
            this._el.type = 'file';
            this._el.accept = this._accept;
            this._el.addEventListener('change', this.onChange.bind(this));
            document.body.appendChild(this._el);
        }
        return this._el;
    }

    private onChange() {
        const files = this._el?.files;
        if (files && files.length > 0) {
            this._onpick(files[0]);
        }
    }

    invoke() {
        this.getEl().click();
        const __el = this.getEl() as HTMLInputElement;
        if (__el && __el.value) __el.value = ''
    }

    unmount() {
        if (this._el) {
            this._el.remove();
            this._el = undefined;
        }
    }
}
