/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div id="modify-text-panel" class="editor-style">
        <div class="header">
            <div class="title">{{ t('stylelib.editor_text') }}</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon"></SvgIcon>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">{{ t('stylelib.name') }}</label>
                <input v-focus ref="inputname" type="text" id="name" v-model="name"
                    @keydown.esc="props.context.escstack.execute()">
            </div>
            <div class="des">
                <label for="des">{{ t('stylelib.description') }}</label>
                <input type="text" id="des" v-model="des">
            </div>
        </div>
        <div class="text">
            <div class="text-set">
                <div class="title">{{ t('stylelib.text') }}</div>
                <TextAdvancedSettings :context="props.context" :event="'text'" :textShape="props.textShape"
                    :textShapes="props.textShapes"></TextAdvancedSettings>
            </div>
            <div class="text-container">
                <div class="text-font">
                    <div class="select-font" ref="fontNameEl" @click="onShowFont">
                        <span>{{ fontName }}</span>
                        <div class="down">
                            <SvgIcon :icon="down_text_icon" />
                        </div>
                    </div>
                    <SelectFont :showFont="showFont" @set-font="setFont" :fontName="fontName" :context="props.context"
                        :fontWeight="fontWeight" @setFontWeight="setFontWeight" :fontNameEl="fontNameEl">
                    </SelectFont>
                </div>
                <div class="text-size">
                    <FontWeightSelected class="weight" :context="context" :selected="fontWeight"
                        :weightMixed="weightMixed" :disable="disableWeight" :reflush="reflush" :fontName="fontName"
                        @setFontWeight="setFontWeight">
                    </FontWeightSelected>
                    <div class="set-size">
                        <div class="size_input">
                            <input type="text" v-model="fonstSize" ref="textSize" class="input" @change="setTextSize"
                                @focus="selectSizeValue" @input="handleSize" @click="(e) => click(e, is_size_select)"
                                @keydown="e => keydownSize(e)">
                            <div class="down" @click="onShowSize">
                                <SvgIcon :icon="down_text_icon" />
                            </div>
                        </div>
                        <div class="select-size" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
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
                <div class="text-space">
                    <div class="row-height">
                        <div @mousedown="(e) => onMouseDown(e, 'row-height')">
                            <SvgIcon :icon="word_space_icon" />
                        </div>
                        <input type="text" v-model="rowHeight" ref="lineHeight" class="input"
                            @change="() => setRowHeight()" :placeholder="row_height" @input="handleSize"
                            @click="(e) => click(e, is_row_height_select)" @blur="is_row_height_select = false"
                            @keydown="e => keydownHeight(e)">
                    </div>
                    <div class="char-space">
                        <div @mousedown="(e) => onMouseDown(e, 'char-space')">
                            <SvgIcon :icon="row_height_icon" />
                        </div>
                        <input type="text" v-model="wordSpace" ref="charSpacing" class="input"
                            @change="() => setWordSpace()" @input="handleSize"
                            @click="(e) => click(e, is_char_space_select)" @blur="is_char_space_select = false"
                            @keydown="e => keydownSpace(e)">
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script setup lang="ts">
import close_icon from '@/assets/icons/svg/close.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import down_text_icon from '@/assets/icons/svg/down.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import word_space_icon from '@/assets/icons/svg/word-space.svg';
import row_height_icon from '@/assets/icons/svg/row-height.svg';

import { Context } from '@/context';
import { ShapeType, Color, TextShapeView, FillType, Gradient, LinearApi, AttrGetter, AsyncTextAttrEditor, TextAttr } from '@kcdesign/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format_value, is_mac } from '@/utils/common';
import { computed } from 'vue';
import TextAdvancedSettings from '../Text/TextAdvancedSettings.vue'
import SelectFont from '../Text/SelectFont.vue'
import { throttle } from 'lodash';
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { fontWeightConvert } from '../Text/FontNameList';
import FontWeightSelected from '../Text/FontWeightSelected.vue';
import { gradient_equals } from '../../Selection/Controller/ColorEdit/gradient_utils';
import { sortValue } from '../BaseAttr/oval';
import { Attribute } from '@/context/atrribute';

const props = defineProps<{
    context: Context;
    textShape: TextShapeView
    textShapes: TextShapeView[]
}>();

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();
const DefaultFontName = is_mac() ? 'PingFang SC' : '微软雅黑';
const name = ref<string>('')
const des = ref<string>('')
const inputname = ref<HTMLInputElement>()
const reflush = ref<number>(0);
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
const mixed = ref<boolean>(false);
const higMixed = ref<boolean>(false);
const textColor = ref<Color>()
const highlight = ref<Color>()
const fillType = ref<FillType>(FillType.SolidColor);
const gradient = ref<Gradient>();
const textSize = ref<HTMLInputElement>()
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
const rowHeight = ref();
const row_height = ref(`${t('attr.auto')}`)
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!)
const keydownval = ref<boolean>(false)
const isAutoLineHeight = ref<boolean>(true);
const is_char_space_select = ref(false);
const is_row_height_select = ref(false);
const is_size_select = ref(false);
const textSizes = ref([10, 12, 14, 16, 18, 24, 36, 48, 64]);
const sizeSelectIndex = ref(2);

