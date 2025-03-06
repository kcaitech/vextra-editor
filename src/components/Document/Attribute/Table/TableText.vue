/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from '../Text/SelectFont.vue';
import { onMounted, ref, onUnmounted, watchEffect, watch, nextTick, shallowRef } from 'vue';
import { Context } from '@/context';
import { AttrGetter, TableView, TableCell, Text, TableCellView, TextShapeView, FillType, Gradient, GradientType, cloneGradient, BasicArray, Stop, Matrix, TableCellType, AsyncTextAttrEditor } from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color, UnderlineType, StrikethroughType } from "@kcdesign/data";
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Reg_HEX } from "@/utils/RegExp";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { message } from "@/utils/message";
import TableTextSetting from './TableTextSetting.vue';
import { TableSelection } from '@/context/tableselection';
import { getGradient, gradient_equals } from '../../Selection/Controller/ColorEdit/gradient_utils';
import { throttle } from 'lodash';
import FontWeightSelected from '../Text/FontWeightSelected.vue';
import { fontWeightConvert } from '../Text/FontNameList';
import { format_value, is_mac } from "@/utils/common";
interface Props {
    context: Context
    shape: TableView
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
const textColor = ref<Color>()
const highlight = ref<Color>()
const textSize = ref<HTMLInputElement>()
const higlightColor = ref<HTMLInputElement>()
const higlighAlpha = ref<HTMLInputElement>()
const shape = shallowRef<TableCellView>()
const table = shallowRef<TableCellView>()
const sizeHoverIndex = ref(-1);
const fillType = ref<FillType>(FillType.SolidColor);
const gradient = ref<Gradient>();
const mixed = ref<boolean>(false);
const fontWeight = ref('Regular');
const weightMixed = ref<boolean>(false);
const disableWeight = ref(false);
const fontNameEl = ref<HTMLDivElement>();
const wordSpace = ref()
const rowHeight = ref()
// const selection = ref(props.context.selection) 
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const isAutoLineHeight = ref<boolean>(true);
function toHex(r: number, g: number, b: number, prefix = true) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return (prefix ? '#' : '') + hex(r) + hex(g) + hex(b);
}

const onShowFont = () => {
    props.context.workspace.focusText()
    if (showFont.value) return showFont.value = false
    showFont.value = true
    props.context.escstack.save('onShowFont', () => {
        const achieve = showFont.value;
        showFont.value = false;
        return achieve;
    })

    document.addEventListener('mousedown', onShowFontBlur);
}

const onShowFontBlur = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.font-container') && !e.target.closest('.select-font')) {
        var timer = setTimeout(() => {
            showFont.value = false;
            props.context.workspace.focusText()
            clearTimeout(timer)
            document.removeEventListener('mousedown', onShowFontBlur);
        }, 10)
    }
}
const textSizes = ref([10, 12, 14, 16, 18, 24, 36, 48, 64]);
const sizeSelectIndex = ref(2);
const onShowSize = () => {
    props.context.workspace.focusText()
    if (showSize.value) return showSize.value = false;
    const index = textSizes.value.findIndex(item => item === fonstSize.value);
    if (index > -1) sizeSelectIndex.value = index;
    showSize.value = true;
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
const cellSelect = (table: TableSelection) => {
    return { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd }
}
// 设置字重
const setFontWeight = (weight: number, italic: boolean) => {
    fontWeight.value = fontWeightConvert(weight, italic);
    isBold.value = weight
    isTilt.value = italic
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextWeight(weight, italic, 0, Infinity)
        } else {
            editor.setTextWeight(weight, italic, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextWeight(weight, italic);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextWeight(weight, italic, cell_selection);
        }
    }
    textFormat();
}

// 设置水平对齐
const onSelectLevel = (icon: TextHorAlign) => {
    selectLevel.value = icon
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextHorAlign(icon, 0, Infinity)
        } else {
            editor.setTextHorAlign(icon, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextHorAlign(icon);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextHorAlign(icon, cell_selection);
        }
    }
    textFormat();
}
//设置垂直对齐
const onSelectVertical = (icon: TextVerAlign) => {
    selectVertical.value = icon
    if (shape.value) {
        const editor = props.context.editor4TextShape(shape.value)
        editor.setTextVerAlign(icon)
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextVerAlign(icon);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextVerAlign(icon, cell_selection);
        }
    }
    textFormat();
}
//设置字体大小
const changeTextSize = (size: number, shape: TableCellView) => {
    showSize.value = false;
    if (shape) {
        const editor = props.context.editor4TextShape(shape)
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextFontSize(0, Infinity, size)
        } else {
            editor.setTextFontSize(textIndex, selectLength, size)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextFontSize(size);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextFontSize(size, cell_selection);
        }
    }
    textFormat();
}
//设置字体
const setFont = (font: string) => {
    fontName.value = font
    showFont.value = false;
    if (shape.value) {
        const editor = props.context.editor4TextShape(shape.value)
        const { textIndex, selectLength } = getTextIndexAndLen()
        if (isSelectText()) {
            editor.setTextFontName(0, Infinity, font)
        } else {
            editor.setTextFontName(textIndex, selectLength, font)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextFontName(font);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextFontName(font, cell_selection);
        }
    }
    textFormat();
}

