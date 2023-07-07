<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextShape } from "@kcdesign/data";
import { TextBehaviour, Shape } from "@kcdesign/data";
import { Selection } from '@/context/selection';
const { t } = useI18n();
interface Props {
  context: Context,
  textShape: Shape[]
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref('no-list')
const selectText = ref('autowidth')
const selectId = ref('no-list')
const wordSpace = ref()
const rowHeight = ref()
const row_height = ref(`${t('attr.auto')}`)
const paragraphSpace = ref()
const minimumLineHeightIsMulti = ref(false)
const maximumLineHeightIsMulti = ref(false)
const paraSpacingIsMulti = ref(false)
const kerningIsMulti = ref(false)
const selection = computed(() => props.context.selection)

//获取选中字体的长度和下标
const getTextIndexAndLen = () => {
    const textIndex = Math.min(selection.value.cursorEnd, selection.value.cursorStart)
    const selectLength = Math.abs(selection.value.cursorEnd - selection.value.cursorStart)
    return { textIndex, selectLength }
}

function showMenu() {
  props.context.workspace.popoverVisible(false);
  popover.value.show();
}

const onSelectId = (icon: string) => {
  selectId.value = icon
}

const onSelectText = (icon: TextBehaviour) => {
  selectText.value = icon
  const editor = computed(() => {
      return props.context.editor4TextShape((props.textShape[0] as TextShape))
  });
  editor.value.setTextBehaviour(icon)
}
const onSelectCase = (icon: string) => {
  selectCase.value = icon
}

const setRowHeight = () => {
  const { textIndex, selectLength } = getTextIndexAndLen();
  const editor = computed(() => {
      return props.context.editor4TextShape((props.textShape[0] as TextShape))
  });
  rowHeight.value = rowHeight.value.trim()
  if (rowHeight.value.length < 1) {
    rowHeight.value = 1
  }
  if (!isNaN(Number(rowHeight.value))) {
    if(isSelectText()) {
      editor.value.setMinLineHeight(Number(rowHeight.value), textIndex, selectLength)
      editor.value.setMaxLineHeight(Number(rowHeight.value), textIndex, selectLength)
    }else {
      if(selectLength === 0) {
        editor.value.setDefaultMaxLineHeight(Number(rowHeight.value))
        editor.value.setTextDefaultMinLineHeight(Number(rowHeight.value))
      }else {
        editor.value.setMinLineHeight(Number(rowHeight.value), textIndex, selectLength)
        editor.value.setMaxLineHeight(Number(rowHeight.value), textIndex, selectLength)
      }
    }
  }else {
      textFormat()
  }
}

const setWordSpace = () => {
  const { textIndex, selectLength } = getTextIndexAndLen();
  const editor = computed(() => {
      return props.context.editor4TextShape((props.textShape[0] as TextShape))
  });
  wordSpace.value = wordSpace.value.trim()
  if (wordSpace.value.slice(-1) === '%') {
      wordSpace.value = Number(wordSpace.value.slice(0, -1))
  }
  if (!isNaN(Number(wordSpace.value))) {
    if(isSelectText()) {
      editor.value.setCharSpacing(Number(wordSpace.value / 100), 0, Infinity)
      wordSpace.value = wordSpace.value + '%'
    }else {
      if(selectLength === 0) {
        editor.value.setDefaultCharSpacing(Number(wordSpace.value))
      }else {
        editor.value.setCharSpacing(Number(wordSpace.value /100), textIndex, selectLength)
      }
      wordSpace.value = wordSpace.value + '%'
    }
  }else {
      textFormat()
  }
}

const setParagraphSpace = () => {
  const { textIndex, selectLength } = getTextIndexAndLen();
  const editor = computed(() => {
      return props.context.editor4TextShape((props.textShape[0] as TextShape))
  });
  paragraphSpace.value = paragraphSpace.value.trim()
  if (!isNaN(Number(paragraphSpace.value))) {
    if(isSelectText()) {
      editor.value.setParaSpacing(Number(paragraphSpace.value), 0, Infinity)
    }else {
      if(selectLength === 0) {
        editor.value.setDefaultParaSpacing(Number(paragraphSpace.value))
      }else {
        editor.value.setParaSpacing(Number(paragraphSpace.value), textIndex, selectLength)
      }
    }
  }else {
      textFormat()
  }
}

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
    if((selection.value.cursorEnd !== -1) && (selection.value.cursorStart !== -1)) {
        return false
    }else {
        return true
    }
}

