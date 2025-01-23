import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { BasicArray, Blur, BlurMask, BlurType, Point2D, Style, RadiusType, RadiusMask, ShapeView, PathShapeView, SymbolView } from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { get_actions_add_blur, get_actions_add_mask, get_actions_blur_delete, get_actions_blur_enabled, get_actions_blur_mask, get_actions_blur_modify, get_actions_blur_unify } from "@/utils/shape_style";

export type RadiusCatch = {
    numbers: Map<string, number | string>;
}
export type RadiusContext = {
    radius?: RadiusCatch;
    mask?: string;
    maskInfo?: MaskInfo;
}

function stringifyBlur(sye: { style: Style, blur: Blur | undefined }) {
    if (sye.style.blursMask) return sye.style.blursMask;
    let str = '';
    if (sye.style.blur) {
        const b = sye.style.blur;
        str += b.type + b.saturation + b.isEnabled
    }
    return str;
}

export class RadiusContextMgr extends StyleCtx {
    constructor(protected context: Context, public radiusCtx: RadiusContext) {
        super(context);
    }

    private modifyMixedStatus() {
        const selected = this.selected;
        const first_shape = selected[0];
        if (!first_shape) return;
        const f_r = this.get_rect_shape_all_value(first_shape);

        // radius.lt = this.fixedZero(f_r.lt);
        // radius.rt = this.fixedZero(f_r.rt);
        // radius.rb = this.fixedZero(f_r.rb);
        // radius.lb = this.fixedZero(f_r.lb);

        this.radiusCtx.radius?.numbers.set('lt', this.fixedZero(f_r.lt))
        this.radiusCtx.radius?.numbers.set('rt', this.fixedZero(f_r.rt))
        this.radiusCtx.radius?.numbers.set('lb', this.fixedZero(f_r.lb))
        this.radiusCtx.radius?.numbers.set('rb', this.fixedZero(f_r.rb))

        for (let i = 1, l = selected.length; i < l; i++) {
            const shape = selected[i];
            const rs = this.get_rect_shape_all_value(shape);

            if (Number(rs.lt) !== Number(this.radiusCtx.radius?.numbers.get('lt'))) {
                this.radiusCtx.radius?.numbers.set('lt','多值');
            }
            if (Number(rs.rt) !== Number(this.radiusCtx.radius?.numbers.get('rt'))) {
                this.radiusCtx.radius?.numbers.set('rt','多值');
            }
            if (Number(rs.rb) !== Number(this.radiusCtx.radius?.numbers.get('rb'))) {
                this.radiusCtx.radius?.numbers.set('rb','多值');
            }
            if (Number(rs.lb) !== Number(this.radiusCtx.radius?.numbers.get('lb'))) {
                this.radiusCtx.radius?.numbers.set('lb','多值');
            }
        }
    }

    private fixedZero(value: number | string) {
        if (typeof value === 'string') return value;
        value = Math.round(value * 100) / 100;
        if (Number.isInteger(value)) {
            return Number(value.toFixed(0)); // 返回整数形式
        } else if (Math.abs(value * 10 - Math.round(value * 10)) < Number.EPSILON) {
            return Number(value.toFixed(1)); // 保留一位小数
        } else {
            return Number(value.toFixed(2)); // 保留两位小数
        }
    }

    private get_rect_shape_all_value(shape: ShapeView) {
        const rs = { lt: 0, rt: 0, rb: 0, lb: 0 };
        if (shape instanceof PathShapeView) {
            const s = shape as PathShapeView;
            const points = s?.segments[0]?.points;
            if (!points?.length) return rs;
            rs.lt = points[0]?.radius || s.fixedRadius || 0;
            rs.rt = points[1]?.radius || s.fixedRadius || 0;
            rs.rb = points[2]?.radius || s.fixedRadius || 0;
            rs.lb = points[3]?.radius || s.fixedRadius || 0;
        } else {
            const cornerRadius = (shape as SymbolView).cornerRadius;
            if (cornerRadius) {
                rs.lt = cornerRadius.lt;
                rs.rt = cornerRadius.rt;
                rs.rb = cornerRadius.rb;
                rs.lb = cornerRadius.lb;
            }
        }
        return rs;
    }

    private updateRadius() {
        const represent = this.selected[0];
        this.radiusCtx.mask = represent.style.blursMask;
        if (this.radiusCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.radiusCtx.mask) as RadiusMask;
            this.radiusCtx.maskInfo = {
                name: mask.name,
                desc: mask.description
            }
        } else {
            this.radiusCtx.maskInfo = undefined;
        }

        if (represent.blur) {
            const b = represent.radius;
            this.blurCtx.blur = {
                enable: b.isEnabled,
                type: b.type,
                saturation: b.saturation
            };
        } else {
            this.blurCtx.blur = undefined;
        }
    }

    update() {
        this.getSelected();
        this.modifyMixedStatus();
        this.updateRadius();
    }

    init() {
        if (this.blurCtx.blur || this.blurCtx.mask) return;
        this.create();
    }

    create() {
        if (this.blurCtx.mixed) this.unify();
        const blur = new Blur(new BasicArray(), true, new Point2D(0, 0), 10, BlurType.Gaussian);
        this.editor.shapesAddBlur(get_actions_add_blur(this.shapes, blur));
        this.hiddenCtrl();
    }

    unify() {
        if (this.shapes[0].style.blursMask) {
            const actions = get_actions_add_mask(this.shapes, this.shapes[0].style.blursMask);
            this.editor.shapesSetBlurMask(actions);
        } else {
            const actions = get_actions_blur_unify(this.shapes);
            this.editor.shapesBlurUnify(actions);
        }
        this.hiddenCtrl();
    }

    modifyBlurType(type: BlurType) {
        this.editor.setShapeBlurType(get_actions_blur_modify(this.selected, type));
        this.hiddenCtrl();
    }

    modifyEnable() {
        const actions = get_actions_blur_enabled(this.shapes, !this.blurCtx.blur!.enable);
        this.editor.setShapeBlurEnabled(actions);
        this.hiddenCtrl();
    }

    removeBlur() {
        const actions = get_actions_blur_delete(this.shapes);
        this.editor.shapeDeleteBlur(actions);
        this.hiddenCtrl();
    }

    unbind() {
        const actions = get_actions_blur_mask(this.shapes);
        this.editor.shapesDelBlurMask(actions);
    }

    removeMask() {
        const actions = get_actions_blur_mask(this.shapes);
        this.editor.shapesDelStyleBlur(actions);
    }

    modifyBlurMask(maskID: string) {
        const actions = get_actions_add_mask(this.shapes, maskID);
        this.editor.shapesSetBlurMask(actions);
        this.hiddenCtrl();
        this.kill();
    }
}