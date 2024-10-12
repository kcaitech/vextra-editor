import { ArtboradView, ShapeView, SymbolView } from "@kcdesign/data";
import { ShapeDom } from "@/components/Document/Content/vdom/shape";
import { Context } from "@/context";

export class StyleManager {
    static Slide = 'transition-200';
    static Alpha = 'opacity-for-preview';

    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    private __elements_with_slide: Set<Element> = new Set();

    slidifyEnv(env: SymbolView | ArtboradView) {
        const children = env.childs;
        for (const shape of children) {
            const el = (shape as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Slide);
            this.__elements_with_slide.add(el);
        }
    }

    slidifySel(shapes: ShapeView[]) {
        for (const shape of shapes) {
            const el = (shape as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Slide);
            this.__elements_with_slide.add(el);
        }
    }

    clearSlide() {
        this.__elements_with_slide.forEach(element => element.classList.remove(StyleManager.Slide));
        this.__elements_with_slide.clear();
    }

    private __elements_with_opacity: Set<Element> = new Set();

    alphaSel(shapes: ShapeView[]) {
        for (const view of shapes) {
            const el = (view as ShapeDom).el;
            if (!el) return;
            el.classList.add(StyleManager.Alpha);
            this.__elements_with_opacity.add(el);
        }
    }

    disAlphaSel() {
        this.__elements_with_opacity.forEach(el => el.classList.remove(StyleManager.Alpha));
        this.__elements_with_opacity.clear();
    }
}