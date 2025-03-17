/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {
    Fill,
    FillMask,
    FillType,
    Color,
    BasicArray,
    BorderMask,
    ShapeView,
    ShapeType,
    BorderSideSetting,
    BorderPosition,
    BorderMaskType,
    BorderModifier,
    SideType,
    Api,
    SymbolRefView,
    Border,
    MarkerType,
    StyleMangerMember
} from "@kcdesign/data";
import { Context } from "@/context";
import { BorderData, get_actions_border_Apex, get_actions_border_endpoint, get_actions_border_exchange, getDideStr } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { FillCatch, stringifyFilter, stringifyGradient, stringifyPatternTransform } from "../Fill2/ctx";

function stringifyFills(sye: { shape: ShapeView, fills: Fill[] }) {
    if (sye.shape.borderFillsMask) return sye.shape.borderFillsMask;
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

function strokeMaskMixedStatus(shapes: ShapeView[]) {
    const f_mask = shapes[0].bordersMask;
    return shapes.every(s => s.bordersMask === f_mask);
}

function strokeMixedStatus(stroke: BorderData, shapes: ShapeView[]) {
    for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shapes[i].type === ShapeType.Cutout) continue;
        const paints = shape.getBorders();
        const len = paints.strokePaints.length;
        if (len > 0 && paints.position !== stroke.position) {
            stroke.position = 'mixed';
        }
        if (len > 0 && paints.cornerType !== stroke.cornerType) {
            stroke.cornerType = 'mixed';
        }
        if (len > 0 && typeof stroke.borderStyle !== 'string' &&
            paints.borderStyle.gap !== stroke.borderStyle.gap &&
            paints.borderStyle.length !== stroke.borderStyle.length) {
            stroke.borderStyle = 'mixed';
        }
        const sideStr = getDideStr(paints.sideSetting, stroke.sideSetting);
        if (len > 0 && !sideStr) stroke.sideSetting = 'mixed';
    }
}

function getSideInfo(border: Border, type: SideType) {
    const { thicknessBottom, thicknessTop, thicknessLeft, thicknessRight, sideType } = border.sideSetting;
    const max_thickness = Math.max(thicknessTop, thicknessLeft, thicknessBottom, thicknessRight)
    switch (type) {
        case SideType.Normal:
            return new BorderSideSetting(type, max_thickness, max_thickness, max_thickness, max_thickness);
        case SideType.Top:
            return new BorderSideSetting(type, thicknessTop === 0 ? max_thickness : thicknessTop, 0, 0, 0);
        case SideType.Left:
            return new BorderSideSetting(type, 0, thicknessLeft === 0 ? max_thickness : thicknessLeft, 0, 0);
        case SideType.Right:
            return new BorderSideSetting(type, 0, 0, 0, thicknessRight === 0 ? max_thickness : thicknessRight);
        case SideType.Bottom:
            return new BorderSideSetting(type, 0, 0, thicknessBottom === 0 ? max_thickness : thicknessBottom, 0);
        case SideType.Custom:
            switch (sideType) {
                case SideType.Top:
                    return new BorderSideSetting(type, thicknessTop, 0, 0, 0);
                case SideType.Left:
                    return new BorderSideSetting(type, 0, thicknessLeft, 0, 0);
                case SideType.Right:
                    return new BorderSideSetting(type, 0, 0, 0, thicknessRight);
                case SideType.Bottom:
                    return new BorderSideSetting(type, 0, 0, thicknessBottom, 0);
                case SideType.Normal:
                    return new BorderSideSetting(type, thicknessTop, thicknessLeft, thicknessBottom, thicknessRight);
                default:
                    return new BorderSideSetting(type, 0, 0, 0, 0);
            }
        default:
            return new BorderSideSetting(SideType.Normal, 0, 0, 0, 0);
    }
}

