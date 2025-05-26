/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/*
* Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
*
* This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
* The full license text can be found in the LICENSE file in the root directory of this source tree.
*
* For more information about the AGPL-3.0 license, please visit:
* https://www.gnu.org/licenses/agpl-3.0.html
*/

<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, onUnmounted, watch, watchEffect, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { AttrGetter, TextShape, TextTransformType, TextBehaviour, Shape, BulletNumbersType, TextShapeView, adapt2Shape, UnderlineType, StrikethroughType, TextAttr, TextMask } from "@kcdesign/data";
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { format_value } from "@/utils/common";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import { TextContext, TextContextMgr } from "./ctx";
const { t } = useI18n();
interface Props {
  context: Context,
  manager: TextContextMgr
  textShape?: TextShapeView
  textShapes?: TextShapeView[]
  data?: AttrGetter | TextMask;
}

const emits = defineEmits<{
  (e: 'underline', type: UnderlineType | undefined): void;
  (e: 'strikethrough', type: StrikethroughType | undefined): void;
  (e: 'transform', type: TextTransformType | undefined): void;
}>();

const popover = ref();
const props = defineProps<Props>();
const selectCase = ref()
const selectId = ref('')
const paragraphSpace = ref<number | string>(props.manager.textCtx.text?.paraSpacing || 0)
const charSpacing = ref<HTMLInputElement>()
const lineHeight = ref<HTMLInputElement>()
const paraSpacing = ref<HTMLInputElement>()
// const selection = ref(props.context.selection)
const isActived1 = ref(false)
const isActived2 = ref(false)
const isActived3 = ref(false)
const isUnderline = ref(false)
const isDeleteline = ref(false)
const isMask = computed(() => {
  return props.data instanceof TextMask
})
const panelStatus = reactive<ElementStatus>({ id: '#text-detail-container', visible: false });
const panelStatusMgr = new ElementManager(
  props.context,
  panelStatus,
  { whiteList: ['#text-detail-container', '.header', '.title'] }
);

function showDetailPanel(event: MouseEvent) {
  let e: Element | null = event.target as Element;
  while (e) {
    if (e.classList.contains('header')) {
      e && panelStatusMgr.showBy(e, { once: { offsetLeft: -266 } });
      break;
    }
    if (e.classList.contains('title')) {
      e && panelStatusMgr.showBy(e, { once: { offsetLeft: -258 } });
      break;
    }
    e = e.parentElement;
  }
}

//获取选中字体的长度和下标
const getTextIndexAndLen = () => {
  const selection = props.context.selection.textSelection;
  const textIndex = Math.min(selection.cursorEnd, selection.cursorStart)
  const selectLength = Math.abs(selection.cursorEnd - selection.cursorStart)
  return { textIndex, selectLength }
}

function showMenu() {
  popover.value.show();
  props.context.workspace.focusText()
}
const length = computed(() => {
  return props.textShapes?.length === 1;
})

const onSelectId = (icon: BulletNumbersType) => {
  selectId.value = icon;
  const editor = props.context.editor4TextShape(props.textShape!)
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    if (isSelectText()) {
      editor.setTextBulletNumbers(icon, 0, Infinity)
    } else {
      editor.setTextBulletNumbers(icon, textIndex, selectLength)
    }
  } else {
    editor.setTextBulletNumbersMulti(props.textShapes!, icon);
  }
  // textFormat()
}

const onSelectCase = (icon: TextTransformType) => {
  selectCase.value = icon;
  if (isMask.value) {
    emits('transform', icon)
  } else {
    const editor = props.context.editor4TextShape(props.textShape!)
    if (length.value) {
      const { textIndex, selectLength } = getTextIndexAndLen();
      if (isSelectText()) {
        editor.setTextTransform(icon, 0, Infinity)
      } else {
        editor.setTextTransform(icon, textIndex, selectLength)
      }
    } else {
      editor.setTextTransformMulti(props.textShapes!, icon);
    }
  }
  // const textAttr = props.context.textSelection.getTextAttr;
  // textAttr.transform = icon;
  // props.context.textSelection.setTextAttr(textAttr);
}


const setParagraphSpace = () => {
  const editor = props.context.editor4TextShape(props.textShape!)
  if (isNaN(Number(paragraphSpace.value))) return init();
  if (length.value) {
    const { textIndex, selectLength } = getTextIndexAndLen();
    if (isSelectText()) {
      editor.setParaSpacing(Number(paragraphSpace.value), 0, Infinity)
    } else {
      editor.setParaSpacing(Number(paragraphSpace.value), textIndex, selectLength)
    }
  } else {
    editor.setParaSpacingMulit(props.textShapes!, Number(paragraphSpace.value));
  }
  const textAttr = props.context.textSelection.getTextAttr;
  textAttr.paraSpacing = Number(paragraphSpace.value);
  props.context.textSelection.setTextAttr(textAttr);
}

