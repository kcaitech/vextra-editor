import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { Color, Fill, FillsAsyncApi } from "@kcdesign/data";

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

    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
        this.commit();
    }

    dragSolidBegin(): void {
        this.getSelection();
    }

    solidDragging(c: RGBACatch): void {
        this.api.modifySolidColor(this.flat, this.index, new Color(c.A, c.R, c.G, c.B));
    }

    dragSolidEnd(): void {
        this.commit();
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
        this.m_index = undefined;
    }
}