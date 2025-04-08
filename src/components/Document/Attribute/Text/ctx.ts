import { StyleCtx } from "@/components/Document/Attribute/stylectx";
import {
    Api,
    BasicArray,
    Blur,
    BlurMask,
    BlurType,
    Point2D, TextModifier,
    ShapeView,
    SymbolRefView, StyleMangerMember,
    TextAttr,
    TextShapeView,
    TextMask,
    ShapeType,
    AttrGetter,
    Color,
    BulletNumbers,
    BulletNumbersType,
} from "@kcdesign/data";
import { MaskInfo } from "@/components/Document/Attribute/basic";
import { Context } from "@/context";
import { v4 } from "uuid";
import { fontWeightConvert } from './FontNameList';
import { format_value, is_mac } from "@/utils/common";
import { gradient_equals } from "../../Selection/Controller/ColorEdit/gradient_utils";


export type TextContext = {
    mixed: boolean;
    text?: AttrGetter;
    mask?: string;
    maskInfo?: MaskInfo;
}


export class TextContextMgr extends StyleCtx {
    constructor(protected context: Context, public textCtx: TextContext) {
        super(context);
    }

    private m_editor: TextModifier | undefined;

    private _DefaultFontName = is_mac() ? 'PingFang SC' : '微软雅黑';
    protected get editor(): TextModifier {
        return this.m_editor ?? (this.m_editor = new TextModifier(this.repo));
    }


