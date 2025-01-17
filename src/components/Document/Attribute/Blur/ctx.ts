import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { Blur, BlurMask, BlurType, Style } from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/Fill2/basic";
import { Context } from "@/context";

export type BlurCatch = {
    enable: boolean;
    type: BlurType;
    saturation: number;
}
export type BlurContext = {
    mixed: boolean;

    blur?: BlurCatch;
    mask?: string;
    maskInfo?: MaskInfo;
}

function stringifyBlur(sye: { style: Style, blur: Blur | undefined }) {
    if (sye.style.blursMask) return sye.style.blursMask;
    let str = '';
    if (sye.style.blur) {
        const b = sye.style.blur;
        str += b.type + b.saturation + b.isEnabled
    }
    return str;
}

export class BlurContextMgr extends StyleCtx {
    constructor(protected context: Context, public blurCtx: BlurContext) {
        super(context);
    }


    private modifyMixedStatus() {
        const selected = this.selected;
        if (selected.length < 2) return this.blurCtx.mixed = false;
        const allBlur = selected.map(i => ({blur: i.blur, style: i.style}));
        const stringF = stringifyBlur(allBlur[0]);
        for (let i = 1; i < allBlur.length; i++) {
            const str = stringifyBlur(allBlur[i]);
            if (str !== stringF) return this.blurCtx.mixed = true;
        }
        return this.blurCtx.mixed = false;
    }

    private updateBlur() {
        if (this.blurCtx.mixed) return;
        const represent = this.selected[0];
        this.blurCtx.mask = represent.style.blursMask;
        if (this.blurCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.blurCtx.mask) as BlurMask;
            this.blurCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
            }
        } else {
            this.blurCtx.maskInfo = undefined;
        }

        if (represent.blur) {
            const b = represent.blur;
            this.blurCtx.blur = {
                enable: b.isEnabled,
                type: b.type,
                saturation: b.saturation
            };
        } else {
            this.blurCtx.blur = undefined;
        }
    }

    update() {
        this.getSelected();
        this.modifyMixedStatus();
        this.updateBlur();
    }
}