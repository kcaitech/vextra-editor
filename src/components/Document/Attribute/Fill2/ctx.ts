import { Fill, FillMask, FillType, Gradient, PaintFilter, PatternTransform, ShapeView, Stop, Style, Color } from "@kcdesign/data";
import { Context } from "@/context";
import { hidden_selection, noGroupShapesFrom } from "@/utils/content";
import { get_actions_fill_color } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent } from "@/components/Document/Attribute/Fill2/basic";

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

type FillMaskInfo = {
    name: string;
    desc: string;
}
export type FillCatch = {
    fill: Fill;
}

export type FillContext = {
    mixed: boolean;
    fills: FillCatch[];

    mask?: string;
    maskInfo?: FillMaskInfo;
}

export class FillContextMgr {
    private m_selected: ShapeView[];

    constructor(private context: Context, private fillCtx: FillContext) {
        this.m_selected = [];
    }

    get selected() {
        return this.m_selected;
    }

    set selected(ss) {
        this.m_selected = ss;
    }

    private get editor() {
        return this.context.editor4Page(this.context.selection.selectedPage!);
    }

    private modifyMixedStatus() {
        const selected = this.selected = noGroupShapesFrom(this.context.selection.selectedShapes);

        if (selected.length < 2) return false;
        const allFills = selected.map(i => ({fills: i.getFills(), style: i.style}));

        let firstL = allFills[0].fills.length;
        for (const s of allFills) if (s.fills.length !== firstL) return true;

        const stringF = stringifyFills(allFills[0]);
        for (let i = 0; i < allFills.length; i++) {
            const str = stringifyFills(allFills[i]);
            if (str !== stringF) return true;
        }
        return false;
    }


    private updateFills() {
        if (this.fillCtx.mixed) return;

        const represent = this.selected[0];
        this.fillCtx.mask = represent.style.fillsMask;
        const origin = represent.getFills();
        const replace: FillCatch[] = [];
        for (let i = origin.length - 1; i > -1; i--) {
            replace.push({fill: origin[i]});
        }
        this.fillCtx.fills = replace;

        if (this.fillCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(represent.style.fillsMask!) as FillMask;
            this.fillCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
            }
        }
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i === fill) ?? -1;
    }

    private hiddenCtrl(event?: Event) {
        hidden_selection(this.context);

        if (event?.target instanceof HTMLInputElement) event.target.blur();
    }

    update() {
        this.selected = [];
        this.modifyMixedStatus();
        this.updateFills();
    }

    init() {
        if (!this.fillCtx.fills.length && !this.fillCtx.mixed) this.create();
    }

    create() {
    }

    remove() {
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
}