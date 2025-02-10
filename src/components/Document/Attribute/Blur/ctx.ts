import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { BasicArray, Blur, BlurMask, BlurType, Point2D, Style } from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { get_actions_add_blur, get_actions_add_mask, get_actions_blur_delete, get_actions_blur_enabled, get_actions_blur_mask, get_actions_blur_modify, get_actions_blur_unify } from "@/utils/shape_style";

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
        if (this.shapes[0].style.blursMask) {
            const mask = this.context.data.stylesMgr.getSync(this.shapes[0].style.blursMask) as BlurMask;
            const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
            this.editor.shapesBlurUnify([{ style: mask, blur }]);
        } else {
            const actions = get_actions_blur_unify(this.shapes);
            this.editor.shapesBlurUnify(actions);
        }
        this.hiddenCtrl();
    }

    modifyBlurType(type: BlurType) {
        this.editor.setShapeBlurType(this.shapes.map(i => i.blur!), type);
        this.hiddenCtrl();
    }

    modifyEnable() {
        this.editor.setShapeBlurEnabled(this.shapes.map(i => i.style.blur!), !this.blurCtx.blur!.enable);
        this.hiddenCtrl();
    }

    removeBlur() {
        const actions = get_actions_blur_delete(this.shapes);
        this.editor.shapeDeleteBlur(actions);
        this.hiddenCtrl();
    }

    unbind() {
        const actions = get_actions_blur_mask(this.shapes);
        this.editor.shapesDelBlurMask(actions);
    }

    removeMask() {
        this.editor.shapesDelStyleBlur(this.shapes.map(i => i.style as any));
    }

    modifyBlurMask(maskID: string) {
        const actions = get_actions_add_mask(this.shapes, maskID);
        this.editor.shapesSetBlurMask(actions);
        this.hiddenCtrl();
        this.kill();
    }
}