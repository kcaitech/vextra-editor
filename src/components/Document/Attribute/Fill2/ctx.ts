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
    Fill, FillMask, FillType, Gradient, PaintFilter, PatternTransform, Stop,
    Color, BasicArray, ArtboardView, FillModifier, ShapeView, SymbolRefView, StyleMangerMember
} from "@kcaitech/vextra-core";
import { Context } from "@/context";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { Opt } from "@kcaitech/vextra-core";
type Operator = Opt.Operator;
export type FillCatch = {
    fill: Fill;
}

export type FillsContext = {
    mixed: boolean;
    listStatus: boolean,
    fills: FillCatch[];

    mask?: string;
    maskInfo?: MaskInfo;
}

/**
 * 填充模块核心状态管理器，修改填充的所有属性都由管理器完成；
 * 另外还组合了弹框管理器，可以控制相关弹窗
 */
export class FillsContextMgr extends StyleCtx {

    constructor(protected context: Context, public fillCtx: FillsContext) {
        super(context);
    }

    private modifyMixedStatus() {
        if (this.flat.length < 1) return;
        if (this.flat.length < 2) return this.fillCtx.mixed = false;
        const allFills = this.flat.map(i => ({ fills: i.getFills(), shape: i }));

        let firstL = allFills[0].fills.length;
        for (const s of allFills) if (s.fills.length !== firstL) return this.fillCtx.mixed = true;

        const stringF = stringifyFills(allFills[0]);
        for (let i = 1; i < allFills.length; i++) {
            const str = stringifyFills(allFills[i]);
            if (str !== stringF) return this.fillCtx.mixed = true;
        }
        return this.fillCtx.mixed = false;
    }

    private updateFills() {
        if (this.fillCtx.mixed || this.flat.length < 1) return;

        const represent = this.flat[0];
        this.fillCtx.mask = represent.fillsMask;
        if (this.fillCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.fillCtx.mask) as FillMask;
            this.fillCtx.maskInfo = {
                name: mask.name,
                desc: mask.description,
                disabled: mask.disabled
            }
        } else {
            this.fillCtx.maskInfo = undefined;
        }

