import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { Basic, BasicArray, Blur, BlurMask, BlurType, Point2D, Style } from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { get_actions_add_blur, get_actions_add_mask, get_actions_blur_mask, get_actions_blur_unify } from "@/utils/shape_style";
import { v4 } from "uuid";

export type BlurCatch = {
    enable: boolean;
    type: BlurType;
    saturation: number;
    blur: Blur;
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
        str += b.type + b.saturation + b.isEnabled;
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
        const allBlur = selected.map(i => ({ blur: i.style.blur, style: i.style }));
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
            const b = mask.blur;
            this.blurCtx.blur = { enable: b.isEnabled, type: b.type, saturation: b.saturation, blur: b };
        } else {
            this.blurCtx.maskInfo = undefined;
            if (represent.style.blur) {
                const b = represent.style.blur;
                this.blurCtx.blur = { enable: b.isEnabled, type: b.type, saturation: b.saturation, blur: b };
            } else {
                this.blurCtx.blur = undefined;
            }
        }
    }

    update() {
        this.getSelected();
        this.modifyMixedStatus();
        this.updateBlur();
    }

    init() {
        if (this.blurCtx.blur || this.blurCtx.mask) return;
        this.create();
    }

    create() {
        if (this.blurCtx.mixed) this.unify();
        const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
        this.editor.shapesAddBlur(get_actions_add_blur(this.shapes, blur));
        this.hiddenCtrl();
    }

    unify() {
        const actions = get_actions_blur_unify(this.shapes);
        this.editor.shapesBlurUnify(actions);
        this.hiddenCtrl();
    }

    modifyBlurType(blur: Blur, type: BlurType) {
        const actions: { blur: Blur, value: BlurType }[] = [];
        if (blur.parent instanceof BlurMask) {
            actions.push({ blur: blur, value: type });
        } else {
            for (let i = 0; i < this.selected.length; i++) {
                const shape = this.selected[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value: type });
            }
        }
        this.editor.setShapeBlurType(actions);
        this.hiddenCtrl();
    }

    modifyEnable(blur: Blur) {
        const actions: { blur: Blur, value: boolean }[] = [];
        if (blur.parent instanceof BlurMask) {
            actions.push({ blur: blur, value: !blur.isEnabled });
        } else {
            for (let i = 0; i < this.selected.length; i++) {
                const shape = this.selected[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value: !blur.isEnabled });
            }
        }
        this.editor.setShapeBlurEnabled(actions);
        this.hiddenCtrl();
    }

    modifyBlurSaturation(blur: Blur, value: number) {
        const actions: { blur: Blur, value: number }[] = [];
        if (blur!.parent instanceof BlurMask) {
            actions.push({ blur: blur!, value });
        } else {
            for (let i = 0; i < this.selected.length; i++) {
                const shape = this.selected[i];
                if (shape.style.blur) actions.push({ blur: shape.style.blur, value });
            }
        }
        this.editor.setShapeBlurSaturation(actions);
        this.hiddenCtrl();
    }

    removeBlur() {
        const actions: { style: Basic & { blur?: Blur; } }[] = [];
        for (let i = 0; i < this.shapes.length; i++) {
            actions.push({ style: this.shapes[i].style });
        }
        this.editor.shapeDeleteBlur(actions);
        this.hiddenCtrl();
    }

    unbind() {
        const actions = get_actions_blur_mask(this.shapes);
        this.editor.shapesDelBlurMask(actions);
    }

    removeMask() {
        this.editor.shapesDelStyleBlur(this.shapes);
    }

    modifyBlurMask(maskID: string) {
        const actions = get_actions_add_mask(this.shapes, maskID);
        this.editor.shapesSetBlurMask(actions);
        this.hiddenCtrl();
        this.kill();
    }
    createStyleLib(name: string, desc: string) {
        const {isEnabled,motionAngle,saturation,type}=this.blurCtx.blur?.blur!;
        const blur = new Blur([0] as BasicArray<number>, isEnabled, new Point2D(0, 0), saturation, type);
        const blurMask = new BlurMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, blur);
        this.editor4Doc.insertStyleLib(blurMask, this.page, this.selected);
        this.kill();
    }

}