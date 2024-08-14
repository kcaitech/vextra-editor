<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from './SelectFont.vue';
import { onMounted, ref, onUnmounted, computed } from 'vue';
import TextAdvancedSettings from './TextAdvancedSettings.vue'
import { Context } from '@/context';
import { AsyncTextAttrEditor, AttrGetter, BasicArray, FillType, Gradient, GradientType, Matrix, ShapeType, Stop, TextBehaviour, TextShapeView, adapt2Shape, cloneGradient } from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color, UnderlineType, StrikethroughType } from "@kcdesign/data";
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Reg_HEX } from "@/utils/RegExp";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { message } from "@/utils/message";
import { throttle } from 'lodash';
import { watch } from 'vue';
import { getGradient, gradient_equals } from '../../Selection/Controller/ColorEdit/gradient_utils';
import FontWeightSelected from './FontWeightSelected.vue';
import { fontWeightConvert } from './FontNameList';
import { TextSelectionLite } from '@/context/textselectionlite';
import { Attribute } from '@/context/atrribute';
import { is_mac } from "@/utils/common";

interface Props {
    context: Context
    shape: TextShapeView
    textShapes: TextShapeView[]
    selectionChange: number
    trigger: any[]
}

const DefaultFontName = is_mac() ? 'PingFang SC' : '微软雅黑';

const props = defineProps<Props>();
const { t } = useI18n();
const fonstSize = ref<any>(14)
const showSize = ref(false)
const sizeList = ref<HTMLDivElement>()
const showFont = ref(false)
const isBold = ref<any>()
const isTilt = ref(false)
const selectLevel = ref('left')
const selectVertical = ref('top')
const fontName = ref(DefaultFontName)
const colorIsMulti = ref(false)
const highlightIsMulti = ref(false)
const alphaFill = ref<HTMLInputElement>();
const sizeColor = ref<HTMLInputElement>()
const mixed = ref<boolean>(false);
const higMixed = ref<boolean>(false);
const textColor = ref<Color>()
const highlight = ref<Color>()
const fillType = ref<FillType>(FillType.SolidColor);
const gradient = ref<Gradient>();
const textSize = ref<HTMLInputElement>()
const higlightColor = ref<HTMLInputElement>()
const higlighAlpha = ref<HTMLInputElement>()
const sizeHoverIndex = ref(-1);
const fontWeight = ref('Regular');
const weightMixed = ref<boolean>(false);
const shapes = ref<TextShapeView[]>(props.textShapes);
const disableWeight = ref(false);
const fontNameEl = ref<HTMLDivElement>();
const selectText = ref('autowidth');
const wordSpace = ref();
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const rowHeight = ref()
const row_height = ref(`${t('attr.auto')}`)

function toHex(r: number, g: number, b: number, prefix = true) {
    const hex = (n: number) => n.toString(16)
        .toUpperCase().length === 1
        ? `0${n.toString(16).toUpperCase()}`
        : n.toString(16).toUpperCase();
    return (prefix ? '#' : '') + hex(r) + hex(g) + hex(b);
}

const onShowFont = () => {
    props.context.workspace.focusText()
    if (showFont.value) {
        return showFont.value = false
    }
    showFont.value = true

    props.context.escstack.save('onShowFont', () => {
        const achieve = showFont.value;
        showFont.value = false;
        return achieve;
    })

    document.addEventListener('click', onShowFontBlur);
}

const onShowFontBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.font-container') && !e.target.closest('.select-font')) {
        var timer = setTimeout(() => {
            showFont.value = false;
            props.context.workspace.focusText()
            clearTimeout(timer)
            document.removeEventListener('click', onShowFontBlur);
        }, 10)
    }
}
const textSizes = ref([10, 12, 14, 16, 18, 24, 36, 48, 64]);
const sizeSelectIndex = ref(2);
const onShowSize = () => {
    props.context.workspace.focusText()
    if (showSize.value) {
        return showSize.value = false
    }
    const index = textSizes.value.findIndex(item => item === fonstSize.value);
    if (index > -1) sizeSelectIndex.value = index;
    showSize.value = true

    props.context.escstack.save('onShowSize', () => {
        const isAchieve = showSize.value;
        showSize.value = false;
        return isAchieve
    })

    document.addEventListener('click', onShowSizeBlur);
}

const onShowSizeBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.text-size')) {
        var timer = setTimeout(() => {
            showSize.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onShowSizeBlur);
        }, 10)
    }
}
const length = computed(() => {
    return props.textShapes.length === 1;
})
// 设置加粗
const onBold = (weight: number) => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextWeight(weight, 0, Infinity)
        } else {
            editor.setTextWeight(weight, textIndex, selectLength)
            textFormat()
        }
    } else {
        editor.setTextWeightMulti(props.textShapes, weight);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.weight = weight;
    props.context.textSelection.setTextAttr(textAttr);
}
// 设置文本倾斜
const onTilt = (italic: boolean) => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextItalic(italic, 0, Infinity)
        } else {
            editor.setTextItalic(italic, textIndex, selectLength)
            textFormat()
        }
    } else {
        editor.setTextItalicMulti(props.textShapes, italic);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.italic = italic;
    props.context.textSelection.setTextAttr(textAttr);
}
const setFontWeight = (weight: number, italic: boolean) => {
    fontWeight.value = fontWeightConvert(weight, italic);
    onBold(weight);
    onTilt(italic);
}

