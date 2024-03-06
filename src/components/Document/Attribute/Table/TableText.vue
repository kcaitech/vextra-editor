<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from '../Text/SelectFont.vue';
import { onMounted, ref, onUnmounted, watchEffect, watch, nextTick } from 'vue';
import { Context } from '@/context';
import { AttrGetter, TableView, TableCell, Text, TableCellView, TextShapeView, FillType, Gradient, GradientType, cloneGradient, BasicArray, Stop, Matrix, gradient_equals, TableCellType } from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color, UnderlineType, StrikethroughType } from "@kcdesign/data";
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Reg_HEX } from "@/utils/RegExp";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { message } from "@/utils/message";
import TableTextSetting from './TableTextSetting.vue';
import { TableSelection } from '@/context/tableselection';
import { getGradient } from '../../Selection/Controller/ColorEdit/gradient_utils';
import { throttle } from 'lodash';
interface Props {
    context: Context
    shape: TableView
}

const props = defineProps<Props>();
const { t } = useI18n();
const fonstSize = ref<any>(14)
const showSize = ref(false)
const sizeList = ref<HTMLDivElement>()
const showFont = ref(false)
const isBold = ref(false)
const isTilt = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)
const selectLevel = ref('left')
const selectVertical = ref('top')
const fontName = ref()
const colorIsMulti = ref(false)
const highlightIsMulti = ref(false)
const alphaFill = ref<HTMLInputElement>();
const sizeColor = ref<HTMLInputElement>()
const textColor = ref<Color>()
const highlight = ref<Color>()
const textSize = ref<HTMLInputElement>()
const higlightColor = ref<HTMLInputElement>()
const higlighAlpha = ref<HTMLInputElement>()
const shape = ref<TableCellView>()
const table = ref<TableCellView>()
const sizeHoverIndex = ref(-1);
const fillType = ref<FillType>(FillType.SolidColor);
const gradient = ref<Gradient>();
const mixed = ref<boolean>(false);
// const selection = ref(props.context.selection) 

function toHex(r: number, g: number, b: number) {
    const hex = (n: number) => n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    return '#' + hex(r) + hex(g) + hex(b);
}