const setRowHeight = () => {
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
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value)
        if (!isNaN(Number(value))) {
            if (isSelectText()) {
                editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, 0, Infinity)
            } else {
                editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, textIndex, selectLength)
            }
        } else {
            textFormat();
        }
    } else {
        if (!isNaN(Number(value))) {
            const table = props.shape;
            const table_Selection = props.context.tableSelection;
            const editor = props.context.editor4Table(table)
            if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
                editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto);
            } else {
                const cell_selection = cellSelect(table_Selection)
                editor.setLineHeight(value.length === 0 ? undefined : Number(value), isAuto, cell_selection);
            }
        } else {
            textFormat();
        }
    }
}

const setWordSpace = () => {
    if (wordSpace.value.length < 1) { wordSpace.value = 0 }
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value)
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
            const table = props.shape;
            const table_Selection = props.context.tableSelection;
            const editor = props.context.editor4Table(table)
            if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
                editor.setCharSpacing(Number(wordSpace.value));
            } else {
                const cell_selection = cellSelect(table_Selection)
                editor.setCharSpacing(Number(wordSpace.value), cell_selection);
            }
        } else {
            textFormat();
        }
    }
}

//获取选中字体的长度和开始下标
const getTextIndexAndLen = () => {
    const selection = props.context.textSelection;
    const textIndex = Math.min(selection.cursorEnd, selection.cursorStart);
    const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart);
    return { textIndex, selectLength };
}
//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
    if (shape.value) {
        const selection = props.context.textSelection;
        if ((selection.cursorEnd > 0) && (selection.cursorStart > 0)) {
            return false;
        } else {
            return true;
        }
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
        changeTextSize(Number(value), table.value!);
        textFormat();
    } else {
        textFormat();
    }
}
//下拉选择字体大小
const selectTextSize = (size: number) => {
    fonstSize.value = size
    showSize.value = false;
    changeTextSize(size, shape.value!);
}
const handleSize = () => {
    executed.value = true;
    const value = textSize.value!.value;
    sizeValue.value = value;
}

