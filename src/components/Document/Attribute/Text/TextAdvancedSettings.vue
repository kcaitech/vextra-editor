<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n();
interface Props {
  context: Context
}
const popover = ref();
const props = defineProps<Props>();
const selectCase = ref('no-list')
const selectText = ref('autowidth')
const selectId = ref('no-list')
const wordSpace = ref('0%')
const rowHeight = ref(`${t('attr.auto')}`)
const paragraphSpace = ref('0')
function showMenu() {
  props.context.workspace.popoverVisible(false);
  popover.value.show();
}

const onSelectId = (icon: string) => {
  selectId.value = icon
}
const onSelectText = (icon: string) => {
  selectText.value = icon
}
const onSelectCase = (icon: string) => {
  selectCase.value = icon
}
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
                <div><input type="text" v-model="wordSpace" class="input"></div>
            </div>
            <div>
                <span>{{t('attr.row_height')}}</span>
                <div><input type="text" v-model="rowHeight" class="input"></div>
            </div>
            <div>
                <span>{{t('attr.paragraph_space')}}</span>
                <div><input type="text" v-model="paragraphSpace" class="input"></div>
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
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'autowidth'}" @click="onSelectText('autowidth')">
                      <Tooltip :content="t('attr.autowidth')" :offset="15">
                        <svg-icon icon-class="text-autowidth"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'autoheight'}" @click="onSelectText('autoheight')">
                      <Tooltip :content="t('attr.autoheight')" :offset="15">
                        <svg-icon icon-class="text-autoheight"></svg-icon>
                      </Tooltip>
                    </i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectText === 'fixedsize'}" @click="onSelectText('fixedsize')">
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