//设置下划线
const onUnderlint = () => {
  isUnderline.value = !isUnderline.value;
  if (isMask.value) {
    emits('underline', isUnderline.value ? UnderlineType.Single : undefined)
  } else {
    const editor = props.context.editor4TextShape(props.textShape!)
    if (length.value) {
      const { textIndex, selectLength } = getTextIndexAndLen()
      if (isSelectText()) {
        editor.setTextUnderline(isUnderline.value, 0, Infinity)
      } else {
        editor.setTextUnderline(isUnderline.value, textIndex, selectLength)
        // textFormat()
      }
    } else {
      editor.setTextUnderlineMulti(props.textShapes!, isUnderline.value);
    }
  }
}
const onDeleteline = () => {
  isDeleteline.value = !isDeleteline.value;
  if (isMask.value) {
    emits('strikethrough', isDeleteline.value ? StrikethroughType.Single : undefined)
  } else {
    const editor = props.context.editor4TextShape(props.textShape!)
    if (length.value) {
      const { textIndex, selectLength } = getTextIndexAndLen()
      if (isSelectText()) {
        editor.setTextStrikethrough(isDeleteline.value, 0, Infinity)
      } else {
        editor.setTextStrikethrough(isDeleteline.value, textIndex, selectLength)
        // textFormat()
      }
    } else {
      editor.setTextStrikethroughMulti(props.textShapes!, isDeleteline.value);
    }
  }
}

