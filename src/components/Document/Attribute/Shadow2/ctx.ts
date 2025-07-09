/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    Color,
    BasicArray,
    Shadow,
    ShadowMask,
    ShadowPosition,
    ShadowsModifier,
    ShapeView, SymbolRefView, StyleMangerMember
} from "@kcdesign/data";
import { Context } from "@/context";
import { Opt } from "@kcdesign/data";
type Operator = Opt.Operator;
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";

function stringifyShadows(sye: { view: ShapeView, shadows: Shadow[] }) {
    if (sye.view.shadowsMask) return sye.view.shadowsMask;
    return sye.shadows.reduce((p, c) => p + stringifyShadow(c), '')
    function stringifyShadow(shadow: Shadow) {
        let str = '';
        str += shadow.color.red + ','
            + shadow.color.green + ','
            + shadow.color.blue + ','
            + shadow.color.alpha + ','
            + shadow.offsetX + ','
            + shadow.offsetY + ','
            + shadow.blurRadius + ','
            + shadow.spread + ','
            + shadow.position + ','
            + shadow.isEnabled;
        return str;
    }
}

export type ShadowCatch = {
    shadow: Shadow;
}

export type ShadowsContext = {
    mixed: boolean;
    shadows: ShadowCatch[];

    mask?: string;
    maskInfo?: MaskInfo;
}

export class ShadowsContextMgr extends StyleCtx {
    constructor(protected context: Context, public shadowCtx: ShadowsContext) {
        super(context);
    }

    private m_editor: ShadowsModifier | undefined;

    protected get editor(): ShadowsModifier {
        return this.m_editor ?? (this.m_editor = new ShadowsModifier(this.repo));
    }

    private modifyMixedStatus() {
        if (this.flat.length < 1) return;
        if (this.flat.length < 2) return this.shadowCtx.mixed = false;
        const allShadows = this.flat.map(i => ({ shadows: i.getShadows(), view: i }));

        let firstL = allShadows[0].shadows.length;
        for (const s of allShadows) if (s.shadows.length !== firstL) return this.shadowCtx.mixed = true;

        const stringF = stringifyShadows(allShadows[0]);
        for (let i = 1; i < allShadows.length; i++) {
            const str = stringifyShadows(allShadows[i]);
            if (str !== stringF) return this.shadowCtx.mixed = true;
        }
        return this.shadowCtx.mixed = false;
    }

    private updateShadows() {
        if (this.shadowCtx.mixed || this.flat.length < 1) return;

        const represent = this.flat[0];
        this.shadowCtx.mask = represent.shadowsMask;
        if (this.shadowCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.shadowCtx.mask) as ShadowMask;
            this.shadowCtx.maskInfo = {
                name: mask.name,
                desc: mask.description,
                disabled: mask.disabled
            }
        } else {
            this.shadowCtx.maskInfo = undefined;
        }

