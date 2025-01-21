import { Fill, FillMask, FillType, Gradient, PaintFilter, PatternTransform, ShapeView, Stop, Style, Color, BasicArray, BatchAction2, ContactLineView, ArtboardView } from "@kcdesign/data";
import { Context } from "@/context";
import { get_actions_add_mask, get_actions_fill_color, get_actions_fill_delete, get_actions_fill_enabled, get_actions_fill_mask, get_actions_fill_unify } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";

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

function stringifyFilter(filter: PaintFilter) {
    return '' + filter.hue + filter.tint + filter.shadow + filter.saturation + filter.contrast + filter.exposure + filter.temperature;
}

function stringifyPatternTransform(t: PatternTransform) {
    return '' + t.m00 + t.m01 + t.m02 + t.m10 + t.m11 + t.m12;
}

function stringifyGradient(g: Gradient) {
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

export type FillCatch = {
    fill: Fill;
}

export type FillsContext = {
    mixed: boolean;
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
        const selected = this.selected;

        if (selected.length < 2) return this.fillCtx.mixed = false;
        const allFills = selected.map(i => ({fills: i.getFills(), style: i.style}));

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
        this.fillCtx.mask = represent.style.fillsMask;
        if (this.fillCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.fillCtx.mask) as FillMask;
            this.fillCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
            }
        } else {
            this.fillCtx.maskInfo = undefined;
        }

        const origin = represent.getFills();
        const replace: FillCatch[] = [];
        for (let i = origin.length - 1; i > -1; i--) replace.push({fill: origin[i]});
        this.fillCtx.fills = replace;
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i === fill) ?? -1;
    }

    update() {
        this.getSelected();
        this.modifyMixedStatus();
        this.updateFills();
    }

    init() {
        if (!this.fillCtx.fills.length && !this.fillCtx.mixed) this.create();
    }

    create() {
        if (this.fillCtx.mixed) return this.unify();

        const actions: BatchAction2[] = [];
        const selected = this.selected;
        for (const view of selected) {
            if (view instanceof ContactLineView) continue;
            let color: Color;
            if (view instanceof ArtboardView) {
                color = new Color(1, 255, 255, 255);
            } else {
                color = new Color(0.2, 0, 0, 0);
            }
            const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
            actions.push({target: view, value: fill});
        }

        this.editor.shapesAddFill(actions);

        this.hiddenCtrl();
    }

    unify() {
        const actions = get_actions_fill_unify(this.selected);
        this.editor.shapesFillsUnify(actions);
        this.hiddenCtrl();
    }

    remove(fill: Fill) {
        const actions = get_actions_fill_delete(this.selected, this.getIndexByFill(fill));
        this.editor.shapesDeleteFill(actions);
    }

    modifyVisible(fill: Fill) {
        const actions = get_actions_fill_enabled(this.selected, this.getIndexByFill(fill), !fill.isEnabled);
        this.editor.setShapesFillEnabled(actions);
    }

    modifyFillHex(event: Event, fill: Fill) {
        const rgb = getRGBFromInputEvent(event);
        if (!rgb) return;

        const color = new Color(fill.color.alpha, rgb[0], rgb[1], rgb[2]);
        const index = this.getIndexByFill(fill);
        const selected = this.selected;

        this.editor.setShapesFillColor(get_actions_fill_color(selected, index, color));

        this.hiddenCtrl(event);
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
        const selected = this.selected;
        this.editor.setShapesFillColor(get_actions_fill_color(selected, index, color));
        this.hiddenCtrl(event);
    }

    modifyFillMask(id: string) {
        const actions = get_actions_add_mask(this.selected, id);
        this.editor.shapesSetFillMask(actions);
        this.kill();
        this.hiddenCtrl();
    }

    unbind() {
        this.editor.shapesDelFillMask(get_actions_fill_mask(this.selected));
    }

    removeMask() {
        this.editor.shapesDelStyleFill(get_actions_fill_mask(this.selected));
    }

    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.editor4Doc.insertStyleLib(fillMask, this.page, this.selected);
        this.kill();
    }
}