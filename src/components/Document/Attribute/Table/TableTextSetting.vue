<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextTransformType, TableShape, TableCell } from "@kcdesign/data";
import { Selection } from '@/context/selection';
import { TableSelection } from '@/context/tableselection';
const { t } = useI18n();
interface Props {
  context: Context,
  textShape: TableShape
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref()
const wordSpace = ref()
const rowHeight = ref()
const row_height = ref(`${t('attr.auto')}`)
const paragraphSpace = ref()
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const paraSpacing = ref<HTMLInputElement>()
const shape = ref<TableCell & { text: Text; }>()
// const selection = ref(props.context.selection)

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

const setRowHeight = () => {
  rowHeight.value = rowHeight.value.trim()
  if (rowHeight.value.length < 1) {
    rowHeight.value = 1
  }
  if (shape.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(shape.value)
    if (!isNaN(Number(rowHeight.value))) {
      if (isSelectText()) {
        editor.setLineHeight(Number(rowHeight.value), 0, Infinity)
      } else {
        editor.setLineHeight(Number(rowHeight.value), textIndex, selectLength)
      }
    } else {
      textFormat();
    }
  } else {
    if (!isNaN(Number(rowHeight.value))) {
      const table = props.textShape;
      const table_Selection = props.context.tableSelection;
      const editor = props.context.editor4Table(table)
      if (table_Selection.tableRowStart < 0 || table_Selection.tableColStart < 0) {
        editor.setLineHeight(Number(rowHeight.value));
      } else {
        const cell_selection = cellSelect(table_Selection)
        editor.setLineHeight(Number(rowHeight.value), cell_selection);
      }
    } else {
      textFormat();
    }
  }
}

const setWordSpace = () => {
  wordSpace.value = wordSpace.value.trim()
  if (wordSpace.value.length < 1) { wordSpace.value = 0 }
  if (shape.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(shape.value)
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
      const table = props.textShape;
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

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
  if (shape.value) {
    const selection = props.context.textSelection;
    if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
      return false
    } else {
      return true
    }
  }
}

const selectCharSpacing = () => {
  charSpacing.value && charSpacing.value.select()
}
const selectLineHeight = () => {
  lineHeight.value && lineHeight.value.select()
}
const selectParaSpacing = () => {
  paraSpacing.value && paraSpacing.value.select()
}

const shapeWatch = watch(() => props.textShape, (value, old) => {
  old.unwatch(textFormat);
  value.watch(textFormat);
})

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
    wordSpace.value = format.kerning || 0;
    rowHeight.value = format.minimumLineHeight || '';
    paragraphSpace.value = format.paraSpacing || 0;
    selectCase.value = format.transform;
    if (format.minimumLineHeightIsMulti) rowHeight.value = `${t('attr.more_value')}`;
    if (format.kerningIsMulti) wordSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacingIsMulti) paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.transformIsMulti) selectCase.value = '';
  } else {
    let cells: (TableCell | undefined)[] = []
    if (table.tableRowStart < 0 || table.tableColStart < 0) {
      cells = props.textShape.childs || [];
    } else {
      cells = table.getSelectedCells(true).map(item => item.cell) || [];
    }
    shape.value = undefined
    const formats: any[] = [];
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell && cell.text) {
        const editor = props.context.editor4TextShape(cell as any);
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
    wordSpace.value = format.kerning || 0;
    rowHeight.value = format.minimumLineHeight || ''
    paragraphSpace.value = format.paraSpacing || 0;
    selectCase.value = format.transform;
    if (format.minimumLineHeight === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
    if (format.minimumLineHeightIsMulti === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
    if (format.kerningIsMulti === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
    if (format.wordSpace === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacingIsMulti === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacing === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.transformIsMulti === 'unlikeness') selectCase.value = '';
    if (format.transform === 'unlikeness') selectCase.value = '';
  }
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

onMounted(() => {
  textFormat();
  props.textShape.watch(textFormat);
  props.context.selection.watch(selection_wather);
  props.context.tableSelection.watch(table_selection_watcher);
})
onUnmounted(() => {
  props.context.selection.unwatch(selection_wather);
  props.textShape.unwatch(textFormat);
  props.context.tableSelection.unwatch(table_selection_watcher);
  shapeWatch();
})
</script>

<template>
  <div class="text-detail-container" @click.stop @mousedown.stop>
    <Popover :context="props.context" class="popover" ref="popover" :width="220" height="auto" :left="-450"
      :title="t('attr.text_advanced_settings')">
      <template #trigger>
        <div class="trigger">
          <Tooltip :content="t('attr.text_advanced_settings')" :offset="15">
            <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
          </Tooltip>
        </div>
      </template>
      <template #body>
        <div class="options-container">
          <div>
            <span>{{ t('attr.word_space') }}</span>
            <div><input type="text" ref="charSpacing" @focus="selectCharSpacing" v-model="wordSpace" class="input"
                @change="setWordSpace"></div>
          </div>
          <div>
            <span>{{ t('attr.row_height') }}</span>
            <div><input type="text" ref="lineHeight" @focus="selectLineHeight" v-model="rowHeight"
                :placeholder="row_height" class="input" @change="setRowHeight"></div>
          </div>
          <div>
            <span>{{ t('attr.paragraph_space') }}</span>
            <div><input type="text" ref="paraSpacing" @focus="selectParaSpacing" v-model="paragraphSpace" class="input"
                @change="setParagraphSpace"></div>
          </div>
          <div>
            <span>{{ t('attr.letter_case') }}</span>
            <div class="level-aligning jointly-text">
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectCase === 'none' }"
                @click="onSelectCase(TextTransformType.None)">
                <Tooltip :content="t('attr.as_typed')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectCase === 'uppercase' }"
                @click="onSelectCase(TextTransformType.Uppercase)">
                <Tooltip :content="t('attr.uppercase')" :offset="15">
                  <svg-icon icon-class="text-uppercase"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectCase === 'lowercase' }"
                @click="onSelectCase(TextTransformType.Lowercase)">
                <Tooltip :content="t('attr.lowercase')" :offset="15">
                  <svg-icon icon-class="text-lowercase"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectCase === 'uppercase-first' }"
                @click="onSelectCase(TextTransformType.UppercaseFirst)">
                <Tooltip :content="t('attr.titlecase')" :offset="15">
                  <svg-icon icon-class="text-titlecase"></svg-icon>
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
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      >svg {
        width: 11px;
        height: 11px;
        transition: 0.5s;
      }

      >svg:hover {
        transform: rotate(90deg);
      }
    }

    .options-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--default-padding);
      box-sizing: border-box;
      height: 100%;

      >div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin: 4px 0;

        .jointly-text {
          height: 25px;
          border-radius: 4px;
          background-color: var(--input-background);
          display: flex;
          justify-content: space-between;
          align-items: center;

          >svg {
            width: 13px;
            height: 13px;
          }
        }

        >span {
          font-weight: bold;
          width: 40%;
        }

        .vertical-aligning {
          padding: 0 5px;
        }

        .level-aligning {
          padding: 0 5px;
        }

        .font-posi {
          width: 25px;
          height: 25px;
          display: flex;
          justify-content: center;
        }

        input[type="text"]::-webkit-inner-spin-button,
        input[type="text"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="text"] {
          -moz-appearance: textfield;
          appearance: textfield;
          font-size: 10px;
          width: 90px;
          border: none;
          background-color: var(--input-background);
          height: 20px;
          border-radius: 4px;
          padding: 0 10px;
        }

        input:focus {
          outline: none;
        }
      }

    }
  }

  .selected_bgc {
    background-color: var(--active-color) !important;
    color: #fff;
  }

}

:deep(.el-tooltip__trigger:focus) {
  outline: none !important;
}
</style>