    private updateText() {
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        if (t_shape.length === 0 || !t_shape[0].text) return;
        this.textCtx.mask = undefined
        this.textCtx.mixed = false
        if (t_shape.length === 1) {
            const { textIndex, selectLength } = this.getTextIndexAndLen();
            const editor = this.context.editor4TextShape(t_shape[0]);
            let format: AttrGetter
            const __text = t_shape[0].getText();
            format = __text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr());
            format.fontName = format.fontName || this._DefaultFontName;
            if (format.fontNameIsMulti) format.fontName = undefined;
            if (format.weightIsMulti) format.weight = undefined;
            this.textCtx.text = format;
            if (format.textMask) {
                const mask = this.context.data.stylesMgr.getSync(format.textMask) as TextMask
                this.textCtx.mask = format.textMask
                this.textCtx.maskInfo = {
                    name: mask.name,
                    desc: mask.description
                }
            }
            this.textCtx.mixed = format.textMaskIsMulti;
        } else {
            let formats: any[] = [];
            let format: any = {};
            for (let i = 0; i < t_shape.length; i++) {
                const text = t_shape[i];
                const editor = this.context.editor4TextShape(text);
                const __text = text.getText();
                const format = __text.getTextFormat(0, Infinity, editor.getCachedSpanAttr());
                formats.push(format)
            }

            const referenceKeys = Object.keys(formats[0]);
            for (const key of referenceKeys) {
                const referenceValue = formats[0][key];
                let foundEqual = true;
                for (let i = 1; i < formats.length; i++) {
                    if ((key === 'color' || key === 'highlight') && formats[i][key] && referenceValue) {
                        if (!(formats[i][key] as Color).equals(referenceValue as Color)) {
                            foundEqual = false;
                            break;
                        }
                    } else if (key === 'gradient') {
                        if (formats[i][key]) {
                            if (!referenceValue) {
                                foundEqual = false;
                                break;
                            }
                            if (!(gradient_equals(formats[i][key], referenceValue))) {
                                foundEqual = false;
                                break;
                            }
                        } else if (referenceValue) {
                            foundEqual = false;
                            break;
                        }
                    } else if (key === 'bulletNumbers' && formats[i][key] && referenceValue) {
                        const { type: bullet1 } = formats[i][key];
                        const { type: bullet2 } = referenceValue;
                        if (bullet1 !== bullet2) {
                            foundEqual = false;
                            break;
                        }
                    } else if (formats[i][key] !== referenceValue) {
                        foundEqual = false;
                        break;
                    }
                }
                format[key] = foundEqual ? referenceValue : 'unlikeness';
                if (key === 'bulletNumbers' && !foundEqual) {
                    format[key] = new BulletNumbers(BulletNumbersType.Mixed)
                }
            }
            if (format.fontNameIsMulti === 'unlikeness' || format.fontName === 'unlikeness') format.fontName = undefined;
            if (format.weight === 'unlikeness' || format.weightIsMulti === 'unlikeness') format.weight = undefined;
            this.textCtx.text = format;
            if (format.textMask === 'unlikeness' || format.textMaskIsMulti === 'unlikeness' || format.textMaskIsMulti) {
                this.textCtx.mixed = true
            } else if (format.textMask !== undefined) {
                this.textCtx.mask = format.textMask
                const mask = this.context.data.stylesMgr.getSync(format.textMask) as TextMask
                this.textCtx.maskInfo = {
                    name: mask.name,
                    desc: mask.description
                }
            }
        }


    }

    update() {
        this.updateText();
    }

    //获取选中字体的长度和开始下标
    getTextIndexAndLen = () => {
        const selection = this.context.textSelection;
        const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
        const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
        if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
            return { textIndex, selectLength }
        } else {
            return { textIndex: 0, selectLength: Infinity }
        }
    }

    createStyleLib(name: string, desc: string) {
        const text = new TextAttr();
        text.fontName = this.textCtx.text?.fontName;
        text.fontSize = this.textCtx.text?.fontSize;
        text.weight = this.textCtx.text?.weight;
        text.autoLineHeight = this.textCtx.text?.autoLineHeight;
        text.minimumLineHeight = this.textCtx.text?.minimumLineHeight;
        text.maximumLineHeight = this.textCtx.text?.maximumLineHeight;
        text.kerning = this.textCtx.text?.kerning;
        text.underline = this.textCtx.text?.underline;
        text.strikethrough = this.textCtx.text?.strikethrough;
        text.transform = this.textCtx.text?.transform;
        const textMask = new TextMask([0] as BasicArray<number>, this.context.data.id, v4(), name, desc, text);
        const { textIndex, selectLength } = this.getTextIndexAndLen();
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        this.editor.createTextMask(this.document, textMask, this.page, textIndex, selectLength, textMask.id, t_shape);
        const textAttr = this.context.textSelection.getTextAttr;
        textAttr.weight = text.weight;
        textAttr.italic = text.italic;
        this.context.textSelection.setTextAttr(textAttr);
        this.kill();
        this.hiddenCtrl()
    }

    modifyTextMask(maskid: string) {
        const { textIndex, selectLength } = this.getTextIndexAndLen();
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        this.editor.setTextMask(this.document, this.page, t_shape, textIndex, selectLength, maskid);
        this.kill();
        this.hiddenCtrl()
    }

    unbind() {
        const { textIndex, selectLength } = this.getTextIndexAndLen();
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        this.editor.unbindShapesTextMask(this.document, this.page, t_shape, textIndex, selectLength);
        this.kill();
    }

    //设置字体
    setFont = (font: string) => {
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        const editor = this.context.editor4TextShape(t_shape[0]);
        if (t_shape.length === 1) {
            const { textIndex, selectLength } = this.getTextIndexAndLen()
            console.log(textIndex, selectLength,font);
            
            editor.setTextFontName(textIndex, selectLength, font)
        } else {
            editor.setTextFontNameMulti(t_shape, font);
        }
        this.kill()
    }

    // 设置字重
    setFontWeight = (weight: number, italic: boolean) => {
        const t_shape = this.flat.filter(item => item.type === ShapeType.Text) as TextShapeView[];
        const editor = this.context.editor4TextShape(t_shape[0]);
        if (t_shape.length === 1) {
            const { textIndex, selectLength } = this.getTextIndexAndLen()
            editor.setTextWeight(weight, italic, textIndex, selectLength)
        } else {
            editor.setTextWeightMulti(t_shape, weight, italic);
        }
        this.kill()
    }

}