// 设置水平对齐
const onSelectLevel = (icon: TextHorAlign) => {
    selectLevel.value = icon;
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextHorAlign(icon, 0, Infinity)
        } else {
            editor.setTextHorAlign(icon, textIndex, selectLength)
            textFormat()
        }
    } else {
        editor.setTextHorAlignMulti(props.textShapes, icon);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.alignment = icon;
    props.context.textSelection.setTextAttr(textAttr);
}
//设置垂直对齐
const onSelectVertical = (icon: TextVerAlign) => {
    selectVertical.value = icon;
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        editor.setTextVerAlign(icon)
        textFormat()
    } else {
        editor.setTextVerAlignMulti(props.textShapes, icon);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.verAlign = icon;
    props.context.textSelection.setTextAttr(textAttr);
}
//设置字体大小
const changeTextSize = (size: number) => {
    fonstSize.value = size
    showSize.value = false;
    const editor = props.context.editor4TextShape(shapes.value[0] as TextShapeView)
    if (shapes.value.length === 1) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextFontSize(0, Infinity, size)
        } else {
            editor.setTextFontSize(textIndex, selectLength, size)
            textFormat()
        }
    } else {
        editor.setTextFontSizeMulti((shapes.value as TextShapeView[]), size);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.fontSize = size;
    props.context.textSelection.setTextAttr(textAttr);
}
//设置字体
const setFont = (font: string) => {
    fontName.value = font
    showFont.value = false;
    const editor = props.context.editor4TextShape(props.shape);
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextFontName(0, Infinity, font)
        } else {
            editor.setTextFontName(textIndex, selectLength, font)
        }
    } else {
        editor.setTextFontNameMulti(props.textShapes, font);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.fontName = font;
    props.context.textSelection.setTextAttr(textAttr);
    textFormat()
}

const setWordSpace = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (wordSpace.value.length < 1) {
        wordSpace.value = 0
    }
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        // if (wordSpace.value.slice(-1) === '%') {
        //     wordSpace.value = Number(wordSpace.value.slice(0, -1))
        // }
        if (!isNaN(Number(wordSpace.value))) {
            if (isSelectText()) {
                editor.setCharSpacing(Number(wordSpace.value), 0, Infinity)
            } else {
                editor.setCharSpacing(Number(wordSpace.value), textIndex, selectLength)
            }
        } else {
            textFormat()
        }
    } else {
        if (!isNaN(Number(wordSpace.value))) {
            editor.setCharSpacingMulit(props.textShapes, Number(wordSpace.value))
        } else {
            textFormat()
        }
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.kerning = Number(wordSpace.value);
    props.context.textSelection.setTextAttr(textAttr);
    charSpacing.value?.blur()
}

const setRowHeight = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (rowHeight.value.length < 1) {
        rowHeight.value = 1
    }
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (!isNaN(Number(rowHeight.value))) {
            if (isSelectText()) {
                editor.setLineHeight(Number(rowHeight.value), 0, Infinity)
            } else {
                editor.setLineHeight(Number(rowHeight.value), textIndex, selectLength)
            }
        } else {
            textFormat()
        }
    } else {
        if (!isNaN(Number(rowHeight.value))) {
            editor.setLineHeightMulit(props.textShapes, Number(rowHeight.value));
        } else {
            textFormat()
        }
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.maximumLineHeight = Number(rowHeight.value);
    textAttr.minimumLineHeight = Number(rowHeight.value);
    props.context.textSelection.setTextAttr(textAttr);
    lineHeight.value?.blur();
}

function getTextSelection() {
    return props.context.selection.textSelection;
}

