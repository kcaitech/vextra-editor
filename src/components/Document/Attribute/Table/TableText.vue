<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from '../Text/SelectFont.vue';
import { onMounted, ref, onUnmounted, watchEffect, watch, nextTick } from 'vue';
import { Context } from '@/context';
import { AttrGetter, TableShape, TableCell, Text } from "@kcdesign/data";
import Tooltip from '@/components/common/Tooltip.vue';
import { TextVerAlign, TextHorAlign, Color, UnderlineType, StrikethroughType } from "@kcdesign/data";
import ColorPicker from '@/components/common/ColorPicker/index.vue';
import { Reg_HEX } from "@/utils/RegExp";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { message } from "@/utils/message";
import TableTextSetting from './TableTextSetting.vue';
import { TableSelection } from '@/context/tableselection';
interface Props {
    context: Context
    shape: TableShape
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
const shape = ref<TableCell & { text: Text; }>()
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

const onShowSize = () => {
    props.context.workspace.focusText()
    if (showSize.value) return showSize.value = false
    showSize.value = true;
    nextTick(() => {
        if (sizeList.value) {
            const body_h = document.body.clientHeight;
            const { y, height } = sizeList.value.getBoundingClientRect();
            const su = body_h - y;
            const cur_t = su - height;
            if (cur_t - 10 < 0) {
                sizeList.value.style.top = cur_t + 20 + 'px';
            }
        }
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
const changeTextSize = (size: number) => {
    fonstSize.value = size
    showSize.value = false;
    if (shape.value) {
        const editor = props.context.editor4TextShape(shape.value)
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
        if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
            return false;
        } else {
            return true;
        }
    }
}

//输入框设置字体大小
const setTextSize = () => {
    fonstSize.value = fonstSize.value.trim()
    if (fonstSize.value.length < 1) {
        fonstSize.value = 1
    }
    if (!isNaN(Number(fonstSize.value)) && Number(fonstSize.value > 0)) {
        changeTextSize(fonstSize.value);
        textFormat();
    } else {
        textFormat();
    }
}

const shapeWatch = watch(() => props.shape, (value, old) => {
    old.unwatch(textFormat);
    value.watch(textFormat);
})

// 获取当前文字格式
const textFormat = () => {
    const table = props.context.tableSelection;
    if (table.editingCell) {
        shape.value = table.editingCell?.cell as TableCell & { text: Text; };
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
        if (format.italicIsMulti) isTilt.value = false;
        if (format.boldIsMulti) isBold.value = false;
        if (format.fontNameIsMulti) fontName.value = `${t('attr.more_value')}`;
        if (format.fontSizeIsMulti) fonstSize.value = `${t('attr.more_value')}`;
        if (format.underlineIsMulti) isUnderline.value = false;
        if (format.strikethroughIsMulti) isDeleteline.value = false;
        props.context.workspace.focusText();
    } else {
        let cells: (TableCell | undefined)[] = []
        if (table.tableRowStart < 0 || table.tableColStart < 0) {
            cells = props.shape.childs || [];
        } else {
            cells = table.getSelectedCells(true).map(item => item.cell) || [];
        }
        shape.value = undefined
        const formats: any[] = [];
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell && cell.text) {
                const editor = props.context.editor4TextShape(cell as any);
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
                        const { alpha: alpha1, blue: blue1, green: green1, red: red1 } = formats[i][key];
                        const { alpha: alpha2, blue: blue2, green: green2, red: red2 } = referenceValue;
                        if (alpha1 !== alpha2 || blue1 !== blue2 || green1 !== green2 || red1 !== red2) {
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
        if (format.fontName === 'unlikeness') fontName.value = `${t('attr.more_value')}`;
        if (format.fontSize === 'unlikeness') fonstSize.value = `${t('attr.more_value')}`;
        if (format.alignment === 'unlikeness') selectLevel.value = '';
        if (format.verAlign === 'unlikeness') selectVertical.value = '';
        if (format.color === 'unlikeness') colorIsMulti.value = true;
        if (format.highlight === 'unlikeness') highlightIsMulti.value = true;
        if (format.bold === 'unlikeness') isBold.value = false;
        if (format.italic === 'unlikeness') isTilt.value = false;
        if (format.underline === 'unlikeness') isUnderline.value = false;
        if (format.strikethrough === 'unlikeness') isDeleteline.value = false;
        if (format.colorIsMulti === 'unlikeness') colorIsMulti.value = true;
        if (format.highlightIsMulti === 'unlikeness') highlightIsMulti.value = true;
    }
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
    } else if (t === WorkSpace.UNDER_LINE) {
        onBold();
        onUnderlint();
    } else if (t === WorkSpace.DELETE_LINE) {
        onDeleteline();
    } else if (t === WorkSpace.ITALIC) {
        onTilt();
    } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
        textFormat();
    }
}
function table_selection_watcher(t: number) {
    if (t === TableSelection.CHANGE_EDITING_CELL || TableSelection.CHANGE_TABLE_CELL) textFormat();
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
            message('danger', t('system.illegal_input'));
            if (type === 'color') {
                return (e.target as HTMLInputElement).value = (textColor.value!.alpha * 100) + '%'
            } else {
                return (e.target as HTMLInputElement).value = (highlight.value!.alpha * 100) + '%'
            }
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
            message('danger', t('system.illegal_input'));
            if (type === 'color') {
                return (e.target as HTMLInputElement).value = (textColor.value!.alpha * 100) + '%'
            } else {
                return (e.target as HTMLInputElement).value = (highlight.value!.alpha * 100) + '%'
            }
        }
    } else {
        message('danger', t('system.illegal_input'));
        if (type === 'color') {
            return (e.target as HTMLInputElement).value = (textColor.value!.alpha * 100) + '%'
        } else {
            return (e.target as HTMLInputElement).value = (highlight.value!.alpha * 100) + '%'
        }
    }
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
    console.log(shape.value, 'shape.value');

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
        console.log(11);

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
const selectSizeValue = () => {
    textSize.value && textSize.value.select();
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
watchEffect(() => {
    textFormat();
})
onMounted(() => {
    props.shape.watch(textFormat);
    props.context.selection.watch(selection_wather);
    props.context.workspace.watch(workspace_wather);
    props.context.tableSelection.watch(table_selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
    props.context.workspace.unwatch(workspace_wather);
    props.shape.unwatch(textFormat);
    props.context.tableSelection.unwatch(table_selection_watcher);
    shapeWatch();
})
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24" :active="true">
            <template #tool>
                <TableTextSetting :context="props.context" :textShape="props.shape"></TableTextSetting>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text" style="padding-right: 0;" @click="onShowFont">
                    <span>{{ fontName }}</span>
                    <div class="down">
                        <svg-icon icon-class="down"></svg-icon>
                    </div>
                </div>
                <SelectFont v-if="showFont" @set-font="setFont" :fontName="fontName" :context="props.context"></SelectFont>
<!--                <div class="perch"></div>-->
            </div>
            <div class="text-middle">
                <div class="text-middle-size">
                    <div class="text-size jointly-text" style="padding-right: 0;">
                        <div class="size_input">
                            <input type="text" v-model="fonstSize" ref="textSize" class="input" @change="setTextSize"
                                @focus="selectSizeValue">
                            <div class="down" @click="onShowSize">
                                <svg-icon icon-class="down"></svg-icon>
                            </div>
                        </div>
                        <div class="font-size-list" ref="sizeList" v-if="showSize">
                            <div @click="changeTextSize(10)">10</div>
                            <div @click="changeTextSize(12)">12</div>
                            <div @click="changeTextSize(14)">14</div>
                            <div @click="changeTextSize(16)">16</div>
                            <div @click="changeTextSize(18)">18</div>
                            <div @click="changeTextSize(24)">24</div>
                            <div @click="changeTextSize(36)">36</div>
                            <div @click="changeTextSize(48)">48</div>
                            <div @click="changeTextSize(64)">64</div>
                        </div>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isBold }" @click="onBold">
                        <Tooltip :content="`${t('attr.bold')} &nbsp;&nbsp; Ctrl B`" :offset="15">
                            <svg-icon icon-class="text-bold"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isTilt }" @click="onTilt">
                        <Tooltip :content="`${t('attr.tilt')} &nbsp;&nbsp; Ctrl I`" :offset="15">
                            <svg-icon icon-class="text-tilt"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isUnderline }" @click="onUnderlint">
                        <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl U`" :offset="15">
                            <svg-icon icon-class="text-underline"></svg-icon>
                        </Tooltip>
                    </div>
                    <div class="overbold jointly-text" :class="{ selected_bgc: isDeleteline }" @click="onDeleteline">
                        <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl Shift X`" :offset="15">
                            <svg-icon icon-class="text-deleteline"></svg-icon>
                        </Tooltip>
                    </div>
                </div>
