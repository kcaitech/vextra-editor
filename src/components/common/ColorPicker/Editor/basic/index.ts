import { Context } from "@/context";
import { ShapeView } from "@kcdesign/data";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

export type FillContext = {
    type: string;        // 值域为纯色、三种渐变色、图案
    RGBAs: RGBACatch[];  // 所有RGBA值集合
    RGBA: RGBACatch;     // 当前处于焦点状态的RGB值
    media?: string;      // Base64格式的图片资源
}

export class IFillModifier { /*这里的Fill指所有纯色、渐变色、图案*/
    protected selected: ShapeView[];
    protected flat: ShapeView[];

    constructor(protected context: Context) {
        this.selected = [];
        this.flat = [];
    }

    private getSelection() {
        this.selected = this.context.selection.selectedShapes;
        this.flat = this.context.selection.flat;
    }


    public update(raw: any) {
    }

    public modifyRGBA() {
    }
}