//获取选中字体的长度和开始下标
const getTextIndexAndLen = () => {
    const selection = getTextSelection();
    const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
    const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
    return { textIndex, selectLength }
}
//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
    const selection = getTextSelection();
    if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
        return false
    } else {
        return true
    }
}
const sizeValue = ref('');
const executed = ref(true);
//输入框设置字体大小
const setTextSize = () => {
    is_size_select.value = false;
    if (!executed.value) return;
    executed.value = false;
    let value = sizeValue.value.trim();
    if (value.length < 1) {
        value = '1'
    }
    if (!isNaN(Number(value)) && Number(value) > 0) {
        changeTextSize(Number(value))
        textFormat()
    } else {
        textFormat()
    }

}
const handleSize = () => {
    executed.value = true;
    const value = textSize.value!.value;
    sizeValue.value = value;
}
const reflush = ref(0);
// 获取当前文字格式
const _textFormat = () => {
    const shapes = props.context.selection.selectedShapes;
    const t_shape = shapes.filter(item => item.type === ShapeType.Text) as TextShapeView[];
    if (t_shape.length === 0 || !t_shape[0].text) return
    mixed.value = false;
    disableWeight.value = false;
    weightMixed.value = false;
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(t_shape[0])
        let format: AttrGetter
        const __text = t_shape[0].getText();
        if (textIndex === -1) {
            format = __text.getTextFormat(0, Infinity, editor.getCachedSpanAttr())
        } else {
            format = __text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr())
        }
        colorIsMulti.value = format.colorIsMulti
        rowHeight.value = format.minimumLineHeight || 0
        wordSpace.value = format.kerning || 0
        highlightIsMulti.value = format.highlightIsMulti
        selectLevel.value = format.alignment || 'left'
        selectVertical.value = format.verAlign || 'top'
        selectText.value = format.textBehaviour || 'flexible'
        fontName.value = format.fontName || DefaultFontName
        fonstSize.value = format.fontSize || 14
        textColor.value = format.color
        highlight.value = format.highlight
        fillType.value = format.fillType || FillType.SolidColor
        isBold.value = format.weight
        isTilt.value = format.italic || false
        gradient.value = format.gradient;
        fontWeight.value = fontWeightConvert(isBold.value, isTilt.value);
        if (format.minimumLineHeightIsMulti) rowHeight.value = `${t('attr.more_value')}`
        if (format.italicIsMulti) weightMixed.value = true;
        if (format.kerningIsMulti) wordSpace.value = `${t('attr.more_value')}`
        if (format.weightIsMulti) weightMixed.value = true;
        if (colorIsMulti.value) mixed.value = true;
        if (highlightIsMulti.value) higMixed.value = true;
        if (format.fontNameIsMulti) {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`
        }
        if (format.fontSizeIsMulti) fonstSize.value = `${t('attr.more_value')}`
        if (format.fillTypeIsMulti) mixed.value = true;
        if (!format.fillTypeIsMulti && format.fillType === FillType.Gradient && format.gradientIsMulti) mixed.value = true;
        props.context.workspace.focusText()
    } else {
        let formats: any[] = [];
        let format: any = {};
        for (let i = 0; i < t_shape.length; i++) {
            const text = t_shape[i];
            const editor = props.context.editor4TextShape(text);
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
                    }
                    else if (referenceValue) {
                        foundEqual = false;
                        break;
                    }
                } else if (formats[i][key] !== referenceValue) {
                    foundEqual = false;
                    break;
                }
            }
            if (foundEqual) {
                format[key] = referenceValue;
            } else {
                format[key] = `unlikeness`;
            }
        }
        rowHeight.value = format.minimumLineHeight || 0;
        colorIsMulti.value = format.colorIsMulti;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        wordSpace.value = format.kerning || 0;
        selectVertical.value = format.verAlign || 'top';
        selectText.value = format.textBehaviour;
        fontName.value = format.fontName || DefaultFontName;
        fonstSize.value = format.fontSize || 14;
        highlight.value = format.highlight;
        textColor.value = format.color;
        isBold.value = format.weight;
        isTilt.value = format.italic || false;
        fillType.value = format.fillType || FillType.SolidColor
        textColor.value = format.color;
        gradient.value = format.gradient;
        fontWeight.value = fontWeightConvert(isBold.value, isTilt.value);
        if (format.fontName === 'unlikeness') {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`;
        }
        if (format.minimumLineHeight === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
        if (format.minimumLineHeightIsMulti === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
        if (format.fontSize === 'unlikeness') fonstSize.value = `${t('attr.more_value')}`;
        if (format.alignment === 'unlikeness') selectLevel.value = '';
        if (format.verAlign === 'unlikeness') selectVertical.value = '';
        if (format.color === 'unlikeness' || format.fillType === 'unlikeness') colorIsMulti.value = true;
        if (format.highlight === 'unlikeness') highlightIsMulti.value = true;
        if (format.textBehaviour === 'unlikeness') selectText.value = '';
        if (format.weight === 'unlikeness') weightMixed.value = true;
        if (format.italic === 'unlikeness') weightMixed.value = true;
        if (format.colorIsMulti === 'unlikeness') colorIsMulti.value = true;
        if (format.highlightIsMulti === 'unlikeness') highlightIsMulti.value = true;
        if (format.fillType === 'unlikeness') mixed.value = true;
        if (format.fillTypeIsMulti === 'unlikeness') mixed.value = true;
        if (format.kerningIsMulti === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
        if (format.kerning === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
        if (format.fillTypeIsMulti !== 'unlikeness' && format.fillType === FillType.Gradient && format.gradientIsMulti === 'unlikeness') mixed.value = true;
        if (format.gradient === 'unlikeness') gradient.value = undefined;
        if (format.fillType === FillType.Gradient && format.gradient === 'unlikeness') mixed.value = true;
    }
    reflush.value++;
}
const textFormat = throttle(_textFormat, 320, { leading: true })

function selection_wather(t: number | string) {
    if (t === Selection.CHANGE_TEXT) {
        textFormat()
    }
}

function workspace_wather(t: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        textFormat()
    }
}
const textColorValue = ref('');
const texAlphaValue = ref('');
const highlightColorValue = ref('');
const highlightAlphaValue = ref('');
function onAlphaChange(e: Event, type: string) {
    let value: any;
    value = type === 'color' ? texAlphaValue.value : highlightAlphaValue.value;
    if (value?.slice(-1) === '%') {
        value = Number(value?.slice(0, -1))
        if (value >= 0) {
            if (value > 100) {
                value = 100
            }
            value = value.toFixed(2) / 100
            let color;
            if (type === 'color') {
                color = textColorValue.value;
                if (fillType.value === FillType.Gradient) {
                    set_gradient_opacity(value);
                    return;
                }
            } else {
                color = highlightColorValue.value
            }
            setColor(color, value, type);
            return
        } else {
            alpha_message(type);
        }
    } else if (!isNaN(Number(value))) {
        if (value >= 0) {
            if (value > 100) {
                value = 100
            }
            value = Number((Number(value)).toFixed(2)) / 100
            let color;
            if (type === 'color') {
                color = textColorValue.value;
                if (fillType.value === FillType.Gradient) {
                    set_gradient_opacity(value);
                    return;
                }
            } else {
                color = highlightColorValue.value
            }
            setColor(color, value, type);
            return
        } else {
            alpha_message(type);
        }
    } else {
        alpha_message(type);
    }
}

const alpha_message = (type: string) => {
    message('danger', t('system.illegal_input'));
    if (type === 'color') {
        if (!alphaFill.value) return;
        if (gradient.value && fillType.value === FillType.Gradient) {
            const opacity = gradient.value.gradientOpacity;
            return alphaFill.value.value = ((opacity === undefined ? 1 : opacity) * 100) + '%';
        }
        if (!textColor.value) return;
        return alphaFill.value.value = (textColor.value!.alpha * 100) + '%'
    } else {
        if (!highlight.value || !higlighAlpha.value) return;
        return higlighAlpha.value.value = (highlight.value!.alpha * 100) + '%'
    }
}

function onColorChange(e: Event, type: string) {
    if (type === 'color') {
        let value = getColorValue(textColorValue.value);
        if (Reg_HEX.test(value)) {
            let alpha = Number(texAlphaValue.value.slice(0, -1));
            alpha = Number(alpha.toFixed(2)) / 100
            setColor(value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(textColor.value!.red, textColor.value!.green, textColor.value!.blue);
        }
    } else {
        let value = getColorValue(highlightColorValue.value);
        if (Reg_HEX.test(value)) {
            let alpha = Number(highlightAlphaValue.value.slice(0, -1));
            alpha = Number(alpha.toFixed(2)) / 100
            setColor(value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(highlight.value!.red, highlight.value!.green, highlight.value!.blue);
        }
    }
}

const set_gradient_opacity = (opacity: number) => {
    if (!gradient.value) return;
    const g = cloneGradient(gradient.value);
    g.gradientOpacity = opacity;
    editor_gradient(g);
}

const getColorValue = (v: string) => {
    let value = v;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    return value;
}

function getColorFromPicker(color: Color, type: string) {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            if (type === 'color') {
                editor.setTextColor(0, Infinity, color)
            } else {
                editor.setTextHighlightColor(0, Infinity, color)
            }
        } else {
            if (type === 'color') {
                editor.setTextColor(textIndex, selectLength, color)
            } else {
                editor.setTextHighlightColor(textIndex, selectLength, color)
            }
        }
        textFormat()
    } else {
        if (type === 'color') {
            editor.setTextColorMulti(props.textShapes, color)
        } else {
            editor.setTextHighlightColorMulti(props.textShapes, color)
        }
    }
}

function setColor(clr: string, alpha: number, type: string) {
    if (clr.slice(0, 1) !== '#') clr = '#' + clr;
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    const editor = props.context.editor4TextShape(shapes.value[0] as TextShapeView)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            if (type === 'color') {
                editor.setTextColor(0, Infinity, new Color(alpha, r, g, b))
            } else {
                editor.setTextHighlightColor(0, Infinity, new Color(alpha, r, g, b))
            }
        } else {
            if (type === 'color') {
                editor.setTextColor(textIndex, selectLength, new Color(alpha, r, g, b))
            } else {
                editor.setTextHighlightColor(textIndex, selectLength, new Color(alpha, r, g, b))
            }
        }
        textFormat()
    } else {
        if (type === 'color') {
            editor.setTextColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
        } else {
            editor.setTextHighlightColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
        }
    }
}