<!--                <div class="perch"></div>-->
            </div>
            <div class="text-bottom">
                <div class="text-bottom-align">
                    <div class="level-aligning jointly-text">
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectLevel === 'left' }"
                            @click="onSelectLevel(TextHorAlign.Left)">
                            <Tooltip :content="t('attr.align_left')" :offset="15">
                                <svg-icon icon-class="text-left"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectLevel === 'centered' }"
                            @click="onSelectLevel(TextHorAlign.Centered)">
                            <Tooltip :content="t('attr.align_center')" :offset="15">
                                <svg-icon icon-class="text-center"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectLevel === 'right' }"
                            @click="onSelectLevel(TextHorAlign.Right)">
                            <Tooltip :content="t('attr.align_right')" :offset="15">
                                <svg-icon icon-class="text-right"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectLevel === 'natural' }"
                            @click="onSelectLevel(TextHorAlign.Natural)">
                            <Tooltip :content="t('attr.align_the_sides')" :offset="15">
                                <svg-icon icon-class="text-justify"></svg-icon>
                            </Tooltip>
                        </i>
                    </div>
                    <div class="vertical-aligning jointly-text">
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectVertical === 'top' }"
                            @click="onSelectVertical(TextVerAlign.Top)">
                            <Tooltip :content="t('attr.align_top')" :offset="15">
                                <svg-icon icon-class="align-top"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectVertical === 'middle' }"
                            @click="onSelectVertical(TextVerAlign.Middle)">
                            <Tooltip :content="t('attr.align_middle')" :offset="15">
                                <svg-icon icon-class="align-middle"></svg-icon>
                            </Tooltip>
                        </i>
                        <i :class="{'jointly-text': true,'font-posi': true, selected_bg: selectVertical === 'bottom' }"
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
            <div class="text-color" v-if="!colorIsMulti && textColor" style="margin-bottom: 10px;">
                <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color') }}</div>
                <div class="color">
                    <ColorPicker :color="textColor!" :context="props.context" :auto_to_right_line="true"
                        @change="c => getColorFromPicker(c, 'color')">
                    </ColorPicker>
                    <input ref="sizeColor" class="sizeColor" @focus="selectColorValue" :spellcheck="false"
                        :value="toHex(textColor!.red, textColor!.green, textColor!.blue)"
                        @change="(e) => onColorChange(e, 'color')" />
                    <input ref="alphaFill" class="alphaFill" @focus="selectAlphaValue" style="text-align: center;"
                        :value="(textColor!.alpha * 100) + '%'" @change="(e) => onAlphaChange(e, 'color')" />
                </div>
