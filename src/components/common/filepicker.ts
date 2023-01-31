export class FilePicker {
    private _onpick: (v: File) => void;
    private _el: HTMLInputElement | undefined;
    constructor(onpick: (v: File) => void) {
        this._onpick = onpick;
    }
    getEl() {
        if (!this._el) {
            this._el = document.createElement('input');
            this._el.style.display = 'none';
            this._el.type = 'file';
            this._el.accept = '.sketch';
            this._el.addEventListener('change', this.onChange.bind(this));
            document.body.appendChild(this._el);
        }
        return this._el;
    }

    onChange() {
        const files = this._el?.files;
        if (files && files.length > 0) {
            this._onpick(files[0]);
        }
    }

    invoke() {
        this.getEl().click();
    }

    unmount() {
        if (this._el) {
            this._el.remove();
            this._el = undefined;
        }
    }
}