export function getSideSettingType(views: ShapeView[]) {
    const represent = views[0].getBorders();
    const side = represent.sideSetting.sideType;
    return views.some(view => view.getBorders().sideSetting.sideType !== side) ? undefined : side;
}

export function getThickness(flat: ShapeView[]) {
    const represent = flat[0].getBorders();
    const b = represent.sideSetting;
    let side: (number | false)[] = [b.thicknessTop, b.thicknessRight, b.thicknessBottom, b.thicknessLeft];
    for (let i = 1; i < flat.length; i++) {
        const borders = flat[i].getBorders() || [];
        const { thicknessTop, thicknessRight, thicknessBottom, thicknessLeft } = borders.sideSetting;
        if (b.thicknessTop !== thicknessTop) side[0] = false;
        if (b.thicknessRight !== thicknessRight) side[1] = false;
        if (b.thicknessBottom !== thicknessBottom) side[2] = false;
        if (b.thicknessLeft !== thicknessLeft) side[3] = false;
    }
    return side;
}

export function getSideThickness(side: BorderSideSetting): number | false {
    const { sideType, thicknessBottom, thicknessLeft, thicknessRight, thicknessTop } = side;
    return (() => {
        switch (sideType) {
            case SideType.Top:
                return thicknessTop;
            case SideType.Left:
                return thicknessLeft;
            case SideType.Right:
                return thicknessRight;
            case SideType.Bottom:
                return thicknessBottom;
            case SideType.Custom:
                if (thicknessBottom === thicknessLeft && thicknessLeft === thicknessRight && thicknessRight === thicknessTop) {
                    return thicknessTop;
                } else {
                    return false;
                }
            default:
                return thicknessTop;
        }
    })();
}

export const customizable = [
    ShapeType.Rectangle,
    ShapeType.Artboard,
    ShapeType.Image,
    ShapeType.Symbol,
    ShapeType.SymbolRef,
    ShapeType.SymbolUnion
];

export type BorderFillsContext = {
    mixed: boolean;
    listStatus: boolean,
    fills: FillCatch[];

    strokeInfo?: BorderData;
    strokeMask?: string;
    strokeMaskInfo?: MaskInfo;
    mask?: string;
    maskInfo?: MaskInfo;
}

export class StrokeFillContextMgr extends StyleCtx {
    constructor(protected context: Context, public fillCtx: BorderFillsContext) {
        super(context);
    }

    private modifyMixedStatus() {
        if (this.flat.length < 1) return;
        if (this.flat.length < 2) return this.fillCtx.mixed = false;
        const allFills = this.flat.map(i => ({ fills: i.getBorders().strokePaints, shape: i }));

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
        this.fillCtx.mask = represent.borderFillsMask;
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
        const origin = represent.getBorders().strokePaints;
        const replace: FillCatch[] = [];
        for (let i = origin.length - 1; i > -1; i--) replace.push({ fill: origin[i] });
        this.fillCtx.fills = replace;
    }

