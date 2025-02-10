import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Color, Fill, Stop, BasicArray } from "@kcdesign/data";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { BorderPaintsAsyncApi } from "@kcdesign/data";
import { get_action_gradient_stop } from "@/utils/shape_style";
import { v4 } from "uuid";

export class BorderColorPicker extends ColorPickerEditor {
    paint: Fill | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.paint) return this.m_index = 0;
        const parent = this.paint.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i === this.paint) ?? -1;
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
    }

    private get api(): BorderPaintsAsyncApi {
        return (this.m_api as unknown as BorderPaintsAsyncApi)
            ?? (this.m_api = new BorderPaintsAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    modifyFillType(type: string): void {
        this.getSelection();
        // todo 参考fillspicker
        // if (type === FillType.SolidColor) {
        //     const actions = get_actions_filltype(this.flat, this.index, type as FillType);
        //     this.pageEditor.setShapesBorderType(actions);
        // } else {
        //     const actions = get_action_gradient_stop(this.flat, this.index, type, 'borders');
        //     this.pageEditor.modifyShapeGradientType(actions);
        // }
        super.modifyFillType(type);
        this.hiddenCtrl();
    }

    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
        this.hiddenCtrl();
        this.commit();
    }

    dragSolidBegin(): void {
        this.getSelection();
    }

    solidDragging(c: RGBACatch): void {
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
        this.hiddenCtrl();
    }

    dragSolidEnd(): void {
        this.commit();
    }

    createStop(c: RGBACatch) {
        this.getSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        const stop = new Stop([0] as BasicArray<number>, v4(), c.position, color);
        const actions = get_action_gradient_stop(this.flat, this.index, stop, "borders");
        this.pageEditor.addShapesGradientStop(actions);
        this.hiddenCtrl();
        return stop.id;
    }

    removeStop(stopAt: number) {
        this.getSelection();
        this.api.removeGradientStop(this.index, stopAt, this.flat);
        this.commit();
        this.hiddenCtrl();
    }

    setStopColor(c: RGBACatch, stopAt: number) {
        this.getSelection();
        const color = new Color(c.A, c.R, c.G, c.B);
        this.api.modifyStopColorOnce(this.flat, this.index, color, stopAt);
        this.commit();
        this.hiddenCtrl();
    }

    dragStopBegin() {
        this.getSelection();
    }

    draggingStop(c: RGBACatch, stopAt: number): void {
        this.api.modifyStopColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B), stopAt);
        this.hiddenCtrl();
    }

    dragStopEnd(): void {
        this.commit();
    }

    reverseStops() {
        this.getSelection();
        this.api.reverseGradientStops(this.flat, this.index);
        this.hiddenCtrl();
        this.commit();
    }

    rotateStops() {
        this.getSelection();
        this.api.rotateGradientStops(this.flat, this.index);
        this.hiddenCtrl();
        this.commit();
    }
}