const shapeWatch = watch(() => props.shape, (value, old) => {
    old.unwatch(textFormat);
    value.watch(textFormat);
})
const reflush = ref(0);
// 获取当前文字格式
const textFormat = (_t?: any) => {
    if (_t && (_t === 'frame' || _t === 'colWidths' || _t === 'rowHeights')) return;
    const table = props.context.tableSelection;
    shape.value = undefined;
    mixed.value = false;
    disableWeight.value = false;
    weightMixed.value = false;
    if (table.editingCell) {
        shape.value = table.editingCell;
        // 拿到某个单元格
        if (!shape.value || !shape.value.text) return;
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        let format: AttrGetter;
        if (textIndex === -1) {
            format = shape.value.text.getTextFormat(0, Infinity, editor.getCachedSpanAttr());
        } else {
            format = shape.value.text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr());
        }
        isAutoLineHeight.value = format.autoLineHeight ?? true;
        colorIsMulti.value = format.colorIsMulti;
        rowHeight.value = format.autoLineHeight ?? true ? format.minimumLineHeight !== undefined ? format_value(format.minimumLineHeight || 0) + '%' : 'Auto' : format_value(format.minimumLineHeight || 0)
        wordSpace.value = format.kerning || 0;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        selectVertical.value = format.verAlign || 'top';
        fontName.value = format.fontName || DefaultFontName;
        fonstSize.value = format.fontSize || 14;
        textColor.value = format.color;
        highlight.value = format.highlight;
        isBold.value = format.weight;
        isTilt.value = format.italic || false;
        fillType.value = format.fillType || FillType.SolidColor;
        gradient.value = format.gradient;
        fontWeight.value = fontWeightConvert(isBold.value, isTilt.value);
        if (format.minimumLineHeightIsMulti || format.autoLineHeightIsMulti) rowHeight.value = `${t('attr.more_value')}`;
        if (format.italicIsMulti) weightMixed.value = true;
        if (format.weightIsMulti) weightMixed.value = true;
        if (format.fontNameIsMulti) {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`
        }
        if (format.kerningIsMulti) wordSpace.value = `${t('attr.more_value')}`;
        if (format.fontSizeIsMulti) fonstSize.value = `${t('attr.more_value')}`;
        if (format.fillTypeIsMulti) mixed.value = true;
        if (!format.fillTypeIsMulti && format.fillType === FillType.Gradient && format.gradientIsMulti) mixed.value = true;
        props.context.workspace.focusText();
    } else {
        let cells: (TableCellView)[] = []
        if (table.tableRowStart < 0 || table.tableColStart < 0) {
            cells = (props.shape.childs) as (TableCellView)[];
        } else {
            cells = table.getSelectedCells(true).reduce((cells, item) => { if (item.cell) cells.push(item.cell); return cells; }, [] as (TableCellView[]));
        }
        shape.value = undefined
        const formats: any[] = [];
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell && cell.cellType === TableCellType.Text && cell.data.text) {
                const editor = props.context.peekEditor4TextShape(cell);
                const forma = (cell.data.text as Text).getTextFormat(0, Number.MAX_SAFE_INTEGER, editor?.getCachedSpanAttr());
                formats.push(forma);
            }
        }
        let format: any = {};
        if (formats.length > 0) {
            const referenceKeys = Object.keys(formats[0]);
            for (const key of referenceKeys) {
                const referenceValue = formats[0][key];
                let foundEqual = true;
                for (let i = 1; i < formats.length; i++) {
                    if (formats[i][key] && referenceValue && (key === 'color' || key === 'highlight')) {
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
        }
        isAutoLineHeight.value = format.autoLineHeight ?? true;
        colorIsMulti.value = format.colorIsMulti;
        wordSpace.value = format.kerning || 0;
        rowHeight.value = format.autoLineHeight ?? true ? format.minimumLineHeight !== undefined ? format_value(format.minimumLineHeight || 0) + '%' : 'Auto' : format_value(format.minimumLineHeight || 0) as number;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        selectVertical.value = format.verAlign || 'top';
        fontName.value = format.fontName || DefaultFontName;
        fonstSize.value = format.fontSize || 14;
        highlight.value = format.highlight;
        isBold.value = format.weight;
        isTilt.value = format.italic || false;
        textColor.value = format.color;
        fillType.value = format.fillType || FillType.SolidColor;
        gradient.value = format.gradient;
        fontWeight.value = fontWeightConvert(isBold.value, isTilt.value);
        if (format.fontName === 'unlikeness') {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`;
        } else if (format.fontNameIsMulti) {
            disableWeight.value = true;
            fontName.value = `${t('attr.more_value')}`;
        }
        if (format.fontSize === 'unlikeness') {
            fonstSize.value = `${t('attr.more_value')}`;
        } else if (format.fontSizeIsMulti) {
            fonstSize.value = `${t('attr.more_value')}`;
        }
        if (format.kerningIsMulti === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
        if (format.kerning === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
        if (format.minimumLineHeight === 'unlikeness' || format.autoLineHeight === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
        if (format.minimumLineHeightIsMulti === 'unlikeness' || format.autoLineHeightIsMulti === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
        if (format.alignment === 'unlikeness') selectLevel.value = '';
        if (format.verAlign === 'unlikeness') selectVertical.value = '';
        if (format.color === 'unlikeness' || format.fillType === 'unlikeness') colorIsMulti.value = true;
        if (format.highlight === 'unlikeness') highlightIsMulti.value = true;
        if (format.weight === 'unlikeness') weightMixed.value = true;
        if (format.italic === 'unlikeness') weightMixed.value = true;
        if (format.colorIsMulti === 'unlikeness') colorIsMulti.value = true;
        if (format.highlightIsMulti === 'unlikeness') highlightIsMulti.value = true;
        if (format.fillType === 'unlikeness') mixed.value = true;
        if (format.fillTypeIsMulti === 'unlikeness') mixed.value = true;
        if (format.fillTypeIsMulti !== 'unlikeness' && format.fillType === FillType.Gradient && format.gradientIsMulti === 'unlikeness') mixed.value = true;
        if (format.gradient === 'unlikeness') gradient.value = undefined;
        if (format.fillType === FillType.Gradient && format.gradient === 'unlikeness') mixed.value = true;
    }
    reflush.value++;
}

const _textFormat = throttle(textFormat, 160, { leading: true })

function selection_wather(t: number | string) {
    if (t === Selection.CHANGE_TEXT) {
        textFormat();
    } else if (t === Selection.CHANGE_SHAPE) {
        textFormat();
    }
}
function workspace_wather(t: number) {
    if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        textFormat();
    } else if (t === WorkSpace.TABLE_TEXT_GRADIENT_UPDATE) {
        _textFormat();
    }
}

function onAlphaChange(e: Event, type: string) {
    let value = (e.currentTarget as any)['value'];
    if (value?.slice(-1) === '%') {
        value = Number(value?.slice(0, -1))
        if (value >= 0) {
            if (value > 100) {
                value = 100
            }
            value = value.toFixed(2) / 100
            let color
            if (type === 'color') {
                color = textColor.value
                if (fillType.value === FillType.Gradient) {
                    set_gradient_opacity(value);
                    return;
                }
            } else {
                color = highlight.value
            }
            if (!color) return
            let clr = toHex(color.red, color.green, color.blue);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            setColor(0, clr, value, type);
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
            let color
            if (type === 'color') {
                color = textColor.value
                if (fillType.value === FillType.Gradient) {
                    set_gradient_opacity(value);
                    return;
                }
            } else {
                color = highlight.value
            }
            if (!color) return
            let clr = toHex(color.red, color.green, color.blue);
            if (clr.slice(0, 1) !== '#') {
                clr = "#" + clr
            }
            setColor(0, clr, value, type);
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

const set_gradient_opacity = (opacity: number) => {
    if (!gradient.value) return;
    const g = cloneGradient(gradient.value);
    g.gradientOpacity = opacity;
    editor_gradient(g);
}

function onColorChange(e: Event, type: string) {
    let value = (e.target as HTMLInputElement)?.value;
    if (value.slice(0, 1) !== '#') {
        value = "#" + value
    }
    if (value.length === 4) value = `#${value.slice(1).split('').map(i => `${i}${i}`).join('')}`;
    if (value.length === 2) value = `#${value.slice(1).split('').map(i => `${i}${i}${i}${i}${i}${i}`).join('')}`;
    if (type === 'color') {
        if (Reg_HEX.test(value)) {
            const alpha = textColor.value!.alpha;
            setColor(0, value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(textColor.value!.red, textColor.value!.green, textColor.value!.blue);
        }
    } else {
        if (Reg_HEX.test(value)) {
            const alpha = highlight.value!.alpha;
            setColor(0, value, alpha, type);
        } else {
            message('danger', t('system.illegal_input'));
            return (e.target as HTMLInputElement).value = toHex(highlight.value!.red, highlight.value!.green, highlight.value!.blue);
        }
    }
}
function getColorFromPicker(color: Color, type: string) {
    if (shape.value) {
        const editor = props.context.editor4TextShape(shape.value);
        const { textIndex, selectLength } = getTextIndexAndLen();
        if (isSelectText()) {
            if (type === 'color') {
                editor.setTextColor(0, Infinity, color);
            } else {
                editor.setTextHighlightColor(0, Infinity, color);
            }
        } else {
            if (type === 'color') {
                editor.setTextColor(textIndex, selectLength, color);
            } else {
                editor.setTextHighlightColor(textIndex, selectLength, color);
            }
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            if (type === 'color') {
                editor.setTextColor(color);
            } else {
                editor.setTextHighlightColor(color);
            }
        } else {
            const cell_selection = cellSelect(table_Selection)
            if (type === 'color') {
                editor.setTextColor(color, cell_selection);
            } else {
                editor.setTextHighlightColor(color, cell_selection);
            }
        }
    }
    textFormat();
}

function setColor(idx: number, clr: string, alpha: number, type: string) {
    const res = clr.match(Reg_HEX);
    if (!res) {
        message('danger', t('system.illegal_input'));
        return;
    }
    const r = Number.parseInt(res[1], 16);
    const g = Number.parseInt(res[2], 16);
    const b = Number.parseInt(res[3], 16);
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            if (type === 'color') {
                editor.setTextColor(0, Infinity, new Color(alpha, r, g, b));
            } else {
                editor.setTextHighlightColor(0, Infinity, new Color(alpha, r, g, b));
            }
        } else {
            if (type === 'color') {
                editor.setTextColor(textIndex, selectLength, new Color(alpha, r, g, b));
            } else {
                editor.setTextHighlightColor(textIndex, selectLength, new Color(alpha, r, g, b));
            }
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            if (type === 'color') {
                editor.setTextColor(new Color(alpha, r, g, b))
            } else {
                editor.setTextHighlightColor(new Color(alpha, r, g, b));
            }
        } else {
            const cell_selection = cellSelect(table_Selection)
            if (type === 'color') {
                editor.setTextColor(new Color(alpha, r, g, b), cell_selection)
            } else {
                editor.setTextHighlightColor(new Color(alpha, r, g, b), cell_selection);
            }
        }
    }
    textFormat();
}

const deleteHighlight = () => {
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            editor.setTextHighlightColor(0, Infinity, undefined);
        } else {
            editor.setTextHighlightColor(textIndex, selectLength, undefined);
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextHighlightColor(undefined);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextHighlightColor(undefined, cell_selection);
        }
    }
    textFormat();
}

const addHighlight = () => {
    if (highlight.value && !highlightIsMulti.value) return
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            editor.setTextHighlightColor(0, Infinity, new Color(1, 216, 216, 216));
        } else {
            editor.setTextHighlightColor(textIndex, selectLength, new Color(1, 216, 216, 216));
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextHighlightColor(new Color(1, 216, 216, 216));
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextHighlightColor(new Color(1, 216, 216, 216), cell_selection);
        }
    }
    textFormat();
}
const addTextColor = () => {
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            editor.setTextColor(0, Infinity, new Color(1, 6, 6, 6));
        } else {
            editor.setTextColor(textIndex, selectLength, new Color(1, 6, 6, 6));
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextColor(new Color(1, 6, 6, 6));
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextColor(new Color(1, 6, 6, 6), cell_selection);
        }
    }
    textFormat();
}