//判断是否选择文本框还是光标聚焦了
const isSelectText = () => {
  const selection = props.context.selection.textSelection;
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
  old!.unwatch(init);
  value!.watch(init);
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
    for (let i = 0; i < props.textShapes!.length; i++) {
      const text = props.textShapes![i];
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

function init() {
  if (props.data instanceof TextMask) {
    paragraphSpace.value = format_value(props.data?.text.paraSpacing || 0) as number;
    selectCase.value = props.data?.text.transform
    isUnderline.value = props.data?.text.underline && props.data?.text.underline !== UnderlineType.None || false;
    isDeleteline.value = props.data?.text.strikethrough && props.data?.text.strikethrough !== StrikethroughType.None || false;
    selectId.value = props.data?.text.bulletNumbers?.type ?? 'none'
  } else {
    paragraphSpace.value = format_value(props.data?.paraSpacing || 0) as number;
    selectCase.value = props.data?.transform
    isUnderline.value = props.data?.underline && props.data?.underline !== UnderlineType.None || false;
    isDeleteline.value = props.data?.strikethrough && props.data?.strikethrough !== StrikethroughType.None || false;
    selectId.value = props.data?.bulletNumbers?.type ?? 'none'
    if (props.data?.strikethroughIsMulti) isDeleteline.value = false
    if (props.data?.paraSpacingIsMulti || props.data?.paraSpacing?.toString() === 'unlikeness') paragraphSpace.value = `${t('attr.more_value')}`
    if (props.data?.underlineIsMulti) isUnderline.value = false
    if (props.data?.transformIsMulti) selectCase.value = 'none'
  }

}

function selection_watcher(t: any) {
  if (t === Selection.CHANGE_TEXT) {
    init()
  }
  if (t === Selection.CHANGE_SHAPE) {
    init()
  }
}

function workspace_watcher(t: number) {
  if (t === WorkSpace.UNDER_LINE) {
    onUnderlint()
  } else if (t === WorkSpace.DELETE_LINE) {
    onDeleteline()
  } else if (t === WorkSpace.SELECTION_VIEW_UPDATE) {
    init()
  }
}

function blur2() {
  isActived1.value = false
  isActived2.value = false
  isActived3.value = false
  is_select.value = false;
}

watchEffect(() => {
  init()
})

onMounted(() => {
  props.context.workspace.watch(workspace_watcher);
  // props.textShape.watch(init)
  props.context.selection.watch(selection_watcher);
  if(props.data instanceof TextMask) {
    props.data.watch(init);
  }
})
onUnmounted(() => {
  props.context.workspace.unwatch(workspace_watcher);
  props.context.selection.unwatch(selection_watcher);
  // props.textShape.unwatch(init)
  shapeWatch()
  if(props.data instanceof TextMask) {
    props.data.unwatch(init);
  }

})

import SvgIcon from '@/components/common/SvgIcon.vue';
import gear_icon from '@/assets/icons/svg/gear.svg';
import text_no_list_icon from '@/assets/icons/svg/text-no-list.svg';
import text_bulleted_list_icon from '@/assets/icons/svg/text-bulleted-list.svg';
import text_number_list_icon from '@/assets/icons/svg/text-number-list.svg';
import text_underline_icon from '@/assets/icons/svg/text-underline.svg';
import text_deleteline_icon from '@/assets/icons/svg/text-deleteline.svg';
import text_uppercase_icon from '@/assets/icons/svg/text-uppercase.svg';
import text_lowercase_icon from '@/assets/icons/svg/text-lowercase.svg';
import text_titlecase_icon from '@/assets/icons/svg/text-titlecase.svg';
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';

</script>

<template>
  <div class="text-trigger" :class="{ 'active': panelStatus.visible }" @click="showDetailPanel">
    <Tooltip :content="t('attr.text_advanced_settings')" :offset="15">
      <SvgIcon :icon="gear_icon" />
    </Tooltip>
  </div>
  <div v-if="panelStatus.visible" id="text-detail-container">
    <PopoverHeader :title="t('attr.text_advanced_settings')" :create="false" @close="panelStatusMgr.close()" />
    <div class="options-container">
      <div v-if="!(data instanceof TextMask)">
        <span>{{ t('attr.paragraph_space') }}</span>
        <div :class="{ actived: isActived3 }"
          style="width: 98px;height: 32px;border-radius: 6px;box-sizing: border-box">
          <input v-blur type="text" ref="paraSpacing" @focus="selectParaSpacing" @blur="blur2" v-model="paragraphSpace"
            class="input" @change="setParagraphSpace" style="width: 100%;height: 100%" @click="click">
        </div>
      </div>
      <div v-if="!(data instanceof TextMask)">
        <span>{{ t('attr.id_style') }}</span>
        <div class="vertical-aligning jointly-text">
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'none' }"
            @click="onSelectId(BulletNumbersType.None)">
            <Tooltip :content="t('attr.none_list')" :offset="15">
              <SvgIcon :icon="text_no_list_icon" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'disorded' }"
            @click="onSelectId(BulletNumbersType.Disorded)">
            <Tooltip :content="t('attr.unordered_list')" :offset="15">
              <SvgIcon :icon="text_bulleted_list_icon" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectId === 'ordered-1ai' }"
            @click="onSelectId(BulletNumbersType.Ordered1Ai)">
            <Tooltip :content="t('attr.ordered_list')" :offset="15">
              <SvgIcon :icon="text_number_list_icon" />
            </Tooltip>
          </i>
        </div>
      </div>
      <div v-if="(!manager.textCtx.mask && !manager.textCtx.mixed) || (data instanceof TextMask)">
        <span>{{ t('attr.underline') }}</span>
        <div class="underline jointly-text">
          <i :class="{ 'jointly-text': true, selected_bg: !isUnderline }" @click="onUnderlint">
            <Tooltip :content="t('attr.none_list')" :offset="15">
              <SvgIcon :icon="text_no_list_icon" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, selected_bg: isUnderline }" @click="onUnderlint">
            <Tooltip :content="`${t('attr.underline')} &nbsp;&nbsp; Ctrl U`" :offset="15">
              <SvgIcon :icon="text_underline_icon" />
            </Tooltip>
          </i>
        </div>
      </div>
      <div v-if="(!manager.textCtx.mask && !manager.textCtx.mixed) || (data instanceof TextMask)">
        <span>{{ t('attr.deleteline') }}</span>
        <div class="underline jointly-text">
          <i :class="{ 'jointly-text': true, selected_bg: !isDeleteline }" @click="onDeleteline">
            <Tooltip :content="t('attr.none_list')" :offset="15">
              <SvgIcon :icon="text_no_list_icon" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, selected_bg: isDeleteline }" @click="onDeleteline">
            <Tooltip :content="`${t('attr.deleteline')} &nbsp;&nbsp; Ctrl Shift X`" :offset="15">
              <SvgIcon :icon="text_deleteline_icon" />
            </Tooltip>
          </i>
        </div>
      </div>
      <div v-if="(!manager.textCtx.mask && !manager.textCtx.mixed) || (data instanceof TextMask)">
        <span>{{ t('attr.letter_case') }}</span>
        <div class="level-aligning jointly-text">
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'none' }"
            @click="onSelectCase(TextTransformType.None)">
            <Tooltip :content="t('attr.as_typed')" :offset="15">
              <SvgIcon :icon="text_no_list_icon" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'uppercase' }"
            @click="onSelectCase(TextTransformType.Uppercase)">
            <Tooltip :content="t('attr.uppercase')" :offset="15">
              <SvgIcon :icon="text_uppercase_icon" style="width: 17px;height: 14px" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'lowercase' }"
            @click="onSelectCase(TextTransformType.Lowercase)">
            <Tooltip :content="t('attr.lowercase')" :offset="15">
              <SvgIcon :icon="text_lowercase_icon" style="width: 14px;height: 14px" />
            </Tooltip>
          </i>
          <i :class="{ 'jointly-text': true, 'font-posi': true, selected_bg: selectCase === 'uppercase-first' }"
            @click="onSelectCase(TextTransformType.UppercaseFirst)">
            <Tooltip :content="t('attr.titlecase')" :offset="15">
              <SvgIcon :icon="text_titlecase_icon" style="width: 15px;height: 14px" />
            </Tooltip>
          </i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.active {
  background-color: #ebebeb !important;
}

.text-trigger {
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: var(--default-radius);

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: #F5F5F5;
  }
}


#text-detail-container {
  width: 254px;
  height: fit-content;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
  background-color: #FFFFFF;
  border-radius: 8px;
  box-sizing: border-box;
  z-index: 99;

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


  .selected_bgc {
    background-color: #FFFFFF !important;
    color: #000000;
  }

}

:deep(.el-tooltip__trigger:focus) {
  outline: none !important;
}
</style>