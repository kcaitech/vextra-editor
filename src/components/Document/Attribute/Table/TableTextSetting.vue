/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextTransformType, TableView, TableCell, TableCellView, TableCellType, UnderlineType, StrikethroughType } from "@kcdesign/data";
import { Selection } from '@/context/selection';
import { TableSelection } from '@/context/tableselection';
import { WorkSpace } from '@/context/workspace';
const { t } = useI18n();
interface Props {
  context: Context,
  textShape: TableView
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref()
const row_height = ref(`${t('attr.auto')}`)
const paragraphSpace = ref()
const paraSpacing = ref<HTMLInputElement>()
const shape = shallowRef<TableCellView>()
// const selection = ref(props.context.selection)
const isActived1 = ref(false)
const isActived2 = ref(false)
const isActived3 = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)

//获取选中字体的长度和下标
const getTextIndexAndLen = () => {
  const selection = props.context.textSelection;
  const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
  const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
  return { textIndex, selectLength }
}

function showMenu() {
  popover.value.show();
  props.context.workspace.focusText()
}

const cellSelect = (table: TableSelection) => {
  return { rowStart: table.tableRowStart, rowEnd: table.tableRowEnd, colStart: table.tableColStart, colEnd: table.tableColEnd }
}

const onSelectCase = (icon: TextTransformType) => {
  selectCase.value = icon
  if (shape.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(shape.value)
    if (isSelectText()) {
      editor.setTextTransform(icon, 0, Infinity)
    } else {
      editor.setTextTransform(icon, textIndex, selectLength)
    }
  } else {
    const table = props.textShape;
    const table_Selection = props.context.tableSelection;
    const editor = props.context.editor4Table(table)
    if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
      editor.setTextTransform(icon);
    } else {
      const cell_selection = cellSelect(table_Selection)
      editor.setTextTransform(icon, cell_selection);
    }
  }
  props.context.workspace.focusText();
}

const setParagraphSpace = () => {
  paragraphSpace.value = paragraphSpace.value.trim()
  if (shape.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(shape.value)
    if (!isNaN(Number(paragraphSpace.value))) {
      if (isSelectText()) {
        editor.setParaSpacing(Number(paragraphSpace.value), 0, Infinity)
      } else {
        editor.setParaSpacing(Number(paragraphSpace.value), textIndex, selectLength)
      }
    } else {
      textFormat();
    }
  } else {
    if (!isNaN(Number(paragraphSpace.value))) {
      const table = props.textShape;
      const table_Selection = props.context.tableSelection;
      const editor = props.context.editor4Table(table)
      if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
        editor.setParaSpacing(Number(paragraphSpace.value));
      } else {
        const cell_selection = cellSelect(table_Selection)
        editor.setParaSpacing(Number(paragraphSpace.value), cell_selection);
      }
    } else {
      textFormat();
    }
  }
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
    const table = props.textShape;
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
    const table = props.textShape;
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

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
  if (shape.value) {
    const selection = props.context.textSelection;
    if ((selection.cursorEnd > 0) && (selection.cursorStart > 0)) {
      return false
    } else {
      return true
    }
  }
}

const selectParaSpacing = () => {
  isActived3.value = true
}

const is_select = ref(false);
function click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}

const shapeWatch = watch(() => props.textShape, (value, old) => {
  old.unwatch(textFormat);
  value.watch(textFormat);
})