const length = computed(() => {
    return props.textShapes.length === 1;
})

const Neweffect = () => {
    props.context.escstack.execute()
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
        textFormat()
    }

}

const setRowHeight = (val?: number) => {
    const editor = props.context.editor4TextShape(props.textShape)
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
            if (isSelectText()) {
                keydownval.value
                    ?
                    linearApi.modifyTextLineHeight(val!, isAuto, 0, Infinity, props.textShape)
                    :
                    editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, 0, Infinity)
            } else {
                keydownval.value
                    ?
                    linearApi.modifyTextLineHeight(val!, isAuto, textIndex, selectLength, props.textShape)
                    :
                    editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, textIndex, selectLength)
            }
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

const setWordSpace = (val?: number) => {
    const editor = props.context.editor4TextShape(props.textShape)
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
                keydownval.value
                    ?
                    linearApi.modifyTextCharSpacing(val!, 0, Infinity, props.textShape)
                    :
                    editor.setCharSpacing(Number(wordSpace.value), 0, Infinity)
            } else {
                keydownval.value
                    ?
                    linearApi.modifyTextCharSpacing(val!, textIndex, selectLength, props.textShape)
                    :
                    editor.setCharSpacing(Number(wordSpace.value), textIndex, selectLength)
            }
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
        index = 0;
        length = Number.MAX_VALUE;
    } else {
        index = textIndex;
        length = selectLength;
    }
    textAttrEditor = props.context.editor4TextShape(props.textShape).asyncSetTextAttr(props.textShapes, index, length);
    e.stopPropagation()
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    showpoint.value = true;
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

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
    const el = document.querySelector('.new-style')
    if (el) el.addEventListener('mousedown', onShowSizeBlur);
    // document.addEventListener('click', onShowSizeBlur);
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

const onShowSizeBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.set-size')) {
        var timer = setTimeout(() => {
            showSize.value = false;
            clearTimeout(timer)
            const el = document.querySelector('.new-style')
            if (el) document.removeEventListener('click', onShowSizeBlur);
        }, 10)
    }
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

const handleSize = () => {
    executed.value = true;
    const value = textSize.value!.value;
    sizeValue.value = value;
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

const onShowFont = () => {
    props.context.workspace.focusText()
    if (showFont.value) {
        // const el = document.querySelector('.new-style')
        // if (el) el.removeEventListener('mousedown', onShowFontBlur);
        return showFont.value = false
    }
    showFont.value = true

    props.context.escstack.save('onShowFont', () => {
        const achieve = showFont.value;
        showFont.value = false;
        return achieve;
    })

    const el = document.querySelector('.new-style')
    if (el) el.addEventListener('mousedown', onShowFontBlur);

}

function click(e: Event, variate: boolean) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (variate) return;
    el.select();
    variate = true;
}

const onShowFontBlur = (e: Event) => {
    console.log('11111122222211');
    if (e.target instanceof Element && !e.target.closest('.text-font')) {
        var timer = setTimeout(() => {
            console.log('11111111');

            showFont.value = false;
            props.context.workspace.focusText()
            clearTimeout(timer)
            const el = document.querySelector('.new-style')
            if (el) el.removeEventListener('mousedown', onShowFontBlur);
        }, 10)
    }
}

//设置字体
const setFont = (font: string) => {
    fontName.value = font
    showFont.value = false;
    const editor = props.context.editor4TextShape(props.textShape);
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

//设置字体大小
const changeTextSize = (size: number) => {
    fonstSize.value = size
    showSize.value = false;
    const shape = props.textShapes[0] as TextShapeView
    const editor = props.context.editor4TextShape(shape)
    if (shapes.value.length === 1) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            keydownval.value
                ?
                linearApi.modifyTextFontSize(0, Infinity, size, shape)
                :
                editor.setTextFontSize(0, Infinity, size)

        } else {
            keydownval.value
                ?
                linearApi.modifyTextFontSize(textIndex, selectLength, size, shape)
                :
                editor.setTextFontSize(textIndex, selectLength, size)

        }
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

// 设置字重
const setFontWeight = (weight: number, italic: boolean) => {
    fontWeight.value = fontWeightConvert(weight, italic);
    const editor = props.context.editor4TextShape(props.textShape)
    if (length.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextWeight(weight, italic, 0, Infinity)
        } else {
            editor.setTextWeight(weight, italic, textIndex, selectLength)
            textFormat()
        }
    } else {
        editor.setTextWeightMulti(props.textShapes, weight, italic);
        textFormat()
    }
    const textAttr = props.context.textSelection.getTextAttr;
    textAttr.weight = weight;
    textAttr.italic = italic;
    props.context.textSelection.setTextAttr(textAttr);
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

const getTextShapes = () => {
    shapes.value = props.textShapes;
}

const selectSizeValue = () => {
    if (textSize.value) {
        executed.value = true;
        getTextShapes();
        const value = textSize.value.value;
        sizeValue.value = value;
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
        const editor = props.context.editor4TextShape(t_shape[0])
        let format: AttrGetter
        const __text = t_shape[0].getText();
        if (textIndex === -1) {
            format = __text.getTextFormat(0, Infinity, editor.getCachedSpanAttr())
        } else {
            format = __text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr())
        }
        colorIsMulti.value = format.colorIsMulti
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
            if (foundEqual) {
                format[key] = referenceValue;
            } else {
                format[key] = `unlikeness`;
            }
        }
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
    reflush.value++;
}
const textFormat = throttle(_textFormat, 0, { leading: true })


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

