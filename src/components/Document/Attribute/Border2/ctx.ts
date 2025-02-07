import { Fill, FillMask, FillType, Style, Color, BasicArray, BorderMask, ShapeView, ShapeType, BorderSideSetting, BorderPosition, BorderMaskType } from "@kcdesign/data";
import { Context } from "@/context";
import { BorderData, get_actions_add_boder, get_actions_add_mask, get_actions_border_color, get_actions_border_delete, get_actions_border_enabled, get_actions_border_fillmask, get_actions_border_mask, get_actions_border_unify, get_actions_fill_color, get_actions_fill_delete, get_actions_fill_enabled, get_actions_fill_mask, get_actions_fill_unify, getDideStr } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { FillCatch, stringifyFilter, stringifyGradient, stringifyPatternTransform } from "../Fill2/ctx";

function stringifyFills(sye: { style: Style, fills: Fill[] }) {
    if (sye.style.fillsMask) return sye.style.fillsMask;
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

export type BorderFillsContext = {
    mixed: boolean;
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
        const selected = this.selected;

        if (selected.length < 2) return this.fillCtx.mixed = false;
        const allFills = selected.map(i => ({ fills: i.getBorders().strokePaints, style: i.style }));

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
        if (this.fillCtx.mixed) return;

        const represent = this.selected[0];
        this.fillCtx.mask = represent.style.borders.fillsMask;
        if (this.fillCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.fillCtx.mask) as FillMask;
            this.fillCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
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
        const represent = this.selected[0];
        this.fillCtx.strokeMask = represent.style.bordersMask;
        if (this.fillCtx.strokeMask) {
            const mask = this.context.data.stylesMgr.getSync(this.fillCtx.strokeMask) as BorderMask;
            this.fillCtx.strokeMaskInfo = {
                name: mask.name,
                desc: mask.description
            }
        } else {
            this.fillCtx.strokeMaskInfo = undefined;
        }
        let origin = represent.getBorders();
        let index = 0;
        while (!origin.strokePaints && index < this.selected.length) {
            origin = this.selected[index].getBorders();
            index++;
        }

        const replace: BorderData = {
            position: origin.position,
            cornerType: origin.cornerType,
            borderStyle: origin.borderStyle,
            sideSetting: origin.sideSetting
        }
        strokeMixedStatus(replace, this.selected);
        if (replace.position === 'mixed' || replace.sideSetting === 'mixed') {
            this.fillCtx.strokeMaskInfo = undefined;
            this.fillCtx.strokeMask = undefined;
        }
        this.fillCtx.strokeInfo = replace;
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i === fill) ?? -1;
    }

    update() {
        this.getSelected();
        this.modifyMixedStatus();
        this.updateFills();
        this.updateStroke();
    }

    init() {
        if (!this.fillCtx.fills.length && !this.fillCtx.mixed) this.create();
    }

    create(mask?: FillMask) {
        if (this.fillCtx.mixed) return this.unify();

        if (mask) {
            const color = new Color(1, 0, 0, 0);
            const strokePaint = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);
            this.editor4Doc.modifyFillMaskFillAddFill(mask.sheet, mask.id, strokePaint);
        } else {
            const selected = this.selected;
            const color = new Color(1, 0, 0, 0);
            const strokePaint = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);
            const actions = get_actions_add_boder(selected, strokePaint);
            this.editor.shapesAddBorder(actions);

            this.hiddenCtrl();
        }
    }

    unify() {
        const actions = get_actions_border_unify(this.selected);
        this.editor.shapesBordersUnify(actions);
        this.hiddenCtrl();
    }

    remove(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor4Doc.modifyFillMaskFillDelFill(mask.sheet, mask.id, this.getIndexByFill(fill));
        } else {
            const actions = get_actions_border_delete(this.selected, this.getIndexByFill(fill));
            this.editor.shapesDeleteBorder(actions);
        }
    }

    removeAll() {
        this.editor.shapesDeleteAllBorder(this.selected);
    }

    modifyVisible(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor4Doc.modifyFillMaskFillEnabled(mask.sheet, mask.id, this.getIndexByFill(fill), !fill.isEnabled);
        } else {
            const actions = get_actions_border_enabled(this.selected, this.getIndexByFill(fill), !fill.isEnabled);
            this.editor.setShapesBorderEnabled(actions);
        }
    }

    modifyFillHex(event: Event, fill: Fill) {
        const rgb = getRGBFromInputEvent(event);
        if (!rgb) return;

        const color = new Color(fill.color.alpha, rgb[0], rgb[1], rgb[2]);
        const index = this.getIndexByFill(fill);
        const selected = this.selected;
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor4Doc.modifyFillMaskFillColor(mask.sheet, mask.id, index, color);
        } else {
            this.editor.setShapesBorderColor(get_actions_border_color(selected, index, color));
            this.hiddenCtrl(event);
        }
    }

    modifyFillAlpha(event: Event, fill: Fill) {
        const alpha = getNumberFromInputEvent(event);
        if (isNaN(alpha)) return;
        const color = new Color(
            Math.max(0, Math.min(1, alpha / 100)),
            fill.color.red,
            fill.color.green,
            fill.color.blue
        );
        const index = this.getIndexByFill(fill);
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor4Doc.modifyFillMaskFillColor(mask.sheet, mask.id, index, color);
        } else {
            const selected = this.selected;
            this.editor.setShapesBorderColor(get_actions_border_color(selected, index, color));
            this.hiddenCtrl(event);
        }
    }

    modifyFillMask(id: string) {
        const actions = get_actions_add_mask(this.selected, id);
        this.editor.shapesSetBorderFillMask(actions);
        this.kill();
        this.hiddenCtrl();
    }

    modifyStrokeMask(id: string) {
        const actions = get_actions_add_mask(this.selected, id);
        this.editor.shapesSetBorderMask(actions);
        this.kill();
        this.hiddenCtrl();
    }

    modifyBorderThicknessMask(sheet: string, id: string, side: BorderSideSetting) {
        this.editor4Doc.modifyBorderMaskBorderSideSetting(sheet, id, side);
    }

    modifyBorderPositionMask(sheet: string, id: string, position: BorderPosition) {
        this.editor4Doc.modifyBorderMaskBorderPosition(sheet, id, position);
    }

    unbind() {
        const id = this.selected[0].style.borders.fillsMask;
        this.editor.shapesDelBorderFillMask(get_actions_fill_mask(this.selected, id));
    }

    unbindStroke() {
        this.editor.shapesDelBorderMask(get_actions_border_mask(this.selected));
    }

    removeMask() {
        const id = this.selected[0].style.borders.fillsMask;
        this.editor.shapesDelStyleBorder(get_actions_fill_mask(this.selected, id));
    }

    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.editor4Doc.insertStyleLib(fillMask, this.page, this.selected);
        this.kill();
    }
    createStrokeStyleLib(name: string, desc: string, mask: BorderMaskType) {
        const strokeMask = new BorderMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, mask);
        this.editor4Doc.insertStyleLib(strokeMask, this.page, this.selected);
        this.kill();
    }
}