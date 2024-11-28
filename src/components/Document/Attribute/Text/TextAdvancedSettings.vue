<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextShape, TextTransformType, TextBehaviour, Shape, BulletNumbersType, TextShapeView, adapt2Shape, UnderlineType, StrikethroughType } from "@kcdesign/data";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { format_value } from "@/utils/common";
const { t } = useI18n();
interface Props {
  event?:string,
  context: Context,
  textShape: TextShapeView,
  textShapes: TextShapeView[]
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref()
const selectId = ref()
const paragraphSpace = ref()
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const paraSpacing = ref<HTMLInputElement>()
// const selection = ref(props.context.selection)
const isActived1 = ref(false)
const isActived2 = ref(false)
const isActived3 = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)

//获取选中字体的长度和下标
const getTextIndexAndLen = () => {
  const selection = props.context.selection.getTextSelection(props.textShape);
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
  textFormat()
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
  const textAttr = props.context.textSelection.getTextAttr;
  textAttr.transform = icon;
  props.context.textSelection.setTextAttr(textAttr);
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
  const textAttr = props.context.textSelection.getTextAttr;
  textAttr.paraSpacing = Number(paragraphSpace.value);
  props.context.textSelection.setTextAttr(textAttr);
}

//设置下划线
const onUnderlint = () => {
  isUnderline.value = !isUnderline.value;
  const editor = props.context.editor4TextShape(props.textShape)
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen()
    if (isSelectText()) {
      editor.setTextUnderline(isUnderline.value, 0, Infinity)
    } else {
      editor.setTextUnderline(isUnderline.value, textIndex, selectLength)
      textFormat()
    }
  } else {
    editor.setTextUnderlineMulti(props.textShapes, isUnderline.value);
  }
}
const onDeleteline = () => {
  isDeleteline.value = !isDeleteline.value;
  const editor = props.context.editor4TextShape(props.textShape)
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen()
    if (isSelectText()) {
      editor.setTextStrikethrough(isDeleteline.value, 0, Infinity)
    } else {
      editor.setTextStrikethrough(isDeleteline.value, textIndex, selectLength)
      textFormat()
    }
  } else {
    editor.setTextStrikethroughMulti(props.textShapes, isDeleteline.value);
  }
}

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
  const selection = props.context.selection.getTextSelection(props.textShape);
  if ((selection.cursorEnd !== -1) && (selection.cursorStart !== -1)) {
    return false
  } else {
    return true
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
    paragraphSpace.value = format_value(format.paraSpacing || 0);
    selectCase.value = format.transform
    isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;
    isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
    selectId.value = format.bulletNumbers?.type || 'none'
    if (format.strikethroughIsMulti) isDeleteline.value = false
    if (format.paraSpacingIsMulti) paragraphSpace.value = `${t('attr.more_value')}`
    if (format.transformIsMulti) selectCase.value = 'none'
    if (format.underlineIsMulti) isUnderline.value = false
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
          break;
        }
      }
      if (foundEqual) {
        format[key] = referenceValue;
      } else {
        format[key] = `unlikeness`;
      }
    }
    paragraphSpace.value = format_value(format.paraSpacing || 0) as number;
    selectCase.value = format.transform;
    isUnderline.value = format.underline && format.underline !== UnderlineType.None || false;
    isDeleteline.value = format.strikethrough && format.strikethrough !== StrikethroughType.None || false;
    selectId.value = format.bulletNumbers?.type || 'none';
    if (format.underline === 'unlikeness') isUnderline.value = false;
    if (format.strikethrough === 'unlikeness') isDeleteline.value = false;
    if (format.paraSpacingIsMulti === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.paraSpacing === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`;
    if (format.transformIsMulti === 'unlikeness') selectCase.value = 'none';
    if (format.transform === 'unlikeness') selectCase.value = 'none';
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

function workspace_wather(t: number) {
  if (t === WorkSpace.UNDER_LINE) {
    onUnderlint()
  } else if (t === WorkSpace.DELETE_LINE) {
    onDeleteline()
  } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
    textFormat()
  }
}

function blur2() {
  isActived1.value = false
  isActived2.value = false
  isActived3.value = false
  is_select.value = false;
}

watchEffect(() => {
  textFormat()
})

onMounted(() => {
  props.context.workspace.watch(workspace_wather);
  props.textShape.watch(textFormat)
  props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
  props.context.workspace.unwatch(workspace_wather);
  props.context.selection.unwatch(selection_wather);
  props.textShape.unwatch(textFormat)
  shapeWatch()
})
</script>

<template>
  <div class="text-detail-container">
    <Popover :context="props.context" :event="props.event" class="popover" ref="popover" :width="254" :auto_to_right_line="true"
      :title="t('attr.text_advanced_settings')">
      <template #trigger>
        <div class="trigger" @click="showMenu">
          <Tooltip :content="t('attr.text_advanced_settings')" :offset="15">
            <svg-icon icon-class="gear"></svg-icon>
          </Tooltip>
        </div>
      </template>
      <template #body>
        <div class="options-container">
          <div v-if="!props.event?.includes('text')">
            <span>{{ t('attr.paragraph_space') }}</span>
            <div :class="{ actived: isActived3 }"
              style="width: 98px;height: 32px;border-radius: 6px;box-sizing: border-box">
                <input type="text" ref="paraSpacing" @focus="selectParaSpacing" @blur="blur2" v-model="paragraphSpace"
                class="input" @change="setParagraphSpace" style="width: 100%;height: 100%" @click="click">
            </div>
          </div>
          <div v-if="!props.event?.includes('text')">
            <span>{{ t('attr.id_style') }}</span>
            <div class="vertical-aligning jointly-text">
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'none' }"
                @click="onSelectId(BulletNumbersType.None)">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'disorded' }"
                @click="onSelectId(BulletNumbersType.Disorded)">
                <Tooltip :content="t('attr.unordered_list')" :offset="15">
                  <svg-icon icon-class="text-bulleted-list"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'ordered-1ai' }"
                @click="onSelectId(BulletNumbersType.Ordered1Ai)">
                <Tooltip :content="t('attr.ordered_list')" :offset="15">
                  <svg-icon icon-class="text-number-list"></svg-icon>
                </Tooltip>
              </i>
            </div>
          </div>
          <div>
            <span>{{ t('attr.underline') }}</span>
            <div class="underline jointly-text">
              <i :class="{ 'jointly-text': true, selected_bg: !isUnderline }" @click="onUnderlint">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, selected_bg: isUnderline }" @click="onUnderlint">
                <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl U`" :offset="15">
                  <svg-icon icon-class="text-underline"></svg-icon>
                </Tooltip>
              </i>
            </div>
          </div>
          <div>
            <span>{{ t('attr.deleteline') }}</span>
            <div class="underline jointly-text">
              <i :class="{ 'jointly-text': true, selected_bg: !isDeleteline }" @click="onDeleteline">
                <Tooltip :content="t('attr.none_list')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, selected_bg: isDeleteline }" @click="onDeleteline">
                <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl Shift X`" :offset="15">
                  <svg-icon icon-class="text-deleteline"></svg-icon>
                </Tooltip>
              </i>
            </div>
          </div>
          <div>
            <span>{{ t('attr.letter_case') }}</span>
            <div class="level-aligning jointly-text">
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'none' }"
                @click="onSelectCase(TextTransformType.None)">
                <Tooltip :content="t('attr.as_typed')" :offset="15">
                  <svg-icon icon-class="text-no-list"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'uppercase' }"
                @click="onSelectCase(TextTransformType.Uppercase)">
                <Tooltip :content="t('attr.uppercase')" :offset="15">
                  <svg-icon icon-class="text-uppercase" style="width: 17px;height: 14px"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'lowercase' }"
                @click="onSelectCase(TextTransformType.Lowercase)">
                <Tooltip :content="t('attr.lowercase')" :offset="15">
                  <svg-icon icon-class="text-lowercase" style="width: 14px;height: 14px"></svg-icon>
                </Tooltip>
              </i>
              <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'uppercase-first' }"
                @click="onSelectCase(TextTransformType.UppercaseFirst)">
                <Tooltip :content="t('attr.titlecase')" :offset="15">
                  <svg-icon icon-class="text-titlecase" style="width: 15px;height: 14px"></svg-icon>
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


    .trigger {
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
   
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
          width: 60px;
          height: 14px;
          font-size: var(--font-default-fontsize);
          color: #737373;
        }

        .vertical-aligning {
          padding: 2px;
          box-sizing: border-box;
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

        .level-aligning {
          padding: 2px;
          box-sizing: border-box;
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

  .selected_bgc {
    background-color: #FFFFFF !important;
    color: #000000;
  }

}

:deep(.el-tooltip__trigger:focus) {
  outline: none !important;
}
</style>