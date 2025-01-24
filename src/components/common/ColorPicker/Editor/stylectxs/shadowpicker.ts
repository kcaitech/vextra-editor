import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { BorderPaintsAsyncApi, Color, Shadow } from "@kcdesign/data";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

export class ShadowColorPicker extends ColorPickerEditor {
    shadow: Shadow | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    private get index(): number {
        if (this.m_index !== undefined) return this.m_index;
        if (!this.shadow) return this.m_index = 0;
        const parent = this.shadow.parent as any;
        return this.m_index = parent?.findIndex((i: any) => i === this.shadow) ?? -1;
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
}