const setMixedTextColor = () => {
    const { textIndex, selectLength } = getTextIndexAndLen();
    let format: AttrGetter
    if (shape.value) {
        const editor = props.context.editor4TextShape(shape.value);
        format = shape.value.text.getTextFormat(textIndex, 1, editor.getCachedSpanAttr());
        const { alpha, red, green, blue } = format.color || new Color(1, 6, 6, 6);
        editor.setTextColor(textIndex, selectLength, new Color(alpha, red, green, blue));
        editor.setTextFillType(format.fillType || FillType.SolidColor, textIndex, selectLength);
        if (format.gradient) {
            editor.setTextGradient(format.gradient, textIndex, selectLength);
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        let cells: (TableCellView)[] = []
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            cells = (props.shape.childs) as (TableCellView)[];
        } else {
            cells = table_Selection.getSelectedCells(true).reduce((cells, item) => { if (item.cell) cells.push(item.cell); return cells; }, [] as (TableCellView[]));
        }
        if (!cells[0]) return;
        const cell_editor = props.context.editor4TextShape(cells[0] as any);
        const forma = (cells[0].text as Text).getTextFormat(0, 1, cell_editor.getCachedSpanAttr());
        const { alpha, red, green, blue } = forma.color || new Color(1, 6, 6, 6);
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextColor(new Color(alpha, red, green, blue));
            editor.setTextFillType(forma.fillType || FillType.SolidColor);
            if (forma.gradient) {
                editor.setTextGradient(forma.gradient);
            }
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextColor(new Color(alpha, red, green, blue), cell_selection);
            editor.setTextFillType(forma.fillType || FillType.SolidColor, cell_selection);
            if (forma.gradient) {
                editor.setTextGradient(forma.gradient, cell_selection);
            }
        }
    }
    textFormat();
}