const deleteHighlight = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            editor.setTextHighlightColor(0, Infinity, undefined)
        } else {
            editor.setTextHighlightColor(textIndex, selectLength, undefined)
        }
        textFormat()
    } else {
        editor.setTextHighlightColorMulti(props.textShapes, undefined);
    }
}

const addHighlight = () => {
    if (highlight.value && !highlightIsMulti.value) return
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            editor.setTextHighlightColor(0, Infinity, new Color(1, 216, 216, 216))
        } else {
            editor.setTextHighlightColor(textIndex, selectLength, new Color(1, 216, 216, 216))
        }
        textFormat()
    } else {
        editor.setTextHighlightColorMulti(props.textShapes, new Color(1, 216, 216, 216))
    }
}
const higAlphaInput = () => {
    if (higlighAlpha.value && higlightColor.value) {
        const value = higlighAlpha.value.value;
        highlightColorValue.value = higlightColor.value.value;
        highlightAlphaValue.value = value;
    }
}
const higColorInput = () => {
    if (higlightColor.value && higlighAlpha.value) {
        const value = higlightColor.value.value;
        highlightAlphaValue.value = higlighAlpha.value.value;
        highlightColorValue.value = value;
    }
}
const addTextColor = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            editor.setTextColor(0, Infinity, new Color(1, 6, 6, 6))
        } else {
            editor.setTextColor(textIndex, selectLength, new Color(1, 6, 6, 6))
        }
        textFormat()
    } else {
        editor.setTextColorMulti(props.textShapes, new Color(1, 6, 6, 6))
    }
}

const setMixedTextColor = () => {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(props.shape)
    let format: AttrGetter
    const __text = props.shape.getText();
    if (length.value) {
        format = __text.getTextFormat(textIndex, 1, editor.getCachedSpanAttr())
        const { alpha, red, green, blue } = format.color || new Color(1, 6, 6, 6);
        editor.setTextColor(textIndex, selectLength, new Color(alpha, red, green, blue));
        editor.setTextFillType(format.fillType || FillType.SolidColor, textIndex, selectLength);
        if (format.gradient) {
            editor.setTextGradient(format.gradient, textIndex, selectLength);
        }
    } else {
        format = __text.getTextFormat(0, 1, editor.getCachedSpanAttr());
        const { alpha, red, green, blue } = format.color || new Color(1, 6, 6, 6);
        editor.setTextColorMulti(props.textShapes, new Color(alpha, red, green, blue));
        editor.setTextFillTypeMulti(props.textShapes, format.fillType || FillType.SolidColor);
        if (format.gradient) {
            editor.setTextGradientMulti(props.textShapes, format.gradient);
        }
    }
}

const togger_gradient_type = (type: GradientType, fillType: FillType) => {
    const editor = props.context.editor4TextShape(props.shape);
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextFillType(fillType, 0, Infinity)
            if (fillType === FillType.Gradient) {
                const g = getGradient(gradient.value, type, textColor.value!);
                editor.setTextGradient(g, 0, Infinity);
            }
        } else {
            editor.setTextFillType(fillType, textIndex, selectLength)
            if (fillType === FillType.Gradient) {
                const g = getGradient(gradient.value, type, textColor.value!);
                editor.setTextGradient(g, textIndex, selectLength);
            }
            textFormat()
        }
    } else {
        editor.setTextFillTypeMulti(props.textShapes, fillType);
        if (fillType === FillType.Gradient) {
            const g = getGradient(gradient.value, type, textColor.value!);
            editor.setTextGradientMulti(props.textShapes, g);
        }
    }
}
function gradient_stop_color_change(color: Color, index: number) {
    if (!gradient.value) return;
    const editor = props.context.editor4TextShape(props.shape);
    let g: Gradient;
    g = cloneGradient(gradient.value);
    if (g) {
        g.stops[index].color = color;
    }
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            if (index === 0) editor.setTextColor(0, Infinity, color);
            editor.setTextGradient(g, 0, Infinity);
        } else {
            if (index === 0) editor.setTextColor(textIndex, selectLength, color);
            editor.setTextGradient(g, textIndex, selectLength);
        }
    } else {
        if (index === 0) editor.setTextColorMulti((shapes.value as TextShapeView[]), color);
        editor.setTextGradientMulti(props.textShapes, g);
    }
}

function gradient_add_stop(position: number, color: Color, id: string) {
    if (!gradient.value) return;
    const stop = new Stop(new BasicArray(), id, position, color);
    const g = cloneGradient(gradient.value);
    g.stops.push(stop);
    const s = g.stops as BasicArray<Stop>;
    s.forEach((v, i) => {
        const idx = new BasicArray<number>();
        idx.push(i);
        v.crdtidx = idx;
    })
    s.sort((a, b) => {
        if (a.position > b.position) {
            return 1;
        } else if (a.position < b.position) {
            return -1;
        } else {
            return 0;
        }
    })
    editor_gradient(g);
}

