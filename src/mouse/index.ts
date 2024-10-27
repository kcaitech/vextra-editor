import { Context } from "@/context";
import { Hover } from "@/mouse/hover";
import { Marker } from "@/mouse/marker";

export class Mouse {
    private readonly context: Context;
    private readonly hover: Hover;
    private readonly marker: Marker;

    private __event: MouseEvent | undefined;
    private altStatus: boolean;
    private ctrlStatus: boolean;

    constructor(context: Context) {
        this.context = context;
        this.hover = new Hover(context);
        this.marker = new Marker(context);

        this.altStatus = false;
        this.ctrlStatus = false;
    }

    set event(e: MouseEvent) {
        this.__event = e;
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
        if (event.code === "ControlLeft") {
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
    }

    destroy() {
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
        window.removeEventListener('blur', this.blur);
    }
}