const textFormat = () => {
    if(!(props.textShape[0] as TextShape) || !(props.textShape[0] as TextShape).text) return
    const { textIndex, selectLength } = getTextIndexAndLen();
    let format: AttrGetter
    if(textIndex !== -1 && textIndex !== 0 && selectLength === 0) {
        format = (props.textShape[0] as TextShape).text.getTextFormat(textIndex - 1, selectLength + 1)
    }else if (textIndex !== -1 && textIndex === 0 && selectLength === 0) {
        format = (props.textShape[0] as TextShape).text.getTextFormat(textIndex, selectLength + 1)
    }else if (textIndex === -1) {
        format = (props.textShape[0] as TextShape).text.getTextFormat(0, Infinity)
    }else {
        format = (props.textShape[0] as TextShape).text.getTextFormat(textIndex, selectLength)
    }
    minimumLineHeightIsMulti.value = format.minimumLineHeightIsMulti
    maximumLineHeightIsMulti.value = format.maximumLineHeightIsMulti
    kerningIsMulti.value = format.kerningIsMulti
    paraSpacingIsMulti.value = format.paraSpacingIsMulti
    wordSpace.value = format.kerning || 0
    selectText.value = format.textBehaviour || 'flexible'
    rowHeight.value = format.minimumLineHeight || ''
    paragraphSpace.value = format.paraSpacing || 0
    if(minimumLineHeightIsMulti.value) rowHeight.value = '多值'
    if(kerningIsMulti.value) wordSpace.value = '多值'
    if(paraSpacingIsMulti.value) paragraphSpace.value = '多值'
    wordSpace.value = wordSpace.value + '%'
}
function selection_wather(t: any) {
    if(t === Selection.CHANGE_TEXT) {
        textFormat()
    }
    if(t === Selection.CHANGE_SHAPE) {
        textFormat()
    }
}
const textDefaultFormat = () => {
    const defaultFormat = (props.textShape[0] as TextShape).text.getDefaultTextFormat()
}
onMounted(() => {
    textFormat()
    textDefaultFormat()
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})
</script>

<template>
    <div class="text-detail-container">
      <Popover :context="props.context" class="popover" ref="popover" :width="220" height="auto" :left="-435"
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
                <span>{{t('attr.word_space')}}</span>
                <div><input type="text" v-model="wordSpace" class="input" @change="setWordSpace"></div>
            </div>
            <div>
                <span>{{t('attr.row_height')}}</span>
                <div><input type="text" v-model="rowHeight" :placeholder="row_height" class="input" @change="setRowHeight"></div>
            </div>
            <div>
                <span>{{t('attr.paragraph_space')}}</span>
                <div><input type="text" v-model="paragraphSpace" class="input" @change="setParagraphSpace"></div>
            </div>
            <div>
                <span>{{t('attr.id_style')}}</span>
                <div class="vertical-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectId === 'no-list'}" @click="onSelectId('no-list')">
                      <Tooltip :content="t('attr.none_list')" :offset="15">
                        <svg-icon icon-class="text-no-list"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectId === 'bulleted-list'}" @click="onSelectId('bulleted-list')">
                      <Tooltip :content="t('attr.unordered_list')" :offset="15">
                        <svg-icon icon-class="text-bulleted-list"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectId === 'number-list'}" @click="onSelectId('number-list')">
                      <Tooltip :content="t('attr.ordered_list')" :offset="15">
                        <svg-icon icon-class="text-number-list"></svg-icon>
                      </Tooltip>
                    </i>
                </div>
            </div>
            <div>
                <span>{{t('attr.letter_case')}}</span>
                <div class="level-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectCase === 'no-list'}" @click="onSelectCase('no-list')">
                      <Tooltip :content="t('attr.as_typed')" :offset="15">
                        <svg-icon icon-class="text-no-list"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectCase === 'uppercase'}" @click="onSelectCase('uppercase')">
                      <Tooltip :content="t('attr.uppercase')" :offset="15">
                        <svg-icon icon-class="text-uppercase"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectCase === 'lowercase'}" @click="onSelectCase('lowercase')">
                      <Tooltip :content="t('attr.lowercase')" :offset="15">
                        <svg-icon icon-class="text-lowercase"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectCase === 'titlecase'}" @click="onSelectCase('titlecase')">
                      <Tooltip :content="t('attr.titlecase')" :offset="15">
                        <svg-icon icon-class="text-titlecase"></svg-icon>
                      </Tooltip>
                    </i>
                </div>
            </div>
            <div>
                <span>{{t('attr.text_style')}}</span>
                <div class="vertical-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'flexible'}" @click="onSelectText(TextBehaviour.Flexible)">
                      <Tooltip :content="t('attr.autowidth')" :offset="15">
                        <svg-icon icon-class="text-autowidth"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'fixed'}" @click="onSelectText(TextBehaviour.Fixed)">
                      <Tooltip :content="t('attr.autoheight')" :offset="15">
                        <svg-icon icon-class="text-autoheight"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'fixWidthAndHeight'}" @click="onSelectText(TextBehaviour.FixWidthAndHeight)">
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
        background-color: var(--left-navi-button-select-color) !important;
    }
   
}
:deep(.el-tooltip__trigger:focus) {
  outline: none !important;
}

</style>