function gradient_stop_delete(index: number) {
    if (!gradient.value) return;
    const g = cloneGradient(gradient.value);
    g.stops.splice(index, 1);
    editor_gradient(g);
}

function gradient_reverse() {
    if (!gradient.value) return;
    const g = cloneGradient(gradient.value);
    const new_stops: BasicArray<Stop> = new BasicArray<Stop>();
    for (let _i = 0, _l = g.stops.length; _i < _l; _i++) {
        const _stop = g.stops[_i];
        const inver_index = g.stops.length - 1 - _i;
        new_stops.push(new Stop(_stop.crdtidx, _stop.id, _stop.position, g.stops[inver_index].color));
    }
    g.stops = new_stops;
    editor_gradient(g);
}

function gradient_rotate() {
    if (!gradient.value) return;
    const g = cloneGradient(gradient.value);
    const { from, to } = g;
    const gradientType = g.gradientType;
    if (gradientType === GradientType.Linear) {
        const midpoint = { x: (to.x + from.x) / 2, y: (to.y + from.y) / 2 };
        const m = new Matrix();
        m.trans(-midpoint.x, -midpoint.y);
        m.rotate(Math.PI / 2);
        m.trans(midpoint.x, midpoint.y);
        g.to = m.computeCoord3(to) as any;
        g.from = m.computeCoord3(from) as any;
    } else if (gradientType === GradientType.Radial || gradientType === GradientType.Angular) {
        const m = new Matrix();
        m.trans(-from.x, -from.y);
        m.rotate(Math.PI / 2);
        m.trans(from.x, from.y);
        g.to = m.computeCoord3(to) as any;
    }
    editor_gradient(g);
}

const editor_gradient = (g: Gradient) => {
    const editor = props.context.editor4TextShape(props.shape);
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextGradient(g, 0, Infinity);
        } else {
            editor.setTextGradient(g, textIndex, selectLength);
        }
    } else {
        editor.setTextGradientMulti(props.textShapes, g);
    }
}

const onSelectText = (icon: TextBehaviour) => {
    selectText.value = icon;
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        editor.setTextBehaviour(icon)
    } else {
        editor.setTextBehaviourMulti(props.textShapes, icon);
    }
}

const sizeColorInput = () => {
    if (sizeColor.value && alphaFill.value) {
        const value = sizeColor.value.value;
        textColorValue.value = value;
        texAlphaValue.value = alphaFill.value.value;
    }
}
const selectSizeValue = () => {
    if (textSize.value) {
        executed.value = true;
        getTextShapes();
        const value = textSize.value.value;
        sizeValue.value = value;
    }
}
const selectColorValue = () => {
    if (sizeColor.value) {
        executed.value = true;
        getTextShapes();
    }
}
const selectAlphaValue = () => {
    if (alphaFill.value) {
        executed.value = true;
        getTextShapes();
    }
}
const sizeAlphaInput = () => {
    if (alphaFill.value) {
        const value = alphaFill.value.value;
        texAlphaValue.value = value;
    }
    if (sizeColor.value) textColorValue.value = sizeColor.value.value;
}
const selectHiglightColor = () => {
    if (higlightColor.value) {
        executed.value = true;
        getTextShapes();
    }
}
const selectHiglighAlpha = () => {
    if (higlighAlpha.value) {
        executed.value = true;
        getTextShapes();
    }
}
const getTextShapes = () => {
    shapes.value = props.textShapes;
}

const filterAlpha = () => {
    let a: number = 100;
    if (fillType.value === FillType.SolidColor) {
        if (textColor.value) a = textColor.value.alpha * 100;
    } else if (gradient.value && fillType.value === FillType.Gradient) {
        const opacity = gradient.value.gradientOpacity;
        a = (opacity === undefined ? 1 : opacity) * 100;
    }
    let alpha = Math.round(a * 100) / 100;
    if (Number.isInteger(alpha)) {
        return alpha.toFixed(0); // 返回整数形式
    } else if (Math.abs(alpha * 10 - Math.round(alpha * 10)) < Number.EPSILON) {
        return alpha.toFixed(1); // 保留一位小数
    } else {
        return alpha.toFixed(2); // 保留两位小数
    }
}

const pointX = ref<number>()
const pointY = ref<number>()
const showpoint = ref<boolean>(false)
let type = 'row-height';
let textAttrEditor: AsyncTextAttrEditor | undefined = undefined;
const onMouseDown = async (e: MouseEvent, t: string) => {
    pointX.value = e.clientX
    pointY.value = e.clientY
    type = t;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    const { textIndex, selectLength } = getTextIndexAndLen();
    let index = textIndex;
    let length = selectLength;
    if (isSelectText()) {
        index = 0; length = Number.MAX_VALUE;
    } else {
        index = textIndex; length = selectLength;
    }
    textAttrEditor = props.context.editor4TextShape(props.shape).asyncSetTextAttr(props.textShapes, index, length);
    e.stopPropagation()
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    showpoint.value = true;
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        onMouseUp();
    }
}

function updatePosition(movementX: number, movementY: number) {
    if (pointX.value === undefined || pointY.value === undefined) return;
    const clientHeight = document.documentElement.clientHeight
    const clientWidth = document.documentElement.clientWidth
    pointX.value += movementX
    pointY.value += movementY
    pointX.value = pointX.value < 0 ? clientWidth : (pointX.value > clientWidth ? 0 : pointX.value)
    pointY.value = pointY.value < 0 ? clientHeight : (pointY.value > clientHeight ? 0 : pointY.value)
}