const togger_gradient_type = (type: GradientType, fillType: FillType) => {
    const g = fillType === FillType.Gradient && getGradient(gradient.value, type, textColor.value!);
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            editor.setTextFillType(fillType, 0, Infinity)
            if (g) {
                editor.setTextGradient(g, 0, Infinity);
            }
        } else {
            editor.setTextFillType(fillType, textIndex, selectLength)
            if (g) {
                const g = getGradient(gradient.value, type, textColor.value!);
                editor.setTextGradient(g, textIndex, selectLength);
            }
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextFillType(fillType);
            if (g) {
                editor.setTextGradient(g);
            }
        } else {
            const cell_selection = cellSelect(table_Selection);
            editor.setTextFillType(fillType, cell_selection);
            if (g) {
                editor.setTextGradient(g, cell_selection);
            }
        }
    }
    textFormat();
}
function gradient_stop_color_change(color: Color, index: number) {
    if (!gradient.value) return;
    let g: Gradient;
    g = cloneGradient(gradient.value);
    if (g) {
        g.stops[index].color = color;
    }
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            if (index === 0) editor.setTextColor(0, Infinity, color);
            editor.setTextGradient(g, 0, Infinity);
        } else {
            if (index === 0) editor.setTextColor(textIndex, selectLength, color);
            editor.setTextGradient(g, textIndex, selectLength);
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            if (index === 0) editor.setTextColor(color);
            editor.setTextGradient(g);
        } else {
            const cell_selection = cellSelect(table_Selection)
            if (index === 0) editor.setTextColor(color, cell_selection);
            editor.setTextGradient(g, cell_selection);
        }
    }
    textFormat();
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
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        const editor = props.context.editor4TextShape(shape.value);
        if (isSelectText()) {
            editor.setTextGradient(g, 0, Infinity);
        } else {
            editor.setTextGradient(g, textIndex, selectLength);
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextGradient(g);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextGradient(g, cell_selection);
        }
    }
    textFormat();
}

