<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextShape, TextTransformType, TextBehaviour, Shape, BulletNumbersType } from "@kcdesign/data";
import { Selection } from '@/context/selection';
const { t } = useI18n();
interface Props {
  context: Context,
  textShape: TextShape,
  textShapes: TextShape[]
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref()
const selectText = ref('autowidth')
const selectId = ref()
const wordSpace = ref()
const rowHeight = ref()
const row_height = ref(`${t('attr.auto')}`)
const paragraphSpace = ref()
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const paraSpacing = ref<HTMLInputElement>()
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
const length = computed(() => {
  return props.textShapes.length === 1;
})

const onSelectId = (icon: BulletNumbersType) => {
  selectId.value = icon;
  const editor = props.context.editor4TextShape(props.textShape)
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    if (isSelectText()) {
      editor.setTextBulletNumbers(icon, 0, Infinity)
    } else {
      editor.setTextBulletNumbers(icon, textIndex, selectLength)
    }
  } else {
    editor.setTextBulletNumbersMulti(props.textShapes, icon);
  }
}

const onSelectText = (icon: TextBehaviour) => {
  selectText.value = icon;
  const editor = props.context.editor4TextShape(props.textShape)
  if (length.value) {
    editor.setTextBehaviour(icon)
  } else {
    editor.setTextBehaviourMulti(props.textShapes, icon);
  }
}
const onSelectCase = (icon: TextTransformType) => {
  selectCase.value = icon;
  const editor = props.context.editor4TextShape(props.textShape)
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    if (isSelectText()) {
      editor.setTextTransform(icon, 0, Infinity)
    } else {
      editor.setTextTransform(icon, textIndex, selectLength)
    }
    props.context.workspace.focusText()
  } else {
    editor.setTextTransformMulti(props.textShapes, icon);
  }
}

const setRowHeight = () => {
  const editor = props.context.editor4TextShape(props.textShape)
  rowHeight.value = rowHeight.value.trim()
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
}

const setWordSpace = () => {
  const editor = props.context.editor4TextShape(props.textShape)
  wordSpace.value = wordSpace.value.trim()
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
}

