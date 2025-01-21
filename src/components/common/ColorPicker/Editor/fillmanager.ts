import { FillContext, IFillModifier } from "@/components/common/ColorPicker/Editor/basic";
import { Context } from "@/context";
import { FillCatch } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill, FillType } from "@kcdesign/data";

export class FilterModifier {
    move: (ev: MouseEvent) => any;
    up: (ev: MouseEvent) => any;
    blur: () => any;

    constructor(private modifier: FillModifier) {
        this.type = 'exposure';
        this.dragging = false;

        this.move = this._move.bind(this);
        this.up = this._up.bind(this);
        this.blur = this._blur.bind(this);
    }

    private type: string;
    private dragging: boolean;

    down(event: MouseEvent, type: string) {
        if (event.button) {
            event.stopPropagation();
            this.type = type;
            document.addEventListener('mousemove', this.move);
            document.addEventListener('mouseup', this.up);
            window.addEventListener('blur', this.blur);
        }
    }

    private _move(event: MouseEvent) {
    }

    private _up() {
        this.shut();
    }

    private _blur() {
        this.shut();
    }

    private shut() {
        this.dragging = false;
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.up);
        window.removeEventListener('blur', this.blur);
    }
}

export class FillModifier extends IFillModifier {
    constructor(protected context: Context, private ctx: FillContext) {
        super(context);
    }

    update(raw: FillCatch | Fill) {
        const fill = (raw as FillCatch).fill ?? raw;
        let type: string = fill.fillType;
        this.ctx.RGBAs = [];
        if (type === FillType.Gradient) {
            type = fill.gradient!.gradientType;
            fill.gradient!.stops.forEach(s => {
                this.ctx.RGBAs.push({
                    R: s.color.red,
                    G: s.color.green,
                    B: s.color.blue,
                    A: s.color.alpha,
                    position: s.position
                });
            });
        } else if (type === FillType.Pattern) {

        } else {
            this.ctx.RGBAs.push({
                R: fill.color.red,
                G: fill.color.green,
                B: fill.color.blue,
                A: fill.color.alpha,
                position: 1
            });
        }
        this.ctx.type = type;
    }

    modifyRGBA() {
        const views = this.flat;
    }

    modifyFillType() {
        const views = this.flat;
    }

    createStop(position: number) {
        const views = this.flat;
    }

    removeStop() {
        const views = this.flat;
    }

    reverseStops() {
        const views = this.flat;
    }

    rotateStops() {
        const views = this.flat;
    }

    modifyObjectFit() {
    }

    rotateImage() {
    }
}