<!--                <div class="perch"></div>-->
            </div>
            <div class="text-colors" v-else-if="colorIsMulti" style="margin-bottom: 10px;">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color') }}</div>
                    <div class="add" @click="addTextColor">
                        <svg-icon icon-class="add"></svg-icon>
                    </div>
                </div>
                <div class="color-text">{{ t('attr.multiple_colors') }}</div>
            </div>
            <div class="text-colors" v-else-if="!colorIsMulti && !textColor" style="margin-bottom: 10px;">
                <div class="color-title">
                    <div style="font-family: HarmonyOS Sans;font-size: 12px;margin-right: 10px;">{{ t('attr.font_color') }}</div>
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
            <div class="text-colors" v-else-if="!highlightIsMulti && !highlight">
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
                        width: 12px;
                        height: 12px;

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
                    top: 30px;
                    left: 0px;
                    width: 90px;
                    height: 225px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
                    padding: 10px 0;
                    z-index: 100;

                    >div {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 0 10px;
                        height: 25px;
                        box-sizing: border-box;

                        &:hover {
                            background-color: var(--input-background);
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

            .color {
                background-color: var(--input-background);
                width: 166px;
                height: 32px;
                padding: 8px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .sizeColor {
                    outline: none;
                    border: none;
                    width: 88px;
                    background-color: transparent;
                    margin-left: 8px;
                    font-size: 12px;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    width: 30px;
                    background-color: transparent;
                    font-size: 12px;
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

            .color {
                background-color: var(--input-background);
                width: 130px;
                height: 32px;
                padding: 8px;
                border-radius: var(--default-radius);
                box-sizing: border-box;
                display: flex;
                align-items: center;

                .colorFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 85px;
                    height: 14px;
                    margin-left: 8px;
                    flex: 1;
                    font-size: 12px;
                }

                .alphaFill {
                    outline: none;
                    border: none;
                    background-color: transparent;
                    width: 30px;
                    text-align: center;
                    margin-left: -28px;
                    font-size: 12px;
                }

                input + input {
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
            margin-left: 8px;
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
}</style>