const selectSizeValue = () => {
    if (textSize.value) {
        executed.value = true;
        table.value = shape.value;
        const value = textSize.value!.value;
        sizeValue.value = value;
    }
}
const selectColorValue = () => {
}
const selectAlphaValue = () => {
}
const selectHiglightColor = () => {
}
const selectHiglighAlpha = () => {
}


const pointX = ref<number>()
const pointY = ref<number>()
const showpoint = ref<boolean>(false)
let type = 'row-height';
let textAttrEditor: AsyncTextAttrEditor | undefined = undefined;
let tableTextAttrEditor: AsyncTextAttrEditor | undefined = undefined;
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
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen();
        let index = textIndex;
        let length = selectLength;
        if (isSelectText()) {
            index = 0; length = Number.MAX_VALUE;
        } else {
            index = textIndex; length = selectLength;
        }
        textAttrEditor = props.context.editor4TextShape(shape.value).asyncSetTextAttr([shape.value], index, length);
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table);
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            tableTextAttrEditor = editor.asyncSetTableAttr();
        } else {
            const cell_selection = cellSelect(table_Selection)
            tableTextAttrEditor = editor.asyncSetTableAttr(cell_selection);
        }

    }
    e.stopPropagation()
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener("mousemove", onMouseMove, false);
    showpoint.value = true;
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        onMouseUp();
    }
}

function updatePosition(movementX: number, movementY: number, isRotating: boolean) {
    if (pointX.value === undefined || pointY.value === undefined) return;
    const clientHeight = document.documentElement.clientHeight
    const clientWidth = document.documentElement.clientWidth
    pointX.value += movementX
    pointY.value += movementY
    pointX.value = pointX.value < 0 ? clientWidth : (pointX.value > clientWidth ? 0 : pointX.value)
    pointY.value = pointY.value < 0 ? clientHeight : (pointY.value > clientHeight ? 0 : pointY.value)
}

function onMouseMove(e: MouseEvent) {
    const isRotating = e.movementX > 0;
    updatePosition(e.movementX, e.movementY, isRotating);
    if (type === 'row-height') {
        if (isNaN(rowHeight.value) || rowHeight.value < 0) return;
        rowHeight.value = Number(rowHeight.value) + e.movementX < 0 ? 0 : Number(rowHeight.value) + e.movementX;
        if (textAttrEditor) {
            textAttrEditor.execute_line_height(rowHeight.value);
        }
        if (tableTextAttrEditor) {
            tableTextAttrEditor.execute_line_height(rowHeight.value);
        }
    } else {
        if (isNaN(wordSpace.value) || wordSpace.value < 0) return;
        wordSpace.value = Number(wordSpace.value) + e.movementX < 0 ? 0 : Number(wordSpace.value) + e.movementX;
        if (textAttrEditor) {
            textAttrEditor.execute_char_spacing(wordSpace.value);
        }
        if (tableTextAttrEditor) {
            tableTextAttrEditor.execute_char_spacing(wordSpace.value);
        }
    }
}

function onMouseUp() {
    document.exitPointerLock()
    showpoint.value = false
    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp);
    if (textAttrEditor) {
        textAttrEditor.close();
        textAttrEditor = undefined;
    }
    if (tableTextAttrEditor) {
        tableTextAttrEditor.close();
        tableTextAttrEditor = undefined;
    }
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

const watchCells = new Map<string, TableCellView>(); // 表格单元格监听
function watch_cells() {
    watchCells.forEach((v, k) => {
        v.unwatch(_textFormat);
        watchCells.delete(k);
    })
    const tableSelection = props.context.tableSelection;
    const selectedCells = tableSelection.getSelectedCells();
    const editedCell = tableSelection.editingCell;
    const list = [...selectedCells.map(s => s.cell), editedCell];

    list.forEach(v => {
        if (v) {
            v.watch(_textFormat);
            watchCells.set(v.id, v);
        }
    })
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

onMounted(() => {
    _textFormat();
    props.shape.watch(_textFormat);
    props.context.selection.watch(selection_wather);
    props.context.workspace.watch(workspace_wather);
    watch_cells();
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_wather);
    props.shape.unwatch(_textFormat);
    shapeWatch();
    watchCells.forEach(v => {
        v.unwatch(_textFormat);
    })

})


