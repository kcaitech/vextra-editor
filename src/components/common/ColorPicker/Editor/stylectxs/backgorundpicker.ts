import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Color, Shadow, backgorundAsyncApi, ShadowMask } from "@kcdesign/data";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

export class backgorundColorPicker extends ColorPickerEditor {

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
    }

    private get api(): backgorundAsyncApi {
        return (this.m_api as unknown as backgorundAsyncApi)
            ?? (this.m_api = new backgorundAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    setSolidColor(c: RGBACatch): void {
        const actions = this.getApiParams(c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
        this.commit();
    }

    dragSolidBegin(): void {
        this.updateSelection();
    }

    solidDragging(c: RGBACatch): void {
        const actions = this.getApiParams(c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
    }

    getApiParams(c: RGBACatch): { color: Color }[] {
        const actions: { color: Color }[] = [];
        actions.push({ color: new Color(c.A, c.R, c.G, c.B) });
        return actions;
    }

    dragSolidEnd(): void {
        this.commit();
    }
}