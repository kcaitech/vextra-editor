import { Fill, FillMask, FillType, Color, BasicArray, BorderMask, ShapeView, ShapeType, BorderSideSetting, BorderPosition, BorderMaskType, BorderModifier, SideType } from "@kcdesign/data";
import { Context } from "@/context";
import { BorderData, getDideStr } from "@/utils/shape_style";
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
        const allFills = selected.map(i => ({ fills: i.getBorders().strokePaints, shape: i }));

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
        this.fillCtx.mask = represent.borderFillsMask;
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
        this.fillCtx.strokeMask = represent.bordersMask;
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

    private m_editor: BorderModifier | undefined;

    protected get editor(): BorderModifier {
        return this.m_editor ?? (this.m_editor = new BorderModifier(this.repo));
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
        const actions: { fills: BasicArray<Fill>, fill: Fill, index: number }[] = [];
        if (mask) {
            const color = new Color(1, 0, 0, 0);
            const fill = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);
            actions.push({ fills: mask.fills, fill, index: mask.fills.length });
        } else {
            const color = new Color(1, 0, 0, 0);
            for (const view of this.selected) {
                const fill = new Fill(new BasicArray(0), v4(), true, FillType.SolidColor, color);
                const fills = view.getBorders().strokePaints as BasicArray<Fill>;
                actions.push({ fills, fill, index: fills.length });
            }
            this.hiddenCtrl();
        }
        this.editor.addFill(actions);
    }

    unify() {
        const maskView = this.selected.find(i => i.borderFillsMask);
        if (maskView) {
            this.editor.unifyShapesFillsMask(this.document, this.selected, maskView.borderFillsMask!);
        } else {
            this.editor.unifyShapesFills(this.selected.map(i => i.getBorders().strokePaints));
        }
        this.hiddenCtrl();
    }

    remove(fill: Fill) {
        const index = this.getIndexByFill(fill);
        const actions: { fills: BasicArray<Fill>, index: number }[] = [];
        if (fill.parent?.parent instanceof FillMask) {
            actions.push({ fills: fill.parent.parent.fills, index });
        } else {
            for (const view of this.selected) {
                actions.push({ fills: view.getBorders().strokePaints, index });
            }
        }
        this.editor.removeFill(actions);
    }

    removeAll() {
        this.editor.removeShapesBorder(this.document, this.page, this.selected);
    }

    modifyVisible(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setFillsEnabled([fill], !fill.isEnabled);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.setFillsEnabled(this.selected.map(v => v.getBorders().strokePaints[index]), !fill.isEnabled);
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
        const index = this.getIndexByFill(fill);
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setFillsColor([{ fill, color }]);
        } else {
            this.editor.setFillsColor(this.selected.map(i => ({ fill: i.getBorders().strokePaints[index], color })));
            this.hiddenCtrl();
        }
    }

    modifyGradientOpacity(fill: Fill, opacity: number) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setGradientOpacity([{ fill, opacity }]);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.setGradientOpacity(this.selected.map(i => ({ fill: i.getBorders().strokePaints[index], opacity })));
            this.hiddenCtrl();
        }
    }

    modifyFillMask(id: string) {
        this.editor.setShapesFillMask(this.document, this.page, this.selected, id);
        this.kill();
        this.hiddenCtrl();
    }

    modifyStrokeMask(id: string) {
        this.editor.setShapesStrokeMask(this.page, this.selected, id);
        this.kill();
        this.hiddenCtrl();
    }

    modifyBorderThicknessMask(border: BorderMaskType, side: BorderSideSetting) {
        this.editor.setBorderMaskSide([{ border, side }]);
    }

    modifyBorderThickness(thickness: number) {
        this.editor.setBorderThickness(this.page, this.selected, thickness);
    }

    modifyBorderCustomThickness(thickness: number, type: SideType) {
        this.editor.setBorderCustomThickness(this.page, this.selected, thickness, type);
    }

    modifyBorderPositionMask(border: BorderMaskType, position: BorderPosition) {
        this.editor.setBorderMaskPosition([{ border, position }]);
    }

    modifyBorderPosition(position: BorderPosition) {
        this.editor.setBorderPosition(this.page, this.selected, position);
    }

    unbind() {
        this.editor.unbindShapesFillMask(this.document, this.page, this.selected);
    }

    unbindStroke() {
        this.editor.unbindShapesBorderMask(this.page, this.selected);
    }

    removeMask() {
        this.editor.removeShapesFillMask(this.document, this.page, this.selected);
    }

    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.editor.createFillsMask(this.document, fillMask, this.page, this.selected);
        this.kill();
    }
    createStrokeStyleLib(name: string, desc: string, mask: BorderMaskType) {
        const strokeMask = new BorderMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, mask);
        this.editor4Doc.insertStyleLib(strokeMask, this.page, this.selected);
        this.kill();
    }
}