import SvgIcon from '@/components/common/SvgIcon.vue';
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
import align_top_icon from '@/assets/icons/svg/align-top.svg';
import align_middle_icon from '@/assets/icons/svg/align-middle.svg';
import align_bottom_icon from '@/assets/icons/svg/align-bottom.svg';

</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.table_text')" class="mt-24" :active="true">
            <template #tool>
                <TableTextSetting :context="props.context" :textShape="props.shape"></TableTextSetting>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text" ref="fontNameEl" style="padding-right: 0;" @click="onShowFont">
                    <span>{{ fontName }}</span>
                    <div class="down">
                        <SvgIcon :icon="down_icon" style="width: 12px;height: 12px"/>
                    </div>
                </div>
                <SelectFont :showFont="showFont" @set-font="setFont" :fontName="fontName" :context="props.context"
                    :fontWeight="fontWeight" @setFontWeight="setFontWeight" :fontNameEl="fontNameEl">
                </SelectFont>
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
                            <SvgIcon :icon="down_icon"/>
                        </div>
                    </div>
                    <div class="font-size-list" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
                        v-if="showSize">
                        <div v-for="(item, i) in textSizes" :key="i" @click="selectTextSize(item)"
                            @mouseover="sizeHoverIndex = i" @mouseleave="sizeHoverIndex = -1">{{ item }}
                            <div class="icon">
                                <SvgIcon v-if="sizeSelectIndex === i"
                                    :icon="sizeHoverIndex === i ? white_select_icon : page_select_icon"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-middle">
                <div class="interval jointly-text" style="margin-right: 8px;">
                    <div @mousedown="(e) => onMouseDown(e, 'row-height')">
                        <SvgIcon :icon="word_space_icon"/>
                    </div>
                    <input type="text" v-model="rowHeight" ref="lineHeight" class="input" @change="setRowHeight"
                        @input="handleSize" @click="(e) => click(e, is_row_height_select)"
                        @blur="is_row_height_select = false">
                </div>
                <div class="interval jointly-text" style="padding-right: 0;">
                    <div @mousedown="(e) => onMouseDown(e, 'char-space')">
                        <SvgIcon :icon="row_height_icon"/>
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
                            <SvgIcon :icon="text_left_icon"/>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'centered' }"
                        @click="onSelectLevel(TextHorAlign.Centered)">
                        <Tooltip :content="t('attr.align_center')" :offset="15">
                            <SvgIcon :icon="text_center_icon"/>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'right' }"
                        @click="onSelectLevel(TextHorAlign.Right)">
                        <Tooltip :content="t('attr.align_right')" :offset="15">
                            <SvgIcon :icon="text_right_icon"/>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectLevel === 'natural' }"
                        @click="onSelectLevel(TextHorAlign.Natural)">
                        <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                            <SvgIcon :icon="text_justify_icon"/>
                        </Tooltip>
                    </i>
                </div>
            </div>
            <div class="text-bottom">
                <div class="vertical-aligning jointly-text">
                    <i :class="{ 'jointly-text': true, selected_bg: selectVertical === 'top' }"
                        @click="onSelectVertical(TextVerAlign.Top)">
                        <Tooltip :content="t('attr.align_top')" :offset="15">
                            <SvgIcon :icon="align_top_icon"/>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectVertical === 'middle' }"
                        @click="onSelectVertical(TextVerAlign.Middle)">
                        <Tooltip :content="t('attr.align_middle')" :offset="15">
                            <SvgIcon :icon="align_middle_icon"/>
                        </Tooltip>
                    </i>
                    <i :class="{ 'jointly-text': true, selected_bg: selectVertical === 'bottom' }"
                        @click="onSelectVertical(TextVerAlign.Bottom)">
                        <Tooltip :content="t('attr.align_bottom')" :offset="15">
                            <SvgIcon :icon="align_bottom_icon"/>
                        </Tooltip>
                    </i>
                </div>
            </div>
            <!-- 字体颜色 -->
            <div class="text-color" v-if="!colorIsMulti && !mixed && textColor" style="margin-bottom: 6px;">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;width: 58px">{{ t('attr.font_color') }}
                </div>
                <div class="color">
                    <ColorPicker :color="textColor!" :context="props.context" :auto_to_right_line="true"
                        :locat="{ index: 0, type: 'text' }" :fill-type="fillType"
                        :gradient="gradient instanceof Gradient ? gradient : undefined"
                        @gradient-type="(type, fillType) => togger_gradient_type(type, fillType)"
                        @change="c => getColorFromPicker(c, 'color')"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(c, index)"
                        @gradient-add-stop="(p, c, id) => gradient_add_stop(p, c, id)"
                        @gradient-reverse="gradient_reverse" @gradient-rotate="gradient_rotate"
                        @gradient-stop-delete="(index) => gradient_stop_delete(index)">
                    </ColorPicker>
                    <input v-if="fillType !== FillType.Gradient" ref="sizeColor" class="sizeColor"
                        @focus="selectColorValue" :spellcheck="false"
                        :value="toHex(textColor!.red, textColor!.green, textColor!.blue, false)"
                        @change="(e) => onColorChange(e, 'color')" @click="(e) => click(e, is_font_color_select)"
                        @blur="is_font_color_select = false" />
                    <span class="sizeColor" style="line-height: 14px;" v-else-if="fillType === FillType.Gradient &&
            gradient">{{ t(`color.${gradient.gradientType}`) }}</span>
                    <input ref="alphaFill" class="alphaFill" @focus="selectAlphaValue" style="text-align: center;"
                        :value="(textColor!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'color')"
                        @click="(e) => click(e, is_font_alpha_select)" @blur="is_font_alpha_select = false" />
                </div>
                <!--                <div style="width: 28px;height: 28px;margin-left: 5px;"></div>-->
            </div>
            <div class="text-colors" v-else-if="colorIsMulti || mixed" style="margin-bottom: 6px;">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color')
                        }}
                    </div>
                    <div class="add" @click="setMixedTextColor">
                        <SvgIcon :icon="add_icon"/>
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!colorIsMulti && !mixed && !textColor" style="margin-bottom: 6px;">
                <div class="color-title">
                    <div class="nocheck" style="font-family: HarmonyOS Sans;font-size: 12px;width: 58px">{{
            t('attr.font_color')
        }}
                    </div>
                    <div class="add" @click="addTextColor">
                        <SvgIcon :icon="add_icon"/>
                    </div>
                </div>
            </div>
            <!-- 高亮颜色 -->
            <div class="highlight-color" v-if="!highlightIsMulti && highlight">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;width: 58px"
                    :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}</div>
                <div class="color">
                    <ColorPicker :color="highlight!" :context="props.context" :auto_to_right_line="true"
                        @change="c => getColorFromPicker(c, 'highlight')">
                    </ColorPicker>
                    <input ref="higlightColor" class="colorFill" @focus="selectHiglightColor" :spellcheck="false"
                        :value="toHex(highlight!.red, highlight!.green, highlight!.blue, false)"
                        @change="(e) => onColorChange(e, 'highlight')" @click="(e) => click(e, is_higligh_color_select)"
                        @blur="is_higligh_color_select = false" />
                    <input ref="higlighAlpha" class="alphaFill" @focus="selectHiglighAlpha" style="text-align: center;"
                        :value="(highlight!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'highlight')"
                        @click="(e) => click(e, is_higligh_alpha_select)" @blur="is_higligh_alpha_select = false" />
                </div>
                <div class="perch" @click="deleteHighlight">
                    <SvgIcon class="svg" :icon="delete"/>
                </div>
            </div>
            <div class="text-colors" v-else-if="highlightIsMulti">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}</div>
                    <div class="add" @click="addHighlight">
                        <SvgIcon :icon="add_icon"/>
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!highlightIsMulti && !highlight" @click="addHighlight">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}</div>
                    <div class="color_border"></div>
                    <div class="add" @click="addHighlight">
                        <SvgIcon :icon="add_icon"/>
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
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: -11px;
        margin-left: -12px;
        border-radius: var(--default-radius);

        >img {
            width: 16px;
            height: 16px;
        }
    }

    .trigger:hover {
        background-color: #F5F5F5;
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

            img {
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
                padding: 9px 12px;
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
            margin-bottom: 6px;

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

                //input {
                //    outline: none;
                //    border: none;
                //    width: 72px;
                //    background-color: transparent;
                //    margin-left: 3px;
                //}

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
            margin-left: 5px;
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

    >img {
        width: 12px;
        height: 12px;
    }
}

:deep(.el-tooltip__trigger:focus) {
    outline: none !important;
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
