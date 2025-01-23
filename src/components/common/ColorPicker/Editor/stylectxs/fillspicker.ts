import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import { Color, Fill, FillsAsyncApi } from "@kcdesign/data";

export class FillsPicker extends ColorPickerEditor {
    fill: Fill | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private get index(): number {
        if (!this.fill) return 0;
        const parent = this.fill.parent as any;
        return parent?.findIndex((i: any) => i === this.fill) ?? -1;
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
        this.api.modifySolidColor(this.flat, 0, new Color(c.A, c.R, c.G, c.B));
    }

    dragSolidEnd(): void {
        this.commit();
    }
}