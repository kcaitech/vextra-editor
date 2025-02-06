import { Style, Color, BasicArray, BatchAction2, ContactLineView, Shadow, ShadowMask, ShadowPosition } from "@kcdesign/data";
import { Context } from "@/context";
import { get_actions_add_mask, get_actions_shadow_blur, get_actions_shadow_color, get_actions_shadow_delete, get_actions_shadow_enabled, get_actions_shadow_mask, get_actions_shadow_offsetx, get_actions_shadow_offsety, get_actions_shadow_position, get_actions_shadow_spread, get_actions_shadow_unify } from "@/utils/shape_style";
import { getNumberFromInputEvent, getRGBFromInputEvent, MaskInfo } from "@/components/Document/Attribute/basic";
import { v4 } from "uuid";
import { StyleCtx } from "@/components/Document/Attribute/stylectx";

function stringifyShadows(sye: { style: Style, shadows: Shadow[] }) {
    if (sye.style.shadowsMask) return sye.style.shadowsMask;
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

/**
 * 填充模块核心状态管理器，修改填充的所有属性都由管理器完成；
 * 另外还组合了弹框管理器，可以控制相关弹窗
 */
export class ShadowsContextMgr extends StyleCtx {
    constructor(protected context: Context, public shadowCtx: ShadowsContext) {
        super(context);
    }

    private modifyMixedStatus() {
        const selected = this.selected;

        if (selected.length < 2) return this.shadowCtx.mixed = false;
        const allShadows = selected.map(i => ({ shadows: i.getShadows(), style: i.style }));

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
        if (this.shadowCtx.mixed) return;

        const represent = this.selected[0];
        this.shadowCtx.mask = represent.style.shadowsMask;
        if (this.shadowCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.shadowCtx.mask) as ShadowMask;
            this.shadowCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
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
        this.getSelected();
        this.modifyMixedStatus();
        this.updateShadows();
    }

    init() {
        if (!this.shadowCtx.shadows.length && !this.shadowCtx.mixed) this.create();
    }

    create() {
        if (this.shadowCtx.mixed) return this.unify();

        const actions: BatchAction2[] = [];
        const selected = this.selected;
        for (const view of selected) {
            if (view instanceof ContactLineView) continue;
            const color = new Color(0.3, 0, 0, 0);
            const shadow = new Shadow(new BasicArray(), v4(), true, 10, color, 0, 4, 0, ShadowPosition.Outer);
            actions.push({ target: view, value: shadow });
        }
 
        this.editor.shapesAddShadow(actions);

        this.hiddenCtrl();
    }

    unify() {
        const actions = get_actions_shadow_unify(this.selected);
        this.editor.shapesShadowsUnify(actions);
        this.hiddenCtrl();
    }

    remove(shadow: Shadow) {
        const actions = get_actions_shadow_delete(this.selected, this.getIndexByShadow(shadow));
        this.editor.shapesDeleteShadow(actions);
    }

    modifyVisible(shadow: Shadow) {
        const actions = get_actions_shadow_enabled(this.selected, this.getIndexByShadow(shadow), !shadow.isEnabled);
        this.editor.setShapesShadowEnabled(actions);
    }

    modifyShadowOffsetX(offsetX: number, shadow: Shadow) {
        if (isNaN(offsetX)) return;
        const index = this.getIndexByShadow(shadow);
        this.editor.setShapesShadowOffsetX(get_actions_shadow_offsetx(this.selected, index, offsetX));
    }

    modifyShadowOffsetY(offsetY: number, shadow: Shadow) {
        if (isNaN(offsetY)) return;
        const index = this.getIndexByShadow(shadow);
        this.editor.setShapesShadowOffsetY(get_actions_shadow_offsety(this.selected, index, offsetY));
    }

    modifyShadowBlur(blur: number, shadow: Shadow) {
        if (isNaN(blur)) return;
        const index = this.getIndexByShadow(shadow);
        this.editor.setShapesShadowBlurRadius(get_actions_shadow_blur(this.selected, index, blur));
    }

    modifyShadowSpread(spread: number, shadow: Shadow) {
        if (isNaN(spread)) return;
        const index = this.getIndexByShadow(shadow);
        this.editor.setShapesShadowSpread(get_actions_shadow_spread(this.selected, index, spread));
    }

    modifyShadpwHex(event: Event, shadow: Shadow) {
        const rgb = getRGBFromInputEvent(event);
        if (!rgb) return;

        const color = new Color(shadow.color.alpha, rgb[0], rgb[1], rgb[2]);
        const index = this.getIndexByShadow(shadow);
        const selected = this.selected;

        this.editor.setShapesShadowColor(get_actions_shadow_color(selected, index, color));

        this.hiddenCtrl(event);
    }

    modifyFillAlpha(event: Event, shadow: Shadow) {
        const alpha = getNumberFromInputEvent(event);
        if (isNaN(alpha)) return;
        const color = new Color(
            Math.max(0, Math.min(1, alpha / 100)),
            shadow.color.red,
            shadow.color.green,
            shadow.color.blue
        );
        const index = this.getIndexByShadow(shadow);
        const selected = this.selected;
        this.editor.setShapesShadowColor(get_actions_shadow_color(selected, index, color));
        this.hiddenCtrl(event);
    }

    modifyShadowPosition(shadow: Shadow, position: ShadowPosition) {
        const actions = get_actions_shadow_position(this.selected, this.getIndexByShadow(shadow), position);
        this.editor.setShapesShadowPosition(actions);
    }

    modifyShadowMask(id: string) {
        const actions = get_actions_add_mask(this.selected, id);
        this.editor.shapesSetShadowMask(actions);
        this.kill();
        this.hiddenCtrl();
    }

    unbind() {
        this.editor.shapesDelShadowMask(get_actions_shadow_mask(this.selected));
    }

    removeMask() {
        this.editor.shapesDelStyleShadow(get_actions_shadow_mask(this.selected));
    }

    createStyleLib(name: string, desc: string) {
        const shadows = new BasicArray<Shadow>(...this.shadowCtx.shadows.map(i => i.shadow).reverse());
        const shapdwMask = new ShadowMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, shadows);
        this.editor4Doc.insertStyleLib(shapdwMask, this.page, this.selected);
        this.kill();
    }
}