const textFormat = () => {
  const table = props.context.tableSelection;
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
    paragraphSpace.value = format.paraSpacing || 0;
    selectCase.value = format.transform;
    isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;
    isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
    if (format.underlineIsMulti) isUnderline.value = false;
    if (format.strikethroughIsMulti) isDeleteline.value = false;
    if (format.paraSpacingIsMulti) paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.transformIsMulti) selectCase.value = '';
  } else {
    let cells: (TableCellView)[];
    if (table.tableRowStart < 0 || table.tableColStart < 0) {
      cells = props.textShape.childs as (TableCellView)[];
    } else {
      cells = table.getSelectedCells(true).reduce((cells, item) => { if (item.cell) cells.push(item.cell); return cells; }, [] as (TableCellView[]));
    }
    shape.value = undefined
    const formats: any[] = [];
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell && cell.cellType === TableCellType.Text && cell.text) {
        const editor = props.context.editor4TextShape(cell);
        const forma = cell.text.getTextFormat(0, Infinity, editor.getCachedSpanAttr());
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
          if (formats[i][key] !== referenceValue) {
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
    paragraphSpace.value = format.paraSpacing || 0;
    selectCase.value = format.transform;
    isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;
    isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
    if (format.strikethrough === 'unlikeness') isDeleteline.value = false;
    if (format.paraSpacingIsMulti === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacing === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.underline === 'unlikeness') isUnderline.value = false;
    if (format.transformIsMulti === 'unlikeness') selectCase.value = '';
    if (format.transform === 'unlikeness') selectCase.value = '';
    if (formats.length === 0) {
      getTableFormat();
    }
  }
}

const getTableFormat = () => {
  const textAttr = props.textShape.data.textAttr;
  if (!textAttr) return;
  paragraphSpace.value = textAttr.paraSpacing || 0;
  selectCase.value = textAttr.transform;
}
function selection_wather(t: any) {
  if (t === Selection.CHANGE_TEXT) {
    textFormat();
  } else if (t === Selection.CHANGE_SHAPE) {
    textFormat();
  }
}
function table_selection_watcher(t: any) {
  if (t === TableSelection.CHANGE_EDITING_CELL || TableSelection.CHANGE_TABLE_CELL) textFormat();
}

function blur2() {
  isActived1.value = false
  isActived2.value = false
  isActived3.value = false
  is_select.value = false;
}

function workspace_wather(t: number) {
  if (t === WorkSpace.UNDER_LINE) {
    onUnderlint();
  } else if (t === WorkSpace.DELETE_LINE) {
    onDeleteline();
  } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
    textFormat();
  } else if (t === WorkSpace.TABLE_TEXT_GRADIENT_UPDATE) {
    textFormat();
  }
}

onMounted(() => {
  textFormat();
  props.textShape.watch(textFormat);
  props.context.selection.watch(selection_wather);
  props.context.tableSelection.watch(table_selection_watcher);
  props.context.workspace.watch(workspace_wather);
})
onUnmounted(() => {
  props.context.selection.unwatch(selection_wather);
  props.textShape.unwatch(textFormat);
  props.context.tableSelection.unwatch(table_selection_watcher);
  props.context.workspace.unwatch(workspace_wather);
  shapeWatch();
})

import gear_icon from '@/assets/icons/svg/gear.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import text_no_list_icon from '@/assets/icons/svg/text-no-list.svg';
import text_underline_icon from '@/assets/icons/svg/text-underline.svg';
import text_deleteline_icon from '@/assets/icons/svg/text-deleteline.svg';
import text_uppercase_icon from '@/assets/icons/svg/text-uppercase.svg';
import text_lowercase_icon from '@/assets/icons/svg/text-lowercase.svg';
import text_titlecase_icon from '@/assets/icons/svg/text-titlecase.svg';
</script>