function onMouseMove(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    if (type === 'row-height') {
        if (isNaN(rowHeight.value) || rowHeight.value < 0) return;
        rowHeight.value = Number(rowHeight.value) + e.movementX;
        if (textAttrEditor) {
            rowHeight.value = rowHeight.value < 0 ? 0 : Number(rowHeight.value)
            textAttrEditor.execute_line_height(rowHeight.value);
        }
    } else {
        if (isNaN(wordSpace.value) || wordSpace.value < 0) return;
        wordSpace.value = Number(wordSpace.value) + e.movementX;
        if (textAttrEditor) {
            wordSpace.value = wordSpace.value < 0 ? 0 : Number(wordSpace.value)
            textAttrEditor.execute_char_spacing(wordSpace.value);
        }
    }
}

function onMouseUp() {
    document.exitPointerLock()
    showpoint.value = false
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (textAttrEditor) {
        textAttrEditor.close();
        textAttrEditor = undefined;
    }
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

const text_selection_wather = (t: number) => {
    if (t === Attribute.ADD_SIZE_CHANGE) {
        if (textSize.value) {
            let value = textSize.value.value.trim();
            if (value.length < 1) {
                value = '1'
            }
            if (!isNaN(Number(value)) && Number(value) > 0) {
                changeTextSize(Number(value) + 1);
            }
        }
    } else if (t === Attribute.MINUS_SIZE_CHANGE) {
        if (textSize.value) {
            let value = textSize.value.value.trim();
            if (value.length < 1) {
                value = '1'
            }
            if (!isNaN(Number(value)) && Number(value) > 1) {
                changeTextSize(Number(value) - 1);
            }
        }
    } else if (t === Attribute.FRAME_CHANGE) {
        textFormat();
    }
}

const is_higligh_alpha_select = ref(false);
const is_higligh_color_select = ref(false);
const is_font_alpha_select = ref(false);
const is_font_color_select = ref(false);
const is_char_space_select = ref(false);
const is_row_height_select = ref(false);
const is_size_select = ref(false);

function click(e: Event, variate: boolean) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (variate) return;
    el.select();
    variate = true;
}