        const origin = represent.getShadows();
        const replace: ShadowCatch[] = [];
        for (let i = origin.length - 1; i > -1; i--) replace.push({ shadow: origin[i] });
        this.shadowCtx.shadows = replace;
    }

    private getIndexByShadow(shadow: Shadow) {
        return (shadow.parent as unknown as Shadow[])?.findIndex(i => i === shadow) ?? -1;
    }

    update() {
        this.modifyMixedStatus();
        this.updateShadows();
    }

    init() {
        if (!this.shadowCtx.shadows.length && !this.shadowCtx.mixed) this.create();
    }

    create(mask?: ShadowMask) {
        if (this.shadowCtx.mixed) return this.unify();

        if (mask) {
            const color = new Color(0.3, 0, 0, 0);
            const shadow = new Shadow(new BasicArray(), v4(), true, 10, color, 0, 4, 0, ShadowPosition.Outer);
            this.editor.createShadow([(api: Operator) => {
                api.addShadow(mask.shadows, shadow, mask.shadows.length);
            }]);
        } else {
            const actions: { shadows: BasicArray<Shadow>, shadow: Shadow }[] = [];
            const viewActions: { view: ShapeView, shadow: Shadow }[] = [];
            for (const view of this.flat) {
                const color = new Color(0.3, 0, 0, 0);
                const shadow = new Shadow(new BasicArray(), v4(), true, 10, color, 0, 4, 0, ShadowPosition.Outer);
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    viewActions.push({ view, shadow });
                } else {
                    actions.push({ shadows: view.getShadows(), shadow });
                }
            }
            const modifyLocalShadows = (api: Operator) => {
                actions.forEach(action => api.addShadow(action.shadows, action.shadow, action.shadows.length));
            };
            const modifySymbolRefShadows = (api: Operator) => {
                for (const action of viewActions) {
                    const variable = this.editor.getShadowsVariable(api, this.page, action.view);
                    api.addShadow(variable.value, action.shadow, variable.value.length);
                }
            }
            this.editor.createShadow([modifyLocalShadows, modifySymbolRefShadows]);
            this.hiddenCtrl();
        }
    }

    unify() {
        const shadowsMaskView = this.flat.find(i => i.shadowsMask);
        if (shadowsMaskView) {
            this.editor.unifyShapesShadowsMask(this.flat, shadowsMaskView.fillsMask!);
        } else {
            const containers: BasicArray<Shadow>[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else containers.push(view.getShadows());
            }
            const editor = this.editor;
            const master = this.flat[0].getShadows().map(i => editor.importShadow(i));
            const modifyLocalFills = (api: Operator) => {
                if (!containers.length) return;
                for (const container of containers) {
                    api.deleteShadows(container, 0, container.length);
                    api.addShadows(container, master.map(i => editor.importShadow(i)));
                }
            };
            const modifyVariableFills = (api: Operator) => {
                if (!views.length) return;
                for (const view of views) {
                    const fills = editor.getShadowsVariable(api, this.page, view).value;
                    api.deleteShadows(fills, 0, fills.length);
                    api.addShadows(fills, master.map(i => editor.importShadow(i)));
                }
            };
            editor.unifyShapesShadows([modifyLocalFills, modifyVariableFills]);
        }

        this.hiddenCtrl();
    }

    remove(shadow: Shadow) {
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            const mask = shadow.parent.parent as ShadowMask;
            this.editor.removeShadows([(api: Operator) => {
                if (mask.shadows.length === 1) return;
                api.deleteShadowAt(mask.shadows, index);
            }]);
        } else {
            const shadowsContainer: BasicArray<Shadow>[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadowsContainer.push(view.getShadows());
                }
            }
            const modifyLocal = (api: Operator) => {
                shadowsContainer.forEach(container => api.deleteShadowAt(container, index));
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.deleteShadowAt(variable.value, index);
                }
            }
            this.editor.removeShadows([modifyLocal, modifyVariable]);
        }
    }

    modifyVisible(shadow: Shadow) {
        const index = this.getIndexByShadow(shadow);
        const enable = !shadow.isEnabled;

        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowEnabled([(api: Operator) => {
                api.setShadowEnable(shadow, enable);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowEnable(shadow, enable);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowEnable(variable.value[index], enable);
                }
            }
            this.editor.setShadowEnabled([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    private modifyRGBA(event: Event, shadow: Shadow, color: Color) {
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowsColor([(api: Operator) => {
                api.setShadowColor(shadow, color);
            }]);
        } else {
            const index = this.getIndexByShadow(shadow);
            const views: ShapeView[] = [];
            const shadowsPacks: { shadow: Shadow, color: Color }[] = [];
            for (const view of this.flat) {
                if (view.isVirtualShape || view instanceof SymbolRefView) views.push(view);
                else shadowsPacks.push({ shadow: view.getShadows()[index], color });
            }
            const modifyLocal = (api: Operator) => {
                for (const pack of shadowsPacks) api.setShadowColor(pack.shadow, pack.color);
            }
            const modifyVariable = (api: Operator) => {
                if (!views.length) return;
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowColor(variable.value[index], color);
                }
            }
            this.editor.setShadowsColor([modifyLocal, modifyVariable])
            this.hiddenCtrl(event);
        }
    }

    modifyShadowHex(event: Event, shadow: Shadow) {
        const rgb = getRGBFromInputEvent(event);
        if (!rgb) return;
        const color = new Color(shadow.color.alpha, rgb[0], rgb[1], rgb[2]);
        this.modifyRGBA(event, shadow, color);
    }

    modifyShadowAlpha(event: Event, shadow: Shadow) {
        const alpha = getNumberFromInputEvent(event);
        if (isNaN(alpha)) return;
        const color = new Color(
            Math.max(0, Math.min(1, alpha / 100)),
            shadow.color.red,
            shadow.color.green,
            shadow.color.blue
        );
        this.modifyRGBA(event, shadow, color);
    }

    modifyShadowPosition(shadow: Shadow, position: ShadowPosition) {
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowsPosition([(api: Operator) => {
                api.setShadowPosition(shadow, position);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowPosition(shadow, position);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowPosition(variable.value[index], position);
                }
            }
            this.editor.setShadowsPosition([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyShadowOffsetX(offsetX: number, shadow: Shadow) {
        if (isNaN(offsetX)) return;
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowOffsetX([(api: Operator) => {
                api.setShadowOffsetX(shadow, offsetX);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowOffsetX(shadow, offsetX);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowOffsetX(variable.value[index], offsetX);
                }
            }
            this.editor.setShadowOffsetX([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyShadowOffsetY(offsetY: number, shadow: Shadow) {
        if (isNaN(offsetY)) return;
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowOffsetY([(api: Operator) => {
                api.setShadowOffsetY(shadow, offsetY);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowOffsetY(shadow, offsetY);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowOffsetY(variable.value[index], offsetY);
                }
            }
            this.editor.setShadowOffsetY([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyShadowBlur(blur: number, shadow: Shadow) {
        if (isNaN(blur)) return;
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowsBlur([(api: Operator) => {
                api.setShadowBlur(shadow, blur);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowBlur(shadow, blur);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowBlur(variable.value[index], blur);
                }
            }
            this.editor.setShadowsBlur([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    modifyShadowSpread(spread: number, shadow: Shadow) {
        if (isNaN(spread)) return;
        const index = this.getIndexByShadow(shadow);
        if (shadow.parent?.parent instanceof ShadowMask) {
            this.editor.setShadowSpread([(api: Operator) => {
                api.setShadowSpread(shadow, spread);
            }]);
        } else {
            const shadows: Shadow[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows()[index]);
                }
            }
            const modifyLocal = (api: Operator) => {
                for (const shadow of shadows) api.setShadowSpread(shadow, spread);
            }
            const modifyVariable = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getShadowsVariable(api, this.page, view);
                    api.setShadowSpread(variable.value[index], spread);
                }
            }
            this.editor.setShadowSpread([modifyLocal, modifyVariable]);
            this.hiddenCtrl();
        }
    }

    createStyleLib(name: string, desc: string) {
        const shadows = new BasicArray<Shadow>(...this.shadowCtx.shadows.map(i => i.shadow).reverse());
        const shadowMask = new ShadowMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, shadows);
        this.editor.createShadowsMask(this.document, shadowMask, this.page, this.flat);
        this.kill();
    }

    modifyShadowMask(id: string) {
        if (Object.keys(this.shadowCtx).length === 0) return;
        this.editor.setShapesShadowsMask(this.page, this.flat, id);
        this.kill();
        this.hiddenCtrl();
    }

    unbind() {
        this.editor.unbindShapesShadowsMask(this.page, this.flat);
    }

    removeMask() {
        this.editor.removeShapesShadowsMask(this.page, this.flat);
    }

    disableMask(mask: StyleMangerMember) {
        this.editor.disableMask(mask);
    }
}