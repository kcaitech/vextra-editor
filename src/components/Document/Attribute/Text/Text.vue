/*
* Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
*
* This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from './SelectFont.vue';
import { onMounted, ref, onUnmounted, computed, shallowRef, reactive, h, nextTick, watchEffect } from 'vue';
import TextAdvancedSettings from './TextAdvancedSettings.vue'
import { Context } from '@/context';
import {
    AsyncTextAttrEditor,
    AttrGetter,
    FillType,
    Gradient,
    GradientType,
    LinearApi,
    ShapeType,
    TextBehaviour,
    TextShapeView,
    cloneGradient
} from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color } from "@kcdesign/data";
import { Reg_HEX } from "@/utils/RegExp";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { message } from "@/utils/message";
import { throttle } from 'lodash';
import { watch } from 'vue';
import { gradient_equals } from '../../Selection/Controller/ColorEdit/gradient_utils';
import FontWeightSelected from './FontWeightSelected.vue';
import { fontWeightConvert } from './FontNameList';
import { Attribute } from '@/context/atrribute';
import { format_value, is_mac } from "@/utils/common";
import { sortValue } from '../BaseAttr/oval';
import TextStyle from './lib/TextStyle.vue';
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { toHex } from "@/utils/color";
import { selectAllOnFocus } from '@/components/Document/Attribute/basic';
import { GradientCatch, getGradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";
import { TextContext, TextContextMgr } from './ctx';

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
const mixed = ref<boolean>(false);
const higMixed = ref<boolean>(false);
const textColor = ref<Color>()
const highlight = ref<Color>()
const fillType = ref<FillType>(FillType.SolidColor);
const gradient = ref<Gradient>();
const textSize = ref<HTMLInputElement>()
const higlighAlpha = ref<HTMLInputElement>()
const sizeHoverIndex = ref(-1);
const fontWeight = ref('Regular');
const weightMixed = ref<boolean>(false);
const shapes = shallowRef<TextShapeView[]>(props.textShapes);
const disableWeight = ref(false);
const fontNameEl = ref<HTMLDivElement>();
const selectText = ref('autowidth');
const wordSpace = ref();
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const rowHeight = ref();
const row_height = ref(`${t('attr.auto')}`)
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)
const keydownval = ref<boolean>(false)
const isAutoLineHeight = ref<boolean>(true);
const cloverVisible = computed<boolean>(() => !(textCtx.value.mask || textCtx.value.mixed));

const textCtx = ref<TextContext>({
    mixed: false,
    text: undefined,
    mask: undefined,
    maskInfo: undefined
})
const textCtxMgr = new TextContextMgr(props.context, textCtx.value as TextContext);

const textLibStatus = reactive<ElementStatus>({ id: '#text-lib-panel', visible: false });
const textPanelStatusMgr = new ElementManager(
    props.context,
    textLibStatus,
    { whiteList: ['.text_clover', '.text-lib-panel', '.mask-port-wrapper'] }
);

textCtxMgr.catchPanel(textPanelStatusMgr)

const showTextPanel = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('text_clover')) {
            e && textPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        if (e.classList.contains('mask-port-wrapper')) {
            e && textPanelStatusMgr.showBy(e, { once: { offsetLeft: -4, offsetTop: 36 } });
            break;
        }
        e = e.parentElement;
    }
}

const fontlistStatus = reactive<ElementStatus>({ id: '#font-container', visible: false });
const fontPanelStatusMgr = new ElementManager(
    props.context,
    fontlistStatus,
    { whiteList: ['.font-container', '.select-font'] }
);
textCtxMgr.catchPanel(fontPanelStatusMgr)
const showFontList = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('select-font')) {
            fontPanelStatusMgr.showBy(e, { once: { offsetLeft: -236 } });
            break;
        }
        e = e.parentElement;
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
// 设置字重
const setFontWeight = (weight: number, italic: boolean) => {
    fontWeight.value = fontWeightConvert(weight, italic);
    textCtxMgr.setFontWeight(weight, italic)
}

// 设置水平对齐
const onSelectLevel = (icon: TextHorAlign) => {
    selectLevel.value = icon;
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        editor.setTextHorAlign(icon, textIndex, selectLength)
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
    } else {
        editor.setTextVerAlignMulti(props.textShapes, icon);
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.verAlign = icon;
    props.context.textSelection.setTextAttr(textAttr);
}
const changeTextSize = (size: number) => {
    //设置字体大小
    fonstSize.value = size
    showSize.value = false;
    const shape = props.textShapes[0] as TextShapeView
    const editor = props.context.editor4TextShape(shape)

    if (shapes.value.length === 1) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        keydownval.value
            ?
            linearApi.modifyTextFontSize(textIndex, selectLength, size, shape)
            :
            editor.setTextFontSize(textIndex, selectLength, size)
    } else {
        keydownval.value
            ?
            linearApi.modifyTextFontSizeMulti((props.textShapes as TextShapeView[]), size)
            :
            editor.setTextFontSizeMulti((shapes.value as TextShapeView[]), size);
    }
    keydownval.value = false;
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.fontSize = format_value(size) as number;
    props.context.textSelection.setTextAttr(textAttr);
}
//设置字体
const setFont = (font: string) => {
    textCtxMgr.setFont(font)
}

const setWordSpace = (val?: number) => {
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
            keydownval.value
                ?
                linearApi.modifyTextCharSpacing(val!, textIndex, selectLength, props.shape)
                :
                editor.setCharSpacing(Number(wordSpace.value), textIndex, selectLength)
        } else {
            textFormat()
        }
    } else {
        if (!isNaN(Number(wordSpace.value))) {
            keydownval.value
                ?
                linearApi.modifyTextCharSpacingMulti(props.textShapes, val!)
                :
                editor.setCharSpacingMulit(props.textShapes, Number(wordSpace.value))
        } else {
            textFormat()
        }
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.kerning = Number(wordSpace.value);
    props.context.textSelection.setTextAttr(textAttr);
    keydownval.value = false
}

function keydownSpace(event: KeyboardEvent) {
    let value = sortValue(wordSpace.value.toString());
    let old = value
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keydownval.value = true
        value = value + (event.code === 'ArrowUp' ? 1 : -1)
        value = value <= 1 ? 1 : value;
        if (isNaN(value) || old === value) return;
        setWordSpace(value);
        event.preventDefault();
    }
    if (event.code === 'NumpadEnter' || event.code === 'Enter') {
        textSize.value?.blur();
        lineHeight.value?.blur();
        charSpacing.value?.blur();
    }
}

const autoLineHeight = [
    'auto',
    '自动'
]

const setRowHeight = (val?: number) => {
    const editor = props.context.editor4TextShape(props.shape)
    let isAuto = isAutoLineHeight.value;
    if ((rowHeight.value as string).toLowerCase() === 'auto' || rowHeight.value === '自动') {
        rowHeight.value = '';
    }
    if (rowHeight.value.length < 1) {
        isAuto = true;
    } else if (rowHeight.value[rowHeight.value.length - 1] === '%') {
        isAuto = true;
    } else {
        isAuto = false;
    }
    const value = rowHeight.value[rowHeight.value.length - 1] === '%' ? rowHeight.value.slice(0, -1) : rowHeight.value;
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (!isNaN(Number(value))) {
            keydownval.value
                ?
                linearApi.modifyTextLineHeight(val!, isAuto, textIndex, selectLength, props.shape)
                :
                editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, textIndex, selectLength)
        } else {
            textFormat();
            return;
        }
    } else {
        if (!isNaN(Number(value))) {
            keydownval.value
                ?
                linearApi.modifyTextLineHeightMulti(props.textShapes, val!, isAuto)
                :
                editor.setLineHeightMulit(props.textShapes, value.length === 0 ? undefined : Number(value), isAuto);
        } else {
            textFormat();
            return;
        }
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.autoLineHeight = isAuto;
    textAttr.maximumLineHeight = value.length === 0 ? undefined : Number(value);
    textAttr.minimumLineHeight = value.length === 0 ? undefined : Number(value);
    props.context.textSelection.setTextAttr(textAttr);
    keydownval.value = false;
}

function keydownHeight(event: KeyboardEvent) {
    let value = sortValue(rowHeight.value.toString());
    let old = value
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keydownval.value = true
        value = value + (event.code === 'ArrowUp' ? 1 : -1)
        value = value <= 1 ? 1 : value;
        if (isNaN(value) || old === value) return;
        setRowHeight(value);
        event.preventDefault();
    }
    if (event.code === 'NumpadEnter' || event.code === 'Enter') {
        textSize.value?.blur();
        lineHeight.value?.blur()
    }
}

//获取选中字体的长度和开始下标
const getTextIndexAndLen = () => {
    const selection = props.context.selection.textSelection;
    const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
    const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
    if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
        return { textIndex, selectLength }
    } else {
        return { textIndex: 0, selectLength: Infinity }
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
    } else {
        textFormat();
    }

}

function keydownSize(event: KeyboardEvent) {
    let value = sortValue(fonstSize.value.toString());
    let old = value
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keydownval.value = true
        value = value + (event.code === 'ArrowUp' ? 1 : -1)
        value = value <= 1 ? 1 : value;
        if (isNaN(value) || old === value) return;
        changeTextSize(value);
        event.preventDefault();
    }
    if (event.code === 'NumpadEnter' || event.code === 'Enter') {
        textSize.value?.blur()
    }
}
const handleSize = () => {
    executed.value = true;
    const value = textSize.value!.value;
    sizeValue.value = value;
}
const reflush = ref(0);
// 获取当前文字格式

function selection_wather(t: number | string) {
    if (t === Selection.CHANGE_TEXT) {
        textFormat()
        textCtxMgr.update();
    }
}

function workspace_wather(t: number) {
   
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        textFormat()
        textCtxMgr.update();
    }
}

function onAlphaChange(e: Event, type: string) {
    let value = (e.target as HTMLInputElement).value as any;
    value = value?.slice(-1) === '%' ? Number(value?.slice(0, -1)) : Number(value);
    if (!isNaN(value) && value >= 0) {
        value = Math.min(value.toFixed(2), 100) / 100;
        let color;
        if (type === 'color') {
            const c = textColor.value || new Color(1, 6, 6, 6);
            color = toHex(c);
            if (fillType.value === FillType.Gradient) {
                set_gradient_opacity(value);
                return;
            }
        } else {
            const c = highlight.value || new Color(1, 216, 216, 216);
            color = toHex(c);
        }
        setColor(color, value, type);
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
    const v = (e.target as HTMLInputElement).value;
    let value = getColorValue(v);
    if (type === 'color') {
        if (Reg_HEX.test(value)) {
            const alpha = textColor.value?.alpha || 1;
            setColor(value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(textColor.value!).slice(1);
        }
    } else {
        if (Reg_HEX.test(value)) {
            const alpha = highlight.value?.alpha || 1;
            setColor(value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(highlight.value!).slice(1);
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
    const shape = props.textShapes[0] as TextShapeView;
    const editor = props.context.editor4TextShape(shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (type === 'color') {
            keydownval.value
                ?
                linearApi.modifyTextColor(textIndex, selectLength, new Color(alpha, r, g, b), shape)
                :
                editor.setTextColor(textIndex, selectLength, new Color(alpha, r, g, b))
        } else {
            keydownval.value
                ?
                linearApi.modifyTextHighlightColor(textIndex, selectLength, new Color(alpha, r, g, b), shape)
                :
                editor.setTextHighlightColor(textIndex, selectLength, new Color(alpha, r, g, b))
        }
    } else {
        if (type === 'color') {
            keydownval.value
                ?
                linearApi.modifyTextColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
                :
                editor.setTextColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
        } else {
            keydownval.value
                ?
                linearApi.modifyTextHighlightColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
                :
                editor.setTextHighlightColorMulti((shapes.value as TextShapeView[]), new Color(alpha, r, g, b))
        }
    }
    keydownval.value = false;
}

const deleteHighlight = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        editor.setTextHighlightColor(textIndex, selectLength, undefined)
    } else {
        editor.setTextHighlightColorMulti(props.textShapes, undefined);
    }
}

const addHighlight = () => {
    if (highlight.value && !highlightIsMulti.value) return
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        editor.setTextHighlightColor(textIndex, selectLength, new Color(1, 216, 216, 216))
    } else {
        editor.setTextHighlightColorMulti(props.textShapes, new Color(1, 216, 216, 216))
    }
}

const setMixedHighlight = () => {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(props.shape)
    let format: AttrGetter
    const __text = props.shape.getText();
    if (length.value) {
        format = __text.getTextFormat(textIndex, 1, editor.getCachedSpanAttr())
        const { alpha, red, green, blue } = format.highlight || new Color(1, 216, 216, 216);
        editor.setTextHighlightColor(textIndex, selectLength, new Color(alpha, red, green, blue));
    } else {
        format = __text.getTextFormat(0, 1, editor.getCachedSpanAttr());
        const { alpha, red, green, blue } = format.highlight || new Color(1, 216, 216, 216);
        editor.setTextHighlightColorMulti(props.textShapes, new Color(alpha, red, green, blue));
    }
}

const addTextColor = () => {
    const editor = props.context.editor4TextShape(props.shape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        editor.setTextColor(textIndex, selectLength, new Color(1, 6, 6, 6))
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

const editor_gradient = (g: Gradient) => {
    const editor = props.context.editor4TextShape(props.shape);
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        editor.setTextGradient(g, textIndex, selectLength);
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

const selectSizeValue = () => {
    if (textSize.value) {
        executed.value = true;
        getTextShapes();
        const value = textSize.value.value;
        sizeValue.value = value;
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
const filterAlpha2 = () => {
    let a: number = 100;
    if (highlight.value) a = highlight.value.alpha * 100;
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
    textAttrEditor = props.context.editor4TextShape(props.shape).asyncSetTextAttr(props.textShapes, textIndex, selectLength);
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
        rowHeight.value = (rowHeight.value === 'Auto' ? 121 : parseFloat(rowHeight.value)) + e.movementX;
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
        textCtxMgr.update();
    }
}
const _textFormat = () => {
    const shapes = props.context.selection.selectedShapes;
    const t_shape = shapes.filter(item => item.type === ShapeType.Text) as TextShapeView[];
    if (t_shape.length === 0 || !t_shape[0].text) return
    mixed.value = false;
    disableWeight.value = false;
    weightMixed.value = false;
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(t_shape[0]);
        let format: AttrGetter
        const __text = t_shape[0].getText();
        format = __text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr());
        colorPicker.format = format;
        colorIsMulti.value = format.colorIsMulti;
        isAutoLineHeight.value = format.autoLineHeight ?? true;
        rowHeight.value = format.autoLineHeight ?? true ? format.minimumLineHeight !== undefined ? format_value(format.minimumLineHeight || 0) + '%' : 'Auto' : format_value(format.minimumLineHeight || 0)
        wordSpace.value = format_value(format.kerning || 0)
        highlightIsMulti.value = format.highlightIsMulti
        selectLevel.value = format.alignment || 'left'
        selectVertical.value = format.verAlign || 'top'
        selectText.value = format.textBehaviour || 'flexible'
        fontName.value = format.fontName || DefaultFontName
        fonstSize.value = format_value(format.fontSize || 14) as number
        textColor.value = format.color
        highlight.value = format.highlight
        fillType.value = format.fillType || FillType.SolidColor
        isBold.value = format.weight
        isTilt.value = format.italic || false
        gradient.value = format.gradient;
        fontWeight.value = fontWeightConvert(isBold.value, isTilt.value);
        if (format.minimumLineHeightIsMulti || format.autoLineHeightIsMulti) rowHeight.value = `${t('attr.more_value')}`
        if (format.italicIsMulti) weightMixed.value = true;
        if (format.kerningIsMulti) wordSpace.value = `${t('attr.more_value')}`
        if (format.weightIsMulti) weightMixed.value = true;
        if (colorIsMulti.value) mixed.value = true;
        if (highlightIsMulti.value) higMixed.value = true;
        if (format.fontNameIsMulti) {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`
        }
        if (format.alignmentIsMulti) selectLevel.value = `${t('attr.more_value')}`
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
                    } else if (referenceValue) {
                        foundEqual = false;
                        break;
                    }
                } else if (formats[i][key] !== referenceValue) {
                    foundEqual = false;
                    break;
                }
            }
            format[key] = foundEqual ? referenceValue : 'unlikeness';
        }
        colorPicker.format = format;
        isAutoLineHeight.value = format.autoLineHeight ?? true;
        rowHeight.value = format.autoLineHeight ?? true ? format.minimumLineHeight !== undefined ? format_value(format.minimumLineHeight || 0) + '%' : 'Auto' : format_value(format.minimumLineHeight || 0) as number;
        colorIsMulti.value = format.colorIsMulti;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        wordSpace.value = format_value(format.kerning || 0);
        selectVertical.value = format.verAlign || 'top';
        selectText.value = format.textBehaviour;
        fontName.value = format.fontName || DefaultFontName;
        fonstSize.value = format_value(format.fontSize || 14) as number
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
        if (format.minimumLineHeight === 'unlikeness' || format.autoLineHeight === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
        if (format.minimumLineHeightIsMulti === 'unlikeness' || format.autoLineHeightIsMulti === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
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
    updateContextColor();
    reflush.value++;
}
const textFormat = throttle(_textFormat, 0, { leading: true })

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

const closePanel = () => {
    textPanelStatusMgr.close();
}
const compo = ref<any>();
const innerText = ref<string>('');
const rgbaColor = ref<RGBACatch>({ R: 6, G: 6, B: 6, A: 1, position: 1 });
const rgbaHighlight = ref<RGBACatch>({ R: 216, G: 216, B: 216, A: 1, position: 1 });
const colorType = ref<string>(FillType.SolidColor);
const color_gradient = ref<GradientCatch | undefined>();

const colorPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.text-color'], onDestroy: clearPanelStatus }
);

const colorPicker = new TextPicker(props.context, fillType.value, 'color');

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('text-color')) {
            const color = props.context.color;
            if (fillType.value === FillType.SolidColor) {
                if (color.gradient_type) color.set_gradient_type(undefined);
                if (color.locate) color.gradient_locate(undefined);
                if (color.mode) color.switch_editor_mode(false);
                if (color.imageScaleMode) color.setImageScaleMode(undefined);
            } else {
                color.set_gradient_type(gradient.value?.gradientType || GradientType.Linear);
                color.gradient_locate({ index: 0, type: "text" });
                color.switch_editor_mode(true, gradient.value);
                color.setImageScaleMode(undefined);
            }
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -262 } });
            break;
        }
        e = e.parentElement;
    }
}

const highlightPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const highlightPanelStatusMgr = new ElementManager(
    props.context,
    highlightPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.highlight-color'] }
);

const highlightPicker = new TextPicker(props.context, FillType.SolidColor, 'highlight');

function showHighlightPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('highlight-color')) {
            highlightPanelStatusMgr.showBy(e, { once: { offsetLeft: -262 } });
            break;
        }
        e = e.parentElement;
    }
}

const styleReplace = {
    flex: 1,
    width: '48px',
    outline: 'none',
    border: 'none',
    height: '14px',
    'background-color': 'transparent',
    'font-size': ' 12px',
    'box-sizing': 'border-box'
};

const HexHighlightInput = () => h('input', {
    style: styleReplace,
    value: toHex2(highlight.value || new Color(1, 216, 216, 216)).slice(1),
    spellcheck: false,
    onFocus: selectAllOnFocus,
    onChange: (e) => onColorChange(e, 'highlight')
});

const HexInput = () => h('input', {
    style: styleReplace,
    value: toHex2(textColor.value || new Color(1, 6, 6, 6)).slice(1),
    spellcheck: false,
    onFocus: selectAllOnFocus,
    onChange: (e) => onColorChange(e, 'color')
});

const DescSpan = () => h('div', {
    style: Object.assign({
        display: 'flex',
        'align-items': 'center'
    }, styleReplace),
    innerText: innerText.value
});

function assemble() {
    color_gradient.value = undefined;
    switch (fillType.value) {
        case FillType.Gradient:
            colorType.value = gradient.value?.gradientType || GradientType.Linear;
            color_gradient.value = getGradientCatch(gradient.value!);
            innerText.value = t(`color.${gradient.value?.gradientType || GradientType.Linear}`);
            compo.value = DescSpan();
            break;
        default:
            colorType.value = fillType.value;
            const color = textColor.value || new Color(1, 6, 6, 6);
            rgbaColor.value = { R: color.red, G: color.green, B: color.blue, A: color.alpha, position: 1 };
            compo.value = HexInput();
    }
}

function clearPanelStatus() {
    const color = props.context.color;
    if (color.gradient_type) color.set_gradient_type(undefined);
    if (color.locate) color.gradient_locate(undefined);
    if (color.mode) color.switch_editor_mode(false);
    if (color.imageScaleMode) color.setImageScaleMode(undefined);
    props.context.color.select_stop(undefined);
}

function closeColor() {
    colorPanelStatusMgr.close();
    clearPanelStatus();
}

const closeHighlight = () => {
    highlightPanelStatusMgr.close();
}

const updateContextColor = () => {
    assemble();
    const c = highlight.value || new Color(1, 216, 216, 216);
    rgbaHighlight.value = { R: c.red, G: c.green, B: c.blue, A: c.alpha, position: 1 };
    const color = props.context.color;
    if (!colorPanelStatus.visible) return;
    if (fillType.value === FillType.SolidColor) {
        if (color.gradient_type) color.set_gradient_type(undefined);
        if (color.locate) color.gradient_locate(undefined);
        if (color.mode) color.switch_editor_mode(false);
        if (color.imageScaleMode) color.setImageScaleMode(undefined);
        props.context.color.select_stop(undefined);
    } else {
        color.set_gradient_type(gradient.value?.gradientType || GradientType.Linear);
        color.gradient_locate({ index: 0, type: "text" });
        color.switch_editor_mode(true, gradient.value);
        color.setImageScaleMode(undefined);
    }
}

const stop2 = watch(() => props.textShapes, (v) => {
    shapes.value = v;
    textFormat();
    textCtxMgr.update();
})
const stop3 = watch(() => props.trigger, v => {
    if (v.includes('layout')||v.includes('size') || v.includes('width') || v.includes('height') || v.includes('text')) {
        textFormat();
        textCtxMgr.update();
    }
})

const stop4 = watch(() => props.selectionChange, textFormat); // 监听选区变化
const stop5 = watch(() => fillType.value, () => nextTick(() => colorPanelStatusMgr.repositioning()));
onMounted(() => {
    props.context.selection.watch(selection_wather);
    props.context.attr.watch(text_selection_wather);
    props.context.workspace.watch(workspace_wather);
    textFormat()
    textCtxMgr.update.bind(textCtxMgr);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.attr.unwatch(text_selection_wather);
    props.context.workspace.unwatch(workspace_wather);
    stop2();
    stop3();
    stop4();
    stop5();
})
const fillTypes = [FillType.SolidColor, FillType.Gradient];
import SvgIcon from '@/components/common/SvgIcon.vue';
import unbind_icon from "@/assets/icons/svg/unbind.svg";
import down_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import word_space_icon from '@/assets/icons/svg/word-space.svg';
import row_height_icon from '@/assets/icons/svg/row-height.svg';
import text_left_icon from '@/assets/icons/svg/text-left.svg';
import text_center_icon from '@/assets/icons/svg/text-center.svg';
import text_right_icon from '@/assets/icons/svg/text-right.svg';
import text_justify_icon from '@/assets/icons/svg/text-justify.svg';
import add_icon from '@/assets/icons/svg/add.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import align_top_icon from '@/assets/icons/svg/align-top.svg';
import align_middle_icon from '@/assets/icons/svg/align-middle.svg';
import align_bottom_icon from '@/assets/icons/svg/align-bottom.svg';
import text_autowidth_icon from '@/assets/icons/svg/text-autowidth.svg';
import text_autoheight_icon from '@/assets/icons/svg/text-autoheight.svg';
import text_fixedsize_icon from '@/assets/icons/svg/text-fixedsize.svg';
import delete_icon from "@/assets/icons/svg/delete.svg";
import { RGBACatch } from '@/components/common/ColorPicker/Editor/solidcolorlineareditor';
import { toHex as toHex2 } from '@/utils/color';
import { TextPicker } from '@/components/common/ColorPicker/Editor/stylectxs/textpicker';
import TextMaskView from './TextMaskView.vue'
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24" :active="true">
            <template #tool>
                <div v-if="cloverVisible" :class="{ 'active': textLibStatus.visible }" class="text_clover"
                    @click="showTextPanel($event)">
                    <SvgIcon :icon="style_icon" />
                </div>
                <TextAdvancedSettings :context="props.context" :manager="textCtxMgr" :data="textCtxMgr.textCtx.text"
                    :textShape="shape" :textShapes="props.textShapes">
                </TextAdvancedSettings>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="mask-mixed" v-if="textCtx.mixed">
                <span>包含多个文本样式，请解绑后编辑</span>
                <div class="unbind" @click="() => textCtxMgr.unbind()">
                    <SvgIcon :icon="unbind_icon" />
                </div>
            </div>
            <TextMaskView v-if="textCtx.mask && !textCtx.mixed" :context="props.context" :manager="textCtxMgr"
                :info="textCtx.maskInfo!" :active="textLibStatus.visible" @show-style-lib="e => showTextPanel(e)">
            </TextMaskView>
            <div v-if="!textCtx.mask && !textCtx.mixed" class="text-top">
                <div class="select-font jointly-text" ref="fontNameEl" style="padding-right: 0;"
                    @click="showFontList($event)">
                    <span>{{ textCtx.text?.fontName ?? t('attr.more_value') }}</span>
                    <div class="down">
                        <SvgIcon :icon="down_icon" style="width: 12px;height: 12px" />
                    </div>
                </div>
                <SelectFont v-if="fontlistStatus.visible" @set-font="setFont" :context="props.context"
                    :manager="textCtxMgr" @setFontWeight="setFontWeight">
                </SelectFont>
                <div class="overlay" @click.stop v-if="showFont" @mousedown.stop="showFont = false"></div>
            </div>
            <div v-if="!textCtx.mask && !textCtx.mixed" class="text-middle">
                <FontWeightSelected :context="context" :manager="textCtxMgr" :selected="fontWeight"
                    :disable="!textCtx.text?.fontName" :fontName="textCtx.text?.fontName!"
                    @setFontWeight="setFontWeight">
                </FontWeightSelected>
                <div class="text-size jointly-text" style="padding-right: 0;">
                    <div class="size_input">
                        <input type="text" v-model="fonstSize" ref="textSize" class="input" @change="setTextSize"
                            @focus="selectSizeValue" @input="handleSize" @click="(e) => click(e, is_size_select)"
                            @keydown="e => keydownSize(e)">
                        <div class="down" @click="onShowSize">
                            <SvgIcon :icon="down_icon" style="" />
                        </div>
                    </div>
                    <div class="font-size-list" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
                        v-if="showSize">
                        <div v-for="(item, i) in textSizes" :key="i" @click="changeTextSize(item)"
                            @mouseover="sizeHoverIndex = i" @mouseleave="sizeHoverIndex = -1">{{ item }}
                            <div class="icon">
                                <SvgIcon v-if="sizeSelectIndex === i"
                                    :icon="sizeHoverIndex === i ? white_select_icon : page_select_icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!textCtx.mask && !textCtx.mixed" class="text-middle">
                <div class="interval jointly-text" style="margin-right: 8px;">
                    <div @mousedown="(e) => onMouseDown(e, 'row-height')">
                        <SvgIcon :icon="word_space_icon" />
                    </div>
                    <input type="text" v-model="rowHeight" ref="lineHeight" class="input" @change="() => setRowHeight()"
                        :placeholder="row_height" @input="handleSize" @click="(e) => click(e, is_row_height_select)"
                        @blur="is_row_height_select = false" @keydown="e => keydownHeight(e)">
                </div>
                <div class="interval jointly-text" style="padding-right: 0;">
                    <div @mousedown="(e) => onMouseDown(e, 'char-space')">
                        <SvgIcon :icon="row_height_icon" />
                    </div>
                    <input type="text" v-model="wordSpace" ref="charSpacing" class="input"
                        @change="() => setWordSpace()" @input="handleSize"
                        @click="(e) => click(e, is_char_space_select)" @blur="is_char_space_select = false"
                        @keydown="e => keydownSpace(e)">
                </div>
            </div>
            <div class="text-bottom">
                <div class="level-aligning jointly-text">
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'left' }"
                        @click="onSelectLevel(TextHorAlign.Left)">
                        <Tooltip :content="t('attr.align_left')" :offset="15">
                            <SvgIcon :icon="text_left_icon" />
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'centered' }"
                        @click="onSelectLevel(TextHorAlign.Centered)">
                        <Tooltip :content="t('attr.align_center')" :offset="15">
                            <SvgIcon :icon="text_center_icon" />
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'right' }"
                        @click="onSelectLevel(TextHorAlign.Right)">
                        <Tooltip :content="t('attr.align_right')" :offset="15">
                            <SvgIcon :icon="text_right_icon" />
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'natural' }"
                        @click="onSelectLevel(TextHorAlign.Natural)">
                        <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                            <SvgIcon :icon="text_justify_icon" />
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
                                <SvgIcon :icon="align_top_icon" />
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectVertical === 'middle' }"
                            @click="onSelectVertical(TextVerAlign.Middle)">
                            <Tooltip :content="t('attr.align_middle')" :offset="15">
                                <SvgIcon :icon="align_middle_icon" />
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectVertical === 'bottom' }"
                            @click="onSelectVertical(TextVerAlign.Bottom)">
                            <Tooltip :content="t('attr.align_bottom')" :offset="15">
                                <SvgIcon :icon="align_bottom_icon" />
                            </Tooltip>
                        </i>
                    </div>
                    <div class="vertical-aligning jointly-text">
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'flexible' }"
                            @click="onSelectText(TextBehaviour.Flexible)">
                            <Tooltip :content="t('attr.autowidth')" :offset="15">
                                <SvgIcon :icon="text_autowidth_icon" />
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'fixed' }"
                            @click="onSelectText(TextBehaviour.Fixed)">
                            <Tooltip :content="t('attr.autoheight')" :offset="15">
                                <SvgIcon :icon="text_autoheight_icon" />
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectText === 'fixWidthAndHeight' }"
                            @click="onSelectText(TextBehaviour.FixWidthAndHeight)">
                            <Tooltip :content="t('attr.fixedsize')" :offset="15">
                                <SvgIcon :icon="text_fixedsize_icon" />
                            </Tooltip>
                        </i>
                    </div>
                </div>
            </div>
            <!-- 字体颜色 -->
            <div class="text-color" v-if="!colorIsMulti && !mixed && textColor">
                <div style="font-size: 12px;">{{ t('attr.font_color') }}
                </div>
                <div class="color">
                    <ColorBlock :colors="([textColor || new Color(1, 6, 6, 6)] as Color[])" @click="showColorPanel" />
                    <component v-blur :is="compo" />
                    <input v-blur ref="alphaFill" class="alphaFill" type="alphaFill" :value="filterAlpha() + '%'"
                        @focus="selectAllOnFocus" @change="(e) => onAlphaChange(e, 'color')" />
                    <ColorPicker v-if="colorPanelStatus.visible" :editor="colorPicker" :type="colorType"
                        :include="fillTypes" :color="rgbaColor!" :gradient="color_gradient" @close="closeColor" />
                </div>

            </div>
            <div class="text-colors" v-else-if="colorIsMulti || mixed">
                <div class="color-title">
                    <div style="font-size: 12px;margin-right: 10px;">{{ t('attr.font_color') }}</div>
                    <div class="add" @click="setMixedTextColor">
                        <SvgIcon :icon="add_icon" />
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!colorIsMulti && !mixed && !textColor">
                <div class="color-title">
                    <div class="add" @click="addTextColor">
                        <SvgIcon :icon="add_icon" />
                    </div>
                </div>
            </div>
            <!-- 高亮颜色 -->
            <div class="highlight-color" v-if="!highlightIsMulti && highlight">
                <div style="font-size: 12px;" :class="{ 'check': highlight, 'nocheck': !highlight }">{{
                    t('attr.highlight_color') }}
                </div>
                <div class="highlight-color-block">
                    <div class="color">
                        <ColorBlock :colors="([highlight || new Color(1, 216, 216, 216)] as Color[])"
                            @click="showHighlightPanel" />
                        <component v-blur :is="HexHighlightInput()" />
                        <input v-blur ref="higlighAlpha" class="alphaFill" type="alphaFill"
                            :value="filterAlpha2() + '%'" @focus="selectAllOnFocus"
                            @change="(e) => onAlphaChange(e, 'highlight')" />
                        <ColorPicker v-if="highlightPanelStatus.visible" :editor="highlightPicker"
                            :type="FillType.SolidColor" :include="[]" :color="rgbaHighlight!" @close="closeHighlight" />
                    </div>
                    <div class="perch" @click="deleteHighlight">
                        <SvgIcon class="svg" :icon="delete_icon" />
                    </div>
                </div>
            </div>
            <div class="text-colors" v-else-if="highlightIsMulti">
                <div class="color-title">
                    <div style="font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{
                            t('attr.highlight_color') }}
                    </div>
                    <div class="add" @click="setMixedHighlight">
                        <SvgIcon :icon="add_icon" />
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!highlightIsMulti && !highlight" @click="addHighlight">
                <div class="color-title">
                    <div style="font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{
                            t('attr.highlight_color') }}
                    </div>
                    <div class="color_border"></div>
                    <div class="add" @click="addHighlight">
                        <SvgIcon :icon="add_icon" />
                    </div>
                </div>
            </div>
        </div>
        <TextStyle v-if="textLibStatus.visible" :context="props.context" :manager="textCtxMgr" @close="closePanel">
        </TextStyle>
        <teleport to="body">
            <div v-if="showpoint" class="point" :style="{ top: (pointY! - 10.5) + 'px', left: (pointX! - 10) + 'px' }">
            </div>
        </teleport>
    </div>
</template>

<style scoped lang="scss">
.value-panel-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    flex: 1;
    height: 32px;
    padding: 0 8px;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .colorShadow {
        flex: 1;
        width: 46px;
        outline: none;
        border: none;
        height: 14px;
        background-color: transparent;
        font-size: 12px;
        box-sizing: border-box;
    }

    .alphaShadow {
        width: 40px;
        outline: none;
        border: none;
        background-color: transparent;
        height: 14px;
        font-size: 12px;
        box-sizing: border-box;
        text-align: center;
    }
}

.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .text-trigger,
    .text_clover {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        >img {
            width: 16px;
            height: 16px;
        }
    }

    .text_clover img {
        padding: 2px;
        box-sizing: border-box;
    }

    .text_clover:hover {
        background-color: #F5F5F5;
    }

    .text-trigger:hover {
        background-color: #F5F5F5;
    }

    .text-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: var(--font-default-fontsize);

        .mask-mixed {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;
            background-color: #f5f5f5;
            border-radius: 6px;
            padding: 0 0 0 6px;
            color: #737373;
            font-size: 12px;
            box-sizing: border-box;
            overflow: hidden;

            .unbind {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 28px;
                width: 28px;
                height: 100%;
                transition: 50ms;
                background-color: var(--input-background);

                >img {
                    width: 16px;
                    height: 16px;
                }

                &:hover {
                    background-color: #e5e5e5;
                }
            }
        }

        .jointly-text {
            height: 32px;
            border-radius: var(--default-radius);
            background-color: var(--input-background);
            display: flex;
            justify-content: space-between;
            align-items: center;

            >img {
                // outline: none;
                width: 16px;
                height: 16px;
                overflow: visible !important;
            }
        }

        .text-top {
            position: relative;
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

                    >img {
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

                        >img {
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

                >div {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    width: 26px;
                    height: 32px;

                    >img {
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
            gap: 8px;


            .color {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                height: 32px;
                padding: 0 8px;
                box-sizing: border-box;
                background-color: var(--input-background);
                border-radius: var(--default-radius);

                .alphaFill {
                    width: 46px;
                    outline: none;
                    border: none;
                    background-color: transparent;
                    height: 14px;
                    font-size: 12px;
                    box-sizing: border-box;
                    flex: 0 0 46px;
                    text-align: right;
                }
            }
        }

        .highlight-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .color {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                height: 32px;
                padding: 0 8px;
                box-sizing: border-box;
                background-color: var(--input-background);
                border-radius: var(--default-radius);

                .alphaFill {
                    width: 35px;
                    outline: none;
                    border: none;
                    background-color: transparent;
                    height: 14px;
                    font-size: 12px;
                    box-sizing: border-box;
                    flex: 0 0 35px;
                    text-align: right;
                }
            }

            .highlight-color-block {
                display: flex;
                flex: 1;
                align-items: center;
                gap: 8px;
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

                    >img {
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
            border-radius: var(--default-radius);

            >img {
                height: 16px;
                width: 16px;
            }
        }

        .perch:hover {
            background-color: #F5F5F5;
        }
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

    >img {
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

.active {
    background-color: #ebebeb !important;
}
</style>