// const stop = watch(() => props.dataChange, textFormat);
const stop2 = watch(() => props.textShapes, (v) => {
    shapes.value = v;
    textFormat();
})
const stop3 = watch(() => props.trigger, v => {
    if (v.includes('text')) {
        textFormat();
    }
})
const stop4 = watch(() => props.selectionChange, textFormat); // 监听选区变化
onMounted(() => {
    props.context.selection.watch(selection_wather);
    props.context.attr.watch(text_selection_wather);
    props.context.workspace.watch(workspace_wather);
    textFormat();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.attr.unwatch(text_selection_wather);
    props.context.workspace.unwatch(workspace_wather);
    // stop();
    stop2();
    stop3();
    stop4();
})
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24" :active="true">
            <template #tool>
                <TextAdvancedSettings :context="props.context" :textShape="shape" :textShapes="props.textShapes">
                </TextAdvancedSettings>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text" ref="fontNameEl" style="padding-right: 0;" @click="onShowFont">
                    <span>{{ fontName }}</span>
                    <div class="down">
                        <svg-icon icon-class="down" style="width: 12px;height: 12px"></svg-icon>
                    </div>
                </div>
                <SelectFont :showFont="showFont" @set-font="setFont" :fontName="fontName" :context="props.context"
                    :fontWeight="fontWeight" @setFontWeight="setFontWeight" :fontNameEl="fontNameEl">
                </SelectFont>
                <div class="overlay" @click.stop v-if="showFont" @mousedown.stop="showFont = false"></div>
            </div>
            <div class="text-middle">
                <FontWeightSelected :context="context" :selected="fontWeight" :weightMixed="weightMixed"
                    :disable="disableWeight" :reflush="reflush" :fontName="fontName" @setFontWeight="setFontWeight">
                </FontWeightSelected>
                <div class="text-size jointly-text" style="padding-right: 0;">
                    <div class="size_input">
                        <input type="text" v-model="fonstSize" ref="textSize" class="input" @change="setTextSize"
                            @focus="selectSizeValue" @input="handleSize" @blur="setTextSize"
                            @click="(e) => click(e, is_size_select)">
                        <div class="down" @click="onShowSize">
                            <svg-icon icon-class="down" style=""></svg-icon>
                        </div>
                    </div>
                    <div class="font-size-list" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
                        v-if="showSize">
                        <div v-for="(item, i) in textSizes" :key="i" @click="changeTextSize(item)"
                            @mouseover="sizeHoverIndex = i" @mouseleave="sizeHoverIndex = -1">{{ item }}
                            <div class="icon">
                                <svg-icon v-if="sizeSelectIndex === i"
                                    :icon-class="sizeHoverIndex === i ? 'white-select' : 'page-select'"></svg-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-middle">
                <div class="interval jointly-text" style="margin-right: 8px;">
                    <div @mousedown="(e) => onMouseDown(e, 'row-height')">
                        <svg-icon icon-class="word-space"></svg-icon>
                    </div>
                    <input type="text" v-model="rowHeight" ref="lineHeight" class="input" @change="setRowHeight"
                        :placeholder="row_height" @input="handleSize" @click="(e) => click(e, is_row_height_select)"
                        @blur="is_row_height_select = false">
                </div>
                <div class="interval jointly-text" style="padding-right: 0;">
                    <div @mousedown="(e) => onMouseDown(e, 'char-space')">
                        <svg-icon icon-class="row-height"></svg-icon>
                    </div>
                    <input type="text" v-model="wordSpace" ref="charSpacing" class="input" @change="setWordSpace"
                        @input="handleSize" @click="(e) => click(e, is_char_space_select)"
                        @blur="is_char_space_select = false">
                </div>
            </div>
            <div class="text-bottom">
                <div class="level-aligning jointly-text">
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'left' }"
                        @click="onSelectLevel(TextHorAlign.Left)">
                        <Tooltip :content="t('attr.align_left')" :offset="15">
                            <svg-icon icon-class="text-left"></svg-icon>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'centered' }"
                        @click="onSelectLevel(TextHorAlign.Centered)">
                        <Tooltip :content="t('attr.align_center')" :offset="15">
                            <svg-icon icon-class="text-center"></svg-icon>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'right' }"
                        @click="onSelectLevel(TextHorAlign.Right)">
                        <Tooltip :content="t('attr.align_right')" :offset="15">
                            <svg-icon icon-class="text-right"></svg-icon>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'natural' }"
                        @click="onSelectLevel(TextHorAlign.Natural)">
                        <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                            <svg-icon icon-class="text-justify"></svg-icon>
                        </Tooltip>
                    </i>
                </div>
            </div>
            <div class="text-bottom">
                <div class="text-bottom-align">
                    <div class="vertical-aligning jointly-text" style="margin-right: 8px;">
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectVertical === 'top' }"
                            @click="onSelectVertical(TextVerAlign.Top)">
                            <Tooltip :content="t('attr.align_top')" :offset="15">
                                <svg-icon icon-class="align-top"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectVertical === 'middle' }"
                            @click="onSelectVertical(TextVerAlign.Middle)">
                            <Tooltip :content="t('attr.align_middle')" :offset="15">
                                <svg-icon icon-class="align-middle"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectVertical === 'bottom' }"
                            @click="onSelectVertical(TextVerAlign.Bottom)">
                            <Tooltip :content="t('attr.align_bottom')" :offset="15">
                                <svg-icon icon-class="align-bottom"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                    <div class="vertical-aligning jointly-text">
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'flexible' }"
                            @click="onSelectText(TextBehaviour.Flexible)">
                            <Tooltip :content="t('attr.autowidth')" :offset="15">
                                <svg-icon icon-class="text-autowidth"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'fixed' }"
                            @click="onSelectText(TextBehaviour.Fixed)">
                            <Tooltip :content="t('attr.autoheight')" :offset="15">
                                <svg-icon icon-class="text-autoheight"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'fixWidthAndHeight' }"
                            @click="onSelectText(TextBehaviour.FixWidthAndHeight)">
                            <Tooltip :content="t('attr.fixedsize')" :offset="15">
                                <svg-icon icon-class="text-fixedsize"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                </div>
                <!--                <div class="perch"></div>-->
            </div>
            <!-- 字体颜色 -->
            <div class="text-color" v-if="!colorIsMulti && !mixed && textColor" style="margin-bottom: 10px;">
                <div style="font-family: HarmonyOS Sans;font-size: 12px; width: 58px">{{
            t('attr.font_color')
        }}
                </div>
                <div class="color">
                    <ColorPicker :color="textColor!" :context="props.context" :auto_to_right_line="true" :late="32"
                        :locat="{ index: 0, type: 'text' }" :fill-type="fillType" :gradient="gradient"
                        @change="c => getColorFromPicker(c, 'color')"
                        @gradient-type="(type, fillType) => togger_gradient_type(type, fillType)"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(c, index)"
                        @gradient-add-stop="(p, c, id) => gradient_add_stop(p, c, id)"
                        @gradient-reverse="gradient_reverse" @gradient-rotate="gradient_rotate"
                        @gradient-stop-delete="(index) => gradient_stop_delete(index)">
                    </ColorPicker>
                    <input ref="sizeColor" v-if="fillType !== FillType.Gradient" class="sizeColor"
                        @focus="selectColorValue" :spellcheck="false"
                        :value="toHex(textColor!.red, textColor!.green, textColor!.blue, false)"
                        @change="(e) => onColorChange(e, 'color')" @input="sizeColorInput"
                        @click="(e) => click(e, is_font_color_select)" @blur="is_font_color_select = false" />
                    <span class="sizeColor" style="line-height: 14px;" v-else-if="fillType === FillType.Gradient &&
            gradient">{{ t(`color.${gradient.gradientType}`) }}</span>
                    <input ref="alphaFill" class="alphaFill" @focus="selectAlphaValue" style="text-align: center;"
                        :value="filterAlpha() + '%'" @change="(e) => onAlphaChange(e, 'color')"
                        @click="(e) => click(e, is_font_alpha_select)" @blur="is_font_alpha_select = false"
                        @input="sizeAlphaInput" />
                </div>
                <!--                <div style="width: 28px;height: 28px;margin-left: 5px;"></div>-->
            </div>
            <div class="text-colors" v-else-if="colorIsMulti || mixed" style="margin-bottom: 6px;">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color')
                        }}
                    </div>
                    <div class="add" @click="setMixedTextColor">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!colorIsMulti && !mixed && !textColor" style="margin-bottom: 6px;">
                <div class="color-title">
                    <div class="add" @click="addTextColor">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
            </div>
            <!-- 高亮颜色 -->
            <div class="highlight-color" v-if="!highlightIsMulti && highlight">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;width: 58px"
                    :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}
                </div>
                <div class="color">
                    <ColorPicker :color="highlight!" :context="props.context" :auto_to_right_line="true" :late="32"
                        @change="c => getColorFromPicker(c, 'highlight')">
                    </ColorPicker>
                    <input ref="higlightColor" class="colorFill" @focus="selectHiglightColor" :spellcheck="false"
                        :value="toHex(highlight!.red, highlight!.green, highlight!.blue, false)"
                        @change="(e) => onColorChange(e, 'highlight')" @input="higColorInput"
                        @click="(e) => click(e, is_higligh_color_select)" @blur="is_higligh_color_select = false" />
                    <input ref="higlighAlpha" class="alphaFill" @focus="selectHiglighAlpha" style="text-align: center;"
                        :value="(highlight!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'highlight')"
                        @input="higAlphaInput" @click="(e) => click(e, is_higligh_alpha_select)"
                        @blur="is_higligh_alpha_select = false" />
                </div>
                <div class="perch" @click="deleteHighlight">
                    <svg-icon class="svg" icon-class="delete"></svg-icon>
                </div>
            </div>
            <div class="text-colors" v-else-if="highlightIsMulti">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}
                    </div>
                    <div class="add" @click="addHighlight">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!highlightIsMulti && !highlight" @click="addHighlight">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}
                    </div>
                    <div class="color_border"></div>
                    <div class="add" @click="addHighlight">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
        <teleport to="body">
            <div v-if="showpoint" class="point" :style="{ top: (pointY! - 10.5) + 'px', left: (pointX! - 10) + 'px' }">
            </div>
        </teleport>
    </div>
