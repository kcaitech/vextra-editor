import {
    Fill, FillMask, FillType, Gradient, PaintFilter, PatternTransform, Stop,
    Style, Color, BasicArray, ArtboardView, FillModifier
} from "@kcdesign/data";
import { Context } from "@/context";
import { get_actions_fill_unify } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";

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
        const allFills = selected.map(i => ({ fills: i.getFills(), style: i.style }));

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
        this.fillCtx.mask = represent.fillsMask;
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
        for (let i = origin.length - 1; i > -1; i--) replace.push({ fill: origin[i] });
        this.fillCtx.fills = replace;
    }

    private getIndexByFill(fill: Fill) {
        return (fill.parent as unknown as Fill[])?.findIndex(i => i === fill) ?? -1;
    }

    private m_editor: FillModifier | undefined;

    protected get editor(): FillModifier {
        return this.m_editor ?? (this.m_editor = new FillModifier(this.repo));
    }

    update() {
        this.getSelected();
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
        const editor = new FillModifier(this.repo);

        if (mask) {
            const color = new Color(0.2, 0, 0, 0);
            const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
            editor.createFill([{ fills: mask.fills, fill, index: mask.fills.length }])
            // this.editor.createFill([{ fills: mask.fills, fill, index: mask.fills.length }]);
        } else {
            const actions: { fills: BasicArray<Fill>, fill: Fill, index: number }[] = [];
            const selected = this.selected;
            for (const view of selected) {
                let color: Color;
                if (view instanceof ArtboardView) {
                    color = new Color(1, 255, 255, 255);
                } else {
                    color = new Color(0.2, 0, 0, 0);
                }
                const fill = new Fill(new BasicArray(), v4(), true, FillType.SolidColor, color);
                actions.push({ fills: view.style.fills, fill: fill, index: view.style.fills.length });
            }
            editor.createFill(actions);
            // this.editor.createFill(actions);
            this.hiddenCtrl();
        }
    }

    /* 统一多个图层的填充 */
    unify() {
        const fillsMaskView = this.selected.find(i => i.fillsMask);
        if (fillsMaskView) {
            this.editor.unifyShapesFillsMask(this.document, this.selected, fillsMaskView.fillsMask!);
        } else {
            this.editor.unifyShapesFills(this.selected.map(i => i.getFills()));
        }
        this.hiddenCtrl();
    }

    /* 移除一条填充 */
    remove(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            const mask = fill.parent.parent as FillMask;
            this.editor.removeFill([{ fills: mask.fills, index: this.getIndexByFill(fill) }]);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.removeFill(this.selected.map(v => ({ fills: v.style.fills, index })));
        }
    }

    /* 隐藏或显示一条填充 */
    modifyVisible(fill: Fill) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setFillsEnabled([fill], !fill.isEnabled);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.setFillsEnabled(this.selected.map(v => v.getFills()[index]), !fill.isEnabled);
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
            this.editor.setFillsColor([{ fill, color }]);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.setFillsColor(this.selected.map(i => ({ fill: i.getFills()[index], color })));
            this.hiddenCtrl();
        }
    }

    /* 修改渐变色的透明度 */
    modifyGradientOpacity(fill: Fill, opacity: number) {
        if (fill.parent?.parent instanceof FillMask) {
            this.editor.setGradientOpacity([{ fill, opacity }]);
        } else {
            const index = this.getIndexByFill(fill);
            this.editor.setGradientOpacity(this.selected.map(i => ({ fill: i.getFills()[index], opacity })));
            this.hiddenCtrl();
        }
    }

    /* 修改图层填充遮罩的绑定值 */
    modifyFillMask(id: string) {
        this.editor.setShapesFillMask(this.document, this.page, this.selected, id);
        this.kill();
        this.hiddenCtrl();
    }

    /* 解绑填充遮罩 */
    unbind() {
        this.editor.unbindShapesFillMask(this.document, this.page, this.selected);
    }

    /* 删除遮罩 */
    removeMask() {
        this.editor.removeShapesFillMask(this.document, this.page, this.selected);
    }

    /* 创建一个填充遮罩 */
    createStyleLib(name: string, desc: string) {
        const fills = new BasicArray<Fill>(...this.fillCtx.fills.map(i => i.fill).reverse());
        const fillMask = new FillMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, fills);
        this.editor.createFillsMask(this.document, fillMask, this.page, this.selected);
        this.kill();
    }
}

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