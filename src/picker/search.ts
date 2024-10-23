import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";

export class Search {
    private readonly context: Context;
    private readonly SVG: SVGElement;
    private readonly path: SVGPathElement;

    constructor(context: Context) {
        this.context = context;
        this.fire = true;
        this.altStatus = false;
        this.ctrlStatus = false;

        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '10');
        svg.setAttribute('height', '10');
        svg.appendChild(this.path);
        this.SVG = svg;

        document.body.appendChild(svg);
        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', this.keyup);
        window.addEventListener('blur', this.blur);
    }

    private __event: MouseEvent | undefined;

    set event(e: MouseEvent) {
        this.__event = e;
    }

    private __last_cursor: string | undefined;

    private modifyCursor() {
    }

    private rollbackCursor() {
    }

    private altStatus: boolean;
    private ctrlStatus: boolean;

    private __keydown(event: KeyboardEvent) {
        if ((event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) return;
        if (event.repeat) return;

        if (event.altKey) {
            this.altStatus = true;
            this.modifyCursor();
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
            this.rollbackCursor();
        }
        if (event.code === "ControlLeft") {
            this.ctrlStatus = false;
        }

    }

    private keyup = this.__keyup.bind(this);

    private reset() {
        this.altStatus = false;
        this.ctrlStatus = false;
        this.rollbackCursor();
    }

    private __blur() {
        this.reset();
    }

    private blur = this.__blur.bind(this);

    fire: boolean;

    get views(): ShapeView[] {
        return [];
    }

    private __last_view: ShapeView | undefined;

    get view(): ShapeView | undefined {
        if (!this.fire) return;

    }

    destroy() {
        document.body.removeChild(this.SVG);
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
        window.removeEventListener('blur', this.blur);
    }
}