// function watchShapes() {
//     const needWatchShapes2 = new Map();
//     const selection = props.context.selection;
//     if (selection.hoveredShape) {
//         needWatchShapes2.set(selection.hoveredShape.id, selection.hoveredShape);
//     }

//     const selectedShapes = props.context.selection.selectedShapes;
//     if (selectedShapes.length > 0) {
//         for (let i = 0, l = selectedShapes.length; i < l; i++) {
//             const v = selectedShapes[i];
//             if (v.isVirtualShape) {
//                 let p = v.parent;
//                 while (p) {
//                     if (p.type === ShapeType.SymbolRef) {
//                         needWatchShapes2.set(p.id, p);
//                         break;
//                     }
//                     p = p.parent;
//                 }
//             }
//             needWatchShapes2.set(v.id, v);
//         }
//     }

//     watchedShapes2.forEach((v, k) => {
//         if (needWatchShapes2.has(k)) return;
//         v.unwatch(watcher);
//         watchedShapes2.delete(k);
//     })
//     needWatchShapes2.forEach((v, k) => {
//         if (watchedShapes2.has(k)) return;
//         v.watch(watcher);
//         watchedShapes2.set(k, v);
//     })
// }
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

const stop2 = watch(() => props.textShapes, (v) => {
    shapes.value = v;
    textFormat();
})

onMounted(() => {
    props.context.selection.watch(selection_wather);
    props.context.attr.watch(text_selection_wather);
    props.context.workspace.watch(workspace_wather);
    textFormat();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_wather);
    stop2();
});


</script>
<style lang="scss" scoped>
.disable {
    pointer-events: none;
    opacity: 0.4;
}

.editor-style {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            img {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                /* margin-top: 1px; */
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name,
        .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .text {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 8px;
        box-sizing: border-box;

        .text-set {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;

            .setting {
                width: 28px;
                height: 28px;
                display: flex;
                border-radius: 4px;

                &:hover {
                    background-color: #F5F5F5;
                }

                img {
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }
            }
        }

        .text-container {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .text-font {
                width: 100%;

                .select-font {
                    height: 32px;
                    border-radius: var(--default-radius);
                    background-color: var(--input-background);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 6px;

                    span {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .down {
                        width: 12px;
                        height: 12px;

                        img {
                            width: 100%;
                            height: 100%;
                        }
                    }

                    &:hover {
                        background-color: #e5e5e5;
                    }
                }




            }

            .text-size {
                display: flex;
                align-items: center;
                height: 32px;
                box-sizing: border-box;
                gap: 8px;

                .set-size {
                    flex: 0.5;
                    display: flex;
                    align-items: center;
                    background-color: var(--input-background);
                    height: 32px;
                    box-sizing: border-box;
                    border-radius: 6px;
                    position: relative;

                    .size_input {
                        position: relative;
                        display: flex;
                        align-items: center;
                        padding: 0 2px 0 8px;
                        box-sizing: border-box;
                        justify-content: space-between;

                        .input {
                            outline: none;
                            padding: 0;
                            margin: 0;
                            width: 100%;
                            background-color: transparent;
                            border: none;
                        }

                        .down {
                            display: flex;
                            min-width: 26px;
                            height: 26px;
                            align-items: center;
                            justify-content: center;
                            border-radius: 4px;

                            >img {
                                width: 12px;
                                height: 12px;
                            }

                            &:hover {
                                background-color: #EBEBEB;
                            }
                        }
                    }


                }


                .select-size {
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

            .text-space {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;

                .row-height,
                .char-space {
                    flex: 0.5;
                    display: flex;
                    align-items: center;
                    background-color: #f5f5f5;
                    height: 32px;
                    border-radius: 6px;
                    gap: 8px;
                    padding: 0 8px;
                    box-sizing: border-box;

                    >div {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;

                        >img {
                            cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto !important;
                            width: 14px;
                            height: 14px;
                        }
                    }

                    .input {
                        width: 100%;
                        background-color: transparent;
                        border: none;
                        padding: 0;
                        outline: none;
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
        }
    }
}
</style>