const onShowFont = () => {
    props.context.workspace.focusText()
    if (showFont.value) return showFont.value = false
    showFont.value = true
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
// 设置加粗
const onBold = () => {
    isBold.value = !isBold.value
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextBold(isBold.value, 0, Infinity)
        } else {
            editor.setTextBold(isBold.value, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextBold(isBold.value);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextBold(isBold.value, cell_selection);
        }
    }
    textFormat();
}
// 设置文本倾斜
const onTilt = () => {
    isTilt.value = !isTilt.value
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextItalic(isTilt.value, 0, Infinity)
        } else {
            editor.setTextItalic(isTilt.value, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextItalic(isTilt.value);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextItalic(isTilt.value, cell_selection);
        }
    }
    textFormat();
}
//设置下划线
const onUnderlint = () => {
    isUnderline.value = !isUnderline.value
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextUnderline(isUnderline.value, 0, Infinity)
        } else {
            editor.setTextUnderline(isUnderline.value, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextUnderline(isUnderline.value);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextUnderline(isUnderline.value, cell_selection);
        }
    }
    textFormat();
}
// 设置删除线
const onDeleteline = () => {
    isDeleteline.value = !isDeleteline.value
    if (shape.value) {
        const { textIndex, selectLength } = getTextIndexAndLen()
        const editor = props.context.editor4TextShape(shape.value)
        if (isSelectText()) {
            editor.setTextStrikethrough(isDeleteline.value, 0, Infinity)
        } else {
            editor.setTextStrikethrough(isDeleteline.value, textIndex, selectLength)
        }
    } else {
        const table = props.shape;
        const table_Selection = props.context.tableSelection;
        const editor = props.context.editor4Table(table)
        if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
            editor.setTextStrikethrough(isDeleteline.value);
        } else {
            const cell_selection = cellSelect(table_Selection)
            editor.setTextStrikethrough(isDeleteline.value, cell_selection);
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

// 获取当前文字格式
const textFormat = () => {
    const table = props.context.tableSelection;
    shape.value = undefined;
    mixed.value = false;
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
        colorIsMulti.value = format.colorIsMulti;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        selectVertical.value = format.verAlign || 'top';
        fontName.value = format.fontName || 'PingFangSC-Regular';
        fonstSize.value = format.fontSize || 14;
        isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;
        isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
        textColor.value = format.color;
        highlight.value = format.highlight;
        isBold.value = format.bold || false;
        isTilt.value = format.italic || false;
        fillType.value = format.fillType || FillType.SolidColor;
        gradient.value = format.gradient;
        if (format.italicIsMulti) isTilt.value = false;
        if (format.boldIsMulti) isBold.value = false;
        if (format.fontNameIsMulti) fontName.value = `${t('attr.more_value')}`;
        if (format.fontSizeIsMulti) fonstSize.value = `${t('attr.more_value')}`;
        if (format.underlineIsMulti) isUnderline.value = false;
        if (format.strikethroughIsMulti) isDeleteline.value = false;
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
            if (cell && cell.cellType === TableCellType.Text && cell.text) {
                const editor = props.context.editor4TextShape(cell);
                const forma = (cell.text as Text).getTextFormat(0, Infinity, editor.getCachedSpanAttr());
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
        colorIsMulti.value = format.colorIsMulti;
        highlightIsMulti.value = format.highlightIsMulti;
        selectLevel.value = format.alignment || 'left';
        selectVertical.value = format.verAlign || 'top';
        fontName.value = format.fontName || 'PingFangSC-Regular';
        fonstSize.value = format.fontSize || 14;
        isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;  
        isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
        highlight.value = format.highlight;
        isBold.value = format.bold || false;
        isTilt.value = format.italic || false;
        textColor.value = format.color;
        fillType.value = format.fillType || FillType.SolidColor;
        gradient.value = format.gradient;
        if (format.fontName === 'unlikeness') {
            fontName.value = `${t('attr.more_value')}`;
        } else if (format.fontNameIsMulti) {
            fontName.value = `${t('attr.more_value')}`;
        }
        if (format.fontSize === 'unlikeness') {
            fonstSize.value = `${t('attr.more_value')}`;
        } else if (format.fontSizeIsMulti) {
            fonstSize.value = `${t('attr.more_value')}`;
        }
        if (format.alignment === 'unlikeness') selectLevel.value = '';
        if (format.verAlign === 'unlikeness') selectVertical.value = '';
        if (format.color === 'unlikeness' || format.fillType === 'unlikeness') colorIsMulti.value = true;
        if (format.highlight === 'unlikeness') highlightIsMulti.value = true;
        if (format.bold === 'unlikeness') isBold.value = false;
        if (format.italic === 'unlikeness') isTilt.value = false;
        if (format.underline === 'unlikeness') isUnderline.value = false;
        if (format.strikethrough === 'unlikeness') isDeleteline.value = false;
        if (format.colorIsMulti === 'unlikeness') colorIsMulti.value = true;
        if (format.highlightIsMulti === 'unlikeness') highlightIsMulti.value = true;
        if (format.fillType === 'unlikeness') mixed.value = true;
        if (format.fillTypeIsMulti === 'unlikeness') mixed.value = true;
        if (format.fillTypeIsMulti !== 'unlikeness' && format.fillType === FillType.Gradient && format.gradientIsMulti === 'unlikeness') mixed.value = true;
        if (format.gradient === 'unlikeness') gradient.value = undefined;
        if (format.fillType === FillType.Gradient && format.gradient === 'unlikeness') mixed.value = true;
        if (formats.length === 0) {
            getTableFormat();
        }
    }
}

const _textFormat = throttle(textFormat, 160, { leading: true })

const getTableFormat = () => {
    const textAttr = props.shape.data.textAttr;
    if (!textAttr) return;
    isBold.value = textAttr.bold || false;
    isTilt.value = textAttr.italic || false;
    fontName.value = textAttr.fontName || 'PingFangSC-Regular';
    fonstSize.value = textAttr.fontSize || 14;
    isUnderline.value = textAttr.underline && textAttr.underline !== UnderlineType.None || false;
    isDeleteline.value = textAttr.strikethrough && textAttr.strikethrough !== StrikethroughType.None || false;
    selectLevel.value = textAttr.alignment || 'left';
    selectVertical.value = textAttr.verAlign || 'top';
    textColor.value = textAttr.color || new Color(0.85, 0, 0, 0);
    highlight.value = textAttr.highlight;
    fillType.value = textAttr.fillType || FillType.SolidColor;
    gradient.value = textAttr.gradient;
}

function selection_wather(t: number) {
    if (t === Selection.CHANGE_TEXT) {
        textFormat();
    } else if (t === Selection.CHANGE_SHAPE) {
        textFormat();
    }
}
function workspace_wather(t: number) {
    if (t === WorkSpace.BOLD) {
      onBold();
    } else if (t === WorkSpace.UNDER_LINE) {
        onUnderlint();
    } else if (t === WorkSpace.DELETE_LINE) {
        onDeleteline();
    } else if (t === WorkSpace.ITALIC) {
        onTilt();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
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
            console.log(forma, 'forma');

            if (forma.gradient) {
                editor.setTextGradient(forma.gradient, cell_selection);
            }
        }
    }
    textFormat();
}

const togger_gradient_type = (type: GradientType | 'solid') => {
    const fillType = type === 'solid' ? FillType.SolidColor : FillType.Gradient;
    const g = type !== 'solid' && getGradient(gradient.value, type, textColor.value!);
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
        textSize.value.select();
    }
}
const selectColorValue = () => {
    sizeColor.value && sizeColor.value.select();
}
const selectAlphaValue = () => {
    alphaFill.value && alphaFill.value.select();
}
const selectHiglightColor = () => {
    higlightColor.value && higlightColor.value.select();
}
const selectHiglighAlpha = () => {
    higlighAlpha.value && higlighAlpha.value.select();
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
                <div class="select-font jointly-text" style="padding-right: 0;" @click="onShowFont">
                    <span>{{ fontName }}</span>
                    <div class="down">
                        <svg-icon icon-class="down" style="width: 12px;height: 12px"></svg-icon>
                    </div>
                </div>
                <SelectFont v-if="showFont" @set-font="setFont" :fontName="fontName" :context="props.context">
                </SelectFont>
            </div>
            <div class="text-middle">
                <div class="text-middle-size">
                    <div class="text-size jointly-text" style="padding-right: 0;">
                        <div class="size_input">
                            <input type="text" v-model="fonstSize" ref="textSize" class="input" @change="setTextSize"
                                @focus="selectSizeValue" @input="handleSize" @blur="setTextSize">
                            <div class="down" @click="onShowSize">
                                <svg-icon icon-class="down"></svg-icon>
                            </div>
                        </div>
                        <div class="font-size-list" ref="sizeList" :style="{ top: -4 - sizeSelectIndex * 32 + 'px' }"
                            v-if="showSize">
                            <div v-for="(item, i) in textSizes" :key="i" @click="selectTextSize(item)"
                                @mouseover="sizeHoverIndex = i" @mouseleave="sizeHoverIndex = -1">{{ item }}
                                <div class="icon">
                                    <svg-icon v-if="sizeSelectIndex === i"
                                        :icon-class="sizeHoverIndex === i ? 'white-select' : 'page-select'"></svg-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isBold }" @click="onBold">
                        <Tooltip :content="`${t('attr.bold')} &nbsp;&nbsp; Ctrl B`" :offset="15">
                            <svg-icon :icon-class="isBold ? 'text-white-bold' : 'text-bold'"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isTilt }" @click="onTilt">
                        <Tooltip :content="`${t('attr.tilt')} &nbsp;&nbsp; Ctrl I`" :offset="15">
                            <svg-icon :icon-class="isTilt ? 'text-white-tilt' : 'text-tilt'"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isUnderline }" @click="onUnderlint">
                        <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl U`" :offset="15">
                            <svg-icon :icon-class="isUnderline ? 'text-white-underline' : 'text-underline'"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isDeleteline }" @click="onDeleteline">
                        <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl Shift X`" :offset="15">
                            <svg-icon
                                :icon-class="isDeleteline ? 'text-white-deleteline' : 'text-deleteline'"></svg-icon>
                        </Tooltip>
                    </div>
                </div>
                <!--                <div class="perch"></div>-->
            </div>
            <div class="text-bottom">
                <div class="text-bottom-align">
                    <div class="level-aligning jointly-text">
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectLevel === 'left' }"
                            @click="onSelectLevel(TextHorAlign.Left)">
                            <Tooltip :content="t('attr.align_left')" :offset="15">
                                <svg-icon icon-class="text-left"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectLevel === 'centered' }"
                            @click="onSelectLevel(TextHorAlign.Centered)">
                            <Tooltip :content="t('attr.align_center')" :offset="15">
                                <svg-icon icon-class="text-center"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectLevel === 'right' }"
                            @click="onSelectLevel(TextHorAlign.Right)">
                            <Tooltip :content="t('attr.align_right')" :offset="15">
                                <svg-icon icon-class="text-right"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectLevel === 'natural' }"
                            @click="onSelectLevel(TextHorAlign.Natural)">
                            <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                                <svg-icon icon-class="text-justify"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                    <div class="vertical-aligning jointly-text">
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
                </div>
                <!--                <div class="perch"></div>-->
            </div>
            <!-- 字体颜色 -->
            <div class="text-color" v-if="!colorIsMulti && !mixed && textColor" style="margin-bottom: 10px;">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color') }}
                </div>
                <div class="color">
                    <ColorPicker :color="textColor!" :context="props.context" :auto_to_right_line="true"
                        :locat="{ index: 0, type: 'table_text' }" :fill-type="fillType"
                        :gradient="gradient instanceof Gradient ? gradient : undefined"
                        @gradient-type="(type) => togger_gradient_type(type)"
                        @change="c => getColorFromPicker(c, 'color')"
                        @gradient-color-change="(c, index) => gradient_stop_color_change(c, index)"
                        @gradient-add-stop="(p, c, id) => gradient_add_stop(p, c, id)"
                        @gradient-reverse="gradient_reverse" @gradient-rotate="gradient_rotate"
                        @gradient-stop-delete="(index) => gradient_stop_delete(index)">
                    </ColorPicker>
                    <input v-if="fillType !== FillType.Gradient" ref="sizeColor" class="sizeColor"
                        @focus="selectColorValue" :spellcheck="false"
                        :value="toHex(textColor!.red, textColor!.green, textColor!.blue)"
                        @change="(e) => onColorChange(e, 'color')" />
                    <span class="sizeColor" style="line-height: 14px;" v-else-if="fillType === FillType.Gradient &&
            gradient">{{ t(`color.${gradient.gradientType}`) }}</span>
                    <input ref="alphaFill" class="alphaFill" @focus="selectAlphaValue" style="text-align: center;"
                        :value="(textColor!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'color')" />
                </div>
                <div style="width: 28px;height: 28px;margin-left: 5px;"></div>
            </div>
            <div class="text-colors" v-else-if="colorIsMulti || mixed" style="margin-bottom: 10px;">
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
            <div class="text-colors" v-else-if="!colorIsMulti && !mixed && !textColor" style="margin-bottom: 10px;">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color')
                        }}
                    </div>
                    <div class="add" @click="addTextColor">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
            </div>
            <!-- 高亮颜色 -->
            <div class="highlight-color" v-if="!highlightIsMulti && highlight">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                    :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}</div>
                <div class="color">
                    <ColorPicker :color="highlight!" :context="props.context" :auto_to_right_line="true"
                        @change="c => getColorFromPicker(c, 'highlight')">
                    </ColorPicker>
                    <input ref="higlightColor" class="colorFill" @focus="selectHiglightColor" :spellcheck="false"
                        :value="toHex(highlight!.red, highlight!.green, highlight!.blue)"
                        @change="(e) => onColorChange(e, 'highlight')" />
                    <input ref="higlighAlpha" class="alphaFill" @focus="selectHiglighAlpha" style="text-align: center;"
                        :value="(highlight!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'highlight')" />
                </div>
                <div class="perch" @click="deleteHighlight">
                    <svg-icon class="svg" icon-class="delete"></svg-icon>
                </div>
            </div>
            <div class="text-colors" v-else-if="highlightIsMulti">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;"
                        :class="{ 'check': highlight, 'nocheck': !highlight }">{{ t('attr.highlight_color') }}</div>
                    <div class="add" @click="addHighlight">
                        <svg-icon icon-class="add"></svg-icon>
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
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 18px 8px;
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

        >svg {
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

            svg {
                width: 16px;
                height: 16px;
                overflow: visible !important;
            }
        }

        .text-top {
            position: relative;
            margin-bottom: 10px;
            display: flex;

            .select-font {
                flex: 1;
                padding: 9px 12px;
                box-sizing: border-box;
                width: 224px;
                height: 32px;
                border-radius: 6px;
            }

            .select-font:hover {
                background: #EBEBEB;
            }
        }

        .text-middle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;

            .text-middle-size {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }

            .text-size {
                position: relative;
                width: 62px;
                height: 32px;
                border-radius: 6px;
                padding: 9px 0;
                box-sizing: border-box;

                .size_input {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-left: 12px;
                    padding-right: 6px;

                    .down {
                        width: 19px;
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
                    width: 24px;
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

            .overbold {
                width: 32px;
                display: flex;
                justify-content: center;
                margin-left: 8px;
            }

            .overbold:hover {
                background-color: #EBEBEB;
            }
        }

        .text-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;

            .text-bottom-align {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
            }

            .level-aligning {
                width: 124px;
                height: 32px;
                padding: 2px;
                box-sizing: border-box;
                border-radius: var(--default-radius);
            }

            .vertical-aligning {
                width: 94px;
                height: 32px;
                padding: 2px;
                box-sizing: border-box;
                margin-left: 6px;
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
                margin-bottom: 5px;

                .add {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--default-radius);

                    >svg {
                        width: 16px;
                        height: 16px;
                    }

                    transition: .2s;
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
</style>
