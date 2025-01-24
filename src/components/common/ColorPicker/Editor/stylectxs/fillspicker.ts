import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { BasicArray, Color, Fill, FillsAsyncApi, FillType, Stop } from "@kcdesign/data";
import { get_aciton_gradient_stop, get_actions_filltype } from "@/utils/shape_style";
import { v4 } from "uuid";

export class FillsPicker extends ColorPickerEditor {
    fill: Fill | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;
    private get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.fill) return this.m_index = 0;
        const parent = this.fill.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i === this.fill) ?? -1;
    }

    private get api(): FillsAsyncApi {
        return (this.m_api as unknown as FillsAsyncApi)
            ?? (this.m_api = new FillsAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
    }

    modifyFillType(type: string): void {
        this.getSelection();
        if (type === FillType.SolidColor || type === FillType.Pattern) {
            const actions = get_actions_filltype(this.flat, this.index, type as FillType);
            this.pageEditor.setShapesFillType(actions);
        } else {
            const actions = get_aciton_gradient_stop(this.flat, this.index, type, 'fills');
            this.pageEditor.modifyShapeGradientType(actions);
        }
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
        const actions = get_aciton_gradient_stop(this.flat, this.index, stop, "fills");
        this.pageEditor.addShapesGradientStop(actions);
        this.hiddenCtrl();
    }
}