<template>
  <div class="text-detail-container" @click.stop @mousedown.stop>
    <Popover :context="props.context" class="popover" ref="popover" :width="232" :auto_to_right_line="true"
      :title="t('attr.text_advanced_settings')">
      <template #trigger>
        <div class="trigger" @click="showMenu">
          <Tooltip :content="t('attr.text_advanced_settings')" :offset="15">
            <SvgIcon :icon="gear_icon"/>
          </Tooltip>
        </div>
      </template>

      <template #body>
        <div class="options-container">
          <div>
            <span>{{ t('attr.paragraph_space') }}</span>
            <div :class="{ actived: isActived3 }"
              style="width: 98px;height: 32px;border-radius: 6px;box-sizing: border-box">
              <input type="text" ref="paraSpacing" @focus="selectParaSpacing" @blur="blur2" v-model="paragraphSpace"
                class="input" @change="setParagraphSpace" style="width: 100%;height: 100%" @click="click">
            </div>
          </div>
          <div>
            <span>{{ t('attr.underline') }}</span>
            <div class="underline jointly-text">
              <i :class="{ 'jointly-text': true, selected_bgc: !isUnderline }" @click="onUnderlint">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <SvgIcon :icon="text_no_list_icon"/>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, selected_bgc: isUnderline }" @click="onUnderlint">
                <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl U`" :offset="15">
                  <SvgIcon :icon="text_underline_icon"/>
                </Tooltip>
              </i>
            </div>
          </div>
          <div>
            <span>{{ t('attr.deleteline') }}</span>
            <div class="underline jointly-text">
              <i :class="{ 'jointly-text': true, selected_bgc: !isDeleteline }" @click="onDeleteline">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <SvgIcon :icon="text_no_list_icon"/>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, selected_bgc: isDeleteline }" @click="onDeleteline">
                <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl Shift X`" :offset="15">
                  <SvgIcon :icon="text_deleteline_icon"/>
                </Tooltip>
              </i>
            </div>
          </div>
          <div>
            <span>{{ t('attr.letter_case') }}</span>
            <div class="level-aligning jointly-text">
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bgc: selectCase === 'none' }"
                @click="onSelectCase(TextTransformType.None)">
                <Tooltip :content="t('attr.as_typed')" :offset="15">
                    <SvgIcon :icon="text_no_list_icon"/>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bgc: selectCase === 'uppercase' }"
                @click="onSelectCase(TextTransformType.Uppercase)">
                <Tooltip :content="t('attr.uppercase')" :offset="15">
                  <SvgIcon :icon="text_uppercase_icon" style="width: 17px;height: 14px"/>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bgc: selectCase === 'lowercase' }"
                @click="onSelectCase(TextTransformType.Lowercase)">
                <Tooltip :content="t('attr.lowercase')" :offset="15">
                  <SvgIcon :icon="text_lowercase_icon" style="width: 14px;height: 14px"/>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bgc: selectCase === 'uppercase-first' }"
                @click="onSelectCase(TextTransformType.UppercaseFirst)">
                <Tooltip :content="t('attr.titlecase')" :offset="15">
                  <SvgIcon :icon="text_titlecase_icon" style="width: 15px;height: 14px"/>
                </Tooltip>
              </i>
            </div>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.text-detail-container {

  >.popover {
    width: 18px;
    height: 22px;

    .trigger {
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: -11px;
      margin-left: -10px;
      border-radius: var(--default-radius);

      >svg {
        width: 16px;
        height: 16px;
      }
    }

    .trigger:hover {
      background-color: #F5F5F5;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px 12px 0 12px;
      box-sizing: border-box;
      height: 100%;

      >div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 12px;

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
          }
        }

        >span {
          color: #737373;
          width: 60px;
          height: 14px;
          font-size: var(--font-default-fontsize);
        }
        .underline {
          display: flex;
          width: 98px;
          padding: 2px;
          box-sizing: border-box;

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
          padding: 0 5px;
        }

        .level-aligning {
          padding: 2px;
          box-sizing: border-box;
        }

        .font-posi {
          width: 30px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          border: 1px solid #F4F5F5;
        }

        .selected_bgc {
          background-color: #FFFFFF !important;
          color: #000000;
          border: 1px solid #F0F0F0;
        }

        input[type="text"]::-webkit-inner-spin-button,
        input[type="text"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="text"] {
          -moz-appearance: textfield;
          appearance: textfield;
          font-size: 13px;
          width: 98px;
          border: none;
          background-color: var(--input-background);
          height: 32px;
          border-radius: var(--default-radius);
          padding: 9px 0 9px 12px;
          box-sizing: border-box;
          font-weight: 500;
          line-height: 14px;
          color: #000000;
        }

        input:focus {
          outline: none;
        }

        input::selection {
          color: #FFFFFF;
          background: #1878F5;
        }

        input::-moz-selection {
          color: #FFFFFF;
          background: #1878F5;
        }

        .actived {
          border: 1px solid #1878F5;
        }
      }
    }
  }
}

:deep(.el-tooltip__trigger:focus) {
  outline: none !important;
}
</style>