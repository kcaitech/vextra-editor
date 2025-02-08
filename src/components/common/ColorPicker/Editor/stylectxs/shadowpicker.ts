import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Color, Shadow, ShadowAsyncApi, ShadowMask } from "@kcdesign/data";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

export class ShadowColorPicker extends ColorPickerEditor {
    shadow: Shadow | undefined;

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private m_index: number | undefined;

    get index(): number {
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

    private get api(): ShadowAsyncApi {
        return (this.m_api as unknown as ShadowAsyncApi)
            ?? (this.m_api = new ShadowAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        if (!this.shadow) return;
        const actions = this.getApiParams(this.shadow, c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
        this.commit();
    }

    dragSolidBegin(): void {
        this.getSelection();
    }

    solidDragging(c: RGBACatch): void {
        if (!this.shadow) return;
        const actions = this.getApiParams(this.shadow, c);
        this.api.modifySolidColor(actions);
        this.hiddenCtrl();
    }

    getApiParams(shadow: Shadow, c: RGBACatch): { shadow: Shadow, color: Color }[] {
        const actions: { shadow: Shadow, color: Color }[] = [];
        if (shadow.parent?.parent instanceof ShadowMask) {
            actions.push({ shadow, color: new Color(c.A, c.R, c.G, c.B) });
        } else {
            for (const view of this.flat) {
                const shadow = view.getShadows()[this.index];
                actions.push({ shadow, color: new Color(c.A, c.R, c.G, c.B) });
            }
        }
        return actions;
    }

    dragSolidEnd(): void {
        this.commit();
    }
}