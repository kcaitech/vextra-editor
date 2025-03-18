/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ArtboardView, ShapeView, SymbolView } from "@kcdesign/data";
import { ShapeDom } from "@/components/Document/Content/vdom/shape";
import { Context } from "@/context";
import { Selection } from "@/context/selection";
import { nextTick } from "vue";
import { hidden_selection } from "@/utils/content";

export class StyleManager {
    static Slide = 'transition-200';
    static Alpha = 'opacity-for-preview';

    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    private __timer: Set<any> = new Set();

    private __elements_with_slide: Set<Element> = new Set();

    slidifyEnv(env: SymbolView | ArtboardView) {
        const children = env.childs.filter(c => c.isVisible);
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

    smoothScroll(cb: () => void) {
        const context = this.context;
        const pageViewEl = context.workspace.pageView;
        if (!pageViewEl) return;
        pageViewEl.classList.add('transition-200');
        hidden_selection(context);
        context.tool.setTitleVisible(!context.tool.isShowTitle);
        let timer: any = setTimeout(() => {
            pageViewEl.classList.remove('transition-200');
            context.selection.notify(Selection.HIDDEN_RESET);
            context.tool.setTitleVisible(!context.tool.isShowTitle);
            clearTimeout(timer);
            timer = null;
        }, 220);
        nextTick(cb);
    }
}