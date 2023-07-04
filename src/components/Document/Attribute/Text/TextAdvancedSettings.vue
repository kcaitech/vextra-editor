<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
const { t } = useI18n();
interface Props {
  context: Context
}
const popover = ref();
const props = defineProps<Props>();
const selectVertical = ref('')
const selectLevel = ref('left')
function showMenu() {
  props.context.workspace.popoverVisible(false);
  popover.value.show();
}

const onSelectVertical = (icon: string) => {
    selectVertical.value = icon
}
const onSelectLevel = (icon: string) => {
    selectLevel.value = icon
}
</script>

<template>
    <div class="text-detail-container">
      <Popover :context="props.context" class="popover" ref="popover" :width="220" height="auto" :left="-435"
        :title="'文本高级设置'">
        <template #trigger>
          <div class="trigger">
            <svg-icon icon-class="gear" @click="showMenu"></svg-icon>
          </div>
        </template>
        <template #body>
          <div class="options-container">
            <div>
                <span>字间距</span>
                <div><input type="text" class="input"></div>
            </div>
            <div>
                <span>行高</span>
                <div><input type="text" class="input"></div>
            </div>
            <div>
                <span>段落间距</span>
                <div><input type="text" class="input"></div>
            </div>
            <div>
                <span>编号样式</span>
                <div class="vertical-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'top'}" @click="onSelectVertical('top')"><svg-icon icon-class="text-no-list"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'middle'}" @click="onSelectVertical('middle')"><svg-icon icon-class="text-bulleted-list"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'bottom'}" @click="onSelectVertical('bottom')"><svg-icon icon-class="text-number-list"></svg-icon></i>
                </div>
            </div>
            <div>
                <span>字母大小写</span>
                <div class="level-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'left'}" @click="onSelectLevel('left')"><svg-icon icon-class="text-no-list"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'center'}" @click="onSelectLevel('center')"><svg-icon icon-class="text-center"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'right'}" @click="onSelectLevel('right')"><svg-icon icon-class="text-right"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectLevel === 'justify'}" @click="onSelectLevel('justify')"><svg-icon icon-class="text-justify"></svg-icon></i>
                </div>
            </div>
            <div>
                <span>文本样式</span>
                <div class="vertical-aligning jointly-text">
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'top'}" @click="onSelectVertical('top')"><svg-icon icon-class="align-top"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'middle'}" @click="onSelectVertical('middle')"><svg-icon icon-class="align-middle"></svg-icon></i>
                    <i class="jointly-text font-posi" :class="{selected_bgc: selectVertical === 'bottom'}" @click="onSelectVertical('bottom')"><svg-icon icon-class="align-bottom"></svg-icon></i>
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
                width: 12px;
                height: 12px;
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
</style>