        const origin = represent.getFills();
        const replace: FillCatch[] = [];
        for (let i = origin.length - 1; i > -1; i--) replace.push({ fill: origin[i] });
        this.fillCtx.fills = replace;
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i.id === fill.id) ?? -1;
    }

    private m_editor: FillModifier | undefined;

    protected get editor(): FillModifier {
        return this.m_editor ?? (this.m_editor = new FillModifier(this.repo));
    }

    // 切换列表风格
    toggleList() {
        const action = !this.fillCtx.listStatus;
        this.fillCtx.listStatus = action;
        localStorage.setItem("styleList", JSON.stringify(action));
    }

    update() {
        this.fillCtx.listStatus = JSON.parse(localStorage.getItem("styleList") ?? JSON.stringify(false));
        this.modifyMixedStatus();
        this.updateFills();
    }

    /* 初始化一个填充 */
    init() {
        if (!this.fillCtx.fills.length && !this.fillCtx.mixed) this.create();
    }

    /* 创建一个填充 */
    create(mask?: FillMask) {
        if (this.fillCtx.mixed) return this.unify();

        const missions: Function[] = [];

        if (mask) {
            const color = new Color(0.2, 0, 0, 0);
            const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
            const caller = (api: Operator) => {
                api.addFillAt(mask.fills, fill, mask.fills.length);
            }
            missions.push(caller);
            return this.editor.createFill(missions);
        }

        const actions: { fills: BasicArray<Fill>, fill: Fill }[] = [];
        const viewActions: { view: ShapeView, fill: Fill }[] = [];
        for (const view of this.flat) {
            let color: Color;
            if (view instanceof ArtboardView) {
                color = new Color(1, 255, 255, 255);
            } else {
                color = new Color(0.2, 0, 0, 0);
            }

            const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);

            if (view instanceof SymbolRefView || view.isVirtualShape) {
                viewActions.push({ view, fill });
            } else {
                actions.push({ fills: view.style.fills, fill: fill });
            }
        }

        const modifyLocalFills = (api: Operator) => {
            actions.forEach(action => api.addFillAt(action.fills, action.fill, action.fills.length));
        };
        const modifySymbolRefFills = (api: Operator) => {
            for (const action of viewActions) {
                const variable = this.editor.getFillsVariable(api, this.page, action.view);
                api.addFillAt(variable.value, this.editor.importFill(action.fill), variable.value.length);
            }
        }

        missions.push(modifyLocalFills, modifySymbolRefFills);
        this.editor.createFill(missions);
        this.hiddenCtrl();
    }

    /* 统一多个图层的填充 */
    unify() {
        const fillsMaskView = this.flat.find(i => i.fillsMask);
        if (fillsMaskView) {
            this.editor.unifyShapesFillsMask(this.flat, fillsMaskView.fillsMask!);
        } else {
            const containers: BasicArray<Fill>[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else containers.push(view.getFills());
            }
            const editor = this.editor;
            const master = this.flat[0].getFills().map(i => editor.importFill(i));

            const modifyLocalFills = (api: Operator) => {
                if (!containers.length) return;
                for (const fillContainer of containers) {
                    api.deleteFills(fillContainer, 0, fillContainer.length);
                    api.addFills(fillContainer, master.map(i => editor.importFill(i)));
                }
            };
            const modifyVariableFills = (api: Operator) => {
                if (!views.length) return;
                for (const view of views) {
                    const fills = editor.getFillsVariable(api, this.page, view).value;
                    api.deleteFills(fills, 0, fills.length);
                    api.addFills(fills, master.map(i => editor.importFill(i)));
                }
            };
            this.editor.unifyShapesFills([modifyLocalFills, modifyVariableFills]);
        }
        this.hiddenCtrl();
    }

    /* 移除一条填充 */
    remove(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor.removeFill([(api: Operator) => {
                if (mask.fills.length === 1) return;
                api.deleteFillAt(mask.fills, this.getIndexByFill(fill));
            }]);
        } else {
            const index = this.getIndexByFill(fill);
            const actions: { fills: BasicArray<Fill>, index: number }[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView && view.isVirtualShape) {
                    views.push(view);
                } else actions.push({ fills: view.getFills(), index });
            }
            const modifyLocalFills = (api: Operator) => {
                actions.forEach(action => api.deleteFillAt(action.fills, action.index));
            }
            const modifyVariableFills = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.deleteFillAt(variable.value, index);
                }
            }
            this.editor.removeFill([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    /* 隐藏或显示一条填充 */
    modifyVisible(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setFillsEnabled([(api: Operator) => {
                api.setFillEnable(fill, !fill.isEnabled);
            }]);
        } else {
            const enable = !fill.isEnabled;
            const index = this.getIndexByFill(fill);
            const fills: Fill[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else {
                    fills.push(view.getFills()[index]);
                }
            }
            const modifyLocalFills = (api: Operator) => {
                for (const fill of fills) api.setFillEnable(fill, enable);
            }
            const modifyVariableFills = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillEnable(variable.value[index], enable);
                }
            }
            this.editor.setFillsEnabled([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    /* 修改一条纯色填充的颜色(看起来可以和modifyFillColor合并) */
    modifyFillHex(event: Event, fill: Fill) {
        const rgb = getRGBFromInputEvent(event);
        if (!rgb) return;
        const color = new Color(fill.color.alpha, rgb[0], rgb[1], rgb[2]);
        this.modifyFillColor(color, fill);
    }

    /* 修改一条纯色填充的透明度 */
    modifyFillAlpha(event: Event, fill: Fill) {
        const alpha = getNumberFromInputEvent(event);
        if (isNaN(alpha)) return;
        if (fill.fillType === FillType.Gradient) {
            this.modifyGradientOpacity(fill, alpha / 100);
        } else {
            const color = new Color(
                Math.max(0, Math.min(1, alpha / 100)),
                fill.color.red,
                fill.color.green,
                fill.color.blue
            );
            this.modifyFillColor(color, fill);
        }
    }

    /* 修改一条纯色填充的颜色 */
    modifyFillColor(color: Color, fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setFillsColor([(api: Operator) => {
                api.setFillColor(fill, color);
            }]);
        } else {
            const index = this.getIndexByFill(fill);
            const views: ShapeView[] = [];
            const fillsPacks: { fill: Fill, color: Color }[] = [];
            for (const view of this.flat) {
                if (view.isVirtualShape || view instanceof SymbolRefView) views.push(view);
                else fillsPacks.push({ fill: view.getFills()[index], color });
            }
            const modifyLocalFills = (api: Operator) => {
                for (const pack of fillsPacks) api.setFillColor(pack.fill, pack.color);
            }
            const modifyVariableFills = (api: Operator) => {
                if (!views.length) return;
                for (const view of views) {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    api.setFillColor(variable.value[index], color);
                }
            }
            this.editor.setFillsColor([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    /* 修改渐变色的透明度 */
    modifyGradientOpacity(fill: Fill, opacity: number) {
        if (fill.parent?.parent instanceof FillMask) {
            const mission = (api: Operator) => {
                const gradient = fill.gradient!;
                api.setGradientOpacity(gradient, opacity);
            }
            this.editor.setGradientOpacity([mission]);
        } else {
            const index = this.getIndexByFill(fill);
            const fills: Fill[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getFills()[index]);
            }
            const modifyLocalFills = (api: Operator) => {
                for (const fill of fills) {
                    const gradient = fill.gradient!;
                    api.setGradientOpacity(gradient, opacity);
                }
            }
            const modifyVariableFills = (api: Operator) => {
                for (const view of views) {
                    const variable = this.editor.getFillsVariable(api, this.page, view);
                    const fill = variable.value[index];
                    const gradient = fill.gradient!;
                    api.setGradientOpacity(gradient, opacity);
                }
            }

            this.editor.setGradientOpacity([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    /* 创建一个填充遮罩 */
    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.editor.createFillsMask(this.document, fillMask, this.page, this.flat);
        this.kill();
    }

    /* 修改图层填充遮罩的绑定值 */
    modifyFillMask(id: string) {
        if (Object.keys(this.fillCtx).length === 0) return;
        this.editor.setShapesFillMask(this.page, this.flat, id);
        this.kill();
        this.hiddenCtrl();
    }

    /* 解绑填充遮罩 */
    unbind() {
        this.editor.unbindShapesFillMask(this.document, this.page, this.flat);
    }

    /* 删除遮罩 */
    removeMask() {
        this.editor.removeShapesFillMask(this.page, this.flat);
    }

    // 删除填充样式(弱删除)
    disableMask(mask: StyleMangerMember) {
        this.editor.disableMask(mask);
    }
}

function stringifyFills(sye: { shape: ShapeView, fills: Fill[] }) {
    if (sye.shape.fillsMask) return sye.shape.fillsMask;
    return sye.fills.reduce((p, c) => p + stringifyFill(c), '')

    function stringifyFill(fill: Fill) {
        const type = fill.fillType;
        let str = '';
        if (type === FillType.SolidColor) {
            str += fill.color.red + ','
                + fill.color.green + ','
                + fill.color.blue + ','
                + fill.color.alpha;
        } else if (type === FillType.Pattern) {
            str += fill.imageRef ?? 'null'
                + fill.imageScaleMode ?? 'null'
                + fill.originalImageHeight ?? 'null'
                + fill.originalImageWidth ?? 'null'
                + (fill.paintFilter ? stringifyFilter(fill.paintFilter) : 'null')
                + fill.rotation ?? 'null'
                + fill.scale ?? 'null'
                + (fill.transform ? stringifyPatternTransform(fill.transform) : 'null')
        } else if (type === FillType.Gradient) {
            str += stringifyGradient(fill.gradient!);
        }
        return str;
    }
}

export function stringifyFilter(filter: PaintFilter) {
    return '' + filter.hue + filter.tint + filter.shadow + filter.saturation + filter.contrast + filter.exposure + filter.temperature;
}

export function stringifyPatternTransform(t: PatternTransform) {
    return '' + t.m00 + t.m01 + t.m02 + t.m10 + t.m11 + t.m12;
}

export function stringifyGradient(g: Gradient) {
    let str = '';
    str += g.gradientType + g.from.x + g.from.y + g.to.x + g.to.y
        + (g.elipseLength ?? 'null')
        + (g.gradientOpacity ?? 'null')
        ;

    g.stops.forEach(s => str += stringifyStop(s));

    return str;

    function stringifyStop(s: Stop) {
        return '' + s.position + s.color.red + ',' + s.color.green + ',' + s.color.blue + ',' + s.color.alpha;
    }
}