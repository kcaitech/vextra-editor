import { ColorPickerEditor } from "@/components/common/ColorPicker/Editor/coloreditor";
import { Context } from "@/context";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import {
    BasicArray,
    Color,
    Fill,
    TextAsyncApi,
    FillMask,
    ShapeView, Api, SymbolRefView, GradientType,
    FillType,
    AttrGetter,
    TextShapeView,
    ShapeType
} from "@kcdesign/data";

export class TextPicker extends ColorPickerEditor {
    format: AttrGetter | undefined

    constructor(public context: Context, type: string) {
        super(context, type);
    }

    private get editor(): TextAsyncApi {
        return (this.m_api as unknown as TextAsyncApi)
            ?? (this.m_api = new TextAsyncApi(this.context.coopRepo, this.context.data, this.page));
    }

    protected commit() {
        this.m_api?.commit();
        this.m_api = undefined;
    }

    private get textShapes(): TextShapeView[] {
        return this.selected.filter(shape => shape.type === ShapeType.Text) as TextShapeView[];
    }

    private get length(): boolean {
        return this.textShapes.length === 1;
    }

    //获取选中字体的长度和开始下标
    private getTextIndexAndLen = () => {
        const selection = this.context.selection.textSelection;
        const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
        const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
        if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
            return { textIndex, selectLength }
        } else {
            return { textIndex: 0, selectLength: Infinity }
        }
    }

    private setType(api: Api, textShape: TextShapeView, type: string): void {
        const shape = this.editor.shape4edit(api, textShape);
        const page = this.page.data;
        const fillType = type === FillType.SolidColor ? FillType.SolidColor : FillType.Gradient;
        let idx = 0, len = 0;
        if (this.length) {
            const { textIndex, selectLength } = this.getTextIndexAndLen();
            idx = textIndex; len = selectLength;
        } else {
            const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
            len = text.length;
            if (len === 0) return;
        }
        api.textModifyFillType(page, shape, fillType, idx, len);
        if (type === FillType.SolidColor) {
            if (this.format?.gradient) {
                const { red, green, blue, alpha } = this.format?.gradient.stops[0].color;
                const color = new Color(alpha, red, green, blue);
                api.textModifyColor(page, shape, idx, len, color);
            }
        } else if (this.format) {
            const color = this.format.color || new Color(1, 6, 6, 6);
            const g = this.editor.initGradient(this.format.gradient, type as GradientType, color);
            api.setTextGradient(page, shape, g, idx, len);
        }
    }

    /* 修改填充类型 */
    modifyFillType(type: string): void {
        super.modifyFillType(type);
        this.getSelection();
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((shape) => {
                this.setType(api, shape, type);
            })
        }
        this.editor.modifyFillType([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    /* 修改填充纯色 */
    setSolidColor(c: RGBACatch): void {
        this.getSelection();
        const modifyLocal = (api: Api) => {
            this.textShapes.forEach((s) => {
                const shape = this.editor.shape4edit(api, s);
                const page = this.page.data;
                let idx = 0, len = 0;
                if (this.length) {
                    const { textIndex, selectLength } = this.getTextIndexAndLen();
                    idx = textIndex; len = selectLength;
                } else {
                    const text = shape instanceof ShapeView ? shape.text : shape.value as Text;
                    len = text.length;
                    if (len === 0) return;
                }
                api.textModifyColor(page, shape, idx, len, new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor2([modifyLocal]);
        this.hiddenCtrl();
        this.commit();
    }

    private m_views: ShapeView[] = [];
    private m_fills: BasicArray<Fill>[] = [];
    /* 拖拽修改纯色前置 */
    dragSolidBegin(): void {
        this.getSelection();
        for (const view of this.selected) {
            if (view instanceof SymbolRefView || view.isVirtualShape) this.m_views.push(view);
            else this.m_fills.push(view.getFills());
        }
    }

    /* 拖拽修改纯色 */
    solidDragging(c: RGBACatch): void {
        if (this.fill!.parent?.parent instanceof FillMask) {
            this.editor.modifySolidColor2([(api: Api) => {
                api.setFillColor(this.fill!, new Color(c.A, c.R, c.G, c.B));
            }]);
            return;
        }

        const modifyVariable = (api: Api) => {
            this.m_views.forEach(view => {
                const variable = this.editor.getFillsVariable(api, this.page, view);
                api.setFillColor(variable.value[this.index], new Color(c.A, c.R, c.G, c.B));
            });
        }
        const modifyLocal = (api: Api) => {
            this.m_fills.forEach((_fills) => {
                api.setFillColor(_fills[this.index], new Color(c.A, c.R, c.G, c.B));
            })
        }
        this.editor.modifySolidColor2([modifyVariable, modifyLocal]);
        this.hiddenCtrl();
    }

    /* 拖拽修改纯色后置 */
    dragSolidEnd(): void {
        this.m_fills = [];
        this.m_views = [];
        this.commit();
    }

}