</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .trigger {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        >svg {
            width: 16px;
            height: 16px;
            transition: 0.3s;
        }

        svg:hover {
            transform: rotate(90deg);
        }
    }

    .text-container {
        font-size: var(--font-default-fontsize);

        .jointly-text {
            height: 32px;
            border-radius: var(--default-radius);
            background-color: var(--input-background);
            display: flex;
            justify-content: space-between;
            align-items: center;

            >svg {
                width: 16px;
                height: 16px;
                overflow: visible !important;
            }
        }

        .text-top {
            position: relative;
            margin-bottom: 6px;
            margin-top: 6px;
            display: flex;

            .select-font {
                padding: 8px 12px;
                box-sizing: border-box;
                width: 100%;
                height: 32px;
                border-radius: 6px;

                span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .select-font:hover {
                background: #EBEBEB;
            }


        }

        .text-size {
            flex: 1;
            position: relative;
            height: 32px;
            border-radius: 6px;
            padding: 9px 0;
            box-sizing: border-box;

            .size_input {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-left: 12px;
                box-sizing: border-box;

                .down {
                    width: 26px;
                    height: 26px;
                    margin-right: 3px;

                    &:hover {
                        background-color: #EBEBEB;
                    }

                    >svg {
                        width: 12px;
                        height: 12px;
                    }
                }

            }

            .input {
                width: 64px;
                background-color: transparent;
                border: none;
            }

            input[type="text"]::-webkit-inner-spin-button,
            input[type="text"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            input[type="text"] {
                -moz-appearance: textfield;
                appearance: textfield;
                font-size: var(--font-default-fontsize);
            }

            input:focus {
                outline: none;
            }

            .font-size-list {
                position: absolute;
                left: 0px;
                width: 100%;
                border-radius: 6px;
                background-color: #fff;
                box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
                border: 1px solid #EBEBEB;
                color: #262626;
                padding: 4px 0;
                z-index: 100;

                >div {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding-left: 10px;
                    height: 32px;
                    box-sizing: border-box;

                    .icon {
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        >svg {
                            width: 12px;
                            height: 12px;
                        }
                    }

                    &:hover {
                        background-color: #1878F5;
                        color: #fff;
                    }
                }
            }
        }

        .text-middle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;

            .overbold {
                width: 32px;
                display: flex;
                justify-content: center;
                margin-left: 8px;
            }

            .overbold:hover {
                background-color: #EBEBEB;
            }

            .interval {
                flex: 1;
                height: 32px;
                padding-right: 6px;

                >div {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    width: 26px;
                    height: 32px;

                    >svg {
                        cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto !important;
                        width: 14px;
                        height: 14px;
                    }
                }

                .input {
                    width: 78px;
                    background-color: transparent;
                    border: none;
                }

                input[type="text"]::-webkit-inner-spin-button,
                input[type="text"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                input[type="text"] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                    font-size: var(--font-default-fontsize);
                }

                input:focus {
                    outline: none;
                }
            }
        }

        .text-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;

            .text-bottom-align {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }

            .level-aligning {
                width: 100%;
                height: 32px;
                padding: 2px;
                box-sizing: border-box;
                border-radius: var(--default-radius);

                >i {
                    flex: 1;
                    height: 28px;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    border: 1px solid #F4F5F5;
                }
            }

            .vertical-aligning {
                flex: 1;
                height: 32px;
                padding: 2px;
                box-sizing: border-box;
                border-radius: var(--default-radius);
            }

            .font-posi {
                width: 30px;
                height: 28px;
                display: flex;
                justify-content: center;
                border-radius: 4px;
                border: 1px solid #F4F5F5;
            }

            .selected_bg {
                background-color: #FFFFFF !important;
                color: #000000;
                border: 1px solid #F0F0F0;
            }
        }

        .text-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-wrap: nowrap;

            .color {
                background-color: var(--input-background);
                flex: 1;
                height: 32px;
                padding: 8px;
                padding-right: 4px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .sizeColor {
                    outline: none;
                    border: none;
                    width: 60px;
                    background-color: transparent;
                    margin-left: 8px;
                    font-size: 12px;
                    flex: auto;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    width: 35px;
                    background-color: transparent;
                    font-size: 12px;
                    flex: auto;
                }

                input+input {
                    width: 45px;
                }
            }
        }

        .highlight-color {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .color {
                background-color: var(--input-background);
                flex: 1;
                height: 32px;
                padding: 8px;
                padding-right: 4px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .colorFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 60px;
                    height: 14px;
                    margin-left: 8px;
                    font-size: 12px;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 35px;
                    text-align: center;
                    font-size: 12px;
                    flex: auto;
                }

                input+input {
                    width: 45px;
                }
            }
        }

        .text-colors {
            .color-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 32px;

                .add {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--default-radius);
                    transition: .2s;

                    >svg {
                        width: 16px;
                        height: 16px;
                    }
                }

                .add:hover {
                    background-color: #F5F5F5;
                }

                .check {
                    color: #000000;
                }

                .nocheck {
                    color: #737373;
                }
            }

            .color-text {
                color: rgba(0, 0, 0, 0.5);
                text-align: center;
            }
        }

        .perch {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            margin-left: 5px;
            border-radius: var(--default-radius);

            >svg {
                height: 16px;
                width: 16px;
            }
        }

        .perch:hover {
            background-color: #F5F5F5;
        }
    }

    .selected_bgc {
        background-color: var(--active-color) !important;
        color: #fff;
    }
}

.down {
    height: 12px;
    width: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-right: 8px;
    box-sizing: border-box;

    >svg {
        width: 12px;
        height: 12px;
    }
}

:deep(.el-tooltip__trigger:focus) {
    outline: none !important;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background-color: transparent;
}

.point {
    position: absolute;
    width: 24px;
    height: 24px;
    background-image: url("@/assets/cursor/scale.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 32px;
    z-index: 10000;
}
</style>
