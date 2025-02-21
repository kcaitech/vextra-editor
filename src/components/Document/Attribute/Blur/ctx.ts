import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import {
    Api,
    Basic,
    BasicArray,
    Blur,
    BlurMask,
    BlurType,
    Point2D, BlurModifier,
    ShapeView,
    SymbolRefView
} from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { get_actions_add_mask, get_actions_blur_mask } from "@/utils/shape_style";
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

function stringifyBlur(sye: { view: ShapeView, blur: Blur | undefined }) {
    if (sye.view.blurMask) return sye.view.blurMask;
    let str = '';
    if (sye.view.blur) {
        const b = sye.view.blur;
        str += b.type + b.saturation + b.isEnabled;
    }
    return str;
}

export class BlurContextMgr extends StyleCtx {
    constructor(protected context: Context, public blurCtx: BlurContext) {
        super(context);
    }

    private m_editor: BlurModifier | undefined;

    protected get editor(): BlurModifier {
        return this.m_editor ?? (this.m_editor = new BlurModifier(this.repo));
    }

    private modifyMixedStatus() {
        const selected = this.selected;
        if (selected.length < 2) return this.blurCtx.mixed = false;
        const allBlur = selected.map(i => ({ blur: i.style.blur, view: i }));
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
        this.blurCtx.mask = represent.blurMask;
        if (this.blurCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.blurCtx.mask) as BlurMask;
            this.blurCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
            }
            const b = mask.blur;
            this.blurCtx.blur = { enable: b.isEnabled, type: b.type, saturation: b.saturation, blur: b };
        } else {
            if (represent.blur) {
                const b = represent.blur;
                this.blurCtx.blur = { enable: b.isEnabled, type: b.type, saturation: b.saturation, blur: b };
            } else {
                this.blurCtx.blur = undefined;
            }
            this.blurCtx.maskInfo = undefined;
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
        const views: ShapeView[]=[];
        const needOverride: ShapeView[] = [];
        for (const view of this.shapes) {
            if (view instanceof SymbolRefView || view.isVirtualShape) {
                needOverride.push(view);
            } else {
                views.push(view);
            }
        }
        const modifyLocal = (api: Api) => {
            views.forEach(view => api.addBlur(view.style, blur));
        }
        const modifyVariable = (api: Api) => {
            needOverride.forEach(view => {
                const variable = this.editor.getBlurVariable(api, this.page, view);
                api.shapeModifyVariable(this.page.data, variable, blur);
            });
        }
        this.editor.createBlur([modifyLocal, modifyVariable]);
        this.hiddenCtrl();
    }

    unify() {
        const editor = this.editor;

        const blurMaskView = this.shapes.find(i => i.blurMask);
        if (blurMaskView) {
            editor.unifyShapesBlurMask(this.shapes, blurMaskView.blurMask!);
        } else {
            const blur = editor.importBlur(this.shapes.find(i => i.blur)!.blur!);
            const locals: ShapeView[] = [];
            const links: ShapeView[] = [];
            for (const view of this.shapes) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    links.push(view);
                } else {
                    locals.push(view);
                }
            }

            const modifyLocal = (api: Api) => {
                locals.forEach((view: ShapeView) => {
                    api.addBlur(view.style, blur);
                });
            }
            const modifyVariable = (api: Api) => {
                links.forEach(view => {
                    const variable = editor.getBlurVariable(api, this.page, view);
                    api.shapeModifyVariable(this.page.data, variable, blur);
                })
            }
            editor.unifyShapesBlur([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
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
        // this.editor.setShapeBlurType(actions);
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
        // this.editor.setShapeBlurEnabled(actions);
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
        // this.editor.setShapeBlurSaturation(actions);
        this.hiddenCtrl();
    }

    removeBlur() {
        const actions: { style: Basic & { blur?: Blur; } }[] = [];
        for (let i = 0; i < this.shapes.length; i++) {
            actions.push({ style: this.shapes[i].style });
        }
        // this.editor.shapeDeleteBlur(actions);
        this.hiddenCtrl();
    }

    createStyleLib(name: string, desc: string) {
        const {isEnabled,motionAngle,saturation,type}=this.blurCtx.blur?.blur!;
        const blur = new Blur([0] as BasicArray<number>, isEnabled, new Point2D(0, 0), saturation, type);
        const blurMask = new BlurMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, blur);
        this.editor4Doc.insertStyleLib(blurMask, this.page, this.selected);
        this.kill();
    }

    modifyBlurMask(maskID: string) {
        const actions = get_actions_add_mask(this.shapes, maskID);
        // this.editor.shapesSetBlurMask(actions);
        this.hiddenCtrl();
        this.kill();
    }

    unbind() {
        const actions = get_actions_blur_mask(this.shapes);
        // this.editor.shapesDelBlurMask(actions);
    }

    removeMask() {
        // this.editor.shapesDelStyleBlur(this.shapes);
    }
}