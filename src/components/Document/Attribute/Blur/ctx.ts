import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import {
    Api,
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
        if (this.selected.length < 1) return;
        if (this.selected.length < 2) return this.blurCtx.mixed = false;
        const allBlur = this.selected.map(i => ({ blur: i.style.blur, view: i }));
        const stringF = stringifyBlur(allBlur[0]);
        for (let i = 1; i < allBlur.length; i++) {
            const str = stringifyBlur(allBlur[i]);
            if (str !== stringF) return this.blurCtx.mixed = true;
        }
        return this.blurCtx.mixed = false;
    }

    private updateBlur() {
        if (this.blurCtx.mixed || this.selected.length < 1) return;
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
        const views: ShapeView[] = [];
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
        if (blur.parent instanceof BlurMask) {
            this.editor.modifyBlurType([(api: Api) => {
                api.shapeModifyBlurType(blur, type);
            }]);
        } else {
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
                    api.shapeModifyBlurType(view.blur!, type);
                });
            }
            const modifyVariable = (api: Api) => {
                links.forEach(view => {
                    const variable = this.editor.getBlurVariable(api, this.page, view);
                    api.shapeModifyBlurType(variable.value, type);
                });
            }
            this.editor.modifyBlurType([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyEnable(blur: Blur) {
        const enabled = !blur.isEnabled;
        if (blur.parent instanceof BlurMask) {
            this.editor.modifyBlurEnabled([(api: Api) => {
                api.shapeModifyBlurEnabled(blur, !blur.isEnabled);
            }]);
        } else {
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
                    api.shapeModifyBlurEnabled(view.blur!, enabled);
                });
            }
            const modifyVariable = (api: Api) => {
                links.forEach(view => {
                    const variable = this.editor.getBlurVariable(api, this.page, view);
                    api.shapeModifyBlurEnabled(variable.value, enabled);
                });
            }
            this.editor.modifyBlurEnabled([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyBlurSaturation(blur: Blur, value: number) {
        if (blur.parent instanceof BlurMask) {
            this.editor.modifyBlurSaturation([(api: Api) => {
                api.shapeModifyBlurSaturation(blur, value);
            }]);
        } else {
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
                    api.shapeModifyBlurSaturation(view.blur!, value);
                });
            }
            const modifyVariable = (api: Api) => {
                links.forEach(view => {
                    const variable = this.editor.getBlurVariable(api, this.page, view);
                    api.shapeModifyBlurSaturation(variable.value, value);
                });
            }
            this.editor.modifyBlurSaturation([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    removeBlur() {
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
                api.deleteBlur(view.style);
            });
        }
        const modifyVariable = (api: Api) => {
            links.forEach(view => {
                const variable = this.editor.getBlurVariable(api, this.page, view);
                api.shapeModifyVariable(this.page.data, variable, undefined);
            });
        }
        this.editor.removeBlur([modifyLocal, modifyVariable]);
        this.hiddenCtrl();
    }

    createStyleLib(name: string, desc: string) {
        const { isEnabled, saturation, type } = this.blurCtx.blur?.blur!;
        const blur = new Blur([0] as BasicArray<number>, isEnabled, new Point2D(0, 0), saturation, type);
        const blurMask = new BlurMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, blur);
        this.editor.createBlurMask(this.document, blurMask, this.page, this.selected);
        this.kill();
    }

    modifyBlurMask(maskID: string) {
        if (!this.blurCtx.mask) return;
        this.editor.setShapesBlurMask(this.page, this.shapes, maskID);
        this.kill();
        this.hiddenCtrl();
    }

    unbind() {
        this.editor.unbindShapesBlurMask(this.page, this.shapes);
    }

    removeMask() {
        this.editor.removeShapesBlurMask(this.page, this.shapes);
    }
}