    private updateStroke() {
        if (this.flat.length < 1) return;
        const represent = this.flat[0];
        this.fillCtx.strokeMask = represent.bordersMask;
        if (this.fillCtx.strokeMask) {
            const mask = this.context.data.stylesMgr.getSync(this.fillCtx.strokeMask) as BorderMask;
            this.fillCtx.strokeMaskInfo = {
                name: mask.name,
                desc: mask.description,
                disabled: mask.disabled
            }
        } else {
            this.fillCtx.strokeMaskInfo = undefined;
        }
        let origin = represent.getBorders();
        let index = 0;
        while (!origin.strokePaints && index < this.flat.length) {
            origin = this.flat[index].getBorders();
            index++;
        }

        const replace: BorderData = {
            position: origin.position,
            cornerType: origin.cornerType,
            borderStyle: origin.borderStyle,
            sideSetting: origin.sideSetting
        }
        strokeMixedStatus(replace, this.flat);
        const maskMixed = strokeMaskMixedStatus(this.flat);
        if (replace.position === 'mixed' || replace.sideSetting === 'mixed' || !maskMixed) {
            this.fillCtx.strokeMaskInfo = undefined;
            this.fillCtx.strokeMask = undefined;
        }
        this.fillCtx.strokeInfo = replace;
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i.id === fill.id) ?? -1;
    }

    private m_editor: BorderModifier | undefined;

    protected get borderEditor(): BorderModifier {
        return this.m_editor ?? (this.m_editor = new BorderModifier(this.repo));
    }

    toggleList() {
        const action = !this.fillCtx.listStatus;
        this.fillCtx.listStatus = action;
        localStorage.setItem("styleList", JSON.stringify(action));
    }

    update() {
        this.fillCtx.listStatus = JSON.parse(localStorage.getItem("styleList") ?? JSON.stringify(false));
        this.modifyMixedStatus();
        this.updateFills();
        this.updateStroke();
    }

    init() {
        if (!this.fillCtx.fills.length && !this.fillCtx.mixed) this.create();
    }

    create(mask?: FillMask) {
        if (this.fillCtx.mixed) return this.unify();
        const missions: Function[] = [];
        if (mask) {
            const color = new Color(1, 0, 0, 0);
            const fill = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);
            const caller = (api: Api) => {
                api.addFillAt(mask.fills, fill, mask.fills.length);
            }
            missions.push(caller);
            return this.borderEditor.createFill(missions);
        }
        const actions: { fills: BasicArray<Fill>, fill: Fill }[] = [];
        const viewActions: { view: ShapeView, fill: Fill }[] = [];
        for (const view of this.flat) {
            const color = new Color(1, 0, 0, 0);
            const fill = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);

            if (view instanceof SymbolRefView || view.isVirtualShape) {
                viewActions.push({ view, fill });
            } else {
                actions.push({ fills: view.style.borders.strokePaints, fill: fill });
            }
        }
        const modifyLocalFills = (api: Api) => {
            actions.forEach(action => api.addFillAt(action.fills, action.fill, action.fills.length));
        };
        const modifySymbolRefFills = (api: Api) => {
            for (const action of viewActions) {
                const variable = this.borderEditor.getBorderVariable(api, this.page, action.view).value as Border;
                api.addFillAt(variable.strokePaints, this.borderEditor.importFill(action.fill), variable.strokePaints.length);
            }
        }

        missions.push(modifyLocalFills, modifySymbolRefFills);
        this.borderEditor.createFill(missions);
        this.hiddenCtrl();
    }

    unify() {
        const maskView = this.flat.find(i => i.borderFillsMask);
        if (maskView) {
            this.borderEditor.unifyShapesFillsMask(this.document, this.flat, maskView.borderFillsMask!);
        } else {
            const containers: BasicArray<Fill>[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) {
                    views.push(view);
                } else containers.push(view.getFills());
            }
            const borderEditor = this.borderEditor;
            const master = this.flat[0].getFills().map(i => borderEditor.importFill(i));

            const modifyLocalFills = (api: Api) => {
                if (!containers.length) return;
                for (const fillContainer of containers) {
                    api.deleteFills(fillContainer, 0, fillContainer.length);
                    api.addFills(fillContainer, master.map(i => borderEditor.importFill(i)));
                }
            };
            const modifyVariableFills = (api: Api) => {
                if (!views.length) return;
                for (const view of views) {
                    const border = borderEditor.getBorderVariable(api, this.page, view).value as Border;
                    api.deleteFills(border.strokePaints, 0, border.strokePaints.length);
                    api.addFills(border.strokePaints, master.map(i => borderEditor.importFill(i)));
                }
            };
            this.borderEditor.unifyShapesFills([modifyLocalFills, modifyVariableFills]);
        }
        this.hiddenCtrl();
    }

    remove(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.borderEditor.removeFill([(api: Api) => {
                api.deleteFillAt(mask.fills, this.getIndexByFill(fill));
            }]);
        } else {
            if ((fill.parent as unknown as BasicArray<Fill>)?.length === 1) {
                return this.removeAll();
            }
            const index = this.getIndexByFill(fill);
            const actions: { fills: BasicArray<Fill>, index: number }[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView && view.isVirtualShape) {
                    views.push(view);
                } else actions.push({ fills: view.getBorders().strokePaints, index });
            }
            const modifyLocalFills = (api: Api) => {
                actions.forEach(action => api.deleteFillAt(action.fills, action.index));
            }
            const modifyVariableFills = (api: Api) => {
                for (const view of views) {
                    const variable = this.borderEditor.getBorderVariable(api, this.page, view).value as Border;
                    api.deleteFillAt(variable.strokePaints, index);
                }
            }
            this.borderEditor.removeFill([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    removeAll() {
        this.borderEditor.removeShapesBorder(this.page, this.flat);
    }

    modifyVisible(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.borderEditor.setFillsEnabled([(api: Api) => {
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
                    fills.push(view.getBorders().strokePaints[index]);
                }
            }
            const modifyLocalFills = (api: Api) => {
                for (const fill of fills) api.setFillEnable(fill, enable);
            }
            const modifyVariableFills = (api: Api) => {
                for (const view of views) {
                    const variable = this.borderEditor.getBorderVariable(api, this.page, view).value as Border;
                    api.setFillEnable(variable.strokePaints[index], enable);
                }
            }
            this.borderEditor.setFillsEnabled([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

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

    modifyFillColor(color: Color, fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.borderEditor.setFillsColor([(api: Api) => {
                api.setFillColor(fill, color);
            }]);
        } else {
            const index = this.getIndexByFill(fill);
            const views: ShapeView[] = [];
            const fillsPacks: { fill: Fill, color: Color }[] = [];
            for (const view of this.flat) {
                if (view.isVirtualShape || view instanceof SymbolRefView) views.push(view);
                else fillsPacks.push({ fill: view.getBorders().strokePaints[index], color });
            }
            const modifyLocalFills = (api: Api) => {
                for (const pack of fillsPacks) api.setFillColor(pack.fill, pack.color);
            }
            const modifyVariableFills = (api: Api) => {
                if (!views.length) return;
                for (const view of views) {
                    const variable = this.borderEditor.getBorderVariable(api, this.page, view).value as Border;
                    api.setFillColor(variable.strokePaints[index], color);
                }
            }
            this.borderEditor.setFillsColor([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    modifyGradientOpacity(fill: Fill, opacity: number) {
        if (fill.parent?.parent instanceof FillMask) {
            const mission = (api: Api) => {
                const gradient = fill.gradient!;
                api.setGradientOpacity(gradient, opacity);
            }
            this.borderEditor.setGradientOpacity([mission]);
        } else {
            const index = this.getIndexByFill(fill);
            const fills: Fill[] = [];
            const views: ShapeView[] = [];
            for (const view of this.flat) {
                if (view instanceof SymbolRefView || view.isVirtualShape) views.push(view);
                else fills.push(view.getBorders().strokePaints[index]);
            }
            const modifyLocalFills = (api: Api) => {
                for (const fill of fills) {
                    const gradient = fill.gradient!;
                    api.setGradientOpacity(gradient, opacity);
                }
            }
            const modifyVariableFills = (api: Api) => {
                for (const view of views) {
                    const variable = this.borderEditor.getBorderVariable(api, this.page, view).value as Border;
                    const fill = variable.strokePaints[index];
                    const gradient = fill.gradient!;
                    api.setGradientOpacity(gradient, opacity);
                }
            }

            this.borderEditor.setGradientOpacity([modifyLocalFills, modifyVariableFills]);
            this.hiddenCtrl();
        }
    }

    setShapesMarkerType(type: MarkerType, isEnd: boolean) {
        const actions = get_actions_border_Apex(this.flat, type, isEnd);
        this.editor.setShapesMarkerType(actions);
        this.hiddenCtrl();
    }

    exchangeShapesMarkerType() {
        const actions = get_actions_border_exchange(this.flat);
        this.editor.exchangeShapesMarkerType(actions);
        this.hiddenCtrl();
    }
    setShapesEndpoint(type: MarkerType) {
        const actions = get_actions_border_endpoint(this.flat, type);
        this.editor.setShapesEndpoint(actions);
        this.hiddenCtrl();
    }

    modifyFillMask(id: string) {
        this.borderEditor.setShapesFillMask(this.document, this.page, this.flat, id);
        this.kill();
        this.hiddenCtrl();
    }

    modifyStrokeMask(id: string) {
        if (Object.keys(this.fillCtx).length === 0) return;
        this.borderEditor.setShapesStrokeMask(this.page, this.flat, id);
        this.kill();
        this.hiddenCtrl();
    }

    modifySideType(type: SideType, views: ShapeView[]) {
        const local: ShapeView[] = [];
        const refs: ShapeView[] = [];
        for (const view of views) {
            if (view instanceof SymbolRefView || view.isVirtualShape) refs.push(view);
            else local.push(view);
        }
        const editor = this.borderEditor;
        const modifyLocal = (api: Api) => {
            local.forEach(view => {
                const border = view.style.borders;
                const side = getSideInfo(border, type);
                api.setBorderSide(view.style.borders, side);
            });
        }
        const modifyVariable = (api: Api) => {
            refs.forEach(view => {
                const variable = editor.getBorderVariable(api, this.page, view);
                const side = getSideInfo(variable.value, type)
                api.setBorderSide(variable.value, side)
            });
        }
        editor.modifyBorderSideSetting([modifyLocal, modifyVariable]);
    }

    modifyBorderThicknessMask(border: BorderMaskType, side: BorderSideSetting) {
        this.borderEditor.setBorderMaskSide([{ border: border as any, side }]);
    }

    modifyBorderThickness(thickness: number) {
        this.borderEditor.setBorderThickness(this.page, this.flat, thickness);
    }

    // 设置单边厚度
    modifyBorderCustomThickness(views: ShapeView[], thickness: number, type: SideType) {
        this.borderEditor.setBorderCustomThickness(this.page, views, thickness, type);
    }

    // 设置描边样式（虚线/实线）
    modifyStrokeStyle(actions: { target: ShapeView, value: any }[]) {
        this.borderEditor.modifyStrokeStyle(this.page, actions);
    }

    //修改描边拐角样式
    modifyCornerType(actions: { target: ShapeView, value: any }[]) {
        this.borderEditor.modifyCornerType(this.page, actions);
    }

    modifyBorderPositionMask(border: BorderMaskType, position: BorderPosition) {
        this.borderEditor.setBorderMaskPosition([{ border, position }]);
    }

    modifyBorderPosition(position: BorderPosition) {
        this.borderEditor.setBorderPosition(this.page, this.flat, position);
    }

    unbind() {
        this.borderEditor.unbindShapesFillMask(this.document, this.page, this.flat);
    }

    unbindStroke() {
        this.borderEditor.unbindShapesBorderMask(this.page, this.flat);
    }

    removeMask() {
        this.borderEditor.removeShapesFillMask(this.document, this.page, this.flat);
    }

    disableMask(mask: StyleMangerMember) {
        this.borderEditor.disableMask(mask);
    }

    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.borderEditor.createFillsMask(this.document, fillMask, this.page, this.flat);
        this.kill();
    }
    createStrokeStyleLib(name: string, desc: string, mask: BorderMaskType) {
        const strokeMask = new BorderMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, mask);
        this.borderEditor.createBorderMask(this.document, strokeMask, this.page, this.flat);
        this.kill();
    }
}