const setParagraphSpace = () => {
  const editor = props.context.editor4TextShape(props.textShape)
  paragraphSpace.value = paragraphSpace.value.trim()
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    if (!isNaN(Number(paragraphSpace.value))) {
      if (isSelectText()) {
        editor.setParaSpacing(Number(paragraphSpace.value), 0, Infinity)
      } else {
        editor.setParaSpacing(Number(paragraphSpace.value), textIndex, selectLength)
      }
    } else {
      textFormat()
    }
  } else {
    if (!isNaN(Number(paragraphSpace.value))) {
      editor.setParaSpacingMulit(props.textShapes, Number(paragraphSpace.value));
    } else {
      textFormat()
    }
  }
}

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
  const selection = props.context.textSelection;
  if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
    return false
  } else {
    return true
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
  if (!props.textShape || !props.textShape.text) return
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    const editor = props.context.editor4TextShape(props.textShape)
    let format: AttrGetter
    if (textIndex === -1) {
      format = props.textShape.text.getTextFormat(0, Infinity, editor.getCachedSpanAttr())
    } else {
      format = props.textShape.text.getTextFormat(textIndex, selectLength, editor.getCachedSpanAttr())
    }
    wordSpace.value = format.kerning || 0
    selectText.value = format.textBehaviour || 'flexible'
    rowHeight.value = format.minimumLineHeight || ''
    paragraphSpace.value = format.paraSpacing || 0
    selectCase.value = format.transform
    selectId.value = format.bulletNumbers?.type || ''
    if (format.minimumLineHeightIsMulti) rowHeight.value = `${t('attr.more_value')}`
    if (format.kerningIsMulti) wordSpace.value = `${t('attr.more_value')}`
    if (format.paraSpacingIsMulti) paragraphSpace.value = `${t('attr.more_value')}`
    if (format.transformIsMulti) selectCase.value = ''
  } else {
    let formats: any[] = [];
    let format: any = {};
    for (let i = 0; i < props.textShapes.length; i++) {
      const text = props.textShapes[i];
      const editor = props.context.editor4TextShape(text);
      const format = text.text.getTextFormat(0, Infinity, editor.getCachedSpanAttr());
      formats.push(format)
    }
    const referenceKeys = Object.keys(formats[0]);
    for (const key of referenceKeys) {
      const referenceValue = formats[0][key];
      let foundEqual = true;
      for (let i = 1; i < formats.length; i++) {
        if (key === 'bulletNumbers' && formats[i][key] && referenceValue) {
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
      if (foundEqual) {
        format[key] = referenceValue;
      } else {
        format[key] = `unlikeness`;
      }
    }
    wordSpace.value = format.kerning || 0;
    rowHeight.value = format.minimumLineHeight || ''
    paragraphSpace.value = format.paraSpacing || 0;
    selectCase.value = format.transform;
    selectText.value = format.textBehaviour;
    selectId.value = format.bulletNumbers?.type || '';
    if (format.minimumLineHeight === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
    if (format.minimumLineHeightIsMulti === 'unlikeness') rowHeight.value = `${t('attr.more_value')}`;
    if (format.kerningIsMulti === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
    if (format.kerning === 'unlikeness') wordSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacingIsMulti === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacing === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.transformIsMulti === 'unlikeness') selectCase.value = '';
    if (format.transform === 'unlikeness') selectCase.value = '';
    if (format.textBehaviour === 'unlikeness') selectText.value = '';
  }
}
function selection_wather(t: any) {
  if (t === Selection.CHANGE_TEXT) {
    textFormat()
  }
  if (t === Selection.CHANGE_SHAPE) {
    textFormat()
  }
}

watchEffect(() => {
  textFormat()
})

onMounted(() => {
  props.textShape.watch(textFormat)
  props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
  props.context.selection.unwatch(selection_wather);
  props.textShape.unwatch(textFormat)
  shapeWatch()
})
</script>

<template>
  <div class="text-detail-container">
    <Popover :context="props.context" class="popover" ref="popover" :width="220" height="auto" :left="440"
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
            <span>{{ t('attr.id_style') }}</span>
            <div class="vertical-aligning jointly-text">
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectId === 'none' }"
                @click="onSelectId(BulletNumbersType.None)">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectId === 'disorded' }"
                @click="onSelectId(BulletNumbersType.Disorded)">
                <Tooltip :content="t('attr.unordered_list')" :offset="15">
                  <svg-icon icon-class="text-bulleted-list"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectId === 'ordered-1ai' }"
                @click="onSelectId(BulletNumbersType.Ordered1Ai)">
                <Tooltip :content="t('attr.ordered_list')" :offset="15">
                  <svg-icon icon-class="text-number-list"></svg-icon>
                </Tooltip>
              </i>
            </div>
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
          <div>
            <span>{{ t('attr.text_style') }}</span>
            <div class="vertical-aligning jointly-text">
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectText === 'flexible' }"
                @click="onSelectText(TextBehaviour.Flexible)">
                <Tooltip :content="t('attr.autowidth')" :offset="15">
                  <svg-icon icon-class="text-autowidth"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectText === 'fixed' }"
                @click="onSelectText(TextBehaviour.Fixed)">
                <Tooltip :content="t('attr.autoheight')" :offset="15">
                  <svg-icon icon-class="text-autoheight"></svg-icon>
                </Tooltip>
              </i>
              <i class="jointly-text font-posi" :class="{ selected_bgc: selectText === 'fixWidthAndHeight' }"
                @click="onSelectText(TextBehaviour.FixWidthAndHeight)">
                <Tooltip :content="t('attr.fixedsize')" :offset="15">
                  <svg-icon icon-class="text-fixedsize"></svg-icon>
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
    width: 16px;
    height: 16px;

    .trigger {
      width: 16px;
      height: 16px;
      display: flex;
      justify-content: center;
      align-items: center;

      >svg {
        width: 16px;
        height: 16px;
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
          font-size: var(--font-default-fontsize);
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