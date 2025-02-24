import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import { BasicArray, Blur, BlurMask, BlurType, Point2D, Style, RadiusType, RadiusMask, ShapeView, PathShapeView, SymbolView } from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { get_actions_add_blur, get_actions_add_mask, get_actions_blur_delete, get_actions_blur_enabled, get_actions_blur_mask, get_actions_blur_modify, get_actions_blur_unify } from "@/utils/shape_style";
import { noGroupShapesFrom } from "@/utils/content";

export type RadiusCatch = {
    numbers: Map<string, number | string>;
}

export type RadiusContext = {
    isRect: boolean;
    more: boolean;
    radius: Map<string, number | string>;
    mask?: string;
    maskInfo?: MaskInfo;
}


export class RadiusContextMgr extends StyleCtx {
    constructor(protected context: Context, public radiusCtx: RadiusContext) {
        super(context);
    }

    private modifyMixedStatus() {
        this.radiusCtx.radius.clear();
        this.radiusCtx.mask = '';
        const selected = noGroupShapesFrom(this.selected);
        if (!selected.length) return;


        if (this.radiusCtx.more && this.radiusCtx.isRect) {
            this.get_all_values(selected);
            return;
        }

        let init = this.get_radius_for_shape(selected[0]);

        if (typeof init === 'string') {
            this.radiusCtx.radius.set('lt', init)
            return;
        }

        for (let i = 1, l = selected.length; i < l; i++) {
            const __r = this.get_radius_for_shape(selected[i]);
            if (__r !== init) {
                this.radiusCtx.radius.set('lt', '多值')
                return;
            }
        }

        const lt = this.fixedZero(init);
        this.radiusCtx.radius.set('lt', lt)
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

    private get_all_values(shapes: ShapeView[]) {

        const first_shape = shapes[0];
        if (!first_shape) return;
        const f_r = this.get_rect_shape_all_value(first_shape);

        const lt = this.fixedZero(f_r.lt);
        const rt = this.fixedZero(f_r.rt);
        const rb = this.fixedZero(f_r.rb);
        const lb = this.fixedZero(f_r.lb);

        this.radiusCtx.radius.set('lt', lt)
        this.radiusCtx.radius.set('rt', rt)
        this.radiusCtx.radius.set('lb', lb)
        this.radiusCtx.radius.set('rb', rb)

        for (let i = 1, l = shapes.length; i < l; i++) {
            const shape = shapes[i];
            const rs = this.get_rect_shape_all_value(shape);

            if (Number(rs.lt) !== Number(this.radiusCtx.radius.get('lt'))) {
                this.radiusCtx.radius.set('lt', '多值');
            }
            if (Number(rs.rt) !== Number(this.radiusCtx.radius.get('rt'))) {
                this.radiusCtx.radius.set('rt', '多值');
            }
            if (Number(rs.rb) !== Number(this.radiusCtx.radius.get('rb'))) {
                this.radiusCtx.radius.set('rb', '多值');
            }
            if (Number(rs.lb) !== Number(this.radiusCtx.radius.get('lb'))) {
                this.radiusCtx.radius.set('lb', '多值');
            }
        }

    }

    private get_radius_for_shape(shape: ShapeView) {
        if (shape.radiusType === RadiusType.Rect) {

            if (shape instanceof PathShapeView) {
                const s = shape as PathShapeView;

                const points = s?.segments[0]?.points;

                if (!points?.length) return 0;

                let _r = points[0].radius || s.fixedRadius || 0;

                for (let i = 1, l = points.length; i < l; i++) {
                    if ((points[i].radius || s.fixedRadius || 0) !== _r) return '多值';
                }
                return _r;
            } else {
                const cornerRadius = (shape as SymbolView).cornerRadius;
                if (!cornerRadius) return 0;
                if (cornerRadius.lt === cornerRadius.rt
                    && cornerRadius.rt === cornerRadius.rb
                    && cornerRadius.rb === cornerRadius.lb) {
                    return cornerRadius.lt;
                }
                return '多值';
            }
        }

        if (shape instanceof PathShapeView) {
            const s = shape as PathShapeView;
            const segments = s.segments;
            if (!segments.length) return 0;
            const firstPoint = segments[0].points[0];
            if (!firstPoint) {
                return 0;
            }

            let _r = firstPoint.radius || s.fixedRadius || 0;

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const points = segment.points;

                if (!points?.length) continue;

                for (let j = 0; j < points.length; j++) {
                    if ((points[j].radius || s.fixedRadius || 0) !== _r) return '多值';
                }
            }

            return _r;
        } else {
            return shape.fixedRadius || 0;
        }
    }

    private modify_can_be_rect() {
        this.radiusCtx.isRect = false;

        const selected = this.selected;
        for (let i = 0, l = selected.length; i < l; i++) {
            if (selected[i].radiusType !== RadiusType.Rect) return;
        }

        this.radiusCtx.isRect = true;
    }

    private updateRadius() {
        const represent = this.selected[0];
        if (!represent) return
        this.radiusCtx.mask = represent.style.blursMask;
        if (this.radiusCtx.mask) {
            const mask = this.context.data.stylesMgr.getSync(this.radiusCtx.mask) as RadiusMask;
            this.radiusCtx.maskInfo = {
                name: mask.name,
                desc: mask.description,
                disabled: mask.disabled
            }
        } else {
            this.radiusCtx.maskInfo = undefined;
        }
    }

    update() {
        this.getSelected();
        this.modify_can_be_rect();
        this.modifyMixedStatus();
        this.updateRadius();
    }

    setmore() {
        this.radiusCtx.more = !this.radiusCtx.more
        this.modifyMixedStatus();

    }

    init() {
        if (this.radiusCtx.radius || this.radiusCtx.mask) return;
        this.create();
    }

    create() {
        if (this.radiusCtx.radius) this.unify();
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
        const actions = get_actions_blur_enabled(this.shapes, !this.radiusCtx.radius);
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