/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { BasicArray, Color, Shadow, ShadowAsyncApi, ShadowMask, ShapeView, SymbolRefView } from "@kcdesign/data";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { Repo } from "@kcdesign/data";
type Api = Repo.Api;

export class ShadowColorPicker extends ColorPickerEditor {
    shadow: Shadow | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.shadow) return this.m_index = 0;
        const parent = this.shadow.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i === this.shadow) ?? -1;
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
    }

    private get api(): ShadowAsyncApi {
        return (this.m_api as unknown as ShadowAsyncApi)
            ?? (this.m_api = new ShadowAsyncApi(this.context.repo, this.context.data, this.page));
    }

    setSolidColor(c: RGBACatch): void {
        super.setSolidColor(c);
        this.updateSelection();
        if (!this.shadow) return;
        const actions = this.getApiParams(this.shadow, c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
        this.commit();
    }

    dragSolidBegin(): void {
        this.updateSelection();
    }

    solidDragging(c: RGBACatch): void {
        super.setSolidColor(c);
        if (!this.shadow) return;
        const actions = this.getApiParams(this.shadow, c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
    }

    getApiParams(shadow: Shadow, c: RGBACatch): Function[] {
        if (shadow.parent?.parent instanceof ShadowMask) {
            return [(api: Api) => {
                api.setShadowColor(this.shadow!, new Color(c.A, c.R, c.G, c.B));
            }];
        } else {
            const shadows: BasicArray<Shadow>[] = [];
            const views: ShapeView[] = [];
            for (const view of this.selected) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    shadows.push(view.getShadows());
                }
            }
            const modifyVariable = (api: Api) => {
                for (const view of views) {
                    const variable = this.api.getShadowsVariable(api, this.page, view);
                    api.setShadowColor(variable.value[this.index], new Color(c.A, c.R, c.G, c.B));
                }
            }
            const modifyLocal = (api: Api) => {
                for (const _shadows of shadows) {
                    api.setShadowColor(_shadows[this.index], new Color(c.A, c.R, c.G, c.B));
                }
            }
            return [modifyVariable, modifyLocal];
        }
    }

    dragSolidEnd(): void {
        this.commit();
    }
}